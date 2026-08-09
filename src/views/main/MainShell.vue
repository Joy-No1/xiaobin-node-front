<template>
  <div class="main-shell">
    <router-view />
    <!-- 底部导航 -->
    <nav class="bottom-nav">
      <router-link to="/relationship">
        <span class="icon">
          <Handshake :size="24" />
        </span>
        <span>关系</span>
      </router-link>
      <router-link to="/square">
        <span class="icon">
          <Globe :size="24" />
        </span>
        <span>广场</span>
      </router-link>
      <router-link to="/chat">
        <span class="icon" style="position:relative">
          <MessageCircle :size="24" />
          <span v-if="totalUnread > 0" class="badge">{{ totalUnread > 99 ? '99+' : totalUnread }}</span>
        </span>
        <span>消息</span>
      </router-link>
      <router-link to="/profile">
        <span class="icon">
          <User :size="24" />
        </span>
        <span>我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useChatStore } from '../../stores/chat'
import { useNotificationStore } from '../../stores/notification'
import { Handshake, Globe, MessageCircle, User } from 'lucide-vue-next'

const chatStore = useChatStore()
const notificationStore = useNotificationStore()

let pollTimer = null

// 总未读数（聊天+通知）
const totalUnread = computed(() => {
  return (chatStore.unreadCount || 0) + (notificationStore.unreadCount || 0)
})

onMounted(() => {
  // 获取未读通知数
  notificationStore.fetchUnreadCount()
  // 定时轮询未读数（每30秒）
  pollTimer = setInterval(() => {
    notificationStore.fetchUnreadCount()
  }, 30000)
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
  }
})
</script>

<style scoped>
.main-shell { min-height: 100vh; }
</style>