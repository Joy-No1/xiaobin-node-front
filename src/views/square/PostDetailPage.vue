<template>
  <div class="page">
    <div class="page-header"><button class="btn btn-sm" @click="$router.back()">← 返回</button><h1>帖子详情</h1></div>
    <div class="page-body">
      <LoadingSpinner v-if="loading" message="加载中..." />

      <div v-else-if="post">
        <PostCard :post="post" @like="toggleLike" @user-click="$router.push(`/profile/${post.userId}`)" />

        <h3 class="mt-2 mb-1">评论 ({{ post.commentCount || 0 }})</h3>

        <LoadingSpinner v-if="commentsLoading" />
        <p v-else-if="commentList.length === 0" class="text-center text-secondary" style="padding:20px">暂无评论，快来抢沙发~</p>
        <CommentItem
          v-for="c in commentList"
          :key="c.id"
          :comment="c"
          @reply="startReply(c)"
        />
      </div>
    </div>

    <!-- 评论输入栏 -->
    <div class="comment-bar">
      <div v-if="replyTo" class="reply-hint">
        回复 @{{ replyTo.user?.nickname }}
        <span class="cancel-reply" @click="replyTo = null">✕</span>
      </div>
      <div class="flex gap-1">
        <input v-model="commentText" class="form-input" placeholder="写评论..." style="flex:1" @keyup.enter="sendComment" />
        <button class="btn btn-primary btn-sm" @click="sendComment">发送</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePostStore } from '../../stores/post'
import * as api from '../../services/api'
import PostCard from '../../components/PostCard.vue'
import CommentItem from '../../components/CommentItem.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'

const props = defineProps({ postId: Number })
const postStore = usePostStore()
const post = ref(null)
const commentList = ref([])
const commentText = ref('')
const replyTo = ref(null)
const loading = ref(true)
const commentsLoading = ref(false)

onMounted(async () => {
  try {
    post.value = await api.getPostDetail(props.postId)
  } catch (e) { /* */ }
  loading.value = false
  await loadComments()
})

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
  } catch (e) { /* */ }
}

async function loadComments() {
  commentsLoading.value = true
  const result = await postStore.loadComments(props.postId, 1)
  commentList.value = result.records
  commentsLoading.value = false
}

function startReply(comment) {
  replyTo.value = comment
  commentText.value = ''
}

async function sendComment() {
  if (!commentText.value.trim()) return
  await api.addComment(
    props.postId,
    commentText.value.trim(),
    replyTo.value?.userId,
    replyTo.value?.parentCommentId
  )
  commentText.value = ''
  replyTo.value = null
  await loadComments()
}
</script>

<style scoped>
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
.cancel-reply { margin-left: 8px; cursor: pointer; }
</style>
