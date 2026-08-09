<template>
  <div class="page">
    <!-- 顶部导航栏 -->
    <div class="top-bar flex-between">
      <h1>我的</h1>
    </div>

    <!-- 用户信息卡片 - 简洁风格 -->
    <div class="user-card">
      <div class="avatar-wrapper">
        <UserAvatar :src="auth.user?.avatarUrl" :name="auth.user?.nickname || '?'" :size="80" />
      </div>
      <h2 class="nickname">{{ auth.user?.nickname || '未设置昵称' }}</h2>
      <p class="user-id">ID: {{ auth.user?.id }}</p>
      
      <!-- 数据统计 -->
      <div class="stats-row">
        <div class="stat-item" @click="$router.push('/profile/my-following')">
          <span class="stat-num">{{ followingCount }}</span>
          <span class="stat-label">关注</span>
        </div>
        <div class="stat-item" @click="$router.push('/profile/my-likes')">
          <span class="stat-num">{{ likeCount }}</span>
          <span class="stat-label">赞</span>
        </div>
        <div class="stat-item" @click="$router.push('/profile/my-comments')">
          <span class="stat-num">{{ commentCount }}</span>
          <span class="stat-label">评论</span>
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
    </div>

    <!-- 退出登录 -->
    <div class="logout-btn" @click="doLogout">退出登录</div>

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
import { HandHeart, Heart, MessageCircle, Smartphone, UserCircle } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const myStore = useMyStore()
const qrCanvas = ref(null)
const showQrDialog = ref(false)

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
</script>

<style scoped>
.page { background: #f5f5f5; min-height: 100vh; }
.top-bar { padding: 16px 20px; background: #fff; border-bottom: 1px solid #eee; }
.top-bar h1 { font-size: 20px; font-weight: 700; margin: 0; color: #333; }

/* 用户卡片 */
.user-card {
  background: #fff;
  margin: 12px;
  border-radius: 16px;
  padding: 24px 20px 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.avatar-wrapper {
  display: inline-flex;
  padding: 4px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border-radius: 50%;
}

.nickname {
  font-size: 20px;
  font-weight: 700;
  margin: 12px 0 4px;
  color: #333;
}

.user-id {
  font-size: 12px;
  color: #999;
  margin: 0 0 16px;
}

/* 统计行 */
.stats-row {
  display: flex;
  justify-content: space-around;
  max-width: 280px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}

.stat-item:hover { background: #f9f9f9; }

.stat-num {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

/* 菜单区块 */
.menu-section {
  background: #fff;
  margin: 12px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 13px;
  color: #999;
  padding: 12px 16px 8px;
}

/* 网格菜单 */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.menu-grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.menu-grid-item:hover { background: #fafafa; }

.grid-icon-wrapper {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f7ff;
  border-radius: 10px;
  margin-bottom: 6px;
  color: #3b82f6;
}

.grid-icon-wrapper svg {
  width: 22px;
  height: 22px;
}

.grid-label {
  font-size: 12px;
  color: #666;
}

/* 简单列表菜单 */
.simple-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 16px;
  cursor: pointer;
  font-size: 15px;
  color: #333;
  transition: background 0.2s;
}

.simple-menu:hover { background: #fafafa; }

.menu-icon {
  margin-right: 8px;
  vertical-align: middle;
}

.arrow {
  color: #ccc;
  font-size: 18px;
}

/* 退出按钮 */
.logout-btn {
  text-align: center;
  padding: 14px;
  background: #fff;
  color: #dc2626;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border-radius: 16px;
  margin: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: opacity 0.2s;
}

.logout-btn:hover { opacity: 0.85; }

/* 二维码弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.qr-modal {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 280px;
  text-align: center;
}

.qr-modal h3 { font-size: 16px; margin: 0 0 16px; color: #333; }
.qr-code { border-radius: 12px; background: #fff; padding: 8px; }
.qr-info { display: flex; align-items: center; gap: 10px; text-align: left; margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee; }
</style>