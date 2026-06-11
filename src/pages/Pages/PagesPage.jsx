import { useState, useEffect } from 'react';
import { MagnifyingGlass, FacebookLogo, InstagramLogo, TiktokLogo, ChatCircleText, ShoppingCart, Storefront, Globe } from '@phosphor-icons/react';
import { pageKPIs, pageChannels, pagePerformance, pageDistribution } from '../../data/mockData';

const channelIcons = {
  '📘': FacebookLogo,
  '📸': InstagramLogo,
  '🎵': TiktokLogo,
  '💬': ChatCircleText,
  '🛒': ShoppingCart,
  '🏪': Storefront,
  '🌐': Globe
};

function DonutChart({ data, total, size = 130 }) {
  const r = (size / 2) - 12;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--n-100)" strokeWidth="16" />
        {data.map((d, i) => {
          const dash = (d.pct / 100) * c;
          const o = offset; offset += dash;
          return <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={d.color} strokeWidth="16" strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-o} />;
        })}
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: 'var(--n-500)' }}>Tổng tin nhắn</div>
        <div style={{ fontSize: '21px', fontWeight: 800, color: 'var(--n-900)' }}>{total.toLocaleString()}</div>
      </div>
    </div>
  );
}

export default function PagesPage() {
  const [anim, setAnim] = useState(false);
  const [activeChannel, setActiveChannel] = useState(0);
  const [tab, setTab] = useState('all');
  useEffect(() => { setTimeout(() => setAnim(true), 200); }, []);

  const getColor = (s) => s >= 85 ? 'var(--success-600)' : s >= 75 ? 'var(--warning-600)' : 'var(--orange-500)';
  const getBg = (s) => s >= 85 ? 'var(--success-100)' : s >= 75 ? 'var(--warning-100)' : 'var(--orange-100)';

  const tabs = [
    { key: 'all', label: `Tất cả ${pageChannels.length}` },
    { key: 'facebook', label: 'Facebook 7' },
    { key: 'instagram', label: 'Instagram 2' },
    { key: 'zalo', label: 'Zalo 2' },
    { key: 'other', label: 'Khác 6' },
  ];

  return (
    <div style={{ display: 'flex', gap: '14px', height: '100%' }}>
      {/* Left - Channel List */}
      <div className="card" style={{ width: '260px', minWidth: '260px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Danh sách Page & Kênh</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--n-50)', border: '1px solid var(--n-200)', borderRadius: '6px', padding: '5px 8px', marginBottom: '8px' }}>
          <MagnifyingGlass size={14} style={{ color: 'var(--n-400)' }} />
          <input placeholder="Tìm kiếm page hoặc kênh..." style={{ flex: 1, background: 'transparent', fontSize: '12px', color: 'var(--n-700)' }} />
        </div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 500,
                background: tab === t.key ? 'var(--primary-600)' : 'var(--n-100)',
                color: tab === t.key ? '#fff' : 'var(--n-600)' }}>{t.label}</button>
          ))}
        </div>
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {pageChannels.map((ch, i) => (
            <div key={ch.id} onClick={() => setActiveChannel(i)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '8px', cursor: 'pointer',
                background: activeChannel === i ? 'var(--primary-50)' : 'transparent',
                borderLeft: activeChannel === i ? '3px solid var(--primary-600)' : '3px solid transparent' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: ch.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {(() => {
                  const IconComp = channelIcons[ch.avatar] || Globe;
                  return <IconComp size={16} weight="fill" style={{ color: '#fff' }} />;
                })()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--n-800)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {ch.name}
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', borderRadius: '50%', background: getBg(ch.score), color: getColor(ch.score), fontSize: '10px', fontWeight: 700, marginLeft: 'auto' }}>{ch.score}</span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--n-500)' }}>{ch.type}</div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '10px', color: 'var(--n-500)', marginTop: '2px' }}>
                  <span>Tin nhắn mới: <strong style={{ color: 'var(--n-700)' }}>{ch.msgs}</strong></span>
                  <span>Đang xử lý: <strong>{ch.processing}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button style={{ marginTop: '8px', padding: '6px', fontSize: '12px', color: 'var(--primary-600)', fontWeight: 500 }}>+ Thêm page / kênh</button>
      </div>

      {/* Center - Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto', minWidth: 0 }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {pageKPIs.map((kpi, i) => (
            <div key={i} className="card anim-up" style={{ padding: '12px', animationDelay: `${i * 50}ms` }}>
              <div style={{ fontSize: '11px', color: 'var(--n-500)' }}>{kpi.label}</div>
              <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--n-900)', margin: '2px 0' }}>{kpi.value}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success-600)' }}>{kpi.change}</div>
              {kpi.sub && <div style={{ fontSize: '10px', color: 'var(--n-400)' }}>{kpi.sub}</div>}
            </div>
          ))}
        </div>

        {/* Performance Table */}
        <div className="card anim-up" style={{ animationDelay: '300ms' }}>
          <div className="card-title">Hiệu suất từng Page & Kênh <span className="card-link">Xem tất cả</span></div>
          <table className="data-table">
            <thead>
              <tr><th>Page / Kênh</th><th>Tin nhắn</th><th>Tỷ lệ phản hồi</th><th>Tỷ lệ chốt</th><th>CSAT (Hài lòng)</th><th>Doanh thu</th><th>Chất lượng (AI)</th><th>Xu hướng</th></tr>
            </thead>
            <tbody>
              {pagePerformance.map((p, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-flex', flexShrink: 0 }}>
                        {(() => {
                          const IconComp = channelIcons[pageChannels[i]?.avatar] || Globe;
                          return <IconComp size={15} weight="fill" style={{ color: pageChannels[i]?.color || 'var(--primary-600)' }} />;
                        })()}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '12px' }}>{p.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--n-400)' }}>{p.type}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.msgs.toLocaleString()}</td>
                  <td>{p.responseRate}</td>
                  <td style={{ fontWeight: 600 }}>{p.closeRate}</td>
                  <td>{p.csat}</td>
                  <td>{p.revenue}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', background: getBg(p.quality), color: getColor(p.quality), fontWeight: 700, fontSize: '11px' }}>{p.quality}</span>
                  </td>
                  <td style={{ color: p.trend === '↑' ? 'var(--success-600)' : p.trend === '↓' ? 'var(--danger-600)' : 'var(--n-400)', fontWeight: 600, fontSize: '17px' }}>{p.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Comparison Chart */}
        <div className="card anim-up" style={{ animationDelay: '400ms' }}>
          <div className="card-title">So sánh hiệu suất <span style={{ fontSize: '11px', color: 'var(--n-400)' }}>Chọn chỉ số: Tỷ lệ chốt</span></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '140px', padding: '0 8px' }}>
            {pagePerformance.map((p, i) => {
              const val = parseFloat(p.closeRate);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--n-700)' }}>{p.closeRate}</span>
                  <div style={{ width: '100%', height: anim ? `${val * 4}px` : 0, background: `linear-gradient(180deg, var(--primary-500), var(--primary-300))`, borderRadius: '4px 4px 0 0', transition: 'height .8s ease', transitionDelay: `${i * 80}ms` }} />
                  <span style={{ fontSize: '8px', color: 'var(--n-400)', textAlign: 'center', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name.split(' ').slice(0,2).join(' ')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right - Distribution + Insights */}
      <div style={{ width: '280px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' }}>
        <div className="card anim-up" style={{ animationDelay: '200ms' }}>
          <div className="card-title">Phân bổ tin nhắn theo kênh</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <DonutChart data={pageDistribution} total={8625} />
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {pageDistribution.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color }} />
                  <span style={{ flex: 1, color: 'var(--n-700)' }}>{d.label}</span>
                  <span style={{ fontWeight: 600 }}>{d.pct}%</span>
                  <span style={{ color: 'var(--n-400)', fontSize: '11px' }}>({d.value.toLocaleString()})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card anim-up" style={{ animationDelay: '350ms' }}>
          <div className="card-title">AI Insight về page & kênh</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
            {[
              'Facebook Page "Vienchibao Jewelry" có tỷ lệ chốt cao nhất',
              'Doanh thu từ chat tăng mạnh 22.5% so với tháng trước',
              'Kênh TikTok có lượng tin nhắn tăng nhưng tỷ lệ chốt còn thấp 24.9%',
              'Website Chat có tỷ lệ phản hồi thấp nhất 72.8%',
              'Nên tập trung tối ưu CSKH cho kênh Shopee để tăng tỷ lệ chốt',
              'Instagram có tiềm năng tăng trưởng tốt, hãy đẩy mạnh content',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', padding: '4px 0', borderBottom: i < 5 ? '1px solid var(--n-100)' : 'none' }}>
                <span style={{ color: 'var(--primary-600)', flexShrink: 0 }}>•</span>
                <span style={{ color: 'var(--n-700)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card anim-up" style={{ animationDelay: '450ms' }}>
          <div className="card-title">Top từ khóa khách hàng theo kênh</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
            {[
              { icon: '📘', channel: 'Facebook', keywords: 'nhẫn bạc, size, giá, bảo hành, giao hàng' },
              { icon: '📸', channel: 'Instagram', keywords: 'dây chuyền, mẫu mới, giá, có sẵn không' },
              { icon: '🎵', channel: 'TikTok', keywords: 'review, chất liệu, đeo có đen không, giá' },
              { icon: '💬', channel: 'Zalo', keywords: 'bảo hành, giao hàng, thanh toán, đổi trả' },
              { icon: '🛒', channel: 'Shopee', keywords: 'giá, freeship, kích thước, chất liệu' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', padding: '3px 0' }}>
                <span style={{ display: 'inline-flex', flexShrink: 0, marginTop: '2px' }}>
                  {(() => {
                    const IconComp = channelIcons[item.icon] || Globe;
                    return <IconComp size={13} weight="fill" style={{ color: 'var(--primary-600)' }} />;
                  })()}
                </span>
                <span style={{ color: 'var(--n-500)', fontSize: '11px', lineHeight: 1.4 }}>{item.keywords}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
