import { ChatMessengerPane } from '@/features/cskh-quality/ChatMessengerPane';

export default function ConversationsPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Full-height chat workspace with soft rounded container */}
      <div className="flex-1 min-h-0 bg-white rounded-2xl overflow-hidden shadow-md shadow-slate-200/50 border border-slate-200/40">
        <ChatMessengerPane />
      </div>
    </div>
  );
}
