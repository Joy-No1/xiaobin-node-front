<template>
  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">
        <span class="back-arrow">‹</span>
      </button>
      <h1>我关注的人</h1>
      <span></span>
    </div>
    <div class="page-body">
      <LoadingSpinner v-if="isFollowingLoading && followingList.length === 0" />
      <EmptyState v-else-if="followingList.length === 0" :icon="UserPlus" message="还没有关注任何人" />
      <div v-else>
        <div
          v-for="item in followingList"
          :key="item.user?.id"
          class="user-card card fade-in"
        >
          <div class="flex gap-2" @click="goToProfile(item.user.id)">
            <UserAvatar :src="item.user.avatarUrl" :name="item.user.nickname || '?'" :size="56" />
            <div style="flex:1;min-width:0">
              <div class="flex-between">
                <b>{{ item.user.nickname }}</b>
                <span v-if="item.isMutual" class="mutual-badge"><Handshake :size="12" class="badge-icon" /> 互关</span>
              </div>
              <div class="text-secondary" style="font-size:13px">{{ getUserField(item.user, 'bio', '个性签名待添加') }}</div>
            </div>
          </div>
          <div class="card-actions">
            <button class="btn btn-sm btn-outline" @click="handleUnfollow(item.user)">取消关注</button>
            <button class="btn btn-sm btn-primary" @click="handleChat(item.user)">发消息</button>
          </div>
        </div>
        <p v-if="hasMore" class="text-center mt-2">
          <button class="btn btn-sm" @click="loadMore()" :disabled="isFollowingLoading">加载更多</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '../../services/api'
import UserAvatar from '../../components/UserAvatar.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { UserPlus, Handshake } from 'lucide-vue-next'
import toast from '@/utils/toast'

const router = useRouter()
const followingList = ref([])
const hasMore = ref(false)
const currentPage = ref(1)
const isFollowingLoading = ref(false)

onMounted(() => loadFollowing(1))

async function loadFollowing(pageNum = 1) {
  isFollowingLoading.value = true
  try {
    const data = await api.getMyFollowing(pageNum)
    const records = data?.records || data || []
    if (pageNum === 1) followingList.value = records
    else followingList.value.push(...records)
    currentPage.value = pageNum
    hasMore.value = pageNum < (data?.pages || 999)
  } catch (e) {
    console.error('加载关注列表失败:', e)
  }
  isFollowingLoading.value = false
}

function loadMore() {
  loadFollowing(currentPage.value + 1)
}

function getUserField(user, field, fallback) {
  return user?.[field] || fallback
}

function goToProfile(userId) {
  router.push(`/profile/${userId}`)
}

async function handleUnfollow(user) {
  if (!confirm(`确定要取消关注 ${user.nickname} 吗？`)) return
  try {
    await api.unfollowUser(user.id)
    followingList.value = followingList.value.filter(f => f.user?.id !== user.id)
  } catch (e) {
    toast.error('取消关注失败')
  }
}

async function handleChat(user) {
  try {
    const conversations = await api.getConversations()
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    const myId = userData?.id
    const conversation = conversations.find(conv =>
      (conv.user1Id === myId && conv.user2Id === user.id) ||
      (conv.user1Id === user.id && conv.user2Id === myId)
    )
    if (conversation?.id) {
      router.push(`/chat/${conversation.id}`)
    } else {
      const newConv = await api.createConversation(user.id)
      if (newConv?.id) {
        await api.sendMessage(newConv.id, '我们已互相关注啦，开始聊天吧！', myId)
        router.push(`/chat/${newConv.id}`)
      }
    }
  } catch (e) {
    console.error('打开聊天失败:', e)
    toast.error('无法打开聊天，请稍后重试')
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-header h1 {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f5f5f5;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #e8e8e8;
}

.back-arrow {
  font-size: 28px;
  font-weight: 300;
  color: #333;
  line-height: 1;
  margin-top: -2px;
}

.user-card { padding: 14px 16px; margin-bottom: 8px; }

.mutual-badge {
  font-size: 12px;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.badge-icon {
  vertical-align: middle;
}

.card-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 10px; }
</style>