import { apiClient } from '@/lib/axios'
import { getApiBaseUrl } from '@/lib/apiBase'

export type ApiKeyScope = 'channels.read' | 'staff.read'

export type ApiKeyStatus = 'active' | 'expired' | 'revoked'

export type ApiKeyPerson = { id: number; name: string } | null

export type ApiKey = {
  id: string
  name: string
  keyPrefix: string
  scopes: ApiKeyScope[]
  status: ApiKeyStatus
  expiresAt: string | null
  lastUsedAt: string | null
  createdAt: string
  revokedAt: string | null
  createdBy: ApiKeyPerson
  revokedBy: ApiKeyPerson
}

export type CreatedApiKey = ApiKey & { plainKey: string }

export type ApiKeyInput = {
  name: string
  scopes: ApiKeyScope[]
  expiresAt: string | null
}

export const API_KEY_SCOPES: {
  key: ApiKeyScope
  label: string
  short: string
  path: string
  params: string
}[] = [
  {
    key: 'channels.read',
    label: 'Danh sách kênh',
    short: 'Kênh',
    path: '/cskh/integrations/channels',
    params: 'platform=messenger|instagram|tiktok, enabled=true|false',
  },
  {
    key: 'staff.read',
    label: 'Nhân sự Editor / Sale kèm kênh đang cầm',
    short: 'Nhân sự',
    path: '/cskh/integrations/staff',
    params: 'employee_type=editor|sale, include_inactive=true',
  },
]

export const API_KEYS_QUERY_KEY = ['api-keys'] as const

export function integrationBaseUrl(): string {
  const base = getApiBaseUrl()
  return /^https?:\/\//i.test(base) ? base : `${window.location.origin}${base}`
}

export async function fetchApiKeys(): Promise<ApiKey[]> {
  const { data } = await apiClient.get<{ data: ApiKey[] }>('/api-keys')
  return data.data
}

export async function createApiKey(input: ApiKeyInput): Promise<CreatedApiKey> {
  const { data } = await apiClient.post<{ data: CreatedApiKey }>('/api-keys', input)
  return data.data
}

export async function revokeApiKey(id: string): Promise<ApiKey> {
  const { data } = await apiClient.delete<{ data: ApiKey }>(`/api-keys/${id}`)
  return data.data
}
