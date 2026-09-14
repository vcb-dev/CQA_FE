import { Megaphone, Loader2 } from 'lucide-react'
import type { CskhAdInsights, CskhInboxConversation } from './api'

type ConversationAdBannerProps = {
  conversation: CskhInboxConversation
  adInsights?: CskhAdInsights | null
  isLoadingAdInsights?: boolean
}

/**
 * Thẻ QC dạng tin hệ thống trong luồng chat (không phải banner ghim header).
 * Giống context “trả lời quảng cáo” trên Messenger.
 */
export function ConversationAdBanner({
  conversation,
  adInsights,
  isLoadingAdInsights,
}: ConversationAdBannerProps) {
  const fromAd =
    conversation.fromAd ||
    conversation.referralSource === 'HEURISTIC' ||
    Boolean(conversation.adId || adInsights?.adId)

  if (!fromAd) return null

  const adId = (conversation.adId || adInsights?.adId || '').trim() || null
  const adTitle =
    conversation.adTitle?.trim() ||
    adInsights?.adName?.trim() ||
    null
  const imageUrl = adInsights?.adImageUrl?.trim() || null
  const hasIdentity = Boolean(adId || adTitle || imageUrl)

  return (
    <div className="flex justify-start">
      <div className="max-w-[min(100%,280px)] rounded-2xl rounded-bl-md border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="px-2.5 pt-1.5 pb-1">
          <p className="text-[10px] text-slate-400 font-medium">
            Quảng cáo gần nhất trên hội thoại này
          </p>
        </div>

        {isLoadingAdInsights && !hasIdentity ? (
          <div className="flex items-center gap-2 px-2.5 pb-2.5 text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span className="text-[11px]">Đang tải quảng cáo…</span>
          </div>
        ) : hasIdentity ? (
          <div className="flex gap-2 px-2.5 pb-2.5">
            {imageUrl ? (
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 block w-12 h-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50"
                title="Mở ảnh quảng cáo"
              >
                <img
                  src={imageUrl}
                  alt={adTitle || 'Ảnh quảng cáo'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </a>
            ) : (
              <div className="shrink-0 w-12 h-12 rounded-lg border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                <Megaphone className="w-4 h-4 text-slate-300" />
              </div>
            )}
            <div className="min-w-0 flex-1 self-center space-y-0.5">
              {adTitle && (
                <p className="text-[12px] font-medium text-slate-800 leading-snug line-clamp-2">
                  {adTitle}
                </p>
              )}
              {adId && (
                <p className="text-[10px] text-slate-400 font-mono truncate select-all" title={adId}>
                  ID {adId}
                </p>
              )}
              {isLoadingAdInsights && !imageUrl && (
                <p className="text-[9px] text-slate-400 inline-flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Đang lấy ảnh…
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="px-2.5 pb-2.5">
            <p className="text-[11px] text-slate-500 leading-snug">
              Từ quảng cáo — Meta chưa gửi mã / ảnh ad cho tin này.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
