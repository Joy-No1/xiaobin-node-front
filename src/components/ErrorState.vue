<template>
  <div class="error-state fade-in">
    <div class="error-icon"><AlertTriangle :size="48" /></div>
    <p class="error-text">{{ message }}</p>
    <button v-if="retry" class="btn btn-outline btn-sm" @click="$emit('retry')">
      <RefreshCw :size="14" class="inline-icon" /> 重试
    </button>
  </div>
</template>

<script setup>
import { AlertTriangle, RefreshCw } from 'lucide-vue-next'

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
.error-icon { color: var(--text-secondary); margin-bottom: 12px; }
.error-text { color: var(--text-secondary); font-size: 15px; margin-bottom: 16px; }
</style>