import { useState, useEffect } from 'react';
import { MagnifyingGlass, Funnel, Star, Megaphone, TrendUp, Sparkle, Warning, ArrowUpRight, ShieldWarning, Coins, Envelope, ChartBar, ChatCircleText, Package, Target, FacebookLogo } from '@phosphor-icons/react';
import { adsKPIs, adsCampaigns } from '../../data/mockData';

const kpiIconMap = [
  Coins,           // 💸 Chi phí quảng cáo
  Envelope,        // 📩 Tin nhắn từ QC
  ChartBar,        // 📉 Chi phí/tin nhắn
  ChatCircleText,  // 💬 Tỷ lệ phản hồi
  Package,         // 📦 Tỷ lệ chốt
  Coins,           // 💰 Doanh thu từ chat
  Target           // 🎯 ROAS AI
];

const kpiColors = [
  '#ef4444', // red
  'var(--primary-500)',
  '#22c55e',
  '#f59e0b',
  '#22c55e',
  '#22c55e',
  '#f59e0b'
];

export default function AdsPage() {
  const [anim, setAnim] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    setTimeout(() => setAnim(true), 200);
  }, []);

  const filteredCampaigns = adsCampaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.target.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'all') return matchesSearch;
    if (activeFilter === 'high_roas') return matchesSearch && parseFloat(c.roas) >= 5;
    if (activeFilter === 'low_quality') return matchesSearch && c.quality <= 3;
    if (activeFilter === 'toxic') return matchesSearch && parseFloat(c.toxic) >= 5;
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {adsKPIs.map((kpi, i) => {
          const IconComp = kpiIconMap[i];
          const iconColor = kpiColors[i];
          return (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '8px', animationDelay: `${i * 40}ms` }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: kpi.bg || '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {IconComp && <IconComp size={16} weight="duotone" style={{ color: iconColor }} />}
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap' }}>{kpi.label}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: '1px 0', whiteSpace: 'nowrap' }}>{kpi.value}</div>
                <div style={{ fontSize: '10px', fontWeight: 600, color: kpi.change.includes('↓') && kpi.label.includes('Chi phí') ? '#16a34a' : kpi.change.includes('↓') ? '#dc2626' : '#16a34a' }}>
                  {kpi.change}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '14px', flex: 1, minHeight: 0 }}>
        {/* Left - Active Campaigns */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1.8, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Megaphone size={16} weight="duotone" style={{ color: '#4f46e5' }} />
              Hiệu quả từng chiến dịch quảng cáo
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid #e5e7eb', background: '#fff', color: '#4b5563' }}>
                <Funnel size={12} /> Bộ lọc
              </button>
              <button style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', background: '#4f46e5', color: '#fff', fontWeight: 600 }}>
                Đồng bộ Ads Manager
              </button>
            </div>
          </div>

          {/* Search & Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 8px' }}>
              <MagnifyingGlass size={14} style={{ color: '#9ca3af' }} />
              <input 
                placeholder="Tìm chiến dịch, đối tượng mục tiêu..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: 'transparent', fontSize: '12.5px', color: '#374151' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            {[
              { key: 'all', label: 'Tất cả chiến dịch' },
              { key: 'high_roas', label: 'ROAS cao (>= 5x)' },
              { key: 'low_quality', label: 'Chất lượng kém (<= 3 sao)' },
              { key: 'toxic', label: 'Lead rác cao (>= 5%)' },
            ].map(t => (
              <button 
                key={t.key} 
                onClick={() => setActiveFilter(t.key)}
                style={{ 
                  padding: '4px 10px', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  fontWeight: 500,
                  background: activeFilter === t.key ? '#4f46e5' : '#f9fafb',
                  color: activeFilter === t.key ? '#fff' : '#4b5563',
                  border: activeFilter === t.key ? '1px solid #4f46e5' : '1px solid #e5e7eb'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Campaigns Table */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tên chiến dịch</th>
                  <th>Đối tượng</th>
                  <th>Chi phí</th>
                  <th>Tin nhắn</th>
                  <th>Đơn chốt</th>
                  <th>Doanh thu</th>
                  <th>Đánh giá lead</th>
                  <th>% Lead rác (AI)</th>
                  <th>ROAS AI</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((c, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#1f2937', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <FacebookLogo size={14} weight="fill" style={{ color: '#1877f2' }} />
                        <span>{c.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: '#4b5563' }}>{c.target}</td>
                    <td style={{ fontSize: '12px' }}>{c.cost}</td>
                    <td style={{ fontSize: '12px' }}>{c.msgs}</td>
                    <td style={{ fontSize: '12px', fontWeight: 600 }}>{c.orders}</td>
                    <td style={{ fontSize: '12.5px', fontWeight: 700, color: '#1f2937' }}>{c.revenue}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '1px' }}>
                        {[...Array(5)].map((_, idx) => (
                          <Star 
                            key={idx} 
                            size={11}
                            weight={idx < c.quality ? "fill" : "regular"}
                            style={{ 
                              color: idx < c.quality ? 'var(--star)' : '#d1d5db' 
                            }} 
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="tag" style={{ 
                        background: parseFloat(c.toxic) >= 5 ? '#fef2f2' : '#f0fdf4', 
                        color: parseFloat(c.toxic) >= 5 ? '#dc2626' : '#16a34a',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Warning size={11} weight="duotone" />
                        {c.toxic}
                      </span>
                    </td>
                    <td>
                      <span style={{ 
                        fontWeight: 800, 
                        color: parseFloat(c.roas) >= 5 ? '#16a34a' : parseFloat(c.roas) >= 3.5 ? '#4f46e5' : '#ef4444',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        {c.roas} <ArrowUpRight size={10} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right - AI Recommendations & ROI breakdown */}
        <div style={{ width: '310px', minWidth: '310px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' }}>
          {/* ROAS comparison */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '14px', animationDelay: '100ms' }}>
            <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#1f2937', marginBottom: '8px' }}>Xếp hạng ROAS theo kênh quảng cáo</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
              {[
                { name: 'Organic (Tự nhiên)', roas: '5.3x', pct: 100, color: '#22c55e' },
                { name: 'Facebook Ads', roas: '4.2x', pct: 80, color: 'var(--primary-500)' },
                { name: 'Instagram Ads', roas: '3.6x', pct: 68, color: '#e4405f' },
                { name: 'TikTok Ads', roas: '2.8x', pct: 53, color: '#000' },
                { name: 'Google Ads', roas: '2.4x', pct: 45, color: '#4285f4' },
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ fontWeight: 500, color: '#374151' }}>{item.name}</span>
                    <strong style={{ color: '#1f2937' }}>{item.roas}</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: anim ? `${item.pct}%` : '0%', height: '100%', background: item.color, borderRadius: '4px', transition: 'width .8s ease', transitionDelay: `${idx * 100}ms` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Ads Tuning suggestions */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '14px', animationDelay: '200ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3730a3', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
              <Sparkle size={14} weight="duotone" style={{ color: '#4f46e5' }} /> Tối ưu quảng cáo bằng AI (Real-time)
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
              <div style={{ borderLeft: '3px solid #ef4444', background: '#fef2f2', padding: '8px', borderRadius: '4px' }}>
                <div style={{ fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Warning size={12} weight="duotone" /> Lãng phí ngân sách ở TikTok
                </div>
                <div style={{ color: '#374151', fontSize: '11px', marginTop: '2px', lineHeight: 1.4 }}>
                  Chiến dịch <strong>TikTok - Trend Ring</strong> có tỷ lệ lead rác rất cao (8.5%) và ROAS thấp (3.3x). Đề xuất giảm 30% ngân sách và thắt chặt đối tượng mục tiêu thành &quot;Nữ 18-24 hứng thú trang sức bạc&quot;.
                </div>
              </div>

              <div style={{ borderLeft: '3px solid #22c55e', background: '#f0fdf4', padding: '8px', borderRadius: '4px' }}>
                <div style={{ fontWeight: 700, color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendUp size={12} /> Điểm sáng ROAS tại Facebook
                </div>
                <div style={{ color: '#374151', fontSize: '11px', marginTop: '2px', lineHeight: 1.4 }}>
                  Chiến dịch <strong>Nhẫn bạc Classic - Video 1</strong> hoạt động xuất sắc với ROAS 7.1x, tỷ lệ lead rác thấp (2.1%). Đề xuất tăng 20% ngân sách hàng ngày để tối đa hóa doanh thu chốt đơn.
                </div>
              </div>

              <div style={{ borderLeft: '3px solid var(--primary-500)', background: '#eef2ff', padding: '8px', borderRadius: '4px' }}>
                <div style={{ fontWeight: 700, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldWarning size={12} weight="duotone" /> Cải thiện kịch bản chat QC
                </div>
                <div style={{ color: '#374151', fontSize: '11px', marginTop: '2px', lineHeight: 1.4 }}>
                  Khách từ chiến dịch <strong>Lắc tay Minimal - Video 2</strong> thường phàn nàn &quot;không đúng như video&quot; (5.2% tiêu cực). Cần bổ sung video quay thật sản phẩm vào tin nhắn chào mừng tự động.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
