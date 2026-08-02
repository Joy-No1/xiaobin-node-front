<template>
  <div class="page">
    <div class="page-header">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h1>{{ isMe ? '预览我的主页' : '用户主页' }}</h1>
      <span></span>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="user" class="page-body fade-in">
      <!-- 顶部头像区 -->
      <div class="profile-header text-center">
        <UserAvatar :src="user.avatarUrl" :name="user.nickname" :size="80" />
        <h2 class="mt-2">{{ user.nickname }}</h2>
        <p v-if="user.bio" class="text-secondary" style="font-size:13px;margin-top:2px">{{ user.bio }}</p>
      </div>

      <!-- 个人资料卡片 -->
      <div class="profile-card mt-2">
        <div class="profile-card-title">个人资料</div>
        <div class="profile-grid">
          <div class="profile-item" v-if="user.gender || user.birthday">
            <span class="profile-label">性别 / 年龄</span>
            <span class="profile-value">
              {{ user.gender ? genderLabel(user.gender) : '--' }}
              <template v-if="computedAge !== null"> · {{ computedAge }}岁</template>
            </span>
          </div>
          <div class="profile-item" v-if="user.birthday">
            <span class="profile-label">生日</span>
            <span class="profile-value">{{ formatDate(user.birthday) }}</span>
          </div>
          <div class="profile-item" v-if="userLocation">
            <span class="profile-label">地区</span>
            <span class="profile-value">{{ locationLabel }}</span>
          </div>
          <div class="profile-item" v-if="user.company">
            <span class="profile-label">公司</span>
            <span class="profile-value">{{ user.company }}</span>
          </div>
          <div class="profile-item" v-if="user.school">
            <span class="profile-label">学校</span>
            <span class="profile-value">{{ user.school }}</span>
          </div>
          <div class="profile-item" v-if="user.education">
            <span class="profile-label">学历</span>
            <span class="profile-value">{{ educationLabel(user.education) }}</span>
          </div>
          <div class="profile-item" v-if="user.height || user.weight">
            <span class="profile-label">身高 / 体重</span>
            <span class="profile-value">
              <template v-if="user.height">{{ user.height }} cm</template>
              <template v-if="user.height && user.weight"> / </template>
              <template v-if="user.weight">{{ user.weight }} kg</template>
            </span>
          </div>
        </div>
      </div>

      <div v-if="!isMe" class="mt-2">
        <button class="btn btn-primary btn-block" @click="toggleFollow">
          {{ following ? '✓ 已关注' : '+ 关注' }}
        </button>
      </div>
    </div>

    <ErrorState v-else message="用户不存在" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import * as api from '../../services/api'
import UserAvatar from '../../components/UserAvatar.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import ErrorState from '../../components/ErrorState.vue'

const props = defineProps({ userId: Number })
const auth = useAuthStore()
const user = ref(null)
const userLocation = ref(null)
const following = ref(false)
const loading = ref(true)

const isMe = computed(() => auth.user?.id === props.userId)

const locationLabel = computed(() => {
  if (!userLocation.value) return ''
  return [userLocation.value.province, userLocation.value.city, userLocation.value.district].filter(Boolean).join(' ')
})

// 计算年龄
const computedAge = computed(() => {
  if (!user.value?.birthday) return null
  const birth = new Date(user.value.birthday)
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
  HIGH_SCHOOL: '高中', ASSOCIATE: '大专', BACHELOR: '本科',
  MASTER: '硕士', DOCTOR: '博士', OTHER: '其他'
}

function genderLabel(g) {
  if (g === 'MALE') return '男'
  if (g === 'FEMALE') return '女'
  return g
}

function educationLabel(e) {
  return EDUCATION_MAP[e] || e
}

onMounted(async () => {
  try {
    const dto = await api.getUserProfile(props.userId)
    if (dto?.user) {
      user.value = dto.user
      userLocation.value = dto.location || null
    } else {
      user.value = dto
      userLocation.value = null
    }
    following.value = user.value?.isFollowed || false
  } catch (e) { /* ignore */ }
  loading.value = false
})

async function toggleFollow() {
  try {
    if (following.value) {
      await api.unfollowUser(props.userId)
    } else {
      await api.followUser(props.userId)
    }
    following.value = !following.value
  } catch (e) {
    alert('操作失败')
  }
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.profile-header {
  padding: 8px 0 16px;
}
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
.btn-block {
  width: 100%;
}
</style>
