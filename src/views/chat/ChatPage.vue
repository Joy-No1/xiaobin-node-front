<template>
  <div class="chat-page">
    <!-- 顶部导航 -->
    <div class="chat-header">
      <button class="back-btn" @click="$router.back()">
        <span class="back-arrow">‹</span>
      </button>
      <UserAvatar
        :src="otherUser?.avatarUrl"
        :name="otherUser?.nickname || '?'"
        :size="38"
        class="header-avatar"
      />
      <div class="header-info" @click="showProfile = true">
        <h1>{{ otherName }}</h1>
        <span class="online-status">在线</span>
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
            <!-- 视频消息 -->
            <template v-else-if="msg.messageType === 'VIDEO'">
              <div class="video-msg" @click="previewVideo(msg.content)">
                <video :src="msg.content" class="msg-video" preload="metadata"></video>
                <div class="video-play-btn"><span>▶</span></div>
              </div>
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
            <!-- 文件消息 -->
            <template v-else-if="msg.messageType === 'FILE'">
              <div class="file-msg" @click="openFileMsg(msg)">
                <span class="file-icon">📄</span>
                <div class="file-info">
                  <span class="file-name">{{ getFileName(msg) }}</span>
                  <span class="file-size">{{ getFileSize(msg) }}</span>
                </div>
              </div>
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
            <span class="more-icon" style="background:#e8f5e9;color:#43a047"><Image :size="24" /></span>
            <span>图片</span>
          </div>
          <div class="more-item" @click="takePhoto">
            <span class="more-icon" style="background:#fff3e0;color:#fb8c00"><Camera :size="24" /></span>
            <span>拍摄</span>
          </div>
          <div class="more-item" @click="selectVideo">
            <span class="more-icon" style="background:#e3f2fd;color:#1e88e5"><Video :size="24" /></span>
            <span>视频</span>
          </div>
          <div class="more-item" @click="selectFile">
            <span class="more-icon" style="background:#f3e5f5;color:#8e24aa"><FileText :size="24" /></span>
            <span>文件</span>
          </div>
          <div class="more-item" @click="startLocationShare">
            <span class="more-icon" style="background:#fce4ec;color:#e53935"><MapPin :size="24" /></span>
            <span>位置</span>
          </div>
        </div>
      </div>

      <!-- 语音录制条 -->
      <div v-if="isRecording" class="voice-bar"
        @mousedown="startRecording"
        @mouseup="stopRecording"
        @mouseleave="stopRecording"
        @touchstart.prevent="startRecording"
        @touchend.prevent="stopRecording"
        @touchcancel="stopRecording">
        <button class="voice-cancel-btn" @mousedown.stop @mouseup.stop @touchstart.stop @touchend.stop @click.stop="cancelVoice">✕</button>
        <span class="voice-bar-icon">🎤</span>
        <span>{{ recordingTime > 0 ? `录音中 ${recordingTime}s` : '按住说话，松开发送' }}</span>
        <span class="voice-bar-hint">松开发送</span>
      </div>

      <!-- 输入栏 -->
      <div class="input-bar" v-if="!isRecording">
        <div class="input-wrapper">
          <textarea
            v-model="text"
            ref="textInput"
            class="msg-input"
            placeholder="输入消息..."
            rows="1"
            @keyup="autoResize"
            @keyup.enter.exact="sendText"
            @focus="closePanels"
          ></textarea>
        </div>
        <button class="bar-btn send-btn-main" v-if="text.trim()" @click="sendText">发送</button>
        <template v-else>
          <button class="bar-btn" @click="toggleVoice">
            <Mic :size="22" />
          </button>
          <button class="bar-btn" @click="toggleEmoji">
            <Smile :size="22" />
          </button>
          <button class="bar-btn" @click="toggleMore">
            <Plus :size="22" />
          </button>
        </template>
      </div>
    </div>

    <!-- 图片/视频预览 -->
    <div v-if="previewImg" class="image-preview" @click="closePreview">
      <img v-if="!previewVideoUrl" :src="previewImg" />
      <video v-else :src="previewVideoUrl" controls autoplay class="preview-video"></video>
    </div>

    <!-- 隐藏的文件输入 -->
    <input ref="imageInput" type="file" accept="image/*" style="display:none" @change="handleImageSelect" />
    <input ref="videoInput" type="file" accept="video/*" style="display:none" @change="handleVideoSelect" />
    <input ref="cameraInput" type="file" accept="image/*" capture="environment" style="display:none" @change="handleImageSelect" />
    <input ref="fileInput" type="file" style="display:none" @change="handleFileSelect" />

    <!-- 音频播放器 -->
    <audio ref="audioPlayer" style="display:none" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '../../stores/chat'
import { useAuthStore } from '../../stores/auth'
import * as api from '../../services/api'
import { onStateChange } from '../../services/websocket'
import { User, Image, FileText, MapPin, Mic, Smile, Plus, Volume2, Video, Camera } from 'lucide-vue-next'
import UserAvatar from '../../components/UserAvatar.vue'
import toast from '@/utils/toast'

const props = defineProps({ conversationId: Number })
const route = useRoute()
const chat = useChatStore()
const auth = useAuthStore()

const text = ref('')
const textInput = ref(null)
const msgList = ref([])
const msgContainer = ref(null)
const showEmoji = ref(false)
const showMore = ref(false)
const showProfile = ref(false)
const previewImg = ref(null)
const previewVideoUrl = ref(null)
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
const videoInput = ref(null)
const cameraInput = ref(null)
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

// 对方用户信息：优先从会话获取，其次从路由参数
const otherUser = computed(() => {
  if (conversation.value?.otherUser) return conversation.value.otherUser
  // 兜底：从路由 query 中读取
  const q = route.query
  if (q.otherName) {
    return {
      id: Number(q.otherId) || 0,
      nickname: q.otherName || '聊天',
      avatarUrl: q.otherAvatar || ''
    }
  }
  return null
})

const otherName = computed(() => otherUser.value?.nickname || '聊天')

function isMine(msg) {
  return msg.senderId === auth.user?.id
}

function getBubbleClass(msg) {
  const classes = []
  if (isMine(msg)) classes.push('bubble-mine')
  if (msg.messageType === 'EMOJI') classes.push('bubble-emoji')
  if (msg.messageType === 'IMAGE') classes.push('bubble-image')
  if (msg.messageType === 'VIDEO') classes.push('bubble-video')
  return classes
}

onMounted(async () => {
  onStateChange((s) => { wsState.value = s })

  // 加载会话列表以获取 otherUser 信息
  await chat.loadConversations()

  // 如果会话中没有对方信息，尝试单独获取
  if (!otherUser.value?.id) {
    try {
      const conv = await api.getMessages(props.conversationId, 1)
      // 从消息列表中推断对方 ID
      const records = conv?.records || []
      const otherMsg = records.find(m => m.senderId !== auth.user?.id)
      if (otherMsg?.senderId) {
        try {
          const userData = await api.getUserProfile(otherMsg.senderId)
          const user = userData?.user || userData
          if (user) {
            // 临时存储到会话对象
            if (conversation.value) {
              conversation.value.otherUser = user
            }
          }
        } catch { /* 忽略 */ }
      }
    } catch { /* 忽略 */ }
  }

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

// 关闭面板
function closePanels() {
  showEmoji.value = false
  showMore.value = false
}

// 输入框自动伸缩
function autoResize() {
  nextTick(() => {
    const el = textInput.value
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    }
  })
}

// 发送文本消息
async function sendText() {
  if (!text.value.trim()) return
  const content = text.value.trim()
  text.value = ''
  showEmoji.value = false
  showMore.value = false

  // 重置输入框高度
  nextTick(() => {
    if (textInput.value) textInput.value.style.height = 'auto'
  })

  const receiverId = otherUser.value?.id
  if (!receiverId) {
    toast.error('无法发送消息，对方信息缺失')
    return
  }
  chat.sendMessage(receiverId, content)
  msgList.value = chat.messages[props.conversationId] || []
  await nextTick()
  scrollBottom()
}

// 表情
function toggleEmoji() {
  showEmoji.value = !showEmoji.value
  showMore.value = false
}

function insertEmoji(emoji) {
  text.value += emoji
  textInput.value?.focus()
}

// 更多功能
function toggleMore() {
  showMore.value = !showMore.value
  showEmoji.value = false
}

// 图片发送
function selectImage() {
  imageInput.value?.click()
  showMore.value = false
}

async function handleImageSelect(e) {
  const file = e.target.files?.[0]
  if (!file) return

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

// 拍摄照片
function takePhoto() {
  cameraInput.value?.click()
  showMore.value = false
}

// 视频选择与发送
function selectVideo() {
  videoInput.value?.click()
  showMore.value = false
}

async function handleVideoSelect(e) {
  const file = e.target.files?.[0]
  if (!file) return

  // 限制视频大小 100MB
  if (file.size > 100 * 1024 * 1024) {
    toast.error('视频不能超过 100MB')
    e.target.value = ''
    return
  }

  try {
    toast.info('视频上传中...')
    const url = await api.uploadFile(file)
    const receiverId = otherUser.value?.id
    if (receiverId && url) {
      chat.sendMessage(receiverId, url, 'VIDEO')
      msgList.value = chat.messages[props.conversationId] || []
      scrollBottom()
    }
  } catch (err) {
    toast.error('视频发送失败')
  }
  e.target.value = ''
}

// 文件发送
function selectFile() {
  fileInput.value?.click()
  showMore.value = false
}

async function handleFileSelect(e) {
  const file = e.target.files?.[0]
  if (!file) return

  // 限制文件大小 50MB
  if (file.size > 50 * 1024 * 1024) {
    toast.error('文件不能超过 50MB')
    e.target.value = ''
    return
  }

  try {
    toast.info('文件上传中...')
    const url = await api.uploadFile(file)
    const receiverId = otherUser.value?.id
    if (receiverId && url) {
      chat.sendMessage(receiverId, JSON.stringify({ name: file.name, size: file.size, url }), 'FILE')
      msgList.value = chat.messages[props.conversationId] || []
      scrollBottom()
      toast.success('文件发送成功')
    }
  } catch (err) {
    toast.error('文件发送失败')
  }
  e.target.value = ''
}

function startLocationShare() {
  showMore.value = false
  toast.info('位置分享功能开发中...')
}

// 语音录制
function toggleVoice() {
  closePanels()
  isRecording.value = true
}

function cancelVoice() {
  stopRecording()
  isRecording.value = false
  recordingTime.value = 0
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
  previewVideoUrl.value = null
}

function closePreview() {
  previewImg.value = null
  previewVideoUrl.value = null
}

// 视频预览
function previewVideo(url) {
  previewImg.value = url
  previewVideoUrl.value = url
}

// 文件消息解析
function getFileName(msg) {
  try {
    const data = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content
    return data?.name || '未知文件'
  } catch { return msg.content || '未知文件' }
}

function getFileSize(msg) {
  try {
    const data = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content
    const size = data?.size
    if (!size) return ''
    if (size < 1024) return `${size}B`
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
    return `${(size / (1024 * 1024)).toFixed(1)}MB`
  } catch { return '' }
}

function openFileMsg(msg) {
  try {
    const data = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content
    if (data?.url) window.open(data.url, '_blank')
  } catch { window.open(msg.content, '_blank') }
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
  position: fixed;
  inset: 0;
  z-index: 101; /* 覆盖底部导航栏 (z-index: 100) */
  display: flex;
  flex-direction: column;
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
  flex-shrink: 0;
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
  flex-shrink: 0;
}

.back-arrow { font-size: 28px; color: #333; line-height: 1; }

.header-avatar { flex-shrink: 0; }

.header-info {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}
.header-info h1 { font-size: 16px; font-weight: 600; margin: 0; }
.online-status { font-size: 11px; color: #16a34a; }

.header-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
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

/* 视频消息 */
.bubble-video {
  padding: 0;
  background: transparent;
  box-shadow: none;
  overflow: hidden;
  border-radius: 12px;
}

.video-msg {
  position: relative;
  width: 200px;
  max-width: 200px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
}

.msg-video {
  width: 200px;
  height: 150px;
  object-fit: cover;
  display: block;
  background: #000;
}

.video-play-btn {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
}

.video-play-btn span {
  font-size: 32px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

/* 文件消息 */
.file-msg {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px;
  cursor: pointer;
  min-width: 160px;
}

.file-icon {
  font-size: 36px;
  flex-shrink: 0;
}

.file-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 140px;
}

.file-size {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.bubble-mine .file-size {
  color: rgba(255, 255, 255, 0.7);
}

/* 视频预览 */
.preview-video {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
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

/* ==================== 输入区域 ==================== */
.input-area {
  background: #fff;
  border-top: 1px solid #e5e5e5;
  position: relative;
  flex-shrink: 0;
}

/* 语音录制条 */
.voice-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 16px;
  background: #fff;
  font-size: 15px;
  color: #333;
  cursor: pointer;
  user-select: none;
  padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
}

.voice-bar-icon { font-size: 22px; }

.voice-cancel-btn {
  position: absolute;
  left: 12px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: #e5e5e5;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.voice-bar-hint {
  font-size: 12px;
  color: #999;
  position: absolute;
  right: 16px;
}

/* 输入栏 */
.input-bar {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
}

.input-wrapper {
  flex: 1;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 4px 6px;
}

.msg-input {
  width: 100%;
  padding: 8px 10px;
  border: none;
  background: transparent;
  font-size: 15px;
  line-height: 1.4;
  outline: none;
  resize: none;
  font-family: inherit;
  box-sizing: border-box;
  min-height: 22px;
  max-height: 120px;
}

.msg-input::placeholder { color: #bbb; }

.bar-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  color: #555;
  transition: background 0.15s;
}

.bar-btn:active { background: #e5e5e5; }

.send-btn-main {
  padding: 0 18px;
  width: auto;
  height: 38px;
  border-radius: 19px;
  background: #3b82f6;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.send-btn-main:active { background: #2563eb; }

/* 表情面板 */
.emoji-panel {
  border-top: 1px solid #e5e5e5;
  background: #fff;
  padding: 12px;
  max-height: 240px;
  overflow-y: auto;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
}

.emoji-item {
  font-size: 26px;
  text-align: center;
  padding: 6px;
  cursor: pointer;
  border-radius: 8px;
  transition: background 0.15s;
}

.emoji-item:active { background: #f0f0f0; }

/* 更多功能面板 */
.more-panel {
  border-top: 1px solid #e5e5e5;
  background: #fff;
  padding: 16px 12px;
}

.more-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.more-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
}

.more-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
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