<template>
  <div class="comment-item" :class="{ 'is-reply': isReply }">
    <UserAvatar
      :src="comment.user?.avatarUrl"
      :name="comment.user?.nickname || '?'"
      :size="32"
    />
    <div class="comment-body">
      <div class="comment-header">
        <b>{{ comment.user?.nickname || '匿名' }}</b>
        <template v-if="comment.replyToUser">
          <span class="text-secondary"> 回复 </span>
          <b class="text-primary">{{ comment.replyToUser?.nickname }}</b>
        </template>
        <span class="comment-time">{{ timeAgo(comment.createdAt) }}</span>
      </div>
      <div class="comment-content">{{ comment.content }}</div>
      <span v-if="!isReply" class="reply-btn" @click="$emit('reply')">回复</span>
    </div>
  </div>
</template>

<script setup>
import UserAvatar from './UserAvatar.vue'

defineProps({
  comment: { type: Object, required: true },
  isReply: { type: Boolean, default: false }
})
defineEmits(['reply'])

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
.comment-item {
  display: flex;
  gap: 10px;
  padding: 10px 16px;
}
.is-reply { padding-left: 52px; }
.comment-body { flex: 1; min-width: 0; }
.comment-header { font-size: 13px; margin-bottom: 4px; display: flex; flex-wrap: wrap; gap: 4px; align-items: baseline; }
.comment-time { color: var(--text-secondary); font-size: 11px; margin-left: auto; }
.comment-content { font-size: 14px; line-height: 1.5; word-break: break-word; }
.reply-btn { color: var(--primary); font-size: 12px; cursor: pointer; margin-top: 4px; display: inline-block; }
</style>
