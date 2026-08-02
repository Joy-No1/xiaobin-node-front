import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, register as registerApi, getMyProfile } from '../services/api'
import { connect as wsConnect, disconnect as wsDisconnect } from '../services/websocket'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const location = ref(JSON.parse(localStorage.getItem('location') || 'null'))
  const token = ref(localStorage.getItem('token') || '')

  const isLoggedIn = () => !!token.value

  async function login(account, password) {
    const result = await loginApi({ account, password })
    token.value = result.token
    user.value = result.user
    localStorage.setItem('token', result.token)
    localStorage.setItem('user', JSON.stringify(result.user))
    wsConnect()
  }

  async function register(phone, password, nickname) {
    const result = await registerApi({ phone, password, nickname })
    token.value = result.token
    user.value = result.user
    localStorage.setItem('token', result.token)
    localStorage.setItem('user', JSON.stringify(result.user))
    wsConnect()
  }

  async function restoreSession() {
    if (!token.value) return false
    try {
      const dto = await getMyProfile()
      // UserDTO: { user: {...}, location: {...} }
      if (dto?.user) {
        user.value = dto.user
        location.value = dto.location || null
      } else {
        // 兼容旧格式（扁平 User）
        user.value = dto
        location.value = null
      }
      localStorage.setItem('user', JSON.stringify(user.value))
      if (location.value) localStorage.setItem('location', JSON.stringify(location.value))
      wsConnect()
      return true
    } catch {
      logout()
      return false
    }
  }

  function updateUser(updated) {
    // 后端可能返回 UserDTO 或扁平 User
    if (updated?.user) {
      user.value = updated.user
      location.value = updated.location || null
    } else {
      user.value = updated
    }
    localStorage.setItem('user', JSON.stringify(user.value))
    if (location.value) localStorage.setItem('location', JSON.stringify(location.value))
  }

  function logout() {
    token.value = ''
    user.value = null
    location.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('location')
    wsDisconnect()
  }

  return { user, location, token, isLoggedIn, login, register, restoreSession, updateUser, logout }
})
