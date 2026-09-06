<template>
  <div class="page settings-page">
    <div class="page-header flex-between">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h1>设置</h1>
      <div style="width: 60px"></div>
    </div>

    <div class="page-body">
      <!-- 账号与安全 -->
      <div class="settings-section">
        <div class="section-title">账号与安全</div>
        <div class="settings-list">
          <div class="settings-item" @click="$router.push('/settings/change-password')">
            <span>修改密码</span>
            <span class="arrow">›</span>
          </div>
          <div class="settings-item" @click="$router.push('/settings/change-phone')">
            <span>更换手机号</span>
            <span class="arrow">›</span>
          </div>
          <div class="settings-item" @click="$router.push('/settings/real-name')">
            <span>实名认证</span>
            <span class="arrow">›</span>
          </div>
          <div class="settings-item" @click="$router.push('/settings/devices')">
            <span>登录设备管理</span>
            <span class="arrow">›</span>
          </div>
          <div class="settings-item" @click="$router.push('/settings/account-recovery')">
            <span>账号找回</span>
            <span class="arrow">›</span>
          </div>
          <div class="settings-item" @click="$router.push('/settings/delete-account')">
            <span class="text-danger">注销账号</span>
            <span class="arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 存储空间 -->
      <div class="settings-section">
        <div class="section-title">存储空间</div>
        <div class="settings-list">
          <div class="settings-item" @click="$router.push('/settings/storage')">
            <span>存储管理</span>
            <span class="arrow">›</span>
          </div>
        </div>
      </div>

      <!-- 关于 -->
      <div class="settings-section">
        <div class="section-title">关于</div>
        <div class="settings-list">
          <div class="settings-item" @click="$router.push('/settings/about')">
            <span>关于小彬</span>
            <span class="arrow">›</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.settings-page {
  background: #F5F6F8;
  min-height: 100vh;
}

.settings-page .page-body {
  background: transparent;
  padding-bottom: 32px;
}

.settings-section {
  margin-bottom: 16px;
}

.section-title {
  padding: 16px 20px 8px;
  font-size: 13px;
  color: #999;
  font-weight: 500;
}

.settings-list {
  background: #fff;
  border-radius: 12px;
  margin: 0 16px;
  overflow: hidden;
}

.settings-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.2s;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:active {
  background: #f5f6f8;
}

.settings-item span {
  font-size: 15px;
  color: #333;
}

.arrow {
  color: #ccc;
  font-size: 20px;
  font-weight: 300;
}

.text-danger {
  color: #ef4444 !important;
}
</style>
