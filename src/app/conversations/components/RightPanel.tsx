import { useState, useEffect } from "react";
import { Package, ClipboardText, Diamond, Lightbulb, ArrowsCounterClockwise } from "@phosphor-icons/react";

// Assuming these helpers are in ConversationsPage.jsx for now, 
// I need to import them correctly or define them if they are small enough.
// Since they were in ConversationsPage.jsx, I should either move them to a utility file 
// or import them from there if ConversationsPage is exporting them.

// For now, let's keep them as mocks/imports in the same folder until refactored.
import { buildSalesAssistant, getTagStyle } from "./ConversationsPage";

interface RightPanelProps {
  conv: any;
  onUpdateTags: (convId: string, tags: string[]) => void;
  onTriggerAction: (actionId: string, label: string) => void;
  onUseSuggestion?: (text: string) => void;
}

export default function RightPanel({ conv, onUpdateTags, onTriggerAction }: RightPanelProps) {
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const sales = buildSalesAssistant(conv);
  
  const makeOrderDraft = () => ({
    product: sales.quote.product,
    quantity: 1,
    price: sales.quote.price,
    receiver: conv.name,
    phone: conv.phone === "-" ? "" : conv.phone,
    address: "",
    payment: "COD",
    note: `Nguồn: ${conv.page}`,
  });
  
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderDraft, setOrderDraft] = useState(makeOrderDraft);
  
  const visiblePanelTags = [
    ...(conv.tags || []),
    ...(conv.customTags || []),
  ].filter((tag: string) => !tag.toLowerCase().includes("điểm"));

  useEffect(() => {
    setShowOrderForm(false);
    setOrderDraft(makeOrderDraft());
  }, [conv.id]);

  const handleAddTag = () => {
    if (newTag.trim()) {
      onUpdateTags(conv.id, [...conv.customTags, newTag.trim()]);
      setNewTag("");
      setAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateTags(
      conv.id,
      conv.customTags.filter((t: string) => t !== tagToRemove),
    );
  };

  const handleActionClick = (actionId: string, label: string) => {
    if (actionId === "create_order" || actionId === "place_order") {
      setShowOrderForm(true);
    }
    onTriggerAction(actionId, label);
  };

  const submitOrder = () => {
    setShowOrderForm(false);
    onTriggerAction("confirm_order", `Lên đơn ${orderDraft.product}`);
  };

  const updateOrderDraft = (field: string, value: string) => {
    setOrderDraft((prev: any) => ({ ...prev, [field]: value }));
  };

  const actionItems = [
    { id: "create_order", label: "Tạo đơn", icon: Package, color: "text-green-600", bg: "bg-green-50" },
    { id: "place_order", label: "Đặt hàng", icon: ClipboardText, color: "text-teal-800", bg: "bg-teal-50" },
    { id: "ask_price", label: "Hỏi giá", icon: Diamond, color: "text-amber-600", bg: "bg-amber-50" },
    { id: "quote_price", label: "Báo giá", icon: Lightbulb, color: "text-blue-600", bg: "bg-blue-50" },
    { id: "transfer_agent", label: "Chuyển NV", icon: ArrowsCounterClockwise, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="flex flex-col gap-4 h-full w-full min-w-0 p-4 overflow-y-auto">
      {/* Customer Info Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <h3 className="font-extrabold text-slate-900 mb-4">Thông tin khách</h3>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-extrabold text-lg" style={{ background: conv.avatarColor }}>
            {conv.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 font-extrabold text-slate-900 truncate">
              {conv.name} <span>{conv.flag}</span>
            </div>
            <div className="text-xs text-slate-500">{conv.channel} · {conv.page}</div>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          {[
            ["Giới tính", conv.gender],
            ["SĐT", conv.phone],
            ["Khách cũ", conv.isReturning ? `Có (${conv.lastPurchase})` : "Chưa"],
            ["Nguồn", conv.source],
          ].map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-slate-400 w-20 shrink-0">{k}</span>
              <span className="text-slate-800 font-semibold truncate">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-5 gap-2">
        {actionItems.map((a) => {
          const IconComp = a.icon;
          return (
            <button
              key={a.id}
              onClick={() => handleActionClick(a.id, a.label)}
              className={`flex flex-col items-center justify-center gap-1 p-2 border border-slate-200 rounded-lg transition-all ${a.bg} hover:border-current`}
            >
              <IconComp size={20} className={a.color} weight="duotone" />
              <span className="text-[10px] font-extrabold text-slate-700 text-center">{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* Order Form */}
      {showOrderForm && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-extrabold text-green-700 text-sm">Lên đơn cho khách</h4>
            <button onClick={() => setShowOrderForm(false)} className="text-xs text-slate-500 font-bold">Đóng</button>
          </div>
          {/* Inputs */}
          <input value={orderDraft.product} onChange={(e) => updateOrderDraft("product", e.target.value)} placeholder="Sản phẩm" className="w-full p-2 text-xs rounded-lg border border-green-200" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" value={orderDraft.quantity} onChange={(e) => updateOrderDraft("quantity", e.target.value)} className="p-2 text-xs rounded-lg border border-green-200" />
            <input value={orderDraft.price} onChange={(e) => updateOrderDraft("price", e.target.value)} className="p-2 text-xs rounded-lg border border-green-200" />
          </div>
          <button onClick={submitOrder} className="w-full p-2 rounded-lg bg-green-600 text-white text-xs font-extrabold">Xác nhận lên đơn</button>
        </div>
      )}

      {/* Tags */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <h3 className="font-extrabold text-slate-900 mb-3">Nhãn</h3>
        <div className="flex flex-wrap gap-2">
          {visiblePanelTags.map((t: string, i: number) => {
            const tagStyle = getTagStyle(t);
            return (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: tagStyle.bg, color: tagStyle.color }}>
                {t}
                <button onClick={() => handleRemoveTag(t)} className="opacity-60 hover:opacity-100">×</button>
              </span>
            );
          })}
          {addingTag ? (
            <input autoFocus value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} className="px-3 py-1 rounded-full text-[11px] border border-blue-200 bg-blue-50" />
          ) : (
            <button onClick={() => setAddingTag(true)} className="px-3 py-1 rounded-full text-[11px] border border-dashed border-slate-300 text-slate-400 font-bold">+ Thêm</button>
          )}
        </div>
      </div>
    </div>
  );
}
