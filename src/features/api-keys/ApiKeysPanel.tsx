import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Copy, KeyRound, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/axios'
import { cn } from '@/lib/utils'
import {
  ConfirmDialog,
  Field,
  INPUT_CLASS,
  Modal,
  PRIMARY_BUTTON,
  SECONDARY_BUTTON,
} from '@/features/user-access/ui'
import {
  API_KEYS_QUERY_KEY,
  API_KEY_SCOPES,
  createApiKey,
  fetchApiKeys,
  integrationBaseUrl,
  revokeApiKey,
  type ApiKey,
  type ApiKeyScope,
  type ApiKeyStatus,
  type CreatedApiKey,
} from './api'

const DAY_MS = 24 * 60 * 60 * 1000

const STATUS_STYLE: Record<ApiKeyStatus, { label: string; className: string }> = {
  active: { label: 'Đang dùng', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  expired: { label: 'Hết hạn', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  revoked: { label: 'Đã thu hồi', className: 'bg-slate-100 text-slate-500 ring-slate-200' },
}

const EXPIRY_OPTIONS = [
  { value: '30', label: '30 ngày' },
  { value: '90', label: '90 ngày' },
  { value: '365', label: '1 năm' },
  { value: 'never', label: 'Không hết hạn' },
]

const SCOPE_SHORT = new Map(API_KEY_SCOPES.map((scope) => [scope.key, scope.short]))

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

async function copyToClipboard(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`Đã sao chép ${label}`)
  } catch {
    toast.error('Trình duyệt chặn sao chép — hãy bôi đen và sao chép thủ công')
  }
}

function StatusBadge({ status }: { status: ApiKeyStatus }) {
  const style = STATUS_STYLE[status]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset',
        style.className,
      )}
    >
      {style.label}
    </span>
  )
}

function CreateApiKeyModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (created: CreatedApiKey) => void
}) {
  const [name, setName] = useState('')
  const [scopes, setScopes] = useState<ApiKeyScope[]>(API_KEY_SCOPES.map((scope) => scope.key))
  const [expiry, setExpiry] = useState('365')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      createApiKey({
        name: name.trim(),
        scopes,
        expiresAt:
          expiry === 'never' ? null : new Date(Date.now() + Number(expiry) * DAY_MS).toISOString(),
      }),
    onSuccess: onCreated,
    onError: (err) => setError(getApiErrorMessage(err)),
  })

  const toggleScope = (key: ApiKeyScope) =>
    setScopes((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return setError('Nhập tên API key')
    if (!scopes.length) return setError('Chọn ít nhất một loại dữ liệu được đọc')
    setError(null)
    mutation.mutate()
  }

  return (
    <Modal
      title="Cấp API key"
      subtitle="Key gốc chỉ hiển thị một lần ngay sau khi cấp"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={cn(SECONDARY_BUTTON, 'ml-auto')} onClick={onClose}>
            Huỷ
          </button>
          <button
            type="submit"
            form="api-key-form"
            className={PRIMARY_BUTTON}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Cấp key
          </button>
        </>
      }
    >
      <form id="api-key-form" onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Tên gợi nhớ" hint="Đặt theo hệ thống sẽ dùng key để dễ thu hồi sau này">
          <input
            className={INPUT_CLASS}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            placeholder="Ví dụ: Automation Gen Video"
            autoFocus
          />
        </Field>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-[12px] font-medium text-slate-700">Dữ liệu được đọc</legend>
          {API_KEY_SCOPES.map((scope) => {
            const checked = scopes.includes(scope.key)
            return (
              <label
                key={scope.key}
                className={cn(
                  'flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 transition',
                  checked
                    ? 'border-indigo-200 bg-indigo-50/60'
                    : 'border-slate-200 hover:bg-slate-50',
                )}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 accent-indigo-600"
                  checked={checked}
                  onChange={() => toggleScope(scope.key)}
                />
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium text-slate-800">{scope.label}</span>
                  <span className="block font-mono text-[11px] text-slate-500">GET {scope.path}</span>
                </span>
              </label>
            )
          })}
        </fieldset>

        <Field label="Thời hạn">
          <select
            className={INPUT_CLASS}
            value={expiry}
            onChange={(event) => setExpiry(event.target.value)}
          >
            {EXPIRY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>
        )}
      </form>
    </Modal>
  )
}

function IssuedKeyModal({ created, onClose }: { created: CreatedApiKey; onClose: () => void }) {
  const base = integrationBaseUrl()
  const granted = API_KEY_SCOPES.filter((scope) => created.scopes.includes(scope.key))

  return (
    <Modal
      title="Đã cấp API key"
      subtitle={created.name}
      onClose={onClose}
      className="w-[min(640px,94vw)]"
      footer={
        <button type="button" className={cn(PRIMARY_BUTTON, 'ml-auto')} onClick={onClose}>
          Tôi đã lưu key
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] leading-relaxed text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Key chỉ hiển thị lần này. Sao chép và gửi cho bên tích hợp qua kênh an toàn; nếu làm mất,
            hãy thu hồi và cấp key mới.
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="min-w-0 flex-1 select-all break-all rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[12px] text-slate-800">
            {created.plainKey}
          </code>
          <button
            type="button"
            className={SECONDARY_BUTTON}
            onClick={() => copyToClipboard(created.plainKey, 'API key')}
          >
            <Copy className="h-4 w-4" /> Sao chép
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[12px] font-medium text-slate-700">Gọi thử</span>
          {granted.map((scope) => (
            <pre
              key={scope.key}
              className="overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 font-mono text-[11px] leading-relaxed text-slate-100"
            >
              {`curl -H "X-Api-Key: ${created.plainKey}" \\\n  "${base}${scope.path}"`}
            </pre>
          ))}
        </div>
      </div>
    </Modal>
  )
}

function IntegrationGuide() {
  const base = integrationBaseUrl()
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-[12px] leading-relaxed text-slate-600">
      <div className="mb-1.5 text-[12px] font-semibold text-slate-800">Cách hệ thống ngoài gọi</div>
      <p>
        Gửi key trong header <code className="font-mono text-slate-800">X-Api-Key</code> (hoặc{' '}
        <code className="font-mono text-slate-800">Authorization: Bearer</code>). Gốc API:{' '}
        <code className="break-all font-mono text-slate-800">{base}</code>
      </p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {API_KEY_SCOPES.map((scope) => (
          <li key={scope.key}>
            <code className="font-mono text-slate-800">GET {scope.path}</code>
            <span className="text-slate-400"> · {scope.params}</span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-slate-500">
        Nhân sự có <code className="font-mono">channel_scope = "all"</code> làm việc trên mọi kênh
        nên <code className="font-mono">channels</code> để trống.
      </p>
    </div>
  )
}

export default function ApiKeysPanel() {
  const queryClient = useQueryClient()
  const { data: keys = [], isLoading, isError, error } = useQuery({
    queryKey: API_KEYS_QUERY_KEY,
    queryFn: fetchApiKeys,
  })
  const [creating, setCreating] = useState(false)
  const [issued, setIssued] = useState<CreatedApiKey | null>(null)
  const [revoking, setRevoking] = useState<ApiKey | null>(null)

  const revokeMutation = useMutation({
    mutationFn: (id: string) => revokeApiKey(id),
    onSuccess: (key) => {
      toast.success(`Đã thu hồi key “${key.name}”`)
      setRevoking(null)
      void queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY })
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  })

  const onCreated = (created: CreatedApiKey) => {
    setCreating(false)
    setIssued(created)
    void queryClient.invalidateQueries({ queryKey: API_KEYS_QUERY_KEY })
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-bold text-slate-900">API key</h3>
          <p className="mt-0.5 max-w-[620px] text-[12px] leading-relaxed text-slate-500">
            Cấp key cho hệ thống ngoài đọc danh sách kênh và nhân sự Editor / Sale kèm kênh đang
            cầm. Mỗi key chỉ đọc được phần dữ liệu đã chọn và có thể thu hồi bất cứ lúc nào.
          </p>
        </div>
        <button type="button" className={PRIMARY_BUTTON} onClick={() => setCreating(true)}>
          <KeyRound className="h-4 w-4" /> Cấp API key
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <th className="py-2 pr-3 font-semibold">Tên</th>
              <th className="py-2 pr-3 font-semibold">Key</th>
              <th className="py-2 pr-3 font-semibold">Dữ liệu</th>
              <th className="py-2 pr-3 font-semibold">Hết hạn</th>
              <th className="py-2 pr-3 font-semibold">Dùng lần cuối</th>
              <th className="py-2 pr-3 font-semibold">Trạng thái</th>
              <th className="py-2 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[13px] text-slate-500">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Đang tải API key…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[13px] text-red-600">
                  {getApiErrorMessage(error)}
                </td>
              </tr>
            ) : !keys.length ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-[13px] text-slate-500">
                  Chưa cấp API key nào
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr
                  key={key.id}
                  className={cn(
                    'border-b border-slate-50 last:border-0',
                    key.status === 'revoked' && 'opacity-60',
                  )}
                >
                  <td className="max-w-[220px] py-2.5 pr-3">
                    <div className="truncate text-[13px] font-semibold text-slate-800">{key.name}</div>
                    <div className="truncate text-[12px] text-slate-500">
                      {key.createdBy?.name ? `${key.createdBy.name} · ` : ''}
                      {formatDate(key.createdAt)}
                    </div>
                  </td>
                  <td className="py-2.5 pr-3">
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] text-slate-700">
                      {key.keyPrefix}…
                    </code>
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-medium text-indigo-700"
                        >
                          {SCOPE_SHORT.get(scope) ?? scope}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 text-[12px] text-slate-600">
                    {key.expiresAt ? formatDate(key.expiresAt) : 'Không hết hạn'}
                  </td>
                  <td className="py-2.5 pr-3 text-[12px] text-slate-600">
                    {key.lastUsedAt ? (
                      formatDateTime(key.lastUsedAt)
                    ) : (
                      <span className="text-slate-400">Chưa dùng</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-3">
                    <StatusBadge status={key.status} />
                  </td>
                  <td className="py-2.5 text-right">
                    {key.status !== 'revoked' && (
                      <button
                        type="button"
                        onClick={() => setRevoking(key)}
                        className="rounded-lg px-2 py-1 text-[12px] font-medium text-red-600 transition hover:bg-red-50"
                      >
                        Thu hồi
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <IntegrationGuide />

      {creating && <CreateApiKeyModal onClose={() => setCreating(false)} onCreated={onCreated} />}
      {issued && <IssuedKeyModal created={issued} onClose={() => setIssued(null)} />}
      <ConfirmDialog
        open={!!revoking}
        title="Thu hồi API key?"
        description={
          revoking && (
            <>
              Hệ thống đang dùng key <strong>{revoking.name}</strong> sẽ bị từ chối ngay (chậm nhất
              khoảng 30 giây). Không thể hoàn tác.
            </>
          )
        }
        confirmLabel="Thu hồi"
        pending={revokeMutation.isPending}
        onConfirm={() => revoking && revokeMutation.mutate(revoking.id)}
        onCancel={() => setRevoking(null)}
      />
    </div>
  )
}
