import type { InfiniteData, QueryClient } from '@tanstack/react-query'
import type { CskhInboxConversation, CskhInboxConversationPage, CskhInboxMessage } from './api'

export type InboxRealtimeMessagePayload = CskhInboxMessage

export type InboxRealtimeConversationPatch = Partial<CskhInboxConversation> & { id: string }

function sortConversationsByRecent(a: CskhInboxConversation, b: CskhInboxConversation) {
  return new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime()
}

function isInfiniteConversationData(
  data: unknown,
): data is InfiniteData<CskhInboxConversationPage> {
  return !!data && typeof data === 'object' && 'pages' in data && Array.isArray((data as InfiniteData<CskhInboxConversationPage>).pages)
}

function matchesConversationFilter(
  conv: CskhInboxConversation,
  pageIdFilter: string | undefined,
  activeFilter: string | undefined,
): boolean {
  if (pageIdFilter && conv.pageId !== pageIdFilter) return false
  if (activeFilter === 'ads' && !conv.fromAd) return false
  if (activeFilter === 'unread' && !(conv.unreadCount > 0)) return false
  if (activeFilter === 'normal' && conv.fromAd) return false
  return true
}

function patchFlatConversationList(
  prev: CskhInboxConversation[],
  patch: InboxRealtimeConversationPatch,
  key: readonly unknown[],
): CskhInboxConversation[] {
  if (!prev?.length) return prev
  const idx = prev.findIndex((c) => c.id === patch.id)
  if (idx < 0) {
    const pageIdFilter = key[3] as string | undefined
    if (pageIdFilter && pageIdFilter !== 'all' && patch.pageId && patch.pageId !== pageIdFilter) {
      return prev
    }
    const row = patch as CskhInboxConversation
    return [row, ...prev].sort(sortConversationsByRecent)
  }
  const next = [...prev]
  next[idx] = { ...next[idx], ...patch }
  next.sort(sortConversationsByRecent)
  return next
}

function patchInfiniteConversationList(
  prev: InfiniteData<CskhInboxConversationPage>,
  patch: InboxRealtimeConversationPatch,
  key: readonly unknown[],
): InfiniteData<CskhInboxConversationPage> {
  if (!prev?.pages?.length) return prev

  const pageIdFilter = key[3] === 'all' ? undefined : (key[3] as string | undefined)
  const activeFilter = key[4] as string | undefined

  const pages = prev.pages.map((p) => ({ ...p, items: [...p.items] }))
  let foundPage = -1
  let foundIdx = -1

  for (let pi = 0; pi < pages.length; pi++) {
    const idx = pages[pi].items.findIndex((c) => c.id === patch.id)
    if (idx >= 0) {
      foundPage = pi
      foundIdx = idx
      break
    }
  }

  if (foundPage >= 0) {
    const merged = { ...pages[foundPage].items[foundIdx], ...patch }
    if (activeFilter === 'unread' && merged.unreadCount <= 0) {
      pages[foundPage].items.splice(foundIdx, 1)
    } else if (patch.lastMessageAt) {
      pages[foundPage].items.splice(foundIdx, 1)
      pages[0].items = [merged, ...pages[0].items.filter((c) => c.id !== patch.id)].sort(
        sortConversationsByRecent,
      )
      const seen = new Set<string>()
      for (const page of pages) {
        page.items = page.items.filter((c) => {
          if (seen.has(c.id)) return false
          seen.add(c.id)
          return true
        })
      }
    } else {
      pages[foundPage].items[foundIdx] = merged
    }
  } else {
    const row = patch as CskhInboxConversation
    if (matchesConversationFilter(row, pageIdFilter, activeFilter)) {
      pages[0].items = [row, ...pages[0].items].sort(sortConversationsByRecent)
    }
  }

  return { ...prev, pages }
}

export function appendInboxMessagesToCache(
  qc: QueryClient,
  conversationId: string,
  auditDateKey: string | undefined,
  incoming: InboxRealtimeMessagePayload[],
) {
  if (!incoming.length) return
  const queries = qc.getQueryCache().findAll({
    queryKey: ['cskh', 'inbox', 'messages', conversationId],
  })
  for (const q of queries) {
    qc.setQueryData<{ conversation: CskhInboxConversation; messages: CskhInboxMessage[] }>(
      q.queryKey,
      (prev) => {
        if (!prev) return prev
        const byId = new Map(prev.messages.map((m) => [m.id, m]))
        for (const msg of incoming) {
          byId.set(msg.id, { ...byId.get(msg.id), ...msg })
        }
        const merged = [...byId.values()].sort(
          (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
        )
        return { ...prev, messages: merged }
      },
    )
  }
}

export function patchInboxConversationInCache(
  qc: QueryClient,
  patch: InboxRealtimeConversationPatch,
) {
  const queries = qc.getQueryCache().findAll({
    queryKey: ['cskh', 'inbox', 'conversations'],
  })
  for (const q of queries) {
    const key = q.queryKey
    const prev = q.state.data
    if (isInfiniteConversationData(prev)) {
      qc.setQueryData(key, patchInfiniteConversationList(prev, patch, key))
    } else if (Array.isArray(prev)) {
      qc.setQueryData<CskhInboxConversation[]>(key, patchFlatConversationList(prev, patch, key))
    }
  }
}

export function bumpAuditSidebarPreview(
  qc: QueryClient,
  auditId: string,
  preview: string,
  score?: number,
) {
  qc.setQueryData(['cskh', 'audits'], (prev: unknown) => {
    if (!Array.isArray(prev)) return prev
    return prev.map((row) => {
      if (!row || typeof row !== 'object' || (row as { id?: string }).id !== auditId) return row
      const r = row as { transcript?: unknown[]; score?: number }
      const transcript = Array.isArray(r.transcript) ? [...r.transcript] : []
      if (preview.trim()) {
        transcript.push({
          sender: 'Customer',
          text: preview,
          timestamp: new Date().toISOString(),
        })
      }
      return {
        ...row,
        score: score ?? r.score,
        transcript,
      }
    })
  })
}
