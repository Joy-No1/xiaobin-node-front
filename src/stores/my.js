import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as api from '../services/api'

export const useMyStore = defineStore('my', () => {
  const followingList = ref([])
  const likesList = ref([])
  const commentsList = ref([])
  const page = ref({ following: 1, likes: 1, comments: 1 })
  const hasMore = ref({ following: true, likes: true, comments: true })
  const loading = ref({ following: false, likes: false, comments: false })

  async function loadFollowing(pageNum = 1) {
    if (pageNum === 1) {
      loading.value.following = true
      followingList.value = []
    }
    try {
      const data = await api.getMyFollowing(pageNum)
      const records = data?.records || data || []
      if (pageNum === 1) followingList.value = records
      else followingList.value.push(...records)
      page.value.following = pageNum
      hasMore.value.following = pageNum < (data?.pages || 999)
    } catch (e) {
      console.error('加载关注列表失败:', e)
    }
    loading.value.following = false
    return followingList.value
  }

  async function loadLikes(pageNum = 1) {
    if (pageNum === 1) {
      loading.value.likes = true
      likesList.value = []
    }
    try {
      const data = await api.getMyLikes(pageNum)
      const records = data?.records || data || []
      if (pageNum === 1) likesList.value = records
      else likesList.value.push(...records)
      page.value.likes = pageNum
      hasMore.value.likes = pageNum < (data?.pages || 999)
    } catch (e) {
      console.error('加载点赞列表失败:', e)
    }
    loading.value.likes = false
    return likesList.value
  }

  async function loadComments(pageNum = 1) {
    if (pageNum === 1) {
      loading.value.comments = true
      commentsList.value = []
    }
    try {
      const data = await api.getMyComments(pageNum)
      const records = data?.records || data || []
      if (pageNum === 1) commentsList.value = records
      else commentsList.value.push(...records)
      page.value.comments = pageNum
      hasMore.value.comments = pageNum < (data?.pages || 999)
    } catch (e) {
      console.error('加载评论列表失败:', e)
    }
    loading.value.comments = false
    return commentsList.value
  }

  async function unfollowUser(userId) {
    await api.unfollowUser(userId)
    followingList.value = followingList.value.filter(f => f.user?.id !== userId)
  }

  async function deleteComment(commentId) {
    await api.deleteComment(commentId)
    commentsList.value = commentsList.value.filter(c => c.id !== commentId)
  }

  return {
    followingList, likesList, commentsList,
    loadFollowing, loadLikes, loadComments,
    unfollowUser, deleteComment
  }
})
