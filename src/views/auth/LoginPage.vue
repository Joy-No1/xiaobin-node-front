<template>
  <div class="page">
    <div class="page-header"><h1>登录</h1></div>
    <div class="page-body">
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label class="form-label">手机号</label>
          <div class="input-wrapper">
            <input
              ref="phoneInput"
              v-model="phone"
              type="tel"
              class="form-input"
              placeholder="请输入手机号"
              maxlength="11"
              @focus="showHistory = true"
              @blur="onPhoneBlur"
            />
            <!-- 登录历史下拉 -->
            <div v-if="showHistory && loginHistory.length > 0" class="history-dropdown">
              <div class="history-header">
                <span>最近登录</span>
                <button type="button" class="clear-all-btn" @click.stop="clearAll">清除全部</button>
              </div>
              <div
                v-for="item in loginHistory"
                :key="item"
                class="history-item"
                @mousedown.prevent="selectHistory(item)"
              >
                <span class="history-text">{{ item }}</span>
                <button
                  type="button"
                  class="remove-btn"
                  @click.stop="removeHistory(item)"
                  title="删除"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { getLoginHistory, addLoginHistory, removeLoginHistory, clearLoginHistory } from '../../utils/loginHistory'
import toast from '@/utils/toast'

const router = useRouter()
const auth = useAuthStore()
const phone = ref('')
const password = ref('')
const loading = ref(false)
const phoneInput = ref(null)
const showHistory = ref(false)
const loginHistory = ref([])

onMounted(() => {
  loginHistory.value = getLoginHistory()
})

function selectHistory(account) {
  phone.value = account
  showHistory.value = false
  phoneInput.value?.focus()
}

function removeHistory(account) {
  removeLoginHistory(account)
  loginHistory.value = getLoginHistory()
  toast.success('已删除')
}

function clearAll() {
  clearLoginHistory()
  loginHistory.value = []
  showHistory.value = false
  toast.success('已清除全部历史')
}

function onPhoneBlur() {
  // 延迟关闭，让点击事件有时间触发
  setTimeout(() => {
    showHistory.value = false
  }, 200)
}

async function handleLogin() {
  if (!phone.value.trim() || !password.value) return
  loading.value = true
  try {
    await auth.login(phone.value.trim(), password.value)
    // 登录成功后保存到历史记录
    addLoginHistory(phone.value.trim())
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

.input-wrapper {
  position: relative;
}

.history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #E8EAED;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  z-index: 100;
  max-height: 280px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
  color: #666;
}

.clear-all-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}

.clear-all-btn:hover {
  color: #2563eb;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background: #f5f6f8;
}

.history-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.remove-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #f0f0f0;
  color: #666;
}
</style>
