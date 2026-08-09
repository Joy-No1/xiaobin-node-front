<template>
  <component :is="icon" :size="size" :stroke-width="strokeWidth" />
</template>

<script setup>
import * as icons from 'lucide-vue-next'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 24 },
  strokeWidth: { type: Number, default: 2 }
})

const icon = icons[props.name] || icons.Circle
</script>
