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
  // 用户信息缓存 Map<userId, userInfo>
  const userCache = ref({})

  async function loadPosts(pageNum = 1) {
    if (pageNum === 1) {
      loading.value = true
      posts.value = []
    }
    const data = await api.getPosts(pageNum)
    const records = data.records || []
    if (pageNum === 1) posts.value = records
    else posts.value.push(...records)
    page.value = pageNum
    hasMore.value = pageNum < data.pages
    loading.value = false
    
    // 批量获取用户信息
    await fetchUsersForPosts(records)
    
    return data
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
    return currentPost.value
  }

  async function create(data) {
    const fd = new FormData()
    fd.append('content', data.content)
    if (data.images) data.images.forEach(url => fd.append('images', url))
    if (data.location) fd.append('location', data.location)
    return api.createPost(fd)
  }

  async function update(id, data) {
    const fd = new FormData()
    if (data.content !== undefined) fd.append('content', data.content)
    if (data.images) data.images.forEach(url => fd.append('images', url))
    if (data.location !== undefined) fd.append('location', data.location)
    return api.updatePost(id, fd)
  }

  async function deletePost(id) {
    await api.deletePost(id)
    // 从列表中移除
    posts.value = posts.value.filter(p => p.id !== id)
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

  // 批量获取帖子对应的用户信息
  async function fetchUsersForPosts(postList) {
    const userIds = [...new Set(postList.map(p => p.userId).filter(Boolean))]
    if (userIds.length === 0) return
    
    // 过滤出缓存中没有的用户ID
    const needFetch = userIds.filter(id => !userCache.value[id])
    if (needFetch.length === 0) return
    
    try {
      const userMap = await api.getUsersByIds(needFetch)
      if (userMap) {
        Object.assign(userCache.value, userMap)
      }
    } catch (e) {
      console.error('批量获取用户信息失败:', e)
    }
  }

  // 根据userId获取用户信息
  function getUserById(userId) {
    return userCache.value[userId] || null
  }

  return {
    posts, currentPost, comments, page, hasMore, loading, userCache,
    loadPosts, loadMore, refresh, loadPostDetail, create, update, deletePost,
    toggleLike, loadComments, addComment, fetchUsersForPosts, getUserById
  }
})