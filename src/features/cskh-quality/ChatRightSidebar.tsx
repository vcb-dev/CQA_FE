import React, { useState } from 'react'
import { Copy, Check, Sparkles, User, Megaphone, FileText, MessageSquare, Zap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { CskhInboxConversation, CskhCustomerIntent, CskhAdInsights } from './api'
import { cskhMediaProxySrc } from './messageMedia'
import { cn } from '@/lib/utils'

type ChatRightSidebarProps = {
  conversation: CskhInboxConversation
  intent?: CskhCustomerIntent | null
  isLoadingIntent?: boolean
  adInsights?: CskhAdInsights | null
  isLoadingAdInsights?: boolean
  onApplySuggestedReply: (text: string) => void
}

function formatAdMoney(amount: number | null | undefined, currency?: string | null): string {
  if (amount == null || !Number.isFinite(amount)) return '—'
  const cur = (currency || 'VND').toUpperCase()
  if (cur === 'VND') {
    return `${Math.round(amount).toLocaleString('vi-VN')}đ`
  }
  return `${amount.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ${cur}`
}

function adInsightsHint(reason: string | null | undefined, referralSource?: string | null): string {
  const heuristic = referralSource === 'HEURISTIC'
  switch (reason) {
    case 'no_ad_id':
      return heuristic
        ? 'Hội thoại cũ (HEURISTIC): Meta không gửi mã QC. Marketing API đã kết nối — đang lấy chi phí TB tài khoản QC.'
        : 'Hội thoại từ ads nhưng Meta không gửi mã QC.'
    case 'no_ad_accounts':
      return 'Chưa thấy tài khoản quảng cáo. OAuth lại bằng tài khoản admin QC trên Business Manager.'
    case 'no_messaging_insights':
      return heuristic
        ? 'Marketing API đã kết nối nhưng tài khoản QC này chưa có dữ liệu chi tiêu/messaging — có thể QC đang chạy trên tài khoản khác.'
        : 'Meta chưa trả Insights messaging. Kiểm tra QC trên Ads Manager hoặc thử lại sau vài giờ.'
    case 'oauth_required':
      return 'Cần kết nối lại Facebook (OAuth) với quyền ads_read.'
    case 'ads_read_missing':
      return 'Thiếu quyền ads_read — vào Meta App → Marketing API → OAuth lại và chấp nhận quyền quảng cáo.'
    case 'not_from_ad':
      return 'Hội thoại không từ quảng cáo.'
    case 'api_error':
      return 'Không lấy được dữ liệu từ Marketing API — thử lại sau vài giờ (Insights có độ trễ).'
    default:
      return 'Chưa có dữ liệu chi phí.'
  }
}

export function ChatRightSidebar({
  conversation,
  intent,
  isLoadingIntent,
  adInsights,
  isLoadingAdInsights,
  onApplySuggestedReply,
}: ChatRightSidebarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Đã sao chép vào bộ nhớ tạm')
    setTimeout(() => setCopied(false), 2000)
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'Gấp'
      case 'low':
        return 'Thấp'
      default:
        return 'Bình thường'
    }
  }

  const showAdDetails =
    conversation.fromAd ||
    conversation.referralSource === 'HEURISTIC' ||
    Boolean(adInsights && !adInsights.unavailableReason)

  return (
    <div className="w-[300px] border-l border-slate-200/60 bg-gradient-to-b from-slate-50/80 to-white flex flex-col h-full overflow-y-auto font-sans">
      {/* Customer Profile */}
      <div className="px-5 pt-5 pb-4 flex flex-col items-center text-center">
        {conversation.customerPictureUrl ? (
          <img
            src={cskhMediaProxySrc(conversation.customerPictureUrl)}
            alt={conversation.customerName || 'Customer'}
            className="w-14 h-14 rounded-full object-cover ring-3 ring-white shadow-lg mb-3"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white text-lg font-bold shadow-lg ring-3 ring-white mb-3">
            {(conversation.customerName || 'K').charAt(0).toUpperCase()}
          </div>
        )}
        <h3 className="text-sm font-bold text-slate-800 truncate max-w-full">
          {conversation.customerName || 'Khách hàng Messenger'}
        </h3>
        <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100/50">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Messenger · Facebook User
        </span>
      </div>

      {/* Divider */}
      <div className="h-px mx-4 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* Customer Info */}
      <div className="px-5 py-4 space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <User className="w-3 h-3" />
          Thông tin khách
        </h4>
        
        <div className="space-y-2.5 text-[11px]">
          <div className="flex items-start gap-2">
            <span className="text-slate-400 font-medium min-w-[60px] pt-0.5">Kênh nhận:</span>
            <span className="text-slate-700 font-semibold truncate">
              {conversation.pageName || `ID: ${conversation.pageId}`}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-slate-400 font-medium min-w-[60px] pt-0.5">Nguồn:</span>
            <span className="font-semibold">
              {conversation.fromAd ? (
                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md text-[10px]">
                  <Megaphone className="w-2.5 h-2.5" />
                  Facebook Ads
                </span>
              ) : (
                <span className="text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md text-[10px]">
                  Organic
                </span>
              )}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-slate-400 font-medium min-w-[60px] pt-0.5">PSID:</span>
            <span className="text-slate-600 font-mono text-[10px] select-all bg-slate-50 px-1.5 py-0.5 rounded">
              {conversation.participantPsid}
            </span>
          </div>
        </div>

        {/* Ads Campaign Details */}
        {showAdDetails && (
          <div className="mt-2 bg-gradient-to-br from-amber-50/80 to-orange-50/50 rounded-xl border border-amber-100/60 p-3 space-y-2 text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-amber-800 text-[10px]">
              <Megaphone className="w-3 h-3 text-amber-600" />
              Chi tiết chiến dịch quảng cáo
            </div>
            {conversation.adTitle && (
              <div className="flex flex-col gap-0.5">
                <span className="text-amber-500 font-medium text-[10px]">Tên quảng cáo:</span>
                <span className="text-slate-700 font-medium">{conversation.adTitle}</span>
              </div>
            )}
            {conversation.adId && (
              <div className="flex flex-col gap-0.5">
                <span className="text-amber-500 font-medium text-[10px]">Mã QC:</span>
                <span className="text-slate-600 font-mono text-[10px] select-all">{conversation.adId}</span>
              </div>
            )}
            {conversation.referralSource && (
              <div className="flex flex-col gap-0.5">
                <span className="text-amber-500 font-medium text-[10px]">Nguồn giới thiệu:</span>
                <span className="text-slate-600">{conversation.referralSource}</span>
              </div>
            )}

            {/* Chi phí QC từ Marketing API */}
            <div className="pt-1 border-t border-amber-100/80 space-y-1.5">
              <span className="text-amber-600 font-bold text-[10px] uppercase tracking-wide">
                Chi phí quảng cáo (ước tính)
              </span>
              {isLoadingAdInsights ? (
                <div className="flex items-center gap-1.5 text-[10px] text-amber-600">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Đang lấy từ Meta Insights...
                </div>
              ) : adInsights?.unavailableReason ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-amber-700/80 leading-relaxed">
                    {adInsightsHint(adInsights.unavailableReason, conversation.referralSource)}
                  </p>
                  {adInsights?.connectedAdAccountName && (
                    <p className="text-[9px] text-slate-500">
                      Tài khoản QC đã kết nối: {adInsights.connectedAdAccountName}
                    </p>
                  )}
                  {adInsights?.estimateNote && (
                    <p className="text-[9px] text-amber-700/90 leading-relaxed bg-amber-50/80 rounded-md px-2 py-1.5 border border-amber-100">
                      {adInsights.estimateNote}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  {adInsights?.isAccountLevelEstimate && adInsights.estimateNote && (
                    <p className="text-[9px] text-amber-700/90 leading-relaxed bg-amber-50/80 rounded-md px-2 py-1.5 border border-amber-100">
                      {adInsights.estimateNote}
                    </p>
                  )}
                  {adInsights?.connectedAdAccountName && (
                    <p className="text-[9px] text-slate-500">
                      Tài khoản QC: {adInsights.connectedAdAccountName}
                    </p>
                  )}
                  {adInsights?.campaignName && (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-amber-500 font-medium text-[10px]">Chiến dịch:</span>
                      <span className="text-slate-700">{adInsights.campaignName}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/70 rounded-lg px-2 py-1.5 border border-amber-100/50">
                      <div className="text-[9px] text-amber-500 font-medium">Tổng chi tiêu</div>
                      <div className="text-[11px] font-bold text-slate-800">
                        {formatAdMoney(adInsights?.spend, adInsights?.currency)}
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-lg px-2 py-1.5 border border-amber-100/50">
                      <div className="text-[9px] text-amber-500 font-medium">Chi phí/hội thoại</div>
                      <div className="text-[11px] font-bold text-emerald-700">
                        {formatAdMoney(
                          adInsights?.estimatedForThisConversation ?? adInsights?.costPerConversation,
                          adInsights?.currency
                        )}
                      </div>
                    </div>
                  </div>
                  {adInsights?.messagingConversations != null && (
                    <p className="text-[9px] text-slate-500">
                      {adInsights.messagingConversations.toLocaleString('vi-VN')} hội thoại từ QC
                      {adInsights.dateStart && adInsights.dateStop
                        ? ` · ${adInsights.dateStart} → ${adInsights.dateStop}`
                        : ''}
                    </p>
                  )}
                  <p className="text-[9px] text-slate-400 italic">
                    {adInsights?.isAccountLevelEstimate
                      ? 'Chi phí TB/tin từ Insights tài khoản QC — không phải mã QC cụ thể.'
                      : 'Meta không trả chi phí theo từng tin — số liệu chia từ tổng spend Insights.'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px mx-4 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* AI Intent Analysis */}
      <div className="px-5 py-4 space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-violet-500 flex items-center gap-1.5 w-full">
          <Sparkles className="w-3 h-3" />
          AI phân tích ý định
          {intent?.isStale && (
            <span className="ml-auto flex items-center gap-1 text-[9px] text-violet-400 normal-case font-medium animate-pulse">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              Đang cập nhật...
            </span>
          )}
        </h4>

        {isLoadingIntent ? (
          <div className="flex items-center gap-2 py-3 text-[11px] text-violet-600">
            <div className="w-3.5 h-3.5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            Đang phân tích cuộc hội thoại...
          </div>
        ) : !intent ? (
          <div className="text-[11px] text-slate-400 italic py-2">
            Chưa có đủ tin nhắn để AI phân tích ý định.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Intent Label & Urgency */}
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm">
                {intent.intentLabel}
              </span>
              <span
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase',
                  intent.urgency === 'high'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                    : intent.urgency === 'low'
                      ? 'bg-slate-50 text-slate-500 border border-slate-200/60'
                      : 'bg-sky-50 text-sky-600 border border-sky-200/60'
                )}
              >
                {getUrgencyText(intent.urgency)}
              </span>
            </div>

            {/* Summary */}
            <div className="bg-white/80 rounded-xl border border-slate-200/60 p-3 shadow-sm">
              <div className="text-[10px] text-slate-400 font-semibold mb-1.5 uppercase tracking-wide">Tóm tắt nhu cầu:</div>
              <p className="text-[11px] text-slate-700 leading-relaxed">{intent.summary}</p>
            </div>

            {/* Topics */}
            {intent.topics?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Chủ đề quan tâm
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {intent.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 text-violet-600 border border-violet-100/60"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sapo Products match */}
            {intent.products && intent.products.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Sản phẩm quan tâm
                </span>
                <div className="space-y-1.5">
                  {intent.products.map((p) => (
                    <div
                      key={`${p.productId}-${p.variantId}`}
                      className="flex gap-2 rounded-xl bg-white border border-slate-200/60 p-2 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-lg object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-[9px] text-slate-400 font-bold">
                          SP
                        </div>
                      )}
                      <div className="min-w-0 flex-1 text-[11px]">
                        <p className="font-semibold text-slate-700 truncate">{p.name}</p>
                        <p className="text-violet-600 font-bold mt-0.5">{p.priceLabel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px mx-4 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      {/* AI Suggested Response */}
      <div className="px-5 py-4 space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-500 flex items-center gap-1.5 w-full">
          <MessageSquare className="w-3 h-3" />
          AI gợi ý trả lời
          {intent?.isStale && (
            <span className="ml-auto flex items-center gap-1 text-[9px] text-blue-400 normal-case font-medium animate-pulse">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              Đang cập nhật...
            </span>
          )}
        </h4>

        {isLoadingIntent ? (
          <div className="flex items-center gap-2 py-3 text-[11px] text-blue-500">
            <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Đang tạo gợi ý phản hồi...
          </div>
        ) : !intent || (!intent.suggestedFocus && !intent.suggestedReply) ? (
          <div className="text-[11px] text-slate-400 italic py-2">
            Chưa có gợi ý trả lời nào từ AI.
          </div>
        ) : (
          <div className="space-y-3">
            {/* Guidance focus advice */}
            {intent.suggestedFocus && (
              <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-3 text-[10px] text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-600 block mb-0.5">💡 Hướng xử lý:</span>
                {intent.suggestedFocus}
              </div>
            )}

            {/* Actual Suggested Reply Card */}
            <div className="relative bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl border border-blue-100/50 p-3.5 shadow-sm">
              <div className="absolute top-2 right-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400/40" />
              </div>
              <span className="font-semibold text-blue-600 text-[10.5px] block mb-1">✨ Tin nhắn gợi ý:</span>
              <p className="text-[11px] text-slate-700 leading-relaxed pr-4 whitespace-pre-wrap">
                {intent.suggestedReply || intent.suggestedFocus}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                disabled={!intent.analyzedAt}
                onClick={() => handleCopy(intent.suggestedReply || intent.suggestedFocus)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Sao chép
              </button>
              <button
                disabled={!intent.analyzedAt}
                onClick={() => onApplySuggestedReply(intent.suggestedReply || intent.suggestedFocus)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] transition-all duration-200 shadow-sm shadow-blue-200/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-3.5 h-3.5" />
                Áp dụng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
