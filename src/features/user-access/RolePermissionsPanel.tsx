import { Fragment, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  Globe,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/axios'
import { cn } from '@/lib/utils'
import {
  ACCOUNTS_QUERY_KEY,
  CURRENT_USER_QUERY_KEY,
  EMPLOYEE_TYPES_QUERY_KEY,
  ROLE_LABELS,
  ROLE_MATRIX_QUERY_KEY,
  ROLE_ORDER,
  createEmployeeType,
  deleteEmployeeType,
  fetchRoleMatrix,
  renameEmployeeType,
  resetRolePermissions,
  updateRolePermissions,
  useEmployeeTypes,
  type EmployeeType,
  type PermissionDefinition,
  type PermissionKey,
  type RoleMatrix,
  type UserRole,
} from './api'
import { ConfirmDialog, INPUT_CLASS, Modal, PRIMARY_BUTTON, SECONDARY_BUTTON } from './ui'

const REQUIRES: Partial<Record<PermissionKey, PermissionKey[]>> = {
  'inbox.reply': ['inbox.view'],
  'inbox.label': ['inbox.view'],
  'inbox.sync': ['inbox.view'],
  'comment.reply': ['comment.view'],
  'quality.run': ['quality.view'],
  'product.sync': ['product.view'],
  'channel.manage': ['channel.view'],
  'account.manage': ['account.view'],
  'account.delete': ['account.view', 'account.manage'],
}

type Draft = Record<UserRole, Set<PermissionKey>>

function withDependencies(set: Set<PermissionKey>, key: PermissionKey) {
  set.add(key)
  for (const dep of REQUIRES[key] ?? []) withDependencies(set, dep)
}

function withoutDependents(set: Set<PermissionKey>, key: PermissionKey) {
  set.delete(key)
  for (const [dependent, deps] of Object.entries(REQUIRES) as [PermissionKey, PermissionKey[]][]) {
    if (deps.includes(key) && set.has(dependent)) withoutDependents(set, dependent)
  }
}

function draftFrom(matrix: RoleMatrix): Draft {
  return Object.fromEntries(
    matrix.roles.map((r) => [r.role, new Set(r.permissions)]),
  ) as Draft
}

function sameSet(a: Set<PermissionKey>, b: Set<PermissionKey>) {
  return a.size === b.size && [...a].every((key) => b.has(key))
}

function useInvalidateAccess() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ROLE_MATRIX_QUERY_KEY })
    void queryClient.invalidateQueries({ queryKey: EMPLOYEE_TYPES_QUERY_KEY })
    void queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
    void queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY })
  }
}

function Checkbox({
  checked,
  indeterminate,
  disabled,
  onChange,
  label,
}: {
  checked: boolean
  indeterminate?: boolean
  disabled?: boolean
  onChange: () => void
  label: string
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      className="h-4 w-4 cursor-pointer accent-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
      checked={checked}
      disabled={disabled}
      ref={(el) => {
        if (el) el.indeterminate = !!indeterminate && !checked
      }}
      onChange={onChange}
    />
  )
}

function EmployeeTypeRow({ type }: { type: EmployeeType }) {
  const invalidate = useInvalidateAccess()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(type.name)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const renameMutation = useMutation({
    mutationFn: () => renameEmployeeType(type.key, name.trim()),
    onSuccess: () => {
      setEditing(false)
      invalidate()
      toast.success('Đã đổi tên loại nhân viên')
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteEmployeeType(type.key),
    onSuccess: () => {
      setConfirmDelete(false)
      invalidate()
      toast.success(`Đã xoá loại ${type.name}`)
    },
    onError: (err) => {
      setConfirmDelete(false)
      toast.error(getApiErrorMessage(err))
    },
  })

  const submitRename = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim() || name.trim() === type.name) {
      setEditing(false)
      setName(type.name)
      return
    }
    renameMutation.mutate()
  }

  const inUse = type.userCount > 0

  return (
    <div className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-slate-50">
      {editing ? (
        <form onSubmit={submitRename} className="flex min-w-0 flex-1 items-center gap-1.5">
          <input
            className={cn(INPUT_CLASS, 'h-8')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            autoFocus
          />
          <button
            type="submit"
            aria-label="Lưu tên"
            disabled={renameMutation.isPending}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
          >
            {renameMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            aria-label="Huỷ đổi tên"
            onClick={() => {
              setEditing(false)
              setName(type.name)
            }}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-medium text-slate-800">{type.name}</div>
            <div className="text-[11px] text-slate-400">
              {type.userCount} tài khoản
              {type.customizedRoles.length > 0 &&
                ` · quyền riêng cho ${type.customizedRoles.map((r) => ROLE_LABELS[r]).join(', ')}`}
            </div>
          </div>
          <button
            type="button"
            aria-label={`Đổi tên ${type.name}`}
            onClick={() => setEditing(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={inUse || deleteMutation.isPending}
            title={
              inUse
                ? 'Đang có tài khoản thuộc loại này, đổi loại cho họ trước khi xoá'
                : undefined
            }
            aria-label={`Xoá ${type.name}`}
            onClick={() => setConfirmDelete(true)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </>
      )}
      <ConfirmDialog
        open={confirmDelete}
        title="Xoá loại nhân viên?"
        description={
          <>
            Loại <span className="font-semibold text-slate-800">{type.name}</span> sẽ bị xoá
            {type.customizedRoles.length > 0 && ' cùng các quyền riêng đã cấu hình cho loại này'}. Thao
            tác không thể hoàn tác.
          </>
        }
        pending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

function EmployeeTypeManagerDialog({
  types,
  onClose,
}: {
  types: EmployeeType[]
  onClose: () => void
}) {
  const invalidate = useInvalidateAccess()
  const [name, setName] = useState('')

  const createMutation = useMutation({
    mutationFn: () => createEmployeeType(name.trim()),
    onSuccess: (created) => {
      setName('')
      invalidate()
      toast.success(`Đã thêm loại ${created.name}`)
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (name.trim()) createMutation.mutate()
  }

  return (
    <Modal
      title="Loại nhân viên"
      subtitle="Thêm, đổi tên hoặc xoá loại nhân viên dùng khi cấp tài khoản."
      onClose={onClose}
      footer={
        <button type="button" className={cn(SECONDARY_BUTTON, 'ml-auto')} onClick={onClose}>
          Đóng
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            className={INPUT_CLASS}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="Tên loại mới, ví dụ: Kế toán"
            autoFocus
          />
          <button
            type="submit"
            className={cn(PRIMARY_BUTTON, 'shrink-0')}
            disabled={!name.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Thêm
          </button>
        </form>
        {types.length ? (
          <div className="flex flex-col divide-y divide-slate-50">
            {types.map((type) => (
              <EmployeeTypeRow key={`${type.key}:${type.name}`} type={type} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-[13px] text-slate-500">
            Chưa có loại nhân viên nào
          </div>
        )}
        <p className="text-[11px] leading-relaxed text-slate-400">
          Chỉ xoá được loại không còn tài khoản nào. Xoá loại sẽ xoá luôn bộ quyền riêng của loại đó.
        </p>
      </div>
    </Modal>
  )
}

function PermissionMatrix({
  scope,
  scopeType,
  search,
  onDirtyChange,
}: {
  scope: string
  scopeType: EmployeeType | undefined
  search: string
  onDirtyChange: (dirty: boolean) => void
}) {
  const invalidate = useInvalidateAccess()
  const { data: matrix, isLoading, isError, error } = useQuery({
    queryKey: [...ROLE_MATRIX_QUERY_KEY, scope || 'default'],
    queryFn: () => fetchRoleMatrix(scope || undefined),
  })
  const [draft, setDraft] = useState<Draft | null>(null)

  useEffect(() => {
    if (matrix) setDraft(draftFrom(matrix))
  }, [matrix])

  const saved = useMemo(() => (matrix ? draftFrom(matrix) : null), [matrix])
  const roleMeta = useMemo(
    () => new Map(matrix?.roles.map((r) => [r.role, r]) ?? []),
    [matrix],
  )
  const roles = ROLE_ORDER.filter((role) => roleMeta.has(role))
  const dirtyRoles = draft && saved ? roles.filter((role) => !sameSet(draft[role], saved[role])) : []

  useEffect(() => {
    onDirtyChange(dirtyRoles.length > 0)
  }, [dirtyRoles.length, onDirtyChange])

  const grouped = useMemo(() => {
    if (!matrix) return []
    const query = search.trim().toLowerCase()
    return matrix.groups
      .map((group) => ({
        ...group,
        permissions: matrix.permissions.filter(
          (p) =>
            p.group === group.key &&
            (!query ||
              p.label.toLowerCase().includes(query) ||
              p.description.toLowerCase().includes(query) ||
              p.key.includes(query)),
        ),
      }))
      .filter((group) => group.permissions.length)
  }, [matrix, search])

  const scopeSuffix = scopeType ? ` (${scopeType.name})` : ''

  const saveMutation = useMutation({
    mutationFn: async () => {
      for (const role of dirtyRoles) {
        await updateRolePermissions(role, [...draft![role]], scope || undefined)
      }
      return dirtyRoles
    },
    onSuccess: (savedRoles) => {
      invalidate()
      toast.success(
        `Đã lưu phân quyền${scopeSuffix}: ${savedRoles.map((r) => ROLE_LABELS[r]).join(', ')}`,
      )
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  const resetMutation = useMutation({
    mutationFn: (role: UserRole) => resetRolePermissions(role, scope || undefined),
    onSuccess: (result) => {
      invalidate()
      toast.success(
        scope
          ? `${ROLE_LABELS[result.role]}${scopeSuffix} dùng lại quyền mặc định của vai trò`
          : `Đã khôi phục quyền mặc định cho ${ROLE_LABELS[result.role]}`,
      )
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  const editable = (role: UserRole, permission: PermissionDefinition) =>
    !roleMeta.get(role)?.locked && !permission.adminOnly

  const toggle = (role: UserRole, key: PermissionKey) =>
    setDraft((prev) => {
      if (!prev) return prev
      const next = new Set(prev[role])
      if (next.has(key)) withoutDependents(next, key)
      else withDependencies(next, key)
      return { ...prev, [role]: next }
    })

  const toggleGroup = (role: UserRole, permissions: PermissionDefinition[]) =>
    setDraft((prev) => {
      if (!prev) return prev
      const keys = permissions.filter((p) => editable(role, p)).map((p) => p.key)
      const next = new Set(prev[role])
      const allOn = keys.every((key) => next.has(key))
      for (const key of keys) {
        if (allOn) withoutDependents(next, key)
        else withDependencies(next, key)
      }
      return { ...prev, [role]: next }
    })

  if (isLoading || !draft) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-100 p-6 text-[13px] text-slate-500">
        {isError ? (
          <span className="text-red-600">{getApiErrorMessage(error)}</span>
        ) : (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Đang tải ma trận phân quyền…
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="min-h-0 overflow-auto rounded-xl border border-slate-100">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="border-b border-slate-200">
              <th className="sticky left-0 z-10 w-[340px] bg-white px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Chức năng
              </th>
              {roles.map((role) => {
                const meta = roleMeta.get(role)!
                const allChannels = draft[role].has('channel.all')
                return (
                  <th key={role} className="px-2 py-2.5 text-center align-top">
                    <div className="flex flex-col items-center gap-1">
                      <span className="flex items-center gap-1 text-[12px] font-semibold text-slate-800">
                        {meta.locked && <Lock className="h-3 w-3 text-slate-400" />}
                        {ROLE_LABELS[role]}
                      </span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded px-1.5 text-[10px] font-medium',
                          allChannels ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700',
                        )}
                      >
                        {allChannels && <Globe className="h-2.5 w-2.5" />}
                        {allChannels ? 'Mọi kênh' : 'Theo phân kênh'}
                      </span>
                      {meta.locked ? (
                        <span className="text-[10px] text-slate-400">Cố định</span>
                      ) : meta.customized ? (
                        <>
                          {scope && (
                            <span className="rounded bg-indigo-50 px-1.5 text-[10px] font-medium text-indigo-700">
                              Quyền riêng
                            </span>
                          )}
                          <button
                            type="button"
                            disabled={resetMutation.isPending}
                            onClick={() => resetMutation.mutate(role)}
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
                            title={
                              scope
                                ? 'Bỏ quyền riêng của loại này, dùng chung quyền mặc định của vai trò'
                                : 'Bỏ tuỳ chỉnh, dùng lại bộ quyền mặc định'
                            }
                          >
                            <RotateCcw className="h-2.5 w-2.5" />
                            {scope ? 'Theo vai trò' : 'Về mặc định'}
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          {scope ? 'Theo vai trò' : 'Mặc định'}
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {grouped.map((group) => (
              <Fragment key={group.key}>
                <tr className="bg-slate-50/80">
                  <td className="sticky left-0 z-[1] bg-slate-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                    {group.label}
                  </td>
                  {roles.map((role) => {
                    const editableKeys = group.permissions.filter((p) => editable(role, p))
                    const onCount = editableKeys.filter((p) => draft[role].has(p.key)).length
                    return (
                      <td key={role} className="px-2 py-1.5 text-center">
                        {editableKeys.length > 0 && (
                          <Checkbox
                            label={`Chọn cả nhóm ${group.label} cho ${ROLE_LABELS[role]}`}
                            checked={onCount === editableKeys.length}
                            indeterminate={onCount > 0}
                            onChange={() => toggleGroup(role, group.permissions)}
                          />
                        )}
                      </td>
                    )
                  })}
                </tr>
                {group.permissions.map((permission) => (
                  <tr key={permission.key} className="border-b border-slate-50 last:border-0">
                    <td className="sticky left-0 z-[1] bg-white px-3 py-2">
                      <div className="text-[13px] font-medium text-slate-800">{permission.label}</div>
                      <div className="text-[11px] leading-snug text-slate-400">
                        {permission.description}
                      </div>
                    </td>
                    {roles.map((role) => {
                      const changed =
                        draft[role].has(permission.key) !== saved![role].has(permission.key)
                      return (
                        <td
                          key={role}
                          className={cn('px-2 py-2 text-center', changed && 'bg-indigo-50')}
                        >
                          <Checkbox
                            label={`${permission.label} — ${ROLE_LABELS[role]}`}
                            checked={draft[role].has(permission.key)}
                            disabled={!editable(role, permission)}
                            onChange={() => toggle(role, permission.key)}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
            {!grouped.length && (
              <tr>
                <td colSpan={roles.length + 1} className="py-10 text-center text-[13px] text-slate-500">
                  Không có chức năng khớp từ khoá
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 transition',
          dirtyRoles.length ? 'border-indigo-200 bg-indigo-50/60' : 'border-slate-100 bg-slate-50/60',
        )}
      >
        <span className="mr-auto text-[12px] text-slate-600">
          {dirtyRoles.length
            ? `Chưa lưu thay đổi${scopeSuffix} cho: ${dirtyRoles.map((r) => ROLE_LABELS[r]).join(', ')}`
            : 'Không có thay đổi. Ô được tô màu là quyền vừa đổi.'}
        </span>
        <button
          type="button"
          disabled={!dirtyRoles.length || saveMutation.isPending}
          onClick={() => setDraft(saved && { ...saved })}
          className={SECONDARY_BUTTON}
        >
          Hoàn tác
        </button>
        <button
          type="button"
          disabled={!dirtyRoles.length || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
          className={PRIMARY_BUTTON}
        >
          {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Lưu phân quyền
        </button>
      </div>
    </>
  )
}

export default function RolePermissionsPanel() {
  const { data: employeeTypes = [], isSuccess: typesLoaded } = useEmployeeTypes()
  const [scope, setScope] = useState('')
  const [search, setSearch] = useState('')
  const [dirty, setDirty] = useState(false)
  const [managing, setManaging] = useState(false)

  const scopeType = employeeTypes.find((t) => t.key === scope)

  useEffect(() => {
    if (scope && typesLoaded && !scopeType) {
      setDirty(false)
      setScope('')
    }
  }, [scope, scopeType, typesLoaded])

  const changeScope = (next: string) => {
    if (next === scope) return
    if (dirty && !window.confirm('Bỏ các thay đổi phân quyền chưa lưu?')) return
    setDirty(false)
    setScope(next)
  }

  const chipClass = (active: boolean) =>
    cn(
      'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium transition',
      active
        ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
        : 'border-slate-200 text-slate-600 hover:bg-slate-50',
    )

  return (
    <div className="flex min-h-0 flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
            <ShieldCheck className="h-4 w-4 text-indigo-600" /> Phân quyền vai trò
          </h3>
          <p className="mt-0.5 max-w-[680px] text-[12px] leading-relaxed text-slate-500">
            Chọn chức năng mỗi vai trò được dùng, chung cho mọi loại nhân viên hoặc riêng cho từng
            loại. Thay đổi áp dụng trong khoảng 30 giây; người dùng tải lại trang để thấy menu mới.
            Quản trị viên luôn có toàn quyền.
          </p>
        </div>
        <div className="relative w-full sm:w-60">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={cn(INPUT_CLASS, 'pl-9')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm chức năng"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Áp dụng cho
          </span>
          <button type="button" className={chipClass(!scope)} onClick={() => changeScope('')}>
            Mặc định theo vai trò
          </button>
          {employeeTypes.map((type) => (
            <button
              key={type.key}
              type="button"
              className={chipClass(scope === type.key)}
              onClick={() => changeScope(type.key)}
              title={
                type.customizedRoles.length
                  ? `Có quyền riêng cho: ${type.customizedRoles.map((r) => ROLE_LABELS[r]).join(', ')}`
                  : 'Đang dùng quyền mặc định theo vai trò'
              }
            >
              {type.customizedRoles.length > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              )}
              {type.name}
              <span className="text-slate-400">{type.userCount}</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setManaging(true)}
            className="ml-auto inline-flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-medium text-indigo-600 transition hover:bg-indigo-50"
          >
            <Settings2 className="h-3.5 w-3.5" /> Quản lý loại nhân viên
          </button>
        </div>
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-[12px] leading-relaxed text-slate-600">
          {scopeType ? (
            <>
              Đang chỉnh quyền cho nhân viên loại <strong>{scopeType.name}</strong> (
              {scopeType.userCount} tài khoản). Cột ghi “Theo vai trò” đang dùng chung quyền mặc
              định của vai trò; đổi ô bất kỳ rồi lưu sẽ tạo bộ quyền riêng cho loại này. Bộ quyền
              riêng không tự cập nhật khi quyền mặc định của vai trò thay đổi.
            </>
          ) : (
            <>
              Quyền mặc định áp dụng cho tài khoản chưa phân loại và cho các loại nhân viên chưa có
              quyền riêng ở vai trò tương ứng.
            </>
          )}
        </p>
      </div>

      <PermissionMatrix
        key={scope || 'default'}
        scope={scope}
        scopeType={scopeType}
        search={search}
        onDirtyChange={setDirty}
      />

      {managing && (
        <EmployeeTypeManagerDialog types={employeeTypes} onClose={() => setManaging(false)} />
      )}
    </div>
  )
}
