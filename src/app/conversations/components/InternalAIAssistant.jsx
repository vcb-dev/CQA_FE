import { useRef, useState, useEffect } from "react";
import { Brain, CaretRight, CaretLeft, PaperPlaneRight } from "@phosphor-icons/react";

// Placeholder, in a real app this should be imported from a service
const answerInternalAI = (question, conv) => {
  const q = question.toLowerCase();
  if (q.includes("giá")) return `Giá sản phẩm khách đang xem là 520,000đ.`;
  if (q.includes("tồn")) return `Sản phẩm này còn size 16 và 18.`;
  if (q.includes("bảo hành")) return `Chính sách: Bảo hành đánh bóng trọn đời.`;
  return `Mình chưa rõ thông tin này, bạn thử hỏi lại hoặc liên hệ quản lý nhé!`;
};

export default function InternalAIAssistant({ conv, collapsed, onToggle }) {
  const chatRef = useRef(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      sender: "ai",
      text: `Mình có thể tra cứu nhanh giá, tồn kho, mẫu mã và chính sách cho khách ${conv.name}.`,
    },
  ]);

  useEffect(() => {
    setMessages([
      {
        sender: "ai",
        text: `Đang hỗ trợ theo ngữ cảnh khách ${conv.name}. Hỏi ví dụ: "mẫu này còn size 16 không?", "giá báo khách Thái?", hoặc "chính sách đổi size".`,
      },
    ]);
    setQuestion("");
  }, [conv.id, conv.name]);

  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages.length]);

  const sendQuestion = (preset) => {
    const finalQuestion = (preset || question).trim();
    if (!finalQuestion) return;

    const aiText = answerInternalAI(finalQuestion, conv);
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: finalQuestion },
      { sender: "ai", text: aiText },
    ]);
    setQuestion("");
  };

  const quickQuestions = [
    "Mẫu khách đang hỏi còn tồn kho không?",
    "Giá nên báo khách là bao nhiêu?",
    "Có mẫu nào upsell phù hợp?",
    "Chính sách bảo hành và đổi size?",
  ];

  if (collapsed) {
    return (
      <div className="h-full w-12 min-w-[48px] bg-purple-50 border border-purple-200 rounded-xl shadow-sm flex flex-col items-center p-2.5 gap-2.5 shrink-0">
        <button
          onClick={onToggle}
          title="Mở AI Assistant nội bộ"
          className="w-8 h-8 rounded-lg bg-purple-900 text-white flex items-center justify-center"
        >
          <Brain size={18} weight="fill" />
        </button>
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <div className="vertical-rl rotate-180 text-[11px] text-purple-900 font-extrabold whitespace-nowrap">
          AI nội bộ
        </div>
        <button
          onClick={onToggle}
          title="Mở rộng"
          className="mt-auto w-7 h-7 rounded-lg bg-purple-100 text-purple-900 flex items-center justify-center"
        >
          <CaretRight size={15} weight="bold" />
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0 p-0 overflow-hidden bg-purple-50 border border-purple-200 rounded-xl">
      <div className="p-3 border-b border-purple-200 bg-purple-100 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-purple-900 flex items-center justify-center shrink-0">
            <Brain size={16} weight="fill" className="text-white" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-extrabold text-indigo-900">
              AI Assistant nội bộ
            </div>
            <div className="text-[10.5px] text-purple-700 whitespace-nowrap overflow-hidden text-ellipsis">
              Tra giá, tồn kho, mẫu mã, chính sách
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-green-600 bg-green-50 border border-green-100 rounded-full px-2 py-0.5 font-extrabold">
            Online
          </span>
          <button
            onClick={onToggle}
            title="Thu gọn AI Assistant"
            className="w-7 h-7 rounded-lg bg-white text-purple-900 flex items-center justify-center"
          >
            <CaretLeft size={14} weight="bold" />
          </button>
        </div>
      </div>

      <div className="p-2.5 flex flex-wrap gap-1.5 border-b border-purple-200 bg-purple-50/50">
        {quickQuestions.map((item, i) => (
          <button
            key={i}
            onClick={() => sendQuestion(item)}
            className="px-2 py-1 rounded-lg border border-purple-200 bg-white text-purple-900 text-[10.5px] font-bold leading-tight"
          >
            {item}
          </button>
        ))}
      </div>

      <div
        ref={chatRef}
        className="flex-1 min-h-0 overflow-y-auto bg-purple-50 p-2.5 flex flex-col gap-2"
      >
        {messages.map((message, i) => {
          const isAI = message.sender === "ai";
          return (
            <div
              key={i}
              className={`max-w-[92%] ${isAI ? "self-start" : "self-end"}`}
            >
              <div
                className={`p-2.5 rounded-lg text-[11.5px] leading-relaxed whitespace-pre-line ${
                  isAI
                    ? "bg-indigo-900 text-white rounded-bl-sm rounded-br-lg border border-indigo-900"
                    : "bg-cyan-50 text-cyan-800 rounded-bl-lg rounded-br-sm border border-cyan-300"
                }`}
              >
                {message.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2.5 border-t border-purple-200 bg-purple-100 flex items-end gap-1.5">
        <textarea
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendQuestion();
            }
          }}
          placeholder="Hỏi AI về giá, tồn kho, size, mẫu mã, chính sách..."
          className="flex-1 resize-none min-h-[42px] max-h-[70px] p-2 rounded-lg border border-purple-300 bg-white text-indigo-900 text-[11.5px] leading-tight outline-none focus:ring-1 focus:ring-purple-400"
        />
        <button
          onClick={() => sendQuestion()}
          className="w-8 h-8 rounded-lg bg-purple-900 text-white flex items-center justify-center shrink-0"
        >
          <PaperPlaneRight size={15} weight="fill" />
        </button>
      </div>
    </div>
  );
}
