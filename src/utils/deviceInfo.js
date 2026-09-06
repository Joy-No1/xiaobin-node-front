/**
 * 设备信息采集工具
 * 用于在用户登录时收集设备和浏览器信息
 */

const DEVICE_ID_KEY = 'device_id'

/**
 * 获取或生成设备ID
 * 优先从 localStorage 读取，首次访问时通过 crypto.randomUUID() 生成
 */
export function getOrCreateDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY)

  if (!deviceId) {
    // 使用 crypto.randomUUID() 生成标准 UUID
    if (crypto && crypto.randomUUID) {
      deviceId = crypto.randomUUID()
    } else {
      // 降级方案：如果浏览器不支持 crypto.randomUUID()
      deviceId = generateFallbackUUID()
    }

    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }

  return deviceId
}

/**
 * 降级方案：生成类似 UUID 的字符串
 */
function generateFallbackUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 解析操作系统信息
 */
function parseOS(userAgent) {
  let osName = 'Unknown'
  let osVersion = ''

  if (userAgent.includes('Windows NT 10.0')) {
    osName = 'Windows'
    osVersion = '10'
  } else if (userAgent.includes('Windows NT 6.3')) {
    osName = 'Windows'
    osVersion = '8.1'
  } else if (userAgent.includes('Windows NT 6.2')) {
    osName = 'Windows'
    osVersion = '8'
  } else if (userAgent.includes('Windows NT 6.1')) {
    osName = 'Windows'
    osVersion = '7'
  } else if (userAgent.includes('Windows NT')) {
    osName = 'Windows'
    const match = userAgent.match(/Windows NT ([\d.]+)/)
    osVersion = match ? match[1] : ''
  } else if (userAgent.includes('Mac OS X')) {
    osName = 'macOS'
    const match = userAgent.match(/Mac OS X ([\d_]+)/)
    osVersion = match ? match[1].replace(/_/g, '.') : ''
  } else if (userAgent.includes('iPhone OS')) {
    osName = 'iOS'
    const match = userAgent.match(/iPhone OS ([\d_]+)/)
    osVersion = match ? match[1].replace(/_/g, '.') : ''
  } else if (userAgent.includes('iPad')) {
    osName = 'iPadOS'
    const match = userAgent.match(/OS ([\d_]+)/)
    osVersion = match ? match[1].replace(/_/g, '.') : ''
  } else if (userAgent.includes('Android')) {
    osName = 'Android'
    const match = userAgent.match(/Android ([\d.]+)/)
    osVersion = match ? match[1] : ''
  } else if (userAgent.includes('Linux')) {
    osName = 'Linux'
  }

  return { osName, osVersion }
}

/**
 * 解析浏览器信息
 */
function parseBrowser(userAgent) {
  let browser = 'Unknown'
  let browserVersion = ''

  // 检测顺序很重要，因为很多浏览器的 UA 都包含 Safari
  if (userAgent.includes('Edg/')) {
    browser = 'Edge'
    const match = userAgent.match(/Edg\/([\d.]+)/)
    browserVersion = match ? match[1] : ''
  } else if (userAgent.includes('Chrome/') && !userAgent.includes('Edg')) {
    browser = 'Chrome'
    const match = userAgent.match(/Chrome\/([\d.]+)/)
    browserVersion = match ? match[1] : ''
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    browser = 'Safari'
    const match = userAgent.match(/Version\/([\d.]+)/)
    browserVersion = match ? match[1] : ''
  } else if (userAgent.includes('Firefox/')) {
    browser = 'Firefox'
    const match = userAgent.match(/Firefox\/([\d.]+)/)
    browserVersion = match ? match[1] : ''
  } else if (userAgent.includes('OPR/') || userAgent.includes('Opera/')) {
    browser = 'Opera'
    const match = userAgent.match(/(?:OPR|Opera)\/([\d.]+)/)
    browserVersion = match ? match[1] : ''
  }

  return { browser, browserVersion }
}

/**
 * 判断设备类型
 */
function getDeviceType(userAgent) {
  // 移动设备检测
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    if (/iPad/i.test(userAgent)) {
      return 'TABLET_WEB'
    }
    return 'MOBILE_WEB'
  }

  // 桌面设备
  return 'WEB'
}

/**
 * 生成设备名称
 */
function generateDeviceName(browser, browserVersion, osName) {
  const browserName = browserVersion ? `${browser} ${browserVersion}` : browser
  return `${browserName} on ${osName}`
}

/**
 * 获取应用版本
 * 可以从环境变量或配置文件中读取
 */
function getAppVersion() {
  // 从环境变量读取（可以在构建时注入）
  return import.meta.env.VITE_APP_VERSION || '1.0.0'
}

/**
 * 收集完整的设备信息
 * @returns {Object} 设备信息对象
 */
export function getDeviceInfo() {
  const userAgent = navigator.userAgent
  const deviceId = getOrCreateDeviceId()

  const { osName, osVersion } = parseOS(userAgent)
  const { browser, browserVersion } = parseBrowser(userAgent)
  const deviceType = getDeviceType(userAgent)
  const deviceName = generateDeviceName(browser, browserVersion, osName)
  const appVersion = getAppVersion()

  return {
    deviceId,
    deviceType,
    deviceName,
    osName,
    osVersion,
    browser: browserVersion ? `${browser} ${browserVersion}` : browser,
    userAgent,
    appVersion
  }
}

/**
 * 获取当前设备ID
 */
export function getCurrentDeviceId() {
  return localStorage.getItem(DEVICE_ID_KEY) || ''
}

/**
 * 清除设备ID（通常在测试时使用）
 */
export function clearDeviceId() {
  localStorage.removeItem(DEVICE_ID_KEY)
}

