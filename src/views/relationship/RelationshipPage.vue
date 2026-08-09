<template>
  <div class="page">
    <div class="page-header flex-between">
      <h1><Handshake :size="20" class="inline-icon" /> 我的关系</h1>
      <button class="btn btn-primary btn-sm" @click="openCreateDialog"><Plus :size="16" class="inline-icon" /> 建立关系</button>
    </div>

    <LoadingSpinner v-if="store.loading" message="加载中..." />

    <div v-else class="page-body">
      <!-- ====== 我的关系列表 ====== -->
      <div v-if="store.relationships.length > 0" class="section">
        <div class="section-title">我的关系</div>
        <div
          v-for="rel in store.relationships"
          :key="rel.id"
          class="card relation-card fade-in"
        >
          <div class="flex gap-2">
            <UserAvatar
              :src="getOtherUser(rel)?.avatarUrl"
              :name="getOtherUser(rel)?.nickname || '?'"
              :size="52"
              @click="goToProfile(rel)"
            />
            <div style="flex:1;min-width:0">
              <div class="flex-between">
                <b class="rel-name" @click="goToProfile(rel)">{{ getOtherUser(rel)?.nickname || '未知用户' }}</b>
                <span class="rel-tag" :class="`tag-${(rel.relationType || 'COUPLE').toLowerCase()}`">
                  <LucideIcon :name="store.getTypeIcon(rel.relationType)" :size="12" /> {{ store.getTypeName(rel.relationType) }}
                </span>
              </div>
              <div class="rel-score">
                好感度：<b :class="getScoreClass(getRelScore(rel))">{{ getRelScore(rel) }}</b>
              </div>
            </div>
          </div>
          <div class="relation-actions">
            <button class="action-btn" @click="goToChat(rel)">
              <MessageCircle :size="20" />
              <span>聊天</span>
            </button>
            <button class="action-btn" @click="$router.push(`/relationship/score/${rel.id}`)">
              <Star :size="20" />
              <span>打分</span>
            </button>
            <button class="action-btn" @click="$router.push(`/relationship/score-history/${rel.id}`)">
              <ClipboardList :size="20" />
              <span>记录</span>
            </button>
            <button class="action-btn danger" @click="confirmDeleteRel(rel)">
              <Scissors :size="20" />
              <span>解除</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 没有关系时的提示 -->
      <EmptyState
        v-if="store.relationships.length === 0 && store.receivedRequests.length === 0 && store.sentRequests.length === 0"
        :icon="Handshake"
        message="还没有任何关系"
        action-label="去建立一段关系吧"
        @action="openCreateDialog"
      />

      <!-- ====== 关系请求 Tab ====== -->
      <div v-if="store.receivedRequests.length > 0 || store.sentRequests.length > 0" class="mt-2">
        <div class="tab-bar">
          <div class="tab-item" :class="{ active: activeTab === 'received' }" @click="switchTab('received')">
            收到的请求
            <span v-if="store.receivedRequests.length" class="tab-badge">{{ store.receivedRequests.length }}</span>
          </div>
          <div class="tab-item" :class="{ active: activeTab === 'sent' }" @click="switchTab('sent')">
            发出的请求
            <span v-if="store.sentRequests.length" class="tab-badge">{{ store.sentRequests.length }}</span>
          </div>
        </div>

        <!-- 收到的请求 -->
        <div v-if="activeTab === 'received'">
          <EmptyState v-if="store.receivedRequests.length === 0" :icon="Inbox" message="暂无收到的关系请求" />
          <div v-else>
            <div v-for="req in store.receivedRequests" :key="req.id" class="card request-card fade-in">
              <div class="flex gap-2">
                <UserAvatar :src="req.initiator?.avatarUrl" :name="req.initiator?.nickname || '?'" :size="44" />
                <div style="flex:1">
                  <b>{{ req.initiator?.nickname || '未知用户' }}</b>
                  <div class="text-secondary" style="font-size:12px">
                    想和你建立{{ store.getTypeName(req.relationType) }}关系
                  </div>
                </div>
              </div>
              <div class="flex gap-1 mt-2" style="justify-content:flex-end">
                <button class="btn btn-outline btn-sm" style="color:var(--error);border-color:var(--error)"
                  @click="handleReject(req)">
                  {{ rejecting === req.id ? '...' : '拒绝' }}
                </button>
                <button class="btn btn-primary btn-sm" @click="handleConfirm(req)" :disabled="confirming === req.id">
                  {{ confirming === req.id ? '确认中...' : '接受' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 发出的请求 -->
        <div v-if="activeTab === 'sent'">
          <EmptyState v-if="store.sentRequests.length === 0" :icon="Send" message="暂无发出的关系请求" />
          <div v-else>
            <div v-for="req in store.sentRequests" :key="req.id" class="card request-card fade-in">
              <div class="flex gap-2">
                <UserAvatar :src="req.target?.avatarUrl" :name="req.target?.nickname || '?'" :size="44" />
                <div style="flex:1">
                  <b>{{ req.target?.nickname || '未知用户' }}</b>
                  <div class="text-secondary" style="font-size:12px">
                    等待对方确认 {{ store.getTypeName(req.relationType) }} 关系...
                    <span v-if="req.status === 'REJECTED'">（已拒绝）</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-1 mt-2" style="justify-content:flex-end">
                <button class="btn btn-sm" style="color:var(--error)" @click="handleCancel(req)">取消请求</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 发起关系弹窗 ====== -->
    <div v-if="showCreateDialog" class="modal-overlay" @click.self="showCreateDialog = false">
      <div class="modal-card">
        <h3>建立新关系</h3>

        <!-- 选择关系类型 -->
        <p class="text-secondary" style="font-size:13px;margin-top:12px">选择关系类型</p>
        <div class="type-grid">
          <div
            v-for="t in store.relationTypes"
            :key="t.code"
            class="type-item"
            :class="{ active: selectedType === t.code }"
            @click="selectedType = t.code"
          >
            <span class="type-icon"><LucideIcon :name="store.getTypeIcon(t.code)" :size="24" /></span>
            <span class="type-name">{{ t.name }}</span>
          </div>
        </div>

        <p class="text-secondary" style="font-size:13px;margin-top:16px">
          输入对方的 <b>手机号</b> 或 <b>用户ID</b> 来查找对方
        </p>

        <!-- 输入手机号或ID -->
        <input v-model="targetInput" class="form-input mt-2" placeholder="输入手机号或用户ID" :disabled="validating || creating"
          @keyup.enter="lookupUser" />
        <div v-if="lookupError" class="form-error mt-1">{{ lookupError }}</div>

        <!-- 查找到的用户信息 -->
        <div v-if="foundUser" class="found-user card mt-2 flex gap-2 fade-in">
          <UserAvatar :src="foundUser.avatarUrl" :name="foundUser.nickname" :size="48" />
          <div style="flex:1">
            <div class="flex-between">
              <b>{{ foundUser.nickname }}</b>
              <span class="tag" :class="foundUser.available ? 'tag-add' : 'tag-sub'">
                {{ foundUser.available ? '可建立关系' : '不可建立' }}
              </span>
            </div>
            <div class="text-secondary" style="font-size:12px">
              ID: {{ foundUser.id }} | {{ foundUser.phone }}
            </div>
          </div>
        </div>

        <div class="flex gap-1 mt-2" style="justify-content:flex-end">
          <button class="btn btn-sm" @click="showCreateDialog = false">取消</button>
          <button class="btn btn-sm" style="color:var(--primary)" @click="openScanner"><ScanLine :size="16" class="inline-icon" /> 扫码</button>
          <button class="btn btn-primary btn-sm" :disabled="creating || validating || !canSend"
            @click="doCreateRelationship">
            {{ creating ? '发送中...' : validating ? '校验中...' : '发送请求' }}
          </button>
        </div>
        <p class="text-secondary text-center mt-2" style="font-size:11px">
          <Lightbulb :size="14" class="inline-icon" /> 让对方打开「我的」页面，扫码即可自动填入ID
        </p>
      </div>
    </div>

    <!-- ====== QR 扫描弹窗 ====== -->
    <div v-if="showScanner" class="modal-overlay" @click.self="closeScanner">
      <div class="modal-card scanner-modal">
        <h3>扫描对方二维码</h3>
        <p class="text-secondary" style="font-size:13px;margin:8px 0">
          将对方二维码对准框内即可自动识别
        </p>
        <div id="qr-reader" style="width:100%;max-width:300px;margin:0 auto;border-radius:8px;overflow:hidden"></div>
        <div v-if="scanResult" class="card mt-2 fade-in">
          <p>扫描成功</p>
          <p><b>{{ scanResult.nickname }}</b></p>
          <p class="text-secondary" style="font-size:12px">ID: {{ scanResult.id }}</p>
          <button class="btn btn-primary btn-sm mt-1" @click="useScanResult">使用此用户</button>
        </div>
        <div v-if="scanError" class="form-error mt-1">{{ scanError }}</div>
        <div class="flex gap-1 mt-2" style="justify-content:flex-end">
          <button class="btn btn-sm" @click="closeScanner">关闭</button>
        </div>
      </div>
    </div>

    <!-- ====== 解除关系弹窗 ====== -->
    <div v-if="showDeleteDialog" class="modal-overlay" @click.self="showDeleteDialog = false">
      <div class="modal-card">
        <h3>解除关系</h3>
        <p class="mt-1 text-secondary">
          确定要解除与 <b>{{ deletingRel ? getOtherUser(deletingRel)?.nickname : '' }}</b> 的
          {{ deletingRel ? store.getTypeName(deletingRel.relationType) : '' }} 关系吗？此操作不可撤销。
        </p>
        <div class="flex gap-1 mt-2" style="justify-content:flex-end">
          <button class="btn btn-sm" @click="showDeleteDialog = false">再想想</button>
          <button class="btn btn-sm" style="background:var(--error);color:#fff" @click="doDeleteRel">确认解除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useRelationshipStore } from '../../stores/relationship'
import { useAuthStore } from '../../stores/auth'
import * as api from '../../services/api'
import { Html5Qrcode } from 'html5-qrcode'
import { Handshake, Plus, MessageCircle, Star, ClipboardList, Scissors, Inbox, Send, ScanLine, Lightbulb } from 'lucide-vue-next'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import UserAvatar from '../../components/UserAvatar.vue'
import LucideIcon from '../../components/LucideIcon.vue'
import toast from '@/utils/toast'

const router = useRouter()
const store = useRelationshipStore()
const auth = useAuthStore()

const activeTab = ref('received')
const showCreateDialog = ref(false)
const selectedType = ref('COUPLE')

function switchTab(tab) {
  activeTab.value = tab
}

const showDeleteDialog = ref(false)
const deletingRel = ref(null)
const showScanner = ref(false)

// 创建关系相关
const targetInput = ref('')
const foundUser = ref(null)
const creating = ref(false)
const validating = ref(false)
const lookupError = ref('')

// 确认/拒绝请求
const confirming = ref(null)
const rejecting = ref(null)

// 扫描
const scanResult = ref(null)
const scanError = ref('')
let html5QrCode = null

const canSend = computed(() => foundUser.value?.available && !creating.value)

// 每个关系的好感度缓存
const relScores = ref({})

onMounted(async () => {
  await store.loadRelationTypes()
  await store.loadAll()
  // 加载每个关系的好感度
  for (const rel of store.relationships) {
    loadRelScore(rel)
  }
})

async function loadRelScore(rel) {
  try {
    const data = await api.getScores(rel.id)
    relScores.value[rel.id] = data?.currentScore ?? 100
  } catch {
    relScores.value[rel.id] = 100
  }
}

function getRelScore(rel) {
  return relScores.value[rel.id] ?? 100
}

function getScoreClass(score) {
  if (score >= 100) return 'score-high'
  if (score >= 60) return 'score-mid'
  return 'score-low'
}

// 获取关系中的对方用户
function getOtherUser(rel) {
  // 优先使用后端直接返回的对方用户对象
  if (rel.otherUser) return rel.otherUser
  // 根据 initiator/target 判断
  const myId = auth.user?.id
  if (rel.initiator && rel.initiator.id !== myId) return rel.initiator
  if (rel.target && rel.target.id !== myId) return rel.target
  // 兜底：根据 user1Id/user2Id 构造
  const otherId = rel.user1Id === myId ? rel.user2Id : rel.user1Id
  return rel.user1Id === myId ? rel.user2 : rel.user1
}

function goToProfile(rel) {
  const other = getOtherUser(rel)
  if (other?.id) {
    router.push(`/profile/${other.id}`)
  }
}

// 打开聊天（查找或创建会话）
async function goToChat(rel) {
  const other = getOtherUser(rel)
  if (!other?.id) return
  try {
    const conversations = await api.getConversations()
    const myId = auth.user?.id
    let conversation = conversations.find(conv =>
      (conv.user1Id === myId && conv.user2Id === other.id) ||
      (conv.user1Id === other.id && conv.user2Id === myId)
    )
    if (!conversation) {
      conversation = await api.createConversation(other.id)
    }
    if (conversation?.id) {
      router.push(`/chat/${conversation.id}`)
    }
  } catch (e) {
    console.error('打开聊天失败:', e)
    toast.error('无法打开聊天，请稍后重试')
  }
}

// ====== 解除关系 ======
function confirmDeleteRel(rel) {
  deletingRel.value = rel
  showDeleteDialog.value = true
}

async function doDeleteRel() {
  if (!deletingRel.value) return
  try {
    await store.deleteRel(deletingRel.value.id)
    showDeleteDialog.value = false
    deletingRel.value = null
  } catch (e) {
    toast.error('操作失败')
  }
}

// ====== 查找用户 ======
let lookupTimer = null
watch(targetInput, (val) => {
  foundUser.value = null
  lookupError.value = ''
  if (!val || val.length < 1) return
  clearTimeout(lookupTimer)
  lookupTimer = setTimeout(() => lookupUser(), 600)
})

async function lookupUser() {
  const input = targetInput.value.trim()
  if (!input) return

  validating.value = true
  lookupError.value = ''
  foundUser.value = null

  try {
    let dto = null

    if (/^\d{11}$/.test(input)) {
      try {
        dto = await api.searchUserByPhone(input)
      } catch {
        const id = Number(input)
        if (!isNaN(id) && id > 0) {
          dto = await api.getUserProfile(id)
        }
      }
    } else {
      const id = Number(input)
      if (isNaN(id) || id <= 0) {
        lookupError.value = '请输入有效的手机号（11位）或用户ID'
        return
      }
      dto = await api.getUserProfile(id)
    }

    const user = dto?.user || dto
    if (!user) {
      lookupError.value = '未找到该用户'
      return
    }

    const result = await store.validateTarget(user.id, selectedType.value)
    if (!result.ok) {
      lookupError.value = result.error
      foundUser.value = { ...user, available: false }
      return
    }

    foundUser.value = { ...user, available: true }
  } catch (e) {
    lookupError.value = '未找到该用户，请检查手机号或ID是否正确'
  } finally {
    validating.value = false
  }
}

// ====== 发送关系请求 ======
async function doCreateRelationship() {
  if (!foundUser.value?.available) return
  creating.value = true
  try {
    await store.createRel(foundUser.value.id, selectedType.value)
    showCreateDialog.value = false
    targetInput.value = ''
    foundUser.value = null
    activeTab.value = 'sent'
    toast.success(`${store.getTypeName(selectedType.value)} 关系请求已发送！`)
  } catch (e) {
    lookupError.value = e.response?.data?.message || '发送失败'
  } finally {
    creating.value = false
  }
}

function openCreateDialog() {
  showCreateDialog.value = true
  targetInput.value = ''
  foundUser.value = null
  lookupError.value = ''
  selectedType.value = 'COUPLE'
}

// ====== 确认 / 拒绝收到的请求 ======
async function handleConfirm(req) {
  confirming.value = req.id
  try {
    await store.confirmRel(req.id)
    toast.success(`🎉 恭喜！你们已经建立了${store.getTypeName(req.relationType)}关系！`)
  } catch (e) {
    toast.error(e.response?.data?.message || '操作失败')
  } finally {
    confirming.value = null
  }
}

async function handleReject(req) {
  rejecting.value = req.id
  try {
    await store.rejectRel(req.id)
  } catch (e) {
    toast.error(e.response?.data?.message || '操作失败')
  } finally {
    rejecting.value = null
  }
}

async function handleCancel(req) {
  if (!confirm('确定取消这个请求吗？')) return
  try {
    await store.cancelRequest(req.id)
  } catch (e) {
    toast.error('操作失败')
  }
}

// ====== QR 扫描 ======
async function openScanner() {
  showScanner.value = true
  scanResult.value = null
  scanError.value = ''
  await nextTick()
  try {
    html5QrCode = new Html5Qrcode('qr-reader')
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (decoded) => {
        try {
          const data = JSON.parse(decoded)
          if (data.id) {
            scanResult.value = { id: data.id, nickname: data.nickname || '', phone: data.phone || '' }
            html5QrCode?.stop().catch(() => { })
          }
        } catch {
          const id = Number(decoded)
          if (!isNaN(id) && id > 0) {
            scanResult.value = { id, nickname: `用户${id}`, phone: '' }
            html5QrCode?.stop().catch(() => { })
          }
        }
      },
      () => { }
    )
  } catch {
    scanError.value = '无法启动相机，请检查权限，或手动输入ID'
  }
}

function closeScanner() {
  if (html5QrCode) { html5QrCode.stop().catch(() => { }); html5QrCode = null }
  showScanner.value = false
  scanResult.value = null
  scanError.value = ''
}

function useScanResult() {
  if (!scanResult.value) return
  targetInput.value = String(scanResult.value.id)
  closeScanner()
  lookupUser()
}
</script>

<style scoped>
.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

/* 关系卡片 */
.relation-card {
  padding: 14px 16px;
  margin-bottom: 10px;
}

.rel-name {
  font-size: 16px;
  cursor: pointer;
}

.rel-name:hover {
  color: var(--primary);
}

.rel-tag {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.tag-couple {
  background: #fce7f3;
  color: #be185d;
}

.tag-bestie {
  background: #ede9fe;
  color: #6d28d9;
}

.tag-brother {
  background: #dbeafe;
  color: #1d4ed8;
}

.rel-score {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.score-high { color: #16a34a; }
.score-mid { color: #d97706; }
.score-low { color: #dc2626; }

/* 关系操作按钮 */
.relation-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--divider);
}

.action-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 4px;
  background: var(--bg);
  border: none;
  border-radius: 8px;
  font-size: 12px;
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s;
}

.action-btn:hover {
  background: var(--hover);
}

.action-btn.danger {
  color: var(--error);
}

.action-btn svg {
  margin-bottom: 2px;
}

/* 请求卡片 */
.request-card {
  animation: fadeIn 0.3s ease;
}

.tab-bar {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  background: var(--surface);
  border-radius: var(--radius);
  overflow: hidden;
}

.tab-item {
  flex: 1;
  padding: 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-item.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.tab-badge {
  background: var(--error);
  color: #fff;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 11px;
  margin-left: 4px;
}

/* 关系类型选择 */
.type-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: 2px solid var(--divider);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-item.active {
  border-color: var(--primary);
  background: rgba(var(--primary-rgb, 59, 130, 246), 0.05);
}

.type-icon {
  font-size: 24px;
}

.type-name {
  font-size: 13px;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 100%;
  max-width: 360px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-card h3 {
  font-size: 18px;
  margin: 0;
}

.found-user {
  padding: 14px;
}

.scanner-modal {
  max-width: 400px;
}
</style>