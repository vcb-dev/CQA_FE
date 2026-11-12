import { Fragment, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CaretDown,
  CaretLeft,
  CaretRight,
  ChartBar,
  ChatCircleText,
  CheckCircle,
  CurrencyCircleDollar,
  Funnel,
  Info,
  MagnifyingGlass,
  Package,
  Star,
  Target,
  TrendUp,
  UsersThree,
  Warning,
} from '@phosphor-icons/react';
import AnalyticsShell from '@/components/analytics/AnalyticsShell';
import KpiGrid from '@/components/analytics/KpiGrid';
import { getApiErrorMessage } from '@/lib/axios';
import { ROLE_LABELS } from '@/features/user-access/api';
import {
  CRITERIA_LABELS,
  CRITERIA_MAX,
  fetchEmployeePerformance,
} from '@/features/employees/api';

const PAGE_SIZE = 10;

const PERIOD_PRESETS = [
  { key: 'month', label: 'Tháng này' },
  { key: 'lastMonth', label: 'Tháng trước' },
  { key: '7d', label: '7 ngày' },
  { key: '30d', label: '30 ngày' },
  { key: 'custom', label: 'Tuỳ chọn' },
];

const SORT_OPTIONS = [
  { key: 'revenue', label: 'Doanh thu' },
  { key: 'score', label: 'Điểm hội thoại' },
  { key: 'closeRate', label: 'Tỷ lệ chốt' },
  { key: 'orders', label: 'Đơn chốt' },
  { key: 'conversations', label: 'Hội thoại' },
];

const STATUS_OPTIONS = ['Đạt chuẩn', 'Cần theo dõi', 'Cần cải thiện', 'Chưa có điểm'];

const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const presetRange = (key) => {
  const today = new Date();
  if (key === 'lastMonth') {
    return {
      from: toDateKey(new Date(today.getFullYear(), today.getMonth() - 1, 1)),
      to: toDateKey(new Date(today.getFullYear(), today.getMonth(), 0)),
    };
  }
  if (key === '7d' || key === '30d') {
    const days = key === '7d' ? 6 : 29;
    return {
      from: toDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - days)),
      to: toDateKey(today),
    };
  }
  return {
    from: toDateKey(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: toDateKey(today),
  };
};

const formatDateLabel = (key) => key.split('-').reverse().join('/');

const scoreColor = (score) => {
  if (score == null) return '#9ca3af';
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#d97706';
  return '#dc2626';
};

const employeeStatus = (score) => {
  if (score == null) return 'Chưa có điểm';
  if (score >= 80) return 'Đạt chuẩn';
  if (score >= 60) return 'Cần theo dõi';
  return 'Cần cải thiện';
};

const statusStyle = (status) => {
  if (status === 'Đạt chuẩn') return { className: 'tag tag-green' };
  if (status === 'Cần theo dõi') return { className: 'tag tag-orange' };
  if (status === 'Cần cải thiện') return { className: 'tag tag-red' };
  return { className: 'tag', style: { background: '#f3f4f6', color: '#6b7280' } };
};

const formatMoney = (value) => `${Math.round(value).toLocaleString('vi-VN')}₫`;

const formatMoneyShort = (value) => {
  if (!value) return '0₫';
  if (value >= 1000000000) {
    return `${(value / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`;
  }
  return formatMoney(value);
};

const formatRate = (value) => (value == null ? '—' : `${value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%`);

const initials = (name) => (name || '?')
  .split(/[\s@.]+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((word) => word[0])
  .join('')
  .toUpperCase();

const sortValue = (employee, key) => {
  const value = employee[key];
  return value == null ? -1 : value;
};

const controlStyle = {
  height: '34px',
  border: '1px solid #e5e7eb',
  borderRadius: '7px',
  background: '#fff',
  color: '#374151',
  fontSize: '13px',
  padding: '0 10px',
};

const panelStyle = { border: '1px solid #f3f4f6', borderRadius: '10px', background: '#fff', padding: '12px' };

function MetricBar({ value, color, max = 100, width = 92 }) {
  return (
    <div style={{ height: '5px', width, background: '#f3f4f6', borderRadius: '999px', overflow: 'hidden', marginTop: '5px' }}>
      <div style={{ height: '100%', width: `${Math.min(((value ?? 0) / max) * 100, 100)}%`, background: color, borderRadius: '999px' }} />
    </div>
  );
}

function DetailRow({ label, value, hint }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', padding: '7px 0', borderBottom: '1px dashed #f3f4f6', fontSize: '12.5px' }}>
      <span style={{ color: '#4b5563' }}>
        {label}
        {hint && <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af' }}>{hint}</span>}
      </span>
      <b style={{ color: '#111827', whiteSpace: 'nowrap' }}>{value}</b>
    </div>
  );
}

function ExpandedEmployeeDetail({ employee }) {
  const hasCriteria = Object.values(employee.criteria).some((value) => value != null);

  return (
    <tr>
      <td colSpan={8} style={{ padding: 0, background: '#f9fafb' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', padding: '14px 16px 16px 58px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={panelStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '10px' }}>
              <ChartBar size={17} weight="duotone" style={{ color: '#4f46e5' }} />
              Điểm theo tiêu chí
              <span style={{ marginLeft: 'auto', fontSize: '11.5px', fontWeight: 600, color: '#6b7280' }}>
                {employee.auditCount.toLocaleString('vi-VN')} lượt chấm AI
              </span>
            </div>
            {hasCriteria ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
                  const value = employee.criteria[key];
                  const color = scoreColor(value == null ? null : (value / CRITERIA_MAX) * 100);
                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                        <span style={{ color: '#4b5563', fontWeight: 600 }}>{label}</span>
                        <span style={{ color, fontWeight: 800 }}>
                          {value == null ? '—' : value.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
                          <span style={{ color: '#9ca3af', fontWeight: 600 }}>/{CRITERIA_MAX}</span>
                        </span>
                      </div>
                      <MetricBar value={value} max={CRITERIA_MAX} color={color} width="100%" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: '12.5px', color: '#6b7280', lineHeight: 1.5 }}>
                Chưa có hội thoại nào của nhân viên được AI chấm điểm trong kỳ này.
              </div>
            )}
          </div>

          <div style={panelStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '4px' }}>
              <ChatCircleText size={17} weight="duotone" style={{ color: '#2563eb' }} />
              Hội thoại phụ trách
            </div>
            <DetailRow label="Đã trả lời từ CRM" value={employee.repliedConversations.toLocaleString('vi-VN')} />
            <DetailRow label="Được gắn “Nhân viên chốt”" value={employee.labeledConversations.toLocaleString('vi-VN')} />
            <DetailRow label="Chốt bằng đơn hàng" value={employee.closedByOrder.toLocaleString('vi-VN')} />
            <DetailRow label="Chốt bằng nhãn “Đã chốt”" value={employee.closedByLabel.toLocaleString('vi-VN')} />
            <DetailRow label="Kênh được giao" value={employee.assignedPageCount ? `${employee.assignedPageCount} kênh` : 'Chưa phân kênh'} />
          </div>

          <div style={panelStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '4px' }}>
              <Target size={17} weight="duotone" style={{ color: '#16a34a' }} />
              Hiệu quả bán hàng
            </div>
            <DetailRow label="Doanh thu" value={formatMoney(employee.revenue)} />
            <DetailRow
              label="Giá trị đơn trung bình"
              value={employee.orders ? formatMoney(employee.revenue / employee.orders) : '—'}
            />
            <DetailRow
              label="Doanh thu / hội thoại"
              value={employee.conversations ? formatMoney(employee.revenue / employee.conversations) : '—'}
            />
            <DetailRow
              label="Tỷ lệ chốt"
              value={formatRate(employee.closeRate)}
              hint={`${employee.closedConversations.toLocaleString('vi-VN')} chốt / ${employee.conversations.toLocaleString('vi-VN')} hội thoại`}
            />
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function EmployeesPage() {
  const [preset, setPreset] = useState('month');
  const [range, setRange] = useState(() => presetRange('month'));
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState('revenue');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
  const normalizedSearch = search.trim().toLowerCase();

  const { data, isLoading, isFetching, isError, error } = useQuery({
    queryKey: ['employees', 'performance', range.from, range.to],
    queryFn: () => fetchEmployeePerformance(range.from, range.to),
    enabled: !!range.from && !!range.to && range.from <= range.to,
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });

  const employees = useMemo(() => data?.employees ?? [], [data]);
  const totals = data?.totals;

  const ranked = useMemo(
    () => [...employees]
      .sort((a, b) => sortValue(b, sortKey) - sortValue(a, sortKey) || (a.fullName || a.email).localeCompare(b.fullName || b.email, 'vi'))
      .map((employee, index) => ({ ...employee, rank: index + 1, status: employeeStatus(employee.score) })),
    [employees, sortKey],
  );

  const filtered = useMemo(() => ranked.filter((employee) => {
    const matchesSearch = !normalizedSearch || [employee.fullName, employee.email, employee.phoneNumber]
      .some((field) => field?.toLowerCase().includes(normalizedSearch));
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [ranked, normalizedSearch, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedEmployeeId(null);
  }, [normalizedSearch, statusFilter, sortKey, range.from, range.to]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length ? ((currentPage - 1) * PAGE_SIZE) + 1 : 0;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);
  const activeCount = employees.filter((employee) => employee.isActive).length;
  const needImproveCount = ranked.filter((employee) => employee.status === 'Cần cải thiện').length;

  const kpiItems = [
    {
      label: 'Nhân viên',
      value: employees.length,
      sub: `${activeCount} đang hoạt động`,
      icon: UsersThree,
      color: '#4f46e5',
      bg: '#eef2ff',
    },
    {
      label: 'Điểm hội thoại TB',
      value: totals?.score == null ? '—' : totals.score.toLocaleString('vi-VN', { maximumFractionDigits: 1 }),
      sub: `${(totals?.auditCount ?? 0).toLocaleString('vi-VN')} lượt chấm AI`,
      icon: Star,
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      label: 'Tỷ lệ chốt',
      value: formatRate(totals?.closeRate ?? null),
      sub: `${(totals?.closedConversations ?? 0).toLocaleString('vi-VN')} hội thoại chốt`,
      icon: Target,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      label: 'Doanh thu',
      value: formatMoneyShort(totals?.revenue ?? 0),
      sub: 'từ đơn tạo trong hội thoại',
      icon: CurrencyCircleDollar,
      color: '#16a34a',
      bg: '#ecfdf5',
    },
    {
      label: 'Hội thoại',
      value: (totals?.conversations ?? 0).toLocaleString('vi-VN'),
      sub: `${needImproveCount} nhân viên cần cải thiện`,
      icon: ChatCircleText,
      color: '#0891b2',
      bg: '#ecfeff',
    },
    {
      label: 'Đơn chốt',
      value: (totals?.orders ?? 0).toLocaleString('vi-VN'),
      sub: `${formatDateLabel(range.from)} – ${formatDateLabel(range.to)}`,
      icon: Package,
      color: '#7c3aed',
      bg: '#f5f3ff',
    },
  ];

  const choosePreset = (key) => {
    setPreset(key);
    if (key !== 'custom') setRange(presetRange(key));
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSortKey('revenue');
    choosePreset('month');
  };

  return (
    <AnalyticsShell demo={false}>
    <div className="page-scroll">
      <KpiGrid items={kpiItems} columns={6} />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', margin: '12px 0', padding: '10px 12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontSize: '12.5px', lineHeight: 1.5 }}>
        <Info size={16} weight="duotone" style={{ color: '#6366f1', flexShrink: 0, marginTop: '2px' }} />
        <span>
          Hội thoại được tính cho nhân viên khi họ trả lời từ CRM, được gắn nhãn <b>“Nhân viên chốt”</b> hoặc tạo đơn trong hội thoại.
          Hội thoại chốt là hội thoại có đơn hoặc nhãn <b>“Đã chốt”</b>. Điểm là trung bình điểm AI của các hội thoại đó.
          Lượt trả lời và đơn hàng chỉ được ghi nhận từ khi tính năng này chạy, nên dữ liệu trước đó chỉ có ở hội thoại đã gắn nhãn.
        </span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '220ms' }}>
        <div className="card-title" style={{ marginBottom: '12px', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '7px' }}>
            <UsersThree size={18} weight="duotone" style={{ color: '#4f46e5' }} />
            Danh sách nhân viên
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
              {rangeStart}-{rangeEnd}/{filtered.length} nhân viên
            </span>
            {isFetching && !isLoading && (
              <span style={{ fontSize: '11.5px', color: '#6366f1', fontWeight: 500 }}>Đang cập nhật…</span>
            )}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ display: 'inline-flex', border: '1px solid #e5e7eb', borderRadius: '7px', overflow: 'hidden', height: '34px' }}>
              {PERIOD_PRESETS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => choosePreset(item.key)}
                  style={{
                    padding: '0 10px',
                    fontSize: '12.5px',
                    fontWeight: preset === item.key ? 700 : 500,
                    background: preset === item.key ? '#eef2ff' : '#fff',
                    color: preset === item.key ? '#3730a3' : '#4b5563',
                    borderRight: '1px solid #f3f4f6',
                    cursor: 'pointer',
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {preset === 'custom' && (
              <>
                <input
                  type="date"
                  value={range.from}
                  max={range.to}
                  onChange={(event) => event.target.value && setRange((prev) => ({ ...prev, from: event.target.value }))}
                  style={{ ...controlStyle, width: '140px' }}
                  aria-label="Từ ngày"
                />
                <input
                  type="date"
                  value={range.to}
                  min={range.from}
                  onChange={(event) => event.target.value && setRange((prev) => ({ ...prev, to: event.target.value }))}
                  style={{ ...controlStyle, width: '140px' }}
                  aria-label="Đến ngày"
                />
              </>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f9fafb', padding: '0 10px', borderRadius: '7px', border: '1px solid #e5e7eb', height: '34px' }}>
              <MagnifyingGlass size={15} style={{ color: '#9ca3af' }} />
              <input
                type="text"
                placeholder="Tìm tên, email, số điện thoại..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ background: 'transparent', fontSize: '13px', color: '#374151', width: '200px' }}
              />
            </div>
            <select value={sortKey} onChange={(event) => setSortKey(event.target.value)} style={{ ...controlStyle, width: '170px' }} aria-label="Xếp hạng theo">
              {SORT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>Xếp hạng: {option.label}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ ...controlStyle, width: '150px' }} aria-label="Trạng thái">
              <option value="all">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button type="button" onClick={resetFilters} style={{ ...controlStyle, display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <Funnel size={15} weight="duotone" />
              Xóa lọc
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '1080px' }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Nhân viên</th>
                <th>Điểm hội thoại</th>
                <th>Tỷ lệ chốt</th>
                <th>Doanh thu</th>
                <th>Hội thoại</th>
                <th>Đơn chốt</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: '#6b7280' }}>Đang tải số liệu nhân viên…</td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: '#dc2626' }}>{getApiErrorMessage(error)}</td>
                </tr>
              ) : !currentItems.length ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: '#6b7280' }}>
                    {employees.length ? 'Không có nhân viên khớp bộ lọc' : 'Chưa có tài khoản nhân viên nào (không tính quản trị viên)'}
                  </td>
                </tr>
              ) : currentItems.map((employee) => {
                const color = scoreColor(employee.score);
                const isExpanded = expandedEmployeeId === employee.id;
                const status = statusStyle(employee.status);
                const name = employee.fullName || employee.email;

                return (
                  <Fragment key={employee.id}>
                    <tr style={{ cursor: 'default', background: isExpanded ? '#eef2ff' : undefined, opacity: employee.isActive ? 1 : 0.6 }}>
                      <td>
                        <span className={`rank-badge ${employee.rank <= 3 ? `rank-${employee.rank}` : 'rank-n'}`}>
                          {employee.rank}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setExpandedEmployeeId(isExpanded ? null : employee.id)}
                          aria-expanded={isExpanded}
                          style={{ display: 'flex', alignItems: 'center', gap: '9px', width: '100%', textAlign: 'left', background: 'transparent', cursor: 'pointer' }}
                        >
                          <div style={{ width: '34px', height: '34px', flexShrink: 0, borderRadius: '50%', background: `hsl(${employee.id * 41}, 58%, 54%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                            {initials(name)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 800, color: '#111827' }}>
                              {name}
                              {!employee.isActive && (
                                <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#6b7280', background: '#f3f4f6', borderRadius: '4px', padding: '0 5px' }}>Đã khóa</span>
                              )}
                              <CaretDown size={13} weight="bold" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .16s ease', color: '#6b7280' }} />
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#6b7280' }}>
                              {ROLE_LABELS[employee.role] ?? employee.role} • {employee.email} • {employee.assignedPageCount ? `${employee.assignedPageCount} kênh` : 'chưa phân kênh'}
                            </div>
                          </div>
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 800, color }}>
                            {employee.score == null ? '—' : employee.score.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}
                          </span>
                          {employee.score != null && <TrendUp size={14} weight="bold" style={{ color }} />}
                        </div>
                        {employee.score == null ? (
                          <div style={{ fontSize: '11.5px', color: '#9ca3af' }}>Chưa được chấm</div>
                        ) : (
                          <MetricBar value={employee.score} color={color} />
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{formatRate(employee.closeRate)}</div>
                        <div style={{ fontSize: '11.5px', color: '#6b7280' }}>
                          {employee.closedConversations.toLocaleString('vi-VN')} chốt / {employee.conversations.toLocaleString('vi-VN')} hội thoại
                        </div>
                      </td>
                      <td>
                        <div title={formatMoney(employee.revenue)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: employee.revenue ? 'var(--success-700)' : '#9ca3af' }}>
                          <CurrencyCircleDollar size={16} weight="duotone" />
                          {formatMoneyShort(employee.revenue)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                          <ChatCircleText size={15} style={{ color: '#9ca3af' }} />
                          {employee.conversations.toLocaleString('vi-VN')}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#6b7280' }}>
                          {employee.repliedConversations.toLocaleString('vi-VN')} đã trả lời
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
                          <Package size={15} weight="duotone" style={{ color: '#2563eb' }} />
                          {employee.orders.toLocaleString('vi-VN')}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#6b7280' }}>
                          {employee.orders ? `TB ${formatMoneyShort(employee.revenue / employee.orders)}/đơn` : 'chưa có đơn'}
                        </div>
                      </td>
                      <td>
                        <span className={status.className} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', ...status.style }}>
                          {employee.status === 'Đạt chuẩn' ? <CheckCircle size={12} weight="bold" /> : <Warning size={12} weight="bold" />}
                          {employee.status}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && <ExpandedEmployeeDetail employee={employee} />}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
          <div style={{ fontSize: '12.5px', color: '#6b7280' }}>
            Kỳ {formatDateLabel(range.from)} – {formatDateLabel(range.to)} · hiển thị {rangeStart}-{rangeEnd} trong {filtered.length} nhân viên
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              style={{ ...controlStyle, display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
            >
              <CaretLeft size={14} weight="bold" />
              Trước
            </button>
            <span style={{ minWidth: '76px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: '#374151' }}>
              {currentPage}/{totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              style={{ ...controlStyle, display: 'inline-flex', alignItems: 'center', gap: '5px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >
              Sau
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </AnalyticsShell>
  );
}
