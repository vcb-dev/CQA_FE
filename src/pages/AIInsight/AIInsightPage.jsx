import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, Sparkle, Lightbulb, Warning, TrendUp, MagnifyingGlass, CheckCircle, Smiley, SmileyMeh, SmileySad, Diamond } from '@phosphor-icons/react';
import AnalyticsShell from '@/components/analytics/AnalyticsShell';
import KpiGrid from '@/components/analytics/KpiGrid';
import { fetchCskhInsights } from '@/features/cskh-quality/api';

const kpiIconMap = [Lightbulb, Warning, TrendUp, MagnifyingGlass];
const kpiColors = ['var(--primary-500)', '#ef4444', '#22c55e', '#f59e0b'];

function formatYmd(d) {
  return d.toISOString().slice(0, 10);
}

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: formatYmd(from), to: formatYmd(to) };
}

function ConcernDonut({ data, total }) {
  const r = 55;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const pctSum = data.reduce((s, d) => s + d.pct, 0) || 1;

  return (
    <div className="concern-donut">
      <div className="concern-chart" style={{ width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r={r} fill="none" stroke="#f3f4f6" strokeWidth="18" />
          {data.map((d, i) => {
            const dash = (d.pct / pctSum) * c;
            const o = offset;
            offset += dash;
            return (
              <circle
                key={i}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth="18"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-o}
              />
            );
          })}
        </svg>
        <div className="concern-center">
          <div className="num">{total.toLocaleString('vi-VN')}</div>
          <div className="lbl">Tổng đề cập</div>
        </div>
      </div>
      <div className="concern-legend">
        {data.map((d, i) => (
          <div key={i} className="concern-legend-item">
            <div className="concern-legend-dot" style={{ background: d.color }} />
            <span style={{ flex: 1, fontSize: '12px', color: '#374151' }}>{d.label}</span>
            <span className="concern-legend-pct">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AIInsightPage() {
  const [anim, setAnim] = useState(false);
  const [range, setRange] = useState(defaultRange);

  useEffect(() => {
    setTimeout(() => setAnim(true), 200);
  }, []);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['cskh', 'insights', range.from, range.to],
    queryFn: () => fetchCskhInsights({ auditDateFrom: range.from, auditDateTo: range.to }),
    staleTime: 60_000,
  });

  const kpiItems = useMemo(() => {
    if (!data?.kpis) return [];
    return data.kpis.map((kpi, i) => ({
      ...kpi,
      icon: kpiIconMap[i],
      color: kpiColors[i],
      change: `${kpi.change} ${kpi.sub}`,
      changePositive: kpi.changePositive,
    }));
  }, [data]);

  const videoTopics = data?.videoTopics ?? [];
  const concerns = data?.customerConcerns ?? { total: 0, items: [] };
  const factors = data?.closeRateFactors ?? { highClose: [], lostOrders: [] };
  const sentiment = data?.sentiment ?? { positive: 0, neutral: 0, negative: 0, positiveChange: 0 };

  return (
    <AnalyticsShell demo={false}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', overflow: 'auto' }}>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 240 }}>
              <Sparkle size={14} weight="duotone" style={{ color: '#4f46e5', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                <strong>Tổng quan AI Insight</strong>
                {data ? ` — ${data.intro}` : ' — đang tải dữ liệu từ bản ghi chấm điểm...'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <label>
                Từ{' '}
                <input
                  type="date"
                  value={range.from}
                  onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
                  style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px' }}
                />
              </label>
              <label>
                Đến{' '}
                <input
                  type="date"
                  value={range.to}
                  onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
                  style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px' }}
                />
              </label>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                style={{
                  border: '1px solid #c7d2fe',
                  background: '#eef2ff',
                  color: '#4338ca',
                  borderRadius: 6,
                  padding: '5px 10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isFetching ? 'Đang tải...' : 'Làm mới'}
              </button>
            </div>
          </div>
          {data && (
            <div style={{ marginTop: 8, fontSize: '11px', color: '#9ca3af' }}>
              Nguồn: chat_audits · Điểm TB: {data.avgScore}/100 · {data.totalAnalyzed.toLocaleString('vi-VN')} bản ghi
            </div>
          )}
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Đang tổng hợp insight từ dữ liệu chấm điểm...
          </div>
        )}

        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Không tải được insight: {error?.message || 'Lỗi không xác định'}
          </div>
        )}

        {data && !isLoading && (
          <>
            <KpiGrid items={kpiItems} columns={4} />

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1, minWidth: 280 }}>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Khách hàng quan tâm điều gì nhất?</span>
                  <MagnifyingGlass size={13} weight="bold" style={{ color: '#4f46e5' }} />
                </div>
                {concerns.items.length > 0 ? (
                  <ConcernDonut data={concerns.items} total={concerns.total} />
                ) : (
                  <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    Chưa có từ khóa trong khoảng thời gian này
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1.2, minWidth: 320 }}>
                <div className="card-title">Vì sao tỷ lệ chốt thay đổi?</div>
                <div className="factors-grid">
                  <div className="factor-col">
                    <h4 style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={14} weight="fill" />
                      <span>Các yếu tố giúp chốt cao</span>
                    </h4>
                    {factors.highClose.map((f, i) => (
                      <div key={i} className="factor-item">
                        <span className="name">{f.label}</span>
                        <span className="pct" style={{ color: '#16a34a' }}>{f.pct}%</span>
                      </div>
                    ))}
                    {factors.highClose.length === 0 && (
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>Chưa đủ dữ liệu strengths</div>
                    )}
                  </div>
                  <div className="factor-col">
                    <h4 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Warning size={14} weight="fill" />
                      <span>Các lý do mất đơn hàng</span>
                    </h4>
                    {factors.lostOrders.map((f, i) => (
                      <div key={i} className="factor-item">
                        <span className="name">{f.label}</span>
                        <span className="pct" style={{ color: '#dc2626' }}>{f.pct}%</span>
                      </div>
                    ))}
                    {factors.lostOrders.length === 0 && (
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>Chưa đủ dữ liệu weaknesses</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
              <div className="card-title" style={{ alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkle size={14} weight="duotone" style={{ color: '#4f46e5' }} />
                  Biến insight khách hàng thành content video
                </span>
                <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>Gợi ý từ từ khóa thực tế (chưa sinh kịch bản AI)</span>
              </div>
              {videoTopics.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {videoTopics.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '10px',
                          background: i === 0 ? '#eef2ff' : '#fff',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '5px' }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#111827', lineHeight: 1.35 }}>{item.question}</div>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#4f46e5', whiteSpace: 'nowrap' }}>
                            {item.mentions.toLocaleString('vi-VN')} lần
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>Nhóm khách: <strong>{item.audience}</strong></div>
                        <div style={{ marginTop: '6px', fontSize: '12px', color: '#d97706', background: '#fffbeb', borderRadius: '6px', padding: '5px 7px', fontWeight: 700 }}>
                          Góc video: {item.angle}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {videoTopics.slice(0, 4).map((item, i) => (
                      <div
                        key={i}
                        style={{
                          border: '1px solid #bfdbfe',
                          background: '#eff6ff',
                          borderRadius: '8px',
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          minHeight: 0,
                        }}
                      >
                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 800, marginBottom: '5px' }}>Khung kịch bản #{i + 1}</div>
                        <div style={{ fontSize: '14px', color: '#1e3a8a', fontWeight: 900, lineHeight: 1.35, marginBottom: '8px' }}>{item.hook}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {item.script.map((step, stepIndex) => (
                            <div key={stepIndex} style={{ display: 'flex', gap: '6px', fontSize: '12.2px', color: '#374151', lineHeight: 1.4 }}>
                              <span
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: '50%',
                                  background: '#dbeafe',
                                  color: '#1d4ed8',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '11px',
                                  fontWeight: 900,
                                  flexShrink: 0,
                                }}
                              >
                                {stepIndex + 1}
                              </span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '12px', color: '#16a34a', fontWeight: 800 }}>
                          CTA: {item.cta}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Chưa có chủ đề video gợi ý</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1, minWidth: 280 }}>
                <div className="card-title">Sản phẩm / chủ đề được quan tâm</div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Chủ đề</th>
                      <th>Lượt nhắc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.products ?? []).map((p, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Diamond size={13} weight="duotone" style={{ color: '#f59e0b' }} />
                            <span>{p.name}</span>
                          </div>
                        </td>
                        <td>{p.visits.toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1, minWidth: 280 }}>
                <div className="card-title">Cảm xúc khách hàng (AI)</div>
                <div className="sentiment-row" style={{ gap: '20px', padding: '8px 16px 16px' }}>
                  <div className="sentiment-item" style={{ gap: '3px' }}>
                    <Smiley size={24} weight="duotone" style={{ color: '#22c55e' }} />
                    <div className="sentiment-pct">{sentiment.positive}%</div>
                    <div className="sentiment-label">Tích cực</div>
                    <div className={`sentiment-change ${sentiment.positiveChange >= 0 ? 'up' : 'down'}`}>
                      {sentiment.positiveChange >= 0 ? '↑' : '↓'} {Math.abs(sentiment.positiveChange)}%
                    </div>
                  </div>
                  <div className="sentiment-item" style={{ gap: '3px' }}>
                    <SmileyMeh size={24} weight="duotone" style={{ color: '#f59e0b' }} />
                    <div className="sentiment-pct">{sentiment.neutral}%</div>
                    <div className="sentiment-label">Trung tính</div>
                  </div>
                  <div className="sentiment-item" style={{ gap: '3px' }}>
                    <SmileySad size={24} weight="duotone" style={{ color: '#ef4444' }} />
                    <div className="sentiment-pct">{sentiment.negative}%</div>
                    <div className="sentiment-label">Tiêu cực</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
              <div className="card-title">Hiệu quả theo nguồn hội thoại</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nguồn</th>
                    <th>Chất lượng</th>
                    <th>QA đạt</th>
                    <th>Số hội thoại</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.adEfficiency ?? []).map((a, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{a.name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ display: 'flex', gap: '1px' }}>
                            {Array.from({ length: 5 }).map((_, j) => (
                              <Star key={j} size={10} weight={j < a.stars ? 'fill' : 'regular'} style={{ color: j < a.stars ? '#fbbf24' : '#e5e7eb' }} />
                            ))}
                          </div>
                          <span style={{ fontSize: '11px' }}>{a.quality}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{a.closeRate}</td>
                      <td>{a.conversationCount.toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AnalyticsShell>
  );
}
