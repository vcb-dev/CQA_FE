import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Loader2,
  Megaphone,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Combobox, type ComboboxOption } from '@/components/custom-ui/combobox'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import type {
  CskhCustomerIntent,
  CskhInboxConversation,
  OmsCatalogItem,
  OmsCustomerProfile,
  OmsCustomerSummary,
  VnRegionScheme,
} from './api'
import {
  createOmsOrder,
  fetchInboxMessages,
  fetchOmsCatalog,
  fetchOmsCustomer,
  fetchOmsLocations,
  fetchOmsOrderAttribution,
  fetchOmsOrderSources,
  fetchOmsOrderSuggest,
  searchOmsCustomers,
} from './api'
import {
  detectRegionScheme,
  emptyOmsAddress,
  OmsAddressFields,
  OmsSchemeToggle,
  type OmsAddressDraft,
} from './OmsAddressFields'
import { OmsCustomerCreateDialog } from './OmsCustomerCreateDialog'
import {
  formatMoney,
  isValidVnPhone,
  OmsField,
  OmsInlineField,
  OmsMoneyInput,
  OmsSection,
  omsInputClass,
} from './OmsFormParts'

type LineItemDraft = {
  variantId: string
  name: string
  variantTitle: string
  sku: string | null
  imageUrl: string | null
  basePrice: number
  price: number
  quantity: number
  note: string
  noteOpen: boolean
  stockByLocation: Record<string, number>
  matchReason?: string
}

type ShippingDraft = OmsAddressDraft & { name: string; phone: string }

type AdOption = { adId: string; adTitle: string | null }

type ApiError = Error & { response?: { data?: { message?: string } } }

type OmsCreateOrderDialogProps = {
  open: boolean
  onClose: () => void
  conversation: CskhInboxConversation
  intent?: CskhCustomerIntent | null
}

const emptyShipping: ShippingDraft = { ...emptyOmsAddress, name: '', phone: '' }

const LOCATION_STORAGE_KEY = 'cskh.oms.lastLocationId'

function readStoredLocation(): string | null {
  try {
    return window.localStorage.getItem(LOCATION_STORAGE_KEY)
  } catch {
    return null
  }
}

function storeLocation(id: string) {
  try {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, id)
  } catch {
    return
  }
}

function defaultSource(platform?: string): string {
  const p = (platform || '').toLowerCase()
  if (p.includes('instagram')) return 'instagram'
  if (p.includes('tiktok')) return 'tiktokshop'
  if (p.includes('zalo')) return 'zalo'
  return 'facebook'
}

function toLineItem(p: OmsCatalogItem): LineItemDraft {
  return {
    variantId: p.variantId,
    name: p.name,
    variantTitle: p.variantTitle,
    sku: p.sku,
    imageUrl: p.imageUrl,
    basePrice: p.price,
    price: p.price,
    quantity: 1,
    note: '',
    noteOpen: false,
    stockByLocation: p.stockByLocation ?? {},
    matchReason: p.matchReason,
  }
}

function shippingFromProfile(profile: OmsCustomerProfile): ShippingDraft {
  const s = profile.shipping
  return {
    name: s.name ?? '',
    phone: s.phone ?? '',
    address1: s.address1 ?? '',
    ward: s.ward ?? '',
    district: s.district ?? '',
    province: s.province ?? '',
  }
}

function errorMessage(err: unknown, fallback: string): string {
  const e = err as ApiError
  return e?.response?.data?.message || e?.message || fallback
}

function Thumb({ src }: { src: string | null }) {
  return src ? (
    <img src={src} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-md bg-slate-100 object-cover" />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400">
      <Package className="h-4 w-4" />
    </span>
  )
}

export function OmsCreateOrderDialog({ open, onClose, conversation, intent }: OmsCreateOrderDialogProps) {
  const queryClient = useQueryClient()

  const [sourceName, setSourceName] = useState('')
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [customerLabel, setCustomerLabel] = useState('')
  const [customerQuery, setCustomerQuery] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false)
  const [shipping, setShipping] = useState<ShippingDraft>(emptyShipping)
  const [shippingScheme, setShippingScheme] = useState<VnRegionScheme>('old')
  const [receiverOpen, setReceiverOpen] = useState(false)
  const [note, setNote] = useState('')
  const [locationId, setLocationId] = useState('')
  const [editorUserId, setEditorUserId] = useState('')
  const [productSearch, setProductSearch] = useState('')
  const [productPickerOpen, setProductPickerOpen] = useState(false)
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([])
  const [shippingFee, setShippingFee] = useState(0)
  const [received, setReceived] = useState(0)
  const [suggestNote, setSuggestNote] = useState<string | null>(null)
  const [selectedAdId, setSelectedAdId] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const sessionRef = useRef(0)
  const appliedSuggest = useRef(false)
  const appliedProfileId = useRef<string | null>(null)
  const autoCustomerTried = useRef(false)
  const autoEditorTried = useRef(false)
  const productSearchRef = useRef<HTMLDivElement>(null)

  const debouncedProduct = useDebounce(productSearch.trim(), 350)
  const debouncedCustomer = useDebounce(customerQuery.trim(), 300)

  const fromAd = Boolean(
    conversation.fromAd || conversation.referralSource === 'HEURISTIC' || conversation.adId,
  )

  const mentions = useMemo(() => {
    return [
      ...new Set(
        (intent?.productMentions ?? [])
          .map((s) => s.trim())
          .filter((s) => s.length >= 4 && s.length <= 48 && !/HK\d{4,}/i.test(s) && !/chế tác/i.test(s)),
      ),
    ]
  }, [intent])

  useEffect(() => {
    if (!open) return
    sessionRef.current += 1
    appliedSuggest.current = false
    appliedProfileId.current = null
    autoCustomerTried.current = false
    autoEditorTried.current = false
    setSourceName(defaultSource(conversation.platform))
    setCustomerId(null)
    setCustomerLabel('')
    setCustomerQuery('')
    setCustomerName(conversation.customerName?.trim() || '')
    setCustomerPhone('')
    setCreateCustomerOpen(false)
    setShipping(emptyShipping)
    setShippingScheme('old')
    setReceiverOpen(false)
    setNote('')
    setLocationId('')
    setEditorUserId('')
    setProductSearch('')
    setProductPickerOpen(false)
    setLineItems([])
    setShippingFee(0)
    setReceived(0)
    setSuggestNote(null)
    setErrors({})
    setSelectedAdId(conversation.adId?.trim() || '')
  }, [open, conversation.id, conversation.adId, conversation.platform, conversation.customerName])

  const sourcesQ = useQuery({
    queryKey: ['cskh', 'oms', 'order-sources'],
    queryFn: fetchOmsOrderSources,
    enabled: open,
    staleTime: 10 * 60_000,
  })

  const locationsQ = useQuery({
    queryKey: ['cskh', 'oms', 'locations'],
    queryFn: fetchOmsLocations,
    enabled: open,
    staleTime: 10 * 60_000,
  })
  const locations = useMemo(() => locationsQ.data ?? [], [locationsQ.data])

  useEffect(() => {
    if (!open || locationId || !locations.length) return
    const stored = readStoredLocation()
    const pick =
      locations.find((l) => l.id === stored) ?? locations.find((l) => l.isDefault) ?? locations[0]
    setLocationId(pick.id)
  }, [open, locationId, locations])

  const closerLabelId = conversation.labels?.find((l) => l.type === 'staff')?.id ?? ''
  const attributionQ = useQuery({
    queryKey: ['cskh', 'oms', 'attribution', conversation.id, closerLabelId],
    queryFn: () => fetchOmsOrderAttribution(conversation.id),
    enabled: open,
    staleTime: 30_000,
  })
  const attribution = attributionQ.data ?? null
  const editors = useMemo(() => attributionQ.data?.editors ?? [], [attributionQ.data])

  useEffect(() => {
    if (!open || autoEditorTried.current || !attributionQ.data) return
    autoEditorTried.current = true
    const list = attributionQ.data.editors
    if (list.length === 1) setEditorUserId(list[0].id)
  }, [open, attributionQ.data])

  const adsInThreadQ = useQuery({
    queryKey: ['cskh', 'oms', 'ads-in-thread', conversation.id],
    queryFn: async (): Promise<AdOption[]> => {
      const { messages } = await fetchInboxMessages(conversation.id, { limit: 80 })
      const map = new Map<string, AdOption>()
      if (conversation.adId?.trim()) {
        map.set(conversation.adId.trim(), {
          adId: conversation.adId.trim(),
          adTitle: conversation.adTitle ?? null,
        })
      }
      for (const m of messages) {
        if (m.messageType !== 'ad_referral') continue
        const adId = (m.translatedText || '').replace(/^ID\s+/i, '').trim()
        if (!adId) continue
        if (!map.has(adId)) {
          map.set(adId, { adId, adTitle: m.text?.trim() || null })
        }
      }
      return [...map.values()]
    },
    enabled: open && fromAd,
    staleTime: 30_000,
  })
  const adOptions = useMemo(() => adsInThreadQ.data ?? [], [adsInThreadQ.data])

  useEffect(() => {
    if (!open || !fromAd || selectedAdId) return
    const first = conversation.adId?.trim() || adOptions[0]?.adId || ''
    if (first) setSelectedAdId(first)
  }, [open, fromAd, selectedAdId, conversation.adId, adOptions])

  const suggestQ = useQuery({
    queryKey: ['cskh', 'oms', 'suggest', conversation.id, mentions.join('|')],
    queryFn: () => fetchOmsOrderSuggest(conversation.id, mentions),
    enabled: open,
    staleTime: 15_000,
  })

  useEffect(() => {
    const data = suggestQ.data
    if (!open || !data || appliedSuggest.current) return
    appliedSuggest.current = true
    if (data.items.length) {
      setLineItems((prev) => [
        ...prev,
        ...data.items.filter((p) => !prev.some((l) => l.variantId === p.variantId)).map(toLineItem),
      ])
    }
    setSuggestNote(data.note)
  }, [open, suggestQ.data])

  const suggestedPhone = suggestQ.data?.phone ?? null

  useEffect(() => {
    if (!open || !suggestedPhone || autoCustomerTried.current) return
    autoCustomerTried.current = true
    setCustomerPhone((prev) => prev || suggestedPhone)
    const session = sessionRef.current
    searchOmsCustomers(suggestedPhone)
      .then((rows) => {
        if (session !== sessionRef.current || rows.length !== 1) return
        setCustomerId((prev) => prev ?? rows[0].id)
      })
      .catch(() => undefined)
  }, [open, suggestedPhone])

  const customerSearchQ = useQuery({
    queryKey: ['cskh', 'oms', 'customers', debouncedCustomer],
    queryFn: () => searchOmsCustomers(debouncedCustomer),
    enabled: open && debouncedCustomer.length >= 2,
    staleTime: 30_000,
  })

  const customerOptions = useMemo<ComboboxOption[]>(
    () =>
      (customerSearchQ.data ?? []).map((c) => ({
        value: c.id,
        label: c.name,
        description: [c.phone, `${c.ordersCount} đơn`].filter(Boolean).join(' · '),
      })),
    [customerSearchQ.data],
  )

  const profileQ = useQuery({
    queryKey: ['cskh', 'oms', 'customer', customerId],
    queryFn: () => fetchOmsCustomer(customerId!),
    enabled: open && Boolean(customerId),
    staleTime: 30_000,
  })
  const profile = profileQ.data && profileQ.data.id === customerId ? profileQ.data : null

  useEffect(() => {
    if (!profile || appliedProfileId.current === profile.id) return
    appliedProfileId.current = profile.id
    const next = shippingFromProfile(profile)
    setShipping(next)
    setShippingScheme(detectRegionScheme(next))
    setReceiverOpen(
      Boolean(
        (next.name && next.name !== profile.name) ||
          (next.phone && profile.phone && next.phone !== profile.phone),
      ),
    )
    setCustomerLabel(profile.name)
    setCustomerName(profile.name)
    if (profile.phone) setCustomerPhone(profile.phone)
  }, [profile])

  const catalogQ = useQuery({
    queryKey: ['cskh', 'oms', 'catalog', debouncedProduct],
    queryFn: () => fetchOmsCatalog(debouncedProduct),
    enabled: open && productPickerOpen,
    staleTime: 30_000,
  })

  const createMutation = useMutation({
    mutationFn: createOmsOrder,
    onSuccess: (result) => {
      const base = result.orderName
        ? `Đã tạo đơn ${result.orderName} trên OMS`
        : `Đã tạo đơn #${result.orderId} trên OMS`
      if (result.metaPurchase?.attempted && result.metaPurchase.ok) {
        toast.success(`${base}. Đã báo lượt mua lên Meta (bên thứ ba / CAPI).`)
      } else if (result.metaPurchase?.attempted && !result.metaPurchase.ok) {
        toast.success(base)
        toast.warning(
          `Đơn đã tạo nhưng Meta chưa nhận Purchase: ${result.metaPurchase.reason || 'lỗi CAPI'}. Kiểm tra page_events / dataset.`,
        )
      } else {
        toast.success(base)
      }
      onClose()
    },
    onError: (err) => {
      toast.error(errorMessage(err, 'Không tạo được đơn trên OMS'))
    },
  })

  const subtotal = lineItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalQuantity = lineItems.reduce((s, i) => s + i.quantity, 0)
  const total = Math.max(0, subtotal + shippingFee)
  const remaining = Math.max(0, total - received)

  if (!open) return null

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })

  const selectCustomer = (c: OmsCustomerSummary) => {
    setCustomerId(c.id)
    setCustomerLabel(c.name)
    setCustomerName(c.name)
    if (c.phone) setCustomerPhone(c.phone)
    clearError('customerName')
    clearError('customerPhone')
  }

  const changeCustomerPhone = (value: string) => {
    setCustomerPhone(value)
    clearError('customerPhone')
    if (customerId) {
      setCustomerId(null)
      setCustomerLabel('')
      appliedProfileId.current = null
    }
  }

  const updateLine = (variantId: string, patch: Partial<LineItemDraft>) =>
    setLineItems((prev) => prev.map((i) => (i.variantId === variantId ? { ...i, ...patch } : i)))

  const addCatalogItem = (p: OmsCatalogItem) => {
    if (!p.sku) return
    setLineItems((prev) => {
      const existing = prev.find((i) => i.variantId === p.variantId)
      if (existing) {
        return prev.map((i) => (i.variantId === p.variantId ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, toLineItem(p)]
    })
    clearError('items')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    const missingSku = lineItems.filter((i) => !i.sku).length
    if (!lineItems.length) next.items = 'Chọn ít nhất một sản phẩm'
    else if (missingSku) next.items = `${missingSku} sản phẩm chưa có SKU — OMS cần SKU để tạo đơn`
    if (!customerName.trim()) next.customerName = 'Nhập tên khách hàng'
    if (!customerPhone.trim()) next.customerPhone = 'Nhập số điện thoại khách'
    else if (!isValidVnPhone(customerPhone)) next.customerPhone = 'Số điện thoại không hợp lệ'
    if (!locationId) next.location = 'Chọn kho xuất'
    if (receiverOpen && shipping.phone.trim() && !isValidVnPhone(shipping.phone)) {
      next.shippingPhone = 'Số điện thoại không hợp lệ'
    }
    if (editors.length > 0 && !editorUserId) next.editor = 'Chọn editor của page'
    if (received > total) next.received = 'Số tiền trả trước lớn hơn số khách phải trả'
    if (fromAd && adOptions.length > 0 && !selectedAdId.trim()) {
      next.ad = 'Chọn quảng cáo để gắn lượt mua Meta'
    }
    setErrors(next)
    const first = Object.values(next)[0]
    if (first) {
      toast.error(first)
      return
    }

    const canReportMeta = fromAd && Boolean(selectedAdId.trim())
    storeLocation(locationId)
    createMutation.mutate({
      locationId,
      sourceName: sourceName || undefined,
      customer: { name: customerName.trim(), phone: customerPhone.trim() },
      editorUserId: editorUserId || undefined,
      note: note.trim() || undefined,
      shippingAddress: {
        name: (receiverOpen && shipping.name.trim()) || customerName.trim(),
        phone: (receiverOpen && shipping.phone.trim()) || customerPhone.trim(),
        address1: shipping.address1.trim() || null,
        ward: shipping.ward.trim() || null,
        district: shippingScheme === 'old' ? shipping.district.trim() || null : null,
        province: shipping.province.trim() || null,
      },
      totalShippingPrice: shippingFee || undefined,
      totalReceived: received || undefined,
      conversationId: conversation.id,
      platform: conversation.platform,
      adId: canReportMeta ? selectedAdId.trim() : undefined,
      reportMetaPurchase: canReportMeta,
      lineItems: lineItems.map((item) => ({
        sku: item.sku ?? '',
        quantity: item.quantity,
        price: item.price,
        note: item.note.trim() || undefined,
      })),
    })
  }

  const toggleReceiver = () => {
    if (receiverOpen) {
      setShipping((s) => ({ ...s, name: '', phone: '' }))
      clearError('shippingPhone')
    }
    setReceiverOpen((v) => !v)
  }

  const changeScheme = (next: VnRegionScheme) => {
    setShippingScheme(next)
    setShipping((s) => ({ ...s, province: '', district: '', ward: '' }))
  }

  const locationName = locations.find((l) => l.id === locationId)?.name
  const catalogItems = catalogQ.data?.items ?? []
  const channelName = attribution?.channel.name || conversation.pageName || ''

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Đóng"
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="oms-create-order-title"
        onSubmit={handleSubmit}
        className="relative z-10 flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <h2 id="oms-create-order-title" className="text-[15px] font-semibold text-slate-900">
                Tạo đơn hàng
              </h2>
              <p className="text-[11px] text-slate-500">
                {['Tạo trên OMS Viễn Chí Bảo', channelName ? `Kênh ${channelName}` : null, conversation.customerName ? `Hội thoại với ${conversation.customerName}` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="grid flex-1 items-start gap-3 overflow-y-auto p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-3">
            <OmsSection
              title="Sản phẩm"
              required
              action={
                suggestQ.isFetching && !lineItems.length ? (
                  <span className="flex items-center gap-1.5 text-[12px] text-emerald-700">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Đang quét hội thoại...
                  </span>
                ) : suggestNote ? (
                  <span className="truncate text-[12px] text-emerald-700" title={suggestNote}>
                    {suggestNote}
                  </span>
                ) : null
              }
            >
              <Popover open={productPickerOpen} onOpenChange={setProductPickerOpen}>
                <PopoverAnchor asChild>
                  <div ref={productSearchRef} className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value)
                        setProductPickerOpen(true)
                      }}
                      onFocus={() => setProductPickerOpen(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setProductPickerOpen(false)
                        if (e.key === 'Enter') e.preventDefault()
                      }}
                      placeholder="Tìm sản phẩm theo tên hoặc SKU..."
                      className={cn(omsInputClass, 'pl-9', errors.items && 'border-rose-400')}
                    />
                  </div>
                </PopoverAnchor>
                <PopoverContent
                  align="start"
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  onInteractOutside={(e) => {
                    if (productSearchRef.current?.contains(e.target as Node)) e.preventDefault()
                  }}
                >
                  <div className="max-h-80 overflow-y-auto p-1">
                    {catalogQ.isLoading ? (
                      <p className="flex items-center justify-center gap-2 px-3 py-6 text-[12px] text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải sản phẩm từ OMS...
                      </p>
                    ) : catalogQ.isError ? (
                      <p className="px-3 py-6 text-center text-[12px] text-rose-600">
                        {errorMessage(catalogQ.error, 'Không tải được sản phẩm từ OMS.')}
                      </p>
                    ) : catalogItems.length === 0 ? (
                      <p className="px-3 py-6 text-center text-[12px] text-slate-400">
                        {debouncedProduct ? 'Không tìm thấy sản phẩm.' : 'Nhập tên hoặc SKU để tìm.'}
                      </p>
                    ) : (
                      catalogItems.map((p) => {
                        const stockHere = p.stockByLocation?.[locationId] ?? 0
                        const added = lineItems.some((l) => l.variantId === p.variantId)
                        return (
                          <button
                            key={p.variantId}
                            type="button"
                            disabled={!p.sku}
                            title={p.sku ? undefined : 'Biến thể chưa có SKU — OMS không nhận'}
                            onClick={() => addCatalogItem(p)}
                            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                          >
                            <Thumb src={p.imageUrl} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[13px] font-medium text-slate-800">{p.name}</span>
                              <span className="block truncate text-[11px] text-slate-500">
                                {[p.variantTitle, p.sku ? `SKU ${p.sku}` : null].filter(Boolean).join(' · ')}
                              </span>
                            </span>
                            <span className="shrink-0 text-right">
                              <span className="block text-[13px] font-semibold tabular-nums text-slate-800">
                                {p.priceLabel}
                              </span>
                              <span
                                className={cn(
                                  'block text-[11px] tabular-nums',
                                  stockHere > 0 ? 'text-slate-500' : 'text-rose-500',
                                )}
                              >
                                {locationId ? `Kho xuất: ${stockHere}` : `Tồn: ${p.inventoryQuantity}`}
                              </span>
                            </span>
                            {!p.sku ? (
                              <span className="shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-600">
                                Thiếu SKU
                              </span>
                            ) : added ? (
                              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                Đã thêm
                              </span>
                            ) : (
                              <Plus className="h-4 w-4 shrink-0 text-indigo-500" />
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {errors.items ? <p className="text-[12px] text-rose-600">{errors.items}</p> : null}

              {lineItems.length === 0 ? (
                <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-slate-200 py-6 text-center">
                  <Package className="h-6 w-6 text-slate-300" />
                  <p className="text-[13px] text-slate-500">Chưa có sản phẩm nào trong đơn</p>
                  <p className="text-[12px] text-slate-400">Tìm theo tên hoặc SKU ở ô phía trên để thêm.</p>
                </div>
              ) : (
                <div>
                  <div className="hidden items-center gap-3 border-b border-slate-100 pb-2 text-[11px] font-medium text-slate-500 sm:flex">
                    <span className="flex-1">Sản phẩm</span>
                    <span className="flex gap-2">
                      <span className="w-16 text-center">SL</span>
                      <span className="w-28 text-right">Đơn giá</span>
                      <span className="w-28 text-right">Thành tiền</span>
                      <span className="w-8" />
                    </span>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {lineItems.map((item) => {
                      const stock = item.stockByLocation[locationId] ?? 0
                      const short = locationId ? item.quantity - stock : 0
                      return (
                        <li key={item.variantId} className="flex flex-wrap items-start gap-3 py-3">
                          <div className="flex min-w-0 flex-1 basis-60 gap-3">
                            <Thumb src={item.imageUrl} />
                            <div className="min-w-0 space-y-0.5">
                              <p className="text-[13px] font-medium leading-snug text-slate-800">{item.name}</p>
                              <p className="text-[11px] text-slate-500">
                                {[
                                  item.variantTitle,
                                  item.sku ? `SKU ${item.sku}` : null,
                                  locationId && short <= 0 ? `Tồn kho xuất ${stock}` : null,
                                ]
                                  .filter(Boolean)
                                  .join(' · ')}
                              </p>
                              {!item.sku ? (
                                <p className="flex items-center gap-1 text-[11px] text-rose-600">
                                  <AlertTriangle className="h-3 w-3" />
                                  Chưa có SKU — OMS không nhận dòng này, hãy xoá hoặc chọn biến thể khác
                                </p>
                              ) : null}
                              {locationId && short > 0 ? (
                                <p className="flex items-center gap-1 text-[11px] text-amber-700">
                                  <AlertTriangle className="h-3 w-3" />
                                  Kho xuất còn {stock} — thiếu {short}, đơn sẽ chờ hàng
                                </p>
                              ) : null}
                              {item.noteOpen ? (
                                <input
                                  value={item.note}
                                  onChange={(e) => updateLine(item.variantId, { note: e.target.value })}
                                  placeholder="Ghi chú dòng hàng: khắc tên, nới size..."
                                  className={cn(omsInputClass, 'mt-1 h-8 text-[12px]')}
                                />
                              ) : null}
                              {item.matchReason || !item.noteOpen ? (
                                <p className="flex flex-wrap items-center gap-x-3 text-[11px]">
                                  {!item.noteOpen ? (
                                    <button
                                      type="button"
                                      onClick={() => updateLine(item.variantId, { noteOpen: true })}
                                      className="font-medium text-indigo-600 hover:text-indigo-700"
                                    >
                                      + Ghi chú dòng hàng
                                    </button>
                                  ) : null}
                                  {item.matchReason ? <span className="text-amber-700">{item.matchReason}</span> : null}
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <input
                              type="number"
                              min={1}
                              aria-label="Số lượng"
                              value={item.quantity}
                              onChange={(e) =>
                                updateLine(item.variantId, {
                                  quantity: Math.max(1, Math.floor(Number(e.target.value) || 1)),
                                })
                              }
                              className={cn(omsInputClass, 'w-16 px-2 text-center tabular-nums')}
                            />
                            <div className="w-28">
                              <OmsMoneyInput
                                value={item.price}
                                onChange={(price) => updateLine(item.variantId, { price })}
                              />
                              {item.price !== item.basePrice ? (
                                <button
                                  type="button"
                                  onClick={() => updateLine(item.variantId, { price: item.basePrice })}
                                  className="mt-0.5 block w-full text-right text-[10px] text-slate-400 line-through hover:text-indigo-600"
                                  title="Khôi phục giá gốc"
                                >
                                  {formatMoney(item.basePrice)}
                                </button>
                              ) : null}
                            </div>
                            <p className="w-28 pt-2 text-right text-[13px] font-semibold tabular-nums text-slate-800">
                              {formatMoney(item.price * item.quantity)}
                            </p>
                            <button
                              type="button"
                              aria-label="Xóa sản phẩm"
                              onClick={() =>
                                setLineItems((prev) => prev.filter((i) => i.variantId !== item.variantId))
                              }
                              className="flex h-9 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </OmsSection>

            <OmsSection
              title="Khách hàng"
              required
              action={
                <div className="flex min-w-0 items-center gap-3">
                  {customerId && profileQ.isLoading ? (
                    <span className="flex items-center gap-1.5 text-[12px] text-slate-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Đang tải hồ sơ...
                    </span>
                  ) : customerId && profileQ.isError ? (
                    <span className="truncate text-[12px] text-rose-600">
                      {errorMessage(profileQ.error, 'Không tải được hồ sơ khách')}
                    </span>
                  ) : profile ? (
                    <span className="truncate text-[12px] text-slate-500">
                      Khách cũ · {profile.ordersCount} đơn · đã chi {formatMoney(profile.totalSpent)}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setCreateCustomerOpen(true)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-[13px] font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm mới
                  </button>
                </div>
              }
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <OmsField label="Tìm khách cũ" htmlFor="oms-order-customer">
                  <Combobox
                    id="oms-order-customer"
                    value={customerId}
                    selectedLabel={customerLabel}
                    options={customerOptions}
                    loading={customerSearchQ.isFetching}
                    onSearchChange={setCustomerQuery}
                    onChange={(id, option) =>
                      selectCustomer(
                        customerSearchQ.data?.find((c) => c.id === id) ?? {
                          id,
                          name: option.label,
                          phone: null,
                          ordersCount: 0,
                        },
                      )
                    }
                    placeholder="Tên hoặc SĐT..."
                    searchPlaceholder="Nhập tên hoặc số điện thoại..."
                    emptyText={
                      customerQuery.trim().length < 2 ? 'Nhập ít nhất 2 ký tự để tìm' : 'Không tìm thấy khách hàng'
                    }
                  />
                </OmsField>
                <OmsField label="Tên khách" htmlFor="oms-customer-name" required error={errors.customerName}>
                  <input
                    id="oms-customer-name"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value)
                      clearError('customerName')
                    }}
                    className={cn(omsInputClass, errors.customerName && 'border-rose-400')}
                  />
                </OmsField>
                <OmsField label="Số điện thoại" htmlFor="oms-customer-phone" required error={errors.customerPhone}>
                  <input
                    id="oms-customer-phone"
                    inputMode="tel"
                    value={customerPhone}
                    onChange={(e) => changeCustomerPhone(e.target.value)}
                    className={cn(omsInputClass, errors.customerPhone && 'border-rose-400')}
                  />
                </OmsField>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12px] font-semibold text-slate-700">Địa chỉ giao hàng</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={toggleReceiver}
                      className="text-[12px] font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      {receiverOpen ? 'Giao cho chính khách' : '+ Người nhận khác'}
                    </button>
                    <OmsSchemeToggle scheme={shippingScheme} onChange={changeScheme} />
                  </div>
                </div>
                {receiverOpen ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <OmsField label="Người nhận" htmlFor="oms-ship-name">
                      <input
                        id="oms-ship-name"
                        value={shipping.name}
                        onChange={(e) => setShipping((s) => ({ ...s, name: e.target.value }))}
                        placeholder={customerName || 'Mặc định là tên khách'}
                        className={omsInputClass}
                      />
                    </OmsField>
                    <OmsField label="SĐT nhận hàng" htmlFor="oms-ship-phone" error={errors.shippingPhone}>
                      <input
                        id="oms-ship-phone"
                        inputMode="tel"
                        value={shipping.phone}
                        onChange={(e) => {
                          setShipping((s) => ({ ...s, phone: e.target.value }))
                          clearError('shippingPhone')
                        }}
                        placeholder={customerPhone || 'Mặc định là SĐT khách'}
                        className={cn(omsInputClass, errors.shippingPhone && 'border-rose-400')}
                      />
                    </OmsField>
                  </div>
                ) : null}
                <OmsAddressFields
                  value={shipping}
                  onChange={(addr) => setShipping((s) => ({ ...s, ...addr }))}
                  scheme={shippingScheme}
                  onSchemeChange={setShippingScheme}
                  columns={3}
                  showSchemeSwitch={false}
                />
              </div>
            </OmsSection>
          </div>

          <div className="min-w-0 space-y-3 lg:sticky lg:top-0">
            <OmsSection title="Thông tin đơn">
              <OmsInlineField label="Kho xuất" htmlFor="oms-order-location" required error={errors.location}>
                <Combobox
                  id="oms-order-location"
                  value={locationId}
                  selectedLabel={locationName}
                  options={locations.map((l) => ({
                    value: l.id,
                    label: l.name,
                    description: l.isDefault ? 'Kho mặc định' : undefined,
                  }))}
                  loading={locationsQ.isLoading}
                  onChange={(v) => {
                    setLocationId(v)
                    clearError('location')
                  }}
                  invalid={Boolean(errors.location)}
                  placeholder="Chọn kho xuất"
                  searchPlaceholder="Tìm kho..."
                />
              </OmsInlineField>
              <OmsInlineField label="Nguồn đơn" htmlFor="oms-order-source">
                <Combobox
                  id="oms-order-source"
                  value={sourceName}
                  selectedLabel={sourceName}
                  options={(sourcesQ.data ?? []).map((s) => ({ value: s.value, label: s.label }))}
                  loading={sourcesQ.isLoading}
                  onChange={setSourceName}
                  placeholder="Chọn nguồn đơn"
                  searchPlaceholder="Tìm nguồn đơn..."
                />
              </OmsInlineField>
              {fromAd ? (
                <OmsInlineField
                  label="Quảng cáo"
                  htmlFor="oms-order-ad"
                  error={errors.ad}
                  hint={
                    adOptions.length ? (
                      <span className="inline-flex items-center gap-1">
                        <Megaphone className="h-3 w-3 shrink-0" />
                        Báo lượt mua lên Meta sau khi tạo đơn
                      </span>
                    ) : null
                  }
                >
                  {adsInThreadQ.isLoading ? (
                    <p className="flex h-9 items-center gap-1.5 text-[12px] text-slate-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Đang tải quảng cáo...
                    </p>
                  ) : adOptions.length === 0 ? (
                    <p className="py-2 text-[12px] leading-snug text-amber-800">
                      Hội thoại chưa có ad_id — không báo được lượt mua Meta.
                    </p>
                  ) : (
                    <Combobox
                      id="oms-order-ad"
                      value={selectedAdId}
                      options={adOptions.map((ad) => ({
                        value: ad.adId,
                        label: (ad.adTitle || 'Quảng cáo').slice(0, 80),
                        description: `ID ${ad.adId}`,
                      }))}
                      onChange={(v) => {
                        setSelectedAdId(v)
                        clearError('ad')
                      }}
                      invalid={Boolean(errors.ad)}
                      searchable={adOptions.length > 5}
                      placeholder="Chọn quảng cáo"
                    />
                  )}
                </OmsInlineField>
              ) : null}
              {attributionQ.isLoading ? (
                <OmsInlineField label="Nhân viên">
                  <p className="flex h-9 items-center gap-1.5 text-[12px] text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Đang tải sale, editor...
                  </p>
                </OmsInlineField>
              ) : attributionQ.isError ? (
                <OmsInlineField label="Nhân viên">
                  <p className="py-2 text-[12px] text-rose-600">
                    {errorMessage(attributionQ.error, 'Không tải được nhân viên của page')}
                  </p>
                </OmsInlineField>
              ) : (
                <>
                  <OmsInlineField
                    label="Sale"
                    hint={
                      attribution?.sale ? null : (
                        <span className="text-amber-800">
                          {attribution?.closer
                            ? `${attribution.closer.name} không phải sale của page — đơn không ghi nhận sale.`
                            : 'Gắn tag Nhân viên chốt cho hội thoại để ghi nhận sale.'}
                        </span>
                      )
                    }
                  >
                    {attribution?.sale ? (
                      <p className="flex h-9 min-w-0 items-center gap-2 text-[13px]" title={attribution.sale.email}>
                        <span className="truncate font-medium text-slate-800">{attribution.sale.name}</span>
                        <span className="shrink-0 rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700">
                          Nhân viên chốt
                        </span>
                      </p>
                    ) : (
                      <p className="flex h-9 items-center gap-1.5 text-[13px] font-medium text-amber-800">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        Chưa xác định
                      </p>
                    )}
                  </OmsInlineField>
                  <OmsInlineField
                    label="Editor"
                    htmlFor="oms-order-editor"
                    required={editors.length > 0}
                    error={errors.editor}
                  >
                    {editors.length ? (
                      <Combobox
                        id="oms-order-editor"
                        value={editorUserId}
                        options={editors.map((u) => ({ value: u.id, label: u.name, description: u.email }))}
                        onChange={(v) => {
                          setEditorUserId(v)
                          clearError('editor')
                        }}
                        invalid={Boolean(errors.editor)}
                        searchable={editors.length > 5}
                        placeholder="Chọn editor"
                        searchPlaceholder="Tìm editor..."
                      />
                    ) : (
                      <p className="flex h-9 items-center text-[12px] text-slate-500">Page chưa gán editor</p>
                    )}
                  </OmsInlineField>
                </>
              )}
              <OmsInlineField label="Ghi chú" htmlFor="oms-order-note" alignTop>
                <textarea
                  id="oms-order-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  placeholder="VD: Nhận hàng ghi công nợ"
                  className={cn(omsInputClass, 'h-auto resize-y py-2')}
                />
              </OmsInlineField>
            </OmsSection>

            <OmsSection title="Thanh toán">
              <dl className="space-y-2 text-[13px]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">Tiền hàng ({totalQuantity} sp)</dt>
                  <dd className="font-medium tabular-nums text-slate-800">{formatMoney(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">
                    <label htmlFor="oms-order-shipping-fee">Phí giao hàng</label>
                  </dt>
                  <dd className="w-32">
                    <OmsMoneyInput id="oms-order-shipping-fee" value={shippingFee} onChange={setShippingFee} />
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
                  <dt className="font-semibold text-slate-800">Khách phải trả</dt>
                  <dd className="text-[15px] font-bold tabular-nums text-slate-900">{formatMoney(total)}</dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="pt-2 text-slate-600">
                    <label htmlFor="oms-order-received">Khách trả trước</label>
                  </dt>
                  <dd className="w-32">
                    <OmsMoneyInput
                      id="oms-order-received"
                      value={received}
                      onChange={(v) => {
                        setReceived(v)
                        clearError('received')
                      }}
                      className={cn(errors.received && 'border-rose-400')}
                    />
                    {errors.received ? (
                      <p className="mt-1 text-right text-[11px] text-rose-600">{errors.received}</p>
                    ) : null}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-600">
                    Còn phải thu
                    <span className="block text-[11px] text-slate-500">Ghi công nợ cho khách</span>
                  </dt>
                  <dd className="font-semibold tabular-nums text-indigo-700">{formatMoney(remaining)}</dd>
                </div>
              </dl>
            </OmsSection>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3">
          <p className="text-[13px] text-slate-600">
            Khách phải trả <span className="font-bold tabular-nums text-slate-900">{formatMoney(total)}</span>
            {received > 0 ? (
              <span className="text-slate-500">
                {' '}
                · còn thu <span className="font-semibold tabular-nums text-indigo-700">{formatMoney(remaining)}</span>
              </span>
            ) : null}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-5 text-[13px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {createMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              {createMutation.isPending ? 'Đang tạo đơn...' : 'Tạo đơn'}
            </button>
          </div>
        </footer>
      </form>

      {createCustomerOpen ? (
        <OmsCustomerCreateDialog
          onClose={() => setCreateCustomerOpen(false)}
          defaultName={conversation.customerName?.trim() || ''}
          defaultPhone={suggestedPhone ?? ''}
          onPicked={(customer) => {
            if ('shipping' in customer) {
              queryClient.setQueryData(['cskh', 'oms', 'customer', customer.id], customer)
            }
            selectCustomer(customer)
            setCreateCustomerOpen(false)
          }}
        />
      ) : null}
    </div>
  )
}
