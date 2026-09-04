import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api'
import { onMessage as wsOnMessage, onMessageSent as wsOnMessageSent, sendMessage as wsSend } from '../services/websocket'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', () => {
  const conversations = ref([])
  const messages = ref({})  // { conversationId: [messages] }
  const loading = ref(false)
  const pendingMessages = ref({}) // 存储待确认的消息，key 为临时ID

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
      conv.updatedAt = new Date().toISOString()
      conv.unreadCount = (conv.unreadCount || 0) + 1
      if (messages.value[conv.id]) {
        messages.value[conv.id].push(msg)
      }
      // 将该会话移到列表顶部
      const index = conversations.value.indexOf(conv)
      if (index > 0) {
        conversations.value.splice(index, 1)
        conversations.value.unshift(conv)
      }
    } else {
      // 新会话，重新加载
      loadConversations()
    }
  })

  // 监听消息发送确认
  wsOnMessageSent((data) => {
    console.log('[ChatStore] 收到 MESSAGE_SENT 确认:', data)
    // 查找最近的待确认消息（因为后端返回的 MESSAGE_SENT 没有关联临时ID）
    const tempIds = Object.keys(pendingMessages.value)
    if (tempIds.length > 0) {
      // 取最早的一个待确认消息
      const tempId = tempIds[0]
      confirmMessage(tempId, data.messageId, data.createdAt)
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
    const auth = useAuthStore()
    const tempId = `temp-${Date.now()}`

    const success = wsSend(receiverId, content, messageType, null, tempId)

    if (!success) {
      console.error('[ChatStore] WebSocket 发送失败')
      return false
    }

    // 乐观更新：添加临时消息到界面
    const conv = conversations.value.find(c => c.otherUser?.id === receiverId)
    if (conv) {
      const msg = {
        senderId: auth.user?.id,
        receiverId,
        content,
        messageType,
        createdAt: new Date().toISOString(),
        id: tempId,
        _pending: true // 标记为待确认
      }

      // 存储待确认的消息
      pendingMessages.value[tempId] = {
        conversationId: conv.id,
        message: msg
      }

      conv.lastMessage = msg
      conv.updatedAt = new Date().toISOString()
      if (messages.value[conv.id]) {
        messages.value[conv.id].push(msg)
      } else {
        messages.value[conv.id] = [msg]
      }

      // 将该会话移到列表顶部
      const index = conversations.value.indexOf(conv)
      if (index > 0) {
        conversations.value.splice(index, 1)
        conversations.value.unshift(conv)
      }
    }

    return true
  }

  // 当收到 MESSAGE_SENT 确认时，更新临时消息
  function confirmMessage(tempId, realMessageId, createdAt) {
    const pending = pendingMessages.value[tempId]
    if (!pending) return

    const { conversationId, message } = pending
    const msgList = messages.value[conversationId]

    if (msgList) {
      const index = msgList.findIndex(m => m.id === tempId)
      if (index !== -1) {
        // 更新为真实ID
        msgList[index].id = realMessageId
        msgList[index].createdAt = createdAt
        msgList[index]._pending = false
        console.log('[ChatStore] 消息已确认，临时ID:', tempId, '真实ID:', realMessageId)
      }
    }

    // 清除待确认记录
    delete pendingMessages.value[tempId]
  }

  async function markAsRead(conversationId) {
    await api.markRead(conversationId)
    const conv = conversations.value.find(c => c.id === conversationId)
    if (conv) conv.unreadCount = 0
  }

  return {
    conversations, messages, loading, unreadCount,
    loadConversations, loadMessages, sendMessage, confirmMessage, markAsRead
  }
})
