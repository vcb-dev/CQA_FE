import { useId, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Combobox, foldVietnamese } from '@/components/custom-ui/combobox'
import { cn } from '@/lib/utils'
import { fetchVnRegions, type VnRegion, type VnRegionScheme } from './api'
import { OmsField, OmsSwitch, omsInputClass } from './OmsFormParts'

export type OmsAddressDraft = {
  address1: string
  ward: string
  district: string
  province: string
}

export const emptyOmsAddress: OmsAddressDraft = { address1: '', ward: '', district: '', province: '' }

export function detectRegionScheme(address: Partial<OmsAddressDraft> | null | undefined): VnRegionScheme {
  if (address?.district?.trim()) return 'old'
  return address?.ward?.trim() ? 'new' : 'old'
}

const REGION_PREFIX = /^(thanh pho|tinh|tp\.?|quan|huyen|thi xa|phuong|xa|thi tran)\s+/

function regionKey(name: string): string {
  return foldVietnamese(name).replace(REGION_PREFIX, '').replace(/\s+/g, ' ').trim()
}

function findRegion(list: VnRegion[] | undefined, name: string): VnRegion | undefined {
  const target = name.trim()
  if (!list || !target) return undefined
  const exact = list.find((r) => r.name === target)
  if (exact) return exact
  const key = regionKey(target)
  return list.find((r) => regionKey(r.name) === key)
}

const toOptions = (list: VnRegion[] | undefined) =>
  (list ?? []).map((r) => ({ value: String(r.code), label: r.name }))

const SCHEME_OPTIONS: Array<{ value: VnRegionScheme; label: string; title: string }> = [
  {
    value: 'old',
    label: 'Cũ · 3 cấp',
    title: 'Tỉnh → Quận/Huyện → Phường/Xã, cho hãng vận chuyển chưa hỗ trợ địa chỉ mới',
  },
  { value: 'new', label: 'Mới · 2 cấp', title: 'Tỉnh/Thành phố → Phường/Xã' },
]

export function OmsSchemeToggle({
  scheme,
  onChange,
}: {
  scheme: VnRegionScheme
  onChange: (next: VnRegionScheme) => void
}) {
  return (
    <div role="radiogroup" aria-label="Chuẩn địa chỉ" className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      {SCHEME_OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={scheme === o.value}
          title={o.title}
          onClick={() => scheme !== o.value && onChange(o.value)}
          className={cn(
            'h-6 rounded-md px-2 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200',
            scheme === o.value ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function OmsAddressFields({
  value,
  onChange,
  scheme,
  onSchemeChange,
  columns = 2,
  showSchemeSwitch = true,
}: {
  value: OmsAddressDraft
  onChange: (next: OmsAddressDraft) => void
  scheme: VnRegionScheme
  onSchemeChange: (next: VnRegionScheme) => void
  columns?: 1 | 2 | 3
  showSchemeSwitch?: boolean
}) {
  const uid = useId()

  const provincesQ = useQuery({
    queryKey: ['cskh', 'oms', 'regions', scheme],
    queryFn: () => fetchVnRegions(scheme),
    staleTime: Infinity,
  })
  const province = useMemo(() => findRegion(provincesQ.data, value.province), [provincesQ.data, value.province])

  const districtsQ = useQuery({
    queryKey: ['cskh', 'oms', 'regions', 'old', 'p', province?.code],
    queryFn: () => fetchVnRegions('old', { provinceCode: province!.code }),
    enabled: scheme === 'old' && Boolean(province),
    staleTime: Infinity,
  })
  const district = useMemo(
    () => (scheme === 'old' ? findRegion(districtsQ.data, value.district) : undefined),
    [scheme, districtsQ.data, value.district],
  )

  const wardParent = scheme === 'new' ? province?.code : district?.code
  const wardsQ = useQuery({
    queryKey: ['cskh', 'oms', 'regions', scheme, scheme === 'new' ? 'p' : 'd', wardParent],
    queryFn: () =>
      scheme === 'new'
        ? fetchVnRegions('new', { provinceCode: wardParent })
        : fetchVnRegions('old', { districtCode: wardParent }),
    enabled: Boolean(wardParent),
    staleTime: Infinity,
  })
  const ward = useMemo(() => findRegion(wardsQ.data, value.ward), [wardsQ.data, value.ward])

  const wardDisabled = scheme === 'new' ? !province : !district

  return (
    <div className="space-y-3">
      {showSchemeSwitch ? (
        <OmsSwitch
          checked={scheme === 'new'}
          onChange={(checked) => {
            onSchemeChange(checked ? 'new' : 'old')
            onChange({ ...value, province: '', district: '', ward: '' })
          }}
          label="Địa chỉ mới"
          description={
            scheme === 'new'
              ? 'Chuẩn mới 2 cấp: Tỉnh/Thành phố → Phường/Xã'
              : 'Chuẩn cũ 3 cấp, phù hợp hãng vận chuyển chưa hỗ trợ địa chỉ mới'
          }
        />
      ) : null}
      <div
        className={cn(
          'grid gap-3',
          columns === 2 && 'sm:grid-cols-2',
          columns === 3 && (scheme === 'old' ? 'sm:grid-cols-3' : 'sm:grid-cols-2'),
        )}
      >
        <OmsField label="Tỉnh/Thành phố" htmlFor={`${uid}-province`}>
          <Combobox
            id={`${uid}-province`}
            value={province ? String(province.code) : null}
            selectedLabel={value.province}
            options={toOptions(provincesQ.data)}
            loading={provincesQ.isLoading}
            onChange={(_, option) =>
              onChange({ ...value, province: option.label, district: '', ward: '' })
            }
            placeholder="Chọn tỉnh/thành phố"
            searchPlaceholder="Tìm tỉnh/thành phố..."
            emptyText={provincesQ.isError ? 'Không tải được danh mục' : 'Không tìm thấy'}
          />
        </OmsField>
        {scheme === 'old' ? (
          <OmsField label="Quận/Huyện" htmlFor={`${uid}-district`}>
            <Combobox
              id={`${uid}-district`}
              value={district ? String(district.code) : null}
              selectedLabel={value.district}
              options={toOptions(districtsQ.data)}
              loading={districtsQ.isFetching}
              disabled={!province}
              onChange={(_, option) => onChange({ ...value, district: option.label, ward: '' })}
              placeholder={province ? 'Chọn quận/huyện' : 'Chọn tỉnh/thành trước'}
              searchPlaceholder="Tìm quận/huyện..."
              emptyText="Không tìm thấy"
            />
          </OmsField>
        ) : null}
        <OmsField label="Phường/Xã" htmlFor={`${uid}-ward`}>
          <Combobox
            id={`${uid}-ward`}
            value={ward ? String(ward.code) : null}
            selectedLabel={value.ward}
            options={toOptions(wardsQ.data)}
            loading={wardsQ.isFetching}
            disabled={wardDisabled}
            onChange={(_, option) => onChange({ ...value, ward: option.label })}
            placeholder={
              wardDisabled
                ? scheme === 'new'
                  ? 'Chọn tỉnh/thành trước'
                  : 'Chọn quận/huyện trước'
                : 'Chọn phường/xã'
            }
            searchPlaceholder="Tìm phường/xã..."
            emptyText="Không tìm thấy"
          />
        </OmsField>
        <OmsField
          label="Địa chỉ cụ thể"
          htmlFor={`${uid}-address1`}
          className={cn(
            columns === 3 && 'sm:col-span-full',
            scheme === 'new' && columns === 2 && 'sm:col-span-2',
          )}
        >
          <input
            id={`${uid}-address1`}
            value={value.address1}
            onChange={(e) => onChange({ ...value, address1: e.target.value })}
            placeholder="Số nhà, đường..."
            className={omsInputClass}
          />
        </OmsField>
      </div>
    </div>
  )
}
