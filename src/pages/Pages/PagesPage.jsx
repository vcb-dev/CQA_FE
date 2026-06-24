import { useState, useEffect, useMemo, useDeferredValue, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  MagnifyingGlass, 
  FacebookLogo, 
  InstagramLogo, 
  TiktokLogo, 
  ChatCircleText, 
  ShoppingCart, 
  Storefront, 
  Globe,
  Warning,
  TrendUp,
  Plus,
  CalendarBlank,
} from '@phosphor-icons/react';
import { fetchCskhPages } from '@/features/cskh-quality/api';

function getVNMonthValue(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value;
  const month = parts.find((p) => p.type === 'month')?.value;
  return `${year}-${month}`;
}

function formatMonthLabel(monthValue) {
  const [year, month] = monthValue.split('-');
  return `Tháng ${parseInt(month, 10)}/${year}`;
}

function pageMessageCount(p) {
  return Math.max(p.conversationCount || 0, p.auditCount || 0);
}

function DonutChart({ data, total, size = 150 }) {
  const r = (size / 2) - 14;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f8fafc" strokeWidth="14" />
        {data.map((d, i) => {
          const dash = (d.pct / 100) * c;
          const o = offset; 
          offset += dash;
          return (
            <circle 
              key={i} 
              cx={size/2} 
              cy={size/2} 
              r={r} 
              fill="none" 
              stroke={d.color} 
              strokeWidth="14" 
              strokeDasharray={`${dash} ${c - dash}`} 
              strokeDashoffset={-o} 
              className="transition-all duration-500 ease-out hover:stroke-[16px] cursor-pointer"
            />
          );
        })}
      </svg>
      <div className="absolute text-center select-none pointer-events-none">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tổng tin nhắn</div>
        <div className="text-3xl font-black text-slate-800 tracking-tight">{total.toLocaleString()}</div>
      </div>
    </div>
  );
}

const PAGE_TYPE_ICONS = {
  Instagram: (props) => <InstagramLogo {...props} weight="fill" className="text-pink-600" />,
  TikTok: (props) => <TiktokLogo {...props} weight="fill" className="text-slate-800" />,
  Zalo: (props) => <ChatCircleText {...props} weight="fill" className="text-blue-500" />,
  Shopee: (props) => <ShoppingCart {...props} weight="fill" className="text-orange-500" />,
  Lazada: (props) => <Storefront {...props} weight="fill" className="text-indigo-600" />,
  Website: (props) => <Globe {...props} weight="fill" className="text-emerald-500" />,
  'Facebook Page': (props) => <FacebookLogo {...props} weight="fill" className="text-blue-600" />,
};

function getPageType(name = '') {
  const n = name.toLowerCase();
  if (n.includes('instagram') || n.includes('ig ')) return 'Instagram';
  if (n.includes('tiktok')) return 'TikTok';
  if (n.includes('zalo')) return 'Zalo';
  if (n.includes('shopee')) return 'Shopee';
  if (n.includes('lazada')) return 'Lazada';
  if (n.includes('web') || n.includes('live chat') || n.includes('chat widget')) return 'Website';
  return 'Facebook Page';
}

function PageTypeIcon({ type, size = 18 }) {
  const Icon = PAGE_TYPE_ICONS[type] || PAGE_TYPE_ICONS['Facebook Page'];
  return <Icon size={size} />;
}

const ChannelRow = memo(function ChannelRow({ channel, isActive, onSelect }) {
  return (
    <div
      onClick={() => onSelect(channel.id)}
      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors duration-150 ${
        isActive
          ? 'bg-indigo-50/50 border-indigo-200/70 shadow-sm shadow-indigo-50'
          : 'bg-transparent border-transparent hover:bg-slate-50'
      }`}
    >
      <div className="relative w-10 h-10 rounded-full bg-slate-50 border border-slate-200/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {channel.pictureUrl ? (
          <img src={channel.pictureUrl} alt={channel.name} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <PageTypeIcon type={channel.type} size={18} />
        )}
        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
          channel.enabled ? 'bg-emerald-500' : 'bg-slate-300'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-700 transition-colors">
            {channel.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
          <span className="font-semibold text-slate-500">{channel.type}</span>
          <span>•</span>
          <span>Tin nhắn: <strong className="text-slate-600 font-bold">{channel.msgs}</strong></span>
        </div>
      </div>
    </div>
  );
});

export default function PagesPage() {
  const navigate = useNavigate();
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(() => getVNMonthValue());

  const { data: pagesData, isLoading: isLoadingPages, isFetching: isFetchingPages } = useQuery({
    queryKey: ['cskh', 'pages', selectedMonth],
    queryFn: () => fetchCskhPages({ month: selectedMonth }),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const pages = pagesData?.pages || [];
  const inboundMonthSummary = pagesData?.inboundMonth;
  const selectedMonthLabel = formatMonthLabel(selectedMonth);

  useEffect(() => {
    if (!activeChannelId && pages.length > 0) {
      setActiveChannelId(pages[0].pageId);
    }
  }, [activeChannelId, pages]);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  const channels = useMemo(() => pages.map((p) => ({
    id: p.pageId,
    name: p.pageName || `Trang #${p.pageId}`,
    type: getPageType(p.pageName),
    msgs: pageMessageCount(p),
    processing: p.unreadConversationCount || 0,
    enabled: p.enabled,
    pictureUrl: p.pagePictureUrl,
  })), [pages]);

  const filteredChannels = useMemo(() => {
    const q = deferredSearchQuery.trim().toLowerCase();
    return channels.filter((ch) => {
      if (q && !ch.name.toLowerCase().includes(q)) return false;
      if (tab === 'all') return true;
      if (tab === 'facebook' && ch.type === 'Facebook Page') return true;
      if (tab === 'instagram' && ch.type === 'Instagram') return true;
      if (tab === 'zalo' && ch.type === 'Zalo') return true;
      if (tab === 'other' && !['Facebook Page', 'Instagram', 'Zalo'].includes(ch.type)) return true;
      return false;
    });
  }, [channels, tab, deferredSearchQuery]);

  const facebookCount = channels.filter(c => c.type === 'Facebook Page').length;
  const instagramCount = channels.filter(c => c.type === 'Instagram').length;
  const zaloCount = channels.filter(c => c.type === 'Zalo').length;
  const otherCount = channels.length - facebookCount - instagramCount - zaloCount;

  const tabs = [
    { key: 'all', label: `Tất cả ${channels.length}` },
    { key: 'facebook', label: `Facebook ${facebookCount}` },
    { key: 'instagram', label: `Instagram ${instagramCount}` },
    { key: 'zalo', label: `Zalo ${zaloCount}` },
    { key: 'other', label: `Khác ${otherCount}` },
  ];

  const performance = useMemo(() => pages.map((p) => ({
    pageId: p.pageId,
    name: p.pageName || `Trang #${p.pageId}`,
    type: getPageType(p.pageName),
    msgs: pageMessageCount(p),
    newInbound: p.inboundMessageCount ?? 0,
    pictureUrl: p.pagePictureUrl,
  })), [pages]);

  const totalNewInbound = inboundMonthSummary?.totalInbound
    ?? performance.reduce((sum, p) => sum + p.newInbound, 0);
  const totalMsgs = performance.reduce((sum, p) => sum + p.msgs, 0);

  const dynamicKPIs = [
    { 
      label: 'Tổng tin nhắn', 
      value: totalMsgs.toLocaleString(), 
      sub: 'Từ khi kết nối', 
      isReal: true,
    },
    { 
      label: 'Tin nhắn mới đến', 
      value: totalNewInbound.toLocaleString(), 
      sub: selectedMonthLabel, 
      isReal: true,
    },
    { 
      label: 'Số kênh đang hoạt động', 
      value: pages.filter((p) => p.enabled).length.toLocaleString(), 
      sub: `Trên ${pages.length} kênh`, 
      isReal: true,
    },
    { 
      label: 'Doanh thu từ chat', 
      value: 'Chưa có', 
      sub: 'Cần kết nối Sapo', 
      isReal: false,
    },
  ];

  const typeMap = {};
  pages.forEach((p) => {
    const type = getPageType(p.pageName);
    const msgs = pageMessageCount(p);
    if (!typeMap[type]) typeMap[type] = 0;
    typeMap[type] += msgs;
  });

  const totalTypeMsgs = Object.values(typeMap).reduce((a, b) => a + b, 0);

  const channelColors = {
    'Facebook Page': '#3b82f6',
    'Instagram': '#ec4899',
    'TikTok': '#111827',
    'Zalo': '#0ea5e9',
    'Shopee': '#f97316',
    'Lazada': '#6366f1',
    'Website': '#10b981',
    'Khác': '#64748b',
  };

  const dynamicDistribution = Object.keys(typeMap).map(type => {
    const value = typeMap[type];
    const pct = totalTypeMsgs > 0 ? Math.round((value / totalTypeMsgs) * 100) : 0;
    return { label: type, pct, value, color: channelColors[type] || '#94a3b8' };
  }).sort((a, b) => b.value - a.value);

  const insights = useMemo(() => {
    const primaryPageName = pages[0]?.pageName || 'Facebook Page';
    const topInbound = [...performance].sort((a, b) => b.newInbound - a.newInbound)[0];
    const list = [
      `Kênh "${primaryPageName}" và ${pages.length - 1} kênh khác đang đồng bộ dữ liệu tin nhắn.`,
      `Trong ${selectedMonthLabel}, hệ thống ghi nhận ${totalNewInbound.toLocaleString()} tin khách gửi đến.`,
    ];
    if (topInbound?.newInbound > 0) {
      list.push(`Kênh "${topInbound.name}" nhận nhiều tin mới nhất (${topInbound.newInbound.toLocaleString()} tin).`);
    }
    list.push('Liên kết Sapo OAuth tại Cài đặt kênh để đồng bộ doanh thu thực tế.');
    return list.slice(0, 4);
  }, [pages, performance, selectedMonthLabel, totalNewInbound]);

  const filteredPerformance = useMemo(() => performance.filter(p => {
    if (performanceFilter === 'all') return true;
    if (performanceFilter === 'facebook' && p.type === 'Facebook Page') return true;
    if (performanceFilter === 'instagram' && p.type === 'Instagram') return true;
    if (performanceFilter === 'tiktok' && p.type === 'TikTok') return true;
    if (performanceFilter === 'zalo' && p.type === 'Zalo') return true;
    if (performanceFilter === 'shopee' && p.type === 'Shopee') return true;
    if (performanceFilter === 'lazada' && p.type === 'Lazada') return true;
    if (performanceFilter === 'website' && p.type === 'Website') return true;
    return false;
  }), [performance, performanceFilter]);

  const platformTypes = useMemo(
    () => [...new Set(performance.map((p) => p.type))].sort(),
    [performance]
  );

  const chartPages = useMemo(
    () => [...filteredPerformance].sort((a, b) => b.newInbound - a.newInbound).slice(0, 12),
    [filteredPerformance]
  );

  const maxInbound = Math.max(...chartPages.map((p) => p.newInbound), 1);

  if (isLoadingPages) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-slate-400 gap-4 py-20">
        <Globe size={44} className="animate-spin text-indigo-600" />
        <span className="text-base font-bold tracking-wide">Đang tải thông tin trang & kênh...</span>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 shadow-sm flex flex-col items-center justify-center gap-6 text-center h-full max-w-2xl mx-auto my-12 animate-in fade-in slide-in-from-bottom-4">
        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
          <FacebookLogo size={36} weight="duotone" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Chưa kết nối Page / Kênh</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md">
            Kết nối tài khoản Facebook Fanpage của bạn trong phần Cài đặt để đồng bộ hội thoại và theo dõi tin nhắn theo từng kênh.
          </p>
        </div>
        <button 
          onClick={() => navigate('/settings?tab=channel')}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
        >
          Đi tới Cài đặt kênh
        </button>
      </div>
    );
  }

  const keywordItems = [
    { type: 'Facebook Page', keywords: 'nhẫn bạc, size, giá, bảo hành, giao hàng' },
    { type: 'Instagram', keywords: 'dây chuyền, mẫu mới, giá, có sẵn không' },
    { type: 'TikTok', keywords: 'review, chất liệu, đeo có đen không, giá' },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 bg-slate-50/50 min-h-screen text-slate-700">
      
      {/* Left Column - Channel List */}
      <div className="w-full xl:w-76 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col p-4 shrink-0 max-h-[700px] xl:max-h-none overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-slate-800 text-lg">Danh sách Page & Kênh</div>
          <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-bold">{filteredChannels.length} trang</span>
        </div>
        
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 mb-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-all duration-200">
          <MagnifyingGlass size={18} className="text-slate-400" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm page hoặc kênh..." 
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none border-none placeholder-slate-400" 
          />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2 mb-3 no-scrollbar shrink-0">
          {tabs.map(t => (
            <button 
              key={t.key} 
              onClick={() => setTab(t.key)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                tab === t.key 
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 no-scrollbar">
          {filteredChannels.map((ch) => (
            <ChannelRow
              key={ch.id}
              channel={ch}
              isActive={activeChannelId === ch.id}
              onSelect={setActiveChannelId}
            />
          ))}
          {filteredChannels.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400">Không tìm thấy trang hoặc kênh nào</div>
          )}
        </div>

        <button 
          onClick={() => navigate('/settings?tab=channel')}
          className="mt-3 w-full py-2.5 border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 text-indigo-600 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          Kết nối thêm page / kênh
        </button>
      </div>

      {/* Center Column */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">

        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CalendarBlank size={20} className="text-indigo-600 shrink-0" weight="duotone" />
              <h3 className="font-bold text-slate-800">Thống kê tin nhắn theo tháng</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Chọn tháng để xem số tin khách gửi đến từng kênh (kể cả khách cũ nhắn lại).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <label className="flex items-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50/40 px-3 py-2 cursor-pointer">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Tháng</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => e.target.value && setSelectedMonth(e.target.value)}
                className="text-sm font-bold text-slate-800 bg-transparent border-none outline-none cursor-pointer"
              />
            </label>
            <div className="text-right px-3 py-1">
              <div className="text-2xl font-black text-indigo-600 leading-none">
                {isFetchingPages && !isLoadingPages ? '…' : totalNewInbound.toLocaleString()}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">{selectedMonthLabel}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dynamicKPIs.map((kpi, i) => (
            <div 
              key={i} 
              className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex justify-between items-start gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                {kpi.isReal ? (
                  <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 select-none">Thực</span>
                ) : (
                  <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 select-none">Giả lập</span>
                )}
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-800 tracking-tighter mt-2.5 mb-2 truncate" title={kpi.value}>
                {kpi.value}
              </div>
              <div className="flex items-center gap-1.5 mt-auto">
                {kpi.isReal ? (
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 shrink-0">
                    <TrendUp size={12} weight="bold" />
                    <span>Tin cậy</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 shrink-0">
                    <Warning size={12} weight="fill" />
                    <span>Cần Sapo</span>
                  </div>
                )}
                <span className="text-[10px] text-slate-400 truncate">— {kpi.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Hiệu suất từng Page & Kênh</h3>
              <p className="text-xs text-slate-400 mt-1">
                Theo dõi tổng tin nhắn và tin mới đến trong {selectedMonthLabel}.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg self-start sm:self-center select-none">
              {filteredPerformance.length}/{performance.length} trang
              {isFetchingPages && !isLoadingPages ? (
                <span className="text-indigo-500 font-semibold ml-2">Đang tải...</span>
              ) : null}
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto px-5 py-3 border-b border-slate-100 no-scrollbar shrink-0">
            <button
              onClick={() => setPerformanceFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                performanceFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Tất cả {performance.length}
            </button>
            {platformTypes.map(type => {
              const count = performance.filter(p => p.type === type).length;
              const filterKey = type === 'Facebook Page' ? 'facebook' : type.toLowerCase();
              return (
                <button
                  key={type}
                  onClick={() => setPerformanceFilter(filterKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    performanceFilter === filterKey
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  <PageTypeIcon type={type} size={14} />
                  <span>{type === 'Facebook Page' ? 'Facebook' : type} {count}</span>
                </button>
              );
            })}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Page / Kênh</th>
                  <th className="px-4 py-3.5 text-center">Tin nhắn</th>
                  <th className="px-4 py-3.5 text-center">
                    <div>Tin nhắn mới đến</div>
                    <div className="text-[9px] font-semibold normal-case text-slate-300 mt-0.5">{selectedMonthLabel}</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {filteredPerformance.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-12 text-center text-sm text-slate-400 font-medium">
                      Không có trang nào thuộc nền tảng này.
                    </td>
                  </tr>
                )}
                {filteredPerformance.map((p) => (
                  <tr key={p.pageId} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full bg-slate-50 border border-slate-200/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {p.pictureUrl ? (
                            <img src={p.pictureUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <PageTypeIcon type={p.type} size={18} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{p.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-700">
                      {p.msgs > 0 ? p.msgs.toLocaleString() : (
                        <span className="text-slate-300 font-normal text-xs">Chưa có</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-700">
                      {p.newInbound > 0 ? p.newInbound.toLocaleString() : (
                        <span className="text-slate-300 font-normal text-xs">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inbound messages chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base">So sánh tin nhắn mới đến</h3>
              <p className="text-xs text-slate-400 mt-0.5">Top kênh nhận nhiều tin khách nhất trong {selectedMonthLabel}.</p>
            </div>
            <span className="text-xs bg-slate-50 text-slate-500 border border-slate-100 px-2.5 py-1 rounded-lg font-bold">Tin inbound</span>
          </div>

          <div className="flex items-end gap-5 h-44 px-4 pb-2 border-b border-slate-100 overflow-x-auto">
            {chartPages.some((p) => p.newInbound > 0) ? (
              chartPages.map((p) => {
                const heightPct = maxInbound > 0 ? (p.newInbound / maxInbound) * 100 : 0;
                return (
                  <div key={p.pageId} className="flex-1 min-w-[48px] flex flex-col items-center gap-2 group relative">
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-md pointer-events-none z-10 whitespace-nowrap">
                      {p.newInbound.toLocaleString()} tin
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mb-1 select-none">{p.newInbound}</span>
                    <div 
                      className="w-full max-w-[40px] rounded-t-lg shadow-sm bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-indigo-100"
                      style={{ height: `${Math.max(heightPct * 1.5, p.newInbound > 0 ? 8 : 0)}px` }} 
                    />
                    <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center max-w-[64px] select-none mt-1">
                      {p.name.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400 font-medium py-8">
                Chưa có tin nhắn mới đến trong {selectedMonthLabel}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0 pb-6 pr-0.5">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h3 className="font-bold text-slate-800 text-sm mb-4">Phân bổ tin nhắn theo kênh</h3>
          <div className="flex flex-col items-center gap-5">
            <DonutChart 
              data={dynamicDistribution.length > 0 ? dynamicDistribution : [{ label: 'Không có dữ liệu', pct: 100, value: 0, color: '#e2e8f0' }]} 
              total={totalMsgs} 
            />
            <div className="w-full space-y-2.5 pt-3 border-t border-slate-100">
              {dynamicDistribution.map((d, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-slate-600 font-semibold truncate">{d.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 pl-2 shrink-0">
                    <span className="font-bold text-slate-800">{d.pct}%</span>
                    <span className="text-slate-400 text-xs">({d.value.toLocaleString()})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="font-bold text-slate-800 text-sm">Insight về page & kênh</h3>
          </div>
          <div className="space-y-3">
            {insights.map((text, i) => (
              <div 
                key={i} 
                className="flex gap-2.5 items-start bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl p-2.5 transition-all duration-200"
              >
                <span className="text-indigo-500 font-bold text-base leading-none mt-0.5">•</span>
                <span className="text-xs text-slate-600 leading-relaxed font-semibold">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Top từ khóa khách hàng theo kênh</h3>
          <div className="space-y-3.5">
            {keywordItems.map((item, i) => (
              <div key={i} className="bg-slate-50/40 border border-slate-100 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2.5">
                  <PageTypeIcon type={item.type} size={14} />
                  <span className="text-xs font-bold text-slate-700">{item.type}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.keywords.split(', ').map((kw, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-100/50 px-2.5 py-0.5 rounded-md hover:bg-indigo-100/80 transition-colors cursor-default"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
