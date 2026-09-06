<template>
  <div class="page change-password-page">
    <div class="page-header flex-between">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h1>修改密码</h1>
      <div style="width: 60px"></div>
    </div>

    <div class="page-body">
      <form @submit.prevent="handleSubmit" class="password-form">
        <div class="form-card">
          <div class="form-group">
            <label class="form-label">当前密码</label>
            <input
              v-model="form.oldPassword"
              type="password"
              class="form-input"
              placeholder="请输入当前密码"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">新密码</label>
            <input
              v-model="form.newPassword"
              type="password"
              class="form-input"
              placeholder="请输入新密码（6-20位）"
              minlength="6"
              maxlength="20"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">确认新密码</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              class="form-input"
              placeholder="请再次输入新密码"
              required
            />
          </div>
        </div>

        <div class="tips-card">
          <div class="tips-title">密码要求</div>
          <ul class="tips-list">
            <li>密码长度为6-20位</li>
            <li>建议包含字母、数字和特殊字符</li>
            <li>不要使用过于简单的密码</li>
          </ul>
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
          {{ submitting ? '提交中...' : '确认修改' }}
        </button>
      </form>
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
const submitting = ref(false)
const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

async function handleSubmit() {
  if (form.value.newPassword !== form.value.confirmPassword) {
    toast.error('两次输入的新密码不一致')
    return
  }

  if (form.value.newPassword.length < 6 || form.value.newPassword.length > 20) {
    toast.error('新密码长度必须为6-20位')
    return
  }

  submitting.value = true
  try {
    await api.changePassword(form.value.oldPassword, form.value.newPassword)
    toast.success('密码修改成功，请重新登录')
    setTimeout(() => {
      // 清除登录状态
      const auth = useAuthStore()
      auth.logout()
      router.push('/login')
    }, 1500)
  } catch (error) {
    toast.error(error.response?.data?.message || '修改失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.change-password-page {
  background: #F5F6F8;
  min-height: 100vh;
}

.change-password-page .page-body {
  background: transparent;
  padding: 16px;
}

.password-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
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

.tips-card {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.tips-title {
  font-size: 14px;
  color: #92400e;
  font-weight: 600;
  margin-bottom: 8px;
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.tips-list li {
  font-size: 13px;
  color: #b45309;
  padding-left: 16px;
  position: relative;
  margin-bottom: 6px;
}

.tips-list li:last-child {
  margin-bottom: 0;
}

.tips-list li::before {
  content: '•';
  position: absolute;
  left: 0;
}
</style>
