import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, RefreshCw, Search, MessageCircle, Wifi, WifiOff, SlidersHorizontal, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  fetchCskhPages,
  syncInboxFromGraph,
  markInboxAsRead,
  fetchCustomerIntent,
  fetchInboxConversations,
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

type FilterTab = 'all' | 'unread' | 'ads' | 'normal'

export function ChatMessengerPane({ pageId }: ChatMessengerPaneProps) {
  const [selectedConversation, setSelectedConversation] = useState<CskhInboxConversation | null>(null)
  const qc = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all')
  const [selectedPageId, setSelectedPageId] = useState<string | undefined>(pageId)

  useEffect(() => {
    setSelectedPageId(pageId)
  }, [pageId])

  useEffect(() => {
    if (selectedPageId && selectedConversation && selectedConversation.pageId !== selectedPageId) {
      setSelectedConversation(null)
    }
  }, [selectedPageId, selectedConversation])

  const { connected, typingConversationIds } = useCskhInboxStream({
    enabled: true,
    activeConversationId: selectedConversation?.id ?? null,
  })

  const { data: pagesData } = useQuery({
    queryKey: ['cskh', 'pages'],
    queryFn: fetchCskhPages,
  })

  // Fetch all conversations for counting stats
  const { data: allConversations } = useQuery({
    queryKey: ['cskh', 'inbox', 'conversations', selectedPageId],
    queryFn: () => fetchInboxConversations(selectedPageId),
    refetchInterval: connected ? false : 5000,
  })

  // Compute filter counts
  const filterCounts = useMemo(() => {
    const convs = allConversations ?? []
    return {
      all: convs.length,
      unread: convs.filter(c => c.unreadCount > 0).length,
      ads: convs.filter(c => c.fromAd).length,
      normal: convs.filter(c => !c.fromAd).length,
    }
  }, [allConversations])

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

  const { data: intent, isLoading: isLoadingIntent } = useQuery({
    queryKey: ['cskh', 'inbox', 'intent', selectedConversation?.id],
    queryFn: ({ signal }) => selectedConversation ? fetchCustomerIntent(selectedConversation.id, undefined, signal) : null,
    enabled: !!selectedConversation,
  })

  const handleSelectConversation = (conv: CskhInboxConversation) => {
    setSelectedConversation(conv)
    setInputDraft('')
    if (conv.unreadCount > 0) {
      qc.setQueryData<CskhInboxConversation[]>(
        ['cskh', 'inbox', 'conversations', selectedPageId],
        (prev) => {
          if (!prev) return prev
          return prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
        }
      )
      markInboxAsRead(conv.id).catch((err: any) => {
        console.error('Failed to mark conversation as read:', err)
      })
    }
  }

  const filterTabs: { key: FilterTab; label: string; color: string; activeColor: string }[] = [
    { key: 'all', label: 'Tất cả', color: 'text-slate-500', activeColor: 'text-blue-600 border-blue-600' },
    { key: 'unread', label: 'Chưa đọc', color: 'text-slate-500', activeColor: 'text-orange-600 border-orange-500' },
    { key: 'ads', label: 'Quảng cáo', color: 'text-slate-500', activeColor: 'text-purple-600 border-purple-500' },
    { key: 'normal', label: 'Tin thường', color: 'text-slate-500', activeColor: 'text-emerald-600 border-emerald-500' },
  ]

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Top Filter Bar */}
      <div className="flex items-center justify-between px-4 h-[46px] border-b border-slate-100 bg-gradient-to-r from-white to-slate-50/50 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Inbox className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[13px] font-bold text-slate-800 leading-none">Hộp thư đa kênh thông minh</h2>
              <p className="text-[9.5px] text-slate-400 font-medium mt-0.5">AI-Powered Smart Omni-channel Inbox</p>
            </div>
          </div>
          {/* Connection status */}
          <span
            className={`flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ml-1 ${
              connected
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-500 animate-pulse'
            }`}
          >
            {connected ? <><Wifi className="w-2.5 h-2.5" /> Live</> : <><WifiOff className="w-2.5 h-2.5" /> Offline</>}
          </span>
        </div>

        {/* Right side filters */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Trang:</span>
            <Select
              value={selectedPageId ?? 'all'}
              onValueChange={(val: string) => setSelectedPageId(val === 'all' ? undefined : val)}
            >
              <SelectTrigger className="h-7 min-w-[140px] text-[11px] rounded-lg border-slate-200 bg-slate-50/80 px-2 [&>span]:line-clamp-1 [&>span]:truncate">
                <SelectValue placeholder="Tất cả Page" />
              </SelectTrigger>
              <SelectContent className="max-h-72 bg-white rounded-lg">
                <SelectItem value="all">Tất cả Page ({allPages.length})</SelectItem>
                {allPages.map((page) => (
                  <SelectItem key={page.pageId} value={page.pageId}>
                    {page.pageName || `Kênh ${page.pageId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => syncMut.mutate()}
            disabled={syncMut.isPending}
            title="Đồng bộ hội thoại"
            className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncMut.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar - Conversation List */}
        <div
          className={`${
            selectedConversation && window.innerWidth < 768 ? 'hidden' : 'flex'
          } w-full md:w-[300px] lg:w-[320px] flex-col bg-white border-r border-slate-100 shrink-0`}
        >
          {/* Stats Filter Tabs */}
          <div className="flex gap-1 p-1.5 bg-slate-50/40 border-b border-slate-100 shrink-0">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex-1 flex flex-col items-center py-1.5 px-0.5 rounded-xl transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? 'bg-white text-slate-800 shadow-sm border-slate-200/40'
                      : 'border-transparent text-slate-500 hover:bg-slate-100/50 hover:text-slate-700'
                  }`}
                >
                  <span className={`text-[13px] font-extrabold leading-none ${
                    isActive ? tab.activeColor.split(' ')[0] : 'text-slate-600'
                  }`}>
                    {filterCounts[tab.key].toLocaleString()}
                  </span>
                  <span className="text-[9.5px] font-semibold mt-1 tracking-tight text-slate-400">
                    {tab.label}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search & Filter */}
          <div className="px-3 py-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm hội thoại..."
                  className="w-full h-8 pl-8 pr-3 text-[11px] text-slate-700 bg-slate-50/80 border border-slate-200/60 rounded-lg outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
                />
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/60 bg-slate-50/80 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200 shrink-0 cursor-pointer">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Ads quick filter chip */}
            {activeFilter === 'ads' && filterCounts.ads > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 border border-purple-100 text-[10px] font-semibold text-purple-700">
                  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M4.5 2A2.5 2.5 0 002 4.5v7A2.5 2.5 0 004.5 14h7a2.5 2.5 0 002.5-2.5v-7A2.5 2.5 0 0011.5 2h-7zM5 5.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm0 2.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5A.5.5 0 015 8zm0 2.5a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5z"/></svg>
                  Ads
                </span>
                <span className="text-[10px] text-slate-400">
                  {filterCounts.ads}/{filterCounts.all} tin nhắn
                </span>
              </div>
            )}
          </div>

          {/* Mobile page selector */}
          <div className="px-3 py-2 border-b border-slate-100 md:hidden">
            <Select
              value={selectedPageId ?? 'all'}
              onValueChange={(val: string) => setSelectedPageId(val === 'all' ? undefined : val)}
            >
              <SelectTrigger className="w-full h-8 text-[11px] rounded-lg border-slate-200/60 [&>span]:line-clamp-1 [&>span]:truncate">
                <SelectValue placeholder="Tất cả kênh" />
              </SelectTrigger>
              <SelectContent className="max-h-72 bg-white rounded-lg">
                <SelectItem value="all">Tất cả kênh</SelectItem>
                {allPages.map((page) => (
                  <SelectItem key={page.pageId} value={page.pageId}>
                    {page.pageName || `Kênh ${page.pageId}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conversations List */}
          <ChatListPanel
            selectedConversationId={selectedConversation?.id}
            onSelect={handleSelectConversation}
            pageId={selectedPageId}
            typingConversationIds={typingConversationIds}
            connected={connected}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
          />
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div className="flex-1 flex min-w-0 bg-white">
            <div className="flex-1 flex flex-col min-w-0">
              {/* Mobile back button */}
              <div className="md:hidden p-2.5 border-b border-slate-100 flex items-center gap-2 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedConversation(null)}
                  className="gap-2 text-slate-600 hover:text-slate-800 h-8"
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

            {/* Right Sidebar */}
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
          <div className="flex-1 hidden md:flex items-center justify-center bg-gradient-to-br from-slate-50/80 to-indigo-50/20">
            <div className="text-center max-w-xs">
              <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-100 mb-5">
                <MessageCircle className="w-9 h-9 text-indigo-400" strokeWidth={1.5} />
              </div>
              <p className="text-base font-bold text-slate-600 tracking-tight">
                Chọn một hội thoại để bắt đầu
              </p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Nhấp vào một cuộc trò chuyện từ danh sách bên trái để xem và trả lời tin nhắn
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
