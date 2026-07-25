<template>
  <div class="page">
    <div class="page-header flex-between">
      <h1>🌍 广场</h1>
      <router-link to="/square/create" class="btn btn-primary btn-sm">✏️ 发布</router-link>
    </div>
    <div class="page-body">
      <LoadingSpinner v-if="postStore.loading" message="加载中..." />
      <EmptyState
        v-else-if="postStore.posts.length === 0"
        icon="📸"
        message="还没有动态，快去发布第一条吧"
      />
      <div v-else>
        <PostCard
          v-for="post in postStore.posts"
          :key="post.id"
          :post="post"
          @click="$router.push(`/square/post/${post.id}`)"
          @like="postStore.toggleLike(post)"
          @user-click="$router.push(`/profile/${post.userId}`)"
        />
        <p v-if="postStore.hasMore" class="text-center mt-2">
          <button class="btn btn-sm" @click="postStore.loadMore()" :disabled="postStore.loading">
            加载更多
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePostStore } from '../../stores/post'
import PostCard from '../../components/PostCard.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'

const postStore = usePostStore()

onMounted(() => postStore.loadPosts(1))
</script>
