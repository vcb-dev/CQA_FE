import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Loader2, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchInboxConversations, type CskhInboxConversation } from './api'
import { cskhMediaProxySrc } from './messageMedia'

type FilterTab = 'all' | 'unread' | 'ads' | 'normal'

type ChatListPanelProps = {
  selectedConversationId?: string
  onSelect: (conversation: CskhInboxConversation) => void
  pageId?: string
  typingConversationIds?: Set<string>
  connected?: boolean
  searchQuery?: string
  activeFilter?: FilterTab
}

// Assign a consistent color to each conversation based on name
const avatarColors = [
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-cyan-400 to-cyan-600',
  'from-indigo-400 to-indigo-600',
  'from-orange-400 to-orange-600',
  'from-teal-400 to-teal-600',
  'from-pink-400 to-pink-600',
]

const borderColors = [
  'border-l-blue-500',
  'border-l-purple-500',
  'border-l-emerald-500',
  'border-l-amber-500',
  'border-l-rose-500',
  'border-l-cyan-500',
  'border-l-indigo-500',
  'border-l-orange-500',
  'border-l-teal-500',
  'border-l-pink-500',
]

function getColorIndex(name: string | null): number {
  if (!name) return 0
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash) % avatarColors.length
}

export function ChatListPanel({
  selectedConversationId,
  onSelect,
  pageId,
  typingConversationIds = new Set(),
  connected,
  searchQuery = '',
  activeFilter = 'all',
}: ChatListPanelProps) {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['cskh', 'inbox', 'conversations', pageId],
    queryFn: () => fetchInboxConversations(pageId),
    refetchInterval: connected ? 45000 : 5000,
  })

  const filteredConversations = useMemo(() => {
    if (!conversations) return []
    
    let result = conversations

    // Apply tab filter
    if (activeFilter === 'unread') {
      result = result.filter(c => c.unreadCount > 0)
    } else if (activeFilter === 'ads') {
      result = result.filter(c => c.fromAd)
    } else if (activeFilter === 'normal') {
      result = result.filter(c => !c.fromAd)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter((c) => {
        const name = (c.customerName || '').toLowerCase()
        const msg = (c.lastMessage || '').toLowerCase()
        const psid = (c.participantPsid || '').toLowerCase()
        const page = (c.pageName || '').toLowerCase()
        return name.includes(q) || msg.includes(q) || psid.includes(q) || page.includes(q)
      })
    }

    return result
  }, [conversations, searchQuery, activeFilter])

  const formatTime = (isoString: string | null): string => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins}p trước`
    if (diffHours < 24) return `${diffHours}h trước`
    if (diffDays < 7) return `${diffDays}d trước`
    
    // Show time for today, date for older
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    if (diffDays < 1) return `${hh}:${mm}`
    return date.toLocaleDateString('vi-VN')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
          <span className="text-[11px] text-slate-400">Đang tải hội thoại...</span>
        </div>
      </div>
    )
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mb-3">
          <MessageCircle className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">Không có hội thoại nào</p>
        <p className="text-[11px] text-slate-400 mt-1 text-center">Hội thoại từ Facebook sẽ xuất hiện ở đây</p>
      </div>
    )
  }

  if (filteredConversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 mb-3">
          <MessageCircle className="w-7 h-7 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">Không tìm thấy kết quả</p>
        <p className="text-[11px] text-slate-400 mt-1 text-center">Thử nhập từ khóa tìm kiếm khác</p>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto h-full py-1.5 bg-slate-50/20">
      {filteredConversations.map((conv) => {
        const colorIdx = getColorIndex(conv.customerName)
        const isSelected = selectedConversationId === conv.id
        const isTyping = typingConversationIds.has(conv.id)
        const hasUnread = conv.unreadCount > 0

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={cn(
              'w-[calc(100%-16px)] mx-2 my-1 text-left px-3 py-3 transition-all duration-200 rounded-xl relative group border',
              isSelected
                ? 'bg-gradient-to-r from-indigo-50/70 to-indigo-50/30 border-indigo-100/70 shadow-sm shadow-indigo-100/20'
                : hasUnread
                  ? 'bg-slate-50/40 hover:bg-slate-50 border-slate-200/20'
                  : 'bg-white hover:bg-slate-50 border-transparent'
            )}
          >
            {isSelected && (
              <div className="absolute left-0 top-3.5 bottom-3.5 w-[3.5px] bg-indigo-500 rounded-r-full" />
            )}
            <div className="flex gap-2.5">
              {/* Avatar */}
              <div className="relative shrink-0">
                {conv.customerPictureUrl ? (
                  <img
                    src={cskhMediaProxySrc(conv.customerPictureUrl)}
                    alt={conv.customerName || 'Customer'}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                ) : (
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[colorIdx]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                    {(conv.customerName || 'K').charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Online dot for unread */}
                {hasUnread && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-white" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                {/* Row 1: Name + Ads badge + Time */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className={cn(
                      'text-[12.5px] truncate leading-tight',
                      hasUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                    )}>
                      {conv.customerName || `Khách ${conv.participantPsid.slice(0, 8)}`}
                    </h3>
                    {conv.fromAd && (
                      <span className="inline-flex items-center px-1 py-0.5 rounded text-[8px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm leading-none shrink-0">
                        Ads
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium tabular-nums">
                    {formatTime(conv.lastMessageAt)}
                  </span>
                </div>

                {/* Row 2: Platform + Page Name */}
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="inline-flex items-center gap-0.5 text-[9.5px] text-blue-500 font-medium">
                    <span className="w-1 h-1 rounded-full bg-blue-500 inline-block" />
                    Messenger
                  </span>
                  {conv.pageName && (
                    <>
                      <span className="text-[9px] text-slate-300">·</span>
                      <span className="text-[9.5px] text-slate-400 font-medium truncate max-w-[120px]">
                        {conv.pageName}
                      </span>
                    </>
                  )}
                </div>

                {/* Row 3: Last message + Unread badge */}
                <div className="flex items-center justify-between mt-1 gap-1.5">
                  <div
                    className={cn(
                      'text-[11px] truncate flex-1 min-h-[14px] leading-snug',
                      isTyping
                        ? 'text-blue-600 font-medium italic'
                        : hasUnread
                          ? 'text-slate-700 font-medium'
                          : 'text-slate-500'
                    )}
                  >
                    {isTyping ? (
                      <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                        đang nhập
                        <span className="inline-flex gap-0.5 ml-0.5 items-end h-2 pb-0.5">
                          {[0, 1, 2].map((i) => (
                            <span
                              key={i}
                              className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
                              style={{ animationDelay: `${i * 0.15}s` }}
                            />
                          ))}
                        </span>
                      </span>
                    ) : (
                      conv.lastMessage || '[Không có tin nhắn]'
                    )}
                  </div>
                  {hasUnread && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-bold text-white bg-orange-500 rounded-full shrink-0 shadow-sm">
                      {Math.min(conv.unreadCount, 99)}
                    </span>
                  )}
                </div>

                {/* Row 4: Source tags */}
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  {conv.fromAd && conv.adTitle && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 max-w-[130px] truncate">
                      {conv.adTitle}
                    </span>
                  )}
                  {conv.pageName && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium bg-blue-50/70 text-blue-600 border border-blue-100/50 max-w-[130px] truncate">
                      {conv.pageName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
