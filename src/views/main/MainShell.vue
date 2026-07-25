<template>
  <div class="main-shell">
    <router-view />
    <!-- 底部导航 -->
    <nav class="bottom-nav">
      <router-link to="/relationship">
        <span class="icon">💕</span>
        <span>好感度</span>
      </router-link>
      <router-link to="/square">
        <span class="icon">🌍</span>
        <span>广场</span>
      </router-link>
      <router-link to="/chat">
        <span class="icon" style="position:relative">
          💬
          <span v-if="chat.unreadCount > 0" class="badge">{{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}</span>
        </span>
        <span>聊天</span>
      </router-link>
      <router-link to="/profile">
        <span class="icon">👤</span>
        <span>我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useChatStore } from '../../stores/chat'
const chat = useChatStore()
</script>

<style scoped>
.main-shell { min-height: 100vh; }
</style>
