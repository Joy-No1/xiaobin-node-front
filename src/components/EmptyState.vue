<template>
  <div class="empty-state fade-in">
    <div class="empty-icon">
      <component :is="iconComponent" :size="48" :stroke-width="1.5" />
    </div>
    <p class="empty-text">{{ message }}</p>
    <button v-if="actionLabel" class="btn btn-primary" @click="$emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Inbox } from 'lucide-vue-next'

const props = defineProps({
  icon: { type: [Object, String], default: null },
  message: { type: String, default: '暂无数据' },
  actionLabel: { type: String, default: '' }
})
defineEmits(['action'])

const iconComponent = computed(() => {
  if (props.icon && typeof props.icon === 'object') return props.icon
  return Inbox
})
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
.empty-icon { color: var(--text-secondary); opacity: 0.5; margin-bottom: 16px; }
.empty-text { color: var(--text-secondary); font-size: 15px; margin-bottom: 20px; }
</style>
