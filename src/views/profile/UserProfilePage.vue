<template>
  <div class="page">
    <div class="page-header"><button class="btn btn-sm" @click="$router.back()">← 返回</button><h1>用户主页</h1></div>

    <LoadingSpinner v-if="loading" />

    <div v-else-if="user" class="page-body text-center fade-in">
      <UserAvatar :src="user.avatarUrl" :name="user.nickname" :size="80" />
      <h2 class="mt-2">{{ user.nickname }}</h2>
      <p v-if="user.bio" class="text-secondary">{{ user.bio }}</p>

      <div v-if="!isMe" class="mt-2">
        <button class="btn" :class="following ? 'btn-outline' : 'btn-primary'" @click="toggleFollow">
          {{ following ? '已关注' : '关注' }}
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
const following = ref(false)
const loading = ref(true)

const isMe = computed(() => auth.user?.id === props.userId)

onMounted(async () => {
  try {
    user.value = await api.getUserProfile(props.userId)
    following.value = user.value?.isFollowed || false
  } catch (e) { /* */ }
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
</script>
