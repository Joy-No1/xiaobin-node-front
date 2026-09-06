<template>
  <div class="page real-name-page">
    <div class="page-header flex-between">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h1>实名认证</h1>
      <div style="width: 60px"></div>
    </div>

    <div class="page-body">
      <!-- 认证状态 -->
      <div v-if="isVerified" class="status-card verified">
        <div class="status-icon">✓</div>
        <div class="status-text">已完成实名认证</div>
        <div class="verified-info">
          <div class="info-row">
            <span class="info-label">真实姓名</span>
            <span class="info-value">{{ maskedRealName }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">身份证号</span>
            <span class="info-value">{{ maskedIdCard }}</span>
          </div>
        </div>
      </div>

      <div v-else>
        <div class="status-card unverified">
          <div class="status-icon">!</div>
          <div class="status-text">您还未进行实名认证</div>
          <div class="status-desc">实名认证后可使用更多功能</div>
        </div>

        <form @submit.prevent="handleSubmit" class="verify-form">
          <div class="form-card">
            <div class="form-group">
              <label class="form-label">真实姓名</label>
              <input
                v-model="form.realName"
                type="text"
                class="form-input"
                placeholder="请输入真实姓名"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">身份证号</label>
              <input
                v-model="form.idCard"
                type="text"
                class="form-input"
                placeholder="请输入身份证号"
                maxlength="18"
                required
              />
            </div>
          </div>

          <div class="tips-card">
            <div class="tips-title">温馨提示</div>
            <ul class="tips-list">
              <li>请确保您的真实姓名和身份证号准确无误</li>
              <li>认证信息仅用于身份验证，我们会严格保护您的隐私</li>
              <li>实名认证后信息无法修改，请谨慎填写</li>
            </ul>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
            {{ submitting ? '提交中...' : '提交认证' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '../../services/api'
import toast from '@/utils/toast'

const router = useRouter()
const submitting = ref(false)
const isVerified = ref(false)
const verifiedInfo = ref(null)

const form = ref({
  realName: '',
  idCard: ''
})

const maskedRealName = computed(() => {
  if (!verifiedInfo.value?.realName) return ''
  const name = verifiedInfo.value.realName
  if (name.length <= 2) return name[0] + '*'
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
})

const maskedIdCard = computed(() => {
  if (!verifiedInfo.value?.idCard) return ''
  const id = verifiedInfo.value.idCard
  if (id.length === 18) {
    return id.substring(0, 6) + '********' + id.substring(14)
  }
  return id
})

onMounted(() => {
  loadVerificationStatus()
})

async function loadVerificationStatus() {
  try {
    const result = await api.getRealNameStatus()
    isVerified.value = result.verified || false
    if (result.verified) {
      verifiedInfo.value = {
        realName: result.realName,
        idCard: result.idCard
      }
    }
  } catch (error) {
    console.error('加载认证状态失败:', error)
  }
}

function validateIdCard(idCard) {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(idCard)
}

async function handleSubmit() {
  if (!form.value.realName.trim()) {
    toast.error('请输入真实姓名')
    return
  }

  if (!validateIdCard(form.value.idCard)) {
    toast.error('请输入正确的身份证号')
    return
  }

  submitting.value = true
  try {
    await api.submitRealName(form.value.realName, form.value.idCard)
    toast.success('实名认证提交成功')
    setTimeout(() => {
      loadVerificationStatus()
    }, 1000)
  } catch (error) {
    toast.error(error.response?.data?.message || '认证失败')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.real-name-page {
  background: #F5F6F8;
  min-height: 100vh;
}

.real-name-page .page-body {
  background: transparent;
  padding: 16px;
}

.status-card {
  background: #fff;
  border-radius: 12px;
  padding: 32px 20px;
  text-align: center;
  margin-bottom: 16px;
}

.status-card.verified {
  border: 2px solid #10b981;
}

.status-card.unverified {
  border: 2px solid #f59e0b;
}

.status-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  margin: 0 auto 16px;
}

.verified .status-icon {
  background: #d1fae5;
  color: #10b981;
}

.unverified .status-icon {
  background: #fef3c7;
  color: #f59e0b;
}

.status-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.status-desc {
  font-size: 14px;
  color: #999;
}

.verified-info {
  margin-top: 24px;
  text-align: left;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #666;
}

.info-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.verify-form {
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
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
}

.tips-title {
  font-size: 14px;
  color: #1e40af;
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
  color: #3b82f6;
  padding-left: 16px;
  position: relative;
  margin-bottom: 6px;
  line-height: 1.6;
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
