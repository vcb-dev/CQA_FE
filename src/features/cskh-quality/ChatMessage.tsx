import { Check, CheckCheck, Loader2, AlertCircle } from 'lucide-react'
import { memo, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { resolveInboxMessageMedia, type CskhInboxMessage } from './api'
import { dedupeMediaUrls } from './auditHelpers'
import { isInboxMessagePreview } from './inboxRealtimeCache'
import { cskhMediaProxySrc, cskhMediaSrc, resolveMessageMedia } from './messageMedia'

type ChatMessageProps = {
  message: CskhInboxMessage
  isOwn: boolean
  expectMinImages?: number
}

function ChatMediaImage({
  url,
  compact,
  onFailed,
}: {
  url: string
  compact?: boolean
  onFailed?: (url: string) => void
}) {
  const cdn = /fbcdn|fbsbx|facebook\.com|fb\.com|cdninstagram|instagram\.com/i.test(url)
  const [failed, setFailed] = useState(false)
  const [useProxy, setUseProxy] = useState(cdn)
  const src = useProxy ? cskhMediaProxySrc(url) : cskhMediaSrc(url)
  if (failed || !src) return null
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg">
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        className={
          compact
            ? 'aspect-square w-full object-cover'
            : 'max-h-96 max-w-full rounded-lg object-cover'
        }
        loading="lazy"
        onError={() => {
          if (!useProxy) setUseProxy(true)
          else {
            setFailed(true)
            onFailed?.(url)
          }
        }}
      />
    </a>
  )
}

export const ChatMessage = memo(function ChatMessage({
  message,
  isOwn,
  expectMinImages = 0,
}: ChatMessageProps) {
  const statusIcon =
    message.status === 'pending' ? (
      <Loader2 className="w-3 h-3 animate-spin" />
    ) : message.status === 'sent' ? (
      <Check className="w-3 h-3" />
    ) : message.status === 'read' ? (
      <CheckCheck className="w-3 h-3 text-blue-100" />
    ) : message.status === 'failed' ? (
      <span title="Gửi lỗi">
        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
      </span>
    ) : null

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const looksVietnamese = (s: string) =>
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(s)
  const mainText = (message.text || '').trim()
  const viText = (message.originalText || message.translatedText || '').trim()
  const bothVietnamese = looksVietnamese(mainText) && looksVietnamese(viText)
  const showVi =
    Boolean(viText) &&
    viText !== mainText &&
    !bothVietnamese &&
    (message.messageType === 'text' || !message.messageType)

  const initialUrls = dedupeMediaUrls(
    message.attachmentUrls?.length
      ? message.attachmentUrls
      : message.attachmentUrl
        ? [message.attachmentUrl]
        : [],
  )
  const [resolvedUrls, setResolvedUrls] = useState<string[]>(initialUrls)
  const [resolvedType, setResolvedType] = useState<string | null>(message.messageType ?? null)
  const [resolvedText, setResolvedText] = useState<string | null | undefined>(message.text)
  const [resolving, setResolving] = useState(false)
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set())
  const resolveAttemptedFor = useRef<string | null>(null)

  useEffect(() => {
    const urls = dedupeMediaUrls(
      message.attachmentUrls?.length
        ? message.attachmentUrls
        : message.attachmentUrl
          ? [message.attachmentUrl]
          : [],
    )
    setResolvedUrls(urls)
    setResolvedType(message.messageType ?? null)
    setResolvedText(message.text)
    setFailedUrls(new Set())
  }, [message.id, message.attachmentUrl, message.attachmentUrls, message.messageType, message.text])

  const media = resolveMessageMedia({
    text: resolvedText,
    attachmentUrl: resolvedUrls[0] ?? null,
    messageType: resolvedType,
  })
  const expectMin = Math.max(expectMinImages, message.groupedMediaCount ?? 0)
  const needsResolve =
    Boolean(message.id) &&
    !isInboxMessagePreview(message.id) &&
    (media.messageType === 'image' ||
      media.messageType === 'video' ||
      resolvedText === '[Ảnh]' ||
      resolvedText === '[Video]' ||
      resolvedText === '[attachment]') &&
    (resolvedUrls.length === 0 || resolvedUrls.length < expectMin)

  useEffect(() => {
    if (!needsResolve) return
    if (resolveAttemptedFor.current === message.id) return
    resolveAttemptedFor.current = message.id
    let cancelled = false
    setResolving(true)
    resolveInboxMessageMedia(message.id)
      .then((row) => {
        if (cancelled) return
        if (row.attachmentUrls?.length) setResolvedUrls(dedupeMediaUrls(row.attachmentUrls))
        else if (row.attachmentUrl) setResolvedUrls(dedupeMediaUrls([row.attachmentUrl]))
        if (row.messageType) setResolvedType(row.messageType)
        setResolvedText(row.text)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setResolving(false)
      })
    return () => {
      cancelled = true
    }
  }, [message.id, needsResolve])

  const imageUrls =
    media.messageType === 'image'
      ? resolvedUrls.filter((u) => u.startsWith('http') && !failedUrls.has(u))
      : []
  const videoUrl = media.messageType === 'video' ? (resolvedUrls[0] ?? media.attachmentUrl) : null
  const caption = media.displayText

  if (message.messageType === 'ad_referral') {
    const title = (resolvedText || message.text || 'Đã trả lời một quảng cáo').trim()
    const idLine = (message.translatedText || message.originalText || '').trim()
    const img = message.attachmentUrl?.startsWith('http') ? message.attachmentUrl : null
    return (
      <div className="flex mb-3 justify-start">
        <div className="max-w-[min(100%,280px)] rounded-2xl rounded-bl-md border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="px-2.5 pt-1.5 pb-1 flex items-center justify-between gap-2">
            <p className="text-[10px] text-slate-400 font-medium">Đã trả lời một quảng cáo</p>
            <span className="text-[10px] text-slate-400 shrink-0">{formatTime(message.sentAt)}</span>
          </div>
          <div className="flex gap-2 px-2.5 pb-2.5">
            {img ? (
              <a
                href={img}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 block w-12 h-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50"
              >
                <img
                  src={img}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </a>
            ) : (
              <div className="shrink-0 w-12 h-12 rounded-lg border border-dashed border-slate-200 bg-slate-50" />
            )}
            <div className="min-w-0 flex-1 self-center space-y-0.5">
              <p className="text-[12px] font-medium text-slate-800 leading-snug line-clamp-2">{title}</p>
              {idLine ? (
                <p className="text-[10px] text-slate-400 font-mono truncate select-all" title={idLine}>
                  {idLine}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (message.messageType === 'sticker') {
      return message.attachmentUrl ? (
        <img
          src={cskhMediaProxySrc(message.attachmentUrl)}
          alt="sticker"
          className="max-w-xs"
          loading="lazy"
        />
      ) : (
        <p className="text-sm">[Sticker]</p>
      )
    }

    if (imageUrls.length || videoUrl || caption) {
      return (
        <div className="space-y-2">
          {imageUrls.length > 0 ? (
            <div
              className={
                imageUrls.length === 1
                  ? 'grid grid-cols-1 gap-1'
                  : imageUrls.length === 3
                    ? 'grid max-w-[240px] grid-cols-3 gap-1'
                    : 'grid max-w-[240px] grid-cols-2 gap-1'
              }
            >
              {imageUrls.map((url, idx) => (
                <ChatMediaImage
                  key={`${url}-${idx}`}
                  url={url}
                  compact={imageUrls.length > 1}
                  onFailed={(failed) =>
                    setFailedUrls((prev) => {
                      const next = new Set(prev)
                      next.add(failed)
                      return next
                    })
                  }
                />
              ))}
            </div>
          ) : null}
          {videoUrl ? (
            <video
              src={cskhMediaSrc(videoUrl) ?? cskhMediaProxySrc(videoUrl)}
              controls
              playsInline
              preload="metadata"
              className="max-h-64 max-w-full rounded-lg"
            />
          ) : null}
          {caption ? (
            <div className="text-sm leading-relaxed break-words space-y-1.5">
              <div>{caption}</div>
              {showVi && (
                <div
                  className={cn(
                    'text-[11.5px] leading-snug border-t pt-1.5',
                    isOwn ? 'border-white/25 text-blue-50/90' : 'border-gray-200 text-slate-500',
                  )}
                >
                  <span className={cn('font-medium', isOwn ? 'text-blue-50' : 'text-slate-600')}>
                    {isOwn ? 'Tiếng Việt: ' : 'Dịch: '}
                  </span>
                  {viText}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )
    }

    return (
      <p className={cn('text-sm italic', isOwn ? 'text-blue-100' : 'text-gray-500')}>
        {resolving
          ? 'Đang tải ảnh…'
          : media.messageType === 'video'
            ? '[Video]'
            : media.messageType === 'image'
              ? '[Ảnh]'
              : '[Tin nhắn không hỗ trợ]'}
      </p>
    )
  }

  return (
    <div className={cn('flex mb-3 gap-2', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'px-4 py-2 rounded-lg shadow-md',
          imageUrls.length > 1 ? 'max-w-sm' : 'max-w-xs',
          isOwn
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-none shadow-blue-200/50'
            : 'bg-gray-100 text-gray-900 rounded-bl-none border border-gray-200 shadow-gray-100/50',
        )}
      >
        {renderContent()}

        <div
          className={cn(
            'text-xs mt-1 flex items-center justify-end gap-1',
            isOwn ? 'text-blue-100' : 'text-gray-500',
          )}
        >
          <span>{formatTime(message.sentAt)}</span>
          {isOwn && statusIcon}
        </div>
      </div>
    </div>
  )
})
