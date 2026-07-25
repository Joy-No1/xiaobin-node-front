import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, register as registerApi, getMyProfile } from '../services/api'
import { connect as wsConnect, disconnect as wsDisconnect } from '../services/websocket'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
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
      const u = await getMyProfile()
      user.value = u
      localStorage.setItem('user', JSON.stringify(u))
      wsConnect()
      return true
    } catch {
      logout()
      return false
    }
  }

  function updateUser(updated) {
    user.value = updated
    localStorage.setItem('user', JSON.stringify(updated))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    wsDisconnect()
  }

  return { user, token, isLoggedIn, login, register, restoreSession, updateUser, logout }
})
