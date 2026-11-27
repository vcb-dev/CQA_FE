import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { History, Loader2, Tag, X } from 'lucide-react'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/axios'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  fetchInboxCloserLabels,
  fetchInboxLabelHistory,
  fetchInboxLabels,
  toggleInboxConversationLabel,
  type CskhInboxConversation,
  type CskhInboxLabel,
  type CskhInboxLabelLog,
  type CskhInboxMessage,
} from './api'
import { patchInboxConversationInCache } from './inboxRealtimeCache'
import { invalidateInboxViewHistory } from './ConversationViewHistory'

type ChatLabelBarProps = {
  conversation: CskhInboxConversation
  readOnly?: boolean
}

const labelHistoryKey = (conversationId: string) =>
  ['cskh', 'inbox', 'label-history', conversationId] as const

function LabelChip({
  label,
  active,
  disabled,
  removable,
  onClick,
}: {
  label: CskhInboxLabel
  active: boolean
  disabled?: boolean
  removable?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={active ? `Bấm để gỡ nhãn "${label.name}"` : `Gắn nhãn "${label.name}"`}
      className={cn(
        'shrink-0 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
        active ? 'text-white shadow-sm hover:brightness-110' : 'bg-white hover:brightness-95',
      )}
      style={
        active
          ? { backgroundColor: label.color, borderColor: label.color }
          : { color: label.color, borderColor: `${label.color}55` }
      }
    >
      {label.name}
      {active && removable && <X className="w-2.5 h-2.5 -mr-0.5" strokeWidth={3} />}
    </button>
  )
}

function formatLogTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function LabelLogRow({ log }: { log: CskhInboxLabelLog }) {
  const removed = log.action === 'remove'
  return (
    <li className="flex items-start gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-50">
      <span
        className={cn(
          'mt-1.5 w-1.5 h-1.5 rounded-full shrink-0',
          removed ? 'bg-rose-400' : 'bg-emerald-500',
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] text-slate-600 leading-snug">
          <span className="font-semibold text-slate-800">{log.actorName ?? 'Không rõ'}</span>{' '}
          {removed ? 'gỡ' : 'gắn'} {log.labelType === 'staff' ? 'NV chốt' : 'nhãn'}{' '}
          <span className={cn('font-semibold', removed ? 'text-slate-400 line-through' : 'text-slate-800')}>
            {log.labelName}
          </span>
        </p>
        <p className="text-[10px] text-slate-400">{formatLogTime(log.createdAt)}</p>
      </div>
    </li>
  )
}

function LabelHistoryButton({ conversationId }: { conversationId: string }) {
  const [open, setOpen] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: labelHistoryKey(conversationId),
    queryFn: () => fetchInboxLabelHistory(conversationId),
    enabled: open,
    staleTime: 30_000,
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Lịch sử gắn / gỡ nhãn"
          className={cn(
            'ml-auto inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-slate-400',
            'hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer',
            open && 'text-indigo-600 bg-indigo-50',
          )}
        >
          <History className="w-3 h-3" />
          Lịch sử
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-80 p-0 overflow-hidden bg-white border-slate-200 z-[250]">
        <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/80">
          <p className="text-[12px] font-bold text-slate-800">Lịch sử gắn nhãn</p>
          <p className="text-[10px] text-slate-500">Ai đã gắn / gỡ nhãn trạng thái và nhân viên chốt</p>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-1.5">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[11px]">Đang tải...</span>
            </div>
          ) : !data?.length ? (
            <p className="py-8 px-4 text-center text-[11px] text-slate-500">Chưa có thao tác nhãn nào</p>
          ) : (
            <ul className="space-y-0.5">
              {data.map((log) => (
                <LabelLogRow key={log.id} log={log} />
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function ChatLabelBar({ conversation, readOnly = false }: ChatLabelBarProps) {
  const qc = useQueryClient()

  const { data: allLabels, isLoading } = useQuery<CskhInboxLabel[]>({
    queryKey: ['cskh', 'inbox', 'labels'],
    queryFn: fetchInboxLabels,
    staleTime: 120_000,
  })

  const activeIds = useMemo(
    () => new Set((conversation.labels ?? []).map((l) => l.id)),
    [conversation.labels],
  )

  const statusLabels = useMemo(
    () => (allLabels ?? []).filter((l) => l.type === 'status'),
    [allLabels],
  )
  const labelsLocked = conversation.labelsLocked ?? (conversation.labels?.length ?? 0) > 0
  const hasDaChot = useMemo(
    () => (conversation.labels ?? []).some((l) => l.type === 'status' && l.name === 'Đã chốt'),
    [conversation.labels],
  )
  const assignedStaff = useMemo(
    () => conversation.labels?.find((l) => l.type === 'staff'),
    [conversation.labels],
  )

  const pageId = conversation.pageId
  const { data: closerLabels, isLoading: closersLoading } = useQuery<CskhInboxLabel[]>({
    queryKey: ['cskh', 'inbox', 'labels', 'closers', pageId],
    queryFn: () => fetchInboxCloserLabels(pageId),
    enabled: !!pageId && !hasDaChot,
    staleTime: 120_000,
  })

  const staffLabels = useMemo(() => {
    const list = closerLabels ?? []
    if (!assignedStaff || list.some((l) => l.id === assignedStaff.id)) return list
    return [assignedStaff, ...list]
  }, [closerLabels, assignedStaff])

  const writeLabels = (labels: CskhInboxLabel[], awaitingLabel?: boolean) => {
    const patch: Partial<CskhInboxConversation> = {
      labels,
      labelsLocked: labels.length > 0,
      unreadCount: 0,
      ...(awaitingLabel !== undefined
        ? { awaitingLabel }
        : labels.length > 0
          ? { awaitingLabel: false }
          : {}),
    }
    patchInboxConversationInCache(qc, { id: conversation.id, ...patch })
    qc.setQueryData<{ conversation: CskhInboxConversation; messages: CskhInboxMessage[] }>(
      ['cskh', 'inbox', 'messages', conversation.id],
      (prev) => (prev ? { ...prev, conversation: { ...prev.conversation, ...patch } } : prev),
    )
  }

  const toggleMut = useMutation({
    mutationFn: (labelId: string) => toggleInboxConversationLabel(conversation.id, labelId),
    onMutate: (labelId) => {
      const prevLabels = conversation.labels ?? []
      const rollback = { prevLabels, prevAwaiting: conversation.awaitingLabel }
      const picked = [...statusLabels, ...staffLabels].find((l) => l.id === labelId)
      if (!picked) return rollback
      const nextLabels = prevLabels.some((l) => l.id === labelId)
        ? prevLabels.filter((l) => l.id !== labelId)
        : [...prevLabels.filter((l) => picked.type !== 'staff' || l.type !== 'staff'), picked]
      writeLabels(nextLabels)
      return rollback
    },
    onSuccess: (labels) => {
      writeLabels(labels)
      invalidateInboxViewHistory(qc, conversation.id)
      void qc.invalidateQueries({ queryKey: labelHistoryKey(conversation.id) })
    },
    onError: (error, _labelId, rollback) => {
      if (rollback) writeLabels(rollback.prevLabels, rollback.prevAwaiting)
      toast.error(getApiErrorMessage(error) || 'Không thể cập nhật nhãn')
    },
  })

  if (isLoading && (allLabels ?? []).length === 0) {
    return (
      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/60 flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
        <span className="text-[10px] text-slate-400">Đang tải nhãn...</span>
      </div>
    )
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50/60 shrink-0">
      {!labelsLocked && conversation.awaitingLabel && (
        <div className="px-3 pt-2 pb-1">
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-2 py-1">
            Đã xem tin nhưng chưa gán nhãn — hội thoại vẫn hiện dấu <strong>!</strong> cho đến khi gán nhãn (shop đã trả lời thì không còn chấm cam chưa đọc).
          </p>
        </div>
      )}
      <div className="px-3 pt-2 pb-1 flex items-center gap-1.5">
        <Tag className="w-3 h-3 text-slate-400 shrink-0" />
        <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">
          Nhãn trạng thái
        </span>
        <LabelHistoryButton conversationId={conversation.id} />
      </div>
      <div className="px-3 pb-1.5 flex gap-1 overflow-x-auto scrollbar-thin">
        {statusLabels.map((label) => (
          <LabelChip
            key={label.id}
            label={label}
            active={activeIds.has(label.id)}
            removable={!readOnly}
            disabled={readOnly || toggleMut.isPending}
            onClick={() => toggleMut.mutate(label.id)}
          />
        ))}
      </div>

      {!hasDaChot && (
        <>
          <div className="px-3 pt-1 pb-2 flex items-center gap-1.5">
            <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wide pl-4">
              Nhân viên chốt
            </span>
          </div>
          <div className="px-3 pb-2.5 flex gap-1 overflow-x-auto scrollbar-thin max-h-[52px] flex-wrap content-start">
            {closersLoading && staffLabels.length === 0 && (
              <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
            )}
            {!closersLoading && staffLabels.length === 0 && (
              <span className="text-[10px] text-slate-400">
                Chưa có nhân viên sale được phân kênh này
              </span>
            )}
            {staffLabels.map((label) => (
              <LabelChip
                key={label.id}
                label={label}
                active={activeIds.has(label.id)}
                removable={!readOnly}
                disabled={readOnly || toggleMut.isPending}
                onClick={() => toggleMut.mutate(label.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** Ẩn nhãn NV chốt trên list/header khi hội thoại đã gán "Đã chốt". */
export function labelsForConversationDisplay(labels?: CskhInboxLabel[]): CskhInboxLabel[] {
  if (!labels?.length) return []
  const daChot = labels.some((l) => l.type === 'status' && l.name === 'Đã chốt')
  if (!daChot) return labels
  return labels.filter((l) => l.type !== 'staff')
}

export function ConversationLabelBadges({
  labels,
  max = 3,
  className,
}: {
  labels?: CskhInboxLabel[]
  max?: number
  className?: string
}) {
  const display = labelsForConversationDisplay(labels)
  if (!display.length) return null
  const shown = display.slice(0, max)
  const rest = display.length - shown.length

  return (
    <div className={cn('flex items-center gap-0.5 flex-wrap', className)}>
      {shown.map((label) => (
        <span
          key={label.id}
          className="inline-flex px-1 py-0.5 rounded text-[8px] font-bold text-white leading-none max-w-[72px] truncate"
          style={{ backgroundColor: label.color }}
          title={label.name}
        >
          {label.name}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-[8px] text-slate-400 font-medium">+{rest}</span>
      )}
    </div>
  )
}
