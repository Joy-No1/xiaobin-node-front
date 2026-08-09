<template>
  <div class="page">
    <div class="page-header"><h1>登录</h1></div>
    <div class="page-body">
      <div class="auth-header text-center mt-3">
        <div class="auth-icon"><Heart :size="56" :fill="'var(--primary)'" :color="'var(--primary)'" /></div>
        <h2>好感度记账</h2>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label class="form-label">手机号</label>
          <input v-model="phone" type="tel" class="form-input" placeholder="请输入手机号" maxlength="11" />
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input v-model="password" type="password" class="form-input" placeholder="请输入密码" />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>

      <p class="text-center mt-2">
        <router-link to="/register" class="text-primary">还没有账号？去注册</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { Heart } from 'lucide-vue-next'
import toast from '@/utils/toast'

const router = useRouter()
const auth = useAuthStore()
const phone = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!phone.value.trim() || !password.value) return
  loading.value = true
  try {
    await auth.login(phone.value.trim(), password.value)
    router.replace('/relationship')
  } catch (e) {
    toast.error(e.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-header { margin: 20px 0 32px; }
.auth-icon { font-size: 56px; margin-bottom: 8px; }
.auth-header h2 { color: var(--primary); font-size: 22px; }
.auth-form { max-width: 360px; margin: 0 auto; }
</style>
