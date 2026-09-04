<template>
  <router-view />
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useAuthStore } from './stores/auth'
import { connect, disconnect } from './services/websocket'

const auth = useAuthStore()

onMounted(() => {
  // 如果用户已登录，建立 WebSocket 连接
  if (auth.isAuthenticated) {
    console.log('[App] 用户已登录，建立 WebSocket 连接')
    connect()
  }
})

// 监听登录状态变化
watch(() => auth.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    console.log('[App] 用户登录，建立 WebSocket 连接')
    connect()
  } else {
    console.log('[App] 用户登出，断开 WebSocket 连接')
    disconnect()
  }
})
</script>
