<template>
  <div
    class="avatar-wrapper"
    :style="{ width: size + 'px', height: size + 'px' }"
    @click="$emit('click')"
  >
    <img
      v-if="src"
      :src="src"
      :width="size"
      :height="size"
      class="avatar-img"
      @error="onError"
    />
    <div v-else class="avatar-fallback" :style="{ fontSize: size * 0.4 + 'px' }">
      {{ initial }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src: { type: String, default: '' },
  name: { type: String, default: '?' },
  size: { type: Number, default: 44 }
})
defineEmits(['click'])

const imgError = ref(false)

const initial = computed(() => {
  if (!props.name || props.name === '?') return '?'
  return props.name[0].toUpperCase()
})

function onError() { imgError.value = true }
</script>

<style scoped>
.avatar-wrapper {
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 700;
}
</style>
