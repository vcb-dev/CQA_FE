import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Globe, Loader2, Lock, Pencil, Search, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/axios'
import { cn } from '@/lib/utils'
import {
  CSKH_PAGES_LITE_QUERY_KEY,
  fetchCskhPages,
  type CskhPage,
} from '@/features/cskh-quality/api'
import {
  PLATFORM_LABELS,
  PlatformGlyph,
  groupPagesByPlatform,
  pageBucket,
  type PlatformKey,
} from '@/features/cskh-quality/cskhPlatform'
import {
  ACCOUNTS_QUERY_KEY,
  CURRENT_USER_QUERY_KEY,
  EMPLOYEE_TYPES_QUERY_KEY,
  PASSWORD_RULE,
  ROLE_LABELS,
  ROLE_ORDER,
  assignAccountPages,
  assignableRoles,
  canDeleteAccount,
  canEditAccount,
  deleteAccount,
  hasAnyPermission,
  hasPermission,
  createAccount,
  fetchAccounts,
  updateAccount,
  useCurrentUserProfile,
  useEmployeeTypes,
  type Account,
  type AccountInput,
  type CurrentUserProfile,
  type EmployeeType,
  type UserRole,
} from './api'
import { ConfirmDialog, Field, INPUT_CLASS, Modal, PRIMARY_BUTTON, SECONDARY_BUTTON } from './ui'

const ROLE_BADGE: Record<UserRole, string> = {
  admin: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  manager: 'bg-violet-50 text-violet-700 ring-violet-200',
  leader: 'bg-sky-50 text-sky-700 ring-sky-200',
  staff: 'bg-slate-100 text-slate-700 ring-slate-200',
  user: 'bg-slate-50 text-slate-500 ring-slate-200',
}

const ROLE_SCOPE: Record<UserRole, string> = {
  admin: 'Toàn quyền hệ thống, không giới hạn được',
  manager: 'Mặc định: cấp tài khoản, phân kênh, quản lý kết nối kênh',
  leader: 'Mặc định: phân kênh cho nhân viên, làm việc trên mọi kênh',
  staff: 'Mặc định: chat, gắn nhãn, tạo đơn trên kênh được giao',
  user: 'Mặc định: chỉ xem hội thoại trên kênh được giao',
}

const PLATFORM_TONE: Record<PlatformKey, string> = {
  facebook: 'bg-blue-50 text-blue-600',
  instagram: 'bg-pink-50 text-pink-600',
  tiktok: 'bg-slate-900 text-white',
  threads: 'bg-slate-100 text-slate-700',
  youtube: 'bg-red-50 text-red-600',
}

type RoleFilter = 'all' | 'unassigned' | UserRole

function usePagesLite() {
  return useQuery({
    queryKey: CSKH_PAGES_LITE_QUERY_KEY,
    queryFn: () => fetchCskhPages({ lite: true }),
    staleTime: 300_000,
  })
}

function initials(name?: string | null, email?: string) {
  const source = name?.trim() || email || '?'
  const parts = source.split(/\s+/).filter(Boolean)
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : source.slice(0, 2)
  return letters.toUpperCase()
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        ROLE_BADGE[role],
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  )
}

function PageAvatar({ page }: { page: Pick<CskhPage, 'platform' | 'pagePictureUrl'> }) {
  const [broken, setBroken] = useState(false)
  const bucket = pageBucket(page.platform)
  if (page.pagePictureUrl && !broken) {
    return (
      <img
        src={page.pagePictureUrl}
        alt=""
        onError={() => setBroken(true)}
        className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
      />
    )
  }
  return (
    <span
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
        PLATFORM_TONE[bucket],
      )}
    >
      <PlatformGlyph name={bucket} />
    </span>
  )
}

function AccountFormDialog({
  me,
  account,
  employeeTypes,
  onClose,
  onSaved,
  onDeleted,
}: {
  me: CurrentUserProfile
  account: Account | null
  employeeTypes: EmployeeType[]
  onClose: () => void
  onSaved: (account: Account, created: boolean) => void
  onDeleted: (account: Account) => void
}) {
  const isSelf = account?.id === me.id
  const canDelete = !!account && canDeleteAccount(me, account)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const allowedRoles = assignableRoles(me.role)
  const roleOptions =
    account && !allowedRoles.includes(account.role) ? [account.role, ...allowedRoles] : allowedRoles
  const [fullName, setFullName] = useState(account?.fullName ?? '')
  const [email, setEmail] = useState(account?.email ?? '')
  const [phoneNumber, setPhoneNumber] = useState(account?.phoneNumber ?? '')
  const [role, setRole] = useState<UserRole>(account?.role ?? 'staff')
  const [employeeType, setEmployeeType] = useState<string>(account?.employeeType ?? '')
  const typeOptions =
    employeeType && !employeeTypes.some((t) => t.key === employeeType)
      ? [...employeeTypes, { key: employeeType, name: employeeType } as EmployeeType]
      : employeeTypes
  const [password, setPassword] = useState('')
  const [isActive, setIsActive] = useState(account?.isActive ?? true)
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => {
      if (!account) {
        return createAccount({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          phoneNumber: phoneNumber.trim() || undefined,
          role,
          employeeType: employeeType || undefined,
        })
      }
      const input: AccountInput = {}
      if (fullName.trim() !== (account.fullName ?? '')) input.fullName = fullName.trim()
      if (email.trim().toLowerCase() !== account.email.toLowerCase()) input.email = email.trim()
      if (phoneNumber.trim() !== (account.phoneNumber ?? '')) input.phoneNumber = phoneNumber.trim()
      if (role !== account.role) input.role = role
      if ((employeeType || null) !== (account.employeeType ?? null)) {
        input.employeeType = employeeType || null
      }
      if (password) input.password = password
      if (isActive !== account.isActive) input.isActive = isActive
      return updateAccount(account.id, input)
    },
    onSuccess: (saved) => onSaved(saved, !account),
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteAccount(account!.id),
    onSuccess: () => {
      setConfirmDelete(false)
      onDeleted(account!)
    },
    onError: (err) => {
      setConfirmDelete(false)
      setError(getApiErrorMessage(err))
    },
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    if (!fullName.trim()) return setError('Nhập họ tên')
    if (!email.trim()) return setError('Nhập email đăng nhập')
    if ((!account || password) && !PASSWORD_RULE.test(password)) {
      return setError('Mật khẩu 6–50 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường và 1 số')
    }
    mutation.mutate()
  }

  return (
    <Modal
      title={account ? 'Sửa tài khoản' : 'Cấp tài khoản mới'}
      subtitle={
        account
          ? account.email
          : 'Người dùng đăng nhập bằng email và mật khẩu bạn đặt ở đây.'
      }
      onClose={onClose}
      footer={
        <>
          <span className="mr-auto text-[12px] text-slate-500">
            {isSelf && 'Bạn đang sửa tài khoản của chính mình'}
            {canDelete && (
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  setError(null)
                  setConfirmDelete(true)
                }}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
              >
                Xoá tài khoản
              </button>
            )}
          </span>
          <button type="button" className={SECONDARY_BUTTON} onClick={onClose}>
            Hủy
          </button>
          <button
            type="submit"
            form="account-form"
            className={PRIMARY_BUTTON}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {account ? 'Lưu thay đổi' : 'Cấp tài khoản'}
          </button>
        </>
      }
    >
      <form id="account-form" onSubmit={submit} className="flex flex-col gap-3.5">
        <Field label="Họ tên">
          <input
            className={INPUT_CLASS}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={100}
            placeholder="Nguyễn Văn A"
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Email đăng nhập">
            <input
              className={INPUT_CLASS}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nhanvien@vienchibao.com"
              autoComplete="off"
            />
          </Field>
          <Field label="Số điện thoại">
            <input
              className={INPUT_CLASS}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              maxLength={30}
              placeholder="Không bắt buộc"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Vai trò">
            <select
              className={INPUT_CLASS}
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={isSelf}
            >
              {roleOptions.map((option) => (
                <option key={option} value={option} disabled={!allowedRoles.includes(option)}>
                  {ROLE_LABELS[option]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Loại nhân viên">
            <select
              className={INPUT_CLASS}
              value={employeeType}
              onChange={(e) => setEmployeeType(e.target.value)}
              disabled={isSelf}
            >
              <option value="">Chưa phân loại</option>
              {typeOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className="-mt-2 text-[11px] leading-snug text-slate-400">
          {isSelf
            ? 'Không thể tự đổi vai trò và loại nhân viên của chính mình.'
            : `${ROLE_SCOPE[role]}. Quyền theo vai trò và loại nhân viên chỉnh ở tab Phân quyền vai trò.`}
        </p>
        <Field
          label={account ? 'Đặt lại mật khẩu' : 'Mật khẩu'}
          hint={
            account
              ? 'Để trống nếu không đổi. 6–50 ký tự, có chữ hoa, chữ thường và số.'
              : '6–50 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường và 1 số.'
          }
        >
          <input
            className={INPUT_CLASS}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder={account ? '••••••••' : ''}
          />
        </Field>
        {account && !isSelf && (
          <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-indigo-600"
              checked={!isActive}
              onChange={(e) => setIsActive(!e.target.checked)}
            />
            <span>
              <span className="block text-[13px] font-medium text-slate-800">Khóa tài khoản</span>
              <span className="block text-[11px] text-slate-500">
                Người dùng bị đăng xuất và không đăng nhập lại được cho tới khi mở khóa.
              </span>
            </span>
          </label>
        )}
        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {error}
          </div>
        )}
      </form>
      {account && (
        <ConfirmDialog
          open={confirmDelete}
          title="Xoá tài khoản?"
          description={
            <>
              Tài khoản <span className="font-semibold text-slate-800">{account.fullName || account.email}</span>
              {account.fullName && <> ({account.email})</>} sẽ bị xoá vĩnh viễn và không thể khôi phục.
            </>
          }
          confirmLabel="Xoá vĩnh viễn"
          pending={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </Modal>
  )
}

function ChannelAssignDialog({
  account,
  pages,
  pagesLoading,
  onClose,
  onSaved,
}: {
  account: Account
  pages: CskhPage[]
  pagesLoading: boolean
  onClose: () => void
  onSaved: (pageIds: string[]) => void
}) {
  const [selected, setSelected] = useState(() => new Set(account.assignedPageIds))
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState<'all' | PlatformKey>('all')

  const knownIds = useMemo(() => new Set(pages.map((p) => p.pageId)), [pages])
  const platforms = useMemo(() => groupPagesByPlatform(pages).map((g) => g.key), [pages])
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    return pages.filter(
      (p) =>
        (platform === 'all' || pageBucket(p.platform) === platform) &&
        (!query || (p.pageName ?? '').toLowerCase().includes(query) || p.pageId.includes(query)),
    )
  }, [pages, platform, search])
  const groups = useMemo(() => groupPagesByPlatform(visible), [visible])
  const selectedKnown = useMemo(
    () => [...selected].filter((id) => knownIds.has(id)),
    [selected, knownIds],
  )
  const original = useMemo(() => new Set(account.assignedPageIds), [account.assignedPageIds])
  const dirty =
    selectedKnown.length !== original.size || selectedKnown.some((id) => !original.has(id))

  const setMany = (ids: string[], on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        if (on) next.add(id)
        else next.delete(id)
      }
      return next
    })

  const mutation = useMutation({
    mutationFn: () => assignAccountPages(account.id, selectedKnown),
    onSuccess: (result) => onSaved(result.pageIds),
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  const visibleIds = visible.map((p) => p.pageId)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))

  return (
    <Modal
      title="Phân kênh làm việc"
      subtitle={
        <>
          {account.fullName || account.email} · <RoleBadge role={account.role} />
        </>
      }
      onClose={onClose}
      className="w-[min(640px,94vw)]"
      footer={
        <>
          <span className="mr-auto text-[12px] text-slate-600">
            Đã chọn <strong className="text-slate-900">{selectedKnown.length}</strong>/{pages.length} kênh
          </span>
          <button type="button" className={SECONDARY_BUTTON} onClick={onClose}>
            Hủy
          </button>
          <button
            type="button"
            className={PRIMARY_BUTTON}
            disabled={!dirty || mutation.isPending || pagesLoading}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Lưu phân kênh
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-[12px] leading-relaxed text-slate-500">
          Nhân viên chỉ thấy danh sách page, hội thoại, bình luận và nhận thông báo realtime của các
          kênh được chọn. Thay đổi có hiệu lực trong vòng 30 giây.
        </p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={cn(INPUT_CLASS, 'pl-9')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên kênh hoặc ID"
            autoFocus
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', ...platforms] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setPlatform(key)}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium transition',
                platform === key
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50',
              )}
            >
              {key !== 'all' && <PlatformGlyph name={key} className="h-3 w-3" />}
              {key === 'all' ? 'Tất cả' : PLATFORM_LABELS[key]}
            </button>
          ))}
          <button
            type="button"
            className="ml-auto text-[12px] font-medium text-indigo-600 hover:text-indigo-500 disabled:text-slate-300"
            disabled={!visibleIds.length}
            onClick={() => setMany(visibleIds, !allVisibleSelected)}
          >
            {allVisibleSelected ? 'Bỏ chọn danh sách đang lọc' : 'Chọn tất cả đang lọc'}
          </button>
        </div>

        {pagesLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-[13px] text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Đang tải danh sách kênh…
          </div>
        ) : !groups.length ? (
          <div className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-[13px] text-slate-500">
            {pages.length ? 'Không có kênh khớp bộ lọc' : 'Chưa có kênh nào được kết nối'}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map((group) => {
              const ids = group.pages.map((p) => p.pageId)
              const groupChecked = ids.filter((id) => selected.has(id)).length
              return (
                <section key={group.key}>
                  <div className="mb-1 flex items-center gap-2 px-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      {group.label}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {groupChecked}/{ids.length}
                    </span>
                    <button
                      type="button"
                      className="ml-auto text-[11px] font-medium text-slate-500 hover:text-indigo-600"
                      onClick={() => setMany(ids, groupChecked < ids.length)}
                    >
                      {groupChecked < ids.length ? 'Chọn cả nhóm' : 'Bỏ chọn nhóm'}
                    </button>
                  </div>
                  <div className="flex flex-col">
                    {group.pages.map((page) => {
                      const checked = selected.has(page.pageId)
                      return (
                        <label
                          key={page.pageId}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition',
                            checked ? 'bg-indigo-50/70' : 'hover:bg-slate-50',
                          )}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-indigo-600"
                            checked={checked}
                            onChange={() => setMany([page.pageId], !checked)}
                          />
                          <PageAvatar page={page} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-slate-800">
                              {page.pageName || page.pageId}
                            </span>
                            <span className="block truncate text-[11px] text-slate-400">
                              {page.pageId}
                              {!page.enabled && ' · đang tắt đồng bộ'}
                            </span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}

function ChannelSummary({
  account,
  pageById,
}: {
  account: Account
  pageById: Map<string, CskhPage>
}) {
  if (!account.channelRestricted) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
        <Globe className="h-3.5 w-3.5" /> Tất cả kênh
      </span>
    )
  }
  const known = account.assignedPageIds
    .map((id) => pageById.get(id))
    .filter((p): p is CskhPage => Boolean(p))
  const count = pageById.size ? known.length : account.assignedPageIds.length
  if (!count) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-[12px] font-medium text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5" /> Chưa phân kênh
      </span>
    )
  }
  const preview = known.slice(0, 2)
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {preview.map((page) => (
        <span
          key={page.pageId}
          className="inline-flex max-w-[150px] items-center gap-1 truncate rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
          title={page.pageName || page.pageId}
        >
          <PlatformGlyph name={pageBucket(page.platform)} className="h-3 w-3 shrink-0" />
          <span className="truncate">{page.pageName || page.pageId}</span>
        </span>
      ))}
      {count > preview.length && (
        <span className="text-[11px] font-medium text-slate-500">+{count - preview.length}</span>
      )}
    </div>
  )
}

function AccountsManager({ me }: { me: CurrentUserProfile }) {
  const queryClient = useQueryClient()
  const {
    data: accounts = [],
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ACCOUNTS_QUERY_KEY, queryFn: fetchAccounts })
  const { data: pagesData, isLoading: pagesLoading } = usePagesLite()
  const pages = useMemo(() => pagesData?.pages ?? [], [pagesData])
  const pageById = useMemo(() => new Map(pages.map((p) => [p.pageId, p])), [pages])
  const { data: employeeTypes = [] } = useEmployeeTypes()
  const typeName = useMemo(
    () => new Map(employeeTypes.map((t) => [t.key, t.name])),
    [employeeTypes],
  )

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [typeFilter, setTypeFilter] = useState('')
  const [editing, setEditing] = useState<Account | 'new' | null>(null)
  const [assigning, setAssigning] = useState<Account | null>(null)
  const canManage = hasPermission(me, 'account.manage')
  const canAssign = hasPermission(me, 'account.assign_channels')

  const isUnassigned = (a: Account) =>
    a.channelRestricted &&
    a.isActive &&
    (pageById.size
      ? !a.assignedPageIds.some((id) => pageById.has(id))
      : !a.assignedPageIds.length)

  const roleCounts = useMemo(() => {
    const counts = new Map<UserRole, number>()
    for (const a of accounts) counts.set(a.role, (counts.get(a.role) ?? 0) + 1)
    return counts
  }, [accounts])
  const unassignedCount = accounts.filter(isUnassigned).length

  const filtered = accounts.filter((a) => {
    if (roleFilter === 'unassigned' && !isUnassigned(a)) return false
    if (roleFilter !== 'all' && roleFilter !== 'unassigned' && a.role !== roleFilter) return false
    if (typeFilter === '-' && a.employeeType) return false
    if (typeFilter && typeFilter !== '-' && a.employeeType !== typeFilter) return false
    const query = search.trim().toLowerCase()
    if (!query) return true
    return (
      (a.fullName ?? '').toLowerCase().includes(query) ||
      a.email.toLowerCase().includes(query) ||
      (a.phoneNumber ?? '').includes(query)
    )
  })

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: EMPLOYEE_TYPES_QUERY_KEY })
    return queryClient.invalidateQueries({ queryKey: ACCOUNTS_QUERY_KEY })
  }

  const handleSaved = (saved: Account, created: boolean) => {
    setEditing(null)
    void refresh()
    if (saved.id === me.id) {
      void queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY })
    }
    if (created && saved.channelRestricted) {
      toast.success('Đã cấp tài khoản — chọn kênh làm việc cho nhân viên')
      setAssigning(saved)
      return
    }
    toast.success(created ? 'Đã cấp tài khoản' : 'Đã cập nhật tài khoản')
  }

  const handleDeleted = (deleted: Account) => {
    setEditing(null)
    void refresh()
    toast.success(`Đã xoá tài khoản ${deleted.email}`)
  }

  const filterChips: { key: RoleFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: accounts.length },
    ...ROLE_ORDER.filter((r) => roleCounts.get(r)).map((r) => ({
      key: r as RoleFilter,
      label: ROLE_LABELS[r],
      count: roleCounts.get(r) ?? 0,
    })),
  ]

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-slate-900">Tài khoản & phân kênh</h3>
          <p className="mt-0.5 max-w-[620px] text-[12px] leading-relaxed text-slate-500">
            Cấp, khoá tài khoản và phân kênh làm việc. Tài khoản không có quyền “Làm việc trên mọi
            kênh” chỉ thấy và xử lý hội thoại trên các kênh được giao.
          </p>
        </div>
        {canManage && (
          <button type="button" className={PRIMARY_BUTTON} onClick={() => setEditing('new')}>
            <UserPlus className="h-4 w-4" /> Cấp tài khoản
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className={cn(INPUT_CLASS, 'pl-9')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, email, số điện thoại"
          />
        </div>
        {employeeTypes.length > 0 && (
          <select
            className={cn(INPUT_CLASS, 'w-full sm:w-44')}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Lọc theo loại nhân viên"
          >
            <option value="">Mọi loại nhân viên</option>
            <option value="-">Chưa phân loại</option>
            {employeeTypes.map((t) => (
              <option key={t.key} value={t.key}>
                {t.name}
              </option>
            ))}
          </select>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setRoleFilter(chip.key)}
              className={cn(
                'inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-[12px] font-medium transition',
                roleFilter === chip.key
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50',
              )}
            >
              {chip.label}
              <span className="text-slate-400">{chip.count}</span>
            </button>
          ))}
          {unassignedCount > 0 && (
            <button
              type="button"
              onClick={() => setRoleFilter('unassigned')}
              className={cn(
                'inline-flex h-7 items-center gap-1 rounded-full border px-2.5 text-[12px] font-medium transition',
                roleFilter === 'unassigned'
                  ? 'border-amber-300 bg-amber-100 text-amber-800'
                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Chưa phân kênh
              <span className="text-amber-600">{unassignedCount}</span>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-3 font-semibold">Tài khoản</th>
              <th className="py-2 pr-3 font-semibold">Vai trò</th>
              <th className="py-2 pr-3 font-semibold">Loại nhân viên</th>
              <th className="py-2 pr-3 font-semibold">Kênh làm việc</th>
              <th className="py-2 pr-3 font-semibold">Trạng thái</th>
              <th className="py-2 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[13px] text-slate-500">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Đang tải tài khoản…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[13px] text-red-600">
                  {getApiErrorMessage(error)}
                </td>
              </tr>
            ) : !filtered.length ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-[13px] text-slate-500">
                  Không có tài khoản khớp bộ lọc
                </td>
              </tr>
            ) : (
              filtered.map((account) => (
                <tr
                  key={account.id}
                  className={cn(
                    'border-b border-slate-50 last:border-0',
                    !account.isActive && 'opacity-60',
                  )}
                >
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-700">
                        {initials(account.fullName, account.email)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate text-[13px] font-semibold text-slate-800">
                          {account.fullName || '—'}
                          {account.id === me.id && (
                            <span className="rounded bg-slate-100 px-1.5 text-[10px] font-medium text-slate-500">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="truncate text-[12px] text-slate-500">{account.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3">
                    <RoleBadge role={account.role} />
                  </td>
                  <td className="py-2.5 pr-3 text-[12px]">
                    {account.employeeType ? (
                      <span className="font-medium text-slate-700">
                        {typeName.get(account.employeeType) ?? account.employeeType}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="max-w-[280px] py-2.5 pr-3">
                    <ChannelSummary account={account} pageById={pageById} />
                  </td>
                  <td className="py-2.5 pr-3">
                    {account.isActive ? (
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500">
                        <Lock className="h-3.5 w-3.5" /> Đã khóa
                      </span>
                    )}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {canAssign && account.channelRestricted && (
                        <button
                          type="button"
                          onClick={() => setAssigning(account)}
                          className="inline-flex h-7 items-center rounded-lg border border-indigo-200 px-2.5 text-[12px] font-medium text-indigo-700 transition hover:bg-indigo-50"
                        >
                          Phân kênh
                        </button>
                      )}
                      {canEditAccount(me, account) && (
                        <button
                          type="button"
                          onClick={() => setEditing(account)}
                          aria-label={`Sửa ${account.email}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <AccountFormDialog
          me={me}
          account={editing === 'new' ? null : editing}
          employeeTypes={employeeTypes}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
      {assigning && (
        <ChannelAssignDialog
          account={assigning}
          pages={pages}
          pagesLoading={pagesLoading}
          onClose={() => setAssigning(null)}
          onSaved={(pageIds) => {
            setAssigning(null)
            void refresh()
            toast.success(
              pageIds.length
                ? `Đã giao ${pageIds.length} kênh cho ${assigning.fullName || assigning.email}`
                : `Đã gỡ toàn bộ kênh của ${assigning.fullName || assigning.email}`,
            )
          }}
        />
      )}
    </div>
  )
}

function MyChannelsCard({ me }: { me: CurrentUserProfile }) {
  const { data, isLoading } = usePagesLite()
  const groups = useMemo(() => groupPagesByPlatform(data?.pages ?? []), [data])
  const allChannels = hasPermission(me, 'channel.all')

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-[15px] font-bold text-slate-900">Kênh làm việc của bạn</h3>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Bạn đăng nhập với vai trò <RoleBadge role={me.role} />
          {allChannels
            ? ' — được làm việc trên tất cả các kênh dưới đây.'
            : ' — chỉ xem và xử lý hội thoại trên các kênh dưới đây. Cần thêm kênh, hãy liên hệ trưởng nhóm.'}
        </p>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 py-6 text-[13px] text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Đang tải…
        </div>
      ) : !groups.length ? (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-[13px] text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Bạn chưa được phân kênh nào. Liên hệ trưởng nhóm để được giao kênh làm việc.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
          {groups.map((group) => (
            <section key={group.key}>
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {group.label} · {group.pages.length}
              </div>
              {group.pages.map((page) => (
                <div key={page.pageId} className="flex items-center gap-2.5 py-1.5">
                  <PageAvatar page={page} />
                  <span className="truncate text-[13px] text-slate-800">{page.pageName || page.pageId}</span>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

export default function UserAccessPanel() {
  const { data: me, isLoading } = useCurrentUserProfile()
  if (isLoading || !me) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-6 text-[13px] text-slate-500 shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin" /> Đang tải thông tin tài khoản…
      </div>
    )
  }
  return hasAnyPermission(me, ['account.view', 'account.assign_channels']) ? (
    <AccountsManager me={me} />
  ) : (
    <MyChannelsCard me={me} />
  )
}
