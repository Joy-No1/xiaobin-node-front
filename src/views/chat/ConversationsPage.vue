<template>
  <div class="page">
    <div class="page-header flex-between">
      <h1><MessageCircle :size="20" class="inline-icon" /> 消息</h1>
      <span class="text-secondary" style="font-size:12px">
        {{ wsState === 'connected' ? '在线' : wsState === 'connecting' || wsState === 'reconnecting' ? '连接中' : '离线' }}
      </span>
    </div>

    <!-- Tab 切换 -->
    <div class="tabs">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'chat' }"
        @click="activeTab = 'chat'"
      >
        聊天
        <span v-if="chat.unreadCount > 0" class="tab-badge">{{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'notification' }"
        @click="activeTab = 'notification'"
      >
        通知
        <span v-if="notificationStore.unreadCount > 0" class="tab-badge">{{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}</span>
      </button>
    </div>

    <div class="page-body">
      <!-- 聊天列表 -->
      <div v-if="activeTab === 'chat'">
        <LoadingSpinner v-if="chat.loading" message="加载会话..." />
        <EmptyState
          v-else-if="chat.conversations.length === 0"
          :icon="MessageCircle"
          message="还没有消息"
          action-label="互相关注后可以开始聊天"
          @action="() => {}"
        />
        <div v-else>
          <div
            v-for="conv in chat.conversations"
            :key="conv.id"
            class="card flex gap-2 fade-in conv-item"
            @click="$router.push(`/chat/${conv.id}`)"
          >
            <UserAvatar
              :src="conv.otherUser?.avatarUrl"
              :name="conv.otherUser?.nickname || '?'"
              :size="48"
            />
            <div style="flex:1;min-width:0">
              <div class="flex-between">
                <b>{{ conv.otherUser?.nickname || '未知' }}</b>
                <span class="text-secondary" style="font-size:11px">{{ timeAgo(conv.updatedAt) }}</span>
              </div>
              <div class="text-secondary" style="font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                {{ conv.lastMessage?.content || '' }}
              </div>
            </div>
            <div v-if="conv.unreadCount" class="unread-badge">{{ conv.unreadCount }}</div>
          </div>
        </div>
      </div>

      <!-- 通知列表 -->
      <div v-else>
        <div class="flex-between mb-2">
          <span></span>
          <button
            v-if="notificationStore.unreadCount > 0"
            class="btn btn-sm"
            @click="notificationStore.markAllAsRead()"
          >
            全部已读
          </button>
        </div>

        <LoadingSpinner v-if="notificationStore.loading && notificationStore.notifications.length === 0" message="加载中..." />
        <EmptyState
          v-else-if="!notificationStore.loading && notificationStore.notifications.length === 0"
          :icon="Bell"
          message="暂无通知"
        />
        <div v-else>
          <div
            v-for="item in notificationStore.notifications"
            :key="item.id"
            class="notification-item card"
            :class="{ 'is-unread': !item.isRead }"
            @click="handleNotificationClick(item)"
          >
            <div class="flex gap-2">
              <UserAvatar
                :src="item.fromUser?.avatarUrl"
                :name="item.fromUser?.nickname || '?'"
                :size="40"
                @click.stop="goToUserProfile(item.fromUserId)"
              />
              <div class="notification-content">
                <div class="notification-header">
                  <span class="notification-type" :class="getTypeClass(item.type)">
                    {{ getTypeLabel(item.type) }}
                  </span>
                  <span v-if="!item.isRead" class="unread-dot"></span>
                </div>
                <div class="notification-text">
                  <span class="from-user" @click.stop="goToUserProfile(item.fromUserId)">
                    {{ item.fromUser?.nickname || '用户' }}
                  </span>
                  {{ item.content }}
                </div>
                <div class="notification-time">{{ timeAgo(item.createdAt) }}</div>
              </div>
            </div>
          </div>

          <p v-if="notificationStore.hasMore" class="text-center mt-2">
            <button
              class="btn btn-sm"
              @click="notificationStore.loadMore()"
              :disabled="notificationStore.loading"
            >
              加载更多
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MessageCircle, Bell } from 'lucide-vue-next'
import { useChatStore } from '../../stores/chat'
import { useNotificationStore } from '../../stores/notification'
import { onStateChange } from '../../services/websocket'
import UserAvatar from '../../components/UserAvatar.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'

const router = useRouter()
const chat = useChatStore()
const notificationStore = useNotificationStore()
const wsState = ref('disconnected')
const activeTab = ref('chat')

onMounted(async () => {
  onStateChange((s) => { wsState.value = s })
  await chat.loadConversations()
  notificationStore.loadNotifications(1)
})

function getTypeLabel(type) {
  const labels = {
    FOLLOW: '关注',
    COMMENT: '评论',
    LIKE: '点赞',
    REPLY: '回复'
  }
  return labels[type] || type
}

function getTypeClass(type) {
  return `type-${type?.toLowerCase() || 'default'}`
}

function timeAgo(d) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  if (mins < 1440) return `${Math.floor(mins / 60)}小时前`
  return `${Math.floor(mins / 1440)}天前`
}

function handleNotificationClick(item) {
  if (!item.isRead) {
    notificationStore.markAsRead(item.id)
  }
  if (item.type === 'FOLLOW') {
    goToUserProfile(item.fromUserId)
  }
}

function goToUserProfile(userId) {
  if (!userId) return
  router.push(`/profile/${userId}`)
}
</script>

<style scoped>
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Tab 样式 */
.tabs {
  display: flex;
  border-bottom: 1px solid var(--divider);
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.tab-btn {
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.tab-btn.active {
  color: var(--primary);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: var(--primary);
  border-radius: 2px;
}

.tab-badge {
  display: inline-block;
  background: var(--error);
  color: #fff;
  border-radius: 10px;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 700;
  margin-left: 4px;
  min-width: 16px;
  text-align: center;
}

/* 会话列表样式 */
.conv-item { cursor: pointer; }
.conv-item:active { background: var(--bg); }
.unread-badge { background: var(--error); color: #fff; border-radius: 10px; padding: 2px 7px; font-size: 11px; font-weight: 700; align-self: center; }

/* 通知列表样式 */
.notification-item {
  padding: 12px 16px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: var(--hover);
}

.notification-item.is-unread {
  background-color: rgba(var(--primary-rgb, 59, 130, 246), 0.05);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.notification-type {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.type-follow {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.type-comment {
  background-color: #dcfce7;
  color: #15803d;
}

.type-like {
  background-color: #fce7f3;
  color: #be185d;
}

.type-reply {
  background-color: #fef3c7;
  color: #b45309;
}

.type-default {
  background-color: #f3f4f6;
  color: #4b5563;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--primary);
}

.notification-text {
  font-size: 14px;
  line-height: 1.5;
  color: var(--text);
}

.from-user {
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
}

.from-user:hover {
  text-decoration: underline;
}

.notification-time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}
</style>