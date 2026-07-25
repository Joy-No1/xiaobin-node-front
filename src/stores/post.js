import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../services/api'

export const usePostStore = defineStore('post', () => {
  const posts = ref([])
  const currentPost = ref(null)
  const comments = ref([])
  const page = ref(1)
  const hasMore = ref(true)
  const loading = ref(false)

  async function loadPosts(pageNum = 1) {
    if (pageNum === 1) {
      loading.value = true
      posts.value = []
    }
    const data = await api.getPosts(pageNum)
    if (pageNum === 1) posts.value = data.records || []
    else posts.value.push(...(data.records || []))
    page.value = pageNum
    hasMore.value = pageNum < data.pages
    loading.value = false
  }

  async function loadMore() {
    if (!hasMore.value || loading.value) return
    await loadPosts(page.value + 1)
  }

  async function refresh() {
    await loadPosts(1)
  }

  async function loadPostDetail(id) {
    currentPost.value = await api.getPostDetail(id)
  }

  async function create(data) {
    const fd = new FormData()
    fd.append('content', data.content)
    if (data.images) data.images.forEach(url => fd.append('images', url))
    if (data.location) fd.append('location', data.location)
    return api.createPost(fd)
  }

  async function toggleLike(post) {
    try {
      if (post.isLiked) {
        await api.unlikePost(post.id)
        post.isLiked = false
        post.likeCount--
      } else {
        await api.likePost(post.id)
        post.isLiked = true
        post.likeCount++
      }
    } catch (e) {
      // rollback
      post.isLiked = !post.isLiked
      post.likeCount += post.isLiked ? 1 : -1
    }
  }

  async function loadComments(postId, pageNum = 1) {
    const data = await api.getComments(postId, pageNum)
    if (pageNum === 1) comments.value = data.records || []
    else comments.value.push(...(data.records || []))
    return { records: data.records || [], hasMore: pageNum < data.pages }
  }

  async function addComment(postId, content, replyToUserId, parentCommentId) {
    await api.addComment(postId, content, replyToUserId, parentCommentId)
  }

  return {
    posts, currentPost, comments, page, hasMore, loading,
    loadPosts, loadMore, refresh, loadPostDetail, create,
    toggleLike, loadComments, addComment
  }
})
