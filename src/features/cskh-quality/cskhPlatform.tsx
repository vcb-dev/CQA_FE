import { LayoutGrid } from 'lucide-react'

export type PlatformKey = 'facebook' | 'instagram' | 'tiktok' | 'threads' | 'youtube'
export type PlatformFilter = 'all' | PlatformKey

export const PLATFORM_LABELS: Record<PlatformKey, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  threads: 'Threads',
  youtube: 'YouTube',
}

export const PLATFORM_ORDER: PlatformKey[] = [
  'facebook',
  'instagram',
  'tiktok',
  'threads',
  'youtube',
]

export const PLATFORM_TABS: { key: PlatformFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  ...PLATFORM_ORDER.map((key) => ({ key: key as PlatformFilter, label: PLATFORM_LABELS[key] })),
]

export function pageBucket(platform?: string): PlatformKey {
  if (platform === 'instagram') return 'instagram'
  if (platform === 'tiktok') return 'tiktok'
  if (platform === 'threads') return 'threads'
  if (platform === 'youtube') return 'youtube'
  return 'facebook'
}

export type PlatformPage = {
  pageId: string
  pageName?: string | null
  platform?: string
}

export type PlatformPageGroup<T extends PlatformPage> = {
  key: PlatformKey
  label: string
  pages: T[]
}

export function groupPagesByPlatform<T extends PlatformPage>(pages: T[]): PlatformPageGroup<T>[] {
  const buckets = new Map<PlatformKey, T[]>()
  for (const page of pages) {
    const key = pageBucket(page.platform)
    const bucket = buckets.get(key)
    if (bucket) bucket.push(page)
    else buckets.set(key, [page])
  }

  return PLATFORM_ORDER.flatMap((key) => {
    const bucket = buckets.get(key)
    if (!bucket?.length) return []
    const sorted = [...bucket].sort((a, b) =>
      (a.pageName || a.pageId).localeCompare(b.pageName || b.pageId, 'vi'),
    )
    return [{ key, label: PLATFORM_LABELS[key], pages: sorted }]
  })
}

export function PlatformGlyph({ name, className }: { name: PlatformFilter; className?: string }) {
  const cls = className ?? 'h-3.5 w-3.5 shrink-0'
  if (name === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
        <path d="M22 12a10 10 0 10-11.56 9.88v-6.99H8.08V12h2.36V9.8c0-2.33 1.39-3.62 3.52-3.62.99 0 2.03.18 2.03.18v2.23h-1.14c-1.13 0-1.48.7-1.48 1.42V12h2.52l-.4 2.89h-2.12v6.99A10 10 0 0022 12z" />
      </svg>
    )
  }
  if (name === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
        <path d="M7.75 2h8.5A5.75 5.75 0 0122 7.75v8.5A5.75 5.75 0 0116.25 22h-8.5A5.75 5.75 0 012 16.25v-8.5A5.75 5.75 0 017.75 2zm0 1.8A3.95 3.95 0 003.8 7.75v8.5a3.95 3.95 0 003.95 3.95h8.5a3.95 3.95 0 003.95-3.95v-8.5A3.95 3.95 0 0016.25 3.8h-8.5zM12 7.2A4.8 4.8 0 1112 16.8 4.8 4.8 0 0112 7.2zm0 1.8a3 3 0 100 6 3 3 0 000-6zM17.5 6.1a1.15 1.15 0 110 2.3 1.15 1.15 0 010-2.3z" />
      </svg>
    )
  }
  if (name === 'youtube') {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
        <path d="M23.5 6.2a3.05 3.05 0 00-2.15-2.16C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.35.44A3.05 3.05 0 00.5 6.2 31.9 31.9 0 000 12a31.9 31.9 0 00.5 5.8 3.05 3.05 0 002.15 2.16C4.5 20.4 12 20.4 12 20.4s7.5 0 9.35-.44a3.05 3.05 0 002.15-2.16A31.9 31.9 0 0024 12a31.9 31.9 0 00-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
      </svg>
    )
  }
  if (name === 'tiktok') {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
        <path d="M14.5 3c.3 2.2 1.6 3.8 3.8 4.1v2.2c-1.3 0-2.5-.4-3.5-1.1v6.5c0 3.2-2.6 5.7-5.8 5.7S3.2 17.9 3.2 14.7c0-3 2.3-5.5 5.2-5.8v2.4c-1.4.3-2.4 1.5-2.4 3 0 1.7 1.4 3.1 3.1 3.1s3.1-1.4 3.1-3.1V3h2.3z" />
      </svg>
    )
  }
  if (name === 'threads') {
    return (
      <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
        <path d="M16.3 11.2c-.1-2.4-1.5-4-4-4-2.9 0-4.8 2.2-4.8 5.6 0 3.2 1.7 5.4 4.8 5.4 2.2 0 3.8-1.1 4.5-3l-1.8-.6c-.4 1.2-1.4 1.8-2.7 1.8-1.8 0-2.9-1.4-2.9-3.6h7c0-.2.1-.4.1-.6zm-7-1.2c.3-1.5 1.3-2.5 2.8-2.5 1.4 0 2.3.9 2.5 2.5h-5.3zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z" />
      </svg>
    )
  }
  return <LayoutGrid className={cls} strokeWidth={2.2} />
}
