<template>
  <div class="page">
    <div class="page-header"><h1>邮箱注册</h1></div>
    <div class="page-body">
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label class="form-label">邮箱</label>
          <input
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="请输入邮箱地址"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">验证码</label>
          <div class="verify-code-wrapper">
            <input
              v-model="form.verifyCode"
              type="text"
              class="form-input"
              placeholder="请输入验证码"
              maxlength="6"
              required
            />
            <button
              type="button"
              class="btn btn-sm btn-outline"
              :disabled="countdown > 0 || sending"
              @click="sendVerifyCode"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : (sending ? '发送中...' : '获取验证码') }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="请输入密码（6-20位）"
            minlength="6"
            maxlength="20"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">昵称（可选）</label>
          <input
            v-model="form.nickname"
            type="text"
            class="form-input"
            placeholder="不填则自动生成"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>

      <p class="text-center mt-2">
        <router-link to="/register" class="text-primary">使用手机号注册</router-link>
        <span class="mx-2">|</span>
        <router-link to="/login" class="text-primary">已有账号？去登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import * as api from '../../services/api'
import toast from '@/utils/toast'

const router = useRouter()
const auth = useAuthStore()
const form = ref({
  email: '',
  verifyCode: '',
  password: '',
  nickname: ''
})
const loading = ref(false)
const sending = ref(false)
const countdown = ref(0)

function validateEmail(email) {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return reg.test(email)
}

async function sendVerifyCode() {
  if (!form.value.email) {
    toast.error('请输入邮箱地址')
    return
  }

  if (!validateEmail(form.value.email)) {
    toast.error('请输入正确的邮箱地址')
    return
  }

  sending.value = true
  try {
    await api.sendEmailVerifyCode(form.value.email, 'REGISTER')
    toast.success('验证码已发送到邮箱，请查收')

    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    toast.error(error.response?.data?.message || '发送失败')
  } finally {
    sending.value = false
  }
}

async function handleRegister() {
  if (!validateEmail(form.value.email)) {
    toast.error('请输入正确的邮箱地址')
    return
  }

  if (!form.value.verifyCode || form.value.verifyCode.length !== 6) {
    toast.error('请输入6位验证码')
    return
  }

  if (form.value.password.length < 6 || form.value.password.length > 20) {
    toast.error('密码长度必须为6-20位')
    return
  }

  loading.value = true
  try {
    await api.registerByEmail(
      form.value.email,
      form.value.verifyCode,
      form.value.password,
      form.value.nickname || undefined
    )
    toast.success('注册成功，请登录')
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    toast.error(error.response?.data?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form {
  max-width: 360px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #E8EAED;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.verify-code-wrapper {
  display: flex;
  gap: 12px;
}

.verify-code-wrapper .form-input {
  flex: 1;
}

.verify-code-wrapper .btn {
  flex-shrink: 0;
  white-space: nowrap;
  min-width: 110px;
}

.mx-2 {
  margin: 0 8px;
  color: #ddd;
}
</style>
