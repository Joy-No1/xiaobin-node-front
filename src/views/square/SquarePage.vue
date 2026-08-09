<template>
  <div class="page">
    <div class="page-header flex-between">
      <h1><Globe :size="20" class="inline-icon" /> 广场</h1>
      <router-link to="/square/create" class="btn btn-primary btn-sm"><PenSquare :size="14" class="inline-icon" /> 发布</router-link>
    </div>
    <div class="page-body">
      <LoadingSpinner v-if="postStore.loading && postStore.posts.length === 0" message="加载中..." />
      <EmptyState
        v-else-if="!postStore.loading && postStore.posts.length === 0"
        :icon="Camera"
        message="还没有动态，快去发布第一条吧"
      />
      <div v-else>
        <PostCard
          v-for="post in postStore.posts"
          :key="post.id"
          :post="post"
          :user="postStore.getUserById(post.userId)"
          @click="goToPostDetail(post)"
          @like="postStore.toggleLike(post)"
          @user-click="goToUserProfile(post)"
          @delete="handleDeletePost(post)"
          @edit="handleEditPost(post)"
        />
        <p v-if="postStore.hasMore" class="text-center mt-2">
          <button class="btn btn-sm" @click="postStore.loadMore()" :disabled="postStore.loading">
            加载更多
          </button>
        </p>
      </div>
    </div>

    <!-- 编辑帖子弹窗 -->
    <div v-if="editingPost" class="modal-overlay" @click.self="editingPost = null">
      <div class="modal-content">
        <h3>编辑帖子</h3>
        <textarea v-model="editContent" class="form-input" rows="4" placeholder="说点什么..."></textarea>
        <div class="modal-actions">
          <button class="btn" @click="editingPost = null">取消</button>
          <button class="btn btn-primary" @click="submitEdit" :disabled="editLoading">
            {{ editLoading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Globe, PenSquare, Camera } from 'lucide-vue-next'
import { usePostStore } from '../../stores/post'
import PostCard from '../../components/PostCard.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import toast from '@/utils/toast'

const router = useRouter()
const postStore = usePostStore()

const editingPost = ref(null)
const editContent = ref('')
const editLoading = ref(false)

onMounted(() => postStore.loadPosts(1))

function goToPostDetail(post) {
  if (!post?.id) {
    console.warn('帖子ID无效:', post)
    return
  }
  router.push(`/square/post/${post.id}`)
}

function goToUserProfile(post) {
  const userId = post?.userId
  if (!userId) {
    console.warn('用户ID无效:', post)
    return
  }
  router.push(`/profile/${userId}`)
}

async function handleDeletePost(post) {
  if (!confirm('确定要删除这条帖子吗？')) return
  try {
    await postStore.deletePost(post.id)
  } catch (e) {
    console.error('删除帖子失败:', e)
    toast.error('删除失败，请重试')
  }
}

function handleEditPost(post) {
  editingPost.value = post
  editContent.value = post.content || ''
}

async function submitEdit() {
  if (!editingPost.value) return
  editLoading.value = true
  try {
    await postStore.update(editingPost.value.id, { content: editContent.value })
    // 更新本地数据
    editingPost.value.content = editContent.value
    editingPost.value.edited = true
    editingPost.value.updatedAt = new Date().toISOString()
    editingPost.value = null
  } catch (e) {
    console.error('编辑帖子失败:', e)
    toast.error('编辑失败，请重试')
  }
  editLoading.value = false
}
</script>

<style scoped>
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