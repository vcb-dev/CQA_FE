import React, { useState } from 'react'
import { Copy, Check, Sparkles, User, Megaphone, FileText, Info } from 'lucide-react'
import { toast } from 'sonner'
import type { CskhInboxConversation, CskhCustomerIntent } from './api'
import { cskhMediaProxySrc } from './messageMedia'
import { cn } from '@/lib/utils'

type ChatRightSidebarProps = {
  conversation: CskhInboxConversation
  intent?: CskhCustomerIntent | null
  isLoadingIntent?: boolean
  onApplySuggestedReply: (text: string) => void
}

export function ChatRightSidebar({
  conversation,
  intent,
  isLoadingIntent,
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

  return (
    <div className="w-80 border-l bg-slate-50/50 flex flex-col h-full overflow-y-auto divide-y divide-gray-100 font-sans">
      {/* SECTION 1: Customer Profile */}
      <div className="p-5 flex flex-col items-center text-center">
        {conversation.customerPictureUrl ? (
          <img
            src={cskhMediaProxySrc(conversation.customerPictureUrl)}
            alt={conversation.customerName || 'Customer'}
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md mb-3"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold shadow-md mb-3">
            {(conversation.customerName || 'K').charAt(0).toUpperCase()}
          </div>
        )}
        <h3 className="text-base font-semibold text-gray-900 truncate max-w-full">
          {conversation.customerName || 'Khách hàng Messenger'}
        </h3>
        <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
          Facebook User
        </span>
      </div>

      {/* SECTION 2: General Information */}
      <div className="p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          Thông tin khách
        </h4>
        
        <div className="grid grid-cols-3 gap-y-3 text-xs">
          <span className="text-gray-500 col-span-1">Kênh nhận:</span>
          <span className="text-gray-900 col-span-2 font-medium truncate">
            {conversation.pageName || `ID: ${conversation.pageId}`}
          </span>

          <span className="text-gray-500 col-span-1">Nguồn:</span>
          <span className="col-span-2 font-medium">
            {conversation.fromAd ? (
              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                Facebook Ads
              </span>
            ) : (
              <span className="text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded">
                Tự nhiên (Organic)
              </span>
            )}
          </span>

          <span className="text-gray-500 col-span-1">PSID:</span>
          <span className="text-gray-900 col-span-2 font-mono truncate select-all">
            {conversation.participantPsid}
          </span>
        </div>

        {/* Ads Campaign Details */}
        {conversation.fromAd && (
          <div className="mt-3 bg-amber-50/50 rounded-lg border border-amber-100 p-3 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-amber-900">
              <Megaphone className="w-3.5 h-3.5 text-amber-600" />
              Chi tiết chiến dịch quảng cáo
            </div>
            {conversation.adTitle && (
              <div className="flex flex-col gap-0.5">
                <span className="text-amber-600 font-medium">Tên quảng cáo:</span>
                <span className="text-gray-800">{conversation.adTitle}</span>
              </div>
            )}
            {conversation.adId && (
              <div className="flex flex-col gap-0.5">
                <span className="text-amber-600 font-medium">Mã quảng cáo (ID):</span>
                <span className="text-gray-700 font-mono select-all">{conversation.adId}</span>
              </div>
            )}
            {conversation.referralSource && (
              <div className="flex flex-col gap-0.5">
                <span className="text-amber-600 font-medium">Nguồn giới thiệu:</span>
                <span className="text-gray-700">{conversation.referralSource}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: AI Customer Intent Analytics */}
      <div className="p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          AI phân tích ý định
        </h4>

        {isLoadingIntent ? (
          <div className="flex items-center gap-2 py-4 text-xs text-violet-700">
            <div className="w-4 h-4 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            Đang phân tích cuộc hội thoại...
          </div>
        ) : !intent ? (
          <div className="text-xs text-gray-400 italic">
            Chưa có đủ tin nhắn để AI phân tích ý định.
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Intent Label & Urgency */}
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-600 text-white">
                {intent.intentLabel}
              </span>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase',
                  intent.urgency === 'high'
                    ? 'bg-rose-100 text-rose-700'
                    : intent.urgency === 'low'
                      ? 'bg-slate-100 text-slate-600'
                      : 'bg-sky-100 text-sky-700'
                )}
              >
                {getUrgencyText(intent.urgency)}
              </span>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-xs text-gray-500 font-medium mb-1">Tóm tắt nhu cầu:</div>
              <p className="text-xs text-gray-800 leading-relaxed">{intent.summary}</p>
            </div>

            {/* Topics */}
            {intent.topics?.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  Chủ đề quan tâm
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {intent.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-violet-50 text-violet-700 border border-violet-100"
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
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                  Sản phẩm quan tâm
                </span>
                <div className="space-y-2">
                  {intent.products.map((p) => (
                    <div
                      key={`${p.productId}-${p.variantId}`}
                      className="flex gap-2 rounded bg-white border border-gray-200 p-2 shadow-sm"
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded object-cover border border-gray-100"
                        />
                      ) : (
                        <div className="h-10 w-10 shrink-0 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-semibold">
                          SP
                        </div>
                      )}
                      <div className="min-w-0 flex-1 text-[11px]">
                        <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                        <p className="text-violet-700 font-bold mt-0.5">{p.priceLabel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 4: AI Suggested Response */}
      <div className="p-5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          AI gợi ý trả lời
        </h4>

        {isLoadingIntent ? (
          <div className="flex items-center gap-2 py-4 text-xs text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Đang tìm kiếm gợi ý phản hồi...
          </div>
        ) : !intent || !intent.suggestedFocus ? (
          <div className="text-xs text-gray-400 italic">
            Chưa có gợi ý trả lời nào từ AI.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-3.5 text-xs text-gray-700 leading-relaxed font-medium">
              {intent.suggestedFocus}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(intent.suggestedFocus)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                Sao chép
              </button>
              <button
                onClick={() => onApplySuggestedReply(intent.suggestedFocus)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Áp dụng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
