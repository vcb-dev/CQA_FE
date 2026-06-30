import { Sparkle } from '@phosphor-icons/react';

/** Layout thống nhất cho các trang analytics (mock / demo). */
export default function AnalyticsShell({ children, demo = true }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {demo && (
        <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/90 to-violet-50/80 px-3.5 py-2 text-xs text-indigo-800">
          <Sparkle size={14} weight="duotone" className="shrink-0 text-indigo-500" />
          <span>
            <strong className="font-semibold">Dữ liệu demo</strong> — giao diện mẫu, sẽ kết nối API thật sau.
          </span>
        </div>
      )}
      {children}
    </div>
  );
}
