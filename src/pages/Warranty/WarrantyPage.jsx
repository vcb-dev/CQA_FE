import { useState } from 'react';
import { MagnifyingGlass, Warning, Clock, CheckCircle, Shield, Wrench, Hourglass, SmileySad, Calendar, ArrowsCounterClockwise, Star, Sparkle, Lightbulb, Crown } from '@phosphor-icons/react';
import { warrantyKPIs, warrantyList, warrantyProcess, warrantySentiment, warrantyByProduct } from '../../data/mockData';
import AnalyticsShell from '@/components/analytics/AnalyticsShell';
import KpiGrid from '@/components/analytics/KpiGrid';

const kpiIconMap = [
  Wrench,
  Hourglass,
  CheckCircle,
  SmileySad,
  Clock,
  Calendar,
  ArrowsCounterClockwise
];

function getInsightIcon(icon) {
  switch (icon) {
    case '🔴': return <Warning size={14} weight="duotone" style={{ color: '#ef4444' }} />;
    case '💡': return <Lightbulb size={14} weight="duotone" style={{ color: '#f59e0b' }} />;
    case '⏰': return <Clock size={14} weight="duotone" style={{ color: 'var(--primary-500)' }} />;
    case '⚠️': return <Warning size={14} weight="duotone" style={{ color: '#ef4444' }} />;
    default: return <Sparkle size={14} weight="duotone" style={{ color: '#4f46e5' }} />;
  }
}

const kpiMeta = [
  { bg: '#eef2ff', color: '#4f46e5', isGoodUp: true },
  { bg: '#fffbeb', color: '#d97706', isGoodUp: false },
  { bg: '#f0fdf4', color: '#16a34a', isGoodUp: true },
  { bg: '#fef2f2', color: '#dc2626', isGoodUp: false },
  { bg: '#f0fdf4', color: '#16a34a', isGoodUp: true },
  { bg: '#fffbeb', color: '#d97706', isGoodUp: false },
  { bg: '#faf5ff', color: '#7c3aed', isGoodUp: true },
];

const processColors = ['#4f46e5', '#6366f1', '#818cf8', '#f59e0b', '#22c55e', '#16a34a'];

const workshopData = [
  { name: 'Xưởng HCM', received: 28, late: 3, rate: '91%', avgDays: '4.6' },
  { name: 'Xưởng HN', received: 21, late: 5, rate: '86%', avgDays: '4.2' },
  { name: 'Xưởng ĐN', received: 12, late: 1, rate: '92%', avgDays: '4.5' },
  { name: 'Xưởng Cần Thơ', received: 9, late: 2, rate: '82%', avgDays: '5.1' },
];

const employeePerf = [
  { name: 'Trần Minh Quân', handled: 68, onTime: '88%', csat: '4.8', pct: '42%' },
  { name: 'Phạm Hoàng Nam', handled: 62, onTime: '90%', csat: '4.6', pct: '38%' },
  { name: 'Vũ Thị Kim Anh', handled: 51, onTime: '92%', csat: '4.7', pct: '40%' },
  { name: 'Lê Thảo Vy', handled: 44, onTime: '88%', csat: '4.5', pct: '33%' },
  { name: 'Nguyễn Văn Hào', handled: 37, onTime: '95%', csat: '4.9', pct: '45%' },
];

const aiInsights = [
  { icon: '🔴', text: 'Nhẫn bạc Classic tỷ lệ bảo hành cao nhất (4.8%). Nguyên nhân: Nhỏ size 62%, Rớt đá 18%.' },
  { icon: '💡', text: 'Khách VIP sau bảo hành quay lại mua hàng cao hơn 2.1 lần so với khách thường.' },
  { icon: '⏰', text: 'Khung giờ 20h–22h có nhiều yêu cầu bảo hành nhất. Đề xuất bổ sung nhân sự ca tối.' },
  { icon: '⚠️', text: '26 yêu cầu chậm SLA > 24h, tập trung ở bước "Xưởng xử lý". Cần ưu tiên xử lý ngay.' },
];

const tabs = [
  { key: 'all', label: 'Tất cả', count: 356 },
  { key: 'processing', label: 'Đang xử lý', count: 82 },
  { key: 'workshop', label: 'Chờ xưởng', count: 28 },
  { key: 'responded', label: 'Chờ phản hồi', count: 19 },
  { key: 'done', label: 'Hoàn thành', count: 248 },
];

function isGoodChange(change, isGoodUp) {
  const isUp = change.includes('↑');
  return isGoodUp ? isUp : !isUp;
}

export default function WarrantyPage() {
  const [tab, setTab] = useState('all');

  const kpiItems = warrantyKPIs.map((kpi, i) => {
    const meta = kpiMeta[i];
    const good = isGoodChange(kpi.change, meta.isGoodUp);
    return {
      ...kpi,
      icon: kpiIconMap[i],
      bg: meta.bg,
      color: meta.color,
      change: kpi.change,
      changePositive: good,
    };
  });

  return (
    <AnalyticsShell>
    <div className="page-scroll">
      <KpiGrid items={kpiItems} columns={7} />

      {/* ── Middle Row: Table + Process + AI ── */}
      <div style={{ display: 'flex', gap: '16px', minHeight: 0 }}>

        {/* Warranty List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1.6, borderRadius: '18px', padding: '20px' }}>
          <div className="card-title" style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} weight="duotone" style={{ color: '#4f46e5' }} />
              <span>Danh sách yêu cầu bảo hành</span>
            </div>
            <span className="card-link">Xem tất cả →</span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '5px 12px', borderRadius: 999, fontSize: '12px', fontWeight: 600,
                background: tab === t.key ? '#4f46e5' : '#f3f4f6',
                color: tab === t.key ? '#fff' : '#4b5563',
                transition: 'all 150ms ease',
              }}>
                {t.label}
                <span style={{ marginLeft: '4px', opacity: tab === t.key ? 0.8 : 0.6 }}>({t.count})</span>
              </button>
            ))}
          </div>

          {/* Search + Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', flex: 1 }}>
              <MagnifyingGlass size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
              <input placeholder="Tìm theo tên khách, SĐT, mã đơn..." style={{ flex: 1, background: 'transparent', fontSize: '13px', color: '#374151' }} />
            </div>
            <select style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '12px', color: '#4b5563', background: '#fff', cursor: 'pointer' }}>
              <option>Tất cả lý do</option>
            </select>
            <select style={{ padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '12px', color: '#4b5563', background: '#fff', cursor: 'pointer' }}>
              <option>Tất cả nhân viên</option>
            </select>
          </div>

          {/* Table */}
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th><th>Khách hàng</th><th>Sản phẩm</th><th>Mã đơn</th>
                <th>Lý do</th><th>Trạng thái</th><th>Thời gian</th>
                <th>Nhân viên</th><th>Cảm xúc</th><th>Ưu tiên</th>
              </tr>
            </thead>
            <tbody>
              {warrantyList.map((w, i) => (
                <tr key={i} style={{ cursor: 'pointer' }}>
                  <td style={{ color: '#9ca3af', fontWeight: 600, fontSize: '12px' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: `hsl(${i * 67 + 200}, 58%, 55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {w.customer.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13px', color: '#111827' }}>{w.customer}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{w.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: '12.5px', maxWidth: '110px' }}>{w.product}</td>
                  <td style={{ fontSize: '12px', color: '#4f46e5', fontWeight: 600 }}>{w.orderCode || '—'}</td>
                  <td><span className="tag tag-gray">{w.reason}</span></td>
                  <td>
                    <span className={`tag ${
                      w.status === 'Đang xử lý' ? 'tag-orange' :
                      w.status === 'Chờ xưởng' ? 'tag-purple' :
                      w.status === 'Hoàn thành' ? 'tag-green' : 'tag-blue'
                    }`}>{w.status}</span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#6b7280' }}>{w.time || '—'}</td>
                  <td style={{ fontSize: '12px', color: '#374151' }}>{w.employee || '—'}</td>
                  <td>
                    {w.sentiment && (
                      <span className={`tag ${
                        w.sentiment.includes('Khó') ? 'tag-red' :
                        w.sentiment.includes('Hài') ? 'tag-green' : 'tag-orange'
                      }`}>{w.sentiment}</span>
                    )}
                  </td>
                  <td>
                    {w.priority && (
                      <span className="tag tag-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <Crown size={10} weight="fill" />
                        {w.priority}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', minWidth: 0 }}>

          {/* Process Flow */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ borderRadius: '18px', padding: '20px' }}>
            <div className="card-title" style={{ marginBottom: '16px' }}>
              <span>Quy trình xử lý bảo hành</span>
              <span style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 400 }}>Tháng này</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {warrantyProcess.map((p, i) => {
                const pct = Math.round((p.value / warrantyProcess[0].value) * 100);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: processColors[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {p.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12.5px', color: '#374151', fontWeight: 500 }}>{p.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: processColors[i] }}>{p.value.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 5, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: processColors[i], borderRadius: 99 }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '14px', padding: '9px 12px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fef3c7', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Warning size={14} weight="duotone" style={{ color: '#d97706', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#374151', flex: 1 }}>26 yêu cầu chậm tiến độ SLA {'>'} 24h</span>
              <span className="card-link" style={{ fontSize: '12px' }}>Xem →</span>
            </div>
          </div>

          {/* AI Insight */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{
            borderRadius: '18px', padding: '20px',
            background: 'linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)',
            border: '1px solid #c7d2fe',
          }}>
            <div className="card-title" style={{ marginBottom: '14px', color: '#3730a3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Sparkle size={16} weight="duotone" style={{ color: '#4f46e5' }} />
                <span>AI Insight bảo hành</span>
              </div>
              <span className="card-link">Xem tất cả →</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {aiInsights.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.72)', borderRadius: '10px', border: '1px solid rgba(199,210,254,0.6)', alignItems: 'flex-start' }}>
                  <span style={{ display: 'inline-flex', flexShrink: 0, marginTop: '2px' }}>{getInsightIcon(item.icon)}</span>
                  <span style={{ fontSize: '12.5px', color: '#374151', lineHeight: 1.55 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Stats Row ── */}
      <div style={{ display: 'flex', gap: '16px' }}>

        {/* Sentiment Donut */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1, borderRadius: '18px', padding: '20px' }}>
          <div className="card-title" style={{ marginBottom: '14px' }}>
            <span>Cảm xúc khách hàng</span>
            <span className="card-link">Chi tiết →</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
              <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f3f4f6" strokeWidth="11" />
                {(() => {
                  let off = 0;
                  const c = 2 * Math.PI * 38;
                  return warrantySentiment.map((d, i) => {
                    const dash = (d.value / 356) * c;
                    const o = off; off += dash;
                    return <circle key={i} cx="50" cy="50" r="38" fill="none" stroke={d.color} strokeWidth="11"
                      strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-o} />;
                  });
                })()}
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                <div style={{ fontSize: '19px', fontWeight: 800, color: '#111827' }}>356</div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>tổng</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {warrantySentiment.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ color: '#4b5563', flex: 1 }}>{d.label}</span>
                  <span style={{ fontWeight: 700, color: '#1f2937', minWidth: 28, textAlign: 'right' }}>{d.value}</span>
                  <span style={{ color: '#9ca3af', fontSize: '11px', minWidth: 38, textAlign: 'right' }}>{d.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* By Product */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1.2, borderRadius: '18px', padding: '20px' }}>
          <div className="card-title" style={{ marginBottom: '14px' }}>
            <span>Bảo hành theo sản phẩm</span>
            <span className="card-link">Xem tất cả →</span>
          </div>
          <table className="data-table">
            <thead><tr><th>Sản phẩm</th><th>Số BH</th><th>Tỷ lệ</th><th>Lý do</th></tr></thead>
            <tbody>
              {warrantyByProduct.map((p, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span className={`rank-badge rank-${i < 3 ? i + 1 : 'n'}`} style={{ width: 20, height: 20, fontSize: '10px' }}>{i + 1}</span>
                      <span style={{ fontWeight: 500, fontSize: '12.5px' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: '#1f2937' }}>{p.count}</td>
                  <td><span style={{ fontWeight: 700, color: '#dc2626', fontSize: '12.5px' }}>{p.pct}</span></td>
                  <td><span className="tag tag-gray">{p.reason}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Employee Performance */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1.2, borderRadius: '18px', padding: '20px' }}>
          <div className="card-title" style={{ marginBottom: '14px' }}>
            <span>Hiệu suất nhân viên</span>
            <span className="card-link">Xem tất cả →</span>
          </div>
          <table className="data-table">
            <thead><tr><th>Nhân viên</th><th>Xử lý</th><th>Đúng hạn</th><th>CSAT</th></tr></thead>
            <tbody>
              {employeePerf.map((e, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: `hsl(${i * 67 + 180}, 55%, 55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                        {e.name.charAt(0)}
                      </div>
                      <span style={{ fontSize: '12.5px', fontWeight: 500 }}>{e.name}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: '#1f2937' }}>{e.handled}</td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: parseInt(e.onTime) >= 90 ? '#16a34a' : '#d97706' }}>
                      {e.onTime}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#374151', fontSize: '12.5px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={11} weight="fill" style={{ color: '#eab308' }} />
                      {e.csat}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Workshop */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1, borderRadius: '18px', padding: '20px' }}>
          <div className="card-title" style={{ marginBottom: '14px' }}>
            <span>Theo dõi xưởng</span>
            <span className="card-link">Chi tiết →</span>
          </div>
          <table className="data-table">
            <thead><tr><th>Xưởng</th><th>Đang xử lý</th><th>Chậm</th><th>Đúng hạn</th></tr></thead>
            <tbody>
              {workshopData.map((w, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, fontSize: '12.5px' }}>{w.name}</td>
                  <td style={{ fontWeight: 700 }}>{w.received}</td>
                  <td style={{ fontWeight: 700, color: w.late > 3 ? '#dc2626' : '#6b7280' }}>{w.late}</td>
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: parseInt(w.rate) >= 90 ? '#16a34a' : '#d97706' }}>
                      {w.rate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Alert Bar ── */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1, borderRadius: '14px', padding: '14px 18px', background: '#fef2f2', border: '1px solid #fee2e2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Warning size={18} weight="duotone" style={{ color: '#dc2626' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', marginBottom: '1px' }}>Cảnh báo rủi ro</div>
              <div style={{ fontSize: '12px', color: '#4b5563' }}>3 khách hàng VIP đang rất không hài lòng, nguy cơ phốt cao</div>
            </div>
            <span className="card-link" style={{ fontSize: '13px', color: '#dc2626', flexShrink: 0 }}>Xem ngay →</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1, borderRadius: '14px', padding: '14px 18px', background: '#fffbeb', border: '1px solid #fef3c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={18} weight="duotone" style={{ color: '#d97706' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#d97706', marginBottom: '1px' }}>Khách cần ưu tiên</div>
              <div style={{ fontSize: '12px', color: '#4b5563' }}>10 khách đang chờ xử lý {'>'} 48 giờ, cần phản hồi ngay</div>
            </div>
            <span className="card-link" style={{ fontSize: '13px', color: '#d97706', flexShrink: 0 }}>Xem danh sách →</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1, borderRadius: '14px', padding: '14px 18px', background: '#f0fdf4', border: '1px solid #dcfce7' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={18} weight="duotone" style={{ color: '#16a34a' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', marginBottom: '1px' }}>Khách quay lại sau bảo hành</div>
              <div style={{ fontSize: '12px', color: '#4b5563' }}>127 khách đã quay lại mua hàng sau khi bảo hành thành công</div>
            </div>
            <span className="card-link" style={{ fontSize: '13px', color: '#16a34a', flexShrink: 0 }}>Xem danh sách →</span>
          </div>
        </div>
      </div>

    </div>
    </AnalyticsShell>
  );
}
