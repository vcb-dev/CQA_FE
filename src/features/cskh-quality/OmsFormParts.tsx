import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const omsInputClass =
  'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 placeholder:text-slate-400 transition-colors hover:border-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50'

export function isValidVnPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return false
  const local = digits.startsWith('84') && digits.length >= 11 ? `0${digits.slice(2)}` : digits.startsWith('0') ? digits : `0${digits}`
  return local.length >= 10 && local.length <= 11
}

export function formatMoney(n: number): string {
  return `${Math.round(n).toLocaleString('vi-VN')}đ`
}

export function OmsSection({
  title,
  required,
  action,
  children,
  className,
}: {
  title: string
  required?: boolean
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white', className)}>
      <header className="flex min-h-11 items-center justify-between gap-2 border-b border-slate-100 px-4 py-2">
        <h3 className="text-[13px] font-semibold text-slate-800">
          {title}
          {required ? <span className="text-rose-500"> *</span> : null}
        </h3>
        {action}
      </header>
      <div className="space-y-3 p-4">{children}</div>
    </section>
  )
}

export function OmsField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string | null
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-[12px] font-medium text-slate-600">
        {required ? <span className="text-rose-500">* </span> : null}
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[11px] text-rose-600">{error}</p>
      ) : hint ? (
        <p className="text-[11px] leading-relaxed text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}

export function OmsInlineField({
  label,
  htmlFor,
  required,
  error,
  hint,
  alignTop,
  children,
}: {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string | null
  hint?: ReactNode
  alignTop?: boolean
  children: ReactNode
}) {
  return (
    <div className="grid grid-cols-[84px_minmax(0,1fr)] gap-x-3">
      <label
        htmlFor={htmlFor}
        className={cn('text-[12px] font-medium text-slate-600', alignTop ? 'pt-2' : 'self-center')}
      >
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>
      <div className="min-w-0">{children}</div>
      {error ? (
        <p className="col-start-2 mt-1 text-[11px] text-rose-600">{error}</p>
      ) : hint ? (
        <p className="col-start-2 mt-1 text-[11px] leading-snug text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

export function OmsMoneyInput({
  id,
  value,
  onChange,
  placeholder = '0',
  className,
}: {
  id?: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
}) {
  return (
    <input
      id={id}
      inputMode="numeric"
      value={value ? value.toLocaleString('vi-VN') : ''}
      onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
      placeholder={placeholder}
      className={cn(omsInputClass, 'text-right tabular-nums', className)}
    />
  )
}

export function OmsSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-left transition-colors hover:bg-slate-100"
    >
      <span
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors',
          checked ? 'bg-indigo-600' : 'bg-slate-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-slate-800">{label}</span>
        {description ? <span className="block text-[11px] text-slate-500">{description}</span> : null}
      </span>
    </button>
  )
}
