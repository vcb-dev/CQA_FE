import { useState, useEffect } from 'react';
import { revenueKPIs, revenueTrend, revenueByEmployee, revenueByPage, revenueFunnel } from '../../data/mockData';
import {
  Coins, Package, CurrencyDollar, ChartBar, Megaphone, Leaf, Target,
  FacebookLogo, Diamond, Warning, Crown
} from '@phosphor-icons/react';

const kpiIcons = [
  Coins,         // 💰 Doanh thu
  Package,       // 📦 Đơn chốt
  CurrencyDollar,// 💵 Giá trị đơn TB
  ChartBar,      // 📊 Tỷ lệ chốt
  Megaphone,     // 📢 Quảng cáo
  Leaf,          // 🌱 Organic
  Target         // 🎯 ROI
];

const kpiColors = [
  '#22c55e',
  'var(--primary-500)',
  '#f59e0b',
  '#a855f7',
  '#ef4444',
  '#10b981',
  '#f59e0b'
];

export default function RevenuePage() {
  const [anim, setAnim] = useState(false);
  const [period, setPeriod] = useState('month');
  useEffect(() => { setTimeout(() => setAnim(true), 200); }, []);

  const getColor = (s) => { const v = parseInt(s); return v >= 80 ? '#16a34a' : v >= 70 ? '#d97706' : 'var(--orange-500)'; };

  const revenueByAds = [
    { name: 'Nhẫn bạc Classic - Video 1', spend: '28.600.000đ', msgs: 342, orders: 206, revenue: '203.500.000đ', roas: '7.1x' },
    { name: 'Dây chuyền Summer Sale', spend: '24.100.000đ', msgs: 286, orders: 168, revenue: '162.800.000đ', roas: '6.8x' },
    { name: 'Lắc tay Minimal', spend: '15.300.000đ', msgs: 186, orders: 124, revenue: '98.400.000đ', roas: '6.4x' },
    { name: 'Bông tai Collection', spend: '12.800.000đ', msgs: 154, orders: 86, revenue: '68.300.000đ', roas: '5.3x' },
  ];

  const revenueByProduct = [
    { name: 'Nhẫn bạc Classic', msgs: 2466, orders: 312, closeRate: '12.6%', revenue: '156.000.000đ' },
    { name: 'Dây chuyền bạc Minimal', msgs: 2168, orders: 241, closeRate: '11.1%', revenue: '112.000.000đ' },
    { name: 'Lắc tay bạc Basic', msgs: 1856, orders: 205, closeRate: '11.0%', revenue: '82.000.000đ' },
    { name: 'Bông tai bạc Tiny', msgs: 1542, orders: 168, closeRate: '10.9%', revenue: '56.000.000đ' },
    { name: 'Nhẫn bạc đá CZ', msgs: 1248, orders: 132, closeRate: '10.6%', revenue: '40.000.000đ' },
    { name: 'Vòng tay bạc Charm', msgs: 1066, orders: 96, closeRate: '9.0%', revenue: '26.000.000đ' },
  ];

  const revenueByCountry = [
    { country: '🇻🇳 Việt Nam', revenue: '856.200.000đ', orders: 1024, closeRate: '31.5%' },
    { country: '🇹🇭 Thái Lan', revenue: '198.500.000đ', orders: 286, closeRate: '27.1%' },
    { country: '🇮🇩 Indonesia', revenue: '98.300.000đ', orders: 128, closeRate: '24.8%' },
    { country: '🇰🇭 Khác', revenue: '37.000.000đ', orders: 38, closeRate: '21.3%' },
  ];

  const vipCustomers = [
    { name: 'Phạm Thanh Hằng', orders: 18, revenue: '12.5M' },
    { name: 'Nguyễn Quốc Bảo', orders: 15, revenue: '10.8M' },
    { name: 'Lê Minh Châu', orders: 12, revenue: '8.5M' },
    { name: 'Trần Hoàng Nam', orders: 8, revenue: '6.2M' },
    { name: 'Vũ Nhật Anh', orders: 6, revenue: '5.1M' },
  ];

  const funnelColors = ['#6366f1', '#818cf8', '#a78bfa', '#22c55e', '#16a34a', '#fbbf24'];

  return (
    <div className="page-scroll">
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
        {revenueKPIs.map((kpi, i) => {
          const IconComp = kpiIcons[i];
          return (
            <div key={i} className="kpi-card anim-up" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="kpi-icon" style={{ background: kpi.bg }}>
                {IconComp && <IconComp size={18} weight="duotone" style={{ color: kpiColors[i] }} />}
              </div>
              <div className="kpi-content">
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value" style={{ fontSize: '16px' }}>{kpi.value}</div>
                <div className={`kpi-change up`}>{kpi.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Trend + AI Insight */}
      <div style={{ display: 'flex', gap: '14px' }}>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 2, animationDelay: '200ms' }}>
          <div className="card-title">
            Doanh thu theo thời gian
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px' }}>
              <span>● Doanh thu</span><span style={{ color: '#f59e0b' }}>● Số đơn</span><span style={{ color: 'var(--primary-500)' }}>● Tỷ lệ chốt (%)</span>
              <div style={{ display: 'flex', gap: '2px', marginLeft: '8px' }}>
                {['Ngày', 'Tuần', 'Tháng'].map(p => (
                  <button key={p} onClick={() => setPeriod(p)} style={{ padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 500,
                    background: period === p ? '#4f46e5' : '#f3f4f6', color: period === p ? '#fff' : '#4b5563' }}>{p}</button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px' }}>
            {revenueTrend.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{ width: '100%', display: 'flex', gap: '2px', alignItems: 'flex-end', height: '130px' }}>
                  <div style={{ flex: 1, height: anim ? `${d.revenue * 2}px` : 0, background: 'linear-gradient(180deg, #22c55e, #16a34a)', borderRadius: '3px 3px 0 0', transition: 'height .8s ease', transitionDelay: `${i * 80}ms` }} />
                  <div style={{ flex: 1, height: anim ? `${d.orders * 2}px` : 0, background: 'linear-gradient(180deg, #f59e0b, #d97706)', borderRadius: '3px 3px 0 0', transition: 'height .8s ease', transitionDelay: `${i * 80 + 50}ms` }} />
                  <div style={{ flex: 1, height: anim ? `${d.closeRate * 3.5}px` : 0, background: 'linear-gradient(180deg, #6366f1, #4f46e5)', borderRadius: '3px 3px 0 0', transition: 'height .8s ease', transitionDelay: `${i * 80 + 100}ms` }} />
                </div>
                <span style={{ fontSize: '9px', color: '#9ca3af' }}>{d.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 1, animationDelay: '250ms' }}>
          <div className="card-title">AI Insight Doanh Thu <span className="card-link">Xem tất cả</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
            {[
              'Doanh thu tháng này tăng 22.5% so với tháng trước, chủ yếu nhờ nhóm sản phẩm Nhẫn bạc Minimal.',
              'Nhân viên Nguyễn Thu Hương có tỷ lệ chốt cao nhất (32.1%) và doanh thu cao nhất (254.8 triệu).',
              'Quảng cáo "Nhẫn bạc Classic - Video 1" mang về ROAS cao nhất (7.8x) với chi phí 28.6 triệu.',
              'Khung giờ 20h – 22h có tỷ lệ chốt cao nhất (35.6%) và doanh thu cao nhất trong ngày.',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#4f46e5' }}>•</span>
                <span style={{ color: '#374151' }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '10px', padding: '10px', background: '#eef2ff', borderRadius: '8px', border: '1px solid #e0e7ff' }}>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Dự đoán doanh thu</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Tháng 06/2026</div>
            <div style={{ fontSize: '23px', fontWeight: 800, color: '#111827', margin: '4px 0' }}>1.620.000.000đ</div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a' }}>↑ 17.2% so với tháng 05/2026</div>
          </div>
        </div>
      </div>

      {/* Revenue by Employee + Page + Ads */}
      <div style={{ display: 'flex', gap: '14px' }}>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 1, animationDelay: '300ms' }}>
          <div className="card-title">Doanh thu theo nhân viên <span className="card-link">Xem tất cả</span></div>
          <table className="data-table">
            <thead><tr><th>Nhân viên</th><th>Doanh thu</th><th>Đơn chốt</th><th>Tỷ lệ chốt</th><th>Chất lượng CSKH</th></tr></thead>
            <tbody>
              {revenueByEmployee.map((e, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: `hsl(${i * 67}, 55%, 55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#fff', fontWeight: 600 }}>{e.name.charAt(0)}</div>
                      <span style={{ fontWeight: 500 }}>{e.name}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{e.revenue}</td>
                  <td>{e.orders}</td>
                  <td>{e.closeRate}</td>
                  <td style={{ fontWeight: 600, color: getColor(e.csat) }}>{e.csat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 1, animationDelay: '350ms' }}>
          <div className="card-title">Doanh thu theo Page <span className="card-link">Xem tất cả</span></div>
          <table className="data-table">
            <thead><tr><th>Page</th><th>Doanh thu</th><th>Tin nhắn</th><th>Tỷ lệ chốt</th><th>QA Score</th></tr></thead>
            <tbody>
              {revenueByPage.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <FacebookLogo size={14} weight="fill" style={{ color: '#1877f2' }} />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.revenue}</td>
                  <td>{p.msgs.toLocaleString()}</td>
                  <td>{p.closeRate}</td>
                  <td style={{ fontWeight: 600, color: getColor(p.score) }}>{p.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ position: 'relative', margin: '12px auto 0', width: '120px', height: '120px' }}>
            <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="44" fill="none" stroke="#f3f4f6" strokeWidth="14" />
              {(() => { let off = 0; const c = 2*Math.PI*44; const colors = ['#1877f2','#e4405f','#22c55e'];
                return revenueByPage.map((p, i) => { const rev = parseInt(p.revenue.replace(/\D/g,'')); const pct = rev / 12485; const dash = pct * c; const o = off; off += dash;
                return <circle key={i} cx="60" cy="60" r="44" fill="none" stroke={colors[i]} strokeWidth="14" strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-o} />; });
              })()}
            </svg>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#6b7280' }}>Tổng doanh thu</div>
              <div style={{ fontSize: '11px', fontWeight: 800 }}>1.248.500.000đ</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 1, animationDelay: '400ms' }}>
          <div className="card-title">Doanh thu theo Ads <span className="card-link">Xem tất cả</span></div>
          <table className="data-table">
            <thead><tr><th>Campaign</th><th>Chi phí</th><th>Doanh thu</th><th>ROAS</th></tr></thead>
            <tbody>
              {revenueByAds.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500, fontSize: '11px' }}>{a.name}</td>
                  <td style={{ fontSize: '11px' }}>{a.spend}</td>
                  <td style={{ fontWeight: 600, fontSize: '11px' }}>{a.revenue}</td>
                  <td style={{ fontWeight: 700, color: parseFloat(a.roas) >= 5 ? '#16a34a' : '#d97706', fontSize: '12px' }}>{a.roas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'flex', gap: '14px' }}>
        {/* Product Revenue */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 1, animationDelay: '450ms' }}>
          <div className="card-title">Doanh thu theo sản phẩm (Top 6) <span className="card-link">Xem tất cả</span></div>
          <table className="data-table">
            <thead><tr><th>Sản phẩm</th><th>Hội thoại</th><th>Đơn chốt</th><th>Tỷ lệ chốt</th></tr></thead>
            <tbody>
              {revenueByProduct.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Diamond size={14} weight="duotone" style={{ color: '#f59e0b' }} />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.msgs.toLocaleString()}</td>
                  <td>{p.orders}</td>
                  <td style={{ fontWeight: 600 }}>{p.closeRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Funnel */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 0.8, animationDelay: '500ms' }}>
          <div className="card-title">Phễu Chat → Doanh Thu</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {revenueFunnel.map((f, i) => {
              const w = 100 - i * 14;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: '#4b5563', width: '65px', whiteSpace: 'nowrap' }}>{f.label}</span>
                  <div style={{ flex: 1, height: '20px', borderRadius: '4px', overflow: 'hidden', background: '#f3f4f6' }}>
                    <div style={{ width: anim ? `${w}%` : '0%', height: '100%', background: funnelColors[i], borderRadius: '4px', transition: 'width .8s ease', transitionDelay: `${i * 100}ms`, display: 'flex', alignItems: 'center', padding: '0 6px', fontSize: '10px', fontWeight: 600, color: '#fff' }}>
                      {f.value.toLocaleString()}
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#374151', width: '35px', textAlign: 'right' }}>{f.pct}</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: '8px', padding: '6px 8px', background: '#fffbeb', borderRadius: '6px', fontSize: '11px', color: '#4b5563', display: 'flex', gap: '6px', border: '1px solid #fef3c7', alignItems: 'flex-start' }}>
            <Warning size={14} weight="duotone" style={{ color: '#d97706', flexShrink: 0, marginTop: '1px' }} />
            <span>AI gợi ý: Tỷ lệ rớt cao nhất ở bước Quan tâm → Báo giá (48%). Nên cải thiện kịch bản tư vấn và phản hồi nhanh.</span>
          </div>
        </div>

        {/* Country + VIP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 0.8 }}>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '550ms' }}>
            <div className="card-title">Doanh thu theo quốc gia <span className="card-link">Xem tất cả</span></div>
            <table className="data-table">
              <thead><tr><th>Quốc gia</th><th>Doanh thu</th><th>Đơn</th><th>Tỷ lệ chốt</th></tr></thead>
              <tbody>
                {revenueByCountry.map((c, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{c.country}</td>
                    <td style={{ fontWeight: 600 }}>{c.revenue}</td>
                    <td>{c.orders.toLocaleString()}</td>
                    <td>{c.closeRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '600ms' }}>
            <div className="card-title">Khách hàng giá trị cao (VIP) <span className="card-link">Xem tất cả</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {vipCustomers.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0', borderBottom: '1px solid #f3f4f6', fontSize: '12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: `hsl(${i * 55}, 50%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: 600 }}>{c.name.charAt(0)}</div>
                  <span style={{ flex: 1, fontWeight: 500 }}>{c.name}</span>
                  <span style={{ color: '#9ca3af', fontSize: '11px' }}>{c.orders} đơn</span>
                  <span style={{ fontWeight: 700 }}>{c.revenue}</span>
                  <span className="tag tag-gold" style={{ fontSize: '9px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                    <Crown size={9} weight="fill" />
                    VIP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
