import { Filter } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { CskhInboxLabel } from './api'

export type InboxLabelFilterValue = 'all' | 'unlabeled' | string

type InboxLabelFilterPopoverProps = {
  value: InboxLabelFilterValue
  onChange: (value: InboxLabelFilterValue) => void
  statusLabels: CskhInboxLabel[]
  staffLabels: CskhInboxLabel[]
}

function labelSummary(
  value: InboxLabelFilterValue,
  statusLabels: CskhInboxLabel[],
  staffLabels: CskhInboxLabel[],
): string {
  if (value === 'all') return 'Mọi nhãn'
  if (value === 'unlabeled') return 'Chưa gán nhãn'
  const found = [...statusLabels, ...staffLabels].find((l) => l.id === value)
  return found?.name ?? 'Nhãn'
}

export function InboxLabelFilterPopover({
  value,
  onChange,
  statusLabels,
  staffLabels,
}: InboxLabelFilterPopoverProps) {
  const active = value !== 'all'
  const summary = labelSummary(value, statusLabels, staffLabels)

  const renderOption = (optionValue: InboxLabelFilterValue, label: string, color?: string) => {
    const selected = value === optionValue
    return (
      <button
        key={optionValue}
        type="button"
        onClick={() => onChange(selected && optionValue !== 'all' ? 'all' : optionValue)}
        className={cn(
          'w-full text-left px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer',
          selected ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/80' : 'hover:bg-slate-50 text-slate-700',
        )}
      >
        <span className="inline-flex items-center gap-2">
          {color ? (
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
          ) : null}
          {label}
        </span>
      </button>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Lọc theo nhãn"
          className={cn(
            'relative shrink-0 h-8 w-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer',
            active
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700',
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          {active && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 border border-white" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <p className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
          Lọc nhãn
        </p>
        <div className="space-y-0.5">
          {renderOption('all', 'Mọi nhãn')}
          {renderOption('unlabeled', 'Chưa gán nhãn', '#f59e0b')}
        </div>
        {statusLabels.length > 0 && (
          <>
            <p className="px-2 pt-2 pb-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Trạng thái
            </p>
            <div className="space-y-0.5">
              {statusLabels.map((l) => renderOption(l.id, l.name, l.color))}
            </div>
          </>
        )}
        {staffLabels.length > 0 && (
          <>
            <p className="px-2 pt-2 pb-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
              Nhân viên chốt
            </p>
            <div className="space-y-0.5 max-h-40 overflow-y-auto">
              {staffLabels.map((l) => renderOption(l.id, l.name, l.color))}
            </div>
          </>
        )}
        {active && (
          <p className="mt-2 px-2 text-[10px] text-indigo-600 font-medium truncate" title={summary}>
            Đang lọc: {summary}
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}
