<template>
  <div class="page" style="padding-bottom:0">
    <div class="page-header">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h1>{{ otherName }}</h1>
    </div>

    <!-- 消息列表 -->
    <div class="msg-list" ref="msgList">
      <LoadingSpinner v-if="loading" />
      <div v-for="msg in msgList" :key="msg.id" class="msg-row" :class="{ 'msg-mine': msg.senderId === auth.user?.id }">
        <div class="msg-bubble" :class="{ 'bubble-mine': msg.senderId === auth.user?.id }">
          {{ msg.content }}
        </div>
      </div>
    </div>

    <!-- 输入栏 -->
    <div class="input-bar">
      <input v-model="text" class="form-input" placeholder="输入消息..." style="flex:1" @keyup.enter="send" />
      <button class="btn btn-primary btn-sm" @click="send">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useChatStore } from '../../stores/chat'
import { useAuthStore } from '../../stores/auth'
import LoadingSpinner from '../../components/LoadingSpinner.vue'

const props = defineProps({ conversationId: Number })
const chat = useChatStore()
const auth = useAuthStore()
const text = ref('')
const msgList = ref([])
const loading = ref(true)
const msgContainer = ref(null)

const otherName = computed(() => {
  const conv = chat.conversations.find(c => c.id === props.conversationId)
  return conv?.otherUser?.nickname || '聊天'
})

onMounted(async () => {
  await chat.loadMessages(props.conversationId)
  msgList.value = chat.messages[props.conversationId] || []
  loading.value = false
  await chat.markAsRead(props.conversationId)
  scrollBottom()
})

function send() {
  if (!text.value.trim()) return
  const conv = chat.conversations.find(c => c.id === props.conversationId)
  if (!conv?.otherUser) return
  chat.sendMessage(conv.otherUser.id, text.value.trim())
  // 乐观更新
  msgList.value.push({
    id: Date.now().toString(),
    senderId: auth.user?.id || 0,
    content: text.value.trim(),
    createdAt: new Date().toISOString()
  })
  text.value = ''
  nextTick(scrollBottom)
}

function scrollBottom() {
  nextTick(() => {
    const el = msgContainer.value
    if (el) el.scrollTop = el.scrollHeight
  })
}
</script>

<style scoped>
.msg-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  height: calc(100vh - 120px);
}
.msg-row { display: flex; margin-bottom: 12px; }
.msg-mine { justify-content: flex-end; }
.msg-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}
.bubble-mine { background: var(--primary); color: #fff; }
.input-bar {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: var(--surface);
  border-top: 1px solid var(--divider);
  padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
}
</style>
