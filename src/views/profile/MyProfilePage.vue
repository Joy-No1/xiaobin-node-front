<template>
  <div class="page">
    <div class="page-header"><h1>👤 我的</h1></div>

    <div v-if="auth.user" class="page-body fade-in">
      <!-- 顶部个人信息 -->
      <div class="profile-header text-center">
        <UserAvatar :src="auth.user.avatarUrl" :name="auth.user.nickname" :size="72" />
        <h2 class="mt-2">{{ auth.user.nickname }}</h2>
        <p class="profile-id">ID: {{ auth.user.id }}</p>
        <p v-if="auth.user.bio" class="text-secondary" style="font-size:13px">{{ auth.user.bio }}</p>
      </div>

      <!-- 个人资料卡片 -->
      <div class="profile-card mt-2">
        <div class="profile-card-title">个人信息</div>
        <div class="profile-grid">
          <div class="profile-item" v-if="auth.user.gender || computedAge !== null">
            <span class="profile-label">性别 / 年龄</span>
            <span class="profile-value">
              {{ auth.user.gender ? genderLabel(auth.user.gender) : '--' }}
              <template v-if="computedAge !== null"> · {{ computedAge }}岁</template>
            </span>
          </div>
          <div class="profile-item" v-if="auth.user.birthday">
            <span class="profile-label">生日</span>
            <span class="profile-value">{{ formatDate(auth.user.birthday) }}</span>
          </div>
          <div class="profile-item" v-if="auth.location">
            <span class="profile-label">地区</span>
            <span class="profile-value">{{ locationLabel }}</span>
          </div>
          <div class="profile-item" v-if="auth.user.company">
            <span class="profile-label">公司</span>
            <span class="profile-value">{{ auth.user.company }}</span>
          </div>
          <div class="profile-item" v-if="auth.user.school">
            <span class="profile-label">学校</span>
            <span class="profile-value">{{ auth.user.school }}</span>
          </div>
          <div class="profile-item" v-if="auth.user.education">
            <span class="profile-label">学历</span>
            <span class="profile-value">{{ educationLabel(auth.user.education) }}</span>
          </div>
          <div class="profile-item" v-if="auth.user.height || auth.user.weight">
            <span class="profile-label">身高 / 体重</span>
            <span class="profile-value">
              <template v-if="auth.user.height">{{ auth.user.height }} cm</template>
              <template v-if="auth.user.height && auth.user.weight"> / </template>
              <template v-if="auth.user.weight">{{ auth.user.weight }} kg</template>
            </span>
          </div>
        </div>
      </div>

      <!-- 菜单 -->
      <!-- 第一组 -->
      <div class="menu-list mt-2">
        <div class="menu-item" @click="showQrDialog = true">
          <span>📱 我的二维码</span>
          <span>›</span>
        </div>
        <div class="menu-item" @click="$router.push(`/profile/${auth.user.id}`)">
          <span>👁️ 预览我的主页</span>
          <span class="menu-hint">看看别人眼中的你</span>
        </div>
      </div>

      <!-- 第二组 -->
      <div class="menu-list mt-2">
        <div class="menu-item" @click="$router.push('/profile/edit')">
          <span>✏️ 编辑资料</span>
          <span>›</span>
        </div>
        <div class="menu-item">
          <span>⚙️ 设置</span>
          <span>›</span>
        </div>
        <div class="menu-item">
          <span>ℹ️ 关于</span>
          <span>›</span>
        </div>
      </div>

      <!-- 第三组 -->
      <div class="menu-list mt-2">
        <div class="menu-item" style="color:var(--error)" @click="doLogout">
          <span>🚪 退出登录</span>
        </div>
      </div>
    </div>

    <!-- 二维码弹窗 -->
    <div v-if="showQrDialog" class="modal-overlay" @click.self="closeQrDialog">
      <div class="qr-modal">
        <h3>我的二维码</h3>
        <p class="text-secondary" style="font-size:12px;margin:4px 0 16px">让对方扫码即可建立关系</p>
        <canvas ref="qrCanvas" width="220" height="220" class="qr-code"></canvas>
        <div class="qr-info mt-2">
          <UserAvatar :src="auth.user.avatarUrl" :name="auth.user.nickname" :size="40" />
          <div>
            <b>{{ auth.user.nickname }}</b>
            <div class="text-secondary" style="font-size:12px">ID: {{ auth.user.id }}</div>
          </div>
        </div>
        <button class="btn btn-sm mt-2" style="width:100%" @click="closeQrDialog">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { disconnect } from '../../services/websocket'
import QRCode from 'qrcode'
import UserAvatar from '../../components/UserAvatar.vue'

const router = useRouter()
const auth = useAuthStore()
const qrCanvas = ref(null)
const showQrDialog = ref(false)

const locationLabel = computed(() => {
  if (!auth.location) return ''
  return [auth.location.province, auth.location.city, auth.location.district].filter(Boolean).join(' ')
})

const computedAge = computed(() => {
  if (!auth.user?.birthday) return null
  const birth = new Date(auth.user.birthday)
  if (Number.isNaN(birth.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
})

const EDUCATION_MAP = {
  HIGH_SCHOOL: '高中',
  ASSOCIATE: '大专',
  BACHELOR: '本科',
  MASTER: '硕士',
  DOCTOR: '博士',
  OTHER: '其他'
}

function genderLabel(g) {
  if (g === 'MALE') return '男'
  if (g === 'FEMALE') return '女'
  return g
}

function educationLabel(e) {
  return EDUCATION_MAP[e] || e
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 打开二维码弹窗时才生成二维码
watch(showQrDialog, async (val) => {
  if (val) {
    await nextTick()
    if (qrCanvas.value && auth.user) {
      const qrData = JSON.stringify({
        id: auth.user.id,
        phone: auth.user.phone,
        nickname: auth.user.nickname
      })
      await QRCode.toCanvas(qrCanvas.value, qrData, {
        width: 220,
        margin: 2,
        color: { dark: '#FF6B8A', light: '#FFFFFF' }
      })
    }
  }
})

function closeQrDialog() {
  showQrDialog.value = false
}

function doLogout() {
  auth.logout()
  disconnect()
  router.replace('/login')
}
</script>

<style scoped>
/* ---- 顶部个人信息 ---- */
.profile-header {
  padding: 8px 0 16px;
}
.profile-id {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

/* ---- 个人资料卡片 ---- */
.profile-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 16px;
  text-align: left;
}
.profile-card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--divider);
}
.profile-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.profile-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.profile-label {
  font-size: 13px;
  color: var(--text-secondary);
  flex-shrink: 0;
}
.profile-value {
  font-size: 14px;
  color: var(--text-primary);
  text-align: right;
}

/* ---- 菜单 ---- */
.menu-list {
  background: var(--surface);
  border-radius: var(--radius);
  overflow: hidden;
  text-align: left;
}
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--divider);
  cursor: pointer;
  font-size: 15px;
}
.menu-item:last-child { border-bottom: none; }
.menu-item:active { background: var(--bg); }
.menu-hint {
  font-size: 12px;
  color: var(--text-secondary);
}

/* ---- 二维码弹窗 ---- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}
.qr-modal {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 100%;
  max-width: 300px;
  text-align: center;
}
.qr-modal h3 {
  font-size: 17px;
}
.qr-code {
  border-radius: var(--radius);
  background: #fff;
  padding: 8px;
}
.qr-info {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
}
</style>
