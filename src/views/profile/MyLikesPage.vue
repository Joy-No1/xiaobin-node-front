<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <span class="back-arrow">‹</span>
      </button>
      <h1>我赞过的</h1>
      <span></span>
    </div>
    <div class="page-body">
      <LoadingSpinner v-if="isLikesLoading && likesList.length === 0" />
      <EmptyState v-else-if="likesList.length === 0" :icon="Heart" message="还没有赞过任何帖子" />
      <div v-else>
        <div v-for="item in likesList" :key="item.postId" class="like-card card fade-in">
          <div class="post-header" @click="goToProfile(item.postUser.id)">
            <UserAvatar :src="item.postUser?.avatarUrl" :name="item.postUser?.nickname || '?'" :size="40" />
            <span class="post-user-name">{{ item.postUser.nickname }}</span>
          </div>
          <div class="post-body" @click="goToPost(item.postId)">
            <div class="post-text" v-if="item.content">{{ item.content }}</div>
            <div class="post-images" v-if="item.images?.length">
              <img v-for="(img, i) in item.images" :key="i" :src="img" class="post-img" loading="lazy" />
            </div>
            <div class="post-meta">
              <span><Heart :size="14" class="meta-icon" /> {{ item.likeCount }}</span>
              <span><MessageCircle :size="14" class="meta-icon" /> {{ item.commentCount }}</span>
              <span>{{ timeAgo(item.postCreatedAt) }}</span>
            </div>
          </div>
        </div>
        <p v-if="hasMore" class="text-center mt-2">
          <button class="btn btn-sm" @click="loadMore()" :disabled="isLikesLoading">加载更多</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '../../services/api'
import UserAvatar from '../../components/UserAvatar.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { Heart, MessageCircle } from 'lucide-vue-next'

const router = useRouter()
const likesList = ref([])
const hasMore = ref(false)
const currentPage = ref(1)
const isLikesLoading = ref(false)

onMounted(() => loadLikes(1))

async function loadLikes(pageNum = 1) {
  isLikesLoading.value = true
  try {
    const data = await api.getMyLikes(pageNum)
    const records = data?.records || data || []
    if (pageNum === 1) likesList.value = records
    else likesList.value.push(...records)
    currentPage.value = pageNum
    hasMore.value = pageNum < (data?.pages || 999)
  } catch (e) {
    console.error('加载点赞列表失败:', e)
  }
  isLikesLoading.value = false
}

function loadMore() {
  loadLikes(currentPage.value + 1)
}

function goToProfile(userId) {
  router.push(`/profile/${userId}`)
}

function goToPost(postId) {
  router.push(`/square/post/${postId}`)
}

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
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-header h1 {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #e8e8e8;
}

.back-arrow {
  font-size: 28px;
  font-weight: 300;
  color: #333;
  line-height: 1;
  margin-top: -2px;
}

.post-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px 8px; cursor: pointer; }
.post-user-name { font-size: 14px; font-weight: 600; }
.post-body { padding: 0 16px 12px; cursor: pointer; }
.post-text { font-size: 15px; line-height: 1.6; margin-bottom: 8px; word-break: break-word; }
.post-images { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-top: 8px; }
.post-img { width: 100%; height: 90px; object-fit: cover; border-radius: 6px; }
.post-meta { display: flex; gap: 16px; margin-top: 8px; font-size: 12px; color: var(--text-secondary); align-items: center; }
.meta-icon { vertical-align: middle; margin-right: 2px; }
</style>