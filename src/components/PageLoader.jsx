export default function PageLoader({ label = 'Đang tải...' }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-500" />
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
