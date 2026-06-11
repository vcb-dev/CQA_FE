import { useState, useEffect } from 'react';
import { MagnifyingGlass, Download, TrendUp, TrendDown, Minus, Package, ChatCircleText, EnvelopeOpen, ShoppingCart, CurrencyDollar, ChartBar, Diamond } from '@phosphor-icons/react';
import { productKPIs, productList, productTopRevenue } from '../../data/mockData';

const kpiIconMap = [
  Package,          // 📦
  ChatCircleText,   // 💬
  EnvelopeOpen,     // 📨
  ShoppingCart,     // 🛒
  CurrencyDollar,   // 💰
  ChartBar          // 📊
];

const kpiColors = [
  'var(--primary-500)',
  '#3b82f6',
  '#a855f7',
  '#f59e0b',
  'var(--success-500)',
  '#ec4899'
];

export default function ProductsPage() {
  const [anim, setAnim] = useState(false);
  const [search, setSearch] = useState('');
  useEffect(() => { setTimeout(() => setAnim(true), 200); }, []);

  const getColor = (s) => s >= 85 ? 'var(--success-600)' : s >= 75 ? 'var(--warning-600)' : 'var(--orange-500)';
  const getBg = (s) => s >= 85 ? 'var(--success-100)' : s >= 75 ? 'var(--warning-100)' : 'var(--orange-100)';
  const TrendIcon = ({ t }) => t === '↑' ? <TrendUp size={12} style={{ color: 'var(--success-600)' }} /> : t === '↓' ? <TrendDown size={12} style={{ color: 'var(--danger-600)' }} /> : <Minus size={12} style={{ color: 'var(--n-400)' }} />;

  const productInsights = [
    'Nhẫn bạc Classic đang là sản phẩm thu hút nhiều tin nhắn nhất (1.245 tin nhắn) và có tỷ lệ chốt cao nhất (12.4%).',
    'Dây chuyền bạc Minimal có doanh thu cao thứ 2 và tăng trưởng tốt (20.6%) so với tháng trước.',
    'Bông tai bạc Tiny có tỷ lệ phản hồi thấp hơn trung bình (78.6%). Nên tối ưu mô tả và hình ảnh sản phẩm.',
    'Vòng tay bạc Charm có performance thấp, cần xem xét điều chỉnh giá hoặc chiến lược quảng bá.',
  ];

  const statusData = [
    { label: 'Sản phẩm bán chạy', value: 48, pct: '16.8%', color: '#22c55e' },
    { label: 'Sản phẩm tiềm năng', value: 72, pct: '25.2%', color: '#3b82f6' },
    { label: 'Sản phẩm trung bình', value: 106, pct: '37.1%', color: '#f59e0b' },
    { label: 'Sản phẩm kém hiệu quả', value: 60, pct: '21.0%', color: '#ef4444' },
  ];

  return (
    <div style={{ display: 'flex', gap: '14px', height: '100%' }}>
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto', minWidth: 0 }}>
        {/* KPIs */}
        <div className="card anim-up">
          <div className="card-title">Tổng quan hiệu suất sản phẩm</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
            {productKPIs.map((kpi, i) => {
              const IconComp = kpiIconMap[i];
              return (
                <div key={i} style={{ padding: '10px', background: 'var(--n-50)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {IconComp && <IconComp size={15} weight="duotone" style={{ color: kpiColors[i] }} />}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--n-500)', marginTop: '4px' }}>{kpi.label}</div>
                  <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--n-900)', margin: '2px 0' }}>{kpi.value}</div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success-600)' }}>{kpi.change}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Product Table */}
        <div className="card anim-up" style={{ animationDelay: '200ms' }}>
          <div className="card-title">
            <span>Danh sách sản phẩm</span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'var(--n-50)', border: '1px solid var(--n-200)', borderRadius: '6px' }}>
                <MagnifyingGlass size={12} style={{ color: 'var(--n-400)' }} />
                <input placeholder="Tìm kiếm sản phẩm..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ background: 'transparent', fontSize: '11px', width: '120px' }} />
              </div>
              <select style={{ padding: '4px 8px', border: '1px solid var(--n-200)', borderRadius: '6px', fontSize: '11px' }}>
                <option>Tất cả danh mục</option>
              </select>
              <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', border: '1px solid var(--n-200)', borderRadius: '6px', fontSize: '11px', color: 'var(--n-600)' }}>
                <Download size={12} /> Xuất dữ liệu
              </button>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr><th>Sản phẩm</th><th>Danh mục</th><th>Tin nhắn</th><th>Tỷ lệ phản hồi</th><th>Tỷ lệ chốt</th><th>Đã bán</th><th>Doanh thu</th><th>Doanh thu / SP</th><th>AI Score</th><th>Xu hướng</th></tr>
            </thead>
            <tbody>
              {productList.map((p, i) => (
                <tr key={i} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--n-50)', border: '1px solid var(--n-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Diamond size={18} weight="duotone" style={{ color: 'var(--warning-500)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '12px' }}>{p.name}</div>
                        <div style={{ fontSize: '10px', color: 'var(--n-400)' }}>{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="tag tag-gray">{p.category}</span></td>
                  <td>
                    <div><strong>{p.msgs.toLocaleString()}</strong></div>
                    <div style={{ fontSize: '10px', color: 'var(--success-600)' }}>↑ {(Math.random() * 20 + 5).toFixed(1)}%</div>
                  </td>
                  <td>{p.responseRate}</td>
                  <td style={{ fontWeight: 600 }}>{p.closeRate}</td>
                  <td>{p.sold}</td>
                  <td style={{ fontWeight: 500 }}>{p.revenue}</td>
                  <td>{p.revenuePerUnit}</td>
                  <td>
                    <div style={{ position: 'relative', width: '36px', height: '36px' }}>
                      <svg width="36" height="36" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="18" cy="18" r="14" fill="none" stroke="var(--n-100)" strokeWidth="4" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke={getColor(p.aiScore)} strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 14}`} strokeDashoffset={anim ? 2 * Math.PI * 14 * (1 - p.aiScore / 100) : 2 * Math.PI * 14}
                          style={{ transition: 'stroke-dashoffset .8s ease', transitionDelay: `${i * 100}ms` }} />
                      </svg>
                      <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '10px', fontWeight: 700, color: getColor(p.aiScore) }}>{p.aiScore}</span>
                    </div>
                  </td>
                  <td><TrendIcon t={p.trend} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '11px', color: 'var(--n-500)' }}>
            <span>Hiển thị 1 - 6 trong 286 sản phẩm</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5, '...', 48].map((p, i) => (
                <button key={i} style={{ width: '24px', height: '24px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                  background: p === 1 ? 'var(--primary-600)' : 'var(--n-100)', color: p === 1 ? '#fff' : 'var(--n-600)' }}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'flex', gap: '14px' }}>
          {/* Messages Chart */}
          <div className="card anim-up" style={{ flex: 1, animationDelay: '300ms' }}>
            <div className="card-title">Số tin nhắn theo sản phẩm (Top 10)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '130px', padding: '0 4px' }}>
              {productList.map((p, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--n-700)' }}>{p.msgs.toLocaleString()}</span>
                  <div style={{ width: '100%', height: anim ? `${p.msgs / 12}px` : 0, background: 'linear-gradient(180deg, var(--primary-500), var(--primary-300))', borderRadius: '3px 3px 0 0', transition: 'height .8s ease', transitionDelay: `${i * 80}ms` }} />
                  <span style={{ fontSize: '8px', color: 'var(--n-400)', textAlign: 'center', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name.split(' ').slice(0, 2).join(' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Close Rate Chart */}
          <div className="card anim-up" style={{ flex: 1, animationDelay: '350ms' }}>
            <div className="card-title">Tỷ lệ chốt theo sản phẩm (Top 10)</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '130px', padding: '0 4px' }}>
              {productList.map((p, i) => {
                const val = parseFloat(p.closeRate);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--n-700)' }}>{p.closeRate}</span>
                    <div style={{ width: '100%', height: anim ? `${val * 10}px` : 0, background: 'linear-gradient(180deg, #22c55e, #16a34a)', borderRadius: '3px 3px 0 0', transition: 'height .8s ease', transitionDelay: `${i * 80}ms` }} />
                    <span style={{ fontSize: '8px', color: 'var(--n-400)', textAlign: 'center', maxWidth: '50px' }}>{p.name.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Donut */}
          <div className="card anim-up" style={{ flex: 0.8, animationDelay: '400ms' }}>
            <div className="card-title">Tình trạng sản phẩm</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
                <svg width="90" height="90" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="45" cy="45" r="32" fill="none" stroke="var(--n-100)" strokeWidth="12" />
                  {(() => { let off = 0; const c = 2*Math.PI*32; return statusData.map((d, i) => {
                    const dash = (d.value / 286) * c; const o = off; off += dash;
                    return <circle key={i} cx="45" cy="45" r="32" fill="none" stroke={d.color} strokeWidth="12" strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-o} />;
                  })})()}
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                  <div style={{ fontSize: '17px', fontWeight: 800 }}>286</div>
                  <div style={{ fontSize: '8px', color: 'var(--n-500)' }}>sản phẩm</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {statusData.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: d.color }} />
                    <span style={{ color: 'var(--n-700)', flex: 1 }}>{d.label}</span>
                    <span style={{ fontWeight: 600 }}>{d.value}</span>
                    <span style={{ color: 'var(--n-400)', fontSize: '10px' }}>({d.pct})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ width: '270px', minWidth: '270px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' }}>
        <div className="card anim-up" style={{ animationDelay: '150ms' }}>
          <div className="card-title">Top sản phẩm doanh thu cao nhất <span className="card-link">Xem tất cả</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {productTopRevenue.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', background: 'var(--n-50)', borderRadius: '8px' }}>
                <span className={`rank-badge ${i < 3 ? `rank-${i + 1}` : 'rank-n'}`} style={{ width: '24px', height: '24px', fontSize: '11px' }}>{p.rank}</span>
                <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: 'var(--n-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px' }}>💍</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--n-800)' }}>{p.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--n-400)' }}>{p.sold}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--n-900)' }}>{p.revenue}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card anim-up" style={{ animationDelay: '300ms', background: 'var(--primary-50)', border: '1px solid var(--primary-100)' }}>
          <div className="card-title">AI Insight về sản phẩm</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {productInsights.map((text, i) => (
              <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '12px', lineHeight: 1.4, padding: '4px 0', borderBottom: i < productInsights.length - 1 ? '1px solid var(--primary-100)' : 'none' }}>
                <span style={{ color: 'var(--primary-600)', fontSize: '13px', flexShrink: 0 }}>💡</span>
                <span style={{ color: 'var(--n-700)' }}>{text}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '8px', textAlign: 'center' }}><span className="card-link">Xem tất cả insight →</span></div>
        </div>
      </div>
    </div>
  );
}
