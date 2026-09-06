<template>
  <div class="page">
    <div class="page-header"><button class="btn btn-sm" @click="$router.back()">← 返回</button><h1>管理打分项</h1></div>
    <div class="page-body">
      <LoadingSpinner v-if="loading" />
      <EmptyState v-else-if="items.length === 0" :icon="ClipboardList" message="还没有打分项目，点击右下角添加" />
      <div v-else>
        <div v-for="item in items" :key="item.id" class="card flex-between fade-in">
          <div class="flex gap-2">
            <span v-if="item.icon" style="font-size:24px">{{ item.icon }}</span>
            <ThumbsUp v-else-if="item.type === 'ADD'" :size="24" class="text-success" />
            <ThumbsDown v-else :size="24" class="text-error" />
            <div>
              <div>{{ item.itemName }}</div>
              <span :class="item.type === 'ADD' ? 'text-success' : 'text-error'">
                {{ item.type === 'ADD' ? '+' : '' }}{{ item.scoreValue }}
              </span>
            </div>
          </div>
          <div class="flex gap-1">
            <button class="btn btn-sm" @click="editItem(item)"><PenLine :size="14" /></button>
            <button class="btn btn-sm" style="color:var(--error)" @click="removeItem(item.id)"><Trash2 :size="14" /></button>
          </div>
        </div>
      </div>
    </div>

    <!-- FAB 添加按钮 -->
    <button class="fab" @click="openAdd"><Plus :size="24" /></button>

    <!-- 编辑弹窗 -->
    <div v-if="showDialog" class="modal-overlay" @click.self="showDialog = false">
      <div class="modal-card">
        <h3>{{ editingItem ? '编辑' : '添加' }}打分项</h3>
        <input v-model="form.itemName" class="form-input mt-2" placeholder="名称" />
        <input v-model.number="form.scoreValue" type="number" class="form-input mt-1" placeholder="分值" />
        <input v-model="form.icon" class="form-input mt-1" placeholder="图标（可留空，默认用 thumbs 图标）" />
        <div class="flex gap-1 mt-1">
          <button class="btn btn-sm" :class="{ 'btn-primary': form.type === 'ADD' }" @click="form.type = 'ADD'">加分</button>
          <button class="btn btn-sm" :class="{ 'btn-primary': form.type === 'SUB' }" @click="form.type = 'SUB'">扣分</button>
        </div>
        <div class="flex gap-1 mt-2" style="justify-content:flex-end">
          <button class="btn btn-sm" @click="showDialog = false">取消</button>
          <button class="btn btn-primary btn-sm" @click="saveItem">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRelationshipStore } from '../../stores/relationship'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { ClipboardList, PenLine, Trash2, ThumbsUp, ThumbsDown, Plus } from 'lucide-vue-next'

const props = defineProps({ relationshipId: Number })
const store = useRelationshipStore()
const items = ref([])
const loading = ref(true)
const showDialog = ref(false)
const editingItem = ref(null)
const form = ref({ itemName: '', scoreValue: 10, type: 'ADD', icon: '' })

onMounted(async () => {
  await store.loadScoreItems(props.relationshipId)
  items.value = store.scoreItems
  loading.value = false
})

function openAdd() {
  editingItem.value = null
  form.value = { itemName: '', scoreValue: 10, type: 'ADD', icon: '' }
  showDialog.value = true
}

function editItem(item) {
  editingItem.value = item
  form.value = {
    itemName: item.itemName,
    scoreValue: item.scoreValue,
    type: item.type,
    icon: item.icon || ''
  }
  showDialog.value = true
}

async function saveItem() {
  if (!form.value.itemName.trim()) return
  const data = {
    itemName: form.value.itemName,
    scoreValue: form.value.scoreValue,
    type: form.value.type,
    icon: form.value.icon || undefined
  }
  if (editingItem.value) {
    await store.editScoreItem(props.relationshipId, editingItem.value.id, data)
  } else {
    await store.addScoreItem(props.relationshipId, data)
  }
  items.value = store.scoreItems
  showDialog.value = false
}

async function removeItem(itemId) {
  if (!confirm('确定删除？')) return
  await store.removeScoreItem(props.relationshipId, itemId)
  items.value = store.scoreItems
}
</script>

<style scoped>
.fab {
  position: fixed;
  bottom: 90px;
  right: 20px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  border: none;
  font-size: 26px;
  cursor: pointer;
  box-shadow: 0 3px 12px rgba(255,107,138,0.4);
  z-index: 50;
}
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
.modal-card { background: var(--surface); border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 340px; }
</style>
