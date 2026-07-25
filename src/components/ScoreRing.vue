<template>
  <div class="score-ring" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="ring-svg">
      <circle
        cx="50%" cy="50%"
        :r="radius"
        fill="none"
        :stroke="bgColor"
        stroke-width="10"
      />
      <circle
        cx="50%" cy="50%"
        :r="radius"
        fill="none"
        :stroke="ringColor"
        stroke-width="10"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        transform="rotate(-90 50% 50%)"
        class="ring-progress"
      />
    </svg>
    <div class="ring-center">
      <span class="ring-score" :style="{ color: ringColor }">{{ score }}</span>
      <span class="ring-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  score: { type: Number, default: 100 },
  size: { type: Number, default: 140 },
  label: { type: String, default: '好感度' }
})

const radius = computed(() => props.size / 2 - 10)
const circumference = computed(() => 2 * Math.PI * radius.value)
const progress = computed(() => Math.min(props.score / 200, 1))
const offset = computed(() => circumference.value * (1 - progress.value))

const ringColor = computed(() => {
  if (props.score >= 150) return '#FFB347'
  if (props.score >= 100) return '#2ECC71'
  if (props.score >= 50) return '#FF6B8A'
  return '#E74C3C'
})
const bgColor = '#FFE0E8'
</script>

<style scoped>
.score-ring {
  position: relative;
  margin: 0 auto;
}
.ring-svg { display: block; }
.ring-progress { transition: stroke-dashoffset 0.6s ease; }
.ring-center {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}
.ring-score {
  font-size: 2.2rem;
  font-weight: 700;
  display: block;
}
.ring-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
</style>
