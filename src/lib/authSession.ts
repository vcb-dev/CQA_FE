const OAUTH_AUTH_BACKUP_KEY = 'cqa_oauth_auth_backup'
const OAUTH_BACKUP_TTL_MS = 30 * 60_000

/** Lưu JWT tạm trước khi redirect OAuth Facebook — phòng mất localStorage khi quay về. */
export function backupAuthForOAuth(): void {
  if (typeof sessionStorage === 'undefined' || typeof localStorage === 'undefined') return
  const authToken = localStorage.getItem('authToken')
  if (!authToken || authToken === 'undefined' || authToken === 'null') return
  sessionStorage.setItem(
    OAUTH_AUTH_BACKUP_KEY,
    JSON.stringify({
      authToken,
      refreshToken: localStorage.getItem('refreshToken'),
      at: Date.now(),
    }),
  )
}

/** Khôi phục JWT sau OAuth nếu localStorage bị trống (redirect cross-origin / reload). */
export function restoreAuthAfterOAuth(): boolean {
  if (typeof sessionStorage === 'undefined' || typeof localStorage === 'undefined') return false
  const raw = sessionStorage.getItem(OAUTH_AUTH_BACKUP_KEY)
  if (!raw) return false

  try {
    const parsed = JSON.parse(raw) as {
      authToken?: string
      refreshToken?: string | null
      at?: number
    }
    if (parsed.at && Date.now() - parsed.at > OAUTH_BACKUP_TTL_MS) {
      sessionStorage.removeItem(OAUTH_AUTH_BACKUP_KEY)
      return false
    }

    const existing = localStorage.getItem('authToken')
    if (!existing || existing === 'undefined' || existing === 'null') {
      if (parsed.authToken) {
        localStorage.setItem('authToken', parsed.authToken)
        if (parsed.refreshToken) localStorage.setItem('refreshToken', parsed.refreshToken)
      }
    }
    sessionStorage.removeItem(OAUTH_AUTH_BACKUP_KEY)
    return Boolean(localStorage.getItem('authToken'))
  } catch {
    sessionStorage.removeItem(OAUTH_AUTH_BACKUP_KEY)
    return false
  }
}

export function buildOAuthChannelReturnUrl(): string {
  if (typeof window === 'undefined') return '/settings?tab=channel'
  const path = window.location.pathname || '/settings'
  return `${window.location.origin}${path}?tab=channel`
}
