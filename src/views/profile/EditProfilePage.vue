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
      <!-- 头像编辑 -->
      <div class="avatar-upload" @click="triggerUpload">
        <UserAvatar :src="avatarPreview || auth.user.avatarUrl" :name="form.nickname || auth.user.nickname" :size="72" />
        <div class="avatar-overlay">
          <span v-if="!uploading"><Camera :size="14" class="inline-icon" /> 更换头像</span>
          <span v-else>上传中...</span>
        </div>
      </div>
      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />

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

      <!-- 生日 - 滚轮选择器 -->
      <div class="form-group" style="text-align:left">
        <label class="form-label">生日</label>
        <div class="form-picker-trigger" @click="openBirthdayPicker">
          <span :class="{ placeholder: !birthdayDisplay }">{{ birthdayDisplay || '请选择生日' }}</span>
          <span class="picker-arrow">›</span>
        </div>
      </div>

      <div class="form-group" style="text-align:left">
        <label class="form-label">公司</label>
        <input v-model="form.company" class="form-input" placeholder="输入公司名称" />
      </div>
      <div class="form-group" style="text-align:left">
        <label class="form-label">学校</label>
        <input v-model="form.school" class="form-input" placeholder="输入学校名称" />
      </div>
      <div class="form-group" style="text-align:left">
        <label class="form-label">学历</label>
        <select v-model="form.education" class="form-input">
          <option value="">请选择</option>
          <option value="HIGH_SCHOOL">高中</option>
          <option value="ASSOCIATE">大专</option>
          <option value="BACHELOR">本科</option>
          <option value="MASTER">硕士研究生</option>
          <option value="DOCTOR">博士研究生</option>
          <option value="OTHER">其他</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-group" style="text-align:left;flex:1">
          <label class="form-label">身高 (cm)</label>
          <input type="number" v-model="form.height" class="form-input" step="0.1" min="0" />
        </div>
        <div class="form-group" style="text-align:left;flex:1">
          <label class="form-label">体重 (kg)</label>
          <input type="number" v-model="form.weight" class="form-input" placeholder="60" step="0.1" min="0" />
        </div>
      </div>

      <!-- 地区 - 级联滚轮选择器 -->
      <div class="form-group" style="text-align:left">
        <label class="form-label">地区</label>
        <div class="form-picker-trigger" @click="openRegionPicker">
          <span :class="{ placeholder: !regionDisplay }">{{ regionDisplay || '请选择地区' }}</span>
          <span class="picker-arrow">›</span>
        </div>
      </div>
    </div>

    <!-- ========== 生日选择器弹窗 ========== -->
    <div v-if="showBirthdayPicker" class="modal-overlay" @click.self="showBirthdayPicker = false">
      <div class="picker-modal">
        <div class="picker-modal-header">
          <button class="btn btn-sm" @click="showBirthdayPicker = false">取消</button>
          <h3>选择生日</h3>
          <button class="btn btn-primary btn-sm" @click="confirmBirthday">确定</button>
        </div>
        <WheelPicker
          v-model="birthdaySelected"
          :columns="birthdayColumns"
          @change="onBirthdayChange"
        />
      </div>
    </div>

    <!-- ========== 地区选择器弹窗 ========== -->
    <div v-if="showRegionPicker" class="modal-overlay" @click.self="showRegionPicker = false">
      <div class="picker-modal">
        <div class="picker-modal-header">
          <button class="btn btn-sm" @click="showRegionPicker = false">取消</button>
          <h3>选择地区</h3>
          <button class="btn btn-primary btn-sm" @click="confirmRegion">确定</button>
        </div>
        <WheelPicker
          v-model="regionSelected"
          :columns="regionColumns"
          @change="onRegionChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import * as api from '../../services/api'
import UserAvatar from '../../components/UserAvatar.vue'
import WheelPicker from '../../components/WheelPicker.vue'
import { regions } from '../../data/region-data'
import { Camera } from 'lucide-vue-next'
import toast from '@/utils/toast'

const router = useRouter()
const auth = useAuthStore()

const saving = ref(false)
const uploading = ref(false)
const avatarUrl = ref(auth.user?.avatarUrl || '')
const avatarPreview = ref('')
const fileInput = ref(null)

// ---- 生日相关 ----
const showBirthdayPicker = ref(false)
const birthdaySelected = ref(['2000', '1', '1']) // [year, month, day]

const currentYear = new Date().getFullYear()

// 计算某年某月的天数
function daysInMonth(year, month) {
  return new Date(Number(year), Number(month), 0).getDate()
}

const birthdayColumns = computed(() => {
  const year = Number(birthdaySelected.value[0]) || 2000
  const month = Number(birthdaySelected.value[1]) || 1
  const maxDay = daysInMonth(year, month)

  const years = []
  for (let y = currentYear; y >= 1940; y--) years.push({ label: `${y}年`, value: String(y) })

  const months = []
  for (let m = 1; m <= 12; m++) months.push({ label: `${m}月`, value: String(m) })

  const days = []
  for (let d = 1; d <= maxDay; d++) days.push({ label: `${d}日`, value: String(d) })

  return [
    { items: years, flex: 1.2 },
    { items: months, flex: 1 },
    { items: days, flex: 1 },
  ]
})

function onBirthdayChange({ columnIndex, selected }) {
  if (columnIndex === 1) {
    // 月份变了，需要刷新天数
    birthdaySelected.value = [...selected]
  }
}

const birthdayDisplay = computed(() => {
  const [y, m, d] = birthdaySelected.value
  if (y && m && d) return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  return ''
})

// 从 user 生日初始化
function initBirthday() {
  const bday = auth.user?.birthday
  if (bday) {
    const d = new Date(bday)
    if (!Number.isNaN(d.getTime())) {
      birthdaySelected.value = [
        String(d.getFullYear()),
        String(d.getMonth() + 1),
        String(d.getDate())
      ]
    }
  }
}
initBirthday()

function openBirthdayPicker() {
  showBirthdayPicker.value = true
}

function confirmBirthday() {
  showBirthdayPicker.value = false
}

// ---- 地区相关 ----
const showRegionPicker = ref(false)
const regionSelected = ref(['', '', '']) // [provinceValue, cityValue, districtValue]

// 省份列
const provinceColumn = computed(() => ({
  items: regions.map(p => ({ label: p.label, value: p.value })),
  flex: 1.2,
}))

// 城市列
const cityColumn = computed(() => {
  const pv = regionSelected.value[0]
  const prov = regions.find(p => p.value === pv)
  const cities = prov?.children || []
  return {
    items: cities.map(c => ({ label: c.label, value: c.value })),
    flex: 1.2,
  }
})

// 区县列
const districtColumn = computed(() => {
  const pv = regionSelected.value[0]
  const cv = regionSelected.value[1]
  const prov = regions.find(p => p.value === pv)
  const city = prov?.children?.find(c => c.value === cv)
  const districts = city?.children || []
  return {
    items: districts.map(d => ({ label: d.label, value: d.value })),
    flex: 1,
  }
})

const regionColumns = computed(() => [provinceColumn.value, cityColumn.value, districtColumn.value])

function onRegionChange({ columnIndex }) {
  const sel = [...regionSelected.value]
  if (columnIndex === 0) {
    // 省份变了，重置城市和区县为第一项
    const prov = regions.find(p => p.value === sel[0])
    const firstCity = prov?.children?.[0]
    sel[1] = firstCity?.value || ''
    sel[2] = firstCity?.children?.[0]?.value || ''
  } else if (columnIndex === 1) {
    // 城市变了，重置区县为第一项
    const prov = regions.find(p => p.value === sel[0])
    const city = prov?.children?.find(c => c.value === sel[1])
    sel[2] = city?.children?.[0]?.value || ''
  }
  regionSelected.value = sel
}

const regionDisplay = computed(() => {
  const [pv, cv, dv] = regionSelected.value
  if (!pv) return ''
  const prov = regions.find(p => p.value === pv)
  const city = prov?.children?.find(c => c.value === cv)
  const district = city?.children?.find(d => d.value === dv)
  return [prov?.label, city?.label, district?.label].filter(Boolean).join(' ')
})

// 从已有数据初始化地区
function initRegion() {
  const loc = auth.location
  if (loc) {
    const prov = regions.find(p => p.label === loc.province)
    if (prov) {
      regionSelected.value[0] = prov.value
      const city = prov.children?.find(c => c.label === loc.city)
      if (city) {
        regionSelected.value[1] = city.value
        const dist = city.children?.find(d => d.label === loc.district)
        regionSelected.value[2] = dist?.value || ''
        return
      }
    }
  }
  // 默认选中第一个
  const p0 = regions[0]
  const c0 = p0?.children?.[0]
  regionSelected.value = [p0?.value || '', c0?.value || '', c0?.children?.[0]?.value || '']
}
initRegion()

function openRegionPicker() {
  showRegionPicker.value = true
}

function confirmRegion() {
  showRegionPicker.value = false
}

// ---- 表单 ----
const form = ref({
  nickname: auth.user?.nickname || '',
  bio: auth.user?.bio || '',
  gender: auth.user?.gender || '',
  company: auth.user?.company || '',
  school: auth.user?.school || '',
  education: auth.user?.education || '',
  height: auth.user?.height || '',
  weight: auth.user?.weight || ''
})

// ---- 上传头像 ----
function triggerUpload() {
  fileInput.value?.click()
}

async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  avatarPreview.value = URL.createObjectURL(file)
  uploading.value = true
  try {
    const uploadedUrl = await api.uploadFile(file)
    avatarUrl.value = uploadedUrl
  } catch (err) {
    toast.error(err.response?.data?.message || '头像上传失败')
    avatarPreview.value = ''
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

// ---- 保存 ----
async function save() {
  saving.value = true
  try {
    // 请求体：UserDTO { user: {...}, location: { province, city, district } }
    const [pv, cv, dv] = regionSelected.value
    const prov = regions.find(p => p.value === pv)
    const city = prov?.children?.find(c => c.value === cv)
    const district = city?.children?.find(d => d.value === dv)

    const dto = {
      user: {
        nickname: form.value.nickname,
        bio: form.value.bio,
        gender: form.value.gender,
        avatarUrl: avatarUrl.value,
        birthday: birthdayDisplay.value || null,
        company: form.value.company || null,
        school: form.value.school || null,
        education: form.value.education || null,
        height: form.value.height ? Number(form.value.height) : null,
        weight: form.value.weight ? Number(form.value.weight) : null
      },
      location: {
        province: prov?.label || null,
        city: city?.label || null,
        district: district?.label || null
      }
    }
    // 响应：UserDTO { user: {...}, location: {...} } → auth.updateUser 自动拆解
    const updated = await api.updateProfile(dto)
    auth.updateUser(updated)
    toast.success('保存成功')
    router.back()
  } catch (e) {
    toast.error(e.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.radio-label { cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 4px; }
.avatar-upload {
  position: relative;
  display: inline-block;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
}
.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0,0,0,0.45);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}
.avatar-upload:hover .avatar-overlay,
.avatar-upload:active .avatar-overlay {
  opacity: 1;
}
.form-row {
  display: flex;
  gap: 12px;
}
/* 选择器触发按钮 */
.form-picker-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--bg);
  border: 1px solid var(--divider);
  border-radius: var(--radius);
  font-size: 14px;
  cursor: pointer;
}
.form-picker-trigger .placeholder {
  color: #999;
}
.picker-arrow {
  color: #ccc;
  font-size: 18px;
}
/* 选择器弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 200;
}
.picker-modal {
  background: var(--surface);
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 400px;
  padding-bottom: env(safe-area-inset-bottom, 16px);
  animation: slideUp 0.25s ease;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.picker-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--divider);
}
.picker-modal-header h3 {
  font-size: 16px;
  margin: 0;
}
</style>
