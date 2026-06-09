import { MagnifyingGlass, Sliders, Megaphone } from "@phosphor-icons/react";
import { useState } from "react";

// ── Tag style helper ──
const getTagStyle = (tag) => {
  const t = tag.toLowerCase();
  if (t.includes('quan tâm sản phẩm') || t.includes('khách quen') || t.includes('điểm tốt') || t.includes('tích cực') || t.includes('hài lòng') || t.includes('đã chốt đơn')) {
    return { bg: '#e8f5e9', color: '#1b5e20' }; // light green
  }
  if (t.includes('hỏi giá') || t.includes('nhẫn bạc') || t.includes('tự nhiên') || t.includes('zalo') || t.includes('hỏi cửa hàng') || t.includes('báo giá')) {
    return { bg: '#e3f2fd', color: '#0d47a1' }; // light blue
  }
  if (t.includes('size 16') || t.includes('size 17') || t.includes('size 6') || t.includes('quảng cáo') || t.includes('bảo hành') || t.includes('đính đá') || t.includes('tạo đơn')) {
    return { bg: '#fff3e0', color: '#e65100' }; // light orange
  }
  if (t.includes('chưa chốt đơn') || t.includes('cần xử lý') || t.includes('khiếu nại') || t.includes('mặc cả') || t.includes('tư vấn tệ') || t.includes('chờ chuyển')) {
    return { bg: '#f3e5f5', color: '#4a148c' }; // light purple
  }
  return { bg: '#f5f5f5', color: '#424242' }; // default grey
};

const getStaffListTags = (conv) => {
  const allTags = [...(conv.customTags || []), ...(conv.tags || [])];
  return allTags.filter(tag => {
    const t = tag.toLowerCase();
    if (t.includes('điểm') || t.includes('mockup')) return false;
    return (
      t.includes('chốt') ||
      t.includes('tạo đơn') ||
      t.includes('tư vấn') ||
      t.includes('bảo hành') ||
      t.includes('báo giá') ||
      t.includes('hỏi giá') ||
      t.includes('chờ chuyển') ||
      t.includes('cần xử lý')
    );
  }).filter((tag, index, arr) => arr.indexOf(tag) === index).slice(0, 3);
};

const formatCompactNumber = (value) => new Intl.NumberFormat("vi-VN").format(value);

export default function ConversationList({
  activeId,
  onSelect,
  conversationsData,
  search,
  setSearch,
  adsOnly,
  setAdsOnly,
  conversationTabs,
}) {
  const [tab, setTab] = useState("all");
  const filtered = conversationsData.filter((c) => {
    if (adsOnly && !c.isAds) return false;
    if (tab === "pending") return c.unread > 0;
    if (tab === "waiting") return c.status === "pending";
    if (tab === "done") return c.status === "reviewed";
    return true;
  });

  return (
    <div className="conv-panel h-full w-full min-w-0 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-n-100 flex-shrink-0">
        {conversationTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 p-2.5 text-center cursor-pointer transition-all duration-150 border-b-2"
            style={{
              borderColor: tab === t.key ? "var(--primary-600)" : "transparent",
            }}
          >
            <div className="text-[11px] font-bold text-n-600 mb-0.5">
              {t.label}
            </div>
            <div className="text-[15px] font-extrabold text-n-800">
              {formatCompactNumber(t.count)}
            </div>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="p-3 border-b border-n-100 flex-shrink-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-n-50 border border-n-200 rounded-lg">
          <MagnifyingGlass size={13} className="text-n-400 flex-shrink-0" />
          <input
            placeholder="Tìm kiếm hội thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[12px] text-n-700 outline-none"
          />
          <Sliders size={13} className="text-n-400 cursor-pointer" />
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={() => setAdsOnly(!adsOnly)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
              adsOnly
                ? "bg-purple-500 text-white border-purple-500"
                : "bg-n-50 text-n-500 border border-n-200"
            }`}
          >
            <Megaphone size={10} />
            Ads
          </button>
          <span className="text-[11px] text-n-400 font-semibold">
            {filtered.length}/{formatCompactNumber(conversationTabs[0].count)}{" "}
            tin nhắn
          </span>
        </div>
      </div>

      {/* Conversation Items List */}
      <div className="conv-items flex-1 overflow-y-auto">
        {filtered.map((c) => {
          const isActive = activeId === c.id;
          const isUnread = c.unread > 0;
          const staffTags = getStaffListTags(c);
          
          return (
            <div
              key={c.id}
              className={`cursor-pointer p-3 flex items-start gap-2 border-b border-n-100 transition-all ${
                isActive ? "bg-blue-50 border-l-4 border-l-primary-600" : "bg-white border-l-4 border-l-transparent"
              } ${isUnread ? "bg-orange-50" : ""}`}
              onClick={() => onSelect(c.id)}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="rounded-full flex items-center justify-center text-[13px] text-white"
                  style={{ background: c.avatarColor, width: 36, height: 36 }}
                >
                  {c.name.charAt(0)}
                </div>
                {isUnread && (
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-orange-500 border-2 border-white shadow-sm" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="flex items-center gap-1 text-[12.5px] font-semibold text-n-800">
                    {c.name} {c.flag}
                    {c.isAds && (
                      <span className="text-[9px] font-bold px-1 rounded bg-purple-500 text-white">Ads</span>
                    )}
                  </span>
                  <span className="text-[10px] text-n-400">{c.time}</span>
                </div>
                <div className="text-[10.5px] text-n-400 flex items-center gap-1 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  {c.channel}
                  <span className="text-n-300">•</span>
                  <span className="text-primary-500 font-medium">{c.page}</span>
                </div>
                <p className={`text-[11.5px] truncate ${isUnread ? "text-slate-800 font-semibold" : "text-n-500"}`}>
                  {c.preview}
                </p>
                <div className="text-[10.5px] text-n-400 mt-0.5">👤 {c.employee}</div>
                {staffTags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-1.5">
                    {staffTags.map((tag, i) => {
                      const tagStyle = getTagStyle(tag);
                      return (
                        <span key={i} className="text-[9.5px] px-1.5 py-0.5 rounded font-extrabold" style={{ background: tagStyle.bg, color: tagStyle.color }}>
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              {isUnread && (
                <div className="flex-shrink-0 align-self-center min-w-[18px] h-[18px] rounded-full bg-orange-500 text-white text-[10.5px] font-extrabold flex items-center justify-center px-1 shadow-sm">
                  {c.unread}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
