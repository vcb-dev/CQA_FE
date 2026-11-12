import {
  hasAnyPermission,
  type CurrentUserProfile,
  type PermissionKey,
} from '@/features/user-access/api'

export const ROUTE_PERMISSIONS: Record<string, PermissionKey[] | null> = {
  '/': ['dashboard.view'],
  '/conversations': ['inbox.view'],
  '/ai-insight': ['insight.view'],
  '/quality': ['quality.view'],
  '/employees': ['employee.view'],
  '/customers': ['customer.view'],
  '/pages': ['channel.view'],
  '/ads': ['ads.view'],
  '/products': ['product.view'],
  '/settings': null,
}

export function canAccessPath(user: CurrentUserProfile | undefined, path: string): boolean {
  const required = ROUTE_PERMISSIONS[path]
  return !required || hasAnyPermission(user, required)
}

export function firstAccessiblePath(user: CurrentUserProfile | undefined): string {
  return Object.keys(ROUTE_PERMISSIONS).find((path) => canAccessPath(user, path)) ?? '/settings'
}
