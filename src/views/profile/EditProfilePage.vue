<template>
  <div class="page">
    <div class="page-header flex-between">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h1>编辑资料</h1>
      <button class="btn btn-primary btn-sm" :disabled="saving" @click="save">
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </div>
    <div class="page-body text-center" v-if="auth.user">
      <UserAvatar :src="auth.user.avatarUrl" :name="form.nickname || auth.user.nickname" :size="72" />
      <div class="form-group mt-2" style="text-align:left">
        <label class="form-label">昵称</label>
        <input v-model="form.nickname" class="form-input" :placeholder="auth.user.nickname" />
      </div>
      <div class="form-group" style="text-align:left">
        <label class="form-label">简介</label>
        <textarea v-model="form.bio" class="form-input" rows="3" :placeholder="auth.user.bio || '介绍一下自己...'"></textarea>
      </div>
      <div class="form-group" style="text-align:left">
        <label class="form-label">性别</label>
        <div class="flex gap-2">
          <label class="radio-label"><input type="radio" v-model="form.gender" value="MALE" /> 男</label>
          <label class="radio-label"><input type="radio" v-model="form.gender" value="FEMALE" /> 女</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import * as api from '../../services/api'
import UserAvatar from '../../components/UserAvatar.vue'

const router = useRouter()
const auth = useAuthStore()
const saving = ref(false)
const form = ref({
  nickname: auth.user?.nickname || '',
  bio: auth.user?.bio || '',
  gender: auth.user?.gender || ''
})

async function save() {
  saving.value = true
  try {
    const updated = await api.updateProfile({
      nickname: form.value.nickname,
      bio: form.value.bio,
      gender: form.value.gender
    })
    auth.updateUser(updated)
    alert('保存成功')
    router.back()
  } catch (e) {
    alert(e.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.radio-label { cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 4px; }
</style>
