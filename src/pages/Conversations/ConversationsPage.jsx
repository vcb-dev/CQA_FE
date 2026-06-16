import { ChatMessengerPane } from '@/features/cskh-quality/ChatMessengerPane';

export default function ConversationsPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Title Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-xl border border-white/60 p-4 rounded-2xl shadow-lg shadow-indigo-50/50 flex-shrink-0">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight bg-gradient-to-r from-indigo-750 to-violet-750 bg-clip-text text-transparent">
            Hộp thư đa kênh
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hộp thư hỗ trợ chat real-time 1-1, đồng bộ trực tiếp từ các kênh kết nối
          </p>
        </div>
      </div>
      
      {/* Real-time Chat Workspace */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/50">
        <ChatMessengerPane />
      </div>
    </div>
  );
}
