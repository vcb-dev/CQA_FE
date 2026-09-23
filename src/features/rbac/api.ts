import { apiClient } from '@/lib/axios'

/** 4 vai trò truy cập nền tảng, khớp enum vai trò của backend. */
export type RbacRoleCode = 'admin' | 'manager' | 'staff' | 'user'

export interface RbacRole {
  code: RbacRoleCode
  label: string
  /** Mô tả 1 dòng, dùng cho cột "Quyền chính". */
  description: string
  permissions: string[]
  /** Số người dùng đang giữ vai trò này. */
  userCount: number
}

export interface RbacUser {
  id: number
  fullName: string | null
  email: string
  avatarUrl: string | null
  role: RbacRoleCode
  roleLabel: string
  permissionSummary: string
  permissions: string[]
  /** ISO timestamp, hoặc null nếu chưa ghi nhận hoạt động nào. */
  lastActiveAt: string | null
}

export interface RbacUserPage {
  items: RbacUser[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type RbacUsersSortBy = 'name' | 'lastActive'
export type RbacUsersSortDir = 'asc' | 'desc'

export interface RbacUserFilters {
  /** Tìm theo tên hoặc email. */
  search?: string
  role?: RbacRoleCode | ''
  page?: number
  pageSize?: number
  /** Mặc định 'name'. 'lastActive' sort theo "Hoạt động cuối" (BE tự tính, không orderBy DB được). */
  sortBy?: RbacUsersSortBy
  sortDir?: RbacUsersSortDir
}

export interface CreateRbacUserInput {
  email: string
  fullName: string
  password: string
  role: RbacRoleCode
  phoneNumber?: string
}

interface Envelope<T> {
  success: boolean
  data: T
}

export async function fetchRbacRoles(signal?: AbortSignal): Promise<RbacRole[]> {
  const { data } = await apiClient.get<Envelope<RbacRole[]>>('/rbac/roles', { signal })
  return data.data
}

export async function fetchRbacUsers(
  filters: RbacUserFilters = {},
  signal?: AbortSignal,
): Promise<RbacUserPage> {
  const params: Record<string, string | number> = {}
  const search = filters.search?.trim()
  if (search) params.search = search
  if (filters.role) params.role = filters.role
  if (filters.page) params.page = filters.page
  if (filters.pageSize) params.pageSize = filters.pageSize
  if (filters.sortBy) params.sortBy = filters.sortBy
  if (filters.sortDir) params.sortDir = filters.sortDir

  const { data } = await apiClient.get<Envelope<RbacUserPage>>('/rbac/users', {
    params,
    signal,
  })
  return data.data
}

export async function assignRbacRole(userId: number, role: RbacRoleCode): Promise<void> {
  await apiClient.put(`/rbac/users/${userId}/role`, { role })
}

export async function createRbacUser(input: CreateRbacUserInput): Promise<RbacUser> {
  const { data } = await apiClient.post<Envelope<RbacUser>>('/rbac/users', input)
  return data.data
}
