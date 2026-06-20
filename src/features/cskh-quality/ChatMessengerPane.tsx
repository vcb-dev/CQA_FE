import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, RefreshCw, Search, MessageCircle, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  fetchCskhPages,
  syncInboxFromGraph,
  markInboxAsRead,
  fetchCustomerIntent,
  type CskhInboxConversation
} from './api'
import { ChatListPanel } from './ChatListPanel'
import { ChatPanel } from './ChatPanel'
import { ChatRightSidebar } from './ChatRightSidebar'
import { useCskhInboxStream } from './useCskhInboxStream'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/custom-ui/select'

type ChatMessengerPaneProps = {
  pageId?: string
}

export function ChatMessengerPane({ pageId }: ChatMessengerPaneProps) {
  const [selectedConversation, setSelectedConversation] = useState<CskhInboxConversation | null>(
    null
  )
  const qc = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(pageId)

  // Sync selectedPageId when pageId prop changes
  useEffect(() => {
    setSelectedPageId(pageId)
  }, [pageId])

  // Reset selected conversation if it doesn't belong to the selected page
  useEffect(() => {
    if (selectedPageId && selectedConversation && selectedConversation.pageId !== selectedPageId) {
      setSelectedConversation(null)
    }
  }, [selectedPageId, selectedConversation])

  // Enable real-time SSE stream
  const { connected, typingConversationIds } = useCskhInboxStream({
    enabled: true,
    activeConversationId: selectedConversation?.id ?? null,
  })

  // Fetch Facebook pages
  const { data: pagesData } = useQuery({
    queryKey: ['cskh', 'pages'],
    queryFn: fetchCskhPages,
  })

  // Manual sync mutation
  const syncMut = useMutation({
    mutationFn: () => syncInboxFromGraph(selectedPageId),
    onSuccess: (result) => {
      void qc.invalidateQueries({ queryKey: ['cskh', 'inbox', 'conversations'] })
      toast.success(`Đã đồng bộ ${result.synced} tin nhắn từ ${result.pageCount} kênh`)
    },
    onError: () => {
      toast.error('Đồng bộ thất bại, vui lòng thử lại')
    },
  })

  const allPages = useMemo(() => {
    return pagesData?.pages ?? []
  }, [pagesData])

  const [inputDraft, setInputDraft] = useState<string>('')

  // Fetch AI customer intent
  const { data: intent, isLoading: isLoadingIntent } = useQuery({
    queryKey: ['cskh', 'inbox', 'intent', selectedConversation?.id],
    queryFn: () => selectedConversation ? fetchCustomerIntent(selectedConversation.id) : null,
    enabled: !!selectedConversation,
  })

  const handleSelectConversation = (conv: CskhInboxConversation) => {
    setSelectedConversation(conv)
    setInputDraft('') // Clear draft when switching conversations
    if (conv.unreadCount > 0) {
      // Optimistically update the list query cache to clear unread badge immediately
      qc.setQueryData<CskhInboxConversation[]>(
        ['cskh', 'inbox', 'conversations', selectedPageId],
        (prev) => {
          if (!prev) return prev
          return prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
        }
      )
      // Call mark-as-read API in background
      markInboxAsRead(conv.id).catch((err: any) => {
        console.error('Failed to mark conversation as read:', err)
      })
    }
  }

  return (
    <div className="flex h-full bg-slate-50/30">
      {/* Conversations List - Left Sidebar */}
      <div
        className={`${
          selectedConversation && window.innerWidth < 768 ? 'hidden' : 'flex'
        } w-full md:w-[320px] lg:w-[340px] flex-col bg-white border-r border-slate-200/80`}
      >
        {/* Sidebar Header - Title + Description */}
        <div className="p-4 pb-3">
          {/* Title row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-200/60">
                <MessageCircle className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-[15px] font-bold text-slate-800 tracking-tight">Hội thoại</h2>
                  <span
                    className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      connected 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'bg-red-50 text-red-500 animate-pulse'
                    }`}
                    title={connected ? 'Real-time đang kết nối' : 'Mất kết nối...'}
                  >
                    {connected ? (
                      <><Wifi className="w-2.5 h-2.5" /> Live</>
                    ) : (
                      <><WifiOff className="w-2.5 h-2.5" /> Offline</>
                    )}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 font-medium mt-0.5">
                  Hộp thư hỗ trợ chat real-time 1-1
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => syncMut.mutate()}
              disabled={syncMut.isPending}
              title="Đồng bộ hội thoại từ Facebook"
              className="h-8 w-8 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${syncMut.isPending ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Search bar */}
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm hội thoại..."
              className="w-full h-9 pl-9 pr-3 text-xs text-slate-700 bg-slate-50/80 border border-slate-200/60 rounded-xl outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Channel filter */}
          <div className="mt-2.5">
            <Select
              value={selectedPageId ?? 'all'}
              onValueChange={(val: string) => setSelectedPageId(val === 'all' ? undefined : val)}
            >
              <SelectTrigger
                className="w-full h-9 text-xs rounded-xl border-slate-200/60 bg-slate-50/80 hover:bg-white transition-all duration-200 [&>span]:line-clamp-1 [&>span]:truncate"
                aria-label="Chọn kênh Facebook"
              >
                <SelectValue placeholder="Tất cả kênh" />
              </SelectTrigger>
              <SelectContent className="max-h-72 bg-white rounded-xl">
                <SelectItem value="all">Tất cả kênh</SelectItem>
                {allPages.map((page) => (
                  <SelectItem key={page.pageId} value={page.pageId}>
                    {page.pageName || `Kênh ${page.pageId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Conversations list */}
        <ChatListPanel
          selectedConversationId={selectedConversation?.id}
          onSelect={handleSelectConversation}
          pageId={selectedPageId}
          typingConversationIds={typingConversationIds}
          connected={connected}
          searchQuery={searchQuery}
        />
      </div>

      {/* Chat Area - Main */}
      {selectedConversation ? (
        <div className="flex-1 flex min-w-0 bg-white">
          {/* Middle Chat Panel */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile back button */}
            <div className="md:hidden p-3 border-b border-slate-100 flex items-center gap-2 bg-white">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConversation(null)}
                className="gap-2 text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatPanel
                conversation={selectedConversation}
                isCustomerTyping={typingConversationIds.has(selectedConversation.id)}
                onClose={() => setSelectedConversation(null)}
                connected={connected}
                draftText={inputDraft}
                onDraftApplied={() => setInputDraft('')}
              />
            </div>
          </div>

          {/* Right Sidebar - Customer Info & AI Suggestions */}
          <div className="hidden lg:block shrink-0">
            <ChatRightSidebar
              conversation={selectedConversation}
              intent={intent}
              isLoadingIntent={isLoadingIntent}
              onApplySuggestedReply={(text) => setInputDraft(text)}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30">
          <div className="text-center max-w-sm">
            <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 mb-5">
              <MessageCircle className="w-9 h-9 text-indigo-500" strokeWidth={1.5} />
            </div>
            <p className="text-lg font-bold text-slate-700 tracking-tight">
              Chọn một hội thoại để bắt đầu
            </p>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              Nhấp vào một cuộc trò chuyện từ danh sách bên trái để xem và trả lời tin nhắn
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
