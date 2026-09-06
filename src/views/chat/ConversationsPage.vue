<template>
  <div class="page">
    <div class="page-header flex-between">
      <h1><MessageCircle :size="20" class="inline-icon" /> 消息</h1>
      <div class="header-actions">
        <span class="status-indicator" :class="wsState">
          <span class="status-dot"></span>
          {{ wsState === 'connected' ? '在线' : wsState === 'connecting' || wsState === 'reconnecting' ? '连接中' : '离线' }}
        </span>
      </div>
    </div>

    <div class="page-body">
      <!-- 顶部快捷入口 -->
      <div class="quick-entries">
        <div
          class="entry-card"
          @click="showNotifications('LIKE')"
        >
          <div class="entry-icon like-icon">
            <Heart :size="20" />
          </div>
          <div class="entry-content">
            <div class="entry-title">赞和收藏</div>
            <div class="entry-subtitle">{{ likeCount > 0 ? `${likeCount} 条新消息` : '暂无新消息' }}</div>
          </div>
          <ChevronRight :size="18" class="entry-arrow" />
          <div v-if="likeCount > 0" class="entry-badge"></div>
        </div>

        <div
          class="entry-card"
          @click="showNotifications('FOLLOW')"
        >
          <div class="entry-icon follow-icon">
            <UserPlus :size="20" />
          </div>
          <div class="entry-content">
            <div class="entry-title">新增关注</div>
            <div class="entry-subtitle">{{ followCount > 0 ? `${followCount} 条新消息` : '暂无新消息' }}</div>
          </div>
          <ChevronRight :size="18" class="entry-arrow" />
          <div v-if="followCount > 0" class="entry-badge"></div>
        </div>

        <div
          class="entry-card"
          @click="showNotifications('COMMENT')"
        >
          <div class="entry-icon comment-icon">
            <MessageSquare :size="20" />
          </div>
          <div class="entry-content">
            <div class="entry-title">评论和@</div>
            <div class="entry-subtitle">{{ commentCount > 0 ? `${commentCount} 条新消息` : '暂无新消息' }}</div>
          </div>
          <ChevronRight :size="18" class="entry-arrow" />
          <div v-if="commentCount > 0" class="entry-badge"></div>
        </div>
      </div>

      <!-- 聊天列表区域 -->
      <div class="chat-section">
        <div class="section-header">
          <h3>聊天</h3>
        </div>

        <LoadingSpinner v-if="chat.loading" message="加载中..." />
        <EmptyState
          v-else-if="chat.conversations.length === 0"
          :icon="MessageCircle"
          message="还没有聊天消息"
          action-label="互相关注后可以开始聊天"
          @action="() => {}"
        />
        <div v-else class="chat-list">
          <div
            v-for="conv in chat.conversations"
            :key="conv.id"
            class="chat-item"
            :class="{ 'has-unread': conv.unreadCount > 0 }"
            @click="$router.push(`/chat/${conv.id}`)"
          >
            <div class="avatar-wrapper">
              <UserAvatar
                :src="conv.otherUser?.avatarUrl"
                :name="conv.otherUser?.nickname || '?'"
                :size="52"
              />
              <!-- 在线状态指示器 -->
              <div v-if="getOnlineStatus(conv.otherUser?.id)" class="online-indicator"></div>
              <!-- 未读数徽章 -->
              <div v-if="conv.unreadCount" class="unread-badge">{{ conv.unreadCount > 99 ? '99+' : conv.unreadCount }}</div>
            </div>
            <div class="chat-content">
              <div class="chat-header">
                <span class="chat-name">{{ conv.otherUser?.nickname || '未知用户' }}</span>
                <span class="chat-time">{{ timeAgo(conv.updatedAt) }}</span>
              </div>
              <div class="chat-preview">
                {{ getLastMessagePreview(conv) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知详情抽屉 -->
    <div v-if="showNotificationDrawer" class="notification-drawer" @click="closeDrawer">
      <div class="drawer-content" @click.stop>
        <div class="drawer-header">
          <h2>{{ drawerTitle }}</h2>
          <button class="close-btn" @click="closeDrawer">
            <X :size="24" />
          </button>
        </div>

        <div class="drawer-body">
          <LoadingSpinner v-if="notificationStore.loading && filteredNotifications.length === 0" message="加载中..." />
          <EmptyState
            v-else-if="filteredNotifications.length === 0"
            :icon="Bell"
            message="暂无消息"
          />
          <div v-else class="notification-list">
            <div
              v-for="item in filteredNotifications"
              :key="item.id"
              class="notification-item"
              :class="{ 'is-unread': !item.isRead }"
              @click="handleNotificationClick(item)"
            >
              <UserAvatar
                :src="item.fromUser?.avatarUrl"
                :name="item.fromUser?.nickname || '?'"
                :size="44"
                @click.stop="goToUserProfile(item.fromUserId)"
              />
              <div class="notification-body">
                <div class="notification-header">
                  <span class="user-name" @click.stop="goToUserProfile(item.fromUserId)">
                    {{ item.fromUser?.nickname || '用户' }}
                  </span>
                  <span class="notification-time">{{ timeAgo(item.createdAt) }}</span>
                </div>
                <div class="notification-text">
                  {{ getActionText(item.type) }}
                </div>
                <div v-if="item.content" class="notification-content">
                  {{ item.content }}
                </div>
              </div>
              <div v-if="!item.isRead" class="unread-dot"></div>
            </div>

            <p v-if="notificationStore.hasMore" class="load-more">
              <button
                class="btn btn-sm"
                @click="loadMore"
                :disabled="loadingMore"
              >
                {{ loadingMore ? '加载中...' : '加载更多' }}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessageCircle, Heart, UserPlus, MessageSquare, ChevronRight, X, Bell } from 'lucide-vue-next'
import { useChatStore } from '../../stores/chat'
import { useNotificationStore } from '../../stores/notification'
import { onStateChange, getState } from '../../services/websocket'
import * as api from '../../services/api'
import UserAvatar from '../../components/UserAvatar.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'

const router = useRouter()
const chat = useChatStore()
const notificationStore = useNotificationStore()
const wsState = ref('disconnected')
const loadingMore = ref(false)
const showNotificationDrawer = ref(false)
const currentNotificationType = ref(null)
const onlineStatusMap = ref({}) // 存储所有用户的在线状态 { userId: boolean }
let onlineStatusInterval = null // 定时检查在线状态

// 计算各类型通知的未读数
const likeCount = computed(() => {
  return notificationStore.notifications.filter(n => n.type === 'LIKE' && !n.isRead).length
})

const followCount = computed(() => {
  return notificationStore.notifications.filter(n => n.type === 'FOLLOW' && !n.isRead).length
})

const commentCount = computed(() => {
  return notificationStore.notifications.filter(n => ['COMMENT', 'REPLY'].includes(n.type) && !n.isRead).length
})

// 过滤的通知列表
const filteredNotifications = computed(() => {
  if (!currentNotificationType.value) return []

  if (currentNotificationType.value === 'LIKE') {
    return notificationStore.notifications.filter(n => n.type === 'LIKE')
  } else if (currentNotificationType.value === 'FOLLOW') {
    return notificationStore.notifications.filter(n => n.type === 'FOLLOW')
  } else if (currentNotificationType.value === 'COMMENT') {
    return notificationStore.notifications.filter(n => ['COMMENT', 'REPLY'].includes(n.type))
  }
  return []
})

// 抽屉标题
const drawerTitle = computed(() => {
  const titles = {
    LIKE: '赞和收藏',
    FOLLOW: '新增关注',
    COMMENT: '评论和@'
  }
  return titles[currentNotificationType.value] || '通知'
})

onMounted(async () => {
  // 获取当前 WebSocket 状态
  const currentState = getState()
  wsState.value = currentState
  console.log('[ConversationsPage] 当前 WebSocket 状态:', currentState)

  // 监听状态变化
  onStateChange((s) => {
    wsState.value = s
    console.log('[ConversationsPage] WebSocket 状态变化:', s)
  })

  await Promise.all([
    chat.loadConversations(),
    notificationStore.loadNotifications(1)
  ])

  // 加载完会话后，批量检查在线状态
  await batchCheckOnlineStatus()

  // 每30秒自动刷新在线状态
  onlineStatusInterval = setInterval(() => {
    batchCheckOnlineStatus()
  }, 30000)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (onlineStatusInterval) {
    clearInterval(onlineStatusInterval)
    onlineStatusInterval = null
  }
})

function showNotifications(type) {
  currentNotificationType.value = type
  showNotificationDrawer.value = true
}

function closeDrawer() {
  showNotificationDrawer.value = false
  currentNotificationType.value = null
}

function getActionText(type) {
  const actions = {
    FOLLOW: '关注了你',
    COMMENT: '评论了你的动态',
    LIKE: '赞了你的动态',
    REPLY: '回复了你的评论'
  }
  return actions[type] || ''
}

function timeAgo(d) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  if (mins < 1440) return `${Math.floor(mins / 60)}小时前`
  if (mins < 10080) return `${Math.floor(mins / 1440)}天前`
  return new Date(d).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

function getLastMessagePreview(conv) {
  // 后端返回的 lastMessage 可能是字符串或对象
  if (!conv.lastMessage) {
    return '发起了聊天'
  }

  // 如果是字符串，直接返回
  if (typeof conv.lastMessage === 'string') {
    return conv.lastMessage
  }

  // 如果是对象，取 content 属性
  if (typeof conv.lastMessage === 'object' && conv.lastMessage.content) {
    return conv.lastMessage.content
  }

  return '发起了聊天'
}

// 批量检查在线状态
async function batchCheckOnlineStatus() {
  if (!chat.conversations || chat.conversations.length === 0) return

  try {
    // 收集所有对方用户的 ID
    const userIds = chat.conversations
      .map(conv => conv.otherUser?.id)
      .filter(id => id != null)

    if (userIds.length === 0) return

    console.log('[ConversationsPage] 批量检查在线状态:', userIds)

    // 调用批量检查接口
    const result = await api.batchCheckOnline(userIds)
    console.log('[ConversationsPage] 在线状态结果:', result)

    // 更新在线状态映射
    onlineStatusMap.value = result || {}
  } catch (error) {
    console.error('[ConversationsPage] 检查在线状态失败:', error)
  }
}

// 获取指定用户的在线状态
function getOnlineStatus(userId) {
  if (!userId) return false
  return onlineStatusMap.value[userId] === true
}

function handleNotificationClick(item) {
  if (!item.isRead) {
    notificationStore.markAsRead(item.id)
  }
  if (item.type === 'FOLLOW') {
    goToUserProfile(item.fromUserId)
  }
  // 可以根据不同类型跳转到不同页面
}

function goToUserProfile(userId) {
  if (!userId) return
  router.push(`/profile/${userId}`)
}

async function loadMore() {
  loadingMore.value = true
  try {
    await notificationStore.loadMore()
  } finally {
    loadingMore.value = false
  }
}
</script>

<style scoped>
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
}

.status-indicator.connected .status-dot {
  background: #10b981;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 快捷入口区域 */
.quick-entries {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}

.entry-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  background: var(--surface);
  border: 1px solid var(--divider);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.entry-card:hover {
  background: var(--hover);
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.entry-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.like-icon {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  color: #ec4899;
}

.follow-icon {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #3b82f6;
}

.comment-icon {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #10b981;
}

.entry-content {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.entry-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entry-subtitle {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.entry-arrow {
  display: none;
}

.entry-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid var(--surface);
}

/* 聊天列表区域 */
.chat-section {
  margin-top: 8px;
}

.section-header {
  padding: 8px 0 12px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--divider);
  border-radius: 12px;
  overflow: hidden;
}

.chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--surface);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.chat-item:hover {
  background: var(--hover);
}

.chat-item.has-unread {
  background: rgba(59, 130, 246, 0.03);
}

.chat-item.has-unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: var(--primary);
  border-radius: 0 2px 2px 0;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  background: #10b981;
  border: 2.5px solid var(--surface);
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
  animation: pulseOnline 2s ease-in-out infinite;
}

@keyframes pulseOnline {
  0%, 100% {
    box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
  }
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ef4444;
  color: #fff;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.chat-content {
  flex: 1;
  min-width: 0;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chat-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.chat-time {
  font-size: 11px;
  color: var(--text-secondary);
  flex-shrink: 0;
  margin-left: 8px;
}

.chat-preview {
  font-size: 13px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

/* 通知抽屉 */
.notification-drawer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.drawer-content {
  width: 100%;
  max-height: 85vh;
  background: var(--surface);
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--divider);
  flex-shrink: 0;
}

.drawer-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--bg);
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: var(--hover);
}

.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: var(--bg);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.notification-item:hover {
  background: var(--hover);
}

.notification-item.is-unread {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.notification-body {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
}

.user-name:hover {
  color: var(--primary);
}

.notification-time {
  font-size: 11px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.notification-text {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 6px;
}

.notification-content {
  font-size: 13px;
  color: var(--text);
  line-height: 1.5;
  padding: 8px 12px;
  background: var(--surface);
  border-radius: 8px;
  border-left: 2px solid var(--primary);
}

.unread-dot {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
}

.load-more {
  text-align: center;
  margin-top: 8px;
}

/* 响应式 */
@media (max-width: 768px) {
  .drawer-content {
    max-height: 90vh;
  }

  .entry-title {
    font-size: 12px;
  }

  .entry-subtitle {
    font-size: 10px;
  }

  .entry-icon {
    width: 36px;
    height: 36px;
  }
}

@media (min-width: 769px) {
  .notification-drawer {
    align-items: center;
    justify-content: center;
  }

  .drawer-content {
    width: 600px;
    max-height: 80vh;
    border-radius: 16px;
  }

  .drawer-header {
    border-radius: 16px 16px 0 0;
  }
}
</style>