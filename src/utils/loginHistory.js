/**
 * 登录历史记录管理工具
 */

const LOGIN_HISTORY_KEY = 'login_history'
const MAX_HISTORY_COUNT = 5

export function getLoginHistory() {
  try {
    const history = localStorage.getItem(LOGIN_HISTORY_KEY)
    return history ? JSON.parse(history) : []
  } catch {
    return []
  }
}

export function addLoginHistory(account) {
  if (!account || !account.trim()) return

  const history = getLoginHistory()
  const accountTrimmed = account.trim()

  // 移除已存在的相同账号
  const filtered = history.filter(item => item !== accountTrimmed)

  // 添加到开头
  filtered.unshift(accountTrimmed)

  // 保留最多 MAX_HISTORY_COUNT 条
  const updated = filtered.slice(0, MAX_HISTORY_COUNT)

  localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(updated))
}

export function removeLoginHistory(account) {
  const history = getLoginHistory()
  const filtered = history.filter(item => item !== account)
  localStorage.setItem(LOGIN_HISTORY_KEY, JSON.stringify(filtered))
}

export function clearLoginHistory() {
  localStorage.removeItem(LOGIN_HISTORY_KEY)
}
