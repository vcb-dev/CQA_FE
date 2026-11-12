import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'

export type UserRole = 'admin' | 'manager' | 'leader' | 'staff' | 'user'

export type EmployeeType = {
  key: string
  name: string
  sortOrder: number
  userCount: number
  customizedRoles: UserRole[]
}

export type PermissionKey =
  | 'dashboard.view'
  | 'inbox.view'
  | 'inbox.reply'
  | 'inbox.label'
  | 'inbox.sync'
  | 'comment.view'
  | 'comment.reply'
  | 'media.manage'
  | 'order.create'
  | 'customer.view'
  | 'product.view'
  | 'product.sync'
  | 'quality.view'
  | 'quality.run'
  | 'insight.view'
  | 'insight.run'
  | 'ai.assistant'
  | 'channel.view'
  | 'channel.manage'
  | 'channel.all'
  | 'ads.view'
  | 'employee.view'
  | 'account.view'
  | 'account.manage'
  | 'account.delete'
  | 'account.assign_channels'
  | 'role.manage'

export type CurrentUserProfile = {
  id: number
  email: string
  fullName: string | null
  avatarUrl?: string | null
  role: UserRole
  permissions: PermissionKey[]
}

export type Account = {
  id: number
  email: string
  fullName: string | null
  phoneNumber: string | null
  avatarUrl: string | null
  role: UserRole
  employeeType: string | null
  isActive: boolean
  status: 'invited' | 'active' | 'inactive'
  createdAt: string
  channelRestricted: boolean
  assignedPageIds: string[]
}

export type AccountInput = {
  fullName?: string
  email?: string
  password?: string
  phoneNumber?: string
  role?: UserRole
  employeeType?: string | null
  isActive?: boolean
}

export type PermissionDefinition = {
  key: PermissionKey
  group: string
  label: string
  description: string
  adminOnly?: boolean
}

export type RolePermissions = {
  role: UserRole
  permissions: PermissionKey[]
  customized: boolean
  locked: boolean
}

export type RoleMatrix = {
  groups: { key: string; label: string }[]
  permissions: PermissionDefinition[]
  roles: RolePermissions[]
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  leader: 'Trưởng nhóm',
  staff: 'Nhân viên',
  user: 'Người dùng',
}

export const ROLE_ORDER: UserRole[] = ['admin', 'manager', 'leader', 'staff', 'user']


export const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,50}$/

type PermissionHolder = Pick<CurrentUserProfile, 'permissions'> | null | undefined

export function hasPermission(user: PermissionHolder, key: PermissionKey): boolean {
  return !!user?.permissions?.includes(key)
}

export function hasAnyPermission(user: PermissionHolder, keys: PermissionKey[]): boolean {
  return keys.some((key) => hasPermission(user, key))
}

export function assignableRoles(role?: string | null): UserRole[] {
  if (role === 'admin') return ROLE_ORDER
  const rank = ROLE_ORDER.indexOf(role as UserRole)
  return rank < 0 ? [] : ROLE_ORDER.slice(rank + 1)
}

export function canEditAccount(actor: CurrentUserProfile, target: Account): boolean {
  if (!hasPermission(actor, 'account.manage')) return false
  return actor.id === target.id || assignableRoles(actor.role).includes(target.role)
}

export function canDeleteAccount(actor: CurrentUserProfile, target: Account): boolean {
  if (!hasPermission(actor, 'account.delete') || actor.id === target.id) return false
  return assignableRoles(actor.role).includes(target.role)
}

export const CURRENT_USER_QUERY_KEY = ['currentUserProfile'] as const
export const ACCOUNTS_QUERY_KEY = ['users', 'accounts'] as const
export const ROLE_MATRIX_QUERY_KEY = ['roles', 'permissions'] as const
export const EMPLOYEE_TYPES_QUERY_KEY = ['employee-types'] as const

export async function fetchCurrentUserProfile(): Promise<CurrentUserProfile> {
  const { data } = await apiClient.get<{ data: CurrentUserProfile }>('/auth/me')
  return data.data
}

export function useCurrentUserProfile() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: fetchCurrentUserProfile,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePermission(key: PermissionKey): boolean {
  const { data } = useCurrentUserProfile()
  return hasPermission(data, key)
}

export async function fetchAccounts(): Promise<Account[]> {
  const { data } = await apiClient.get<{ data: Account[] }>('/users')
  return data.data
}

export async function createAccount(input: AccountInput): Promise<Account> {
  const { data } = await apiClient.post<{ data: Account }>('/users', input)
  return data.data
}

export async function updateAccount(id: number, input: AccountInput): Promise<Account> {
  const { data } = await apiClient.patch<{ data: Account }>(`/users/${id}`, input)
  return data.data
}

export async function deleteAccount(id: number): Promise<void> {
  await apiClient.delete(`/users/${id}`)
}

export async function assignAccountPages(
  id: number,
  pageIds: string[],
): Promise<{ userId: number; pageIds: string[] }> {
  const { data } = await apiClient.put<{ data: { userId: number; pageIds: string[] } }>(
    `/users/${id}/pages`,
    { pageIds },
  )
  return data.data
}

function employeeTypeParams(employeeType?: string) {
  return employeeType ? { params: { employeeType } } : undefined
}

export async function fetchRoleMatrix(employeeType?: string): Promise<RoleMatrix> {
  const { data } = await apiClient.get<{ data: RoleMatrix }>(
    '/roles/permissions',
    employeeTypeParams(employeeType),
  )
  return data.data
}

export async function updateRolePermissions(
  role: UserRole,
  permissions: PermissionKey[],
  employeeType?: string,
): Promise<RolePermissions> {
  const { data } = await apiClient.put<{ data: RolePermissions }>(
    `/roles/${role}/permissions`,
    { permissions },
    employeeTypeParams(employeeType),
  )
  return data.data
}

export async function resetRolePermissions(
  role: UserRole,
  employeeType?: string,
): Promise<RolePermissions> {
  const { data } = await apiClient.delete<{ data: RolePermissions }>(
    `/roles/${role}/permissions`,
    employeeTypeParams(employeeType),
  )
  return data.data
}

export async function fetchEmployeeTypes(): Promise<EmployeeType[]> {
  const { data } = await apiClient.get<{ data: EmployeeType[] }>('/employee-types')
  return data.data
}

export async function createEmployeeType(name: string): Promise<EmployeeType> {
  const { data } = await apiClient.post<{ data: EmployeeType }>('/employee-types', { name })
  return data.data
}

export async function renameEmployeeType(key: string, name: string): Promise<EmployeeType> {
  const { data } = await apiClient.patch<{ data: EmployeeType }>(
    `/employee-types/${encodeURIComponent(key)}`,
    { name },
  )
  return data.data
}

export async function deleteEmployeeType(key: string): Promise<void> {
  await apiClient.delete(`/employee-types/${encodeURIComponent(key)}`)
}

export function useEmployeeTypes(enabled = true) {
  return useQuery({
    queryKey: EMPLOYEE_TYPES_QUERY_KEY,
    queryFn: fetchEmployeeTypes,
    staleTime: 60_000,
    enabled,
  })
}
