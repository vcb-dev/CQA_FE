import * as React from 'react'
import { Check, ChevronDown, Loader2, Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type ComboboxOption = {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

type ComboboxProps = {
  id?: string
  value: string | null | undefined
  onChange: (value: string, option: ComboboxOption) => void
  options: ComboboxOption[]
  selectedLabel?: string | null
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  loading?: boolean
  disabled?: boolean
  invalid?: boolean
  searchable?: boolean
  onSearchChange?: (query: string) => void
  className?: string
}

export function foldVietnamese(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

export function Combobox({
  id,
  value,
  onChange,
  options,
  selectedLabel,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm kiếm...',
  emptyText = 'Không có dữ liệu',
  loading = false,
  disabled = false,
  invalid = false,
  searchable = true,
  onSearchChange,
  className,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const [active, setActive] = React.useState(0)
  const listRef = React.useRef<HTMLDivElement>(null)

  const filtered = React.useMemo(() => {
    const q = foldVietnamese(query.trim())
    if (onSearchChange || !q) return options
    return options.filter((o) => foldVietnamese(`${o.label} ${o.description ?? ''}`).includes(q))
  }, [options, query, onSearchChange])

  const selected = options.find((o) => o.value === value)
  const display = selected?.label ?? selectedLabel ?? ''

  React.useEffect(() => {
    if (!open) return
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      setActive(Math.max(0, options.findIndex((o) => o.value === value)))
      return
    }
    setQuery('')
    onSearchChange?.('')
  }

  const pick = (option: ComboboxOption) => {
    if (option.disabled) return
    onChange(option.value, option)
    handleOpenChange(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const option = filtered[active]
      if (option) pick(option)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className={cn(
            'flex h-9 w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 text-left text-[13px] transition-colors',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400',
            invalid
              ? 'border-rose-400'
              : 'border-slate-200 hover:border-slate-300 data-[state=open]:border-indigo-400',
            className,
          )}
        >
          <span className={cn('min-w-0 flex-1 truncate', display ? 'text-slate-800' : 'text-slate-400')}>
            {display || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[220px] p-0"
        onOpenAutoFocus={(e) => {
          if (!searchable) e.preventDefault()
        }}
        onKeyDown={searchable ? undefined : handleKeyDown}
      >
        {searchable ? (
          <div className="flex items-center gap-2 border-b border-slate-100 px-3">
            <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
                onSearchChange?.(e.target.value)
              }}
              onKeyDown={handleKeyDown}
              placeholder={searchPlaceholder}
              className="h-9 w-full bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
            />
            {loading ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-slate-400" /> : null}
          </div>
        ) : null}
        <div ref={listRef} role="listbox" className="max-h-64 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-[12px] text-slate-400">
              {loading ? 'Đang tải...' : emptyText}
            </p>
          ) : (
            filtered.map((option, index) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                data-index={index}
                disabled={option.disabled}
                onMouseEnter={() => setActive(index)}
                onClick={() => pick(option)}
                className={cn(
                  'flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left text-[13px]',
                  index === active ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700',
                  option.disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                <Check
                  className={cn(
                    'mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600',
                    option.value === value ? 'opacity-100' : 'opacity-0',
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{option.label}</span>
                  {option.description ? (
                    <span className="block truncate text-[11px] text-slate-400">{option.description}</span>
                  ) : null}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
