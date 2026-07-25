<template>
  <div class="page">
    <div class="page-header"><h1>💕 好感度</h1></div>

    <LoadingSpinner v-if="store.loading" message="加载中..." />

    <!-- ====== 有确认的关系：显示好感度主页 ====== -->
    <div v-else-if="store.relationship" class="page-body text-center">
      <ScoreRing :score="store.currentScore" class="mt-2" />
      <div class="action-grid mt-2">
        <div class="action-item" @click="$router.push(`/relationship/score/${store.relationship.id}`)">
          <div class="action-icon bg-success">➕</div>
          <span>加分</span>
        </div>
        <div class="action-item" @click="$router.push(`/relationship/score/${store.relationship.id}`)">
          <div class="action-icon bg-error">➖</div>
          <span>扣分</span>
        </div>
        <div class="action-item" @click="$router.push(`/relationship/score-history/${store.relationship.id}`)">
          <div class="action-icon bg-warning">📋</div>
          <span>记录</span>
        </div>
        <div class="action-item" @click="$router.push(`/relationship/score-items/${store.relationship.id}`)">
          <div class="action-icon bg-muted">⚙️</div>
          <span>管理</span>
        </div>
      </div>
      <button class="btn btn-outline btn-sm mt-3" style="color:var(--error);border-color:var(--error)" @click="showDeleteDialog = true">
        解除关系
      </button>
    </div>

    <!-- ====== 无确认关系：展示请求列表 ====== -->
    <div v-else class="page-body">
      <!-- Tab 切换 -->
      <div class="tab-bar">
        <div
          class="tab-item"
          :class="{ active: activeTab === 'received' }"
          @click="activeTab = 'received'"
        >
          收到的请求
          <span v-if="store.receivedRequests.length" class="tab-badge">{{ store.receivedRequests.length }}</span>
        </div>
        <div
          class="tab-item"
          :class="{ active: activeTab === 'sent' }"
          @click="activeTab = 'sent'"
        >
          发出的请求
          <span v-if="store.sentRequests.length" class="tab-badge">{{ store.sentRequests.length }}</span>
        </div>
      </div>

      <!-- 收到的请求 -->
      <div v-if="activeTab === 'received'">
        <EmptyState
          v-if="store.receivedRequests.length === 0"
          icon="📥"
          message="暂无收到的关系请求"
          action-label="发起关系"
          @action="openCreateDialog"
        />
        <div v-else>
          <div v-for="req in store.receivedRequests" :key="req.id" class="card request-card fade-in">
            <div class="flex gap-2">
              <UserAvatar :src="req.initiator?.avatarUrl" :name="req.initiator?.nickname || '?'" :size="44" />
              <div style="flex:1">
                <b>{{ req.initiator?.nickname || '未知用户' }}</b>
                <div class="text-secondary" style="font-size:12px">想和你建立情侣关系</div>
              </div>
            </div>
            <div class="flex gap-1 mt-2" style="justify-content:flex-end">
              <button class="btn btn-outline btn-sm" style="color:var(--error);border-color:var(--error)" @click="handleReject(req)">
                {{ rejecting === req.id ? '...' : '拒绝' }}
              </button>
              <button class="btn btn-primary btn-sm" @click="handleConfirm(req)" :disabled="confirming === req.id">
                {{ confirming === req.id ? '确认中...' : '💕 接受' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 发出的请求 -->
      <div v-if="activeTab === 'sent'">
        <EmptyState
          v-if="store.sentRequests.length === 0"
          icon="📤"
          message="暂无发出的关系请求"
          action-label="发起关系"
          @action="openCreateDialog"
        />
        <div v-else>
          <div v-for="req in store.sentRequests" :key="req.id" class="card request-card fade-in">
            <div class="flex gap-2">
              <UserAvatar :src="req.target?.avatarUrl" :name="req.target?.nickname || '?'" :size="44" />
              <div style="flex:1">
                <b>{{ req.target?.nickname || '未知用户' }}</b>
                <div class="text-secondary" style="font-size:12px">
                  等待对方确认中...
                  <span v-if="req.status">{{ req.status === 'REJECTED' ? '已拒绝' : '' }}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-1 mt-2" style="justify-content:flex-end">
              <button class="btn btn-sm" style="color:var(--error)" @click="handleCancel(req)">取消请求</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 发起新关系 -->
      <div class="text-center mt-3">
        <button class="btn btn-primary" @click="openCreateDialog">💕 发起新的关系</button>
      </div>
    </div>

    <!-- ====== 发起关系弹窗 ====== -->
    <div v-if="showCreateDialog" class="modal-overlay" @click.self="showCreateDialog = false">
      <div class="modal-card">
        <h3>发起情侣关系</h3>
        <p class="text-secondary" style="font-size:13px;margin-top:4px">
          输入对方的 <b>手机号</b> 或 <b>用户ID</b> 来查找对方
        </p>

        <!-- 输入手机号或ID -->
        <input
          v-model="targetInput"
          class="form-input mt-2"
          placeholder="输入手机号或用户ID"
          :disabled="validating || creating"
          @keyup.enter="lookupUser"
        />
        <div v-if="lookupError" class="form-error mt-1">{{ lookupError }}</div>

        <!-- 查找到的用户信息 -->
        <div v-if="lookupUser" class="found-user card mt-2 flex gap-2 fade-in">
          <UserAvatar :src="foundUser.avatarUrl" :name="foundUser.nickname" :size="48" />
          <div style="flex:1">
            <div class="flex-between">
              <b>{{ foundUser.nickname }}</b>
              <span v-if="foundUser.status" class="tag" :class="foundUser.available ? 'tag-add' : 'tag-sub'">
                {{ foundUser.available ? '✅ 可建立关系' : '❌ 已有情侣' }}
              </span>
            </div>
            <div class="text-secondary" style="font-size:12px">
              ID: {{ foundUser.id }} | 📱 {{ foundUser.phone }}
            </div>
          </div>
        </div>

        <div class="flex gap-1 mt-2" style="justify-content:flex-end">
          <button class="btn btn-sm" @click="showCreateDialog = false">取消</button>
          <button class="btn btn-sm" style="color:var(--primary)" @click="openScanner">📷 扫码</button>
          <button
            class="btn btn-primary btn-sm"
            :disabled="creating || validating || !canSend"
            @click="doCreateRelationship"
          >
            {{ creating ? '发送中...' : validating ? '校验中...' : '发送请求' }}
          </button>
        </div>
        <p class="text-secondary text-center mt-2" style="font-size:11px">
          💡 让对方打开「我的」页面，扫码即可自动填入ID
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
          <p>✅ 扫描成功</p>
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
        <p class="mt-1 text-secondary">确定要解除情侣关系吗？此操作不可撤销。</p>
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
import { useRelationshipStore } from '../../stores/relationship'
import { useAuthStore } from '../../stores/auth'
import * as api from '../../services/api'
import { Html5Qrcode } from 'html5-qrcode'
import ScoreRing from '../../components/ScoreRing.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import UserAvatar from '../../components/UserAvatar.vue'

const store = useRelationshipStore()
const auth = useAuthStore()

const activeTab = ref('received') // 默认显示收到的请求
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
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

onMounted(async () => {
  await store.loadAll()
  if (store.relationship) {
    await Promise.all([store.loadScores(), store.loadScoreItems()])
  }
})

// ====== 查找用户 ======
// 监听输入，防抖查找
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
    let user = null

    // 11 位纯数字 → 按手机号查找
    if (/^\d{11}$/.test(input)) {
      try {
        user = await api.searchUserByPhone(input)
      } catch {
        // 手机号没找到，再尝试当 ID 查
        const id = Number(input)
        if (!isNaN(id) && id > 0) {
          user = await api.getUserProfile(id)
        }
      }
    } else {
      // 非 11 位 → 按 ID 查找
      const id = Number(input)
      if (isNaN(id) || id <= 0) {
        lookupError.value = '请输入有效的手机号（11位）或用户ID'
        return
      }
      user = await api.getUserProfile(id)
    }

    if (!user) {
      lookupError.value = '未找到该用户'
      return
    }

    // 校验是否可建立关系
    const result = await store.validateTarget(user.id)
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
    await store.createRel(foundUser.value.id)
    showCreateDialog.value = false
    targetInput.value = ''
    foundUser.value = null
    activeTab.value = 'sent'
    alert('✅ 关系请求已发送！')
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
}

// ====== 确认 / 拒绝收到的请求 ======
async function handleConfirm(req) {
  confirming.value = req.id
  try {
    await store.confirmRel(req.id)
    alert('🎉 恭喜！你们已经是情侣了！')
  } catch (e) {
    alert(e.response?.data?.message || '操作失败')
  } finally {
    confirming.value = null
  }
}

async function handleReject(req) {
  rejecting.value = req.id
  try {
    await store.rejectRel(req.id)
  } catch (e) {
    alert(e.response?.data?.message || '操作失败')
  } finally {
    rejecting.value = null
  }
}

async function handleCancel(req) {
  if (!confirm('确定取消这个请求吗？')) return
  try {
    await store.cancelRequest(req.id)
  } catch (e) {
    alert('操作失败')
  }
}

// ====== 解除关系 ======
async function doDeleteRel() {
  if (!store.relationship) return
  try {
    await store.deleteRel(store.relationship.id)
    showDeleteDialog.value = false
  } catch (e) {
    alert('操作失败')
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
            html5QrCode?.stop().catch(() => {})
          }
        } catch {
          const id = Number(decoded)
          if (!isNaN(id) && id > 0) {
            scanResult.value = { id, nickname: `用户${id}`, phone: '' }
            html5QrCode?.stop().catch(() => {})
          }
        }
      },
      () => {}
    )
  } catch {
    scanError.value = '无法启动相机，请检查权限，或手动输入ID'
  }
}

function closeScanner() {
  if (html5QrCode) { html5QrCode.stop().catch(() => {}); html5QrCode = null }
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
.action-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.action-item { text-align: center; cursor: pointer; font-size: 13px; }
.action-icon { width: 52px; height: 52px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin: 0 auto 6px; }
.bg-success { background: #E8F8F5; }
.bg-error { background: #FDEDEC; }
.bg-warning { background: #FEF9E7; }
.bg-muted { background: #F2F3F4; }
.tab-bar { display: flex; gap: 0; margin-bottom: 16px; background: var(--surface); border-radius: var(--radius); overflow: hidden; }
.tab-item { flex: 1; padding: 12px; text-align: center; font-size: 14px; font-weight: 500; cursor: pointer; position: relative; color: var(--text-secondary); border-bottom: 2px solid transparent; transition: all 0.2s; }
.tab-item.active { color: var(--primary); border-bottom-color: var(--primary); }
.tab-badge { background: var(--error); color: #fff; border-radius: 10px; padding: 0 6px; font-size: 11px; margin-left: 4px; }
.request-card { animation: fadeIn 0.3s ease; }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
.modal-card { background: var(--surface); border-radius: var(--radius-lg); padding: 24px; width: 100%; max-width: 360px; max-height: 85vh; overflow-y: auto; }
.modal-card h3 { font-size: 18px; }
.found-user { padding: 14px; }
.scanner-modal { max-width: 400px; }
</style>
