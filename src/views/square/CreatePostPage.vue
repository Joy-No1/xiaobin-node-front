<template>
  <div class="page">
    <div class="page-header flex-between">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h1>发布动态</h1>
      <button class="btn btn-primary btn-sm" :disabled="posting" @click="publish">
        {{ posting ? '发布中...' : '发布' }}
      </button>
    </div>
    <div class="page-body">
      <textarea v-model="content" class="form-input" placeholder="分享你的想法..." rows="6" style="resize:vertical"></textarea>

      <div class="flex flex-wrap gap-1 mt-2">
        <div v-for="(img, i) in previews" :key="i" style="position:relative">
          <img :src="img" class="preview-img" />
          <span class="remove-img" @click="removeImg(i)">✕</span>
        </div>
        <button
          v-if="files.length < 9"
          class="add-img-btn"
          @click="$refs.fileInput.click()"
        >＋</button>
      </div>
      <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onFilesChange" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import * as api from '../../services/api'
import toast from '@/utils/toast'

const router = useRouter()
const content = ref('')
const files = ref([])
const previews = ref([])
const posting = ref(false)

function onFilesChange(e) {
  const selected = Array.from(e.target.files)
  selected.forEach(f => {
    if (files.value.length >= 9) return
    files.value.push(f)
    previews.value.push(URL.createObjectURL(f))
  })
}

function removeImg(i) {
  files.value.splice(i, 1)
  previews.value.splice(i, 1)
}

async function publish() {
  if (!content.value.trim() && files.value.length === 0) return
  posting.value = true
  try {
    // 先上传图片
    const imageUrls = []
    for (const f of files.value) {
      const url = await api.uploadFile(f)
      imageUrls.push(url)
    }
    // 发帖
    const fd = new FormData()
    fd.append('content', content.value)
    imageUrls.forEach(url => fd.append('images', url))
    await api.createPost(fd)
    toast.success('发布成功！')
    router.back()
  } catch (e) {
    toast.error(e.response?.data?.message || '发布失败')
  } finally {
    posting.value = false
  }
}
</script>

<style scoped>
.preview-img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
.remove-img { position: absolute; top: -6px; right: -6px; background: #333; color: #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 11px; cursor: pointer; }
.add-img-btn { width: 80px; height: 80px; border: 2px dashed var(--divider); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: var(--text-secondary); cursor: pointer; background: none; }
</style>
