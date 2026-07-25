const WS_URL = 'ws://localhost:9090/ws'

let ws = null
let reconnectTimer = null
let heartbeatTimer = null
let reconnectAttempts = 0
const MAX_RECONNECT = 5

// 事件监听器
const listeners = {
  message: [],    // 收到新消息
  state: [],      // 连接状态变化
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

function emit(state, data) {
  listeners[state].forEach(fn => fn(data))
}

function setState(state) {
  emit('state', state)
}

export function connect() {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    return
  }

  const token = localStorage.getItem('token')
  if (!token) return

  setState('connecting')
  try {
    ws = new WebSocket(`${WS_URL}?token=${token}`)

    ws.onopen = () => {
      setState('connected')
      reconnectAttempts = 0
      ws.send(JSON.stringify({ type: 'AUTH', token }))
      startHeartbeat()
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'NEW_MESSAGE') {
          emit('message', {
            id: msg.messageId,
            senderId: msg.senderId,
            receiverId: msg.receiverId,
            content: msg.content,
            messageType: msg.messageType || 'TEXT',
            createdAt: msg.createdAt || new Date().toISOString()
          })
        }
      } catch (e) { /* ignore parse error */ }
    }

    ws.onclose = () => {
      setState('disconnected')
      stopHeartbeat()
      attemptReconnect()
    }

    ws.onerror = () => {
      ws?.close()
    }
  } catch (e) {
    setState('disconnected')
    attemptReconnect()
  }
}

function startHeartbeat() {
  heartbeatTimer = setInterval(() => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'PING' }))
    }
  }, 30000)
}

function stopHeartbeat() {
  clearInterval(heartbeatTimer)
}

function attemptReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT) return
  setState('reconnecting')
  const delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, 16000)
  reconnectAttempts++
  reconnectTimer = setTimeout(connect, delay)
}

export function sendMessage(receiverId, content, messageType = 'TEXT') {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'MESSAGE', receiverId, content, messageType }))
  }
}

export function disconnect() {
  stopHeartbeat()
  clearTimeout(reconnectTimer)
  ws?.close()
  ws = null
  setState('disconnected')
}

export function getState() {
  if (!ws) return 'disconnected'
  if (ws.readyState === WebSocket.CONNECTING) return 'connecting'
  if (ws.readyState === WebSocket.OPEN) return 'connected'
  return 'disconnected'
}
