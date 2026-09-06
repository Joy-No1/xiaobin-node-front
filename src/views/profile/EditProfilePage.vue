<template>
  <div class="page edit-profile-page">
    <div class="page-header flex-between">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h1>编辑资料</h1>
      <button class="btn btn-primary btn-sm" :disabled="saving" @click="save">
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </div>
    <div class="page-body" v-if="auth.user">
      <!-- 头像编辑 -->
      <div class="avatar-section">
        <div class="avatar-upload" @click="triggerUpload">
          <UserAvatar :src="avatarPreview || auth.user.avatarUrl" :name="form.nickname || auth.user.nickname" :size="80" />
          <div class="avatar-overlay">
            <Camera :size="18" />
            <span v-if="!uploading">更换头像</span>
            <span v-else>上传中...</span>
          </div>
        </div>
        <p class="avatar-hint">点击头像更换</p>
      </div>
      <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
      <input ref="backgroundInput" type="file" accept="image/*" style="display:none" @change="onBackgroundChange" />

      <!-- 基础信息卡片 -->
      <div class="info-card">
        <div class="card-title">基础信息</div>
        <div class="form-group">
          <label class="form-label">昵称</label>
          <input v-model="form.nickname" class="form-input" :placeholder="auth.user.nickname || '请输入昵称'" />
        </div>
        <div class="form-group">
          <label class="form-label">邮箱</label>
          <input v-model="form.email" type="email" class="form-input" :placeholder="auth.user.email || '请输入邮箱'" />
        </div>
        <div class="form-group">
          <label class="form-label">简介</label>
          <textarea v-model="form.bio" class="form-input" rows="3" :placeholder="auth.user.bio || '介绍一下自己...'"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">性别</label>
          <div class="gender-buttons">
            <button
              class="gender-btn"
              :class="{ active: form.gender === 'MALE' }"
              @click="form.gender = 'MALE'"
            >
              男
            </button>
            <button
              class="gender-btn"
              :class="{ active: form.gender === 'FEMALE' }"
              @click="form.gender = 'FEMALE'"
            >
              女
            </button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">生日</label>
          <div class="form-picker-trigger" @click="openBirthdayPicker">
            <span :class="{ placeholder: !birthdayDisplay }">{{ birthdayDisplay || '请选择生日' }}</span>
            <span class="picker-arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 工作教育卡片 -->
      <div class="info-card">
        <div class="card-title">工作与教育</div>
        <div class="form-group">
          <label class="form-label">公司</label>
          <input v-model="form.company" class="form-input" placeholder="输入公司名称" />
        </div>
        <div class="form-group">
          <label class="form-label">学校</label>
          <input v-model="form.school" class="form-input" placeholder="输入学校名称" />
        </div>
        <div class="form-group">
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
      </div>

      <!-- 其他信息卡片 -->
      <div class="info-card">
        <div class="card-title">其他信息</div>
        <div class="form-group">
          <label class="form-label">背景图</label>
          <div class="background-upload-row" @click="triggerBackgroundUpload">
            <div class="background-preview">
              <img
                v-if="backgroundPreview || auth.user.profileBackgroundUrl"
                :src="backgroundPreview || auth.user.profileBackgroundUrl"
                alt="背景图"
              />
              <div v-else class="background-empty">
                <Image :size="20" />
              </div>
            </div>
            <span class="upload-text">{{ uploadingBackground ? '上传中...' : '点击上传背景图' }}</span>
            <span class="picker-arrow">›</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group" style="flex:1">
            <label class="form-label">身高 (cm)</label>
            <input type="number" v-model="form.height" class="form-input" placeholder="170" step="0.1" min="0" />
          </div>
          <div class="form-group" style="flex:1">
            <label class="form-label">体重 (kg)</label>
            <input type="number" v-model="form.weight" class="form-input" placeholder="60" step="0.1" min="0" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">地区</label>
          <div class="form-picker-trigger" @click="openRegionPicker">
            <span :class="{ placeholder: !regionDisplay }">{{ regionDisplay || '请选择地区' }}</span>
            <span class="picker-arrow">›</span>
          </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import * as api from '../../services/api'
import UserAvatar from '../../components/UserAvatar.vue'
import WheelPicker from '../../components/WheelPicker.vue'
import { Camera, Image } from 'lucide-vue-next'
import toast from '@/utils/toast'

const router = useRouter()
const auth = useAuthStore()

const saving = ref(false)
const uploading = ref(false)
const avatarUrl = ref(auth.user?.avatarUrl || '')
const avatarPreview = ref('')
const fileInput = ref(null)

// 背景图相关
const uploadingBackground = ref(false)
const backgroundUrl = ref(auth.user?.profileBackgroundUrl || '')
const backgroundPreview = ref('')
const backgroundInput = ref(null)

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
const regionSelected = ref(['', '', '']) // [provinceCode, cityCode, districtCode]
const provinces = ref([]) // 省份列表
const cities = ref([]) // 城市列表
const districts = ref([]) // 区县列表
const loadingRegion = ref(false)

// 防抖定时器
let cityDebounceTimer = null
let districtDebounceTimer = null

// 缓存已加载的数据，避免重复请求
const regionCache = new Map()

// 省份列
const provinceColumn = computed(() => ({
  items: provinces.value.map(p => ({ label: p.name, value: p.code })),
  flex: 1.2,
}))

// 城市列
const cityColumn = computed(() => ({
  items: cities.value.map(c => ({ label: c.name, value: c.code })),
  flex: 1.2,
}))

// 区县列
const districtColumn = computed(() => ({
  items: districts.value.map(d => ({ label: d.name, value: d.code })),
  flex: 1,
}))

const regionColumns = computed(() => [provinceColumn.value, cityColumn.value, districtColumn.value])

// 加载省份列表
async function loadProvinces() {
  try {
    loadingRegion.value = true

    // 检查缓存
    if (regionCache.has('provinces')) {
      provinces.value = regionCache.get('provinces')
    } else {
      provinces.value = await api.getProvinces()
      regionCache.set('provinces', provinces.value)
    }

    if (provinces.value.length > 0 && !regionSelected.value[0]) {
      // 默认选中第一个省份
      regionSelected.value[0] = provinces.value[0].code
      await loadCities(provinces.value[0].code)
    }
  } catch (error) {
    console.error('加载省份失败:', error)
    toast.error('加载省份失败')
  } finally {
    loadingRegion.value = false
  }
}

// 加载城市列表（带防抖）
async function loadCities(provinceCode, immediate = false) {
  // 清除之前的定时器
  if (cityDebounceTimer) {
    clearTimeout(cityDebounceTimer)
    cityDebounceTimer = null
  }

  const doLoad = async () => {
    try {
      // 检查缓存
      const cacheKey = `cities_${provinceCode}`
      if (regionCache.has(cacheKey)) {
        cities.value = regionCache.get(cacheKey)
      } else {
        cities.value = await api.getRegionChildren(provinceCode)
        regionCache.set(cacheKey, cities.value)
      }

      if (cities.value.length > 0 && !regionSelected.value[1]) {
        regionSelected.value[1] = cities.value[0].code
        await loadDistricts(cities.value[0].code, true)
      }
    } catch (error) {
      console.error('加载城市失败:', error)
      toast.error('加载城市失败')
    }
  }

  if (immediate) {
    await doLoad()
  } else {
    // 防抖延迟 300ms
    cityDebounceTimer = setTimeout(doLoad, 300)
  }
}

// 加载区县列表（带防抖）
async function loadDistricts(cityCode, immediate = false) {
  // 清除之前的定时器
  if (districtDebounceTimer) {
    clearTimeout(districtDebounceTimer)
    districtDebounceTimer = null
  }

  const doLoad = async () => {
    try {
      // 检查缓存
      const cacheKey = `districts_${cityCode}`
      if (regionCache.has(cacheKey)) {
        districts.value = regionCache.get(cacheKey)
      } else {
        districts.value = await api.getRegionChildren(cityCode)
        regionCache.set(cacheKey, districts.value)
      }

      if (districts.value.length > 0 && !regionSelected.value[2]) {
        regionSelected.value[2] = districts.value[0].code
      }
    } catch (error) {
      console.error('加载区县失败:', error)
      toast.error('加载区县失败')
    }
  }

  if (immediate) {
    await doLoad()
  } else {
    // 防抖延迟 300ms
    districtDebounceTimer = setTimeout(doLoad, 300)
  }
}

// 地区选择变化
async function onRegionChange({ columnIndex, selected }) {
  if (columnIndex === 0) {
    // 省份变了，重新加载城市
    regionSelected.value = [selected[0], '', '']
    cities.value = []
    districts.value = []
    await loadCities(selected[0], false) // 使用防抖
  } else if (columnIndex === 1) {
    // 城市变了，重新加载区县
    regionSelected.value = [selected[0], selected[1], '']
    districts.value = []
    await loadDistricts(selected[1], false) // 使用防抖
  } else {
    regionSelected.value = selected
  }
}

const regionDisplay = computed(() => {
  const [pv, cv, dv] = regionSelected.value
  if (!pv) return ''

  const prov = provinces.value.find(p => p.code === pv)
  const city = cities.value.find(c => c.code === cv)
  const district = districts.value.find(d => d.code === dv)

  return [prov?.name, city?.name, district?.name].filter(Boolean).join(' ')
})

// 从已有数据初始化地区
async function initRegion() {
  await loadProvinces()

  const loc = auth.user?.location
  if (loc && loc.province) {
    const prov = provinces.value.find(p => p.name === loc.province)
    if (prov) {
      regionSelected.value[0] = prov.code
      await loadCities(prov.code)

      if (loc.city) {
        const city = cities.value.find(c => c.name === loc.city)
        if (city) {
          regionSelected.value[1] = city.code
          await loadDistricts(city.code)

          if (loc.district) {
            const dist = districts.value.find(d => d.name === loc.district)
            if (dist) {
              regionSelected.value[2] = dist.code
            }
          }
        }
      }
    }
  }
}

async function openRegionPicker() {
  showRegionPicker.value = true
  if (provinces.value.length === 0) {
    await initRegion()
  }
}

function confirmRegion() {
  showRegionPicker.value = false
}

// ---- 表单 ----
const form = ref({
  nickname: auth.user?.nickname || '',
  email: auth.user?.email || '',
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

// ---- 上传背景图 ----
function triggerBackgroundUpload() {
  backgroundInput.value?.click()
}

async function onBackgroundChange(e) {
  const file = e.target.files?.[0]
  if (!file) return

  // 检查文件大小（限制5MB）
  if (file.size > 5 * 1024 * 1024) {
    toast.error('图片大小不能超过5MB')
    return
  }

  backgroundPreview.value = URL.createObjectURL(file)
  uploadingBackground.value = true
  try {
    const uploadedUrl = await api.uploadFile(file)
    backgroundUrl.value = uploadedUrl
    toast.success('背景图上传成功')
  } catch (err) {
    toast.error(err.response?.data?.message || '背景图上传失败')
    backgroundPreview.value = ''
  } finally {
    uploadingBackground.value = false
    if (backgroundInput.value) backgroundInput.value.value = ''
  }
}

// ---- 保存 ----
async function save() {
  saving.value = true
  try {
    // 请求体：UserDTO { user: {...}, location: { province, city, district } }
    const [pv, cv, dv] = regionSelected.value
    const prov = provinces.value.find(p => p.code === pv)
    const city = cities.value.find(c => c.code === cv)
    const district = districts.value.find(d => d.code === dv)

    const dto = {
      user: {
        nickname: form.value.nickname,
        email: form.value.email || null,
        bio: form.value.bio,
        gender: form.value.gender,
        avatarUrl: avatarUrl.value,
        profileBackgroundUrl: backgroundUrl.value || null,
        birthday: birthdayDisplay.value || null,
        company: form.value.company || null,
        school: form.value.school || null,
        education: form.value.education || null,
        height: form.value.height ? Number(form.value.height) : null,
        weight: form.value.weight ? Number(form.value.weight) : null
      },
      location: {
        province: prov?.name || null,
        city: city?.name || null,
        district: district?.name || null
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
.edit-profile-page {
  background: #F5F6F8;
  min-height: 100vh;
}

.edit-profile-page .page-body {
  background: transparent;
  padding-bottom: 32px;
}

/* 头像区域 */
.avatar-section {
  text-align: center;
  padding: 24px 0 20px;
}

.avatar-upload {
  position: relative;
  display: inline-block;
  cursor: pointer;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
}

.avatar-upload:hover {
  transform: scale(1.05);
}

.avatar-overlay {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-upload:hover .avatar-overlay,
.avatar-upload:active .avatar-overlay {
  opacity: 1;
}

.avatar-hint {
  margin-top: 12px;
  font-size: 13px;
  color: #666;
}

/* 背景图上传行 */
.background-upload-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border: 1px solid #E8EAED;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.background-upload-row:hover {
  border-color: #ccc;
}

.background-preview {
  width: 60px;
  height: 40px;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f5f5;
  flex-shrink: 0;
}

.background-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.background-empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
}

.upload-text {
  flex: 1;
  font-size: 14px;
  color: #666;
}

/* 信息卡片 */
.info-card {
  background: #FAFBFC;
  border-radius: 16px;
  padding: 20px;
  margin: 0 16px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #E8EAED;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #E8EAED;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px;
  background: #fff;
  border: 1px solid #E8EAED;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus {
  background: #fff;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 138, 0.1);
}

/* 性别按钮 */
.gender-buttons {
  display: flex;
  gap: 12px;
}

.gender-btn {
  flex: 1;
  padding: 12px;
  background: #fff;
  border: 2px solid #E8EAED;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.gender-btn:hover {
  border-color: #ccc;
}

.gender-btn.active {
  background: rgba(255, 107, 138, 0.1);
  border-color: var(--primary);
  color: var(--primary);
  font-weight: 600;
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
  padding: 12px;
  background: #fff;
  border: 1px solid #E8EAED;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.form-picker-trigger:hover {
  border-color: #ccc;
}

.form-picker-trigger .placeholder {
  color: #999;
}

.picker-arrow {
  color: #ccc;
  font-size: 20px;
  font-weight: 300;
}

/* 选择器弹窗 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
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
