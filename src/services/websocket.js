const WS_URL = 'ws://localhost:9090/ws'

let ws = null
let reconnectTimer = null
let heartbeatTimer = null
let reconnectAttempts = 0
const MAX_RECONNECT = 5
let isAuthenticated = false
let lastSentMessages = [] // 记录最近发送的消息，用于匹配 MESSAGE_SENT

// 事件监听器
const listeners = {
  message: [],       // 收到新消息
  state: [],         // 连接状态变化
  messageSent: [],   // 消息发送确认
}

export function onMessage(fn) {
  listeners.message.push(fn)
  return () => {
    const i = listeners.message.indexOf(fn)
    if (i >= 0) listeners.message.splice(i, 1)
  }
}

export function onStateChange(fn) {
  listeners.state.push(fn)
  return () => {
    const i = listeners.state.indexOf(fn)
    if (i >= 0) listeners.state.splice(i, 1)
  }
}

export function onMessageSent(fn) {
  listeners.messageSent.push(fn)
  return () => {
    const i = listeners.messageSent.indexOf(fn)
    if (i >= 0) listeners.messageSent.splice(i, 1)
  }
}

function emit(state, data) {
  listeners[state]?.forEach(fn => fn(data))
}

function setState(state) {
  emit('state', state)
}

export function connect() {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    console.log('[WebSocket] 已有连接，状态:', ws.readyState)
    return
  }

  const token = localStorage.getItem('token')
  if (!token) {
    console.error('[WebSocket] 缺少 token，无法建立连接')
    return
  }

  console.log('[WebSocket] 开始建立连接到:', WS_URL)
  setState('connecting')
  isAuthenticated = false // 重置认证状态

  try {
    // 后端不支持 URL 参数中的 token，直接连接
    ws = new WebSocket(WS_URL)

    ws.onopen = () => {
      console.log('[WebSocket] 连接已建立，发送认证消息')
      reconnectAttempts = 0

      // 连接建立后立即发送认证消息
      ws.send(JSON.stringify({ type: 'AUTH', token }))
    }

    ws.onmessage = (event) => {
      console.log('[WebSocket] 收到消息:', event.data)
      try {
        const msg = JSON.parse(event.data)

        switch(msg.type) {
          case 'AUTH_SUCCESS':
            console.log('[WebSocket] 认证成功, userId:', msg.userId)
            isAuthenticated = true
            setState('connected') // 认证成功后才设置为已连接
            startHeartbeat()
            break

          case 'MESSAGE_SENT':
            console.log('[WebSocket] 消息发送成功, messageId:', msg.messageId)
            // 触发消息发送确认事件
            emit('messageSent', {
              messageId: msg.messageId,
              createdAt: msg.createdAt
            })
            break

          case 'NEW_MESSAGE':
            console.log('[WebSocket] 收到新消息:', msg)
            emit('message', {
              id: msg.messageId,
              senderId: msg.senderId,
              receiverId: msg.receiverId,
              content: msg.content,
              messageType: msg.messageType || 'TEXT',
              createdAt: msg.createdAt || new Date().toISOString()
            })
            break

          case 'NEW_FOLLOWER':
            console.log('[WebSocket] 收到关注通知:', msg.fromUser)
            // 可以添加关注通知的处理
            break

          case 'PONG':
            console.log('[WebSocket] 心跳正常')
            break

          case 'ERROR':
            console.error('[WebSocket] 服务器错误:', msg.message)
            // 如果认证失败，断开连接
            if (!isAuthenticated) {
              console.error('[WebSocket] 认证失败，断开连接')
              disconnect()
            }
            break

          default:
            console.log('[WebSocket] 未处理的消息类型:', msg.type)
        }
      } catch (e) {
        console.error('[WebSocket] 解析消息失败:', e)
      }
    }

    ws.onclose = (event) => {
      console.log('[WebSocket] 连接关闭，代码:', event.code, '原因:', event.reason)
      setState('disconnected')
      isAuthenticated = false
      stopHeartbeat()
      attemptReconnect()
    }

    ws.onerror = (error) => {
      console.error('[WebSocket] 连接错误:', error)
      ws?.close()
    }
  } catch (e) {
    console.error('[WebSocket] 创建连接失败:', e)
    setState('disconnected')
    attemptReconnect()
  }
}

function startHeartbeat() {
  stopHeartbeat() // 先清除旧的定时器
  heartbeatTimer = setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN && isAuthenticated) {
      console.log('[WebSocket] 发送心跳')
      ws.send(JSON.stringify({ type: 'PING' }))
    }
  }, 30000)
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

function attemptReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT) {
    console.log('[WebSocket] 达到最大重连次数，停止重连')
    return
  }
  setState('reconnecting')
  const delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, 16000)
  console.log(`[WebSocket] 将在 ${delay}ms 后重连 (第 ${reconnectAttempts + 1} 次)`)
  reconnectAttempts++
  reconnectTimer = setTimeout(connect, delay)
}

export function sendMessage(receiverId, content, messageType = 'TEXT', duration = null, tempId = null) {
  console.log('[WebSocket] 准备发送消息:', { receiverId, content, messageType, tempId, wsState: ws?.readyState, isAuthenticated })

  if (!ws) {
    console.error('[WebSocket] WebSocket 未初始化')
    return false
  }

  if (ws.readyState !== WebSocket.OPEN) {
    console.error('[WebSocket] 连接未建立，当前状态:', ws.readyState)
    return false
  }

  if (!isAuthenticated) {
    console.error('[WebSocket] 未认证，无法发送消息')
    return false
  }

  try {
    const message = {
      type: 'MESSAGE',
      receiverId,
      content,
      messageType
    }

    // 如果是语音消息，需要传duration（秒）
    if (messageType === 'VOICE' && duration) {
      message.duration = duration
    }

    console.log('[WebSocket] 发送消息:', message)
    ws.send(JSON.stringify(message))

    // 记录临时ID，用于后续匹配 MESSAGE_SENT
    if (tempId) {
      lastSentMessages.push({
        tempId,
        timestamp: Date.now(),
        receiverId,
        content
      })
      // 只保留最近10条
      if (lastSentMessages.length > 10) {
        lastSentMessages.shift()
      }
    }

    return true
  } catch (error) {
    console.error('[WebSocket] 发送消息失败:', error)
    return false
  }
}

export function disconnect() {
  console.log('[WebSocket] 主动断开连接')
  stopHeartbeat()
  clearTimeout(reconnectTimer)
  isAuthenticated = false
  ws?.close()
  ws = null
  setState('disconnected')
}

export function getState() {
  if (!ws) return 'disconnected'
  if (ws.readyState === WebSocket.CONNECTING) return 'connecting'
  if (ws.readyState === WebSocket.OPEN) return isAuthenticated ? 'connected' : 'authenticating'
  return 'disconnected'
}

export function getIsAuthenticated() {
  return isAuthenticated
}
