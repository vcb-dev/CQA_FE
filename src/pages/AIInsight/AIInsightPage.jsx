import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Star, Sparkle, Lightbulb, Warning, TrendUp, MagnifyingGlass, CheckCircle,
  Smiley, SmileyMeh, SmileySad, Diamond, ChartBar, CaretRight, XCircle, SealCheck,
} from '@phosphor-icons/react';
import AnalyticsShell from '@/components/analytics/AnalyticsShell';
import KpiGrid from '@/components/analytics/KpiGrid';
import { fetchCskhInsights } from '@/features/cskh-quality/api';

const kpiIconMap = [Lightbulb, Warning, TrendUp, MagnifyingGlass];
const kpiColors = ['var(--primary-500)', '#ef4444', '#22c55e', '#f59e0b'];

const STATUS_STYLE = {
  good: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', bar: '#22c55e' },
  warning: { bg: '#fffbeb', border: '#fde68a', text: '#b45309', bar: '#f59e0b' },
  critical: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', bar: '#ef4444' },
};

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

function ScoreBar({ score, max = 100 }) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const color = score >= 70 ? '#22c55e' : score >= 55 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
      <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width .4s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color, minWidth: 32 }}>{score}</span>
    </div>
  );
}

function ChannelCard({ page, onSelect, active }) {
  const s = STATUS_STYLE[page.status] || STATUS_STYLE.warning;
  return (
    <button
      type="button"
      onClick={() => onSelect(page.pageId)}
      style={{
        textAlign: 'left',
        border: `1px solid ${active ? '#6366f1' : s.border}`,
        background: active ? '#eef2ff' : s.bg,
        borderRadius: 10,
        padding: '10px 12px',
        cursor: 'pointer',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#111827', lineHeight: 1.3 }}>{page.pageName}</div>
        <span style={{ fontSize: 10, fontWeight: 800, color: s.text, background: '#fff', border: `1px solid ${s.border}`, borderRadius: 99, padding: '2px 8px', whiteSpace: 'nowrap' }}>
          {page.statusLabel}
        </span>
      </div>
      <ScoreBar score={page.avgScore} />
      <div style={{ marginTop: 6, fontSize: 11, color: '#6b7280', lineHeight: 1.4 }}>
        {page.auditCount.toLocaleString('vi-VN')} HT · Rủi ro {page.riskRate}% · QA đạt {page.passRate}%
      </div>
      {page.topIssue && (
        <div style={{ marginTop: 6, fontSize: 11, color: s.text, fontWeight: 600 }}>
          ⚠ {page.topIssue}
        </div>
      )}
    </button>
  );
}

function ChannelComparisonChart({ pages }) {
  const top = [...pages].sort((a, b) => a.avgScore - b.avgScore).slice(0, 12);
  const maxScore = 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
      {top.map((p) => {
        const s = STATUS_STYLE[p.status] || STATUS_STYLE.warning;
        const width = `${(p.avgScore / maxScore) * 100}%`;
        return (
          <div key={p.pageId} style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) 1fr 48px', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.pageName}>
              {p.pageName}
            </div>
            <div style={{ height: 10, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ width, height: '100%', background: s.bar, borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: s.text, textAlign: 'right' }}>{p.avgScore}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function AIInsightPage() {
  const [range, setRange] = useState(defaultRange);
  const [selectedPageId, setSelectedPageId] = useState('');

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['cskh', 'insights', range.from, range.to, selectedPageId || 'all'],
    queryFn: () =>
      fetchCskhInsights({
        auditDateFrom: range.from,
        auditDateTo: range.to,
        pageId: selectedPageId || undefined,
      }),
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
  const byPage = data?.byPage;

  const pageOptions = data?.pageDirectory ?? data?.byPage?.all ?? [];

  return (
    <AnalyticsShell demo={false}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', overflow: 'auto' }}>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 240 }}>
              <Sparkle size={14} weight="duotone" style={{ color: '#4f46e5', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                <strong>{selectedPageId ? 'Chi tiết kênh' : 'Tổng quan AI Insight'}</strong>
                {data ? ` — ${data.intro}` : ' — đang tải...'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', flexWrap: 'wrap' }}>
              <label>
                Kênh{' '}
                <select
                  value={selectedPageId}
                  onChange={(e) => setSelectedPageId(e.target.value)}
                  style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', maxWidth: 220 }}
                >
                  <option value="">Tất cả kênh</option>
                  {pageOptions.map((p) => (
                    <option key={p.pageId} value={p.pageId}>
                      {p.pageName} ({p.avgScore}đ)
                    </option>
                  ))}
                </select>
              </label>
              {selectedPageId && (
                <button
                  type="button"
                  onClick={() => setSelectedPageId('')}
                  style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer' }}
                >
                  Xem tất cả
                </button>
              )}
              <label>
                Từ{' '}
                <input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px' }} />
              </label>
              <label>
                Đến{' '}
                <input type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px' }} />
              </label>
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                style={{ border: '1px solid #c7d2fe', background: '#eef2ff', color: '#4338ca', borderRadius: 6, padding: '5px 10px', fontWeight: 600, cursor: 'pointer' }}
              >
                {isFetching ? 'Đang tải...' : 'Làm mới'}
              </button>
            </div>
          </div>
          {data && (
            <div style={{ marginTop: 8, fontSize: '11px', color: '#9ca3af' }}>
              Nguồn: chat_audits · Điểm TB: {data.avgScore}/100 · {data.totalAnalyzed.toLocaleString('vi-VN')} bản ghi
              {byPage?.summary && !selectedPageId && (
                <> · {byPage.summary.good} kênh ổn · {byPage.summary.warning} cần cải thiện · {byPage.summary.critical} cần xử lý</>
              )}
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
            {!selectedPageId && byPage && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ChartBar size={16} weight="duotone" style={{ color: '#4f46e5' }} />
                  <span>Sức khỏe từng kênh — kênh nào cần ưu tiên?</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 14, padding: '0 16px 16px' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#b91c1c', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <XCircle size={14} weight="fill" />
                      Cần cải thiện ({byPage.needsAttention.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {byPage.needsAttention.length > 0 ? (
                        byPage.needsAttention.map((p) => (
                          <ChannelCard key={p.pageId} page={p} onSelect={setSelectedPageId} active={false} />
                        ))
                      ) : (
                        <div style={{ fontSize: 12, color: '#9ca3af', padding: 12, background: '#f9fafb', borderRadius: 8 }}>Không có kênh nào ở mức cảnh báo</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#15803d', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <SealCheck size={14} weight="fill" />
                      Kênh đang ổn ({byPage.topPerformers.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {byPage.topPerformers.length > 0 ? (
                        byPage.topPerformers.map((p) => (
                          <ChannelCard key={p.pageId} page={p} onSelect={setSelectedPageId} active={false} />
                        ))
                      ) : (
                        <div style={{ fontSize: 12, color: '#9ca3af', padding: 12, background: '#f9fafb', borderRadius: 8 }}>Chưa đủ dữ liệu kênh tốt</div>
                      )}
                    </div>
                  </div>

                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, background: '#fafafa' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 10 }}>So sánh điểm QA (thấp → cao)</div>
                    <ChannelComparisonChart pages={byPage.all} />
                    <div style={{ marginTop: 10, fontSize: 11, color: '#9ca3af' }}>Bấm vào kênh bên trái hoặc chọn dropdown để xem chi tiết</div>
                  </div>
                </div>

                <div style={{ padding: '0 16px 16px' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: '#374151', marginBottom: 8 }}>Bảng chi tiết tất cả kênh</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Kênh</th>
                          <th>Trạng thái</th>
                          <th>Điểm TB</th>
                          <th>QA đạt</th>
                          <th>Rủi ro</th>
                          <th>Hội thoại</th>
                          <th>Vấn đề chính</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {byPage.all.map((p) => {
                          const s = STATUS_STYLE[p.status];
                          return (
                            <tr key={p.pageId} style={{ cursor: 'pointer' }} onClick={() => setSelectedPageId(p.pageId)}>
                              <td style={{ fontWeight: 600, maxWidth: 200 }}>{p.pageName}</td>
                              <td>
                                <span style={{ fontSize: 11, fontWeight: 700, color: s.text, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 99, padding: '2px 8px' }}>
                                  {p.statusLabel}
                                </span>
                              </td>
                              <td><ScoreBar score={p.avgScore} /></td>
                              <td>{p.passRate}%</td>
                              <td style={{ color: p.riskRate >= 75 ? '#dc2626' : '#374151', fontWeight: p.riskRate >= 75 ? 700 : 400 }}>{p.riskRate}%</td>
                              <td>{p.auditCount.toLocaleString('vi-VN')}</td>
                              <td style={{ fontSize: 11, color: '#6b7280', maxWidth: 260 }}>{p.topIssue || '—'}</td>
                              <td><CaretRight size={14} style={{ color: '#9ca3af' }} /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {selectedPageId && data.selectedPageName && (
              <div style={{ borderRadius: 12, border: '1px solid #c7d2fe', background: 'linear-gradient(90deg,#eef2ff,#f5f3ff)', padding: '10px 14px', fontSize: 12, color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span>Đang xem chi tiết kênh: <strong>{data.selectedPageName}</strong></span>
                <button type="button" onClick={() => setSelectedPageId('')} style={{ background: '#fff', border: '1px solid #c7d2fe', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', color: '#4338ca', fontWeight: 600 }}>
                  ← Quay lại tổng quan
                </button>
              </div>
            )}

            <KpiGrid items={kpiItems} columns={4} />

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1, minWidth: 280 }}>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{selectedPageId ? 'Khách quan tâm gì ở kênh này?' : 'Khách hàng quan tâm điều gì nhất?'}</span>
                  <MagnifyingGlass size={13} weight="bold" style={{ color: '#4f46e5' }} />
                </div>
                {concerns.items.length > 0 ? (
                  <ConcernDonut data={concerns.items} total={concerns.total} />
                ) : (
                  <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Chưa có từ khóa</div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1.2, minWidth: 320 }}>
                <div className="card-title">Vì sao tỷ lệ chốt thay đổi{selectedPageId ? ' (kênh này)' : ''}?</div>
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
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
              <div className="card-title" style={{ alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkle size={14} weight="duotone" style={{ color: '#4f46e5' }} />
                  Gợi ý content video{selectedPageId ? ' cho kênh này' : ''}
                </span>
              </div>
              {videoTopics.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: '14px', padding: '0 16px 16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {videoTopics.map((item, i) => (
                      <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px', background: i === 0 ? '#eef2ff' : '#fff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '5px' }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#111827', lineHeight: 1.35 }}>{item.question}</div>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#4f46e5', whiteSpace: 'nowrap' }}>{item.mentions.toLocaleString('vi-VN')} lần</span>
                        </div>
                        <div style={{ marginTop: '6px', fontSize: '12px', color: '#d97706', background: '#fffbeb', borderRadius: '6px', padding: '5px 7px', fontWeight: 700 }}>
                          Góc video: {item.angle}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {videoTopics.slice(0, 4).map((item, i) => (
                      <div key={i} style={{ border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: '8px', padding: '10px' }}>
                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 800, marginBottom: '5px' }}>Khung kịch bản #{i + 1}</div>
                        <div style={{ fontSize: '14px', color: '#1e3a8a', fontWeight: 900, lineHeight: 1.35, marginBottom: '8px' }}>{item.hook}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Chưa có chủ đề video</div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1, minWidth: 280 }}>
                <div className="card-title">Chủ đề được quan tâm</div>
                <table className="data-table">
                  <thead><tr><th>Chủ đề</th><th>Lượt nhắc</th></tr></thead>
                  <tbody>
                    {(data.products ?? []).map((p, i) => (
                      <tr key={i}>
                        <td><div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Diamond size={13} weight="duotone" style={{ color: '#f59e0b' }} /><span>{p.name}</span></div></td>
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
              <div className="card-title">Hiệu quả theo nguồn hội thoại{selectedPageId ? ' (kênh này)' : ''}</div>
              <table className="data-table">
                <thead><tr><th>Nguồn</th><th>Chất lượng</th><th>QA đạt</th><th>Số hội thoại</th></tr></thead>
                <tbody>
                  {(data.adEfficiency ?? []).map((a, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{a.name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} size={10} weight={j < a.stars ? 'fill' : 'regular'} style={{ color: j < a.stars ? '#fbbf24' : '#e5e7eb' }} />
                          ))}
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
