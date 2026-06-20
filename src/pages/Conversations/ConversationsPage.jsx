import { ChatMessengerPane } from '@/features/cskh-quality/ChatMessengerPane';

export default function ConversationsPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Real-time Chat Workspace - Full height, no extra header */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200/60">
        <ChatMessengerPane />
      </div>
    </div>
  );
}
