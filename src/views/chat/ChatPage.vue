<template>
  <div class="chat-page">
    <!-- 顶部导航 -->
    <div class="chat-header">
      <button class="back-btn" @click="$router.back()">
        <span class="back-arrow">‹</span>
      </button>
      <div class="header-info">
        <h1>{{ otherName }}</h1>
        <span class="online-status" :class="wsState">{{ wsState === 'connected' ? '在线' : '离线' }}</span>
      </div>
      <button class="header-btn" @click="showProfile = true"><User :size="18" /></button>
    </div>

    <!-- 消息列表 -->
    <div class="msg-list" ref="msgContainer" @scroll="handleScroll">
      <div v-if="hasMore" class="load-more" @click="loadMoreMessages">
        {{ loadingMore ? '加载中...' : '加载更多' }}
      </div>
      <div v-for="msg in msgList" :key="msg.id" class="msg-row" :class="{ 'msg-mine': isMine(msg) }">
        <UserAvatar
          v-if="!isMine(msg)"
          :src="otherUser?.avatarUrl"
          :name="otherUser?.nickname || '?'"
          :size="36"
          class="msg-avatar"
        />
        <div class="msg-content">
          <div class="msg-bubble" :class="getBubbleClass(msg)">
            <!-- 文本消息 -->
            <template v-if="msg.messageType === 'TEXT' || !msg.messageType">
              {{ msg.content }}
            </template>
            <!-- 图片消息 -->
            <template v-else-if="msg.messageType === 'IMAGE'">
              <img :src="msg.content" class="msg-image" @click="previewImage(msg.content)" />
            </template>
            <!-- 语音消息 -->
            <template v-else-if="msg.messageType === 'VOICE'">
              <div class="voice-msg" @click="playVoice(msg)">
                <span class="voice-icon"><Volume2 :size="20" /></span>
                <span class="voice-duration">{{ msg.duration || '1' }}"</span>
              </div>
            </template>
            <!-- 表情消息 -->
            <template v-else-if="msg.messageType === 'EMOJI'">
              <span class="emoji-msg">{{ msg.content }}</span>
            </template>
          </div>
          <div class="msg-time">{{ formatTime(msg.createdAt) }}</div>
        </div>
        <UserAvatar
          v-if="isMine(msg)"
          :src="auth.user?.avatarUrl"
          :name="auth.user?.nickname || '?'"
          :size="36"
          class="msg-avatar"
        />
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-area">
      <!-- 功能面板 -->
      <div v-if="showPanel" class="panel-overlay" @click="showPanel = false"></div>
      
      <!-- 表情面板 -->
      <div v-if="showEmoji" class="emoji-panel">
        <div class="emoji-grid">
          <span v-for="emoji in emojis" :key="emoji" class="emoji-item" @click="insertEmoji(emoji)">
            {{ emoji }}
          </span>
        </div>
      </div>

      <!-- 更多功能面板 -->
      <div v-if="showMore" class="more-panel">
        <div class="more-grid">
          <div class="more-item" @click="selectImage">
            <span class="more-icon"><Image :size="24" /></span>
            <span>图片</span>
          </div>
          <div class="more-item" @click="selectFile">
            <span class="more-icon"><FileText :size="24" /></span>
            <span>文件</span>
          </div>
          <div class="more-item" @click="startLocationShare">
            <span class="more-icon"><MapPin :size="24" /></span>
            <span>位置</span>
          </div>
        </div>
      </div>

      <div class="input-bar">
        <button class="bar-btn" @click="toggleVoice">
          <Mic :size="20" v-if="!isRecording" />
          <StopCircle :size="20" v-else />
        </button>
        
        <div class="input-wrapper" v-if="!isRecording">
          <input
            v-model="text"
            class="msg-input"
            placeholder="输入消息..."
            @keyup.enter="sendText"
            @focus="showPanel = false"
          />
        </div>
        
        <div v-else class="voice-recording" @touchend="stopRecording" @mouseup="stopRecording">
          {{ recordingTime > 0 ? `${recordingTime}s` : '按住说话' }}
        </div>

        <button class="bar-btn" @click="toggleEmoji"><Smile :size="20" /></button>
        <button class="bar-btn" @click="toggleMore"><Plus :size="20" /></button>
        
        <button v-if="text.trim() && !isRecording" class="send-btn" @click="sendText">发送</button>
      </div>
    </div>

    <!-- 图片预览 -->
    <div v-if="previewImg" class="image-preview" @click="previewImg = null">
      <img :src="previewImg" />
    </div>

    <!-- 隐藏的文件输入 -->
    <input ref="imageInput" type="file" accept="image/*" style="display:none" @change="handleImageSelect" />
    <input ref="fileInput" type="file" style="display:none" @change="handleFileSelect" />

    <!-- 音频播放器 -->
    <audio ref="audioPlayer" style="display:none" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useChatStore } from '../../stores/chat'
import { useAuthStore } from '../../stores/auth'
import * as api from '../../services/api'
import { onStateChange } from '../../services/websocket'
import { User, Image, FileText, MapPin, Mic, StopCircle, Smile, Plus, Volume2 } from 'lucide-vue-next'
import UserAvatar from '../../components/UserAvatar.vue'
import toast from '@/utils/toast'

const props = defineProps({ conversationId: Number })
const chat = useChatStore()
const auth = useAuthStore()

const text = ref('')
const msgList = ref([])
const msgContainer = ref(null)
const showEmoji = ref(false)
const showMore = ref(false)
const showPanel = ref(false)
const showProfile = ref(false)
const previewImg = ref(null)
const hasMore = ref(false)
const loadingMore = ref(false)
const wsState = ref('disconnected')

// 语音录制
const isRecording = ref(false)
const recordingTime = ref(0)
let recordingTimer = null
let mediaRecorder = null
let audioChunks = []

const imageInput = ref(null)
const fileInput = ref(null)
const audioPlayer = ref(null)

// 常用表情
const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊',
  '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋',
  '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
  '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '😮', '😯',
  '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭',
  '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👍', '👎', '👏',
  '🙏', '💪', '🤝', '✌️', '🤟', '🤙', '👋', '🎉', '🎊', '🌹'
]

const conversation = computed(() => 
  chat.conversations.find(c => c.id === props.conversationId)
)

const otherUser = computed(() => conversation.value?.otherUser)
const otherName = computed(() => otherUser.value?.nickname || '聊天')

function isMine(msg) {
  return msg.senderId === auth.user?.id
}

function getBubbleClass(msg) {
  const classes = []
  if (isMine(msg)) classes.push('bubble-mine')
  if (msg.messageType === 'EMOJI') classes.push('bubble-emoji')
  if (msg.messageType === 'IMAGE') classes.push('bubble-image')
  return classes
}

onMounted(async () => {
  onStateChange((s) => { wsState.value = s })
  
  const result = await chat.loadMessages(props.conversationId, 1)
  msgList.value = chat.messages[props.conversationId] || []
  hasMore.value = result?.hasMore || false
  
  await chat.markAsRead(props.conversationId)
  await nextTick()
  scrollBottom()
})

onUnmounted(() => {
  stopRecording()
})

function scrollBottom() {
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight
    }
  })
}

function handleScroll() {
  // 滚动到底部时标记已读
  if (msgContainer.value) {
    const { scrollTop, scrollHeight, clientHeight } = msgContainer.value
    if (scrollHeight - scrollTop - clientHeight < 50) {
      chat.markAsRead(props.conversationId)
    }
  }
}

async function loadMoreMessages() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  const currentPage = Math.ceil(msgList.value.length / 20) + 1
  const result = await chat.loadMessages(props.conversationId, currentPage)
  msgList.value = chat.messages[props.conversationId] || []
  hasMore.value = result?.hasMore || false
  loadingMore.value = false
}

// 发送文本消息
async function sendText() {
  if (!text.value.trim()) return
  const content = text.value.trim()
  text.value = ''
  showEmoji.value = false
  
  const receiverId = otherUser.value?.id
  if (receiverId) {
    chat.sendMessage(receiverId, content)
    msgList.value = chat.messages[props.conversationId] || []
    scrollBottom()
  }
}

// 表情
function toggleEmoji() {
  showEmoji.value = !showEmoji.value
  showMore.value = false
  showPanel.value = showEmoji.value
}

function insertEmoji(emoji) {
  text.value += emoji
}

// 更多功能
function toggleMore() {
  showMore.value = !showMore.value
  showEmoji.value = false
  showPanel.value = showMore.value
}

// 图片发送
function selectImage() {
  imageInput.value?.click()
}

async function handleImageSelect(e) {
  const file = e.target.files?.[0]
  if (!file) return
  showMore.value = false
  
  try {
    const url = await api.uploadFile(file)
    const receiverId = otherUser.value?.id
    if (receiverId && url) {
      chat.sendMessage(receiverId, url, 'IMAGE')
      msgList.value = chat.messages[props.conversationId] || []
      scrollBottom()
    }
  } catch (err) {
    toast.error('图片发送失败')
  }
  e.target.value = ''
}

// 文件发送
function selectFile() {
  fileInput.value?.click()
}

function handleFileSelect(e) {
  const file = e.target.files?.[0]
  if (!file) return
  showMore.value = false
  toast.info(`文件 "${file.name}" 选择成功，上传功能开发中...`)
  e.target.value = ''
}

function startLocationShare() {
  showMore.value = false
  toast.info('位置分享功能开发中...')
}

// 语音录制
async function toggleVoice() {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)
    audioChunks = []
    
    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data)
    }
    
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' })
      const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' })
      
      try {
        const url = await api.uploadFile(file)
        const receiverId = otherUser.value?.id
        if (receiverId && url) {
          chat.sendMessage(receiverId, url, 'VOICE')
          msgList.value = chat.messages[props.conversationId] || []
          scrollBottom()
        }
      } catch (err) {
        console.error('语音发送失败:', err)
      }
      
      stream.getTracks().forEach(t => t.stop())
    }
    
    mediaRecorder.start()
    isRecording.value = true
    recordingTime.value = 0
    recordingTimer = setInterval(() => {
      recordingTime.value++
      if (recordingTime.value >= 60) stopRecording() // 最长60秒
    }, 1000)
  } catch (err) {
    toast.error('无法访问麦克风，请检查权限设置')
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  isRecording.value = false
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
}

// 语音播放
function playVoice(msg) {
  if (audioPlayer.value) {
    audioPlayer.value.src = msg.content
    audioPlayer.value.play()
  }
}

// 图片预览
function previewImage(url) {
  previewImg.value = url
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

/* 顶部 */
.chat-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #fff;
  border-bottom: 1px solid #eee;
  gap: 10px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.back-arrow { font-size: 28px; color: #333; line-height: 1; }

.header-info { flex: 1; }
.header-info h1 { font-size: 16px; font-weight: 600; margin: 0; }
.online-status { font-size: 11px; color: #999; }
.online-status.connected { color: #16a34a; }

.header-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

/* 消息列表 */
.msg-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

.load-more {
  text-align: center;
  font-size: 12px;
  color: var(--primary);
  padding: 8px;
  cursor: pointer;
}

.msg-row {
  display: flex;
  margin-bottom: 16px;
  gap: 8px;
  align-items: flex-start;
}

.msg-mine {
  flex-direction: row-reverse;
}

.msg-avatar { flex-shrink: 0; }

.msg-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.msg-mine .msg-content { align-items: flex-end; }

.msg-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.bubble-mine {
  background: #3b82f6;
  color: #fff;
}

.bubble-emoji {
  background: transparent;
  box-shadow: none;
  padding: 0;
}

.emoji-msg { font-size: 48px; }

.bubble-image {
  padding: 4px;
  background: transparent;
  box-shadow: none;
}

.msg-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 12px;
  object-fit: cover;
  cursor: pointer;
}

.msg-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  padding: 0 4px;
}

/* 语音消息 */
.voice-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-width: 80px;
}

.voice-icon { font-size: 20px; }
.voice-duration { font-size: 13px; }

/* 输入区域 */
.input-area {
  background: #fff;
  border-top: 1px solid #eee;
  position: relative;
}

.input-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
}

.bar-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  font-size: 18px;
  cursor: pointer;
  flex-shrink: 0;
}

.input-wrapper { flex: 1; }

.msg-input {
  width: 100%;
  padding: 8px 14px;
  border: 1px solid #e5e5e5;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.msg-input:focus { border-color: #3b82f6; }

.voice-recording {
  flex: 1;
  text-align: center;
  padding: 8px;
  background: #fef2f2;
  border-radius: 20px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
}

.send-btn {
  padding: 6px 16px;
  background: #3b82f6;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0;
}

/* 表情面板 */
.panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
}

.emoji-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #eee;
  padding: 12px;
  z-index: 100;
  max-height: 240px;
  overflow-y: auto;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.emoji-item {
  font-size: 24px;
  text-align: center;
  padding: 8px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.2s;
}

.emoji-item:hover { background: #f5f5f5; }

/* 更多功能面板 */
.more-panel {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border-top: 1px solid #eee;
  padding: 20px;
  z-index: 100;
}

.more-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.more-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.more-icon {
  width: 48px;
  height: 48px;
  background: #f5f5f5;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.more-item span:last-child { font-size: 12px; color: #666; }

/* 图片预览 */
.image-preview {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.image-preview img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}
</style>