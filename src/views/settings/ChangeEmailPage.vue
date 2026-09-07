<template>
  <div class="page change-email-page">
    <div class="page-header flex-between">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h1>更换邮箱</h1>
      <div style="width: 60px"></div>
    </div>

    <div class="page-body">
      <div class="current-email-card">
        <div class="label">当前邮箱</div>
        <div class="email-address">{{ currentEmail || '未设置' }}</div>
      </div>

      <form @submit.prevent="handleSubmit" class="email-form">
        <div class="form-card">
          <div class="form-group">
            <label class="form-label">新邮箱</label>
            <input
              v-model="form.newEmail"
              type="email"
              class="form-input"
              placeholder="请输入新邮箱地址"
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
              placeholder="请输入账号密码以验证身份"
              required
            />
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
          {{ submitting ? '提交中...' : '确认更换' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import * as api from '../../services/api'
import toast from '@/utils/toast'

const router = useRouter()
const auth = useAuthStore()
const submitting = ref(false)
const sending = ref(false)
const countdown = ref(0)
const form = ref({
  newEmail: '',
  verifyCode: '',
  password: ''
})

const currentEmail = computed(() => auth.user?.email || '')

function validateEmail(email) {
  const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return reg.test(email)
}

async function sendVerifyCode() {
  if (!form.value.newEmail) {
    toast.error('请输入新邮箱地址')
    return
  }

  if (!validateEmail(form.value.newEmail)) {
    toast.error('请输入正确的邮箱地址')
    return
  }

  sending.value = true
  try {
    await api.sendEmailVerifyCode(form.value.newEmail, 'CHANGE_EMAIL')
    toast.success('验证码已发送到新邮箱，请查收')

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

async function handleSubmit() {
  if (!validateEmail(form.value.newEmail)) {
    toast.error('请输入正确的邮箱地址')
    return
  }

  if (!form.value.verifyCode || form.value.verifyCode.length !== 6) {
    toast.error('请输入6位验证码')
    return
  }

  submitting.value = true
  try {
    await api.changeEmail(form.value.newEmail, form.value.verifyCode, form.value.password)
    toast.success('邮箱更换成功')

    // 更新用户信息
    const updatedUser = { ...auth.user, email: form.value.newEmail }
    auth.updateUser({ user: updatedUser })

    setTimeout(() => {
      router.back()
    }, 1500)
  } catch (error) {
    toast.error(error.response?.data?.message || '更换失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.change-email-page {
  background: #F5F6F8;
  min-height: 100vh;
}

.change-email-page .page-body {
  background: transparent;
  padding: 16px;
}

.current-email-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  text-align: center;
}

.label {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.email-address {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  word-break: break-all;
}

.email-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
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
</style>
