import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowDown, ArrowUp, ArrowUpDown, Link2, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import {
  MagnifyingGlass, FloppyDisk, Sparkle, CheckCircle, CaretRight, Sliders, Play, GearSix,
  Shield, HardDrive, ArrowsCounterClockwise, Megaphone, Package, Wrench, Brain, Key,
  FacebookLogo, InstagramLogo, YoutubeLogo, ThreadsLogo, TiktokLogo,
  Lightbulb, Bell, Link, ClipboardText
} from '@phosphor-icons/react';
import { settingsTabs, qaPrompts, qaCriteria, settingsQuickLinks } from '../../data/mockData';
import {
  fetchCskhPages,
  getCskhOAuthStartUrl,
  refreshCskhOAuth,
  connectTikTokAccounts,
  setCskhPageEnabled,
  setCskhPageInfo,
  deleteCskhPage,
  syncInboxFromGraph,
  isAsyncInboxSync,
} from '@/features/cskh-quality/api';
import { buildOAuthChannelReturnUrl } from '@/lib/authSession';
import PancakeChannelsPanel from '@/features/pancake-test/PancakeChannelsPanel';

const FB_FALLBACK_IMG =
  'https://www.facebook.com/images/profile/timeline/homepage/composer/logo_graphic.png';
const IG_FALLBACK_IMG = 'https://www.instagram.com/static/images/ico/favicon-192.png';
const TT_FALLBACK_IMG = 'https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png';

/** 1 hàng bảng kênh — team/người quản lý/khu vực nhập tay, nút Lưu gộp cạnh Xóa ở cột Hành động. */
function ChannelPageRow({ page, fallbackImg, onToggle, onDelete, onUpdateInfo }) {
  const [team, setTeam] = useState(page.team || '');
  const [managerName, setManagerName] = useState(page.managerName || '');
  const [region, setRegion] = useState(page.region || '');

  useEffect(() => {
    setTeam(page.team || '');
    setManagerName(page.managerName || '');
    setRegion(page.region || '');
  }, [page.team, page.managerName, page.region]);

  const dirty =
    team.trim() !== (page.team || '') ||
    managerName.trim() !== (page.managerName || '') ||
    region.trim() !== (page.region || '');

  const inputStyle = {
    width: '100%',
    padding: '4px 6px',
    fontSize: '11.5px',
    color: '#374151',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
  };

  return (
    <tr style={{ height: '54px' }}>
      <td>
        <img
          src={page.pagePictureUrl || fallbackImg}
          alt={page.pageName || ''}
          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #e5e7eb' }}
          onError={(e) => {
            e.target.src = fallbackImg;
          }}
        />
      </td>
      <td>
        <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#1f2937' }}>
          {page.pageName || 'Không có tên'}
        </div>
      </td>
      <td style={{ fontSize: '11.5px', color: '#6b7280', fontFamily: 'monospace' }}>
        {page.pageId}
      </td>
      <td style={{ width: '96px' }}>
        <input type="text" value={team} placeholder="—" onChange={(e) => setTeam(e.target.value)} style={inputStyle} />
      </td>
      <td style={{ width: '110px' }}>
        <input type="text" value={managerName} placeholder="—" onChange={(e) => setManagerName(e.target.value)} style={inputStyle} />
      </td>
      <td style={{ width: '96px' }}>
        <input type="text" value={region} placeholder="—" onChange={(e) => setRegion(e.target.value)} style={inputStyle} />
      </td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            checked={page.enabled}
            onChange={(e) => onToggle(page.pageId, e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '12px', color: page.enabled ? '#16a34a' : '#6b7280', fontWeight: 600 }}>
            {page.enabled ? 'Đang hoạt động' : 'Tạm dừng'}
          </span>
        </div>
      </td>
      <td style={{ textAlign: 'right' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            type="button"
            disabled={!dirty}
            onClick={() =>
              onUpdateInfo(page.pageId, { team: team.trim(), managerName: managerName.trim(), region: region.trim() })
            }
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: `1px solid ${dirty ? '#c7d2fe' : '#e5e7eb'}`,
              background: dirty ? '#eef2ff' : '#f9fafb',
              color: dirty ? '#4338ca' : '#9ca3af',
              fontSize: '11px',
              fontWeight: 600,
              cursor: dirty ? 'pointer' : 'default',
            }}
          >
            Lưu
          </button>
          <button
            onClick={() => {
              if (confirm(`Bạn có chắc muốn xóa ${page.pageName || page.pageId} khỏi hệ thống?`)) {
                onDelete(page.pageId);
              }
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #fee2e2',
              background: '#fef2f2',
              color: '#dc2626',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Xóa
          </button>
        </div>
      </td>
    </tr>
  );
}

const CHANNEL_PAGE_SIZE = 10;
const selectStyle = {
  padding: '7px 8px',
  fontSize: '12px',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  color: '#374151',
  background: '#fff',
  minWidth: '120px',
};

/** Header bấm được để sắp theo Team/Người quản lý/Khu vực — cùng kiểu mũi tên với bảng Phân quyền. */
function SortableChannelHeader({ field, label, width, sortBy, sortDir, onSort }) {
  const active = sortBy === field;
  return (
    <th
      onClick={() => onSort(field)}
      title={`Bấm để sắp theo ${label}`}
      style={{ width, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: active ? '#4f46e5' : 'inherit' }}>
        {label}
        {active ? (
          sortDir === 'asc' ? (
            <ArrowUp size={12} style={{ color: '#4f46e5' }} />
          ) : (
            <ArrowDown size={12} style={{ color: '#4f46e5' }} />
          )
        ) : (
          <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
        )}
      </span>
    </th>
  );
}

function ChannelPagesTable({
  pages,
  nameHeader,
  fallbackImg,
  busy,
  busyText,
  emptyText,
  onToggle,
  onDelete,
  onUpdateInfo,
  search = '',
  teamFilter = '',
  managerFilter = '',
  regionFilter = '',
  statusFilter = '',
}) {
  const [page, setPage] = useState(1);
  // sortBy: null (giữ thứ tự BE trả — enabled trước, tên A-Z) hoặc 'team'/'managerName'/'region'.
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const toggleSort = (field) => {
    if (sortBy !== field) {
      setSortBy(field);
      setSortDir('asc');
    } else {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pages.filter((p) => {
      if (
        q &&
        !(p.pageName || '').toLowerCase().includes(q) &&
        !(p.pageId || '').toLowerCase().includes(q)
      ) {
        return false;
      }
      if (teamFilter && (p.team || '') !== teamFilter) return false;
      if (managerFilter && (p.managerName || '') !== managerFilter) return false;
      if (regionFilter && (p.region || '') !== regionFilter) return false;
      if (statusFilter === 'active' && !p.enabled) return false;
      if (statusFilter === 'inactive' && p.enabled) return false;
      return true;
    });
  }, [pages, search, teamFilter, managerFilter, regionFilter, statusFilter]);

  // Kênh chưa gắn Team/Người quản lý/Khu vực (rỗng) luôn rớt xuống cuối, dù sort chiều nào.
  const sorted = useMemo(() => {
    if (!sortBy) return filtered;
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = (a[sortBy] || '').trim();
      const bv = (b[sortBy] || '').trim();
      if (!av && !bv) return 0;
      if (!av) return 1;
      if (!bv) return -1;
      return av.localeCompare(bv, 'vi') * dir;
    });
  }, [filtered, sortBy, sortDir]);

  // Đổi bộ lọc/tìm kiếm (dùng chung), sắp xếp, hoặc số kênh thay đổi (thêm/xóa) → về lại trang 1.
  useEffect(() => {
    setPage(1);
  }, [search, teamFilter, managerFilter, regionFilter, statusFilter, sortBy, sortDir, pages.length]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / CHANNEL_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = sorted.slice(
    (currentPage - 1) * CHANNEL_PAGE_SIZE,
    currentPage * CHANNEL_PAGE_SIZE
  );

  if (busy) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '36px 24px', gap: '10px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', color: '#6b7280' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: '#4f46e5' }} />
        <span style={{ fontSize: '12px', fontWeight: 500 }}>{busyText}</span>
      </div>
    );
  }
  if (!pages.length) {
    return (
      <div style={{ padding: '18px', textAlign: 'center', background: '#f9fafb', borderRadius: '8px', color: '#6b7280', fontSize: '12px', border: '1px solid #e5e7eb', lineHeight: 1.5 }}>
        {emptyText}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {filtered.length !== pages.length && (
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11.5px', color: '#6b7280' }}>
            {filtered.length}/{pages.length} kênh khớp bộ lọc
          </span>
        </div>
      )}

      <div style={{ overflow: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <table className="data-table" style={{ margin: 0 }}>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>{nameHeader}</th>
              <th>ID kênh</th>
              <SortableChannelHeader field="team" label="Team" width="96px" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
              <SortableChannelHeader field="managerName" label="Người quản lý" width="110px" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
              <SortableChannelHeader field="region" label="Khu vực" width="96px" sortBy={sortBy} sortDir={sortDir} onSort={toggleSort} />
              <th>Trạng thái hoạt động</th>
              <th style={{ textAlign: 'right' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
                  Không tìm thấy kênh nào khớp bộ lọc.
                </td>
              </tr>
            )}
            {pageRows.map((page) => (
              <ChannelPageRow
                key={page.pageId}
                page={page}
                fallbackImg={fallbackImg}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdateInfo={onUpdateInfo}
              />
            ))}
            {/* Trang cuối ít hàng hơn vẫn giữ đủ chiều cao — 1 khối trắng liền, không kẻ viền như hàng thật,
                để không nhìn như "hàng rỗng" nhưng nút phân trang/khối bên dưới tuyệt đối không xê dịch. */}
            {totalPages > 1 && pageRows.length < CHANNEL_PAGE_SIZE && (
              <tr aria-hidden="true">
                <td
                  colSpan={8}
                  style={{ height: `${(CHANNEL_PAGE_SIZE - pageRows.length) * 54}px`, padding: 0, border: 'none' }}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', color: currentPage <= 1 ? '#d1d5db' : '#4b5563', fontWeight: 500, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer' }}
          >
            Trước
          </button>
          <span style={{ fontSize: '11.5px', color: '#4b5563', minWidth: '78px', textAlign: 'center' }}>
            Trang {currentPage}/{totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            style={{ fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', color: currentPage >= totalPages ? '#d1d5db' : '#4b5563', fontWeight: 500, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [anim, setAnim] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const channelTabIdx = settingsTabs.indexOf('Cài đặt kênh');
  const defaultTabIdx = searchParams.get('tab') === 'channel' && channelTabIdx !== -1 ? channelTabIdx : 1;
  const [activeTabIdx, setActiveTabIdx] = useState(defaultTabIdx);

  const [criteria, setCriteria] = useState(qaCriteria);
  const [prompts, setPrompts] = useState(qaPrompts);
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const [promptContent, setPromptContent] = useState(
    `Bạn là một chuyên gia đánh giá chất lượng chăm sóc khách hàng của thương hiệu trang sức VIENCHIBAO. Hãy phân tích đoạn hội thoại chat giữa Nhân viên tư vấn (Agent) và Khách hàng (Customer) để chấm điểm và rút ra nhận xét.

Các tiêu chí cần đánh giá:
1. Chào hỏi thân thiện, tạo thiện cảm ban đầu (Trọng số 10%)
2. Khai thác nhu cầu, hỏi rõ thắc mắc về size, chất liệu (Trọng số 25%)
3. Tư vấn giải pháp, gửi ảnh thật, báo giá đúng sản phẩm (Trọng số 20%)
4. Xử lý từ chối khéo léo khi khách hàng chần chừ về giá (Trọng số 10%)
5. Kỹ năng dẫn dắt chốt đơn, chốt size, tạo đơn hàng thành công (Trọng số 25%)
6. Theo dõi chăm sóc sau bán (Trọng số 10%)

Đầu ra định dạng JSON chứa điểm tổng quan, điểm từng tiêu chí, lý do chi tiết, ưu điểm và điểm cần cải thiện.`
  );
  
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro');
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const [autoAssign, setAutoAssign] = useState(true);
  const [backupFreq, setBackupFreq] = useState('daily');

  // Fetch real channels/pages
  const { data: pagesData, isLoading: isLoadingPages, isFetching: isFetchingPages } = useQuery({
    queryKey: ['cskh', 'pages'],
    queryFn: () => fetchCskhPages(),
    refetchInterval: (query) =>
      query.state.data?.oauthSyncStatus === 'running' ? 2_000 : false,
  });

  // Toggle active/inactive status
  const toggleMutation = useMutation({
    mutationFn: ({ pageId, enabled }) => setCskhPageEnabled(pageId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cskh', 'pages'] });
      toast.success('Cập nhật trạng thái trang thành công!');
    },
    onError: (err) => {
      toast.error('Lỗi khi cập nhật trạng thái trang: ' + (err.message || err));
    }
  });

  // Gắn nhãn team/người quản lý/khu vực — nhập tay, không liên kết bảng nào khác
  const updateInfoMutation = useMutation({
    mutationFn: ({ pageId, data }) => setCskhPageInfo(pageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cskh', 'pages'] });
      toast.success('Đã lưu thông tin kênh!');
    },
    onError: (err) => {
      toast.error('Lỗi khi cập nhật thông tin kênh: ' + (err.message || err));
    }
  });
  const handleUpdatePageInfo = (pageId, data) => updateInfoMutation.mutate({ pageId, data });

  // Delete page
  const deleteMutation = useMutation({
    mutationFn: (pageId) => deleteCskhPage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cskh', 'pages'] });
      toast.success('Đã xóa trang thành công!');
    },
    onError: (err) => {
      toast.error('Lỗi khi xóa trang: ' + (err.message || err));
    }
  });

  // Sync messages
  const [isSyncing, setIsSyncing] = useState(false);
  const syncMutation = useMutation({
    mutationFn: (pageId) => syncInboxFromGraph(pageId),
    onMutate: () => {
      setIsSyncing(true);
    },
    onSuccess: (data) => {
      setIsSyncing(false);
      if (isAsyncInboxSync(data)) {
        toast.info(data.message || 'Đang đồng bộ nền — làm mới danh sách sau vài phút');
        return;
      }
      toast.success(`Đồng bộ thành công ${data.synced} tin nhắn từ ${data.pageCount} trang!`);
    },
    onError: (err) => {
      setIsSyncing(false);
      toast.error('Lỗi khi đồng bộ tin nhắn: ' + (err.message || err));
    }
  });

  // Refresh OAuth pages list
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshMutation = useMutation({
    mutationFn: () => refreshCskhOAuth(),
    onMutate: () => {
      setIsRefreshing(true);
    },
    onSuccess: (data) => {
      setIsRefreshing(false);
      queryClient.invalidateQueries({ queryKey: ['cskh', 'pages'] });
      const adsNote =
        typeof data.adAccountCount === 'number'
          ? data.adsReadConnected
            ? ` Marketing API: ${data.adAccountCount} tài khoản QC.`
            : ' Chưa thấy tài khoản QC — cần OAuth bằng admin quảng cáo.'
          : '';
      toast.success(`Đã đồng bộ lại ${data.pageCount} trang.${adsNote}`);
    },
    onError: (err) => {
      setIsRefreshing(false);
      toast.error('Lỗi khi đồng bộ lại danh sách trang: ' + (err.message || err));
    }
  });

  const isPagesBusy = isLoadingPages || isFetchingPages || isRefreshing;
  const isOAuthSyncing = pagesData?.oauthSyncStatus === 'running';
  const allChannelPages = pagesData?.pages ?? [];
  const fbPages = allChannelPages.filter((p) => p.platform !== 'instagram' && p.platform !== 'tiktok');
  const igPages = allChannelPages.filter((p) => p.platform === 'instagram');
  const ttPages = allChannelPages.filter((p) => p.platform === 'tiktok');
  const tiktokConnected = ttPages.length > 0;

  // Bộ lọc/tìm kiếm kênh — dùng chung cho cả 5 bảng (FB/IG/TikTok/Threads/YouTube),
  // để lọc theo Team/Người quản lý vẫn thấy đủ kênh của team đó dù khác nền tảng.
  const [channelSearch, setChannelSearch] = useState('');
  const [channelTeamFilter, setChannelTeamFilter] = useState('');
  const [channelManagerFilter, setChannelManagerFilter] = useState('');
  const [channelRegionFilter, setChannelRegionFilter] = useState('');
  const [channelStatusFilter, setChannelStatusFilter] = useState('');
  const channelTeamOptions = useMemo(
    () => Array.from(new Set(allChannelPages.map((p) => p.team).filter(Boolean))).sort(),
    [allChannelPages]
  );
  const channelManagerOptions = useMemo(
    () => Array.from(new Set(allChannelPages.map((p) => p.managerName).filter(Boolean))).sort(),
    [allChannelPages]
  );
  const channelRegionOptions = useMemo(
    () => Array.from(new Set(allChannelPages.map((p) => p.region).filter(Boolean))).sort(),
    [allChannelPages]
  );
  const hasChannelFilter = Boolean(
    channelSearch || channelTeamFilter || channelManagerFilter || channelRegionFilter || channelStatusFilter
  );
  const clearChannelFilters = () => {
    setChannelSearch('');
    setChannelTeamFilter('');
    setChannelManagerFilter('');
    setChannelRegionFilter('');
    setChannelStatusFilter('');
  };
  const channelFilterProps = {
    search: channelSearch,
    teamFilter: channelTeamFilter,
    managerFilter: channelManagerFilter,
    regionFilter: channelRegionFilter,
    statusFilter: channelStatusFilter,
  };

  const tiktokConnectMutation = useMutation({
    mutationFn: () => connectTikTokAccounts(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cskh', 'pages'] });
      queryClient.invalidateQueries({ queryKey: ['cskh', 'inbox'] });
      toast.success(`Đã kết nối ${data.pageCount} kênh TikTok từ Business Center.`);
    },
    onError: (err) => {
      toast.error('Không kết nối được TikTok: ' + (err.message || err));
    },
  });
  const isTikTokConnecting = tiktokConnectMutation.isPending;

  useEffect(() => {
    setTimeout(() => setAnim(true), 200);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'channel') {
      const idx = settingsTabs.indexOf('Cài đặt kênh');
      if (idx !== -1) {
        setActiveTabIdx(idx);
      }
    }
  }, [searchParams]);

  const handleWeightChange = (id, newWeight) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, weight: parseInt(newWeight) || 0 } : c));
  };

  const handleSaveSettings = () => {
    setShowSavedNotification(true);
    setTimeout(() => {
      setShowSavedNotification(false);
    }, 3000);
  };

  const currentCriteriaTotalWeight = criteria.reduce((sum, c) => sum + (c.active ? c.weight : 0), 0);

  return (
    <div style={{ display: 'flex', gap: '14px', height: '100%' }}>
      {/* Left - Settings Tabs Navigation */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ width: '220px', minWidth: '220px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1f2937', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GearSix size={16} weight="duotone" style={{ color: '#4f46e5' }} />
          Cấu hình hệ thống
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'auto' }}>
          {settingsTabs.map((tab, idx) => (
            <div 
              key={idx}
              onClick={() => setActiveTabIdx(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: activeTabIdx === idx ? '#eef2ff' : 'transparent',
                color: activeTabIdx === idx ? '#3730a3' : '#374151',
                fontWeight: activeTabIdx === idx ? 600 : 500,
                fontSize: '13px',
                transition: 'all var(--tr-fast)'
              }}
            >
              <span>{tab}</span>
              {activeTabIdx === idx && <CaretRight size={14} />}
            </div>
          ))}
        </div>

        <button 
          onClick={handleSaveSettings}
          style={{ 
            marginTop: '10px', 
            padding: '8px', 
            borderRadius: '6px', 
            fontSize: '13px', 
            fontWeight: 700, 
            background: '#4f46e5', 
            color: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '6px' 
          }}
        >
          <FloppyDisk size={14} /> Lưu tất cả
        </button>
      </div>

      {/* Center - Detailed settings parameters based on tab */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto', minWidth: 0 }}>
        {showSavedNotification && (
          <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #dcfce7', color: '#16a34a', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.3s ease' }}>
            <CheckCircle size={16} weight="duotone" />
            Đã cập nhật cấu hình hệ thống thành công! Tất cả các mô hình chấm điểm AI đang tự động học lại theo tiêu chí mới.
          </div>
        )}

        {/* Cài đặt Hệ thống (Tab 0) */}
        {settingsTabs[activeTabIdx] === 'Cài đặt hệ thống' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Cài đặt hệ thống chung</h3>
              <p style={{ fontSize: '11px', color: '#6b7280' }}>Quản lý hoạt động phân phối, múi giờ và tần suất sao lưu</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Tên nền tảng (Platform Title)</span>
                <input style={{ padding: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12.5px', color: '#1f2937' }} defaultValue="VIENCHIBAO Chat Quality Agent Platform" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Múi giờ</span>
                  <select style={{ padding: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12.5px', color: '#1f2937' }} defaultValue="gmt7">
                    <option value="gmt7">(GMT+07:00) Hà Nội, Bangkok, Jakarta</option>
                    <option value="gmt8">(GMT+08:00) Singapore, Manila, Beijing</option>
                    <option value="gmt0">(GMT+00:00) UTC Greenwich Mean Time</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#374151' }}>Tần suất sao lưu hệ thống</span>
                  <select 
                    value={backupFreq} 
                    onChange={(e) => setBackupFreq(e.target.value)}
                    style={{ padding: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12.5px', color: '#1f2937' }}
                  >
                    <option value="hourly">Hàng giờ</option>
                    <option value="daily">Hàng ngày (Vào lúc 00:00)</option>
                    <option value="weekly">Hàng tuần (Chủ nhật)</option>
                    <option value="monthly">Hàng tháng (Ngày 1)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                <input 
                  type="checkbox" 
                  id="autoAssign" 
                  checked={autoAssign} 
                  onChange={(e) => setAutoAssign(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }} 
                />
                <label htmlFor="autoAssign" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1f2937' }}>Tự động phân phối hội thoại (Smart Routing AI)</span>
                  <span style={{ fontSize: '10.5px', color: '#6b7280' }}>Tự động gán hội thoại mới từ QC cho nhân viên đang rảnh và có tỷ lệ chốt sản phẩm đó cao nhất</span>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#f9fafb', borderRadius: '8px' }}>
                <input 
                  type="checkbox" 
                  id="slackAlerts" 
                  defaultChecked={true}
                  style={{ width: 16, height: 16, cursor: 'pointer' }} 
                />
                <label htmlFor="slackAlerts" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1f2937' }}>Thông báo cảnh báo tiêu cực tức thời</span>
                  <span style={{ fontSize: '10.5px', color: '#6b7280' }}>Gửi thông báo gấp về kênh Slack quản lý ngay khi AI phát hiện hội thoại có cảm xúc &quot;Rất tiêu cực&quot;</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* AI & Chấm điểm (Tab 1) */}
        {settingsTabs[activeTabIdx] === 'AI & Chấm điểm' && (
          <>
            {/* Criteria weights setting */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '14px', animationDelay: '50ms' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '6px', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Thiết lập Tiêu chí & Trọng số chấm điểm</h3>
                  <p style={{ fontSize: '10.5px', color: '#6b7280' }}>Chỉnh sửa hệ thống thang điểm đánh giá cuộc hội thoại của Agent (Tổng trọng số phải bằng 100%)</p>
                </div>
                
                <span className="tag" style={{ 
                  background: currentCriteriaTotalWeight === 100 ? '#f0fdf4' : '#fef2f2',
                  color: currentCriteriaTotalWeight === 100 ? '#16a34a' : '#dc2626',
                  fontWeight: 700,
                  fontSize: '12px'
                }}>
                  Tổng trọng số: {currentCriteriaTotalWeight}% {currentCriteriaTotalWeight === 100 ? '✓' : '⚠️'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {criteria.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '6px 8px', background: '#f9fafb', borderRadius: '6px' }}>
                    <input 
                      type="checkbox" 
                      checked={c.active} 
                      onChange={(e) => {
                        setCriteria(prev => prev.map(item => item.id === c.id ? { ...item, active: e.target.checked } : item));
                      }}
                      style={{ width: 14, height: 14, cursor: 'pointer' }}
                    />
                    <div style={{ width: '130px', minWidth: '130px' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: c.active ? '#1f2937' : '#9ca3af' }}>{c.name}</div>
                      <div style={{ fontSize: '9.5px', color: '#9ca3af' }}>{c.desc}</div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="range" 
                        min="0" 
                        max="50" 
                        disabled={!c.active}
                        value={c.weight} 
                        onChange={(e) => handleWeightChange(c.id, e.target.value)}
                        style={{ flex: 1, height: '4px', cursor: c.active ? 'pointer' : 'default', accentColor: '#4f46e5' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: c.active ? '#1f2937' : '#9ca3af', minWidth: '30px', textAlign: 'right' }}>
                        {c.weight}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Model selector & System Prompts templates */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '14px', animationDelay: '150ms', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '6px' }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: '#111827' }}>Cấu hình Mô hình & AI System Prompts</h3>
                <p style={{ fontSize: '10.5px', color: '#6b7280' }}>Tùy chọn LLM làm nhiệm vụ chấm điểm tự động và chỉnh sửa hướng dẫn Prompt mẫu</p>
              </div>

              {/* Model selection */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#eef2ff', padding: '10px', borderRadius: '8px' }}>
                <Sparkle size={18} weight="duotone" style={{ color: '#4f46e5' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--primary-900)' }}>Trí tuệ nhân tạo chấm điểm (LLM Audit Engine)</div>
                  <div style={{ fontSize: '10.5px', color: '#3730a3' }}>Lựa chọn model phù hợp nhất cho bài toán đánh giá ngữ cảnh hội thoại phức tạp</div>
                </div>
                <select 
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', background: '#fff', border: '1px solid var(--primary-200)', fontSize: '12px', fontWeight: 600, color: 'var(--primary-800)', cursor: 'pointer' }}
                >
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Khuyên dùng)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Tốc độ cao)</option>
                  <option value="claude-3.5-sonnet">Claude 3.5 Sonnet (Đọc sâu)</option>
                  <option value="gpt-4o">GPT-4o (Đa dụng)</option>
                </select>
              </div>

              {/* Prompts config */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Danh sách Prompt mẫu</span>
                  {prompts.map((p, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        setSelectedPromptIdx(idx);
                        if (idx === 0) setPromptContent(`Bạn là một chuyên gia đánh giá chất lượng chăm sóc khách hàng của thương hiệu trang sức VIENCHIBAO. Hãy phân tích đoạn hội thoại chat giữa Nhân viên tư vấn (Agent) và Khách hàng (Customer) để chấm điểm và rút ra nhận xét.

Các tiêu chí cần đánh giá:
1. Chào hỏi thân thiện, tạo thiện cảm ban đầu (Trọng số 10%)
2. Khai thác nhu cầu, hỏi rõ thắc mắc về size, chất liệu (Trọng số 25%)
3. Tư vấn giải pháp, gửi ảnh thật, báo giá đúng sản phẩm (Trọng số 20%)
4. Xử lý từ chối khéo léo khi khách hàng chần chừ về giá (Trọng số 10%)
5. Kỹ năng dẫn dắt chốt đơn, chốt size, tạo đơn hàng thành công (Trọng số 25%)
6. Theo dõi chăm sóc sau bán (Trọng số 10%)

Đầu ra định dạng JSON chứa điểm tổng quan, điểm từng tiêu chí, lý do chi tiết, ưu điểm và điểm cần cải thiện.`);
                        else if (idx === 1) setPromptContent(`Hướng dẫn chấm điểm CSKH cho AI:
- Nhận diện các câu nói nhạy cảm, thiếu lịch sự hoặc chậm trễ phản hồi (trên 15 phút).
- Chấm điểm nghiêm khắc các lỗi không chào hỏi và kết thúc hội thoại hời hợt.
- Kiểm tra nhân viên có chủ động tư vấn ưu đãi/ship hay không.`);
                        else setPromptContent(`Prompt gợi ý trả lời tự động cho Agent:
- Dựa trên câu hỏi khách hàng về: giá, size nhẫn, bảo hành, chất liệu.
- Tra cứu nhanh bảng size nhẫn tiêu chuẩn và tóm tắt ngắn gọn trong 2-3 câu, giọng điệu ấm áp và chuyên nghiệp.
- Luôn kết thúc bằng một câu hỏi gợi mở chốt đơn.`);
                      }}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: selectedPromptIdx === idx ? 600 : 500,
                        background: selectedPromptIdx === idx ? '#e0e7ff' : 'transparent',
                        color: selectedPromptIdx === idx ? '#3730a3' : '#4b5563',
                        border: selectedPromptIdx === idx ? '1px solid var(--primary-200)' : '1px solid transparent',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Lightbulb size={12} weight={selectedPromptIdx === idx ? 'fill' : 'duotone'} />
                        <span>{p.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>HƯỚNG DẪN PROMPT HỆ THỐNG</span>
                  <textarea 
                    value={promptContent}
                    onChange={(e) => setPromptContent(e.target.value)}
                    style={{ 
                      flex: 1, 
                      minHeight: '160px', 
                      background: '#f9fafb', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '6px', 
                      padding: '8px', 
                      fontSize: '12px', 
                      fontFamily: 'monospace',
                      color: '#1f2937',
                      lineHeight: 1.45,
                      resize: 'none'
                    }} 
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', background: '#f3f4f6', color: '#374151', fontWeight: 500 }}>Khôi phục mặc định</button>
                    <button onClick={handleSaveSettings} style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '12px', background: '#4f46e5', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}><Play size={10} weight="fill" /> Lưu và Thử nghiệm</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Cài đặt kênh */}
        {settingsTabs[activeTabIdx] === 'Cài đặt kênh' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isLoadingPages && !pagesData ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: '12px', color: '#6b7280' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: '#4f46e5' }} />
                <span style={{ fontSize: '13px', fontWeight: 500 }}>Đang tải cấu hình kênh...</span>
              </div>
            ) : (
            <>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Cấu hình Kênh Kết nối</h3>
              <p style={{ fontSize: '11px', color: '#6b7280' }}>
                Kết nối Meta (Facebook/Instagram) và TikTok for Business riêng. Threads và YouTube chưa bật OAuth.
              </p>
            </div>

            {/* Tìm/lọc dùng chung cho cả 5 bảng bên dưới — nổi (sticky) khi cuộn để không phải kéo lên đổi lọc */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', position: 'sticky', top: 0, zIndex: 5, boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)' }}>
              <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '160px' }}>
                <MagnifyingGlass
                  size={14}
                  style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                />
                <input
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  placeholder="Tìm theo tên hoặc ID kênh (mọi nền tảng)..."
                  style={{ width: '100%', padding: '7px 10px 7px 28px', fontSize: '12px', border: '1px solid #e5e7eb', borderRadius: '6px', color: '#374151' }}
                />
              </div>
              <select value={channelTeamFilter} onChange={(e) => setChannelTeamFilter(e.target.value)} style={selectStyle}>
                <option value="">Tất cả Team</option>
                {channelTeamOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select value={channelManagerFilter} onChange={(e) => setChannelManagerFilter(e.target.value)} style={selectStyle}>
                <option value="">Tất cả người quản lý</option>
                {channelManagerOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <select value={channelRegionFilter} onChange={(e) => setChannelRegionFilter(e.target.value)} style={selectStyle}>
                <option value="">Tất cả khu vực</option>
                {channelRegionOptions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <select value={channelStatusFilter} onChange={(e) => setChannelStatusFilter(e.target.value)} style={selectStyle}>
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
              <button
                type="button"
                onClick={clearChannelFilters}
                disabled={!hasChannelFilter}
                style={{
                  padding: '7px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  color: hasChannelFilter ? '#dc2626' : '#d1d5db',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: hasChannelFilter ? 'pointer' : 'not-allowed',
                  whiteSpace: 'nowrap',
                }}
              >
                Xóa lọc
              </button>
            </div>

            {/* ===== Kênh từ Facebook ===== */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FacebookLogo size={18} weight="fill" style={{ color: '#1877f2' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>
                    Tài khoản Meta
                  </h4>
                </div>
                {pagesData?.oauthConnected && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => refreshMutation.mutate()}
                      disabled={isRefreshing}
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        background: '#f9fafb', 
                        border: '1px solid #e5e7eb', 
                        color: '#374151',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        cursor: 'pointer' 
                      }}
                    >
                      <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                      Đồng bộ lại Pages
                    </button>
                    
                    <button 
                      onClick={() => syncMutation.mutate(undefined)}
                      disabled={isSyncing}
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        background: '#4f46e5', 
                        color: '#fff',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        cursor: 'pointer' 
                      }}
                    >
                      <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                      Đồng bộ tin nhắn
                    </button>
                  </div>
                )}
              </div>

            <div style={{ 
              background: pagesData?.oauthConnected ? '#f0fdf4' : '#f9fafb', 
              border: pagesData?.oauthConnected ? '1px solid #dcfce7' : '1px solid #e5e7eb',
              borderRadius: '8px', 
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: pagesData?.oauthConnected ? '#1877f2' : '#e5e7eb', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0
                }}>
                  <FacebookLogo size={20} weight={pagesData?.oauthConnected ? 'fill' : 'regular'} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1f2937' }}>
                    {pagesData?.oauthConnected ? `Tài khoản Facebook: ${pagesData.oauthUser}` : 'Chưa kết nối tài khoản Facebook'}
                  </h4>
                  <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {isPagesBusy ? (
                      <>
                        <Loader2 size={12} className="animate-spin" style={{ color: '#4f46e5' }} />
                        Đang cập nhật thông tin kết nối...
                      </>
                    ) : pagesData?.oauthConnected 
                      ? `Kết nối hoạt động. Đồng bộ cuối: ${pagesData.oauthUpdatedAt ? new Date(pagesData.oauthUpdatedAt).toLocaleString('vi-VN') : 'Chưa rõ'}`
                      : 'Kết nối Facebook để đồng bộ tin nhắn từ Fanpage của bạn.'}
                  </p>
                  {pagesData?.oauthConnected && !isPagesBusy && (
                    <>
                      <p style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        marginTop: '6px',
                        color: pagesData.adAccountCount === undefined
                          ? '#6b7280'
                          : pagesData.adsReadConnected
                            ? '#15803d'
                            : '#b45309',
                      }}>
                        {pagesData.adAccountCount === undefined
                          ? 'Trạng thái Marketing API: cần cập nhật server mới'
                          : pagesData.adsReadConnected
                            ? `✓ Marketing API: ${pagesData.adAccountCount} tài khoản QC (Ads Manager)`
                            : '⚠ Chưa thấy tài khoản QC — OAuth bằng admin trên Business Manager'}
                      </p>
                      {pagesData.adsReadConnected && pagesData.adAccountCount != null && (
                        <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px', lineHeight: 1.45, maxWidth: '420px' }}>
                          Đây là số <strong>tài khoản chi tiêu QC</strong> trên Ads Manager —{' '}
                          <strong>không phải</strong> số Fanpage đang chạy quảng cáo.
                          Nhiều Page có thể chạy QC qua chung một tài khoản; bạn đang quản lý{' '}
                          <strong>{fbPages.length} Fanpage</strong> bên dưới.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>

              <button 
                onClick={() => {
                  window.location.href = getCskhOAuthStartUrl(buildOAuthChannelReturnUrl());
                }}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  fontSize: '12.5px', 
                  fontWeight: 600, 
                  background: '#1877f2', 
                  color: '#fff',
                  border: 'none',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  cursor: 'pointer' 
                }}
              >
                <Link2 size={14} />
                {pagesData?.oauthConnected ? 'Cập nhật kết nối Facebook' : 'Kết nối tài khoản Facebook'}
              </button>
            </div>

            {isOAuthSyncing && (
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '11px',
                color: '#1d4ed8',
                lineHeight: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <Loader2 size={14} className="animate-spin" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Đang đồng bộ Fanpage từ Facebook...</strong> Bạn có thể dùng hệ thống ngay;
                  danh sách Page sẽ cập nhật tự động trong vài giây.
                </span>
              </div>
            )}

            {pagesData?.oauthSyncStatus === 'failed' && pagesData?.oauthSyncError && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '11px',
                color: '#b91c1c',
                lineHeight: 1.5,
              }}>
                <strong>Đồng bộ Page thất bại:</strong> {pagesData.oauthSyncError}
              </div>
            )}

            {pagesData?.oauthConnected && pagesData.adsReadConnected === false && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '11px',
                color: '#92400e',
                lineHeight: 1.5,
              }}>
                <strong>Chưa kết nối Marketing API:</strong> Facebook Page đã kết nối nhưng hệ thống không thấy tài khoản quảng cáo.
                Bấm <strong>Cập nhật kết nối Facebook</strong> và đăng nhập bằng tài khoản <strong>admin tài khoản QC</strong> trên Business Manager
                (không phải nút &quot;Đồng bộ lại Pages&quot;).
              </div>
            )}

            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                Kênh theo nền tảng
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FacebookLogo size={18} weight="fill" style={{ color: '#1877f2' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Facebook</h4>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 999 }}>
                    {fbPages.length} kênh
                  </span>
                </div>
                <ChannelPagesTable
                  {...channelFilterProps}
                  pages={fbPages}
                  nameHeader="Tên Trang / Fanpage"
                  fallbackImg={FB_FALLBACK_IMG}
                  busy={isPagesBusy}
                  busyText={isRefreshing ? 'Đang đồng bộ lại danh sách trang...' : 'Đang tải danh sách trang...'}
                  emptyText={pagesData?.oauthConnected
                    ? 'Không tìm thấy Fanpage nào. Kiểm tra lại quyền truy cập Facebook.'
                    : 'Kết nối tài khoản Facebook để lấy Fanpage vào mục này.'}
                  onToggle={(pageId, enabled) => toggleMutation.mutate({ pageId, enabled })}
                  onDelete={(pageId) => deleteMutation.mutate(pageId)}
                  onUpdateInfo={handleUpdatePageInfo}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <InstagramLogo size={18} weight="fill" style={{ color: '#e1306c' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Instagram</h4>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 999 }}>
                    {igPages.length} kênh
                  </span>
                </div>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                  Instagram Professional gắn vào Fanpage trên Meta. Sau đó bấm <strong>Cập nhật kết nối Facebook</strong> để cấp quyền tin nhắn.
                </p>
                <ChannelPagesTable
                  {...channelFilterProps}
                  pages={igPages}
                  nameHeader="Tên Instagram"
                  fallbackImg={IG_FALLBACK_IMG}
                  busy={isPagesBusy}
                  busyText="Đang tải kênh Instagram..."
                  emptyText={pagesData?.oauthConnected
                    ? 'Chưa thấy Instagram nào. Gắn Instagram Professional vào Fanpage (Meta Business Suite), rồi Cập nhật kết nối Facebook.'
                    : 'Kết nối Facebook trước, rồi gắn Instagram Professional vào Fanpage.'}
                  onToggle={(pageId, enabled) => toggleMutation.mutate({ pageId, enabled })}
                  onDelete={(pageId) => deleteMutation.mutate(pageId)}
                  onUpdateInfo={handleUpdatePageInfo}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TiktokLogo size={18} weight="fill" style={{ color: '#111827' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>TikTok</h4>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 999 }}>
                    {ttPages.length} kênh
                  </span>
                </div>
                <p style={{ fontSize: 11, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
                  Scope <strong>TikTok Accounts</strong> — lấy kênh TikTok Business đã gắn Business Center vào CRM.
                  Chat (Business Messaging) xin riêng sau khi list kênh xong.
                </p>
                <div style={{
                  background: tiktokConnected ? '#f0fdf4' : '#f9fafb',
                  border: tiktokConnected ? '1px solid #dcfce7' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: tiktokConnected ? '#111827' : '#e5e7eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', flexShrink: 0,
                    }}>
                      <TiktokLogo size={20} weight="fill" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                        {tiktokConnected
                          ? `TikTok Business Center · ${ttPages.length} kênh`
                          : 'Chưa kết nối TikTok for Business'}
                      </h4>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0' }}>
                        {isTikTokConnecting
                          ? 'Đang xác thực TikTok Accounts và lấy danh sách kênh từ BC…'
                          : tiktokConnected
                            ? 'Đã ủy quyền. Danh sách bên dưới là TikTok account gắn Business Center.'
                            : 'Bấm kết nối để ủy quyền TikTok Accounts và kéo kênh vào CRM.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isTikTokConnecting}
                    onClick={() => tiktokConnectMutation.mutate()}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      background: '#111827',
                      color: '#fff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: isTikTokConnecting ? 'wait' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isTikTokConnecting ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                    {tiktokConnected ? 'Cập nhật kết nối TikTok' : 'Kết nối TikTok for Business'}
                  </button>
                </div>
                <ChannelPagesTable
                  {...channelFilterProps}
                  pages={ttPages}
                  nameHeader="Tên kênh TikTok"
                  fallbackImg={TT_FALLBACK_IMG}
                  busy={isTikTokConnecting}
                  busyText="Đang lấy kênh TikTok từ Business Center..."
                  emptyText="Chưa có kênh TikTok. Bấm Kết nối TikTok for Business để ủy quyền Accounts API."
                  onToggle={(pageId, enabled) => toggleMutation.mutate({ pageId, enabled })}
                  onDelete={(pageId) => deleteMutation.mutate(pageId)}
                  onUpdateInfo={handleUpdatePageInfo}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ThreadsLogo size={18} weight="fill" style={{ color: '#111827' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>Threads</h4>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 999 }}>
                    0 kênh
                  </span>
                </div>
                <ChannelPagesTable
                  {...channelFilterProps}
                  pages={[]}
                  nameHeader="Tên Threads"
                  fallbackImg={IG_FALLBACK_IMG}
                  busy={false}
                  busyText=""
                  emptyText="Chưa kết nối Threads. Nền tảng này cần OAuth riêng — chưa bật trên hệ thống."
                  onToggle={() => {}}
                  onDelete={() => {}}
                  onUpdateInfo={() => {}}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <YoutubeLogo size={18} weight="fill" style={{ color: '#ff0000' }} />
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>YouTube</h4>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 999 }}>
                    0 kênh
                  </span>
                </div>
                <ChannelPagesTable
                  {...channelFilterProps}
                  pages={[]}
                  nameHeader="Tên kênh"
                  fallbackImg="https://www.youtube.com/s/desktop/favicon.ico"
                  busy={false}
                  busyText=""
                  emptyText="Chưa kết nối YouTube. Nền tảng này cần OAuth riêng — chưa bật trên hệ thống."
                  onToggle={() => {}}
                  onDelete={() => {}}
                  onUpdateInfo={() => {}}
                />
              </div>
            </div>

            {/* ===== Kênh từ Pancake ===== */}
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: '#4f46e5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800,
                }}>
                  P
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>
                    Kênh từ Pancake
                  </h4>
                  <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>
                    Toàn bộ page/kênh gắn với User Access Token Pancake (Facebook, IG, TikTok…).
                  </p>
                </div>
              </div>
              <PancakeChannelsPanel />
            </div>
            </>
            )}
          </div>
        )}

        {/* Phân quyền (Tab Phân quyền) */}
        {settingsTabs[activeTabIdx] === 'Phân quyền' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Phân quyền & Quản trị viên</h3>
              <p style={{ fontSize: '11px', color: '#6b7280' }}>Quản lý vai trò truy cập nền tảng và gán quyền cho nhân viên</p>
            </div>

            <div style={{ overflow: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Quyền chính</th>
                    <th>Hoạt động cuối</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Bùi Duy Cường', email: 'cuong@vienchibao.com', role: 'Admin', permission: 'Toàn bộ hệ thống, chỉnh sửa tiêu chí & API', active: 'Vừa xong' },
                    { name: 'Nguyễn Thu Hương', email: 'huongnt@vienchibao.com', role: 'Manager', permission: 'Xem báo cáo, phê duyệt audit nháp', active: '10 phút trước' },
                    { name: 'Lê Thảo Vy', email: 'vylt@vienchibao.com', role: 'Auditor', permission: 'Chấm điểm thủ công, đánh giá phụ', active: '30 phút trước' },
                    { name: 'Trần Minh Quân', email: 'quantm@vienchibao.com', role: 'Agent', permission: 'Chỉ xem điểm cá nhân và chat khách hàng', active: '2 giờ trước' },
                  ].map((user, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#1f2937' }}>{user.name}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: '#6b7280' }}>{user.email}</td>
                      <td>
                        <span className="tag" style={{ 
                          background: user.role === 'Admin' ? '#e0e7ff' : user.role === 'Manager' ? '#f0fdf4' : '#f3f4f6', 
                          color: user.role === 'Admin' ? '#3730a3' : user.role === 'Manager' ? '#16a34a' : '#4b5563',
                          fontWeight: 700
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#4b5563' }}>{user.permission}</td>
                      <td style={{ fontSize: '11px', color: '#9ca3af' }}>{user.active}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button style={{ padding: '6px', fontSize: '12.5px', color: '#4f46e5', fontWeight: 600, border: '1px dashed var(--primary-300)', borderRadius: '6px', marginTop: '6px' }}>
              + Thêm người dùng mới / Gán vai trò
            </button>
          </div>
        )}

        {/* Mock for other tabs */}
        {settingsTabs[activeTabIdx] !== 'Cài đặt hệ thống' && settingsTabs[activeTabIdx] !== 'AI & Chấm điểm' && settingsTabs[activeTabIdx] !== 'Cài đặt kênh' && settingsTabs[activeTabIdx] !== 'Phân quyền' && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center' }}>
              <GearSix size={32} weight="duotone" style={{ color: '#4f46e5' }} />
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{settingsTabs[activeTabIdx]}</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px', maxWidth: '300px' }}>
                Hệ thống đang cấu hình các thông số mặc định tốt nhất cho thương hiệu Viên Chi Bảo. Bạn có thể sử dụng ngay lập tức hoặc nhấn nút kích hoạt để ghi đè.
              </p>
            </div>
            <button onClick={handleSaveSettings} style={{ padding: '6px 16px', background: '#4f46e5', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Kích hoạt mặc định</button>
          </div>
        )}
      </div>

      {/* Right - Quick settings links and Backup status */}
      <div style={{ width: '280px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '14px', animationDelay: '200ms' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: '#1f2937', marginBottom: '8px' }}>Liên kết thiết lập nhanh</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {settingsQuickLinks.map((link, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '8px', 
                  padding: '6px', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background var(--tr-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {(() => {
                  const quickLinkIcons = {
                    '📢': Megaphone,
                    '📦': Package,
                    '🔧': Wrench,
                    '🤖': Brain,
                    '🔐': Key,
                    '🔔': Bell,
                    '🔗': Link,
                    '🧠': Brain,
                    '💾': HardDrive,
                    '📋': ClipboardText
                  };
                  const IconComp = quickLinkIcons[link.icon] || GearSix;
                  return <IconComp size={16} weight="duotone" style={{ color: '#4f46e5', flexShrink: 0, marginTop: '2px' }} />;
                })()}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937' }}>{link.title}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Health Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '14px', animationDelay: '250ms', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#fff' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'rgba(255,255,255,0.9)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HardDrive size={14} weight="duotone" /> Trạng thái dữ liệu
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px', color: 'rgba(255,255,255,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Dung lượng đã dùng:</span>
              <strong style={{ color: '#fff' }}>12.4 GB / 50 GB (24.8%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Số hội thoại lưu trữ:</span>
              <strong style={{ color: '#fff' }}>52.362 chat</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Độ trễ API AI:</span>
              <strong style={{ color: '#22c55e' }}>Tốt (84ms)</strong>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Sao lưu tự động:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#22c55e' }}><CheckCircle size={10} weight="fill" /> Bật</span>
            </div>
          </div>
          <button style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '4px', fontSize: '11px', fontWeight: 600, marginTop: '8px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <ArrowsCounterClockwise size={10} /> Sao lưu ngay lập tức
          </button>
        </div>
      </div>
    </div>
  );
}
