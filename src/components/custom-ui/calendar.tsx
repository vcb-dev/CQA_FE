import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      data-slot="daypicker"
      showOutsideDays={showOutsideDays}
      className={cn(
        'rounded-[2rem] bg-card p-4 shadow-2xl border border-slate-100 dark:border-slate-800 animate-calendar-pop',
        className
      )}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'space-y-6 relative',
        month_caption:
          'flex justify-center pt-4 relative items-center pb-4 px-4 border-b border-slate-50 dark:border-slate-800',
        dropdowns:
          'flex w-full items-center justify-center gap-3 text-sm font-bold uppercase tracking-wider',
        dropdown_root:
          'calendar-caption-dropdown relative flex h-9 min-h-9 w-auto min-w-[95px] items-center justify-center rounded-xl border px-3 transition-all duration-300 hover:shadow-md',
        dropdown: 'absolute inset-0 z-[1] h-full w-full cursor-pointer opacity-0',
        caption_label:
          'inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-primary dark:text-foreground',
        chevron: 'size-4 shrink-0 text-primary opacity-90',
        nav: 'flex items-center justify-between absolute w-full top-3.5 left-0 px-3 z-10 pointer-events-none',
        button_previous:
          'h-8 w-8 bg-slate-50 dark:bg-slate-900/50 p-0 opacity-70 hover:bg-primary hover:text-white hover:opacity-100 inline-flex items-center justify-center rounded-xl transition-all duration-300 pointer-events-auto shadow-sm',
        button_next:
          'h-8 w-8 bg-slate-50 dark:bg-slate-900/50 p-0 opacity-70 hover:bg-primary hover:text-white hover:opacity-100 inline-flex items-center justify-center rounded-xl transition-all duration-300 pointer-events-auto shadow-sm',
        month_grid: 'w-full border-collapse',
        week: 'flex w-full mt-2',
        weekdays: 'flex',
        weekday:
          'text-slate-400 h-10 w-10 p-0 text-center align-middle text-xs font-black uppercase tracking-widest',
        day: 'group/day relative h-11 w-11 p-0 text-center align-middle text-sm font-medium',
        day_button:
          'rdp-day_button box-border inline-flex h-10 min-h-10 w-10 min-w-10 items-center justify-center align-middle rounded-xl border-2 border-transparent p-0 text-sm font-bold transition-all duration-300 hover:shadow-md active:scale-95',
        outside: 'text-slate-300 dark:text-slate-600 opacity-50',
        disabled:
          'rdp-disabled opacity-40 cursor-not-allowed pointer-events-none text-slate-300 dark:text-slate-600',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        selected:
          'bg-primary! text-primary-foreground! hover:bg-primary! hover:text-primary-foreground! focus:bg-primary! focus:text-primary-foreground!',
        ...classNames,
      }}
      {...props}
    />
  )
}

Calendar.displayName = 'Calendar'
