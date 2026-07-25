import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api'
import { useAuthStore } from './auth'

export const useRelationshipStore = defineStore('relationship', () => {
  // 已确认的关系
  const relationship = ref(null)
  // 我发出的请求（对方还没确认）
  const sentRequests = ref([])
  // 我收到的请求（别人发给我的）
  const receivedRequests = ref([])
  // 好感度相关
  const currentScore = ref(100)
  const scoreItems = ref([])
  const scoreRecords = ref([])
  const loading = ref(false)

  const partnerId = computed(() => {
    const auth = useAuthStore()
    const rel = relationship.value
    if (!rel || !auth.user) return null
    return rel.user1Id === auth.user.id ? rel.user2Id : rel.user1Id
  })

  // ====== 加载所有关系数据 ======
  async function loadAll() {
    loading.value = true
    try {
      const [rel, sent, received] = await Promise.all([
        api.getMyRelationship().catch(() => null),
        api.getSentRequests().catch(() => []),
        api.getReceivedRequests().catch(() => [])
      ])
      relationship.value = rel
      sentRequests.value = Array.isArray(sent) ? sent : []
      receivedRequests.value = Array.isArray(received) ? received : []
    } catch (e) {
      relationship.value = null
      sentRequests.value = []
      receivedRequests.value = []
    } finally {
      loading.value = false
    }
  }

  // ====== 校验目标用户 ======
  /**
   * 发起关系前的校验
   * @returns { ok: boolean, error: string, user: object|null }
   */
  async function validateTarget(targetUserId) {
    // 1. 不能给自己发
    const auth = useAuthStore()
    if (targetUserId === auth.user?.id) {
      return { ok: false, error: '不能给自己发送关系请求', user: null }
    }

    // 2. 检查用户是否存在
    let user
    try {
      user = await api.getUserProfile(targetUserId)
    } catch {
      return { ok: false, error: '该用户不存在，请检查ID是否正确', user: null }
    }

    // 3. 检查对方是否已有关系
    try {
      const rel = await api.getUserRelationship(targetUserId)
      if (rel) {
        return { ok: false, error: `${user.nickname} 已经和其他人建立了情侣关系`, user }
      }
    } catch {
      // 如果这个接口还没实现，跳过校验
    }

    // 4. 检查自己是否已有关系
    if (relationship.value) {
      return { ok: false, error: `你已经有情侣关系了，请先解除当前关系`, user }
    }

    // 5. 检查是否已经发过请求给对方
    const alreadySent = sentRequests.value.find(r =>
      (r.user1Id === auth.user?.id && r.user2Id === targetUserId) ||
      (r.user2Id === auth.user?.id && r.user1Id === targetUserId)
    )
    if (alreadySent) {
      return { ok: false, error: '你已经给对方发过请求了，等待对方确认中', user }
    }

    return { ok: true, error: '', user }
  }

  // ====== 操作 ======
  async function createRel(targetUserId) {
    const result = await api.createRelationship(targetUserId)
    await loadAll()
    return result
  }

  async function confirmRel(id) {
    await api.confirmRelationship(id)
    await loadAll()
  }

  async function rejectRel(id) {
    await api.rejectRelationship(id)
    await loadAll()
  }

  async function deleteRel(id) {
    await api.deleteRelationship(id)
    await loadAll()
  }

  async function cancelRequest(id) {
    await api.deleteRelationship(id)
    await loadAll()
  }

  // ====== 好感度相关 ======
  async function loadScores() {
    if (!relationship.value) return
    const data = await api.getScores(relationship.value.id)
    currentScore.value = data.currentScore || 100
  }

  async function loadScoreItems() {
    if (!relationship.value) return
    scoreItems.value = await api.getScoreItems(relationship.value.id) || []
  }

  async function addScoreItem(data) {
    await api.createScoreItem(relationship.value.id, data)
    await loadScoreItems()
  }

  async function editScoreItem(itemId, data) {
    await api.updateScoreItem(relationship.value.id, itemId, data)
    await loadScoreItems()
  }

  async function removeScoreItem(itemId) {
    await api.deleteScoreItem(relationship.value.id, itemId)
    await loadScoreItems()
  }

  async function scorePartner(scoreItemId, reason) {
    const result = await api.scoreUser(relationship.value.id, scoreItemId, reason)
    currentScore.value = result.scoreAfter
    return result
  }

  async function loadRecords(page = 1) {
    if (!relationship.value) return { records: [], hasMore: false }
    const data = await api.getScoreRecords(relationship.value.id, page)
    const all = page === 1 ? data.records : [...scoreRecords.value, ...(data.records || [])]
    scoreRecords.value = all
    return { records: data.records || [], hasMore: data.page < data.pages }
  }

  return {
    relationship, sentRequests, receivedRequests, currentScore, scoreItems, scoreRecords, loading, partnerId,
    loadAll, validateTarget, createRel, confirmRel, rejectRel, deleteRel, cancelRequest,
    loadScores, loadScoreItems, addScoreItem, editScoreItem, removeScoreItem, scorePartner, loadRecords
  }
})
