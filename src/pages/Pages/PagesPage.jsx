import { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  MagnifyingGlass,
  FacebookLogo,
  InstagramLogo,
  TiktokLogo,
  Globe,
  Warning,
  TrendUp,
  CalendarBlank,
  DownloadSimple,
  Pause,
  X,
  Gear,
  CaretLeft,
  CaretRight,
  CaretUp,
  CaretDown,
} from '@phosphor-icons/react';
import {
  fetchCskhPages,
  startCskhBackfill,
  pauseCskhBackfill,
  cancelCskhBackfill,
  fetchCskhBackfillStatus,
  CSKH_PAGES_LITE_QUERY_KEY,
  CSKH_PAGES_UNASSIGNED,
} from '@/features/cskh-quality/api';
import { CskhPageAvatar } from '@/features/cskh-quality/cskhUi';

function buildPagesPlaceholderFromLite(lite, selectedDate) {
  if (!lite?.pages?.length) return undefined;
  return {
    ...lite,
    pages: lite.pages.map((p) => ({
      ...p,
      conversationCount: p.conversationCount ?? 0,
      messageCount: p.messageCount ?? 0,
      unreadConversationCount: p.unreadConversationCount ?? 0,
      inboundMessageCount: undefined,
      adSpend: null,
      adCostPerConversation: null,
    })),
    inboundDay: { date: selectedDate, totalInbound: null, totalAdSpend: null, adSpendSyncPending: false },
    statsMeta: { inboundDayStats: true, requestedDate: selectedDate, buildTag: 'inbound-day-v1' },
  };
}

function getVNDateValue(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
}

function formatDateLabel(dateValue) {
  const [year, month, day] = dateValue.split('-');
  return `${day}/${month}/${year}`;
}

function formatDateTimeLabel(isoValue) {
  if (!isoValue) return null;
  const d = new Date(isoValue);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(d);
}

/** Mũi tên +/- so với hôm qua — trend/delta đã tính sẵn ở BE, FE chỉ đổi màu/hướng mũi tên theo enum. */
function TrendBadge({ trend, delta }) {
  if (!trend || trend === 'flat' || !delta) return null;
  const up = trend === 'up';
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
      {up ? <CaretUp size={9} weight="bold" /> : <CaretDown size={9} weight="bold" />}
      {delta.toLocaleString()}
    </span>
  );
}

const TOKEN_STATUS_INFO = {
  expired: { text: 'Mất kết nối', full: 'Token Facebook đã hết hạn — cần đăng nhập lại ở Cài đặt kênh', className: 'bg-rose-100 text-rose-700' },
  expiring_soon: { text: 'Sắp hết hạn', full: 'Token Facebook sắp hết hạn — nên đăng nhập lại sớm', className: 'bg-amber-100 text-amber-700' },
};

/** Thanh tiến trình indeterminate — API đếm DB, không có % từ server. */
function DayStatsProgress({ active, dateLabel }) {
  if (!active) return null;
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-3 shadow-sm animate-in fade-in duration-200">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-indigo-900">
          Đang thống kê tin nhắn mới đến — <span className="text-indigo-600">{dateLabel}</span>
        </p>
        <Globe size={15} className="animate-spin text-indigo-600 shrink-0" />
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-indigo-100">
        <div
          className="absolute top-0 bottom-0 w-2/5 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
          style={{ animation: 'dayStatsBar 1.15s ease-in-out infinite' }}
        />
      </div>
      <p className="mt-2 text-[10px] font-medium text-indigo-700/70">
        Đọc từ inbox đã đồng bộ — thường hoàn tất trong vài giây, không cần quét Facebook.
      </p>
      <style>{`
        @keyframes dayStatsBar {
          0% { left: -40%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}

function formatAdMoney(amount, currency) {
  if (amount == null || !Number.isFinite(amount)) return '—';
  const cur = (currency || 'VND').toUpperCase();
  const rounded = cur === 'VND' ? Math.round(amount) : amount;
  try {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: cur === 'VND' ? 0 : 2,
    }).format(rounded);
  } catch {
    return `${rounded.toLocaleString('vi-VN')} ${cur}`;
  }
}

function pageMessageCount(p) {
  return p.messageCount ?? p.conversationCount ?? 0;
}

/** Tin mới đến: ưu tiên inbound đã sync từ Meta Graph theo ngày; fallback hội thoại messaging từ Meta Ads. */
function pageNewInbound(p) {
  return (p.inboundMessageCount ?? 0) > 0 ? (p.inboundMessageCount ?? 0) : (p.adMessagingConversations ?? 0);
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
  'Facebook Page': (props) => <FacebookLogo {...props} weight="fill" className="text-blue-600" />,
};

// Nhãn hiển thị từ field `platform` THẬT (cskhChannelPlatform, lưu lúc kết nối OAuth) —
// không đoán theo tên page nữa, vì tên không phản ánh đúng loại kênh (ví dụ trang Instagram
// không có chữ "instagram" trong tên sẽ bị bỏ sót nếu đoán theo tên).
const PLATFORM_LABELS = { instagram: 'Instagram', tiktok: 'TikTok', messenger: 'Facebook Page' };
function platformLabelOf(p) {
  return PLATFORM_LABELS[p.platform] || 'Facebook Page';
}

function PageTypeIcon({ type, size = 18 }) {
  const Icon = PAGE_TYPE_ICONS[type] || PAGE_TYPE_ICONS['Facebook Page'];
  return <Icon size={size} />;
}

/** Chấm tròn báo đang lọc — hiện khi filter khác 'all', không phải nút bấm. */
function FilterActiveDot() {
  return <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-white pointer-events-none" />;
}

function DetailField({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-slate-400 font-semibold uppercase tracking-wide text-[10px]">{label}</dt>
      <dd className="text-slate-700 font-bold truncate" title={value || ''}>{value || '—'}</dd>
    </div>
  );
}

function DetailSection({ title, action, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">{title}</h4>
        {action}
      </div>
      {children}
    </div>
  );
}

/**
 * Panel chi tiết 1 kênh — trượt ra NGAY DƯỚI hàng vừa bấm trong bảng (accordion row, không
 * phải overlay/drawer). Mọi field lấy thẳng từ response /cskh/pages đã có sẵn trên `page`
 * (kể cả số liệu ngày, quảng cáo, kết nối), không gọi thêm API nào.
 */
function PageDetailPanel({ page, onClose, oauthTokenStatus, oauthExpiresAt, selectedDateLabel }) {
  const navigate = useNavigate();
  const appliesTokenStatus = page.platform !== 'tiktok';
  const tokenInfo = appliesTokenStatus ? TOKEN_STATUS_INFO[oauthTokenStatus] : undefined;
  const msgs = pageMessageCount(page);
  const newInbound = pageNewInbound(page);
  const hasAdSpend = page.adSpend != null && page.adSpend > 0;

  const statTiles = [
    { label: 'Tin nhắn', value: msgs.toLocaleString(), trend: page.msgsTrend, delta: page.msgsDelta },
    { label: 'Tin mới đến', value: newInbound.toLocaleString(), trend: page.newInboundTrend, delta: page.newInboundDelta },
    { label: 'Hội thoại', value: (page.conversationCount || 0).toLocaleString() },
    { label: 'Chưa đọc', value: (page.unreadConversationCount || 0).toLocaleString() },
  ];

  return (
    <div className="animate-in slide-in-from-top-2 fade-in duration-150 bg-slate-50/70 border-y border-slate-100 px-5 py-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${page.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${page.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {page.enabled ? 'Đang hoạt động' : 'Tạm dừng'}
          </span>
          {tokenInfo && (
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${tokenInfo.className}`}
              title={oauthExpiresAt ? `Hạn token: ${formatDateTimeLabel(oauthExpiresAt)}` : tokenInfo.full}
            >
              {tokenInfo.text}
            </span>
          )}
        </div>
        <button type="button" onClick={onClose} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 cursor-pointer">
          <X size={16} weight="bold" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
        <DetailSection title={`Số liệu${selectedDateLabel ? ` ngày ${selectedDateLabel}` : ''}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {statTiles.map((s) => (
              <div key={s.label} className="rounded-xl bg-white border border-slate-100 p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate">{s.label}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-lg font-black text-slate-800 truncate" title={s.value}>{s.value}</span>
                  <TrendBadge trend={s.trend} delta={s.delta} />
                </div>
              </div>
            ))}
          </div>
        </DetailSection>

        <DetailSection title="Quảng cáo">
          {hasAdSpend ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <div className="rounded-xl bg-white border border-slate-100 p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Chi tiêu QC</div>
                <div className="text-lg font-black text-emerald-700 mt-1 truncate">{formatAdMoney(page.adSpend, page.adSpendCurrency)}</div>
              </div>
              <div className="rounded-xl bg-white border border-slate-100 p-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">CP / hội thoại</div>
                <div className="text-lg font-black text-slate-800 mt-1 truncate">
                  {page.adCostPerConversation > 0 ? formatAdMoney(page.adCostPerConversation, page.adSpendCurrency) : '—'}
                </div>
              </div>
              <DetailField label="Hội thoại tính QC" value={page.adMessagingConversations != null ? page.adMessagingConversations.toLocaleString() : null} />
              <DetailField label="Tài khoản QC" value={page.adAccountName} />
              <DetailField label="Đồng bộ lúc" value={formatDateTimeLabel(page.adSpendSyncedAt)} />
            </div>
          ) : page.enabled ? (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs font-semibold text-amber-800">
              Chưa nối Facebook Ads — {page.adSpendUnavailableReason || 'kênh chưa gắn tài khoản quảng cáo.'}
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium">Kênh đang tạm dừng — không theo dõi quảng cáo.</div>
          )}
        </DetailSection>

        <DetailSection
          title="Quản lý"
          action={
            <button
              type="button"
              onClick={() => navigate('/settings?tab=channel')}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              Sửa ở Cài đặt kênh
            </button>
          }
        >
          <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5 text-xs">
            <DetailField label="Team" value={page.team} />
            <DetailField label="Quản lý" value={page.managerName} />
            <DetailField label="Khu vực" value={page.region} />
          </dl>
        </DetailSection>

        <DetailSection title="Kết nối">
          <dl className="grid grid-cols-3 gap-x-3 gap-y-2.5 text-xs">
            <DetailField label="Ngày kết nối" value={formatDateTimeLabel(page.connectedAt)} />
            <DetailField label="Tin nhắn gần nhất" value={formatDateTimeLabel(page.lastActivityAt) || 'Chưa có tin nhắn'} />
            <DetailField label="Cập nhật gần nhất" value={formatDateTimeLabel(page.updatedAt)} />
          </dl>
        </DetailSection>
      </div>
    </div>
  );
}

// Cột bảng "Chi tiết từng Page & Kênh" — key khớp đúng sortBy BE (GET /cskh/pages?sortBy=...).
// key=null nghĩa là cột không hỗ trợ sort (Trạng thái).
const TABLE_COLUMNS = [
  { key: 'name', label: 'Page / Kênh', width: '20%' },
  { key: null, label: 'Trạng thái', width: '10%' },
  { key: 'team', label: 'Team', width: '8%' },
  { key: 'manager', label: 'Quản lý', width: '9%' },
  { key: 'region', label: 'Khu vực', width: '7%' },
  { key: 'msgs', label: 'Tin nhắn', width: '9%', numeric: true },
  { key: 'newInbound', label: 'Tin mới đến', width: '9%', numeric: true },
  { key: 'unread', label: 'Chưa đọc', width: '7%', numeric: true },
  { key: 'adSpend', label: 'Chi tiêu QC', width: '12%', numeric: true },
  { key: 'costPerConv', label: 'CP / hội thoại', width: '9%', numeric: true },
];

const TABLE_PAGE_SIZE = 10;

export default function PagesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(() => getVNDateValue());

  // ---- Tổng quan (KPI / donut / insight) — luôn phản ánh TOÀN BỘ ngày đã chọn, không đổi
  // theo bộ lọc của bảng bên dưới (giống hành vi cũ trước khi tách filter ra BE). ----
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    isFetching: isFetchingSummary,
    refetch: refetchSummary,
    isError: isSummaryError,
  } = useQuery({
    queryKey: ['cskh', 'pages', 'summary', selectedDate],
    queryFn: () => fetchCskhPages({ date: selectedDate }),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    placeholderData: (prev) =>
      prev ?? buildPagesPlaceholderFromLite(queryClient.getQueryData(CSKH_PAGES_LITE_QUERY_KEY), selectedDate),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const adSpendSyncPending = summaryData?.inboundDay?.adSpendSyncPending === true;

  useEffect(() => {
    if (!adSpendSyncPending) return undefined;
    const timer = setInterval(() => {
      void refetchSummary();
    }, 20_000);
    return () => clearInterval(timer);
  }, [adSpendSyncPending, refetchSummary]);

  const [startingBackfill, setStartingBackfill] = useState(false);
  const [pausingBackfill, setPausingBackfill] = useState(false);
  const [cancellingBackfill, setCancellingBackfill] = useState(false);
  const { data: backfillStatus, refetch: refetchBackfill } = useQuery({
    queryKey: ['cskh', 'backfill'],
    queryFn: fetchCskhBackfillStatus,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.pauseRequested) return 1000;
      if (data?.running) return 2500;
      return false;
    },
    refetchOnWindowFocus: false,
  });
  const backfillRunning = Boolean(backfillStatus?.running);
  const backfillPaused = Boolean(backfillStatus?.paused && !backfillRunning);
  const backfillPausing = Boolean(backfillStatus?.pauseRequested) || pausingBackfill;
  const backfillCancelling = cancellingBackfill;
  const backfillScanActive = backfillRunning && !backfillPausing && !backfillCancelling;
  const prevBackfillRunning = useRef(false);
  const prevBackfillDone = useRef(0);
  const prevCompletedCount = useRef(0);

  useEffect(() => {
    if (prevBackfillRunning.current && !backfillRunning) {
      refetchSummary();
      setPausingBackfill(false);
    }
    if (!backfillRunning && !backfillStatus?.pauseRequested) {
      setPausingBackfill(false);
    }
    prevBackfillRunning.current = backfillRunning;
  }, [backfillRunning, backfillStatus?.pauseRequested, refetchSummary]);

  /** Mỗi khi quét xong thêm 1 kênh → tải lại số liệu (tin mới, chi phí QC, CP/HT). */
  useEffect(() => {
    if (!backfillScanActive && !backfillPaused) {
      prevBackfillDone.current = backfillStatus?.done ?? 0;
      return;
    }
    const done = backfillStatus?.done ?? 0;
    if (done > prevBackfillDone.current) {
      prevBackfillDone.current = done;
      void refetchSummary();
    }
  }, [backfillScanActive, backfillPaused, backfillStatus?.done, refetchSummary]);

  /** Refetch khi danh sách kênh đã quét tăng (đáng tin cậy hơn done). */
  useEffect(() => {
    const count = backfillStatus?.completedPageIds?.length ?? 0;
    if ((backfillScanActive || backfillPaused) && count > prevCompletedCount.current) {
      prevCompletedCount.current = count;
      void refetchSummary();
    }
    if (!backfillScanActive && !backfillPaused) {
      prevCompletedCount.current = count;
    }
  }, [backfillScanActive, backfillPaused, backfillStatus?.completedPageIds, refetchSummary]);

  const handleStartBackfill = async (force = false) => {
    if (backfillRunning || startingBackfill) return;
    setStartingBackfill(true);
    try {
      await startCskhBackfill('all', { force, date: selectedDate });
      await refetchBackfill();
    } catch {
      // lỗi hiện qua trạng thái poll
    } finally {
      setStartingBackfill(false);
    }
  };

  const handlePauseBackfill = async () => {
    if (!backfillScanActive || pausingBackfill) return;
    setPausingBackfill(true);
    try {
      await pauseCskhBackfill();
      await refetchBackfill();
    } catch {
      setPausingBackfill(false);
    }
  };

  const handleCancelBackfill = async () => {
    if ((!backfillRunning && !backfillPaused) || cancellingBackfill) return;
    setCancellingBackfill(true);
    try {
      await cancelCskhBackfill();
      await refetchBackfill();
      await refetchSummary();
    } catch {
      // poll sẽ cập nhật trạng thái
    } finally {
      setCancellingBackfill(false);
      setPausingBackfill(false);
    }
  };

  const pages = summaryData?.pages || [];
  const inboundDaySummary = summaryData?.inboundDay;
  const oauthTokenStatus = summaryData?.oauthTokenStatus;
  const [expandedPageId, setExpandedPageId] = useState(null);
  const selectedDateLabel = formatDateLabel(selectedDate);
  const apiBase = import.meta.env.VITE_API_URL || '(chưa cấu hình VITE_API_URL)';
  const isRailwayApi = /railway\.app/i.test(apiBase);
  const deployHint = isRailwayApi
    ? `1. Commit & push code BE (cskh.controller.ts, cskh.service.ts) lên branch Railway đang theo dõi
2. Railway Dashboard → service cqa-be → Deployments → Redeploy
   (Build Docker Hub viejhaf/cqa-be KHÔNG ảnh hưởng Railway trừ khi Railway cấu hình pull image đó)
3. Sau deploy, mở ${apiBase.replace(/\/$/, '')}/docs — GET /cskh/pages phải có query ?date=`
    : `cd CQA_BE
docker build -t viejhaf/cqa-be:latest .
docker push viejhaf/cqa-be:latest
# Trên server:
docker pull viejhaf/cqa-be:latest && docker restart cqa-be`;
  const dayStatsReady =
    inboundDaySummary?.date === selectedDate ||
    summaryData?.statsMeta?.requestedDate === selectedDate ||
    pages.some((p) => typeof p.inboundMessageCount === 'number');
  const dayStatsUnavailable =
    !isLoadingSummary && !isFetchingSummary && !isSummaryError && pages.length > 0 && !dayStatsReady;

  const scannedPageIds = useMemo(
    () => new Set(backfillStatus?.completedPageIds ?? []),
    [backfillStatus?.completedPageIds],
  );

  // Tổng hợp KPI/donut/insight/tab nền tảng/dropdown facet — BE tính sẵn trên đúng tập kênh
  // của ngày đã chọn (GET /cskh/pages?date=... không kèm filter khi gọi cho summaryData).
  // FE chỉ đọc field có sẵn để render, không tự reduce/sort/đếm lại trên `pages`.
  const totalMsgs = summaryData?.totalMsgs ?? 0;
  const totalNewInbound = inboundDaySummary?.totalInbound ?? 0;
  const totalAdSpend = inboundDaySummary?.totalAdSpend ?? 0;
  const adSpendCurrency = inboundDaySummary?.adSpendCurrency ?? 'VND';
  const activePagesCount = summaryData?.activePagesCount ?? 0;

  const dynamicKPIs = [
    {
      label: 'Tổng tin nhắn',
      value: totalMsgs.toLocaleString(),
      sub: selectedDateLabel,
      isReal: true,
    },
    {
      label: 'Tin nhắn mới đến',
      value: totalNewInbound.toLocaleString(),
      sub: selectedDateLabel,
      isReal: true,
    },
    {
      label: 'Tổng chi tiêu QC',
      value: totalAdSpend > 0 ? formatAdMoney(totalAdSpend, adSpendCurrency) : '—',
      sub: selectedDateLabel,
      isReal: true,
      adMetric: true,
    },
    {
      label: 'Số kênh đang hoạt động',
      value: activePagesCount.toLocaleString(),
      sub: `Trên ${pages.length} kênh`,
      isReal: true,
    },
  ];

  // Màu hiển thị theo platform — tra cứu tĩnh (giống PLATFORM_LABELS), không phải xử lý dữ liệu.
  const PLATFORM_COLORS = { messenger: '#3b82f6', instagram: '#ec4899', tiktok: '#111827' };
  const dynamicDistribution = (summaryData?.platformDistribution ?? []).map((d) => ({
    label: PLATFORM_LABELS[d.platform] || 'Facebook Page',
    pct: d.pct,
    value: d.msgs,
    color: PLATFORM_COLORS[d.platform] || '#94a3b8',
  }));

  const topInboundPage = summaryData?.topInboundPage;
  const insights = useMemo(() => {
    const primaryPageName = pages[0]?.pageName || 'Facebook Page';
    const list = [
      `Kênh "${primaryPageName}" và ${pages.length - 1} kênh khác đang đồng bộ dữ liệu tin nhắn.`,
      `Trong ngày ${selectedDateLabel}, hệ thống ghi nhận ${totalNewInbound.toLocaleString()} tin khách gửi đến.`,
    ];
    if (totalAdSpend > 0) {
      list.push(`Tổng chi tiêu QC ${selectedDateLabel}: ${formatAdMoney(totalAdSpend, adSpendCurrency)}.`);
    }
    if (topInboundPage?.newInbound > 0) {
      const topName = topInboundPage.pageName || `Trang #${topInboundPage.pageId}`;
      list.push(`Kênh "${topName}" nhận nhiều tin mới nhất (${topInboundPage.newInbound.toLocaleString()} tin).`);
    }
    list.push('Liên kết Sapo OAuth tại Cài đặt kênh để đồng bộ doanh thu thực tế.');
    return list.slice(0, 4);
  }, [pages, selectedDateLabel, totalNewInbound, totalAdSpend, adSpendCurrency, topInboundPage]);

  // Nhãn tab nền tảng + dropdown Team/Quản lý/Khu vực — count lấy thẳng từ BE (platformFacet/
  // teamFacet/managerFacet/regionFacet), luôn phản ánh toàn bộ ngày đã chọn chứ không đổi
  // theo bộ lọc bảng đang bật.
  const platformTabs = (summaryData?.platformFacet ?? []).map((f) => ({
    value: f.platform,
    label: PLATFORM_LABELS[f.platform] || 'Facebook Page',
    count: f.count,
  }));

  const EMPTY_FACET = { values: [], hasUnassigned: false };
  const teamFacet = summaryData?.teamFacet ?? EMPTY_FACET;
  const managerFacet = summaryData?.managerFacet ?? EMPTY_FACET;
  const regionFacet = summaryData?.regionFacet ?? EMPTY_FACET;

  const keywordItems = [
    { type: 'Facebook Page', keywords: 'nhẫn bạc, size, giá, bảo hành, giao hàng' },
    { type: 'Instagram', keywords: 'dây chuyền, mẫu mới, giá, có sẵn không' },
    { type: 'TikTok', keywords: 'review, chất liệu, đeo có đen không, giá' },
  ];

  // ---- Bảng "Chi tiết từng Page & Kênh" — filter/sort/paginate chạy ở BE (GET /cskh/pages),
  // FE chỉ gửi query param rồi render kết quả trả về, không tự lọc/sort/cắt trang bằng JS. ----
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [managerFilter, setManagerFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('msgs');
  const [sortDir, setSortDir] = useState('desc');
  const [tablePage, setTablePage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setTablePage(1);
  }, [search, platformFilter, statusFilter, teamFilter, managerFilter, regionFilter, selectedDate]);

  // Trạng thái mặc định (chưa lọc gì, trang 1, sort mặc định) trùng hệt dữ liệu request
  // tổng quan đã tải — bắn thêm request thứ 2 lúc này chỉ tốn connection DB vô ích (mỗi
  // request /cskh/pages tự chạy ~5 query song song). Chỉ gọi BE riêng cho bảng khi người
  // dùng thật sự đổi filter/sort/trang; lúc đó BE mới là nguồn xử lý, không phải trước đó.
  const isDefaultTableView =
    !search &&
    platformFilter === 'all' &&
    statusFilter === 'all' &&
    teamFilter === 'all' &&
    managerFilter === 'all' &&
    regionFilter === 'all' &&
    sortBy === 'msgs' &&
    sortDir === 'desc' &&
    tablePage === 1;

  const {
    data: tableData,
    isFetching: isFetchingTableQuery,
  } = useQuery({
    queryKey: [
      'cskh', 'pages', 'table', selectedDate, search, platformFilter, statusFilter,
      teamFilter, managerFilter, regionFilter, sortBy, sortDir, tablePage,
    ],
    queryFn: () =>
      fetchCskhPages({
        date: selectedDate,
        search: search || undefined,
        platform: platformFilter !== 'all' ? platformFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        team: teamFilter !== 'all' ? teamFilter : undefined,
        manager: managerFilter !== 'all' ? managerFilter : undefined,
        region: regionFilter !== 'all' ? regionFilter : undefined,
        sortBy,
        sortDir,
        page: tablePage,
        limit: TABLE_PAGE_SIZE,
      }),
    enabled: !isDefaultTableView,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  // Ở trạng thái mặc định: dùng lại đúng danh sách đã tải cho phần tổng quan, chỉ xếp theo
  // tin nhắn (khớp sortBy=msgs mặc định của BE) rồi cắt 10 dòng đầu — không tự "lọc" gì,
  // chỉ tránh gọi lại y nguyên request BE đã trả trước đó.
  const defaultSortedPages = useMemo(
    () => [...pages].sort((a, b) => pageMessageCount(b) - pageMessageCount(a)),
    [pages],
  );
  const tableRows = isDefaultTableView ? defaultSortedPages.slice(0, TABLE_PAGE_SIZE) : (tableData?.pages ?? []);
  const tablePagination = isDefaultTableView
    ? { page: 1, limit: TABLE_PAGE_SIZE, total: pages.length, totalPages: Math.max(1, Math.ceil(pages.length / TABLE_PAGE_SIZE)) }
    : (tableData?.pagination ?? { page: 1, limit: TABLE_PAGE_SIZE, total: 0, totalPages: 1 });
  const isFetchingTable = isDefaultTableView ? isFetchingSummary : isFetchingTableQuery;

  const handleSortClick = (key) => {
    if (!key) return;
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('desc');
    }
  };

  const isInitialPagesLoad = isLoadingSummary && !summaryData?.pages?.length;

  if (isInitialPagesLoad) {
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

  return (
    <div className="flex flex-col xl:flex-row gap-4 2xl:gap-5 w-full text-slate-700">

      {/* Center Column */}
      <div className="flex-1 flex flex-col gap-4 2xl:gap-5 min-w-0">

        <div className="flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={() => navigate('/settings?tab=channel')}
            title="Kết nối/gỡ kênh, gán Team-Quản lý-Khu vực"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors duration-150 cursor-pointer"
          >
            <Gear size={14} />
            Cài đặt kênh
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CalendarBlank size={20} className="text-indigo-600 shrink-0" weight="duotone" />
              <h3 className="font-bold text-slate-800">Thống kê tin nhắn theo ngày</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Chọn ngày rồi bấm <strong>Quét theo ngày</strong> — chỉ lấy tin nhắn Meta trong ngày đó (không quét cả lịch sử page).
              Tin mới đến / chi tiêu QC / CP hội thoại lấy từ Meta; QC cũng tự chạy lúc <strong>2:00 sáng</strong> (VN).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <label className="flex items-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50/40 px-3 py-2 cursor-pointer">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Ngày</span>
              <input
                type="date"
                value={selectedDate}
                max={getVNDateValue()}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="text-sm font-bold text-slate-800 bg-transparent border-none outline-none cursor-pointer"
              />
            </label>
            <button
              type="button"
              onClick={() => setSelectedDate(getVNDateValue())}
              className="rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 cursor-pointer"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={() => handleStartBackfill(false)}
              disabled={backfillScanActive || startingBackfill || backfillCancelling}
              title={`Chỉ quét tin nhắn Meta trong ngày ${selectedDateLabel} — bỏ qua kênh đã quét nếu tạm dừng trước đó`}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer ${
                backfillPausing
                  ? 'border border-amber-300 bg-amber-50 text-amber-800'
                  : backfillCancelling
                    ? 'border border-rose-300 bg-rose-50 text-rose-800'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <DownloadSimple size={14} className={backfillScanActive ? 'animate-bounce' : ''} />
              {backfillCancelling
                ? 'Đang hủy...'
                : backfillPausing
                ? 'Đang dừng...'
                : backfillScanActive
                  ? 'Đang quét...'
                  : backfillPaused
                    ? 'Tiếp tục quét'
                    : startingBackfill
                      ? 'Đang khởi động...'
                      : 'Quét theo ngày'}
            </button>
            {(backfillScanActive || backfillPaused || backfillPausing || backfillCancelling) && (
              <button
                type="button"
                onClick={handleCancelBackfill}
                disabled={cancellingBackfill}
                title="Hủy ngay — dừng toàn bộ quét, xóa hàng đợi"
                className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 hover:bg-rose-100 cursor-pointer disabled:opacity-60"
              >
                <X size={14} weight="bold" />
                {cancellingBackfill ? 'Đang hủy...' : 'Hủy quét'}
              </button>
            )}
            {backfillScanActive && !backfillCancelling && (
              <button
                type="button"
                onClick={handlePauseBackfill}
                title="Tạm dừng sau khi xong kênh hiện tại — tiến độ được lưu vào DB"
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
              >
                <Pause size={14} weight="fill" />
                Tạm dừng
              </button>
            )}
            <div className="text-right px-3 py-1 min-w-[72px]">
              <div className="text-2xl font-black text-indigo-600 leading-none">
                {isFetchingSummary && !isLoadingSummary ? '…' : totalNewInbound.toLocaleString()}
              </div>
              <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">{selectedDateLabel}</div>
            </div>
          </div>
        </div>

        {(backfillRunning || backfillPaused || backfillCancelling || (backfillStatus && backfillStatus.finishedAt && backfillStatus.done > 0)) && (
          <div className={`rounded-xl border px-4 py-3 shadow-sm ${
            backfillCancelling
              ? 'border-rose-200 bg-rose-50/80'
              : backfillPausing
              ? 'border-amber-200 bg-amber-50/80'
              : backfillScanActive
              ? 'border-indigo-200 bg-indigo-50/80'
              : backfillPaused
                ? 'border-amber-200 bg-amber-50/80'
                : 'border-emerald-200 bg-emerald-50/80'
          }`}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className={`text-xs font-bold ${
                backfillCancelling ? 'text-rose-900' : backfillPausing ? 'text-amber-900' : backfillScanActive ? 'text-indigo-900' : backfillPaused ? 'text-amber-900' : 'text-emerald-900'
              }`}>
                {backfillCancelling
                  ? 'Đang hủy quét — dừng ngay'
                  : backfillPausing
                  ? 'Đang dừng — chờ xong kênh hiện tại'
                  : backfillScanActive
                  ? `Đang quét tin nhắn Meta${backfillStatus?.scanDate ? ` ngày ${formatDateLabel(backfillStatus.scanDate)}` : selectedDateLabel ? ` ngày ${selectedDateLabel}` : ''}`
                  : backfillPaused
                    ? 'Đã tạm dừng — tiến độ đã lưu'
                    : 'Đã quét xong'}
                {' '}
                <span className={
                  backfillCancelling ? 'text-rose-700' : backfillPausing ? 'text-amber-700' : backfillScanActive ? 'text-indigo-600' : backfillPaused ? 'text-amber-700' : 'text-emerald-700'
                }>
                  {backfillStatus.done}/{backfillStatus.total} kênh
                </span>
              </p>
              <span className={`text-xs font-bold ${backfillScanActive ? 'text-indigo-700' : 'text-emerald-700'}`}>
                +{(backfillStatus.addedMessages || 0).toLocaleString()} tin
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-white/70">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  backfillCancelling
                    ? 'bg-gradient-to-r from-rose-300 to-rose-500'
                    : backfillPausing
                    ? 'bg-gradient-to-r from-amber-300 to-amber-500'
                    : backfillScanActive ? 'bg-gradient-to-r from-indigo-400 to-indigo-600' : 'bg-emerald-500'
                }`}
                style={{ width: `${backfillStatus.total > 0 ? Math.round((backfillStatus.done / backfillStatus.total) * 100) : 0}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className={`text-[10px] font-medium truncate ${
                backfillCancelling ? 'text-rose-700/80' : backfillPausing ? 'text-amber-700/80' : backfillScanActive ? 'text-indigo-700/80' : 'text-emerald-700/80'
              }`}>
                {backfillCancelling
                  ? 'Đang ngắt tiến trình quét...'
                  : backfillPausing && backfillStatus.currentPage
                  ? `Đang kết thúc kênh: ${backfillStatus.currentPage}`
                  : backfillScanActive && backfillStatus.currentPage
                  ? `Đang xử lý: ${backfillStatus.currentPage}${
                      (backfillStatus.pageConvsDone ?? 0) > 0
                        ? ` (${backfillStatus.pageConvsDone} hội thoại)`
                        : ''
                    }`
                  : `Hoàn tất ${backfillStatus.okPages} kênh`}
                {backfillStatus.errorPages?.length > 0 && (
                  <span className="text-amber-600"> · {backfillStatus.errorPages.length} kênh Facebook báo lỗi (sẽ thử lại sau)</span>
                )}
              </p>
              {!backfillRunning && (
                <div className="flex items-center gap-3 shrink-0">
                  {backfillPaused && (
                    <button
                      type="button"
                      onClick={() => handleStartBackfill(false)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Tiếp tục quét
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleStartBackfill(true)}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Quét lại từ đầu
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {dayStatsUnavailable && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl text-xs font-medium flex items-start gap-2">
            <Warning size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p>
                API backend đang chạy <strong>bản cũ</strong> — không trả <code className="text-[11px] bg-amber-100 px-1 rounded">inboundDay</code> cho{' '}
                <strong>{selectedDateLabel}</strong>.
              </p>
              <p className="text-amber-800/90">
                {isRailwayApi ? (
                  <>
                    FE đang gọi <strong>Railway</strong> — build Docker Hub <strong>không cập nhật</strong> server này.
                    Cần push code BE lên Git và redeploy trên Railway:
                  </>
                ) : (
                  <>
                    Push Git <strong>không đủ</strong> — cần <strong>build lại Docker image</strong> và restart container:
                  </>
                )}
              </p>
              <pre className="text-[10px] bg-amber-100/80 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap">{deployHint}</pre>
              <p className="text-amber-800/90">
                Kiểm tra: DevTools → Network → <code className="text-[11px] bg-amber-100 px-1 rounded">pages?date={selectedDate}</code> → response phải có{' '}
                <code className="text-[11px] bg-amber-100 px-1 rounded">inboundDay</code>.
                Hiện tại Railway chưa có endpoint <code className="text-[11px] bg-amber-100 px-1 rounded">/cskh/features</code> — dấu hiệu bản cũ.
                API: <code className="text-[11px] bg-amber-100 px-1 rounded break-all">{apiBase}</code>
              </p>
            </div>
          </div>
        )}

        {isSummaryError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs font-medium">
            Không tải được dữ liệu. Kiểm tra kết nối API và thử «Tải lại».
          </div>
        )}

        <DayStatsProgress active={isFetchingSummary && !isInitialPagesLoad} dateLabel={selectedDateLabel} />
        {adSpendSyncPending && (
          <div className="rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-2.5 text-xs font-medium text-violet-800">
            Đang đồng bộ chi tiêu QC từ Meta cho ngày {selectedDateLabel} — cột Chi tiêu QC sẽ cập nhật trong vài phút.
          </div>
        )}

        <div className={`grid grid-cols-2 2xl:grid-cols-4 gap-3 2xl:gap-4 transition-opacity duration-200 ${isFetchingSummary && !isLoadingSummary ? 'opacity-60' : ''}`}>
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

        {/* Toolbar lọc bảng — mọi filter/sort/paginate chạy ở BE, đổi state chỉ để build query param. */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 w-56 focus-within:border-indigo-400">
            <MagnifyingGlass size={15} className="text-slate-400 shrink-0" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Tìm theo tên page hoặc kênh..."
              className="flex-1 bg-transparent text-xs text-slate-700 outline-none border-none placeholder-slate-400"
            />
          </div>

          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                platformFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              Tất cả {pages.length}
            </button>
            {platformTabs.map(({ value, label, count }) => (
              <button
                key={value}
                onClick={() => setPlatformFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  platformFilter === value ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <PageTypeIcon type={label} size={14} />
                <span>{label === 'Facebook Page' ? 'Facebook' : label} {count}</span>
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-slate-200 mx-0.5" />

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold cursor-pointer ${
                statusFilter !== 'all' ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <option value="all">Trạng thái</option>
              <option value="on">Đang hoạt động</option>
              <option value="off">Tạm dừng</option>
            </select>
            {statusFilter !== 'all' && <FilterActiveDot />}
          </div>

          <div className="relative">
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold cursor-pointer max-w-[140px] ${
                teamFilter !== 'all' ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <option value="all">Team</option>
              {teamFacet.values.map((f) => (
                <option key={f.value} value={f.value}>{f.value} ({f.count})</option>
              ))}
              {teamFacet.hasUnassigned && <option value={CSKH_PAGES_UNASSIGNED}>Chưa gán team</option>}
            </select>
            {teamFilter !== 'all' && <FilterActiveDot />}
          </div>

          <div className="relative">
            <select
              value={managerFilter}
              onChange={(e) => setManagerFilter(e.target.value)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold cursor-pointer max-w-[140px] ${
                managerFilter !== 'all' ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <option value="all">Quản lý</option>
              {managerFacet.values.map((f) => (
                <option key={f.value} value={f.value}>{f.value} ({f.count})</option>
              ))}
              {managerFacet.hasUnassigned && <option value={CSKH_PAGES_UNASSIGNED}>Chưa gán quản lý</option>}
            </select>
            {managerFilter !== 'all' && <FilterActiveDot />}
          </div>

          <div className="relative">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold cursor-pointer max-w-[140px] ${
                regionFilter !== 'all' ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-600'
              }`}
            >
              <option value="all">Khu vực</option>
              {regionFacet.values.map((f) => (
                <option key={f.value} value={f.value}>{f.value} ({f.count})</option>
              ))}
              {regionFacet.hasUnassigned && <option value={CSKH_PAGES_UNASSIGNED}>Chưa gán khu vực</option>}
            </select>
            {regionFilter !== 'all' && <FilterActiveDot />}
          </div>
        </div>

        {/* Bảng chi tiết */}
        <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden transition-opacity duration-200 ${isFetchingTable && tableRows.length > 0 ? 'opacity-60' : ''}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-100 gap-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Chi tiết từng Page & Kênh</h3>
              <p className="text-xs text-slate-400 mt-1">
                {isFetchingTable
                  ? `Đang cập nhật số liệu ${selectedDateLabel}...`
                  : `Theo dõi tổng tin nhắn và tin mới đến trong ngày ${selectedDateLabel}.`}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg self-start sm:self-center select-none">
              {tablePagination.total}/{pages.length} trang
              {isFetchingTable ? <span className="text-indigo-500 font-semibold ml-2">Đang tải...</span> : null}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]" style={{ tableLayout: 'fixed' }}>
              <colgroup>
                {TABLE_COLUMNS.map((c) => <col key={c.label} style={{ width: c.width }} />)}
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                  {TABLE_COLUMNS.map((c) => (
                    <th
                      key={c.label}
                      className={`px-3 py-3.5 ${c.numeric ? 'text-right' : ''} ${c.key ? 'cursor-pointer hover:text-slate-600' : ''}`}
                      onClick={() => handleSortClick(c.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {c.label}
                        {c.key && sortBy === c.key ? (
                          sortDir === 'asc' ? <CaretUp size={10} weight="bold" /> : <CaretDown size={10} weight="bold" />
                        ) : null}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {tableRows.length === 0 && (
                  <tr>
                    <td colSpan={TABLE_COLUMNS.length} className="px-5 py-12 text-center text-sm text-slate-400 font-medium">
                      Không có page nào khớp bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
                {tableRows.map((p) => {
                  const name = p.pageName || `Trang #${p.pageId}`;
                  const type = platformLabelOf(p);
                  const msgs = pageMessageCount(p);
                  const newInbound = pageNewInbound(p);
                  const isScanned = scannedPageIds.has(p.pageId);
                  const isScanningNow =
                    backfillScanActive &&
                    backfillStatus?.currentPage &&
                    (name === backfillStatus.currentPage || p.pageId === backfillStatus.currentPage);
                  const tokenWarning = p.platform !== 'tiktok' ? TOKEN_STATUS_INFO[oauthTokenStatus] : undefined;
                  const isExpanded = expandedPageId === p.pageId;
                  return (
                  <Fragment key={p.pageId}>
                    <tr
                      onClick={() => setExpandedPageId((id) => (id === p.pageId ? null : p.pageId))}
                      title="Bấm để xem chi tiết kênh"
                      className={`transition-colors cursor-pointer ${
                        isExpanded
                          ? 'bg-indigo-50/40'
                          : isScanningNow
                          ? 'bg-indigo-50/50'
                          : isScanned && (backfillScanActive || backfillPaused)
                            ? 'bg-emerald-50/35'
                            : 'hover:bg-slate-50/30'
                      }`}
                    >
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="relative w-8 h-8 flex-shrink-0">
                            <CskhPageAvatar
                              name={name}
                              pictureUrl={p.pagePictureUrl}
                              pageId={p.pageId}
                              className="!h-8 !w-8 !rounded-full !ring-slate-200/50"
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold text-slate-800 truncate" title={name}>{name}</span>
                              {isScanningNow && (
                                <span className="text-[9px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded shrink-0">
                                  Đang quét
                                </span>
                              )}
                              {isScanned && !isScanningNow && (backfillScanActive || backfillPaused) && (
                                <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                                  Đã quét
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                              <PageTypeIcon type={type} size={11} />
                              {type}
                              {tokenWarning && (
                                <span className={`ml-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${tokenWarning.className}`} title={tokenWarning.full}>
                                  {tokenWarning.text}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
                          p.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.enabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {p.enabled ? 'Đang hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600 truncate" title={p.team || ''}>
                        {p.team || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-3.5 text-slate-600 truncate" title={p.managerName || ''}>
                        {p.managerName || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-3.5 text-slate-600 truncate" title={p.region || ''}>
                        {p.region || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-3.5 text-right font-bold text-slate-700">
                        <div className="flex items-center justify-end gap-1.5">
                          {msgs > 0 ? msgs.toLocaleString() : (
                            <span className="text-slate-300 font-normal text-xs">Chưa có</span>
                          )}
                          <TrendBadge trend={p.msgsTrend} delta={p.msgsDelta} />
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-right font-bold text-slate-700">
                        <div className="flex items-center justify-end gap-1.5">
                          {newInbound > 0 ? newInbound.toLocaleString() : (
                            <span className="text-slate-300 font-normal text-xs">0</span>
                          )}
                          <TrendBadge trend={p.newInboundTrend} delta={p.newInboundDelta} />
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-right font-bold text-slate-700">
                        {p.unreadConversationCount > 0 ? (
                          <span className={p.unreadConversationCount >= 20 ? 'text-amber-600' : ''}>
                            {p.unreadConversationCount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-normal text-xs">0</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        {p.adSpend != null && p.adSpend > 0 ? (
                          <div>
                            <div className="font-bold text-emerald-700">{formatAdMoney(p.adSpend, p.adSpendCurrency)}</div>
                            {p.adMessagingConversations > 0 && (
                              <div className="text-[10px] text-slate-400 font-semibold">{p.adMessagingConversations.toLocaleString()} hội thoại</div>
                            )}
                          </div>
                        ) : p.enabled ? (
                          <span
                            className="inline-block text-[10px] font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5"
                            title={p.adSpendUnavailableReason || 'Chưa kết nối Facebook Ads'}
                          >
                            Chưa nối Ads
                          </span>
                        ) : (
                          <span className="text-slate-300 font-normal text-xs">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-right font-bold text-slate-700">
                        {p.adCostPerConversation != null && p.adCostPerConversation > 0
                          ? formatAdMoney(p.adCostPerConversation, p.adSpendCurrency)
                          : <span className="text-slate-300 font-normal text-xs">—</span>}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={TABLE_COLUMNS.length} className="p-0">
                          <PageDetailPanel
                            page={p}
                            onClose={() => setExpandedPageId(null)}
                            oauthTokenStatus={oauthTokenStatus}
                            oauthExpiresAt={summaryData?.oauthExpiresAt}
                            selectedDateLabel={selectedDateLabel}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                  );
                })}
                {Array.from({ length: Math.max(0, TABLE_PAGE_SIZE - tableRows.length) }).map((_, i) => (
                  <tr key={`filler-${i}`} aria-hidden="true">
                    <td colSpan={TABLE_COLUMNS.length} className="px-3 py-3.5">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 shrink-0">
            <span className="text-xs text-slate-400">
              {tablePagination.total > 0
                ? `Hiển thị ${(tablePagination.page - 1) * tablePagination.limit + 1}–${Math.min(tablePagination.page * tablePagination.limit, tablePagination.total)} trong ${tablePagination.total} kênh`
                : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={tablePagination.page <= 1}
                onClick={() => setTablePage((p) => Math.max(1, p - 1))}
                className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:border-indigo-300 hover:text-indigo-600 cursor-pointer disabled:cursor-default"
              >
                <CaretLeft size={12} weight="bold" />
              </button>
              <span className="text-xs font-bold text-slate-700 min-w-[64px] text-center">
                Trang {tablePagination.page} / {tablePagination.totalPages}
              </span>
              <button
                type="button"
                disabled={tablePagination.page >= tablePagination.totalPages}
                onClick={() => setTablePage((p) => p + 1)}
                className="flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-500 disabled:opacity-40 hover:border-indigo-300 hover:text-indigo-600 cursor-pointer disabled:cursor-default"
              >
                <CaretRight size={12} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full xl:w-64 2xl:w-72 flex flex-col gap-4 2xl:gap-5 shrink-0 pb-6 xl:pb-0 pr-0.5">
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
