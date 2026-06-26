import type { AuditSidebarSort } from './AuditDashboardPanels'
import type { MessengerWorkspacePane } from './cskhUi'

const AUDIT_WORKSPACE_KEY = 'cskh:audit-workspace:v1'

export interface AuditWorkspacePersist {
  auditDateFrom: string
  auditDateTo: string
  selectedPageId: string
  selectedId: string | null
  batchLimitInput: string
  sidebarSearch: string
  listFilter: 'all' | 'low' | 'ad'
  sidebarSort: AuditSidebarSort
  chatTab: 'chat' | 'messenger' | 'timeline' | 'analysis'
  workspacePane: MessengerWorkspacePane
}

export function loadAuditWorkspace(): Partial<AuditWorkspacePersist> {
  try {
    if (typeof sessionStorage === 'undefined') return {}
    const raw = sessionStorage.getItem(AUDIT_WORKSPACE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Partial<AuditWorkspacePersist>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function saveAuditWorkspace(partial: Partial<AuditWorkspacePersist>) {
  try {
    if (typeof sessionStorage === 'undefined') return
    const prev = loadAuditWorkspace()
    sessionStorage.setItem(AUDIT_WORKSPACE_KEY, JSON.stringify({ ...prev, ...partial }))
  } catch {
    /* ignore */
  }
}

export function firstNonEmpty(...values: (string | null | undefined)[]): string {
  for (const v of values) {
    if (v?.trim()) return v.trim()
  }
  return ''
}
