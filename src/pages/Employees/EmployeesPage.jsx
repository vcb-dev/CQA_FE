import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  CaretDown,
  CaretLeft,
  CaretRight,
  ChartBar,
  ChatCircleText,
  CheckCircle,
  CurrencyCircleDollar,
  Funnel,
  MagnifyingGlass,
  Package,
  Smiley,
  Star,
  Storefront,
  Target,
  TrendUp,
  UsersThree,
  Warning,
} from '@phosphor-icons/react';
import { employees } from '../../data/mockData';

const PAGE_SIZE = 10;

const scoreColor = (score) => {
  if (score >= 80) return 'var(--success-600)';
  if (score >= 70) return 'var(--warning-600)';
  return 'var(--danger-600)';
};

const improvementColor = (score) => {
  if (score >= 32) return 'var(--danger-600)';
  if (score >= 20) return 'var(--warning-600)';
  return 'var(--success-600)';
};

const achievementColor = (value) => {
  if (value >= 95) return 'var(--success-600)';
  if (value >= 82) return 'var(--warning-600)';
  return 'var(--danger-600)';
};

const statusClass = (status) => {
  if (status === 'Đạt chuẩn') return 'tag-green';
  if (status === 'Cần theo dõi') return 'tag-orange';
  return 'tag-red';
};

const average = (items, selector) => items.reduce((sum, item) => sum + selector(item), 0) / Math.max(items.length, 1);

const formatPercent = (value) => `${value.toFixed(1)}%`;

const formatMoneyShort = (value) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
  }

  return `${Math.round(value / 1000000).toLocaleString('vi-VN')}tr`;
};

const initials = (name) => name
  .split(' ')
  .filter(Boolean)
  .slice(0, 2)
  .map((word) => word[0])
  .join('')
  .toUpperCase();

const controlStyle = {
  height: '34px',
  border: '1px solid var(--n-200)',
  borderRadius: '7px',
  background: 'var(--white)',
  color: 'var(--n-700)',
  fontSize: '13px',
  padding: '0 10px',
};

function MetricBar({ value, color, max = 100, width = 92 }) {
  return (
    <div style={{ height: '5px', width, background: 'var(--n-100)', borderRadius: '999px', overflow: 'hidden', marginTop: '5px' }}>
      <div style={{ height: '100%', width: `${Math.min((value / max) * 100, 100)}%`, background: color, borderRadius: '999px' }} />
    </div>
  );
}

function KpiProgress({ label, actual, target, suffix = '', precision = 0 }) {
  const ratio = Math.round((actual / target) * 100);
  const color = achievementColor(ratio);
  const displayActual = typeof actual === 'number' ? actual.toLocaleString('vi-VN', { maximumFractionDigits: precision }) : actual;
  const displayTarget = typeof target === 'number' ? target.toLocaleString('vi-VN', { maximumFractionDigits: precision }) : target;

  return (
    <div style={{ border: '1px solid var(--n-100)', borderRadius: '8px', padding: '10px', background: 'var(--white)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '6px' }}>
        <span style={{ fontSize: '12px', color: 'var(--n-500)', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: '12px', color, fontWeight: 800 }}>{ratio}%</span>
      </div>
      <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--n-900)' }}>
        {displayActual}{suffix}
        <span style={{ color: 'var(--n-400)', fontWeight: 600 }}> / {displayTarget}{suffix}</span>
      </div>
      <MetricBar value={ratio} color={color} width="100%" />
    </div>
  );
}

function QualityChart({ employee }) {
  const maxTrend = Math.max(...employee.qualityTrend.map((item) => item.score), 100);

  return (
    <div style={{ border: '1px solid var(--n-100)', borderRadius: '10px', background: 'var(--white)', padding: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '10px' }}>
        <ChartBar size={17} weight="duotone" style={{ color: 'var(--primary-600)' }} />
        Biểu đồ chất lượng
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '9px', height: '96px', padding: '6px 4px 0', borderBottom: '1px solid var(--n-100)' }}>
        {employee.qualityTrend.map((item) => (
          <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', height: '100%' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: scoreColor(item.score) }}>{item.score}</div>
            <div style={{ width: '100%', maxWidth: '28px', height: `${Math.max(22, (item.score / maxTrend) * 68)}px`, borderRadius: '6px 6px 0 0', background: `linear-gradient(180deg, ${scoreColor(item.score)}, #c7d2fe)` }} />
            <div style={{ fontSize: '10.5px', color: 'var(--n-500)' }}>{item.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '9px 14px', marginTop: '12px' }}>
        {employee.qualityBreakdown.map((item) => {
          const color = scoreColor(item.score);

          return (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                <span style={{ color: 'var(--n-600)', fontWeight: 600 }}>{item.label}</span>
                <span style={{ color, fontWeight: 800 }}>{item.score}</span>
              </div>
              <MetricBar value={item.score} color={color} width="100%" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExpandedEmployeeDetail({ employee }) {
  return (
    <tr>
      <td colSpan={11} style={{ padding: 0, background: 'var(--n-50)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.05fr', gap: '12px', padding: '14px 16px 16px 58px', borderBottom: '1px solid var(--n-100)' }}>
          <QualityChart employee={employee} />

          <div style={{ border: '1px solid var(--n-100)', borderRadius: '10px', background: 'var(--white)', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, marginBottom: '10px' }}>
              <Storefront size={17} weight="duotone" style={{ color: '#2563eb' }} />
              Page được giao check
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {employee.assignedPages.map((page) => (
                <div key={`${employee.id}-${page.name}`} style={{ border: '1px solid var(--n-100)', borderRadius: '8px', padding: '9px', background: 'var(--n-50)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 800, color: 'var(--n-900)' }}>{page.name}</div>
                    <span className="tag tag-blue">{page.channel}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '12px', color: 'var(--n-600)' }}>
                    <span>Đã check: <b>{page.checked}</b></span>
                    <span>Đang chờ: <b>{page.pending}</b></span>
                    <span>QA: <b style={{ color: scoreColor(page.quality) }}>{page.quality}</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ border: '1px solid var(--n-100)', borderRadius: '10px', background: 'var(--white)', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
                <Target size={17} weight="duotone" style={{ color: 'var(--success-600)' }} />
                KPI được giao
              </div>
              <span className={`tag ${employee.achievementRate >= 95 ? 'tag-green' : employee.achievementRate >= 82 ? 'tag-orange' : 'tag-red'}`}>
                Đạt {employee.achievementRate}%
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
              <KpiProgress label="Hội thoại" actual={employee.conversations} target={employee.kpiTargets.conversations} />
              <KpiProgress label="Đơn chốt" actual={employee.orders} target={employee.kpiTargets.orders} />
              <KpiProgress label="Tỷ lệ chốt" actual={employee.closeRateValue} target={employee.kpiTargets.closeRate} suffix="%" precision={1} />
              <KpiProgress label="CSAT" actual={employee.csatValue} target={employee.kpiTargets.csat} suffix="/5" precision={1} />
            </div>
            <div style={{ marginTop: '10px', padding: '9px', borderRadius: '8px', background: '#fff7ed', color: '#9a3412', fontSize: '12px', lineHeight: 1.45 }}>
              Cần cải thiện: <b>{employee.improvementFocus}</b>. Ưu tiên xử lý trước nhóm hội thoại có khách hỏi giá, size và bảo hành.
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedEmployeeId, setExpandedEmployeeId] = useState(null);
  const normalizedSearch = search.trim().toLowerCase();

  const teams = useMemo(() => [...new Set(employees.map((employee) => employee.team))], []);
  const statuses = useMemo(() => [...new Set(employees.map((employee) => employee.status))], []);

  const filtered = useMemo(() => employees.filter((employee) => {
    const matchesSearch = !normalizedSearch || [employee.name, employee.team, employee.status, employee.improvementFocus]
      .some((field) => field.toLowerCase().includes(normalizedSearch));
    const matchesEmployee = employeeFilter === 'all' || employee.name === employeeFilter;
    const matchesTeam = teamFilter === 'all' || employee.team === teamFilter;
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

    return matchesSearch && matchesEmployee && matchesTeam && matchesStatus;
  }), [employeeFilter, normalizedSearch, statusFilter, teamFilter]);

  useEffect(() => {
    setCurrentPage(1);
    setExpandedEmployeeId(null);
  }, [employeeFilter, normalizedSearch, statusFilter, teamFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length ? ((currentPage - 1) * PAGE_SIZE) + 1 : 0;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const totalRevenue = employees.reduce((sum, employee) => sum + employee.revenueValue, 0);
  const totalOrders = employees.reduce((sum, employee) => sum + employee.orders, 0);
  const totalConversations = employees.reduce((sum, employee) => sum + employee.conversations, 0);
  const needImproveCount = employees.filter((employee) => employee.status !== 'Đạt chuẩn').length;

  const stats = [
    {
      label: 'Tổng nhân viên',
      value: employees.length,
      sub: `${employees.filter((employee) => employee.online).length} đang online`,
      Icon: UsersThree,
      color: 'var(--primary-600)',
      bg: 'var(--primary-50)',
    },
    {
      label: 'QA Score TB',
      value: Math.round(average(employees, (employee) => employee.score)),
      sub: 'điểm chất lượng',
      Icon: Star,
      color: '#d97706',
      bg: '#fffbeb',
    },
    {
      label: 'Tỷ lệ chốt TB',
      value: formatPercent(average(employees, (employee) => employee.closeRateValue)),
      sub: `${totalOrders.toLocaleString('vi-VN')} đơn`,
      Icon: Target,
      color: '#2563eb',
      bg: '#eff6ff',
    },
    {
      label: 'CSAT TB',
      value: `${average(employees, (employee) => employee.csatValue).toFixed(1)}/5`,
      sub: 'điểm hài lòng',
      Icon: Smiley,
      color: 'var(--success-600)',
      bg: '#f0fdf4',
    },
    {
      label: 'Doanh thu',
      value: formatMoneyShort(totalRevenue),
      sub: 'ước tính từ chat',
      Icon: CurrencyCircleDollar,
      color: '#16a34a',
      bg: '#ecfdf5',
    },
    {
      label: 'Cần cải thiện',
      value: needImproveCount,
      sub: `${totalConversations.toLocaleString('vi-VN')} hội thoại`,
      Icon: Warning,
      color: 'var(--danger-600)',
      bg: '#fef2f2',
    },
  ];

  const resetFilters = () => {
    setSearch('');
    setEmployeeFilter('all');
    setTeamFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="page-scroll">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        {stats.map((stat, index) => {
          const Icon = stat.Icon;

          return (
            <div key={stat.label} className="kpi-card anim-up" style={{ animationDelay: `${index * 50}ms`, minHeight: '86px' }}>
              <div className="kpi-icon" style={{ background: stat.bg }}>
                <Icon size={22} weight="duotone" style={{ color: stat.color }} />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">{stat.label}</div>
                <div className="kpi-value" style={{ fontSize: '22px' }}>{stat.value}</div>
                <div style={{ fontSize: '11.5px', color: 'var(--n-500)', marginTop: '2px' }}>{stat.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card anim-up" style={{ animationDelay: '220ms' }}>
        <div className="card-title" style={{ marginBottom: '12px', alignItems: 'flex-start', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '7px' }}>
            <UsersThree size={18} weight="duotone" style={{ color: 'var(--primary-600)' }} />
            Danh sách nhân viên
            <span style={{ fontSize: '12px', color: 'var(--n-500)', fontWeight: 500 }}>
              {rangeStart}-{rangeEnd}/{filtered.length} nhân viên
            </span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--n-50)', padding: '0 10px', borderRadius: '7px', border: '1px solid var(--n-200)', height: '34px' }}>
              <MagnifyingGlass size={15} style={{ color: 'var(--n-400)' }} />
              <input
                type="text"
                placeholder="Tìm nhân viên, team, điểm cần cải thiện..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                style={{ background: 'transparent', fontSize: '13px', color: 'var(--n-700)', width: '245px' }}
              />
            </div>
            <select value={employeeFilter} onChange={(event) => setEmployeeFilter(event.target.value)} style={{ ...controlStyle, width: '170px' }}>
              <option value="all">Tất cả nhân viên</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.name}>{employee.name}</option>
              ))}
            </select>
            <select value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)} style={{ ...controlStyle, width: '112px' }}>
              <option value="all">Tất cả team</option>
              {teams.map((team) => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ ...controlStyle, width: '138px' }}>
              <option value="all">Tất cả trạng thái</option>
              {statuses.map((status) => (
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
          <table className="data-table" style={{ minWidth: '1360px' }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Nhân viên</th>
                <th>QA Score</th>
                <th>Tỷ lệ chốt</th>
                <th>CSAT</th>
                <th>Doanh thu</th>
                <th>Hội thoại</th>
                <th>Đơn chốt</th>
                <th>Page check</th>
                <th>KPI đạt</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((employee) => {
                const qaColor = scoreColor(employee.score);
                const achievement = achievementColor(employee.achievementRate);
                const isExpanded = expandedEmployeeId === employee.id;

                return (
                  <Fragment key={employee.id}>
                    <tr style={{ cursor: 'default', background: isExpanded ? 'var(--primary-50)' : undefined }}>
                      <td>
                        <span className={`rank-badge ${employee.rank <= 3 ? `rank-${employee.rank}` : 'rank-n'}`}>
                          {employee.rank}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setExpandedEmployeeId(isExpanded ? null : employee.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '9px', width: '100%', textAlign: 'left', background: 'transparent', cursor: 'pointer' }}
                        >
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `hsl(${employee.id * 41}, 58%, 54%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                              {initials(employee.name)}
                            </div>
                            <span style={{ position: 'absolute', right: '-1px', bottom: '-1px', width: '9px', height: '9px', borderRadius: '50%', background: employee.online ? 'var(--success-500)' : 'var(--n-300)', border: '2px solid var(--white)' }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 800, color: 'var(--n-900)' }}>
                              {employee.name}
                              <CaretDown size={13} weight="bold" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .16s ease', color: 'var(--n-500)' }} />
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--n-500)' }}>{employee.team} • phản hồi TB {employee.avgResponse}</div>
                          </div>
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 800, color: qaColor }}>{employee.score}</span>
                          <TrendUp size={14} weight="bold" style={{ color: qaColor }} />
                        </div>
                        <MetricBar value={employee.score} color={qaColor} />
                      </td>
                      <td>
                        <div style={{ fontWeight: 700 }}>{employee.closeRate}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--n-500)' }}>{employee.orders} đơn / {employee.conversations} hội thoại</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                          <Smiley size={16} weight="duotone" style={{ color: employee.csatValue >= 4 ? 'var(--success-600)' : 'var(--warning-600)' }} />
                          {employee.csat}
                        </div>
                        <MetricBar value={employee.csatValue} max={5} color={employee.csatValue >= 4 ? 'var(--success-600)' : 'var(--warning-600)'} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--success-700)' }}>
                          <CurrencyCircleDollar size={16} weight="duotone" />
                          {employee.revenue}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                          <ChatCircleText size={15} style={{ color: 'var(--n-400)' }} />
                          {employee.conversations.toLocaleString('vi-VN')}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--n-500)' }}>KPI {employee.kpiTargets.conversations.toLocaleString('vi-VN')}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700 }}>
                          <Package size={15} weight="duotone" style={{ color: '#2563eb' }} />
                          {employee.orders.toLocaleString('vi-VN')}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--n-500)' }}>KPI {employee.kpiTargets.orders.toLocaleString('vi-VN')}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800 }}>{employee.assignedPages.length} page</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--n-500)' }}>
                          {employee.assignedPages.reduce((sum, page) => sum + page.checked, 0).toLocaleString('vi-VN')} đã check
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 800, color: achievement }}>{employee.achievementRate}%</div>
                        <MetricBar value={employee.achievementRate} color={achievement} />
                      </td>
                      <td>
                        <span className={`tag ${statusClass(employee.status)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--n-100)' }}>
          <div style={{ fontSize: '12.5px', color: 'var(--n-500)' }}>
            Hiển thị {rangeStart}-{rangeEnd} trong {filtered.length} nhân viên, mỗi trang {PAGE_SIZE} bạn
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
            <span style={{ minWidth: '76px', textAlign: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--n-700)' }}>
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
  );
}
