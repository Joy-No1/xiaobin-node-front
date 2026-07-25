<template>
  <div class="page">
    <div class="page-header"><h1>👤 我的</h1></div>

    <div v-if="auth.user" class="page-body text-center fade-in">
      <!-- 头像 -->
      <UserAvatar :src="auth.user.avatarUrl" :name="auth.user.nickname" :size="72" />
      <h2 class="mt-2">{{ auth.user.nickname }}</h2>
      <p v-if="auth.user.bio" class="text-secondary">{{ auth.user.bio }}</p>

      <!-- 我的ID（分享给对方） -->
      <div class="my-id-card mt-2">
        <div class="my-id-label">我的ID</div>
        <div class="my-id-number">{{ auth.user.id }}</div>
        <div class="my-id-phone">📱 {{ auth.user.phone }}</div>
      </div>

      <!-- 二维码 -->
      <div class="qr-section mt-2">
        <canvas ref="qrCanvas" width="200" height="200" class="qr-code"></canvas>
        <p class="text-secondary" style="font-size:12px;margin-top:8px">让对方扫码或输入你的ID即可建立关系</p>
      </div>

      <!-- 菜单 -->
      <div class="menu-list mt-2">
        <div class="menu-item" @click="$router.push('/profile/edit')">
          <span>✏️ 编辑资料</span>
          <span>›</span>
        </div>
        <div class="menu-item" @click="$router.push(`/profile/${auth.user.id}`)">
          <span>👁️ 预览我的主页</span>
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
        <div class="menu-item" style="color:var(--error)" @click="doLogout">
          <span>🚪 退出登录</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { disconnect } from '../../services/websocket'
import QRCode from 'qrcode'
import UserAvatar from '../../components/UserAvatar.vue'

const router = useRouter()
const auth = useAuthStore()
const qrCanvas = ref(null)

// 生成二维码：编码用户信息
onMounted(async () => {
  if (qrCanvas.value && auth.user) {
    const qrData = JSON.stringify({
      id: auth.user.id,
      phone: auth.user.phone,
      nickname: auth.user.nickname
    })
    await QRCode.toCanvas(qrCanvas.value, qrData, {
      width: 200,
      margin: 2,
      color: { dark: '#FF6B8A', light: '#FFFFFF' }
    })
  }
})

function doLogout() {
  auth.logout()
  disconnect()
  router.replace('/login')
}
</script>

<style scoped>
.my-id-card {
  display: inline-block;
  background: var(--primary-light);
  border-radius: var(--radius);
  padding: 12px 24px;
}
.my-id-label { font-size: 11px; color: var(--primary); }
.my-id-number { font-size: 28px; font-weight: 800; color: var(--primary); }
.my-id-phone { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
.qr-code { border-radius: var(--radius); }
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
</style>
