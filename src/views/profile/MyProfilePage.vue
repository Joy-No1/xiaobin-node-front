<template>
  <div class="page my-profile-page">
    <!-- 顶部导航栏 -->
    <div class="top-bar flex-between">
      <h1>我的</h1>
    </div>

    <!-- 用户信息卡片 - 简洁风格 -->
    <div class="user-card" @click="viewBackground">
      <!-- 背景图层 -->
      <div class="card-background">
        <img
          :src="auth.user?.profileBackgroundUrl || defaultBackground"
          alt="背景图"
          class="background-image"
        />
      </div>

      <!-- 内容层 -->
      <div class="card-content">
        <div class="avatar-wrapper">
          <UserAvatar :src="auth.user?.avatarUrl" :name="auth.user?.nickname || '?'" :size="80" />
        </div>
        <h2 class="nickname">{{ auth.user?.nickname || '未设置昵称' }}</h2>
        <p class="user-id">ID: {{ auth.user?.id }}</p>

        <!-- 数据统计 -->
        <div class="stats-row">
          <div class="stat-item" @click.stop="$router.push('/profile/my-following')">
            <span class="stat-num">{{ followingCount }}</span>
            <span class="stat-label">关注</span>
          </div>
          <div class="stat-item" @click.stop="$router.push('/profile/my-likes')">
            <span class="stat-num">{{ likeCount }}</span>
            <span class="stat-label">赞</span>
          </div>
          <div class="stat-item" @click.stop="$router.push('/profile/my-comments')">
            <span class="stat-num">{{ commentCount }}</span>
            <span class="stat-label">评论</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 我的空间 -->
    <div class="menu-section">
      <div class="section-title">我的空间</div>
      <div class="menu-grid">
        <div class="menu-grid-item" @click="$router.push('/profile/my-following')">
          <div class="grid-icon-wrapper"><HandHeart /></div>
          <span class="grid-label">我关注的</span>
        </div>
        <div class="menu-grid-item" @click="$router.push('/profile/my-likes')">
          <div class="grid-icon-wrapper"><Heart /></div>
          <span class="grid-label">我赞过的</span>
        </div>
        <div class="menu-grid-item" @click="$router.push('/profile/my-comments')">
          <div class="grid-icon-wrapper"><MessageCircle /></div>
          <span class="grid-label">我的评论</span>
        </div>
        <div class="menu-grid-item" @click="showQrDialog = true">
          <div class="grid-icon-wrapper"><Smartphone /></div>
          <span class="grid-label">我的二维码</span>
        </div>
      </div>
    </div>

    <!-- 个人信息 -->
    <div class="menu-section">
      <div class="simple-menu" @click="$router.push(`/profile/${auth.user?.id}`)">
        <span><UserCircle :size="18" class="menu-icon" /> 个人信息</span>
        <span class="arrow">›</span>
      </div>
      <div class="simple-menu" @click="$router.push('/settings')">
        <span><Settings :size="18" class="menu-icon" /> 设置</span>
        <span class="arrow">›</span>
      </div>
    </div>

    <!-- 退出登录 -->
    <div class="logout-btn" @click="doLogout">退出登录</div>

    <!-- 背景图查看弹窗 -->
    <div v-if="showBackgroundDialog" class="modal-overlay" @click="showBackgroundDialog = false">
      <div class="background-viewer">
        <img
          :src="auth.user?.profileBackgroundUrl || defaultBackground"
          alt="背景图"
          class="full-background"
        />
      </div>
    </div>

    <!-- 二维码弹窗 -->
    <div v-if="showQrDialog" class="modal-overlay" @click.self="showQrDialog = false">
      <div class="qr-modal">
        <h3>我的二维码</h3>
        <canvas ref="qrCanvas" width="220" height="220" class="qr-code"></canvas>
        <div class="qr-info">
          <UserAvatar :src="auth.user?.avatarUrl" :name="auth.user?.nickname || '?'" :size="40" />
          <div>
            <b>{{ auth.user?.nickname }}</b>
            <div style="font-size:12px;color:#999">ID: {{ auth.user?.id }}</div>
          </div>
        </div>
        <button class="btn btn-sm mt-2" style="width:100%" @click="showQrDialog = false">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useMyStore } from '../../stores/my'
import { disconnect } from '../../services/websocket'
import QRCode from 'qrcode'
import UserAvatar from '../../components/UserAvatar.vue'
import { HandHeart, Heart, MessageCircle, Smartphone, UserCircle, Settings } from 'lucide-vue-next'

const defaultBackground = ''

const router = useRouter()
const auth = useAuthStore()
const myStore = useMyStore()
const qrCanvas = ref(null)
const showQrDialog = ref(false)
const showBackgroundDialog = ref(false)

// 调试：检查默认背景图路径
console.log('默认背景图路径:', defaultBackground)
console.log('用户背景图:', auth.user?.profileBackgroundUrl)

const followingCount = computed(() => myStore.followingList.length)
const likeCount = computed(() => myStore.likesList.length)
const commentCount = computed(() => myStore.commentsList.length)

onMounted(async () => {
  await Promise.all([
    myStore.loadFollowing(1),
    myStore.loadLikes(1),
    myStore.loadComments(1)
  ])
})

async function doLogout() {
  if (!confirm('确定要退出登录吗？')) return
  auth.logout()
  disconnect()
  router.replace('/login')
}

function viewBackground() {
  // 总是显示背景图（无论是用户上传的还是默认的）
  showBackgroundDialog.value = true
}
</script>

<style scoped>
.my-profile-page {
  background: #F5F6F8;
  min-height: 100vh;
}

.top-bar {
  padding: 16px 20px;
  background: #fff;
  border-bottom: 1px solid #eee;
}

.top-bar h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  color: #333;
}

/* 用户卡片 */
.user-card {
  position: relative;
  margin: 12px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #E8EAED;
  cursor: pointer;
  min-height: 280px;
}

/* 背景图层 */
.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.background-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%);
}

/* 内容层 */
.card-content {
  position: relative;
  z-index: 2;
  padding: 24px 20px 20px;
  text-align: center;
}

.avatar-wrapper {
  display: inline-flex;
  padding: 4px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nickname {
  font-size: 20px;
  font-weight: 700;
  margin: 12px 0 4px;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.user-id {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 统计行 */
.stats-row {
  display: flex;
  justify-content: space-around;
  max-width: 280px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.9);
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background 0.2s;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.5);
}

.stat-num {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

/* 背景图查看弹窗 */
.background-viewer {
  max-width: 90%;
  max-height: 80%;
  border-radius: 16px;
  overflow: hidden;
}

.full-background {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 菜单区域 */
.menu-section {
  margin: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #999;
  padding: 8px 12px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  background: #FAFBFC;
  padding: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #E8EAED;
}

.menu-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: background 0.2s;
}

.menu-grid-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.grid-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.grid-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.simple-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FAFBFC;
  padding: 16px 20px;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #E8EAED;
  transition: background 0.2s;
}

.simple-menu:hover {
  background: rgba(0, 0, 0, 0.02);
}

.simple-menu .menu-icon {
  vertical-align: middle;
  margin-right: 8px;
}

.simple-menu .arrow {
  font-size: 24px;
  color: #ccc;
}

.logout-btn {
  margin: 24px 12px 12px;
  padding: 14px;
  background: #FAFBFC;
  border: 1px solid #E8EAED;
  border-radius: 12px;
  text-align: center;
  color: #e74c3c;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #ffe5e5;
  border-color: #e74c3c;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.qr-modal {
  background: #fff;
  padding: 24px;
  border-radius: 16px;
  text-align: center;
  max-width: 280px;
}

.qr-modal h3 {
  margin: 0 0 16px;
  font-size: 18px;
}

.qr-code {
  display: block;
  margin: 0 auto;
  border-radius: 8px;
}

.qr-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  text-align: left;
}

.mt-2 {
  margin-top: 16px;
}
</style>