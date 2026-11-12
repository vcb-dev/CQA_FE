import { apiClient } from '@/lib/axios'

export type PancakeStatus = {
  connected: boolean
  userName: string | null
  activatedPageCount: number
  tokenMasked: string | null
  tokenExpiresAt: string | null
  updatedAt: string | null
  fromEnv?: boolean
}

export type PancakePage = {
  id: string
  name: string | null
  platform: string | null
  roleInPage: string | null
  username: string | null
  isActivated?: boolean
  category?: string | null
}

export async function fetchPancakeStatus() {
  const { data } = await apiClient.get<PancakeStatus>('/pancake/status')
  return data
}

export async function fetchPancakePages() {
  const { data } = await apiClient.get<{ pages: PancakePage[]; count: number }>('/pancake/pages')
  return data
}
