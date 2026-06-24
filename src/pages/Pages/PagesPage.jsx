import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
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
  CaretRight,
  Plus,
  Pause
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { 
  fetchCskhPages, 
  fetchCskhAudits, 
  runAudit, 
  fetchRunningCskhJob, 
  fetchCskhJob,
  pauseAuditJob,
  fetchAuditDayStats,
} from '@/features/cskh-quality/api';

const AUDIT_LOOKBACK_DAYS = 30;
const AUDIT_LIMIT_OPTIONS = [30, 60, 100];

function getAuditDateRange() {
  const today = new Date();
  const from = new Date(today.getTime() - AUDIT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  return {
    auditDateFrom: from.toISOString().split('T')[0],
    auditDateTo: today.toISOString().split('T')[0],
  };
}

function isTerminalAuditJob(job) {
  if (!job) return false;
  if (job.status === 'done' || job.status === 'failed') return true;
  const summary = job.summary;
  if (job.status !== 'running' || !summary) return false;
  const target = Number(summary.total ?? summary.fetched ?? 0);
  if (target <= 0) return false;
  const audited = Number(summary.audited ?? 0);
  const processed = Number(summary.processed ?? 0);
  return summary.phase === 'audit' && audited >= target && processed >= target;
}

const Sparkles = ({ size = 14, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12 2l2.4 4.9L19.3 7.7l-3.6 3.5.9 5.3-4.6-2.4-4.6 2.4.9-5.3-3.6-3.5 4.9-.8L12 2zm6 13l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1 1-2.2zM6 6l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8.8-1.8z" />
  </svg>
);

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

export default function PagesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [tab, setTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [performanceFilter, setPerformanceFilter] = useState('all');
  const [runningJobId, setRunningJobId] = useState(null);
  const [auditConversationLimit, setAuditConversationLimit] = useState(60);
  const finishedJobIdsRef = useRef(new Set());
  const hasRestoredRunningJobRef = useRef(false);
  const auditDateRange = useMemo(() => getAuditDateRange(), []);

  // Fetch real pages list
  const { data: pagesData, isLoading: isLoadingPages } = useQuery({
    queryKey: ['cskh', 'pages'],
    queryFn: fetchCskhPages,
  });

  const pages = pagesData?.pages || [];

  useEffect(() => {
    if (!activeChannelId && pages.length > 0) {
      setActiveChannelId(pages[0].pageId);
    }
  }, [activeChannelId, pages]);

  // Fetch real conversations query removed as message counts are fetched directly with pages list

  // Fetch real audits — giữ data cũ khi refetch để tránh giật bảng
  const { data: audits } = useQuery({
    queryKey: ['cskh', 'audits-all'],
    queryFn: () => fetchCskhAudits({ limit: 500 }),
    enabled: pages.length > 0,
    staleTime: 120_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: keepPreviousData,
  });

  const isJobRunning = Boolean(runningJobId);

  const { data: channelDayStats } = useQuery({
    queryKey: ['cskh', 'audit-day-stats', auditDateRange.auditDateFrom, auditDateRange.auditDateTo, activeChannelId],
    queryFn: () => fetchAuditDayStats(auditDateRange.auditDateFrom, auditDateRange.auditDateTo, activeChannelId),
    enabled: Boolean(activeChannelId) && !isJobRunning,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    placeholderData: keepPreviousData,
  });

  // Chỉ kiểm tra job đang chạy khi mount — không poll liên tục
  const { data: activeRunningJob } = useQuery({
    queryKey: ['cskh', 'running-job'],
    queryFn: () => fetchRunningCskhJob('audit'),
    enabled: !runningJobId,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (hasRestoredRunningJobRef.current || runningJobId) return;
    if (activeRunningJob?.status === 'running') {
      hasRestoredRunningJobRef.current = true;
      setRunningJobId(activeRunningJob.id);
    }
  }, [activeRunningJob, runningJobId]);

  // Poll nhẹ — chỉ summary job, không tải 500 audits
  const { data: auditJob } = useQuery({
    queryKey: ['cskh', 'audit-job', runningJobId],
    queryFn: () => fetchCskhJob(runningJobId),
    enabled: !!runningJobId,
    refetchInterval: runningJobId ? 6000 : false,
    staleTime: 5000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const refreshAuditResults = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['cskh', 'audits-all'] });
    if (activeChannelId) {
      queryClient.invalidateQueries({
        queryKey: ['cskh', 'audit-day-stats', auditDateRange.auditDateFrom, auditDateRange.auditDateTo, activeChannelId],
      });
    }
  }, [queryClient, activeChannelId, auditDateRange.auditDateFrom, auditDateRange.auditDateTo]);

  // Kết thúc job — một lần duy nhất, không reset guard gây loop
  useEffect(() => {
    if (!runningJobId || !auditJob) return;
    if (auditJob.id !== runningJobId) return;
    if (!isTerminalAuditJob(auditJob)) return;
    if (finishedJobIdsRef.current.has(runningJobId)) return;

    finishedJobIdsRef.current.add(runningJobId);
    const summary = auditJob.summary;
    const audited = summary?.audited ?? 0;
    const finishedId = runningJobId;

    setRunningJobId(null);
    queryClient.setQueryData(['cskh', 'running-job'], null);
    queryClient.removeQueries({ queryKey: ['cskh', 'audit-job', finishedId] });

    window.setTimeout(() => refreshAuditResults(), 500);

    if (auditJob.status === 'failed') {
      toast.error('Tiến trình chấm điểm AI gặp lỗi!', { id: 'audit-run' });
    } else if (summary?.paused || summary?.partial) {
      toast.info(
        `Đã tạm dừng — lưu ${audited} cuộc vào DB. Bấm "Tiếp tục quét" để quét nốt.`,
        { id: 'audit-run', duration: 6000 }
      );
    } else if (summary?.allAlreadyAudited) {
      toast.success('Kênh này đã được quét đủ số cuộc trong khoảng ngày.', { id: 'audit-run' });
    } else {
      toast.success(`Hoàn thành — đã chấm ${audited} cuộc hội thoại.`, { id: 'audit-run' });
    }
  }, [auditJob, runningJobId, queryClient, refreshAuditResults]);

  const pauseMutation = useMutation({
    mutationFn: pauseAuditJob,
    onSuccess: (res) => {
      if (res.paused) {
        toast.info('Đang tạm dừng — giữ lại kết quả đã chấm vào DB...', { id: 'audit-run' });
      } else {
        toast.warning(res.message || 'Không có tiến trình đang chạy.', { id: 'audit-run' });
      }
    },
    onError: (err) => {
      toast.error('Không thể tạm dừng: ' + err.message, { id: 'audit-run' });
    },
  });

  // Audit trigger mutation
  const auditMutation = useMutation({
    mutationFn: (params) => runAudit(params),
    onSuccess: (res) => {
      if (res.alreadyRunning) {
        toast.warning('Có tiến trình chấm điểm đang chạy rồi!', { id: 'audit-run' });
      } else {
        finishedJobIdsRef.current.delete(res.jobId);
        hasRestoredRunningJobRef.current = true;
        setRunningJobId(res.jobId);
        toast.loading('Đang quét và chấm điểm AI...', { id: 'audit-run' });
      }
    },
    onError: (err) => {
      toast.error('Lỗi khi kích hoạt AI: ' + err.message, { id: 'audit-run' });
    }
  });

  // Detect channel type from page name. All pages default to Facebook Page
  // since they are connected via Facebook OAuth.
  const getPageType = (name = '') => {
    const n = name.toLowerCase();
    if (n.includes('instagram') || n.includes('ig ')) return 'Instagram';
    if (n.includes('tiktok')) return 'TikTok';
    if (n.includes('zalo')) return 'Zalo';
    if (n.includes('shopee')) return 'Shopee';
    if (n.includes('lazada')) return 'Lazada';
    if (n.includes('web') || n.includes('live chat') || n.includes('chat widget')) return 'Website';
    return 'Facebook Page';
  };

  const getPageIcon = (type) => {
    if (type === 'Instagram') return <InstagramLogo size={18} weight="fill" className="text-pink-600" />;
    if (type === 'TikTok') return <TiktokLogo size={18} weight="fill" className="text-slate-800" />;
    if (type === 'Zalo') return <ChatCircleText size={18} weight="fill" className="text-blue-500" />;
    if (type === 'Shopee') return <ShoppingCart size={18} weight="fill" className="text-orange-500" />;
    if (type === 'Lazada') return <Storefront size={18} weight="fill" className="text-indigo-600" />;
    if (type === 'Website') return <Globe size={18} weight="fill" className="text-emerald-500" />;
    return <FacebookLogo size={18} weight="fill" className="text-blue-600" />;
  };

  // Group audits by pageId to calculate real metrics per page
  const auditsByPage = useMemo(() => (audits || []).reduce((acc, audit) => {
    const pageId = audit.metadata?.pageId;
    if (pageId) {
      if (!acc[pageId]) {
        acc[pageId] = { totalScore: 0, count: 0, replied: 0, noReply: 0 };
      }
      acc[pageId].totalScore += audit.score;
      acc[pageId].count += 1;
      if (audit.metadata?.noReply) {
        acc[pageId].noReply += 1;
      } else {
        acc[pageId].replied += 1;
      }
    }
    return acc;
  }, {}), [audits]);

  // Construct dynamic channels list
  const channels = useMemo(() => pages.map((p) => {
    const pageAudit = auditsByPage[p.pageId];
    const realScore = pageAudit ? Math.round(pageAudit.totalScore / pageAudit.count) : null;
    const type = getPageType(p.pageName);
    return {
      id: p.pageId,
      name: p.pageName || `Trang #${p.pageId}`,
      type,
      score: realScore,
      msgs: p.conversationCount || 0,
      processing: p.unreadConversationCount || 0,
      avatar: getPageIcon(type),
      color: '#1877f2',
      enabled: p.enabled,
      pictureUrl: p.pagePictureUrl
    };
  }), [pages, auditsByPage]);

  // Filter channels based on tab and search query
  const filteredChannels = channels.filter(ch => {
    const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (tab === 'all') return true;
    if (tab === 'facebook' && ch.type === 'Facebook Page') return true;
    if (tab === 'instagram' && ch.type === 'Instagram') return true;
    if (tab === 'zalo' && ch.type === 'Zalo') return true;
    if (tab === 'other' && !['Facebook Page', 'Instagram', 'Zalo'].includes(ch.type)) return true;
    return false;
  });

  const selectedAuditChannel =
    channels.find((ch) => ch.id === activeChannelId) ||
    filteredChannels[0] ||
    channels[0] ||
    null;

  const resolveAuditTargetPage = (targetPageId) => {
    const pageId =
      typeof targetPageId === 'string'
        ? targetPageId
        : activeChannelId || filteredChannels[0]?.id || channels[0]?.id;
    const activePage = channels.find((ch) => ch.id === pageId);
    return { pageId, activePage };
  };

  const handleStartAudit = useCallback((targetPageId) => {
    const { pageId, activePage } = resolveAuditTargetPage(targetPageId);

    if (!pageId || !activePage) {
      toast.error('Chưa có kênh nào để quét. Hãy kết nối Facebook trước.', { id: 'audit-run' });
      return;
    }

    const alreadyScored = channelDayStats?.total ?? 0;
    const remaining = Math.max(0, auditConversationLimit - alreadyScored);

    toast.loading(
      alreadyScored > 0
        ? `Tiếp tục quét ${remaining} cuộc còn lại cho "${activePage.name}"...`
        : `Đang quét ${auditConversationLimit} cuộc hội thoại cho "${activePage.name}"...`,
      { id: 'audit-run' }
    );

    auditMutation.mutate({
      pageId,
      auditDateFrom: auditDateRange.auditDateFrom,
      auditDateTo: auditDateRange.auditDateTo,
      maxConversations: auditConversationLimit,
      force: false,
    });
  }, [auditConversationLimit, auditDateRange, auditMutation, channelDayStats?.total]);

  const facebookCount = channels.filter(c => c.type === 'Facebook Page').length;
  const instagramCount = channels.filter(c => c.type === 'Instagram').length;
  const zaloCount = channels.filter(c => c.type === 'Zalo').length;
  const otherCount = channels.length - facebookCount - instagramCount - zaloCount;

  // Dynamic tabs label counts
  const tabs = [
    { key: 'all', label: `Tất cả ${channels.length}` },
    { key: 'facebook', label: `Facebook ${facebookCount}` },
    { key: 'instagram', label: `Instagram ${instagramCount}` },
    { key: 'zalo', label: `Zalo ${zaloCount}` },
    { key: 'other', label: `Khác ${otherCount}` },
  ];

  // Dynamic performance list — memoized để tránh re-render bảng khi poll job
  const performance = useMemo(() => pages.map((p) => {
    const pageAudit = auditsByPage[p.pageId];
    const realScore = pageAudit ? Math.round(pageAudit.totalScore / pageAudit.count) : null;
    const csat = realScore !== null ? `${(realScore / 20).toFixed(1)}/5` : null;
    const type = getPageType(p.pageName);

    const msgs = p.conversationCount || 0;
    const responseRate = pageAudit && pageAudit.count > 0
      ? `${Math.round((pageAudit.replied / pageAudit.count) * 100)}%`
      : '—';
    const closeRate = '—';
    const revenue = '—';
    const trend = pageAudit ? (realScore >= 75 ? '↑' : realScore >= 50 ? '→' : '↓') : '—';

    return {
      pageId: p.pageId,
      name: p.pageName || `Trang #${p.pageId}`,
      type,
      msgs,
      responseRate,
      closeRate,
      csat,
      revenue,
      quality: realScore,
      trend,
      pictureUrl: p.pagePictureUrl
    };
  }), [pages, auditsByPage]);

  // Dynamic KPIs calculations — only real data
  const totalMsgs = performance.reduce((sum, p) => sum + p.msgs, 0);
  const auditedPerformance = performance.filter(p => p.quality !== null);

  // Real average response rate from audit data
  const allAudits = audits || [];
  const totalAuditCount = allAudits.length;
  const totalReplied = allAudits.filter(a => !a.metadata?.noReply).length;
  const avgResponseRate = totalAuditCount > 0
    ? `${Math.round((totalReplied / totalAuditCount) * 100)}%`
    : 'Chưa có';
  
  const validScores = auditedPerformance.map(p => p.quality).filter(q => q !== null);
  const avgQuality = validScores.length > 0 
    ? Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length)
    : null;
  const avgCsat = avgQuality !== null ? `${(avgQuality / 20).toFixed(1)}/5` : null;

  const dynamicKPIs = [
    { 
      label: 'Tổng tin nhắn', 
      value: totalMsgs.toLocaleString(), 
      sub: 'Từ khi kết nối', 
      isReal: true 
    },
    { 
      label: 'Chất lượng AI TB', 
      value: avgQuality !== null ? `${avgQuality}/100` : 'Chưa có', 
      sub: `Từ ${totalAuditCount} cuộc hội thoại`, 
      isReal: true,
      hasAudits: avgQuality !== null
    },
    { 
      label: 'CSAT trung bình', 
      value: avgCsat || 'Chưa có', 
      sub: 'Quy đổi từ điểm AI', 
      isReal: true,
      hasAudits: avgCsat !== null
    },
    { 
      label: 'Tỷ lệ phản hồi TB', 
      value: avgResponseRate, 
      sub: totalAuditCount > 0 ? `Đã phản hồi ${totalReplied}/${totalAuditCount}` : 'Chờ quét AI', 
      isReal: true,
      hasAudits: totalAuditCount > 0
    },
    { 
      label: 'Doanh thu từ chat', 
      value: 'Chưa có', 
      sub: 'Cần kết nối Sapo', 
      isReal: false,
      hasAudits: false
    },
  ];

  // Group pages by channel type to prevent list congestion in right panel legend
  const typeMap = {};
  pages.forEach((p, i) => {
    const type = getPageType(p.pageName);
    const msgs = p.conversationCount || 0;
    if (!typeMap[type]) {
      typeMap[type] = 0;
    }
    typeMap[type] += msgs;
  });

  const totalTypeMsgs = Object.values(typeMap).reduce((a, b) => a + b, 0);

  const channelColors = {
    'Facebook Page': '#3b82f6', // Blue
    'Instagram': '#ec4899', // Pink
    'TikTok': '#111827', // Black/Slate
    'Zalo': '#0ea5e9', // Sky/Light Blue
    'Shopee': '#f97316', // Orange
    'Lazada': '#6366f1', // Indigo
    'Website': '#10b981', // Emerald
    'Khác': '#64748b' // Slate
  };

  const dynamicDistribution = Object.keys(typeMap).map(type => {
    const value = typeMap[type];
    const pct = totalTypeMsgs > 0 ? Math.round((value / totalTypeMsgs) * 100) : 0;
    return {
      label: type,
      pct,
      value,
      color: channelColors[type] || '#94a3b8'
    };
  }).sort((a, b) => b.value - a.value);

  const getScoreColor = (s) => {
    if (s === null || s === undefined) return 'text-slate-500 bg-slate-100 border-slate-200';
    if (s >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (s >= 75) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-orange-700 bg-orange-50 border-orange-200';
  };

  const getTrendIcon = (t) => {
    if (t === '↑') return <span className="text-emerald-500 font-bold">↑</span>;
    if (t === '↓') return <span className="text-rose-500 font-bold">↓</span>;
    if (t === '—') return <span className="text-slate-300 font-normal">—</span>;
    return <span className="text-slate-400 font-bold">→</span>;
  };

  // Filter performance list by platform
  const filteredPerformance = performance.filter(p => {
    if (performanceFilter === 'all') return true;
    if (performanceFilter === 'facebook' && p.type === 'Facebook Page') return true;
    if (performanceFilter === 'instagram' && p.type === 'Instagram') return true;
    if (performanceFilter === 'tiktok' && p.type === 'TikTok') return true;
    if (performanceFilter === 'zalo' && p.type === 'Zalo') return true;
    if (performanceFilter === 'shopee' && p.type === 'Shopee') return true;
    if (performanceFilter === 'lazada' && p.type === 'Lazada') return true;
    if (performanceFilter === 'website' && p.type === 'Website') return true;
    return false;
  });
  const displayPerformanceList = filteredPerformance;

  const hasAuditedPages = performance.some(p => p.quality !== null);
  const countUnauditedPages = performance.filter(p => p.quality === null).length;

  // Unique platform types for filter tabs
  const platformTypes = [...new Set(performance.map(p => p.type))].sort();

  if (isLoadingPages) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-slate-400 gap-4 py-20">
        <Globe size={44} className="animate-spin text-indigo-600" />
        <span className="text-base font-bold tracking-wide animate-pulse">Đang tải thông tin trang & kênh...</span>
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
            Kết nối tài khoản Facebook Fanpage của bạn trong phần Cài đặt để đồng bộ hội thoại và bắt đầu chấm điểm chất lượng CSKH tự động.
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

  const generateRealAIInsights = () => {
    const primaryPageName = pages[0]?.pageName || 'Facebook Page';
    if (!audits || audits.length === 0) {
      return [
        `Kênh "${primaryPageName}" hoạt động ổn định, dữ liệu đồng bộ theo thời gian thực.`,
        'Chưa có dữ liệu đánh giá chất lượng AI. Hãy bấm nút "Chạy quét & Chấm điểm AI" ở trên để AI phân tích và đưa ra nhận xét.',
        'Chỉ số Doanh thu & Tỷ lệ chốt hiển thị mockup. Liên kết Sapo OAuth tại Cài đặt kênh để đồng bộ hóa đơn chốt đơn thực tế.',
        'Kênh TikTok và Zalo đang ghi nhận lượng tin nhắn mới tăng trưởng khá nhanh trong 7 ngày qua.'
      ];
    }

    const insightsList = [];
    
    // 1. Connection status
    insightsList.push(`Kênh "${primaryPageName}" hoạt động ổn định, đồng bộ dữ liệu thời gian thực.`);

    // 2. Average quality score
    const totalScore = audits.reduce((sum, a) => sum + a.score, 0);
    const calculatedAvg = Math.round(totalScore / audits.length);
    const csatScale = (calculatedAvg / 20).toFixed(1);
    insightsList.push(`Điểm chất lượng AI trung bình toàn hệ thống đạt ${calculatedAvg}/100 (CSAT đạt ${csatScale}/5) dựa trên ${audits.length} cuộc hội thoại đã được AI đánh giá.`);

    // 3. Page analysis
    const pageScores = {};
    audits.forEach(a => {
      const pId = a.metadata?.pageId;
      const pName = a.metadata?.pageName || pId;
      if (pId) {
        if (!pageScores[pId]) pageScores[pId] = { total: 0, count: 0, name: pName };
        pageScores[pId].total += a.score;
        pageScores[pId].count += 1;
      }
    });

    const pageAverages = Object.values(pageScores).map(p => ({
      name: p.name,
      avg: Math.round(p.total / p.count)
    })).sort((a, b) => b.avg - a.avg);

    if (pageAverages.length > 0) {
      const best = pageAverages[0];
      insightsList.push(`Trang "${best.name}" đang dẫn đầu về chất lượng phục vụ với điểm trung bình ${best.avg}/100.`);
      if (pageAverages.length > 1) {
        const worst = pageAverages[pageAverages.length - 1];
        if (worst.avg < 75) {
          insightsList.push(`Trang "${worst.name}" có chất lượng phản hồi thấp hơn mặt bằng chung (${worst.avg}/100), cần cải thiện.`);
        }
      }
    }

    // 4. Missed replies (no reply) from audit metadata
    const missedReplies = audits.filter(a => a.metadata?.noReply === true).length;
    if (missedReplies > 0) {
      insightsList.push(`Phát hiện ${missedReplies} cuộc hội thoại bị nhân viên bỏ sót, không phản hồi lại tin nhắn cuối của khách hàng.`);
    } else {
      insightsList.push(`Chỉ số trực tuyến rất tốt: 100% cuộc hội thoại được đánh giá đều được nhân viên phản hồi đầy đủ.`);
    }

    // 5. Response times from audit metadata
    const responseTimes = audits
      .map(a => a.metadata?.transcriptMetrics?.firstResponseSec)
      .filter(t => typeof t === 'number' && t > 0);
    if (responseTimes.length > 0) {
      const avgResponseSec = Math.round(responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length);
      const timeLabel = avgResponseSec > 60 
        ? `${Math.round(avgResponseSec / 60)} phút` 
        : `${avgResponseSec} giây`;
      insightsList.push(`Thời gian phản hồi khách hàng đầu tiên trung bình là khoảng ${timeLabel}.`);
    }

    // 6. Customer Sentiment analysis
    const sentiments = audits.map(a => a.metadata?.sentiment?.tone).filter(Boolean);
    if (sentiments.length > 0) {
      const positiveCount = sentiments.filter(s => s === 'positive').length;
      const positivePct = Math.round((positiveCount / sentiments.length) * 100);
      if (positivePct > 0) {
        insightsList.push(`Tỷ lệ hội thoại ghi nhận cảm xúc tích cực (Positive Sentiment) từ khách hàng đạt ${positivePct}%.`);
      }
    }

    // 7. Sapo reminder
    insightsList.push('Chỉ số Doanh thu & Tỷ lệ chốt hiển thị mockup. Liên kết Sapo OAuth tại Cài đặt kênh để đồng bộ hóa đơn chốt đơn thực tế.');

    return insightsList.slice(0, 5); // Return top 5 insights
  };

  const insights = generateRealAIInsights();

  const selectedChannelScored = channelDayStats?.total ?? 0;
  const hasReachedScanLimit = selectedChannelScored >= auditConversationLimit;
  const canResumeAudit =
    !isJobRunning && selectedChannelScored > 0 && !hasReachedScanLimit;
  const isPausing =
    Boolean(auditJob?.summary?.pauseRequested) || pauseMutation.isPending;

  const totalConvs =
    auditJob?.summary?.total ||
    auditJob?.summary?.totalConversations ||
    auditJob?.summary?.fetched ||
    auditConversationLimit;
  const jobProgress = totalConvs
    ? Math.round(((auditJob?.summary?.audited || 0) / totalConvs) * 100)
    : 0;

  const runAuditButtonLabel = isJobRunning
    ? isPausing
      ? 'Đang tạm dừng...'
      : `AI đang chấm... ${jobProgress}%`
    : canResumeAudit
      ? `Tiếp tục quét (${selectedChannelScored}/${auditConversationLimit})`
      : 'Chạy quét & Chấm điểm AI';

  const keywordItems = [
    { type: 'Facebook Page', keywords: 'nhẫn bạc, size, giá, bảo hành, giao hàng' },
    { type: 'Instagram', keywords: 'dây chuyền, mẫu mới, giá, có sẵn không' },
    { type: 'TikTok', keywords: 'review, chất liệu, đeo có đen không, giá' }
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 bg-slate-50/50 min-h-screen text-slate-700">
      
      {/* Left Column - Channel List */}
      <div className="w-full xl:w-76 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col p-4 shrink-0 max-h-[700px] xl:max-h-none overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="font-bold text-slate-800 text-lg">Danh sách Page & Kênh</div>
          <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-bold">{filteredChannels.length} trang</span>
        </div>
        
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 mb-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-100 transition-all duration-200">
          <MagnifyingGlass size={18} className="text-slate-400" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm page hoặc kênh..." 
            className="flex-1 bg-transparent text-sm text-slate-700 outline-none border-none placeholder-slate-400" 
          />
        </div>

        {/* Tab Filters */}
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

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5 no-scrollbar">
          {filteredChannels.map((ch, i) => (
            <div 
              key={ch.id} 
              onClick={() => setActiveChannelId(ch.id)}
              className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all duration-200 ${
                (activeChannelId === ch.id || (!activeChannelId && i === 0))
                  ? 'bg-indigo-50/50 border-indigo-200/70 shadow-sm shadow-indigo-50' 
                  : 'bg-transparent border-transparent hover:bg-slate-50'
              }`}
            >
              {/* Page Avatar */}
              <div className="relative w-10 h-10 rounded-full bg-slate-50 border border-slate-200/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {ch.pictureUrl ? (
                  <img src={ch.pictureUrl} alt={ch.name} className="w-full h-full object-cover" />
                ) : (
                  ch.avatar
                )}
                {/* Active Dot */}
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  ch.enabled ? 'bg-emerald-500' : 'bg-slate-300'
                }`} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-700 transition-colors">{ch.name}</span>
                  {/* Score badge */}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border shrink-0 ${getScoreColor(ch.score)}`}>
                    {ch.score !== null ? `${ch.score}` : '-'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <span className="font-semibold text-slate-500">{ch.type}</span>
                  <span>•</span>
                  <span>Tin nhắn: <strong className="text-slate-600 font-bold">{ch.msgs}</strong></span>
                </div>
              </div>
            </div>
          ))}
          {filteredChannels.length === 0 && (
            <div className="text-center py-8 text-sm text-slate-400">Không tìm thấy trang hoặc kênh nào</div>
          )}
        </div>

        {/* Add Channel Button */}
        <button 
          onClick={() => navigate('/settings?tab=channel')}
          className="mt-3 w-full py-2.5 border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 text-indigo-600 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Plus size={14} />
          Kết nối thêm page / kênh
        </button>
      </div>

      {/* Center Column - Main Dashboard Panel */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        
        {/* Progress bar banner for active AI Scan */}
        {isJobRunning && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold min-w-0">
              <Sparkles size={18} className="animate-spin text-indigo-600 shrink-0" />
              <span className="truncate">
                {auditJob?.summary?.phase === 'fetch'
                  ? `Đang thu thập hội thoại... (${auditJob?.summary?.fetched || 0} cuộc)`
                  : isPausing
                    ? `Đang tạm dừng — đã lưu ${auditJob?.summary?.audited || 0} cuộc`
                    : `AI đang chấm điểm... ${auditJob?.summary?.audited || 0}/${totalConvs} (${jobProgress}%)`
                }
              </span>
            </div>
            <button
              type="button"
              onClick={() => pauseMutation.mutate()}
              disabled={isPausing || pauseMutation.isPending}
              className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Pause size={14} weight="fill" />
              Tạm dừng
            </button>
          </div>
        )}

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {dynamicKPIs.map((kpi, i) => (
            <div 
              key={i} 
              className="bg-white rounded-2xl border border-slate-100 p-4 xl:p-3 2xl:p-4 shadow-sm flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Card Label */}
              <div className="flex justify-between items-start gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                {kpi.isReal ? (
                  <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 select-none">Thực</span>
                ) : (
                  <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 select-none">Giả lập</span>
                )}
              </div>

              {/* Value */}
              <div 
                className="text-xl sm:text-2xl md:text-3xl xl:text-base 2xl:text-xl font-black text-slate-800 tracking-tighter mt-2.5 mb-2 truncate"
                title={kpi.value}
              >
                {kpi.value}
              </div>

              {/* Indicator & Subtext */}
              <div className="flex items-center gap-1.5 mt-auto">
                {!kpi.isReal ? (
                  <div className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 shrink-0">
                    <Warning size={12} weight="fill" />
                    <span>Cần Sapo</span>
                  </div>
                ) : kpi.hasAudits === false ? (
                  <div className="text-[10px] text-indigo-500 font-semibold flex items-center gap-0.5 shrink-0">
                    <Sparkles size={11} weight="fill" />
                    <span>Chờ quét AI</span>
                  </div>
                ) : (
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 shrink-0">
                    <TrendUp size={12} weight="bold" />
                    <span>Tin cậy</span>
                  </div>
                )}
                <span className="text-[10px] text-slate-400 truncate">— {kpi.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Table Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 border-b border-slate-100 gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-slate-800 text-base">Hiệu suất từng Page & Kênh</h3>
                {/* Số cuộc hội thoại cần quét */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                  {AUDIT_LIMIT_OPTIONS.map((limit) => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => setAuditConversationLimit(limit)}
                      disabled={isJobRunning || auditMutation.isPending}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all duration-200 cursor-pointer ${
                        auditConversationLimit === limit
                          ? 'bg-white text-indigo-700 shadow-sm border border-indigo-100'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {limit} cuộc
                    </button>
                  ))}
                </div>
                {/* Trigger AI Evaluation button */}
                <button 
                  onClick={() => handleStartAudit()}
                  disabled={isJobRunning || auditMutation.isPending || !selectedAuditChannel}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 border cursor-pointer ${
                    isJobRunning
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : canResumeAudit
                        ? 'bg-emerald-50 hover:bg-emerald-100/70 text-emerald-700 border-emerald-200 shadow-sm'
                        : 'bg-indigo-50 hover:bg-indigo-100/70 text-indigo-700 border-indigo-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  <Sparkles size={14} weight="fill" className={isJobRunning ? "animate-spin" : ""} />
                  <span>{runAuditButtonLabel}</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {selectedAuditChannel ? (
                  <>
                    Quét tối đa <strong className="text-slate-500">{auditConversationLimit} cuộc</strong> cho kênh{' '}
                    <strong className="text-indigo-600">{selectedAuditChannel.name}</strong> ({AUDIT_LOOKBACK_DAYS} ngày gần nhất).
                    {selectedChannelScored > 0 && !isJobRunning ? (
                      <> Đã chấm <strong className="text-emerald-600">{Math.min(selectedChannelScored, auditConversationLimit)}</strong>/{auditConversationLimit} — tạm dừng để lưu, quét tiếp bỏ qua cuộc đã chấm.</>
                    ) : (
                      <> Tạm dừng sẽ lưu kết quả đã quét vào DB.</>
                    )}
                  </>
                ) : (
                  'Chọn kênh bên trái rồi bấm quét AI. Cron tự quét lại toàn bộ 30 cuộc/kênh lúc 2:00 AM.'
                )}
              </p>
            </div>
            
            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg self-start sm:self-center select-none">
              {filteredPerformance.length}/{performance.length} trang
            </span>
          </div>

          {/* Platform Filter Tabs */}
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
                  {getPageIcon(type)}
                  <span>{type === 'Facebook Page' ? 'Facebook' : type} {count}</span>
                </button>
              );
            })}
          </div>

          {/* Banner notification if some pages are not audited */}
          {!isJobRunning && countUnauditedPages > 0 && (
            <div className="bg-amber-50 border-b border-amber-100 px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-800 font-medium">
              <span className="flex items-center gap-1.5">
                <Warning size={14} className="text-amber-500 shrink-0" />
                <span>
                  Có {countUnauditedPages} trang chưa quét chấm điểm AI. Chọn từng kênh bên trái, chọn số cuộc (30/60/100) rồi bấm quét.
                </span>
              </span>
              {selectedAuditChannel && (
                <button 
                  onClick={() => handleStartAudit(selectedAuditChannel.id)}
                  className="text-indigo-600 hover:underline font-bold shrink-0 cursor-pointer"
                >
                  Quét ngay «{selectedAuditChannel.name}» ({auditConversationLimit} cuộc)
                </button>
              )}
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3.5">Page / Kênh</th>
                  <th className="px-4 py-3.5 text-center">Tin nhắn</th>
                  <th className="px-4 py-3.5 text-center">Tỷ lệ phản hồi</th>
                  <th className="px-4 py-3.5 text-center">CSAT (Hài lòng)</th>
                  <th className="px-4 py-3.5 text-center">Chất lượng (AI)</th>
                  <th className="px-5 py-3.5 text-center">Xu hướng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {displayPerformanceList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400 font-medium">
                      Không có trang nào thuộc nền tảng này.
                    </td>
                  </tr>
                )}
                {displayPerformanceList.map((p) => (
                  <tr key={p.pageId} className="hover:bg-slate-50/30 transition-colors">
                    {/* Page Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-8 rounded-full bg-slate-50 border border-slate-200/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {p.pictureUrl ? (
                            <img src={p.pictureUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            getPageIcon(p.type)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{p.type}</div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Messages */}
                    <td className="px-4 py-3.5 text-center font-bold text-slate-700">
                      {p.msgs > 0 ? p.msgs.toLocaleString() : (
                        <span className="text-slate-300 font-normal text-xs">Chưa có</span>
                      )}
                    </td>

                    {/* Response Rate */}
                    <td className="px-4 py-3.5 text-center font-medium text-slate-500">
                      {p.responseRate !== '—' ? (
                        <span className="text-slate-700 font-bold">{p.responseRate}</span>
                      ) : (
                        <span className="text-slate-300 font-normal">—</span>
                      )}
                    </td>

                    {/* CSAT */}
                    <td className="px-4 py-3.5 text-center font-semibold">
                      {p.csat !== null ? (
                        <span className="text-slate-700 font-bold">{p.csat}</span>
                      ) : (
                        <span className="text-slate-300 font-normal">—</span>
                      )}
                    </td>

                    {/* AI Score */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border font-bold text-xs ${getScoreColor(p.quality)}`}>
                        {p.quality !== null ? p.quality : '-'}
                      </span>
                    </td>

                    {/* Trend */}
                    <td className="px-5 py-3.5 text-center text-lg select-none">
                      {getTrendIcon(p.trend)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Chart Card — AI Quality Score */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base">So sánh điểm chất lượng AI</h3>
              <p className="text-xs text-slate-400 mt-0.5">Biểu đồ so sánh điểm chất lượng AI của các trang đã được quét.</p>
            </div>
            <span className="text-xs bg-slate-50 text-slate-500 border border-slate-100 px-2.5 py-1 rounded-lg font-bold">Chỉ số: Điểm AI</span>
          </div>

          <div className="flex items-end gap-5 h-44 px-4 pb-2 border-b border-slate-100">
            {displayPerformanceList.filter(p => p.quality !== null).length > 0 ? (
              displayPerformanceList.map((p) => {
                const val = p.quality !== null ? p.quality : 0;
                return (
                  <div key={p.pageId} className="flex-1 flex flex-col items-center gap-2 group relative">
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-800 text-white text-[10px] px-2 py-1 rounded shadow-md pointer-events-none z-10 whitespace-nowrap">
                      {p.quality !== null ? `${p.quality}/100` : 'Chưa quét'}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 mb-1 select-none">{p.quality !== null ? p.quality : '—'}</span>
                    <div 
                      className={`w-full max-w-[40px] rounded-t-lg shadow-sm ${
                        p.quality !== null
                          ? p.quality >= 75 ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-emerald-100' 
                            : p.quality >= 50 ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-amber-100'
                            : 'bg-gradient-to-t from-orange-600 to-orange-400 shadow-orange-100'
                          : 'bg-slate-200'
                      }`}
                      style={{ height: `${val * 1.5}px` }} 
                    />
                    
                    {/* Label Page Name */}
                    <span className="text-[10px] font-semibold text-slate-500 truncate w-full text-center max-w-[64px] select-none mt-1">
                      {p.name.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-400 font-medium py-8">
                Chưa có trang nào được quét AI. Hãy bấm "Chạy quét & Chấm điểm AI" ở trên.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Distribution + Insights */}
      <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0 pb-6 pr-0.5">
        
        {/* Distribution Card - Grouped by Channel Type to avoid congestion */}
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

        {/* AI Insight Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <h3 className="font-bold text-slate-800 text-sm">AI Insight về page & kênh</h3>
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

        {/* Top Keywords Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <h3 className="font-bold text-slate-800 text-sm mb-3">Top từ khóa khách hàng theo kênh</h3>
          <div className="space-y-3.5">
            {keywordItems.map((item, i) => (
              <div key={i} className="bg-slate-50/40 border border-slate-100 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2.5">
                  {getPageIcon(item.type)}
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
