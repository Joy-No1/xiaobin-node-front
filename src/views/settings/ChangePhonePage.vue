<template>
  <div class="page change-phone-page">
    <div class="page-header flex-between">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h1>更换手机号</h1>
      <div style="width: 60px"></div>
    </div>

    <div class="page-body">
      <div class="current-phone-card">
        <div class="label">当前手机号</div>
        <div class="phone-number">{{ maskedPhone }}</div>
      </div>

      <form @submit.prevent="handleSubmit" class="phone-form">
        <div class="form-card">
          <div class="form-group">
            <label class="form-label">新手机号</label>
            <input
              v-model="form.newPhone"
              type="tel"
              class="form-input"
              placeholder="请输入新手机号"
              maxlength="11"
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
                :disabled="countdown > 0"
                @click="sendVerifyCode"
              >
                {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
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
import toast from '@/utils/toast'

const router = useRouter()
const auth = useAuthStore()
const submitting = ref(false)
const countdown = ref(0)
const form = ref({
  newPhone: '',
  verifyCode: '',
  password: ''
})

const maskedPhone = computed(() => {
  const phone = auth.user?.phone || ''
  if (phone.length === 11) {
    return phone.substring(0, 3) + '****' + phone.substring(7)
  }
  return phone
})

function sendVerifyCode() {
  if (!form.value.newPhone || form.value.newPhone.length !== 11) {
    toast.error('请输入正确的手机号')
    return
  }

  // TODO: 调用后端接口发送验证码
  // 需要后端提供接口: POST /api/v1/sms/send
  // 请求参数: { phone, type: 'CHANGE_PHONE' }

  toast.success('验证码已发送（需要后端短信接口支持）')

  // 模拟倒计时
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

async function handleSubmit() {
  if (!form.value.newPhone || form.value.newPhone.length !== 11) {
    toast.error('请输入正确的手机号')
    return
  }

  if (!form.value.verifyCode || form.value.verifyCode.length !== 6) {
    toast.error('请输入6位验证码')
    return
  }

  submitting.value = true
  try {
    await api.changePhone(form.value.newPhone, form.value.verifyCode, form.value.password)
    toast.success('手机号更换成功')
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
.change-phone-page {
  background: #F5F6F8;
  min-height: 100vh;
}

.change-phone-page .page-body {
  background: transparent;
  padding: 16px;
}

.current-phone-card {
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

.phone-number {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.phone-form {
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
}
</style>
