import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as api from '../services/api'
import { useAuthStore } from './auth'

export const useRelationshipStore = defineStore('relationship', () => {
  // 所有已确认的关系列表（情侣、闺蜜、兄弟等）
  const relationships = ref([])
  // 兼容：单个情侣关系
  const relationship = ref(null)
  // 我发出的请求（对方还没确认）
  const sentRequests = ref([])
  // 我收到的请求（别人发给我的）
  const receivedRequests = ref([])
  // 关系类型字典
  const relationTypes = ref([])
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

  // ====== 加载关系类型字典 ======
  async function loadRelationTypes() {
    try {
      const items = await api.getDictItems('RELATION_TYPE')
      relationTypes.value = (items || []).map(item => ({
        code: item.itemCode,
        name: item.itemName,
        description: item.description || ''
      }))
    } catch (e) {
      // 如果字典接口不可用，使用默认值
      relationTypes.value = [
        { code: 'COUPLE', name: '情侣' },
        { code: 'BESTIE', name: '闺蜜' },
        { code: 'BROTHER', name: '兄弟' }
      ]
    }
  }

  // 获取关系类型名称
  function getTypeName(code) {
    const t = relationTypes.value.find(x => x.code === code)
    return t?.name || code || '关系'
  }

  // 获取关系类型图标
  // 返回 lucide 图标名（供 LucideIcon 组件渲染）
  function getTypeIcon(code) {
    const icons = { COUPLE: 'Heart', BESTIE: 'Users', BROTHER: 'Swords' }
    return icons[code] || 'Handshake'
  }

  // ====== 加载所有关系数据 ======
  async function loadAll() {
    loading.value = true
    try {
      const [allRels, rel, sent, received] = await Promise.all([
        api.getMyRelationships().catch(() => []),
        api.getMyRelationship().catch(() => null),
        api.getSentRequests().catch(() => []),
        api.getReceivedRequests().catch(() => [])
      ])
      relationships.value = Array.isArray(allRels) ? allRels : []
      relationship.value = rel
      sentRequests.value = Array.isArray(sent) ? sent : []
      receivedRequests.value = Array.isArray(received) ? received : []
    } catch (e) {
      relationships.value = []
      relationship.value = null
      sentRequests.value = []
      receivedRequests.value = []
    } finally {
      loading.value = false
    }
  }

  // ====== 校验目标用户 ======
  async function validateTarget(targetUserId, relationType) {
    const auth = useAuthStore()
    if (targetUserId === auth.user?.id) {
      return { ok: false, error: '不能给自己发送关系请求', user: null }
    }

    let dto
    try {
      dto = await api.getUserProfile(targetUserId)
    } catch {
      return { ok: false, error: '该用户不存在，请检查ID是否正确', user: null }
    }
    const user = dto?.user || dto

    // 情侣关系需要检查是否已有情侣（情侣是唯一的）
    if (!relationType || relationType === 'COUPLE') {
      try {
        const rel = await api.getUserRelationship(targetUserId)
        if (rel) {
          return { ok: false, error: `${user.nickname} 已经和其他人建立了情侣关系`, user }
        }
      } catch {
        // 接口未实现则跳过
      }
      if (relationship.value) {
        return { ok: false, error: `你已经有情侣关系了，请先解除当前关系`, user }
      }
    }

    // 检查是否已有相同类型的关系
    const alreadyHas = relationships.value.find(r =>
      r.relationType === relationType && r.status === 'CONFIRMED'
    )
    if (alreadyHas && relationType === 'COUPLE') {
      return { ok: false, error: '你已经有情侣关系了', user }
    }

    return { ok: true, error: '', user }
  }

  // ====== 操作 ======
  async function createRel(targetUserId, relationType) {
    const result = await api.createRelationship(targetUserId, relationType)
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
  async function loadScores(relId) {
    const id = relId || relationship.value?.id
    if (!id) return
    const data = await api.getScores(id)
    currentScore.value = data.currentScore || 100
  }

  async function loadScoreItems(relId) {
    const id = relId || relationship.value?.id
    if (!id) return
    scoreItems.value = await api.getScoreItems(id) || []
  }

  async function addScoreItem(relId, data) {
    const id = relId || relationship.value?.id
    await api.createScoreItem(id, data)
    await loadScoreItems(id)
  }

  async function editScoreItem(relId, itemId, data) {
    const id = relId || relationship.value?.id
    await api.updateScoreItem(id, itemId, data)
    await loadScoreItems(id)
  }

  async function removeScoreItem(relId, itemId) {
    const id = relId || relationship.value?.id
    await api.deleteScoreItem(id, itemId)
    await loadScoreItems(id)
  }

  // 打分并自动发送聊天消息
  async function scorePartner(relId, scoreItemId, reason, targetUserId) {
    const id = relId || relationship.value?.id
    const result = await api.scoreUser(id, scoreItemId, reason)
    currentScore.value = result.scoreAfter

    // 打分后自动发送聊天消息给对方
    if (targetUserId) {
      try {
        const scoreItem = scoreItems.value.find(s => s.id === scoreItemId)
        const scoreText = scoreItem?.score >= 0 ? `+${scoreItem.score}` : `${scoreItem.score}`
        const msgContent = `📊 我给你打了一笔分：${scoreText} 分\n原因：${reason || '无'}\n当前好感度：${result.scoreAfter}`

        // 查找或创建会话
        const conversations = await api.getConversations()
        const myId = useAuthStore().user?.id
        let conversation = conversations.find(conv =>
          (conv.user1Id === myId && conv.user2Id === targetUserId) ||
          (conv.user1Id === targetUserId && conv.user2Id === myId)
        )
        if (!conversation) {
          conversation = await api.createConversation(targetUserId)
        }
        if (conversation?.id) {
          await api.sendMessage(conversation.id, msgContent, targetUserId)
        }
      } catch (e) {
        console.error('发送打分消息失败:', e)
      }
    }

    return result
  }

  async function loadRecords(relId, page = 1) {
    const id = relId || relationship.value?.id
    if (!id) return { records: [], hasMore: false }
    const data = await api.getScoreRecords(id, page)
    const all = page === 1 ? data.records : [...scoreRecords.value, ...(data.records || [])]
    scoreRecords.value = all
    return { records: data.records || [], hasMore: data.page < data.pages }
  }

  return {
    relationships, relationship, sentRequests, receivedRequests, relationTypes,
    currentScore, scoreItems, scoreRecords, loading, partnerId,
    loadRelationTypes, getTypeName, getTypeIcon,
    loadAll, validateTarget, createRel, confirmRel, rejectRel, deleteRel, cancelRequest,
    loadScores, loadScoreItems, addScoreItem, editScoreItem, removeScoreItem, scorePartner, loadRecords
  }
})