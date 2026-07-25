<template>
  <div class="error-state fade-in">
    <div class="error-icon">⚠️</div>
    <p class="error-text">{{ message }}</p>
    <button v-if="retry" class="btn btn-outline btn-sm" @click="$emit('retry')">
      🔄 重试
    </button>
  </div>
</template>

<script setup>
defineProps({
  message: { type: String, default: '加载失败' },
  retry: { type: Boolean, default: true }
})
defineEmits(['retry'])
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 32px;
  text-align: center;
}
.error-icon { font-size: 48px; margin-bottom: 12px; }
.error-text { color: var(--text-secondary); font-size: 15px; margin-bottom: 16px; }
</style>
