import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const page = ref(1)
  const hasMore = ref(true)
  const loading = ref(false)
  const unreadCount = ref(0)

  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.isRead)
  )

  async function loadNotifications(pageNum = 1) {
    if (pageNum === 1) {
      loading.value = true
      notifications.value = []
    }
    try {
      const data = await api.getNotifications(pageNum)
      const records = data.records || []
      if (pageNum === 1) notifications.value = records
      else notifications.value.push(...records)
      page.value = pageNum
      hasMore.value = pageNum < data.pages
    } catch (e) {
      console.error('加载通知失败:', e)
    }
    loading.value = false
    return notifications.value
  }

  async function loadMore() {
    if (!hasMore.value || loading.value) return
    await loadNotifications(page.value + 1)
  }

  async function refresh() {
    await loadNotifications(1)
    await fetchUnreadCount()
  }

  async function markAsRead(id) {
    try {
      await api.markNotificationAsRead(id)
      const notification = notifications.value.find(n => n.id === id)
      if (notification && !notification.isRead) {
        notification.isRead = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (e) {
      console.error('标记已读失败:', e)
    }
  }

  async function markAllAsRead() {
    try {
      const unreadIds = unreadNotifications.value.map(n => n.id)
      await Promise.all(unreadIds.map(id => api.markNotificationAsRead(id)))
      notifications.value.forEach(n => n.isRead = true)
      unreadCount.value = 0
    } catch (e) {
      console.error('全部标记已读失败:', e)
    }
  }

  async function fetchUnreadCount() {
    try {
      const count = await api.getUnreadNotificationCount()
      unreadCount.value = count || 0
    } catch (e) {
      console.error('获取未读数失败:', e)
    }
  }

  return {
    notifications,
    page,
    hasMore,
    loading,
    unreadCount,
    unreadNotifications,
    loadNotifications,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead,
    fetchUnreadCount
  }
})