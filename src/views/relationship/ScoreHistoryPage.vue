<template>
  <div class="page">
    <div class="page-header"><button class="btn btn-sm" @click="$router.back()">← 返回</button><h1>打分记录</h1></div>
    <div class="page-body">
      <LoadingSpinner v-if="loading" message="加载记录..." />
      <EmptyState v-else-if="records.length === 0" :icon="ClipboardList" message="还没有打分记录" />
      <div v-else>
        <div v-for="r in records" :key="r.id" class="card flex-between fade-in">
          <div class="flex gap-2">
            <div class="record-icon" :class="r.scoreChange > 0 ? 'bg-success' : 'bg-error'">
              <Plus v-if="r.scoreChange > 0" :size="18" />
              <Minus v-else :size="18" />
            </div>
            <div>
              <div>{{ r.reason || '无备注' }}</div>
              <div class="text-secondary" style="font-size:12px">{{ formatDate(r.createdAt) }}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div :class="r.scoreChange > 0 ? 'text-success' : 'text-error'" style="font-size:18px;font-weight:700">
              {{ r.scoreChange > 0 ? '+' : '' }}{{ r.scoreChange }}
            </div>
            <div class="text-secondary" style="font-size:12px">{{ r.scoreAfter }} 分</div>
          </div>
        </div>
        <p v-if="hasMore" class="text-center mt-2">
          <button class="btn btn-sm" @click="loadMore">加载更多</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRelationshipStore } from '../../stores/relationship'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { ClipboardList, Plus, Minus } from 'lucide-vue-next'

const props = defineProps({ relationshipId: Number })
const store = useRelationshipStore()
const records = ref([])
const loading = ref(true)
const hasMore = ref(false)
let currentPage = 1

onMounted(async () => {
  await loadPage(1)
  loading.value = false
})

async function loadPage(page) {
  const result = await store.loadRecords(page)
  records.value = page === 1 ? result.records : [...records.value, ...result.records]
  hasMore.value = result.hasMore
  currentPage = page
}

async function loadMore() {
  await loadPage(currentPage + 1)
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.record-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.bg-success { background: #E8F8F5; }
.bg-error { background: #FDEDEC; }
</style>
