<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <span class="back-arrow">‹</span>
      </button>
      <h1>我的评论</h1>
      <span></span>
    </div>
    <div class="page-body">
      <LoadingSpinner v-if="isCommentsLoading && commentsList.length === 0" />
      <EmptyState v-else-if="commentsList.length === 0" :icon="MessageCircle" message="还没有发表过评论" />
      <div v-else>
        <div v-for="item in commentsList" :key="item.id" class="comment-card card fade-in">
          <div class="comment-header" @click="goToProfile(item.postUser.id)">
            <UserAvatar :src="item.postUser?.avatarUrl" :name="item.postUser?.nickname || '?'" :size="36" />
            <span class="post-user-name">{{ item.postUser.nickname }}</span>
            <button class="btn btn-xs text-danger" @click.stop="handleDelete(item)">删除</button>
          </div>
          <div class="comment-body">
            <div class="comment-post" @click="goToPost(item.postId)">
              <span class="label">帖子：</span>{{ item.postContent }}
            </div>
            <div class="comment-text">{{ item.content }}</div>
            <div class="comment-time">{{ timeAgo(item.createdAt) }}</div>
          </div>
        </div>
        <p v-if="hasMore" class="text-center mt-2">
          <button class="btn btn-sm" @click="loadMore()" :disabled="isCommentsLoading">加载更多</button>
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
import { MessageCircle } from 'lucide-vue-next'
import toast from '@/utils/toast'

const router = useRouter()
const commentsList = ref([])
const hasMore = ref(false)
const currentPage = ref(1)
const isCommentsLoading = ref(false)

onMounted(() => loadComments(1))

async function loadComments(pageNum = 1) {
  isCommentsLoading.value = true
  try {
    const data = await api.getMyComments(pageNum)
    const records = data?.records || data || []
    if (pageNum === 1) commentsList.value = records
    else commentsList.value.push(...records)
    currentPage.value = pageNum
    hasMore.value = pageNum < (data?.pages || 999)
  } catch (e) {
    console.error('加载评论列表失败:', e)
  }
  isCommentsLoading.value = false
}

function loadMore() {
  loadComments(currentPage.value + 1)
}

function goToProfile(userId) {
  router.push(`/profile/${userId}`)
}

function goToPost(postId) {
  router.push(`/square/post/${postId}`)
}

async function handleDelete(item) {
  if (!confirm('确定要删除这条评论吗？')) return
  try {
    await api.deleteComment(item.id)
    commentsList.value = commentsList.value.filter(c => c.id !== item.id)
  } catch (e) {
    toast.error('删除失败')
  }
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

.comment-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px 8px; }
.post-user-name { font-size: 14px; font-weight: 600; cursor: pointer; }
.btn-xs { padding: 2px 8px; font-size: 12px; }
.comment-body { padding: 0 16px 12px; }
.comment-post { font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; cursor: pointer; }
.comment-post .label { color: var(--text-secondary); }
.comment-text { font-size: 15px; line-height: 1.6; padding: 10px; background: var(--bg); border-radius: 8px; }
.comment-time { font-size: 12px; color: var(--text-secondary); margin-top: 8px; text-align: right; }
.text-danger { color: var(--error); }
</style>