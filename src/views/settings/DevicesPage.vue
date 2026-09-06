<template>
  <div class="page devices-page">
    <div class="page-header flex-between">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h1>登录设备管理</h1>
      <div style="width: 60px"></div>
    </div>

    <div class="page-body">
      <LoadingSpinner v-if="loading" />

      <div v-else>
        <!-- 当前设备 -->
        <div class="section-title">当前设备</div>
        <div v-if="currentDevice" class="device-card current">
          <div class="device-header">
            <div class="device-icon" :class="deviceTypeClass(currentDevice.deviceType)">
              {{ deviceTypeIcon(currentDevice.deviceType) }}
            </div>
            <div class="device-info">
              <div class="device-name">{{ currentDevice.deviceName }}</div>
              <div class="device-meta">
                <span v-if="currentDevice.osName">{{ currentDevice.osName }} {{ currentDevice.osVersion }}</span>
              </div>
            </div>
            <div class="current-badge">当前</div>
          </div>
          <div class="device-details">
            <div class="detail-row">
              <span class="detail-label">最后活跃</span>
              <span class="detail-value">{{ formatTime(currentDevice.lastActiveAt) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">IP地址</span>
              <span class="detail-value">{{ currentDevice.lastIp }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">登录时间</span>
              <span class="detail-value">{{ formatTime(currentDevice.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 其他设备 -->
        <div v-if="otherDevices.length > 0" class="section-title mt-3">其他设备</div>
        <div v-for="device in otherDevices" :key="device.id" class="device-card">
          <div class="device-header">
            <div class="device-icon" :class="deviceTypeClass(device.deviceType)">
              {{ deviceTypeIcon(device.deviceType) }}
            </div>
            <div class="device-info">
              <div class="device-name">{{ device.deviceName }}</div>
              <div class="device-meta">
                <span v-if="device.osName">{{ device.osName }} {{ device.osVersion }}</span>
                <span v-if="device.status === 0" class="status-disabled">已禁用</span>
              </div>
            </div>
          </div>
          <div class="device-details">
            <div class="detail-row">
              <span class="detail-label">最后活跃</span>
              <span class="detail-value">{{ formatTime(device.lastActiveAt) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">IP地址</span>
              <span class="detail-value">{{ device.lastIp }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">登录时间</span>
              <span class="detail-value">{{ formatTime(device.createdAt) }}</span>
            </div>
          </div>
          <div class="device-actions">
            <button
              v-if="device.status === 1"
              class="btn btn-sm btn-outline"
              @click="disableDevice(device)"
            >
              禁用
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="removeDevice(device)"
            >
              移除
            </button>
          </div>
        </div>

        <div v-if="otherDevices.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">📱</div>
          <div class="empty-text">暂无其他设备登录</div>
        </div>

        <!-- 安全提示 -->
        <div class="tips-card">
          <div class="tips-title">安全提示</div>
          <ul class="tips-list">
            <li>如果发现陌生设备，请立即移除并修改密码</li>
            <li>定期检查登录设备，保障账号安全</li>
            <li>禁用设备后，该设备将无法继续使用</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '../../services/api'
import { getCurrentDeviceId } from '../../utils/deviceInfo'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import toast from '@/utils/toast'

const router = useRouter()
const loading = ref(true)
const devices = ref([])

const currentDevice = computed(() => {
  return devices.value.find(d => d.isCurrent)
})

const otherDevices = computed(() => {
  return devices.value.filter(d => !d.isCurrent)
})

onMounted(async () => {
  await loadDevices()
})

async function loadDevices() {
  try {
    loading.value = true
    const currentDeviceId = getCurrentDeviceId()
    devices.value = await api.getDevices(currentDeviceId)
  } catch (error) {
    console.error('加载设备列表失败:', error)
    toast.error('加载失败')
  } finally {
    loading.value = false
  }
}

async function removeDevice(device) {
  if (!confirm(`确定要移除设备「${device.deviceName}」吗？移除后该设备将无法继续使用。`)) {
    return
  }

  try {
    await api.deleteDevice(device.id)
    toast.success('设备已移除')
    await loadDevices()
  } catch (error) {
    console.error('移除设备失败:', error)
    toast.error(error.response?.data?.message || '移除失败')
  }
}

async function disableDevice(device) {
  if (!confirm(`确定要禁用设备「${device.deviceName}」吗？禁用后该设备将无法继续使用。`)) {
    return
  }

  try {
    await api.updateDeviceStatus(device.id, 0)
    toast.success('设备已禁用')
    await loadDevices()
  } catch (error) {
    console.error('禁用设备失败:', error)
    toast.error(error.response?.data?.message || '禁用失败')
  }
}

function deviceTypeIcon(type) {
  const icons = {
    WEB: '💻',
    MOBILE_WEB: '📱',
    IOS: '📱',
    ANDROID: '📱',
    DESKTOP: '🖥️'
  }
  return icons[type] || '📱'
}

function deviceTypeClass(type) {
  return type.toLowerCase().replace('_', '-')
}

function formatTime(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  if (year === now.getFullYear()) {
    return `${month}-${day} ${hour}:${minute}`
  }
  return `${year}-${month}-${day} ${hour}:${minute}`
}
</script>

<style scoped>
.devices-page {
  background: #F5F6F8;
  min-height: 100vh;
}

.devices-page .page-body {
  background: transparent;
  padding: 16px;
  padding-bottom: 40px;
}

.section-title {
  padding: 0 4px 12px;
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.device-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.device-card.current {
  border: 2px solid #3b82f6;
}

.device-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.device-icon {
  width: 48px;
  height: 48px;
  background: #f0f0f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.device-icon.web,
.device-icon.mobile-web {
  background: linear-gradient(135deg, #e0e7ff, #ddd6fe);
}

.device-icon.ios {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

.device-icon.android {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.device-meta {
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-badge {
  background: #3b82f6;
  color: #fff;
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
}

.status-disabled {
  background: #fee2e2;
  color: #dc2626;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.device-details {
  padding: 12px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.detail-label {
  font-size: 13px;
  color: #999;
}

.detail-value {
  font-size: 13px;
  color: #333;
  font-weight: 500;
}

.device-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.device-actions .btn {
  flex: 1;
}

.btn-danger {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.btn-danger:hover {
  background: #fecaca;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 15px;
  color: #999;
}

.tips-card {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.tips-title {
  font-size: 14px;
  color: #92400e;
  font-weight: 600;
  margin-bottom: 8px;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  font-size: 13px;
  color: #b45309;
  padding-left: 16px;
  position: relative;
  margin-bottom: 6px;
  line-height: 1.6;
}

.tips-list li:last-child {
  margin-bottom: 0;
}

.tips-list li::before {
  content: '•';
  position: absolute;
  left: 0;
}
</style>
