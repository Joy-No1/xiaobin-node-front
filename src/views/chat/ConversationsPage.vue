<template>
  <div class="page">
    <div class="page-header flex-between">
      <h1>💬 聊天</h1>
      <span class="text-secondary" style="font-size:12px">
        {{ wsState === 'connected' ? '🟢 在线' : wsState === 'connecting' || wsState === 'reconnecting' ? '🟡 连接中' : '🔴 离线' }}
      </span>
    </div>
    <div class="page-body">
      <LoadingSpinner v-if="chat.loading" message="加载会话..." />
      <EmptyState
        v-else-if="chat.conversations.length === 0"
        icon="💬"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useChatStore } from '../../stores/chat'
import { onStateChange } from '../../services/websocket'
import UserAvatar from '../../components/UserAvatar.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'

const chat = useChatStore()
const wsState = ref('disconnected')

onMounted(async () => {
  onStateChange((s) => { wsState.value = s })
  await chat.loadConversations()
})

function timeAgo(d) {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  if (mins < 1440) return `${Math.floor(mins / 60)}小时前`
  return `${Math.floor(mins / 1440)}天前`
}
</script>

<style scoped>
.conv-item { cursor: pointer; }
.conv-item:active { background: var(--bg); }
.unread-badge { background: var(--error); color: #fff; border-radius: 10px; padding: 2px 7px; font-size: 11px; font-weight: 700; align-self: center; }
</style>
