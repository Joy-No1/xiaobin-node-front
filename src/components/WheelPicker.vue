<template>
  <div class="wheel-picker">
    <!-- 选中高亮条 -->
    <div class="picker-highlight"></div>
    <!-- 列 -->
    <div class="picker-columns">
      <div
        v-for="(col, ci) in columns"
        :key="ci"
        class="picker-column"
        :style="{ flex: col.flex || 1 }"
      >
        <div
          class="picker-scroll"
          :ref="el => setScrollRef(ci, el)"
          @scroll="debounceScroll(ci, $event)"
        >
          <!-- 顶部占位，让首项也能滚到中间 -->
          <div class="picker-spacer"></div>
          <div
            v-for="(item, ii) in col.items"
            :key="ii"
            class="picker-option"
            :class="{ active: selected[ci] === item.value }"
            :data-value="item.value"
          >
            {{ item.label }}
          </div>
          <!-- 底部占位 -->
          <div class="picker-spacer"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true
    // [{ items: [{ label, value }], flex: 1 }]
  },
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const ITEM_HEIGHT = 40

const selected = ref([...props.modelValue])
const scrollRefs = {}
const timers = {}

function setScrollRef(ci, el) {
  if (el) scrollRefs[ci] = el
}

// 初始滚动到已选值
watch(() => props.columns, async () => {
  await nextTick()
  props.columns.forEach((col, ci) => {
    const val = selected.value[ci]
    if (val !== undefined && val !== null && scrollRefs[ci]) {
      const idx = col.items.findIndex(it => it.value === val)
      if (idx >= 0) {
        scrollRefs[ci].scrollTop = idx * ITEM_HEIGHT
      }
    }
  })
}, { immediate: true })

// 外部值变化
watch(() => props.modelValue, (vals) => {
  if (vals) selected.value = [...vals]
})

// 滚动时判断当前选中项
function onScrollEnd(ci) {
  const el = scrollRefs[ci]
  if (!el) return
  const idx = Math.round(el.scrollTop / ITEM_HEIGHT)
  const col = props.columns[ci]
  if (!col || idx < 0 || idx >= col.items.length) return
  const item = col.items[idx]
  if (item && selected.value[ci] !== item.value) {
    selected.value[ci] = item.value
    // snap to exact position
    el.scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' })
    emit('update:modelValue', [...selected.value])
    emit('change', { columnIndex: ci, value: item.value, selected: [...selected.value] })
  }
}

function debounceScroll(ci) {
  if (timers[ci]) clearTimeout(timers[ci])
  timers[ci] = setTimeout(() => onScrollEnd(ci), 120)
}

// 暴露方法供父组件调用
defineExpose({
  scrollTo(ci, value) {
    const col = props.columns[ci]
    if (!col) return
    const idx = col.items.findIndex(it => it.value === value)
    if (idx >= 0 && scrollRefs[ci]) {
      scrollRefs[ci].scrollTo({ top: idx * ITEM_HEIGHT, behavior: 'smooth' })
    }
  }
})
</script>

<style scoped>
.wheel-picker {
  position: relative;
  height: 200px;
  overflow: hidden;
  background: var(--bg, #f5f5f5);
  border-radius: 12px;
  user-select: none;
}
.picker-highlight {
  position: absolute;
  top: 50%;
  left: 8px;
  right: 8px;
  height: 40px;
  transform: translateY(-50%);
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
  pointer-events: none;
  z-index: 1;
}
.picker-columns {
  display: flex;
  height: 100%;
}
.picker-column {
  overflow: hidden;
}
.picker-scroll {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  /* 隐藏滚动条 */
  scrollbar-width: none;
}
.picker-scroll::-webkit-scrollbar {
  display: none;
}
.picker-spacer {
  height: 80px; /* (200 - 40) / 2 */
  scroll-snap-align: none;
}
.picker-option {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #999;
  scroll-snap-align: center;
  transition: color 0.15s, font-weight 0.15s;
}
.picker-option.active {
  color: var(--text-primary, #333);
  font-weight: 600;
  font-size: 17px;
}
</style>
