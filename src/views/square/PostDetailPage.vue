<template>
  <div class="page">
    <div class="page-header flex-between">
      <div class="flex gap-2">
        <button class="btn btn-sm" @click="$router.back()">← 返回</button>
        <h1>帖子详情</h1>
      </div>
      <!-- 自己的帖子显示更多操作 -->
      <div v-if="isMyPost" class="post-menu">
        <button class="menu-btn btn btn-sm" @click="showMenu = !showMenu">⋮</button>
        <div v-if="showMenu" class="menu-dropdown">
          <button class="menu-item" @click="startEdit"><PenLine :size="14" class="inline-icon" /> 编辑</button>
          <button class="menu-item text-danger" @click="handleDelete"><Trash2 :size="14" class="inline-icon" /> 删除</button>
        </div>
      </div>
    </div>
    <div class="page-body">
      <LoadingSpinner v-if="loading" message="加载中..." />
      <ErrorState v-else-if="error" :message="error" @retry="loadPost" />

      <div v-else-if="post">
        <!-- 用户信息卡片 -->
        <div class="user-card card">
          <div class="flex gap-2">
            <UserAvatar
              :src="postUser?.avatarUrl"
              :name="postUser?.nickname || '?'"
              :size="48"
              @click="goToUserProfile"
            />
            <div class="user-info">
              <div class="user-name" @click="goToUserProfile">
                {{ postUser?.nickname || '匿名用户' }}
              </div>
              <div class="post-time">
                {{ formatTime(post.createdAt) }}
                <span v-if="isEdited" class="edited-tag">（已编辑）</span>
              </div>
            </div>
            <!-- 关注按钮（不显示给自己的帖子） -->
            <button
              v-if="showFollowButton"
              class="btn btn-sm follow-btn"
              :class="{ 'btn-primary': !isFollowing, 'btn-outline': isFollowing }"
              @click="toggleFollow"
              :disabled="followLoading"
            >
              {{ followLoading ? '...' : (isFollowing ? '已关注' : '关注') }}
            </button>
          </div>
          <!-- 位置信息 -->
          <div v-if="post.location" class="post-location mt-1">
            <MapPin :size="12" class="inline-icon" /> {{ post.location }}
          </div>
        </div>

        <!-- 帖子内容 -->
        <div class="card post-detail-card">
          <div v-if="post.content" class="post-content">{{ post.content }}</div>

          <!-- 图片 -->
          <div v-if="validImages.length" class="post-images">
            <img
              v-for="(img, i) in validImages"
              :key="i"
              :src="img"
              class="post-img"
              :class="{ 'post-img-single': validImages.length === 1 }"
              loading="lazy"
              @click="previewImage(img)"
            />
          </div>

          <!-- 操作栏 -->
          <div class="post-actions">
            <span class="action-btn" :class="{ 'text-primary': post.isLiked }" @click="toggleLike">
              <Heart v-if="post.isLiked" :size="16" :fill="'currentColor'" />
              <Heart v-else :size="16" />
              <span>{{ post.likeCount || 0 }}</span>
            </span>
            <span class="action-btn">
              <MessageCircle :size="16" /> <span>{{ post.commentCount || 0 }}</span>
            </span>
          </div>
        </div>

        <!-- 评论区 -->
        <h3 class="mt-2 mb-1">评论 ({{ post.commentCount || 0 }})</h3>

        <LoadingSpinner v-if="commentsLoading && commentList.length === 0" />
        <EmptyState
          v-else-if="commentList.length === 0"
          :icon="MessageCircle"
          message="暂无评论，快来抢沙发~"
        />
        <div v-else>
          <CommentItem
            v-for="c in commentList"
            :key="c.id"
            :comment="c"
            @reply="startReply(c)"
          />
        </div>

        <p v-if="commentsHasMore" class="text-center mt-2">
          <button class="btn btn-sm" @click="loadMoreComments" :disabled="commentsLoading">
            加载更多评论
          </button>
        </p>
      </div>
    </div>

    <!-- 评论输入栏 -->
    <div v-if="post" class="comment-bar">
      <div v-if="replyTo" class="reply-hint">
        回复 @{{ replyTo.user?.nickname || '用户' }}
        <span class="cancel-reply" @click="replyTo = null">✕</span>
      </div>
      <div class="flex gap-1">
        <input
          v-model="commentText"
          class="form-input"
          placeholder="写评论..."
          style="flex:1"
          @keyup.enter="sendComment"
        />
        <button class="btn btn-primary btn-sm" @click="sendComment" :disabled="!commentText.trim()">
          发送
        </button>
      </div>
    </div>

    <!-- 编辑帖子弹窗 -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <h3>编辑帖子</h3>
        <textarea v-model="editContent" class="form-input" rows="4" placeholder="说点什么..."></textarea>
        <div class="modal-actions">
          <button class="btn" @click="showEditModal = false">取消</button>
          <button class="btn btn-primary" @click="submitEdit" :disabled="editLoading">
            {{ editLoading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '../../stores/post'
import { useAuthStore } from '../../stores/auth'
import * as api from '../../services/api'
import CommentItem from '../../components/CommentItem.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import ErrorState from '../../components/ErrorState.vue'
import UserAvatar from '../../components/UserAvatar.vue'
import { PenLine, Trash2, MapPin, Heart, MessageCircle } from 'lucide-vue-next'
import toast from '@/utils/toast'

const props = defineProps({ postId: [Number, String] })
const router = useRouter()
const postStore = usePostStore()
const authStore = useAuthStore()

const post = ref(null)
const postUser = ref(null)
const commentList = ref([])
const commentText = ref('')
const replyTo = ref(null)
const loading = ref(true)
const error = ref(null)
const commentsLoading = ref(false)
const commentsHasMore = ref(false)
const followLoading = ref(false)
const isFollowing = ref(false)
const showMenu = ref(false)
const showEditModal = ref(false)
const editContent = ref('')
const editLoading = ref(false)

// 是否是自己的帖子
const isMyPost = computed(() => {
  if (!post.value || !authStore.user?.id) return false
  return post.value.userId === authStore.user.id
})

// 是否被编辑过
const isEdited = computed(() => {
  if (!post.value?.updatedAt || !post.value?.createdAt) return false
  return new Date(post.value.updatedAt) > new Date(post.value.createdAt)
})

// 是否显示关注按钮
const showFollowButton = computed(() => {
  if (!post.value || !postUser.value) return false
  const currentUserId = authStore.user?.id
  const postUserId = post.value.userId
  return currentUserId && postUserId && currentUserId !== postUserId
})

// 过滤有效图片（排除 "null" 字符串）
const validImages = computed(() => {
  if (!post.value?.images?.length) return []
  return post.value.images.filter(img => img && img !== 'null')
})

onMounted(() => {
  loadPost()
})

async function loadPost() {
  loading.value = true
  error.value = null
  
  const id = props.postId
  if (!id) {
    error.value = '帖子ID无效'
    loading.value = false
    return
  }

  try {
    post.value = await api.getPostDetail(id)
    
    // 获取发帖用户信息
    if (post.value?.userId) {
      await fetchPostUser(post.value.userId)
    }
  } catch (e) {
    console.error('加载帖子失败:', e)
    error.value = '加载帖子失败，请稍后重试'
  }
  loading.value = false
  await loadComments()
}

async function fetchPostUser(userId) {
  try {
    // 先检查缓存
    const cached = postStore.getUserById(userId)
    if (cached) {
      postUser.value = cached
    } else {
      const userProfile = await api.getUserProfile(userId)
      postUser.value = userProfile
      // 更新缓存
      if (userProfile) {
        postStore.userCache[userId] = userProfile
      }
    }
    // 检查是否已关注
    isFollowing.value = postUser.value?.isFollowing || false
  } catch (e) {
    console.error('获取用户信息失败:', e)
  }
}

async function toggleFollow() {
  const userId = post.value?.userId
  if (!userId) return
  followLoading.value = true
  try {
    if (isFollowing.value) {
      await api.unfollowUser(userId)
      isFollowing.value = false
      if (postUser.value) postUser.value.isFollowing = false
    } else {
      await api.followUser(userId)
      isFollowing.value = true
      if (postUser.value) postUser.value.isFollowing = true
    }
  } catch (e) {
    console.error('关注操作失败:', e)
  }
  followLoading.value = false
}

function goToUserProfile() {
  const userId = post.value?.userId
  if (!userId) return
  router.push(`/profile/${userId}`)
}

async function toggleLike() {
  if (!post.value) return
  try {
    if (post.value.isLiked) {
      await api.unlikePost(post.value.id)
      post.value.isLiked = false
      post.value.likeCount--
    } else {
      await api.likePost(post.value.id)
      post.value.isLiked = true
      post.value.likeCount++
    }
  } catch (e) {
    console.error('点赞操作失败:', e)
  }
}

async function loadComments() {
  commentsLoading.value = true
  try {
    const result = await postStore.loadComments(props.postId, 1)
    commentList.value = result.records || []
    commentsHasMore.value = result.hasMore || false
  } catch (e) {
    console.error('加载评论失败:', e)
  }
  commentsLoading.value = false
}

async function loadMoreComments() {
  if (!commentsHasMore.value || commentsLoading.value) return
  commentsLoading.value = true
  try {
    const currentPage = Math.ceil(commentList.value.length / 20) + 1
    const result = await postStore.loadComments(props.postId, currentPage)
    commentList.value.push(...(result.records || []))
    commentsHasMore.value = result.hasMore || false
  } catch (e) {
    console.error('加载更多评论失败:', e)
  }
  commentsLoading.value = false
}

function startReply(comment) {
  replyTo.value = comment
  commentText.value = ''
}

async function sendComment() {
  if (!commentText.value.trim()) return
  try {
    await api.addComment(
      props.postId,
      commentText.value.trim(),
      replyTo.value?.user?.id,
      replyTo.value?.parentCommentId
    )
    commentText.value = ''
    replyTo.value = null
    if (post.value) {
      post.value.commentCount = (post.value.commentCount || 0) + 1
    }
    await loadComments()
  } catch (e) {
    console.error('发送评论失败:', e)
  }
}

function startEdit() {
  showMenu.value = false
  editContent.value = post.value?.content || ''
  showEditModal.value = true
}

async function submitEdit() {
  if (!post.value) return
  editLoading.value = true
  try {
    await postStore.update(post.value.id, { content: editContent.value })
    post.value.content = editContent.value
    post.value.edited = true
    post.value.updatedAt = new Date().toISOString()
    showEditModal.value = false
  } catch (e) {
    console.error('编辑帖子失败:', e)
    toast.error('编辑失败，请重试')
  }
  editLoading.value = false
}

async function handleDelete() {
  showMenu.value = false
  if (!confirm('确定要删除这条帖子吗？')) return
  try {
    await postStore.deletePost(post.value.id)
    router.back()
  } catch (e) {
    console.error('删除帖子失败:', e)
    toast.error('删除失败，请重试')
  }
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function previewImage(img) {
  window.open(img, '_blank')
}
</script>

<style scoped>
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

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

.user-card {
  margin-bottom: 12px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
}

.user-name:hover {
  color: var(--primary);
}

.post-time {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.edited-tag {
  font-size: 11px;
  opacity: 0.7;
}

.post-location {
  font-size: 12px;
  color: var(--text-secondary);
}

.follow-btn {
  margin-left: auto;
}

.post-detail-card {
  margin-bottom: 16px;
}

.post-content {
  font-size: 15px;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  margin-top: 12px;
}

.post-img {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.post-img:hover {
  transform: scale(1.02);
}

.post-img-single {
  height: 220px;
  grid-column: 1 / -1;
}

.post-actions {
  display: flex;
  gap: 24px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--divider);
}

.action-btn {
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: var(--hover);
}

.action-btn.text-primary {
  color: var(--primary);
}

.comment-bar {
  position: sticky;
  bottom: 0;
  background: var(--surface);
  padding: 10px 16px;
  border-top: 1px solid var(--divider);
  padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
}

.reply-hint {
  font-size: 12px;
  color: var(--primary);
  margin-bottom: 6px;
}

.cancel-reply {
  margin-left: 8px;
  cursor: pointer;
  opacity: 0.7;
}

.cancel-reply:hover {
  opacity: 1;
}

/* 编辑弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--surface);
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  max-width: 500px;
}

.modal-content h3 {
  margin: 0 0 16px 0;
}

.modal-content textarea {
  width: 100%;
  resize: vertical;
  margin-bottom: 16px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>