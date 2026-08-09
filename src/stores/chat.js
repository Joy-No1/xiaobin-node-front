import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api'
import { onMessage as wsOnMessage, sendMessage as wsSend } from '../services/websocket'

export const useChatStore = defineStore('chat', () => {
  const conversations = ref([])
  const messages = ref({})  // { conversationId: [messages] }
  const loading = ref(false)

  const unreadCount = computed(() =>
    conversations.value.reduce((sum, c) => sum + (c.unreadCount || 0), 0)
  )

  // 监听 WebSocket 新消息
  wsOnMessage((msg) => {
    const conv = conversations.value.find(c =>
      c.otherUser?.id === msg.senderId
    )
    if (conv) {
      conv.lastMessage = msg
      conv.unreadCount = (conv.unreadCount || 0) + 1
      if (messages.value[conv.id]) {
        messages.value[conv.id].unshift(msg)
      }
    } else {
      // 新会话，重新加载
      loadConversations()
    }
  })

  async function loadConversations() {
    loading.value = true
    try {
      conversations.value = await api.getConversations() || []
    } catch (e) {
      conversations.value = []
    } finally {
      loading.value = false
    }
  }

  async function loadMessages(conversationId, pageNum = 1) {
    const data = await api.getMessages(conversationId, pageNum)
    const list = data.records || []
    if (pageNum === 1) {
      messages.value[conversationId] = [...list].reverse()
    } else {
      messages.value[conversationId] = [...list.reverse(), ...(messages.value[conversationId] || [])]
    }
    return { records: list, hasMore: pageNum < data.pages }
  }

  function sendMessage(receiverId, content, messageType = 'TEXT') {
    wsSend(receiverId, content, messageType)
    // 乐观更新
    const conv = conversations.value.find(c => c.otherUser?.id === receiverId)
    if (conv) {
      const msg = { senderId: 0, receiverId, content, messageType, createdAt: new Date().toISOString(), id: Date.now().toString() }
      conv.lastMessage = msg
      if (messages.value[conv.id]) {
        messages.value[conv.id].push(msg)
      } else {
        messages.value[conv.id] = [msg]
      }
    }
  }

  async function markAsRead(conversationId) {
    await api.markRead(conversationId)
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) conv.unreadCount = 0
  }

  return {
    conversations, messages, loading, unreadCount,
    loadConversations, loadMessages, sendMessage, markAsRead
  }
})
