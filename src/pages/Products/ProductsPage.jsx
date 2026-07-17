import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MagnifyingGlass,
  Download,
  TrendUp,
  TrendDown,
  Minus,
  Package,
  ChatCircleText,
  EnvelopeOpen,
  ShoppingCart,
  CurrencyDollar,
  ChartBar,
  Diamond,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import AnalyticsShell from '@/components/analytics/AnalyticsShell';
import KpiGrid from '@/components/analytics/KpiGrid';
import { fetchProductsAnalytics } from '@/features/cskh-quality/api';

const kpiIconMap = [Package, ChatCircleText, EnvelopeOpen, ShoppingCart, CurrencyDollar, ChartBar];
const kpiColors = [
  'var(--primary-500)',
  '#3b82f6',
  '#a855f7',
  '#f59e0b',
  '#22c55e',
  '#ec4899',
];

const NA = 'chưa có data';

export default function ProductsPage() {
  const [anim, setAnim] = useState(false);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const t = setTimeout(() => setAnim(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['cskh', 'products', 'analytics', appliedSearch, category, page, pageSize],
    queryFn: () =>
      fetchProductsAnalytics({
        q: appliedSearch || undefined,
        category: category || undefined,
        page,
        pageSize,
      }),
    staleTime: 60_000,
  });

  const kpiItems = useMemo(() => {
    const list = data?.kpis ?? [];
    return list.map((kpi, i) => ({
      label: kpi.label,
      value: kpi.available ? kpi.value : NA,
      change: kpi.available ? (kpi.change !== NA ? kpi.change : '') : NA,
      sub: kpi.sub,
      icon: kpiIconMap[i],
      color: kpiColors[i],
      changePositive: true,
    }));
  }, [data?.kpis]);

  const items = data?.items ?? [];
  const pagination = data?.pagination ?? { page: 1, pageSize, total: 0, totalPages: 1 };
  const topByRevenue = data?.topByRevenue ?? [];
  const statusData = data?.statusBreakdown ?? [];
  const chartSold = data?.charts?.topSold ?? [];
  const insights = data?.insights ?? [];
  const categories = data?.categories ?? [];
  const totalProducts = data?.kpis?.find((k) => k.key === 'totalProducts')?.raw ?? 0;

  const TrendIcon = ({ t }) =>
    t === 'up' ? (
      <TrendUp size={12} style={{ color: '#16a34a' }} />
    ) : t === 'down' ? (
      <TrendDown size={12} style={{ color: '#dc2626' }} />
    ) : (
      <Minus size={12} style={{ color: '#9ca3af' }} />
    );

  const maxSold = Math.max(1, ...chartSold.map((p) => p.unitsSold));

  return (
    <AnalyticsShell demo={false}>
      <div style={{ display: 'flex', gap: '14px', height: '100%' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto', minWidth: 0 }}>
          {isError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Không tải được dữ liệu sản phẩm: {(error)?.message || 'Lỗi không xác định'}
            </div>
          ) : null}

          <KpiGrid items={kpiItems.length ? kpiItems : Array.from({ length: 6 }).map((_, i) => ({
            label: '…',
            value: isLoading ? '…' : NA,
            change: '',
            icon: kpiIconMap[i],
            color: kpiColors[i],
          }))} columns={6} />

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
            <div className="card-title">
              <span>
                Danh sách sản phẩm
                {isFetching ? <span className="ml-2 text-[10px] font-normal text-slate-400">Đang tải…</span> : null}
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                  <MagnifyingGlass size={12} style={{ color: '#9ca3af' }} />
                  <input
                    placeholder="Tìm kiếm sản phẩm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ background: 'transparent', fontSize: '11px', width: '140px' }}
                  />
                </div>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  style={{ padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '11px' }}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '11px', color: '#4b5563' }}>
                  <Download size={12} /> Xuất dữ liệu
                </button>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Tin nhắn</th>
                  <th>Tỷ lệ phản hồi</th>
                  <th>Tỷ lệ chốt</th>
                  <th>Đã bán</th>
                  <th>Doanh thu</th>
                  <th>Doanh thu / SP</th>
                  <th>AI Score</th>
                  <th>Xu hướng</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && !data ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                      Đang tải sản phẩm từ database…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                      Không có sản phẩm
                    </td>
                  </tr>
                ) : (
                  items.map((p) => (
                    <tr key={p.productId} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                            {p.imageUrl ? (
                              <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <Diamond size={18} weight="duotone" style={{ color: '#f59e0b' }} />
                            )}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '12px', lineHeight: 1.35, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '10px', color: '#9ca3af' }}>{p.code}</div>
                            {p.variantHint ? (
                              <div style={{ fontSize: '9px', color: '#059669', marginTop: 2 }}>{p.variantHint}</div>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td><span className="tag tag-gray">{p.category}</span></td>
                      <td style={{ color: p.messageCount == null ? '#9ca3af' : undefined }}>{p.messageCountLabel}</td>
                      <td style={{ color: p.responseRate == null ? '#9ca3af' : undefined }}>{p.responseRateLabel}</td>
                      <td style={{ fontWeight: 600, color: p.closeRate == null ? '#9ca3af' : undefined }}>{p.closeRateLabel}</td>
                      <td>{p.unitsSoldLabel}</td>
                      <td style={{ fontWeight: 500 }}>{p.revenueLabel}</td>
                      <td style={{ color: p.revenuePerUnit == null ? '#9ca3af' : undefined }}>{p.revenuePerUnitLabel}</td>
                      <td style={{ color: '#9ca3af', fontSize: '11px' }}>{p.aiScoreLabel}</td>
                      <td><TrendIcon t={p.trend} /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: '#6b7280', padding: '0 4px 4px' }}>
              <span>
                Hiển thị{' '}
                {pagination.total === 0
                  ? '0'
                  : `${(pagination.page - 1) * pagination.pageSize + 1} - ${Math.min(pagination.page * pagination.pageSize, pagination.total)}`}{' '}
                trong {pagination.total.toLocaleString('vi-VN')} sản phẩm
              </span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{ width: 28, height: 24, borderRadius: 4, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page <= 1 ? 0.4 : 1 }}
                >
                  <CaretLeft size={12} />
                </button>
                <span style={{ fontWeight: 600 }}>{pagination.page} / {pagination.totalPages}</span>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{ width: 28, height: 24, borderRadius: 4, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page >= pagination.totalPages ? 0.4 : 1 }}
                >
                  <CaretRight size={12} />
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1 }}>
              <div className="card-title">Sản phẩm đã bán (Top 10)</div>
              {chartSold.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>{NA}</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '130px', padding: '0 4px' }}>
                  {chartSold.map((p, i) => (
                    <div key={p.productId} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: '#374151' }}>{p.unitsSold}</span>
                      <div
                        style={{
                          width: '100%',
                          height: anim ? `${Math.max(8, (p.unitsSold / maxSold) * 100)}px` : 0,
                          background: 'linear-gradient(180deg, var(--primary-500), var(--primary-300))',
                          borderRadius: '3px 3px 0 0',
                          transition: 'height .8s ease',
                          transitionDelay: `${i * 80}ms`,
                        }}
                      />
                      <span style={{ fontSize: '8px', color: '#9ca3af', textAlign: 'center', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1 }}>
              <div className="card-title">Tỷ lệ chốt theo sản phẩm (Top 10)</div>
              <div style={{ padding: '28px 12px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>{NA}</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 0.8 }}>
              <div className="card-title">Tình trạng sản phẩm</div>
              {statusData.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>{NA}</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 8px' }}>
                  <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
                    <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="45" cy="45" r="32" fill="none" stroke="#f3f4f6" strokeWidth="12" />
                      {(() => {
                        let off = 0;
                        const c = 2 * Math.PI * 32;
                        const total = statusData.reduce((s, d) => s + d.count, 0) || 1;
                        return statusData.map((d, i) => {
                          const dash = (d.count / total) * c;
                          const o = off;
                          off += dash;
                          return (
                            <circle
                              key={i}
                              cx="45"
                              cy="45"
                              r="32"
                              fill="none"
                              stroke={d.color}
                              strokeWidth="12"
                              strokeDasharray={`${dash} ${c - dash}`}
                              strokeDashoffset={-o}
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                      <div style={{ fontSize: '17px', fontWeight: 800 }}>{Number(totalProducts).toLocaleString('vi-VN')}</div>
                      <div style={{ fontSize: '8px', color: '#6b7280' }}>sản phẩm</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {statusData.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: d.color }} />
                        <span style={{ color: '#374151', flex: 1 }}>{d.label}</span>
                        <span style={{ fontWeight: 600 }}>{d.count}</span>
                        <span style={{ color: '#9ca3af', fontSize: '10px' }}>({d.pct}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ width: '270px', minWidth: '270px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' }}>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
            <div className="card-title">Top sản phẩm doanh thu cao nhất</div>
            {topByRevenue.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>{NA}</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 4px 8px' }}>
                {topByRevenue.map((p, i) => (
                  <div key={p.productId} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', background: '#f9fafb', borderRadius: '8px' }}>
                    <span className={`rank-badge ${i < 3 ? `rank-${i + 1}` : 'rank-n'}`} style={{ width: '24px', height: '24px', fontSize: '11px' }}>{p.rank}</span>
                    <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#e5e7eb', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {p.imageUrl ? <img src={p.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '💍'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#1f2937', whiteSpace: 'normal', wordBreak: 'break-word' }}>{p.name}</div>
                      <div style={{ fontSize: '10px', color: '#9ca3af' }}>{p.unitsSoldLabel}</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{p.revenueLabel}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 shadow-sm flex flex-col">
            <div className="card-title">AI Insight về sản phẩm</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 4px 8px' }}>
              {(insights.length ? insights : [NA]).map((text, i) => (
                <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', lineHeight: 1.4, padding: '4px 0', borderBottom: i < insights.length - 1 ? '1px solid #e0e7ff' : 'none' }}>
                  <span style={{ color: '#4f46e5', fontSize: '13px', flexShrink: 0 }}>💡</span>
                  <span style={{ color: '#374151' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnalyticsShell>
  );
}
