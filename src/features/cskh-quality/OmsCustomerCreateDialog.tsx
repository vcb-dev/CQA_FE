import { useId, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Combobox } from '@/components/custom-ui/combobox'
import { cn } from '@/lib/utils'
import {
  createOmsCustomer,
  findOmsCustomerDuplicates,
  type OmsCustomerDuplicate,
  type OmsCustomerInput,
  type OmsCustomerSummary,
  type VnRegionScheme,
} from './api'
import { emptyOmsAddress, OmsAddressFields, type OmsAddressDraft } from './OmsAddressFields'
import { isValidVnPhone, OmsField, omsInputClass } from './OmsFormParts'

const MATCH_LABELS: Record<string, string> = {
  phone: 'SĐT',
  name: 'họ tên',
  address: 'địa chỉ',
}

type ApiError = Error & { response?: { data?: { message?: string } } }

export function OmsCustomerCreateDialog({
  onClose,
  onPicked,
  defaultName,
  defaultPhone,
}: {
  onClose: () => void
  onPicked: (customer: OmsCustomerSummary) => void
  defaultName?: string
  defaultPhone?: string
}) {
  const uid = useId()
  const [name, setName] = useState(defaultName ?? '')
  const [phone, setPhone] = useState(defaultPhone ?? '')
  const [scheme, setScheme] = useState<VnRegionScheme>('old')
  const [address, setAddress] = useState<OmsAddressDraft>(emptyOmsAddress)
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({})
  const [duplicates, setDuplicates] = useState<OmsCustomerDuplicate[] | null>(null)

  const input = (): OmsCustomerInput => ({
    name: name.trim(),
    phone: phone.trim(),
    address: {
      address1: address.address1.trim() || null,
      ward: address.ward || null,
      district: scheme === 'old' ? address.district || null : null,
      province: address.province || null,
    },
  })

  const createMutation = useMutation({
    mutationFn: createOmsCustomer,
    onSuccess: (profile) => {
      toast.success(`Đã tạo khách hàng ${profile.name} trên OMS`)
      onPicked(profile)
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || err.message || 'Không tạo được khách hàng')
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: findOmsCustomerDuplicates,
    onSuccess: (rows, payload) => {
      if (rows.length) {
        setDuplicates(rows)
        return
      }
      createMutation.mutate(payload)
    },
    onError: (err: ApiError) => {
      toast.error(err.response?.data?.message || err.message || 'Không kiểm tra được khách trùng')
    },
  })

  const busy = createMutation.isPending || duplicateMutation.isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: typeof errors = {}
    if (!name.trim()) nextErrors.name = 'Nhập họ tên khách hàng'
    if (!phone.trim()) nextErrors.phone = 'Nhập số điện thoại'
    else if (!isValidVnPhone(phone)) nextErrors.phone = 'Số điện thoại không hợp lệ'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    if (duplicates) {
      createMutation.mutate(input())
      return
    }
    duplicateMutation.mutate(input())
  }

  const resetDuplicates = () => {
    if (duplicates) setDuplicates(null)
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Đóng"
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        onSubmit={handleSubmit}
        className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between px-6 pb-2 pt-5">
          <h2 id={`${uid}-title`} className="text-[17px] font-semibold text-slate-900">
            Thêm khách hàng mới
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="space-y-3 overflow-y-auto px-6 py-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <OmsField label="Họ tên" htmlFor={`${uid}-name`} required error={errors.name}>
              <input
                id={`${uid}-name`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  resetDuplicates()
                }}
                placeholder="VD: Nguyễn Thị Hà"
                className={cn(omsInputClass, errors.name && 'border-rose-400')}
              />
            </OmsField>
            <OmsField label="Số điện thoại" htmlFor={`${uid}-phone`} required error={errors.phone}>
              <input
                id={`${uid}-phone`}
                inputMode="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  resetDuplicates()
                }}
                placeholder="VD: 0912345678"
                className={cn(omsInputClass, errors.phone && 'border-rose-400')}
              />
            </OmsField>
          </div>

          <OmsField label="Quốc gia" htmlFor={`${uid}-country`}>
            <Combobox
              id={`${uid}-country`}
              value="VN"
              options={[{ value: 'VN', label: 'Việt Nam' }]}
              onChange={() => undefined}
              searchable={false}
            />
          </OmsField>

          <OmsAddressFields
            value={address}
            onChange={(next) => {
              setAddress(next)
              resetDuplicates()
            }}
            scheme={scheme}
            onSchemeChange={setScheme}
          />

          {duplicates ? (
            <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-800">
                <AlertTriangle className="h-3.5 w-3.5" />
                Có {duplicates.length} khách đã tồn tại có thể trùng
              </p>
              <ul className="space-y-1.5">
                {duplicates.map((d) => (
                  <li
                    key={d.id}
                    className="flex items-start gap-3 rounded-lg border border-amber-100 bg-white px-3 py-2"
                  >
                    <div className="min-w-0 flex-1 text-[12px]">
                      <p className="font-semibold text-slate-800">
                        {d.name}
                        {d.phone ? <span className="font-normal text-slate-500"> · {d.phone}</span> : null}
                      </p>
                      {d.address ? <p className="truncate text-slate-500">{d.address}</p> : null}
                      <p className="text-[11px] text-amber-700">
                        Trùng {d.matched.map((m) => MATCH_LABELS[m] ?? m).join(', ')} · {d.ordersCount} đơn
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onPicked(d)}
                      className="shrink-0 rounded-lg border border-indigo-200 px-2.5 py-1 text-[12px] font-medium text-indigo-700 hover:bg-indigo-50"
                    >
                      Chọn khách này
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-between gap-3 px-6 pb-5 pt-3">
          <p className="text-[12px] text-slate-500">
            Hệ thống tự kiểm tra trùng theo số điện thoại, họ tên và địa chỉ.
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-slate-200 px-4 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-[13px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {duplicates ? 'Vẫn tạo khách mới' : 'Tạo khách hàng'}
            </button>
          </div>
        </footer>
      </form>
    </div>
  )
}
