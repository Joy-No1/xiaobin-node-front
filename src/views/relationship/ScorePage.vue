<template>
  <div class="page">
    <div class="page-header"><button class="btn btn-sm" @click="$router.back()">← 返回</button><h1>打分</h1></div>
    <div class="page-body">
      <LoadingSpinner v-if="loading" message="加载打分项..." />
      <EmptyState
        v-else-if="store.scoreItems.length === 0"
        :icon="ClipboardList"
        message="还没有打分项目，先去添加吧"
        action-label="管理打分项"
        @action="$router.push(`/relationship/score-items/${relationshipId}`)"
      />
      <div v-else>
        <!-- 加分项 -->
        <h3 class="mb-1">加分项目</h3>
        <div class="flex flex-wrap gap-1 mb-2">
          <span
            v-for="item in addItems" :key="item.id"
            class="tag tag-add score-chip"
            @click="openConfirm(item)"
          >{{ item.icon || '+' }} {{ item.itemName }} +{{ item.scoreValue }}</span>
        </div>
        <!-- 扣分项 -->
        <h3 class="mb-1">扣分项目</h3>
        <div class="flex flex-wrap gap-1">
          <span
            v-for="item in subItems" :key="item.id"
            class="tag tag-sub score-chip"
            @click="openConfirm(item)"
          >{{ item.icon || '-' }} {{ item.itemName }} {{ item.scoreValue }}</span>
        </div>
      </div>
    </div>

    <!-- 确认弹窗 -->
    <div v-if="selectedItem" class="modal-overlay" @click.self="selectedItem = null">
      <div class="modal-card">
        <h3>{{ selectedItem.isAdd ? '加分' : '扣分' }}：{{ selectedItem.itemName }}</h3>
        <div class="mt-1" style="font-size:32px;font-weight:700" :class="selectedItem.isAdd ? 'text-success' : 'text-error'">
          {{ selectedItem.isAdd ? '+' : '' }}{{ selectedItem.scoreValue }}
        </div>
        <input v-model="reason" class="form-input mt-2" placeholder="备注（可选）" />
        <div class="flex gap-1 mt-2" style="justify-content:flex-end">
          <button class="btn btn-sm" @click="selectedItem = null">取消</button>
          <button class="btn btn-primary btn-sm" @click="doScore">确认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRelationshipStore } from '../../stores/relationship'
import { useAuthStore } from '../../stores/auth'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { ClipboardList } from 'lucide-vue-next'
import toast from '@/utils/toast'

const props = defineProps({ relationshipId: Number })
const store = useRelationshipStore()
const auth = useAuthStore()
const loading = ref(false)
const selectedItem = ref(null)
const reason = ref('')

const addItems = computed(() => store.scoreItems.filter(i => i.type === 'ADD'))
const subItems = computed(() => store.scoreItems.filter(i => i.type === 'SUB'))

// 获取对方用户ID
const targetUserId = computed(() => {
  const rel = store.relationships.find(r => r.id === props.relationshipId) || store.relationship
  if (!rel || !auth.user) return null
  return rel.user1Id === auth.user.id ? rel.user2Id : rel.user1Id
})

onMounted(async () => {
  loading.value = true
  await store.loadScoreItems(props.relationshipId)
  loading.value = false
})

function openConfirm(item) {
  selectedItem.value = item
  reason.value = item.itemName
}

async function doScore() {
  if (!selectedItem.value) return
  try {
    await store.scorePartner(
      props.relationshipId,
      selectedItem.value.id,
      reason.value,
      targetUserId.value
    )
    selectedItem.value = null
    toast.success('打分成功！已自动发送聊天消息通知对方。')
    await store.loadScores(props.relationshipId)
  } catch (e) {
    toast.error(e.response?.data?.message || '打分失败')
  }
}
</script>

<style scoped>
.score-chip { cursor: pointer; user-select: none; transition: transform 0.15s; }
.score-chip:active { transform: scale(0.95); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
.modal-card { background: var(--surface); border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 340px; }
</style>
