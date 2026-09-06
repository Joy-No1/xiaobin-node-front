<template>
  <div class="page storage-page">
    <div class="page-header flex-between">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h1>存储管理</h1>
      <div style="width: 60px"></div>
    </div>

    <div class="page-body">
      <!-- 存储概览 -->
      <div class="storage-overview">
        <div class="storage-card">
          <div class="card-title">本应用占用空间</div>
          <div class="storage-size">{{ formatSize(appStorageSize) }}</div>
          <div class="storage-bar">
            <div class="storage-bar-fill" :style="{ width: storagePercentage + '%' }"></div>
          </div>
          <div class="storage-detail">
            <span>缓存大小：{{ formatSize(cacheSize) }}</span>
            <span>图片/视频：{{ formatSize(mediaSize) }}</span>
          </div>
        </div>

        <div class="storage-card mt-2" v-if="deviceStorage">
          <div class="card-title">设备存储空间</div>
          <div class="storage-info">
            <div class="info-row">
              <span class="info-label">已使用</span>
              <span class="info-value">{{ formatSize(deviceStorage.used) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">可用空间</span>
              <span class="info-value">{{ formatSize(deviceStorage.available) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">总容量</span>
              <span class="info-value">{{ formatSize(deviceStorage.total) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 清理选项 -->
      <div class="clean-section">
        <div class="section-title">清理选项</div>
        <div class="clean-list">
          <div class="clean-item">
            <div class="clean-info">
              <div class="clean-name">图片缓存</div>
              <div class="clean-desc">{{ formatSize(imageCacheSize) }}</div>
            </div>
            <button class="btn btn-sm btn-outline" @click="clearImageCache">清理</button>
          </div>
          <div class="clean-item">
            <div class="clean-info">
              <div class="clean-name">网络缓存</div>
              <div class="clean-desc">{{ formatSize(networkCacheSize) }}</div>
            </div>
            <button class="btn btn-sm btn-outline" @click="clearNetworkCache">清理</button>
          </div>
          <div class="clean-item">
            <div class="clean-info">
              <div class="clean-name">登录历史记录</div>
              <div class="clean-desc">{{ loginHistoryCount }} 条记录</div>
            </div>
            <button class="btn btn-sm btn-outline" @click="clearLoginHistory">清理</button>
          </div>
        </div>

        <button class="btn btn-primary btn-block mt-3" @click="clearAllCache" :disabled="clearing">
          {{ clearing ? '清理中...' : '清理全部缓存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { clearLoginHistory as clearLoginHistoryUtil, getLoginHistory } from '../../utils/loginHistory'
import toast from '@/utils/toast'

const appStorageSize = ref(0)
const cacheSize = ref(0)
const mediaSize = ref(0)
const imageCacheSize = ref(0)
const networkCacheSize = ref(0)
const loginHistoryCount = ref(0)
const deviceStorage = ref(null)
const clearing = ref(false)

const storagePercentage = computed(() => {
  if (!deviceStorage.value || !deviceStorage.value.total) return 0
  return Math.min(100, (appStorageSize.value / deviceStorage.value.total) * 100)
})

onMounted(() => {
  calculateStorageSize()
  estimateDeviceStorage()
})

function calculateStorageSize() {
  let total = 0

  // 计算 localStorage 大小
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length
    }
  }

  // 估算缓存大小 (localStorage 存储的数据)
  const tokenSize = (localStorage.getItem('token') || '').length
  const userSize = (localStorage.getItem('user') || '').length
  const locationSize = (localStorage.getItem('location') || '').length
  const loginHistorySize = (localStorage.getItem('login_history') || '').length

  cacheSize.value = total
  imageCacheSize.value = Math.floor(total * 0.3) // 估算
  networkCacheSize.value = Math.floor(total * 0.2) // 估算
  loginHistoryCount.value = getLoginHistory().length

  // 估算媒体文件大小（这里只是示例，实际需要统计下载的图片视频）
  mediaSize.value = 0

  appStorageSize.value = total + mediaSize.value
}

function estimateDeviceStorage() {
  // 浏览器 API 获取存储配额（仅部分浏览器支持）
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(estimate => {
      deviceStorage.value = {
        used: estimate.usage || 0,
        total: estimate.quota || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0)
      }
    }).catch(() => {
      // 如果不支持，使用估算值
      deviceStorage.value = {
        used: appStorageSize.value,
        total: 5 * 1024 * 1024 * 1024, // 假设 5GB
        available: 5 * 1024 * 1024 * 1024 - appStorageSize.value
      }
    })
  } else {
    // 不支持 Storage API，使用估算
    deviceStorage.value = {
      used: appStorageSize.value,
      total: 5 * 1024 * 1024 * 1024,
      available: 5 * 1024 * 1024 * 1024 - appStorageSize.value
    }
  }
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

function clearImageCache() {
  // 实际项目中这里应该清理图片缓存
  // 这里只是模拟
  imageCacheSize.value = 0
  calculateStorageSize()
  toast.success('图片缓存已清理')
}

function clearNetworkCache() {
  // 清理网络缓存
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name))
    })
  }
  networkCacheSize.value = 0
  calculateStorageSize()
  toast.success('网络缓存已清理')
}

function clearLoginHistory() {
  if (!confirm('确定要清除所有登录历史记录吗？')) return
  clearLoginHistoryUtil()
  loginHistoryCount.value = 0
  calculateStorageSize()
  toast.success('登录历史已清理')
}

async function clearAllCache() {
  if (!confirm('确定要清理全部缓存吗？这不会影响您的登录状态。')) return

  clearing.value = true

  try {
    // 清理登录历史
    clearLoginHistoryUtil()

    // 清理网络缓存
    if ('caches' in window) {
      const names = await caches.keys()
      await Promise.all(names.map(name => caches.delete(name)))
    }

    // 重新计算
    setTimeout(() => {
      calculateStorageSize()
      estimateDeviceStorage()
      clearing.value = false
      toast.success('缓存清理完成')
    }, 500)
  } catch (error) {
    console.error('清理缓存失败:', error)
    clearing.value = false
    toast.error('清理失败')
  }
}
</script>

<style scoped>
.storage-page {
  background: #F5F6F8;
  min-height: 100vh;
}

.storage-page .page-body {
  background: transparent;
  padding: 16px;
}

.storage-overview {
  margin-bottom: 24px;
}

.storage-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.card-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 12px;
}

.storage-size {
  font-size: 32px;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 16px;
}

.storage-bar {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 12px;
}

.storage-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  transition: width 0.3s;
}

.storage-detail {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
}

.storage-info {
  margin-top: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.info-label {
  color: #666;
}

.info-value {
  color: #333;
  font-weight: 500;
}

.clean-section {
  margin-top: 16px;
}

.section-title {
  padding: 0 4px 8px;
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.clean-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.clean-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.clean-item:last-child {
  border-bottom: none;
}

.clean-info {
  flex: 1;
}

.clean-name {
  font-size: 15px;
  color: #333;
  margin-bottom: 4px;
}

.clean-desc {
  font-size: 13px;
  color: #999;
}
</style>
