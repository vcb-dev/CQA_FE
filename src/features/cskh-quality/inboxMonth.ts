/** Tháng lịch inbox — cùng múi giờ Asia/Ho_Chi_Minh với BE. */

export type InboxMonthRange = { key: string; fromMs: number; toMs: number }

const VN = 'Asia/Ho_Chi_Minh'

export function parseInboxMonthKey(raw?: string | null): InboxMonthRange | null {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec((raw ?? '').trim())
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  const fromMs = new Date(`${m[1]}-${m[2]}-01T00:00:00+07:00`).getTime()
  const toMonth = month === 12 ? 1 : month + 1
  const toYear = month === 12 ? year + 1 : year
  const toMs = new Date(
    `${toYear}-${String(toMonth).padStart(2, '0')}-01T00:00:00+07:00`,
  ).getTime()
  if (!Number.isFinite(fromMs) || !Number.isFinite(toMs)) return null
  return { key: `${m[1]}-${m[2]}`, fromMs, toMs }
}

export function parseInboxDateKey(raw?: string | null): InboxMonthRange | null {
  const m = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.exec((raw ?? '').trim())
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  const day = Number(m[3])
  const probe = new Date(Date.UTC(year, month - 1, day))
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null
  }
  const key = `${m[1]}-${m[2]}-${m[3]}`
  const fromMs = new Date(`${key}T00:00:00+07:00`).getTime()
  if (!Number.isFinite(fromMs)) return null
  return { key, fromMs, toMs: fromMs + 86_400_000 }
}

export type InboxDateRange = { from: string; to: string }

export const INBOX_DATE_RANGE_MAX_DAYS = 92

export function inboxDateRangeKey(range: InboxDateRange): string {
  return range.from === range.to ? range.from : `${range.from}_${range.to}`
}

export function parseInboxDateRange(
  fromRaw?: string | null,
  toRaw?: string | null,
): InboxMonthRange | null {
  const from = parseInboxDateKey(fromRaw)
  if (!from) return null
  const to = toRaw?.trim() ? parseInboxDateKey(toRaw) : from
  if (!to || to.fromMs < from.fromMs) return null
  if (Math.round((to.toMs - from.fromMs) / 86_400_000) > INBOX_DATE_RANGE_MAX_DAYS) return null
  return {
    key: inboxDateRangeKey({ from: from.key, to: to.key }),
    fromMs: from.fromMs,
    toMs: to.toMs,
  }
}

export function parseInboxPeriodKey(raw?: string | null): InboxMonthRange | null {
  const trimmed = (raw ?? '').trim()
  const sep = trimmed.indexOf('_')
  if (sep > 0) {
    const to = trimmed.slice(sep + 1)
    return to ? parseInboxDateRange(trimmed.slice(0, sep), to) : null
  }
  return parseInboxDateKey(trimmed) ?? parseInboxMonthKey(trimmed)
}

export function addDaysToInboxDate(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

function formatInboxDay(iso: string, withYear: boolean): string {
  const [y, m, d] = iso.split('-')
  return withYear ? `${d}/${m}/${y}` : `${d}/${m}`
}

export function formatInboxPeriodLabel(key: string, compact = false): string {
  const sep = key.indexOf('_')
  if (sep > 0 && parseInboxPeriodKey(key)) {
    const from = key.slice(0, sep)
    const to = key.slice(sep + 1)
    const sameYear = from.slice(0, 4) === to.slice(0, 4)
    return `${formatInboxDay(from, !sameYear)} – ${formatInboxDay(to, true)}`
  }
  const date = parseInboxDateKey(key)
  if (!date) return formatInboxMonthLabel(key, compact)
  return compact ? formatInboxDay(date.key, true) : `Ngày ${formatInboxDay(date.key, true)}`
}

export function currentInboxMonthKey(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: VN,
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now)
  const year = parts.find((p) => p.type === 'year')?.value
  const month = parts.find((p) => p.type === 'month')?.value
  return year && month ? `${year}-${month}` : now.toISOString().slice(0, 7)
}

export function formatInboxMonthLabel(key: string, compact = false): string {
  const parsed = parseInboxMonthKey(key)
  if (!parsed) return key
  const [y, m] = key.split('-')
  const monthNum = Number(m)
  return compact ? `Thg ${monthNum}/${y}` : `Tháng ${monthNum}, ${y}`
}

export function inboxMonthOptions(count = 18): { value: string; label: string }[] {
  const current = parseInboxMonthKey(currentInboxMonthKey())
  if (!current) return []
  const [y0, m0] = current.key.split('-').map(Number)
  const out: { value: string; label: string }[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(y0, m0 - 1 - i, 1))
    const value = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
    out.push({ value, label: formatInboxMonthLabel(value) })
  }
  return out
}

export function conversationInInboxMonth(
  lastMessageAt: string | Date | null | undefined,
  monthKey: string | undefined,
): boolean {
  if (!monthKey) return true
  const range = parseInboxPeriodKey(monthKey)
  if (!range) return true
  const t = new Date(lastMessageAt ?? 0).getTime()
  return t >= range.fromMs && t < range.toMs
}
