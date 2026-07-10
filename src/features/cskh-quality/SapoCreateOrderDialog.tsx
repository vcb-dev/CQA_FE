import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Loader2, Plus, ShoppingCart, X } from 'lucide-react'
import { toast } from 'sonner'
import type { CskhCustomerIntent, CskhInboxConversation, CskhSapoCatalogItem } from './api'
import {
  createSapoOrder,
  fetchCskhSapoCatalog,
  fetchCskhSapoStatus,
  getCskhSapoOAuthStartUrl,
} from './api'
import { cn } from '@/lib/utils'

type LineItemDraft = {
  variantId: number
  productId: number
  name: string
  priceLabel: string
  quantity: number
  maxQty: number | null
}

type SapoCreateOrderDialogProps = {
  open: boolean
  onClose: () => void
  conversation: CskhInboxConversation
  intent?: CskhCustomerIntent | null
}

function catalogToLineItem(p: CskhSapoCatalogItem, quantity = 1): LineItemDraft {
  return {
    variantId: p.variantId,
    productId: p.productId,
    name: p.name,
    priceLabel: p.priceLabel,
    quantity,
    maxQty: p.inventoryQuantity,
  }
}

export function SapoCreateOrderDialog({
  open,
  onClose,
  conversation,
  intent,
}: SapoCreateOrderDialogProps) {
  const qc = useQueryClient()
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([])

  const { data: sapoStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['cskh', 'sapo', 'status'],
    queryFn: fetchCskhSapoStatus,
    enabled: open,
    staleTime: 60_000,
  })

  const { data: catalogData, isLoading: isLoadingCatalog } = useQuery({
    queryKey: ['cskh', 'sapo', 'catalog'],
    queryFn: fetchCskhSapoCatalog,
    enabled: open,
    staleTime: 30_000,
  })

  const catalogByVariant = useMemo(() => {
    const map = new Map<number, CskhSapoCatalogItem>()
    for (const item of catalogData?.items ?? []) {
      map.set(item.variantId, item)
    }
    return map
  }, [catalogData?.items])

  const defaultLineItems = useMemo<LineItemDraft[]>(() => {
    const fromIntent = (intent?.products ?? []).map((p) => {
      const cat = catalogByVariant.get(p.variantId)
      return {
        variantId: p.variantId,
        productId: p.productId,
        name: p.name,
        priceLabel: p.priceLabel,
        quantity: 1,
        maxQty: cat?.inventoryQuantity ?? p.inStock ? null : 0,
      }
    })
    if (fromIntent.length) return fromIntent
    return (catalogData?.items ?? []).slice(0, 1).map((p) => catalogToLineItem(p, 1))
  }, [intent?.products, catalogData?.items, catalogByVariant])

  useEffect(() => {
    if (!open || isLoadingCatalog) return
    setPhone('')
    setAddress('')
    setNote(intent?.summary ? `Nhu cầu: ${intent.summary}` : '')
    setLineItems(defaultLineItems)
  }, [open, conversation.id, defaultLineItems, intent?.summary, isLoadingCatalog])

  const createMutation = useMutation({
    mutationFn: createSapoOrder,
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: ['cskh', 'sapo', 'catalog'] })
      void qc.invalidateQueries({ queryKey: ['cskh', 'sapo', 'status'] })
      if (result.source === 'db') {
        toast.success(
          result.orderName
            ? `Đã tạo đơn test ${result.orderName} · ${result.totalPrice ? `${Number(result.totalPrice).toLocaleString('vi-VN')}đ` : ''}`
            : `Đã tạo đơn test #${result.orderId}`,
        )
      } else {
        toast.success(
          result.orderName
            ? `Đã tạo đơn ${result.orderName} trên Sapo`
            : `Đã tạo đơn #${result.orderId} trên Sapo`,
        )
        if (result.adminUrl) {
          window.open(result.adminUrl, '_blank', 'noopener,noreferrer')
        }
      }
      onClose()
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || err.message || 'Không tạo được đơn')
    },
  })

  if (!open) return null

  const customerName = conversation.customerName?.trim() || 'Khách Messenger'
  const catalogReady = (sapoStatus?.variantCount ?? 0) > 0 || (catalogData?.items.length ?? 0) > 0
  const sapoReady = Boolean(sapoStatus?.ordersReady || catalogReady)
  const isDbCatalog = sapoStatus?.catalogSource === 'db' || sapoStatus?.dbCatalogReady
  const oauthUrl = sapoStatus?.oauthStartUrl || sapoStatus?.authorizeUrl || getCskhSapoOAuthStartUrl()

  const updateQuantity = (variantId: number, quantity: number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.variantId !== variantId) return item
        let q = Math.max(1, Math.floor(quantity || 1))
        if (item.maxQty != null) q = Math.min(q, item.maxQty)
        return { ...item, quantity: q }
      }),
    )
  }

  const removeLineItem = (variantId: number) => {
    setLineItems((prev) => prev.filter((item) => item.variantId !== variantId))
  }

  const addCatalogItem = (p: CskhSapoCatalogItem) => {
    if (!p.inStock) {
      toast.error('Sản phẩm hết hàng')
      return
    }
    setLineItems((prev) => {
      const existing = prev.find((i) => i.variantId === p.variantId)
      if (existing) {
        return prev.map((i) =>
          i.variantId === p.variantId
            ? {
                ...i,
                quantity: Math.min(
                  i.quantity + 1,
                  i.maxQty ?? i.quantity + 1,
                ),
              }
            : i,
        )
      }
      return [...prev, catalogToLineItem(p, 1)]
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!lineItems.length) {
      toast.error('Chọn ít nhất một sản phẩm')
      return
    }
    createMutation.mutate({
      customerName,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      note: note.trim() || undefined,
      psid: conversation.participantPsid,
      conversationId: conversation.id,
      lineItems: lineItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    })
  }

  const availableToAdd = (catalogData?.items ?? []).filter(
    (p) => !lineItems.some((l) => l.variantId === p.variantId),
  )

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sapo-create-order-title"
        className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <h2 id="sapo-create-order-title" className="text-sm font-bold text-slate-800">
                Tạo đơn hàng
              </h2>
              <p className="text-[10px] text-slate-400">
                {isDbCatalog ? 'Catalog test trong DB' : 'Từ hội thoại Messenger'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
          {isLoadingStatus || isLoadingCatalog ? (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Đang tải catalog...
            </div>
          ) : !sapoReady ? (
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 text-[11px] text-amber-900 space-y-2">
              <p className="font-semibold">Chưa có catalog — chạy seed SQL hoặc kết nối Sapo</p>
              <p className="text-amber-800/90">
                BE: chạy file <code className="text-[10px] bg-white/70 px-1 rounded">prisma/manual-sapo-catalog-seed.sql</code> trên Supabase.
              </p>
              <a
                href={oauthUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-amber-700"
              >
                Kết nối Sapo OAuth (sau khi duyệt app)
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-3 py-2 text-[10px] text-emerald-800">
              {isDbCatalog ? 'Catalog DB (test)' : 'Sapo API'} · {catalogData?.items.length ?? sapoStatus?.variantCount ?? 0} sản phẩm
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thông tin khách</h3>
            <div className="grid gap-2 text-[11px]">
              <label className="space-y-1">
                <span className="text-slate-500">Tên</span>
                <input readOnly value={customerName} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700" />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500">Số điện thoại</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xx xxx xxx"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </label>
              <label className="space-y-1">
                <span className="text-slate-500">Địa chỉ giao hàng</span>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 resize-none focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sản phẩm trong đơn</h3>
            {lineItems.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic py-2">Chọn sản phẩm bên dưới.</p>
            ) : (
              <div className="space-y-2">
                {lineItems.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50/50 p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold text-slate-700 truncate">{item.name}</p>
                      <p className="text-[10px] text-violet-600 font-bold">{item.priceLabel}</p>
                      {item.maxQty != null && (
                        <p className="text-[9px] text-slate-400">Tồn: {item.maxQty}</p>
                      )}
                    </div>
                    <input
                      type="number"
                      min={1}
                      max={item.maxQty ?? undefined}
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.variantId, Number(e.target.value))}
                      className="w-14 rounded-lg border border-slate-200 px-2 py-1 text-center text-[11px]"
                    />
                    <button type="button" onClick={() => removeLineItem(item.variantId)} className="text-[10px] text-slate-400 hover:text-rose-500 px-1">
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {availableToAdd.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Thêm sản phẩm</h3>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {availableToAdd.map((p) => (
                  <button
                    key={p.variantId}
                    type="button"
                    disabled={!p.inStock}
                    onClick={() => addCatalogItem(p)}
                    className={cn(
                      'w-full flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[11px] transition-colors',
                      p.inStock
                        ? 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                        : 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed',
                    )}
                  >
                    <Plus className="h-3 w-3 shrink-0 text-emerald-600" />
                    <span className="flex-1 truncate font-medium text-slate-700">{p.name}</span>
                    <span className="text-[10px] text-violet-600 font-bold shrink-0">{p.priceLabel}</span>
                    <span className={cn('text-[9px] shrink-0', p.inStock ? 'text-slate-400' : 'text-rose-500')}>
                      {p.inventoryQuantity != null ? `Tồn ${p.inventoryQuantity}` : '—'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="block space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ghi chú đơn</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[11px] resize-none focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          <div className="flex gap-2 pt-1 pb-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">
              Hủy
            </button>
            <button
              type="submit"
              disabled={!sapoReady || !lineItems.length || createMutation.isPending}
              className={cn(
                'flex-1 rounded-xl px-4 py-2.5 text-[11px] font-bold text-white transition-colors',
                sapoReady && lineItems.length ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 cursor-not-allowed',
              )}
            >
              {createMutation.isPending ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang tạo...
                </span>
              ) : isDbCatalog ? (
                'Tạo đơn (test DB)'
              ) : (
                'Tạo đơn trên Sapo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
