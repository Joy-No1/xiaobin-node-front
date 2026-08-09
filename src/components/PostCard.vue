<template>
  <div class="card post-card fade-in" @click="$emit('click')">
    <!-- 用户行 -->
    <div class="flex gap-2">
      <UserAvatar
        :src="user?.avatarUrl"
        :name="user?.nickname || '?'"
        :size="40"
        @click.stop="$emit('user-click')"
      />
      <div class="user-info">
        <div class="post-author" @click.stop="$emit('user-click')">
          {{ user?.nickname || '匿名' }}
        </div>
        <div class="post-time">
          {{ timeAgo(post.createdAt) }}
          <span v-if="isEdited" class="edited-tag">（已编辑）</span>
        </div>
      </div>
      <!-- 自己的帖子显示更多操作 -->
      <div v-if="isMyPost" class="post-menu" @click.stop>
        <button class="menu-btn" @click="showMenu = !showMenu">⋮</button>
        <div v-if="showMenu" class="menu-dropdown">
          <button class="menu-item" @click="$emit('edit'); showMenu = false"><PenLine :size="14" class="inline-icon" /> 编辑</button>
          <button class="menu-item text-danger" @click="$emit('delete'); showMenu = false"><Trash2 :size="14" class="inline-icon" /> 删除</button>
        </div>
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
          <Heart v-if="post.isLiked" :size="16" :fill="'currentColor'" />
          <Heart v-else :size="16" />
        </span>
        {{ post.likeCount || 0 }}
      </span>
      <span class="action-btn">
        <MessageCircle :size="16" /> {{ post.commentCount || 0 }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import UserAvatar from './UserAvatar.vue'
import { PenLine, Trash2, Heart, MessageCircle } from 'lucide-vue-next'

const props = defineProps({
  post: { type: Object, required: true },
  user: { type: Object, default: null }
})
defineEmits(['click', 'like', 'user-click', 'delete', 'edit'])

const authStore = useAuthStore()
const showMenu = ref(false)

// 判断是否是自己的帖子
const isMyPost = computed(() => {
  const currentUserId = authStore.user?.id
  return currentUserId && props.post.userId === currentUserId
})

// 判断是否被编辑过
const isEdited = computed(() => {
  if (!props.post.updatedAt || !props.post.createdAt) return false
  return new Date(props.post.updatedAt) > new Date(props.post.createdAt)
})

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
.user-info { flex: 1; }
.post-author { font-size: 14px; font-weight: 600; cursor: pointer; }
.post-author:hover { color: var(--primary); }
.post-time { font-size: 12px; color: var(--text-secondary); }
.edited-tag { font-size: 11px; opacity: 0.7; }
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

/* 菜单样式 */
.post-menu {
  position: relative;
}
.menu-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  color: var(--text-secondary);
  border-radius: 4px;
}
.menu-btn:hover {
  background: var(--hover);
}
.menu-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--surface);
  border: 1px solid var(--divider);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 120px;
  z-index: 100;
  overflow: hidden;
}
.menu-item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}
.menu-item:hover {
  background: var(--hover);
}
.text-danger {
  color: #e53e3e;
}
</style>