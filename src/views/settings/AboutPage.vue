<template>
  <div class="page about-page">
    <div class="page-header flex-between">
      <button class="btn btn-sm" @click="$router.back()">← 返回</button>
      <h1>关于小彬</h1>
      <div style="width: 60px"></div>
    </div>

    <div class="page-body">
      <!-- Logo 区域 -->
      <div class="logo-section">
        <div class="app-logo">
          <div class="logo-icon">小彬</div>
        </div>
        <h2 class="app-name">小彬</h2>
        <div class="app-version">版本 {{ appVersion }}</div>
      </div>

      <!-- 应用信息 -->
      <div class="info-section">
        <div class="info-card">
          <div class="info-item">
            <span class="info-label">应用名称</span>
            <span class="info-value">小彬</span>
          </div>
          <div class="info-item">
            <span class="info-label">当前版本</span>
            <span class="info-value">{{ appVersion }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">发布日期</span>
            <span class="info-value">{{ releaseDate }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">开发团队</span>
            <span class="info-value">小彬团队</span>
          </div>
        </div>
      </div>

      <!-- 功能介绍 -->
      <div class="feature-section">
        <div class="section-title">主要功能</div>
        <div class="feature-card">
          <div class="feature-item">
            <div class="feature-icon">💑</div>
            <div class="feature-content">
              <div class="feature-name">情侣关系管理</div>
              <div class="feature-desc">建立和管理情侣关系，记录美好时光</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">⭐</div>
            <div class="feature-content">
              <div class="feature-name">互动评分系统</div>
              <div class="feature-desc">为对方的行为打分，增进相互了解</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💬</div>
            <div class="feature-content">
              <div class="feature-name">实时聊天</div>
              <div class="feature-desc">随时随地与TA保持联系</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📱</div>
            <div class="feature-content">
              <div class="feature-name">动态广场</div>
              <div class="feature-desc">分享生活点滴，发现有趣内容</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 联系我们 -->
      <div class="contact-section">
        <div class="section-title">联系我们</div>
        <div class="contact-card">
          <div class="contact-item">
            <span class="contact-label">官方邮箱</span>
            <span class="contact-value">support@xiaobin.app</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">用户反馈</span>
            <span class="contact-value">feedback@xiaobin.app</span>
          </div>
          <div class="contact-item">
            <span class="contact-label">商务合作</span>
            <span class="contact-value">business@xiaobin.app</span>
          </div>
        </div>
      </div>

      <!-- 法律信息 -->
      <div class="legal-section">
        <div class="legal-links">
          <a href="#" class="legal-link">用户协议</a>
          <span class="separator">|</span>
          <a href="#" class="legal-link">隐私政策</a>
        </div>
        <div class="copyright">
          © 2026 小彬团队 版权所有
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const appVersion = ref('1.0.0')
const releaseDate = ref('2026-09-06')
</script>

<style scoped>
.about-page {
  background: #F5F6F8;
  min-height: 100vh;
}

.about-page .page-body {
  background: transparent;
  padding: 16px;
  padding-bottom: 40px;
}

.logo-section {
  text-align: center;
  padding: 40px 0;
}

.app-logo {
  display: inline-flex;
  margin-bottom: 16px;
}

.logo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
}

.app-name {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
}

.app-version {
  font-size: 14px;
  color: #999;
}

.info-section,
.feature-section,
.contact-section {
  margin-bottom: 24px;
}

.section-title {
  padding: 0 4px 12px;
  font-size: 15px;
  color: #666;
  font-weight: 600;
}

.info-card,
.feature-card,
.contact-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.info-item,
.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child,
.contact-item:last-child {
  border-bottom: none;
}

.info-label,
.contact-label {
  font-size: 14px;
  color: #666;
}

.info-value,
.contact-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-icon {
  font-size: 32px;
  margin-right: 16px;
  flex-shrink: 0;
}

.feature-content {
  flex: 1;
}

.feature-name {
  font-size: 15px;
  color: #333;
  font-weight: 600;
  margin-bottom: 6px;
}

.feature-desc {
  font-size: 13px;
  color: #999;
  line-height: 1.5;
}

.legal-section {
  text-align: center;
  padding-top: 24px;
}

.legal-links {
  margin-bottom: 12px;
}

.legal-link {
  font-size: 13px;
  color: #3b82f6;
  text-decoration: none;
}

.separator {
  margin: 0 12px;
  color: #ddd;
}

.copyright {
  font-size: 12px;
  color: #999;
}
</style>
