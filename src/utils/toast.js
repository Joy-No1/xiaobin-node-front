import { createToastInterface, POSITION } from 'vue-toastification'

/**
 * 统一的消息提示工具
 *
 * 使用 createToastInterface 创建独立的 toast 实例，
 * 不需要在 Vue 组件 setup 中调用，可在任何地方使用。
 *
 * 用法：
 *   import toast from '@/utils/toast'
 *   toast.success('操作成功')
 *   toast.error('操作失败')
 *   toast.warning('请注意')
 *   toast.info('提示信息')
 *   toast.default('普通消息')
 */

const toast = createToastInterface({
  position: POSITION.TOP_CENTER,
  timeout: 2500,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: true,
  hideProgressBar: false,
  closeButton: false,
  icon: true,
  rtl: false,
  maxToasts: 3,
  newestOnTop: true,
})

export default {
  /**
   * 成功提示（绿色）
   */
  success(message, options = {}) {
    return toast.success(message, { timeout: 2000, ...options })
  },

  /**
   * 错误提示（红色）- 默认停留更久
   */
  error(message, options = {}) {
    return toast.error(message, { timeout: 4000, ...options })
  },

  /**
   * 警告提示（橙色）
   */
  warning(message, options = {}) {
    return toast.warning(message, { timeout: 3000, ...options })
  },

  /**
   * 信息提示（蓝色）
   */
  info(message, options = {}) {
    return toast.info(message, options)
  },

  /**
   * 默认提示
   */
  default(message, options = {}) {
    return toast(message, options)
  },

  /**
   * 清除所有 toast
   */
  clear() {
    return toast.clear()
  },

  /**
   * 根据 error 对象自动显示错误消息
   * 适用于 axios 错误处理
   */
  fromError(err, fallback = '操作失败') {
    const message = err?.response?.data?.message || err?.message || fallback
    return this.error(message)
  },

  /**
   * 处理 API 调用的结果：成功显示成功消息，失败显示错误消息
   * @param {Promise} promise - API 调用
   * @param {string} successMsg - 成功消息
   * @param {string} fallbackError - 失败时的兜底消息
   */
  async fromPromise(promise, successMsg, fallbackError = '操作失败') {
    try {
      await promise
      this.success(successMsg)
      return true
    } catch (e) {
      this.fromError(e, fallbackError)
      return false
    }
  }
}
