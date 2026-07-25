<template>
  <div class="empty-state fade-in">
    <div class="empty-icon">{{ icon }}</div>
    <p class="empty-text">{{ message }}</p>
    <button v-if="actionLabel" class="btn btn-primary" @click="$emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  message: { type: String, default: '暂无数据' },
  actionLabel: { type: String, default: '' }
})
defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 32px;
  text-align: center;
}
.empty-icon { font-size: 56px; margin-bottom: 16px; }
.empty-text { color: var(--text-secondary); font-size: 15px; margin-bottom: 20px; }
</style>
