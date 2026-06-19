import { useEffect, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/axios'
import { Loader2, AlertCircle } from 'lucide-react'
import {
  fetchInboxMessages,
  sendInboxMessage,
  notifyInboxTyping,
  markInboxAsRead,
  type CskhInboxConversation,
  type CskhInboxMessage,
} from './api'
import { ChatMessage } from './ChatMessage'
import { ChatMessageInput } from './ChatMessageInput'
import { TypingIndicator } from './TypingIndicator'
import { cskhMediaProxySrc } from './messageMedia'
import { appendInboxMessagesToCache, patchInboxConversationInCache } from './inboxRealtimeCache'

type ChatPanelProps = {
  conversation: CskhInboxConversation
  isCustomerTyping?: boolean
  onClose?: () => void
  connected?: boolean
  draftText?: string
  onDraftApplied?: () => void
}

export function ChatPanel({
  conversation,
  isCustomerTyping,
  onClose,
  connected,
  draftText,
  onDraftApplied,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMessageIdRef = useRef<string>('')
  const typingTimeoutRef = useRef<any>(null)
  const qc = useQueryClient()

  // Fetch messages
  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['cskh', 'inbox', 'messages', conversation.id],
    queryFn: () => fetchInboxMessages(conversation.id),
    refetchInterval: connected ? 25000 : 4000, // Fast 4s fallback if SSE is disconnected
  })

  const messages = messagesData?.messages ?? []

  // Send message mutation
  const sendMut = useMutation({
    mutationFn: (text: string) => sendInboxMessage(conversation.id, text),
    onMutate: async (text) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await qc.cancelQueries({ queryKey: ['cskh', 'inbox', 'messages', conversation.id] })

      // Create a temporary optimistic message
      const tempId = `temp-${Date.now()}`
      const optimisticMessage: CskhInboxMessage = {
        id: tempId,
        conversationId: conversation.id,
        fbMessageId: null,
        direction: 'outbound',
        senderType: 'staff',
        text,
        messageType: 'text',
        attachmentUrl: null,
        sentAt: new Date().toISOString(),
        status: 'pending', // Will show loader spinner
      }

      // Save previous messages in case of error rollback
      const previousMessages = qc.getQueryData<{
        conversation: CskhInboxConversation
        messages: CskhInboxMessage[]
      }>(['cskh', 'inbox', 'messages', conversation.id])

      // Instantly append to cache
      appendInboxMessagesToCache(qc, conversation.id, undefined, [optimisticMessage])

      // Instantly update conversation previews
      patchInboxConversationInCache(qc, {
        id: conversation.id,
        lastMessage: text,
        lastMessageAt: optimisticMessage.sentAt,
        unreadCount: 0,
      })

      return { tempId, previousMessages }
    },
    onSuccess: (newMessage, text, context) => {
      if (newMessage && context?.tempId) {
        // Replace temp message with actual message from server
        qc.setQueryData<{ conversation: CskhInboxConversation; messages: CskhInboxMessage[] }>(
          ['cskh', 'inbox', 'messages', conversation.id],
          (prev) => {
            if (!prev) return prev
            return {
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === context.tempId ? { ...newMessage, status: 'sent' } : m
              ),
            }
          }
        )
        patchInboxConversationInCache(qc, {
          id: conversation.id,
          lastMessage: newMessage.text,
          lastMessageAt: newMessage.sentAt,
          unreadCount: 0,
        })
      }
    },
    onError: (error, text, context) => {
      toast.error(getApiErrorMessage(error) || 'Gửi tin thất bại')
      // Rollback to previous state
      if (context?.previousMessages) {
        qc.setQueryData(['cskh', 'inbox', 'messages', conversation.id], context.previousMessages)
      } else if (context?.tempId) {
        qc.setQueryData<{ conversation: CskhInboxConversation; messages: CskhInboxMessage[] }>(
          ['cskh', 'inbox', 'messages', conversation.id],
          (prev) => {
            if (!prev) return prev
            return {
              ...prev,
              messages: prev.messages.filter((m) => m.id !== context.tempId),
            }
          }
        )
      }
    },
  })

  // Typing notification
  const handleTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)

    void notifyInboxTyping(conversation.id).catch(() => {
      // Ignore errors from typing endpoint
    })

    typingTimeoutRef.current = setTimeout(() => {
      // Clear typing after 3 seconds
    }, 3000)
  }

  // Mark messages as read
  useEffect(() => {
    void markInboxAsRead(conversation.id).catch(() => {
      // Ignore errors
    })
  }, [conversation.id, messages.length])

  // Auto-scroll to bottom when new messages arrive or when typing starts
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
          })
        }, 0)
      }
    }

    scrollToBottom()
    lastMessageIdRef.current = messages[messages.length - 1]?.id ?? ''
  }, [messages, isCustomerTyping])

  const displayMessages = useMemo(() => {
    return messages
      .filter((m) => m.text || m.attachmentUrl || m.messageType)
      .map((m) => ({
        ...m,
        isOwn: m.senderType === 'staff',
      }))
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-3">
          {conversation.customerPictureUrl && (
            <img
              src={cskhMediaProxySrc(conversation.customerPictureUrl)}
              alt={conversation.customerName || 'Customer'}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              {conversation.customerName ||
                `Khách hàng ${conversation.participantPsid.slice(0, 8)}`}
            </h3>
            <p className="text-xs text-gray-500">Cuộc trò chuyện Facebook</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Đóng"
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-white"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">Không có tin nhắn nào</p>
          </div>
        ) : (
          <>
            {displayMessages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} isOwn={msg.isOwn} />
            ))}
            {isCustomerTyping && <TypingIndicator />}
          </>
        )}
      </div>

      {/* Input Area */}
      <ChatMessageInput
        onSend={(text) => { sendMut.mutate(text) }}
        onTyping={handleTyping}
        disabled={sendMut.isPending}
        draftText={draftText}
        onDraftApplied={onDraftApplied}
      />
    </div>
  )
}
