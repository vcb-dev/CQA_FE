import { apiClient } from '@/lib/axios'
import type { UserRole } from '@/features/user-access/api'

export type CriteriaKey = 'greeting' | 'needs' | 'consult' | 'objection' | 'closing'

export type EmployeePerformance = {
  id: number
  email: string
  fullName: string | null
  phoneNumber: string | null
  avatarUrl: string | null
  role: UserRole
  isActive: boolean
  assignedPageCount: number
  conversations: number
  repliedConversations: number
  labeledConversations: number
  closedConversations: number
  closedByOrder: number
  closedByLabel: number
  closeRate: number | null
  orders: number
  revenue: number
  score: number | null
  auditCount: number
  criteria: Record<CriteriaKey, number | null>
}

export type EmployeePerformanceTotals = {
  employees: number
  conversations: number
  closedConversations: number
  closeRate: number | null
  orders: number
  revenue: number
  score: number | null
  auditCount: number
}

export type EmployeePerformanceResponse = {
  period: { from: string; to: string }
  employees: EmployeePerformance[]
  totals: EmployeePerformanceTotals
}

export const CRITERIA_LABELS: Record<CriteriaKey, string> = {
  greeting: 'Chào hỏi',
  needs: 'Khai thác nhu cầu',
  consult: 'Tư vấn sản phẩm',
  objection: 'Xử lý từ chối',
  closing: 'Chốt đơn',
}

export const CRITERIA_MAX = 20

export async function fetchEmployeePerformance(
  from: string,
  to: string,
): Promise<EmployeePerformanceResponse> {
  const { data } = await apiClient.get<EmployeePerformanceResponse>(
    '/cskh/employees/performance',
    { params: { from, to } },
  )
  return data
}
