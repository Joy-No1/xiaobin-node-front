<template>
  <div class="splash flex-center">
    <div class="splash-content fade-in">
      <div class="splash-icon"><Heart :size="72" :fill="'var(--primary)'" :color="'var(--primary)'" /></div>
      <h1 class="splash-title">缘分记账本</h1>
      <div class="spinner-small"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Heart } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

onMounted(async () => {
  const ok = await auth.restoreSession()
  router.replace(ok ? '/relationship' : '/login')
})
</script>

<style scoped>
.splash { min-height: 100vh; background: var(--surface); }
.splash-content { text-align: center; }
.splash-icon { font-size: 72px; margin-bottom: 16px; }
.splash-title { font-size: 28px; color: var(--primary); font-weight: 700; }
.spinner-small {
  width: 28px; height: 28px;
  margin: 24px auto 0;
  border: 3px solid var(--divider);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
