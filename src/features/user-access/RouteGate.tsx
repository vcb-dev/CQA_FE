import type { ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { canAccessPath, firstAccessiblePath } from '@/router/navigation'
import { useCurrentUserProfile } from './api'

export function RouteGate({ path, children }: { path: string; children: ReactNode }) {
  const { data: me } = useCurrentUserProfile()
  if (!me || canAccessPath(me, path)) return <>{children}</>
  const fallback = firstAccessiblePath(me)
  if (path === '/') return <Navigate to={fallback} replace />
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <ShieldOff className="h-6 w-6" />
        </span>
        <h2 className="text-[15px] font-semibold text-slate-900">Bạn chưa có quyền vào trang này</h2>
        <p className="text-[13px] leading-relaxed text-slate-500">
          Vai trò của bạn chưa được cấp quyền cho chức năng này. Liên hệ quản trị viên nếu bạn cần
          sử dụng.
        </p>
        <Link
          to={fallback}
          className="mt-1 inline-flex h-9 items-center rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white transition hover:bg-indigo-500"
        >
          Về trang làm việc
        </Link>
      </div>
    </div>
  )
}
