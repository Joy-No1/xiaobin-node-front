import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器：自动添加 token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：401 时清除 token
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.hash = '#/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ==================== Auth ====================
export function register(data) {
  return api.post('/auth/register', data).then(r => r.data.data)
}

export function login(data) {
  return api.post('/auth/login', data).then(r => r.data.data)
}

// ==================== User ====================
export function getMyProfile() {
  return api.get('/users/me').then(r => r.data.data)
}

export function updateProfile(data) {
  return api.put('/users/me', data).then(r => r.data.data)
}

export function getUserProfile(id) {
  return api.get(`/users/${id}`).then(r => r.data.data)
}

// 批量获取用户信息
export function getUsersByIds(ids) {
  return api.post('/users/batch',  ids).then(r => r.data.data)
}

export function searchUserByPhone(phone) {
  return api.get('/users/search', { params: { phone } }).then(r => r.data.data)
}

export function followUser(id) {
  return api.post(`/users/${id}/follow`)
}

export function unfollowUser(id) {
  return api.delete(`/users/${id}/follow`)
}

// ==================== Dict ====================
export function getDictItems(typeCode) {
  return api.get('/dict/items', { params: { typeCode } }).then(r => r.data.data || [])
}

// ==================== Relationship ====================
// 获取我的所有关系列表
export function getMyRelationships() {
  return api.get('/relationships/me').then(r => r.data.data || [])
}

// 发起关系请求（支持指定关系类型）
export function createRelationship(targetUserId, relationType) {
  return api.post('/relationships', null, { params: { targetUserId, relationType } }).then(r => r.data.data)
}
// 确认关系请求
export function confirmRelationship(id) {
  return api.put(`/relationships/${id}/confirm`)
}
// 拒绝关系请求 [🔧 后端需实现 PUT /api/v1/relationships/{id}/reject]
export function rejectRelationship(id) {
  return api.put(`/relationships/${id}/reject`)
}
// 解除关系
export function deleteRelationship(id) {
  return api.delete(`/relationships/${id}`)
}
// 我当前已确认的关系（单个）
export function getMyRelationship() {
  return api.get('/relationships/me').then(r => r.data.data)
}
// 我发出的关系请求列表 [🔧 后端需实现 GET /api/v1/relationships/sent]
export function getSentRequests() {
  return api.get('/relationships/sent').then(r => r.data.data || [])
}
// 我收到的关系请求列表 [🔧 后端需实现 GET /api/v1/relationships/received]
export function getReceivedRequests() {
  return api.get('/relationships/received').then(r => r.data.data || [])
}
// 检查用户是否已有情侣关系 [🔧 后端需实现 GET /api/v1/users/{id}/relationship]
// 返回 null 表示单身，返回 relationship 对象表示已有关系
export function getUserRelationship(userId) {
  return api.get(`/users/${userId}/relationship`).then(r => r.data.data)
}

export function getScores(relationshipId) {
  return api.get(`/relationships/${relationshipId}/scores`).then(r => r.data.data)
}

export function scoreUser(relationshipId, scoreItemId, reason) {
  return api.post(`/relationships/${relationshipId}/scores`, null, {
    params: { scoreItemId, reason }
  }).then(r => r.data.data)
}

export function getScoreItems(relationshipId) {
  return api.get(`/relationships/${relationshipId}/score-items`).then(r => r.data.data)
}

export function createScoreItem(relationshipId, data) {
  return api.post(`/relationships/${relationshipId}/score-items`, data).then(r => r.data.data)
}

export function updateScoreItem(relationshipId, itemId, data) {
  return api.put(`/relationships/${relationshipId}/score-items/${itemId}`, data)
}

export function deleteScoreItem(relationshipId, itemId) {
  return api.delete(`/relationships/${relationshipId}/score-items/${itemId}`)
}

export function getScoreRecords(relationshipId, page = 1, size = 20) {
  return api.get(`/relationships/${relationshipId}/score-records`, {
    params: { page, size }
  }).then(r => r.data.data)
}

// ==================== Post ====================
export function getPosts(page = 1, size = 10) {
  return api.get('/posts', { params: { page, size } }).then(r => r.data.data)
}

export function getPostDetail(id) {
  return api.get(`/posts/${id}`).then(r => r.data.data)
}

export function createPost(formData) {
  return api.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data.data)
}

export function deletePost(id) {
  return api.delete(`/posts/${id}`)
}

export function updatePost(id, formData) {
  return api.put(`/posts/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data.data)
}

export function likePost(id) {
  return api.post(`/posts/${id}/likes`)
}

export function unlikePost(id) {
  return api.delete(`/posts/${id}/likes`)
}

export function getComments(postId, page = 1, size = 20) {
  return api.get(`/posts/${postId}/comments`, { params: { page, size } }).then(r => r.data.data)
}

export function addComment(postId, content, replyToUserId, parentCommentId) {
  return api.post(`/posts/${postId}/comments`, null, {
    params: { content, replyToUserId, parentCommentId }
  }).then(r => r.data.data)
}

export function deleteComment(id) {
  return api.delete(`/comments/${id}`)
}

// ==================== Upload ====================
export function uploadFile(file) {
  const fd = new FormData()
  fd.append('file', file)
  return api.post('/files/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data.data)
}

// ==================== Chat ====================
export function getConversations() {
  return api.get('/chat/conversations').then(r => r.data.data)
}

export function getMessages(conversationId, page = 1, size = 20) {
  return api.get(`/chat/conversations/${conversationId}/messages`, {
    params: { page, size }
  }).then(r => r.data.data)
}

export function markRead(conversationId) {
  return api.put(`/chat/conversations/${conversationId}/read`)
}

// 创建会话
export function createConversation(targetUserId) {
  return api.post('/chat/conversations', null, { params: { targetUserId } }).then(r => r.data.data)
}

// 发送消息
export function sendMessage(conversationId, content, receiverId) {
  return api.post(`/chat/conversations/${conversationId}/messages`, null, {
    params: { content, receiverId }
  }).then(r => r.data.data)
}

// ==================== Notifications ====================
export function getNotifications(page = 1, size = 20) {
  return api.get('/notifications', { params: { page, size } }).then(r => r.data.data)
}

export function markNotificationAsRead(id) {
  return api.put(`/notifications/${id}/read`)
}

export function getUnreadNotificationCount() {
  return api.get('/notifications/unread-count').then(r => r.data.data)
}

// ==================== My Profile (Follow/Likes/Comments) ====================
export function getMyFollowing(page = 1, size = 20) {
  return api.get('/me/following', { params: { page, size } }).then(r => r.data.data)
}

export function getMyLikes(page = 1, size = 20) {
  return api.get('/me/likes', { params: { page, size } }).then(r => r.data.data)
}

export function getMyComments(page = 1, size = 20) {
  return api.get('/me/comments', { params: { page, size } }).then(r => r.data.data)
}

// ==================== Online Status ====================
export function checkUserOnline(userId) {
  return api.get(`/online/check/${userId}`).then(r => r.data.data)
}

export function batchCheckOnline(userIds) {
  return api.post('/online/batch-check', userIds).then(r => r.data.data)
}

export function getOnlineCount() {
  return api.get('/online/count').then(r => r.data.data)
}

export function getUserConnections(userId) {
  return api.get(`/online/connections/${userId}`).then(r => r.data.data)
}
