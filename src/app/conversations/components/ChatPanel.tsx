import { useRef, useState, useEffect } from "react";
import {
  Smiley,
  FileText,
  Image,
  Paperclip,
  Microphone,
  QrCode,
  Translate,
  PaperPlaneRight,
} from "@phosphor-icons/react";

interface Message {
  id: string | number;
  sender: 'agent' | 'customer';
  text: string;
}

interface Conversation {
  id: string | number;
  flag: string;
  messages: Message[];
}

interface DraftReply {
  text: string;
}

interface ChatPanelProps {
  conv: Conversation;
  onSendMessage: (id: string | number, text: string) => void;
  onUpdateTags: (id: string | number, tags: string[]) => void;
  draftReply?: DraftReply;
}

// Placeholder for missing dependencies that should eventually be moved/shared
const mockTranslate = (text: string, flag: string): string => {
  if (flag === '🇻🇳') return text;
  const t = text.toLowerCase();
  
  if (flag === '🇹🇭') {
    if (t.includes('chào') || t.includes('hello')) return 'สวัสดีค่ะ ยินดีต้อนรับค่ะ';
    if (t.includes('giá') || t.includes('bao nhiêu')) return 'ราคา 520 บาท พร้อมส่งวันนี้ค่ะ';
    if (t.includes('size') || t.includes('kích thước')) return 'แหวนวงนี้มีไซส์พร้อมส่งค่ะ';
    if (t.includes('bảo hành')) return 'รับประกันขัดเงาฟรีตลอดชีพค่ะ';
    return 'ยินดีให้บริการค่ะ';
  }
  return 'Translated message...';
};

export default function ChatPanel({ conv, onSendMessage, draftReply }: ChatPanelProps) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const [inputText, setInputText] = useState<string>('');
  const [autoTranslate, setAutoTranslate] = useState<boolean>(true);
  const [inputTab, setInputTab] = useState<'reply' | 'note'>('reply');

  // Helper for message rendering (simplified)
  const getMessageDisplayParts = (msg: Message) => {
    return { text: msg.text };
  };

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [conv.messages.length]);

  useEffect(() => {
    if (draftReply?.text) {
      setInputText(draftReply.text);
    }
  }, [draftReply]);

  const submitMessage = () => {
    if (inputText.trim()) {
      let finalMsgText = inputText.trim();
      
      // If Auto Translate is toggled ON and customer speaks foreign language
      if (autoTranslate && conv.flag !== '🇻🇳') {
        const foreignText = mockTranslate(inputText.trim(), conv.flag);
        finalMsgText = `${foreignText}\n(${inputText.trim()})`;
      }

      onSendMessage(conv.id, finalMsgText);
      setInputText('');
    }
  };

  return (
    <div className="chat-panel h-full flex flex-col min-h-0 bg-white border border-n-200 rounded-xl overflow-hidden">
      {/* Messages View */}
      <div
        className="chat-messages flex-1 overflow-y-auto bg-slate-50 p-4 flex flex-col gap-3"
        ref={messagesRef}
      >
        {conv.messages.map((msg) => {
          const isAgent = msg.sender === "agent";
          const displayParts = getMessageDisplayParts(msg);

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 max-w-[75%] ${isAgent ? "self-end" : "self-start"}`}
            >
              <div
                className={`p-2.5 rounded-lg text-[12.5px] leading-relaxed whitespace-pre-line ${
                  isAgent
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
                }`}
              >
                {displayParts.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Section */}
      <div className="p-4 border-t border-n-100 bg-white">
        {/* Input area Tab bar */}
        <div className="chat-input-tabs flex gap-1 mb-2">
          {[
            { id: "reply", label: "Trả lời khách" },
            { id: "note", label: "Ghi chú nội bộ" },
          ].map((t) => (
            <button
              key={t.id}
              className={`px-3 py-1 text-[11px] font-bold rounded-lg ${inputTab === t.id ? "bg-primary-600 text-white" : "bg-n-100 text-n-600"}`}
              onClick={() => setInputTab(t.id as 'reply' | 'note')}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <div className="relative mb-2">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submitMessage();
              }
            }}
            placeholder={
              autoTranslate && conv.flag !== "🇻🇳"
                ? `Nhập tin nhắn tiếng Việt... AI sẽ tự động dịch sang tiếng ${conv.flag === "🇹🇭" ? "Thái" : conv.flag === "🇺🇸" ? "Anh" : conv.flag === "🇯🇵" ? "Nhật" : conv.flag === "🇪🇸" ? "Tây Ban Nha" : "Indo"}`
                : "Nhập tin nhắn... (Shift + Enter để xuống dòng, Enter để gửi)"
            }
            className="w-full text-[12.5px] text-slate-800 p-2 bg-slate-50 border border-n-200 rounded-lg resize-none min-h-[65px] max-h-[100px] outline-none"
          />

          {/* Translation Preview */}
          {autoTranslate && conv.flag !== "🇻🇳" && inputText.trim() && (
            <div className="absolute -bottom-6 left-0.5 right-0.5 bg-violet-50 border border-violet-200 rounded text-[10.5px] text-violet-700 font-semibold flex items-center gap-1 p-1 z-10">
              <Translate size={11} />
              <span>
                Bản dịch AI gửi đi: "{mockTranslate(inputText.trim(), conv.flag)}"
              </span>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            {[Smiley, FileText, Image, Paperclip, Microphone, QrCode].map((Icon, i) => (
              <button key={i} className="text-n-400 hover:text-n-600" type="button">
                <Icon size={16} />
              </button>
            ))}

            {conv.flag !== "🇻🇳" && (
              <label className="flex items-center gap-1 cursor-pointer text-[11px] font-bold text-violet-700 ml-2">
                <input
                  type="checkbox"
                  checked={autoTranslate}
                  onChange={(e) => setAutoTranslate(e.target.checked)}
                />
                AI Tự dịch khi gửi
              </label>
            )}
          </div>

          <button
            onClick={submitMessage}
            className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-[12.5px] font-semibold flex items-center gap-1"
          >
            <span>Gửi</span>
            <PaperPlaneRight size={12} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}
