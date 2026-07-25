<template>
  <div class="page">
    <div class="page-header"><h1>注册</h1></div>
    <div class="page-body">
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label class="form-label">手机号</label>
          <input v-model="phone" type="tel" class="form-input" placeholder="请输入手机号" maxlength="11" />
        </div>
        <div class="form-group">
          <label class="form-label">昵称</label>
          <input v-model="nickname" class="form-input" placeholder="给自己取个名字" />
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input v-model="password" type="password" class="form-input" placeholder="至少6位密码" />
        </div>
        <div class="form-group">
          <label class="form-label">确认密码</label>
          <input v-model="confirm" type="password" class="form-input" placeholder="再次输入密码" />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
      <p class="text-center mt-2">
        <router-link to="/login" class="text-primary">已有账号？去登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const phone = ref('')
const nickname = ref('')
const password = ref('')
const confirm = ref('')
const loading = ref(false)

async function handleRegister() {
  if (!phone.value.trim() || !nickname.value.trim() || !password.value) return
  if (password.value !== confirm.value) return alert('两次密码不一致')
  if (password.value.length < 6) return alert('密码至少6位')
  loading.value = true
  try {
    await auth.register(phone.value.trim(), password.value, nickname.value.trim())
    router.replace('/relationship')
  } catch (e) {
    alert(e.response?.data?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form { max-width: 360px; margin: 20px auto 0; }
</style>
