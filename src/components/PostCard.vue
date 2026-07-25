<template>
  <div class="card post-card fade-in" @click="$emit('click')">
    <!-- 用户行 -->
    <div class="flex gap-2">
      <UserAvatar
        :src="post.user?.avatarUrl"
        :name="post.user?.nickname || '?'"
        :size="40"
        @click.stop="$emit('user-click')"
      />
      <div>
        <div class="post-author">{{ post.user?.nickname || '匿名' }}</div>
        <div class="post-time">{{ timeAgo(post.createdAt) }}</div>
      </div>
    </div>

    <!-- 内容 -->
    <div class="post-content" v-if="post.content">{{ post.content }}</div>

    <!-- 图片 -->
    <div class="post-images" v-if="post.images?.length">
      <img
        v-for="(img, i) in post.images"
        :key="i"
        :src="img"
        class="post-img"
        :class="{ 'post-img-single': post.images.length === 1 }"
        loading="lazy"
      />
    </div>

    <!-- 操作栏 -->
    <div class="post-actions">
      <span class="action-btn" @click.stop="$emit('like')">
        <span :class="post.isLiked ? 'text-primary' : ''">
          {{ post.isLiked ? '❤️' : '🤍' }}
        </span>
        {{ post.likeCount || 0 }}
      </span>
      <span class="action-btn">
        💬 {{ post.commentCount || 0 }}
      </span>
    </div>
  </div>
</template>

<script setup>
import UserAvatar from './UserAvatar.vue'

defineProps({ post: { type: Object, required: true } })
defineEmits(['click', 'like', 'user-click'])

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  return `${Math.floor(hours / 24)}天前`
}
</script>

<style scoped>
.post-card { cursor: pointer; }
.post-author { font-size: 14px; font-weight: 600; }
.post-time { font-size: 12px; color: var(--text-secondary); }
.post-content { margin-top: 10px; font-size: 15px; line-height: 1.6; }
.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin-top: 10px;
}
.post-img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
}
.post-img-single {
  height: 200px;
  grid-column: 1 / -1;
}
.post-actions {
  display: flex;
  gap: 24px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--divider);
}
.action-btn {
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  user-select: none;
}
</style>
