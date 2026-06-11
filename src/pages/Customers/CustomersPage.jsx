import { useState, useEffect } from 'react';
import {
  MagnifyingGlass, Funnel, Star, Sparkle, Phone, Envelope, MapPin, Calendar,
  Users, Crown, UserPlus, SmileySad, Target, ArrowsCounterClockwise, Smiley,
  SmileyMeh, Lightbulb, Warning
} from '@phosphor-icons/react';
import { customerKPIs, customerList } from '../../data/mockData';

const kpiIconMap = [
  Users,                  // 👥 Tổng khách hàng
  Crown,                  // ⭐ Khách VIP
  UserPlus,               // 🆕 Khách mới
  SmileySad,              // 😞 Khách tiêu cực
  Target,                 // 🎯 AI Purchase Score
  ArrowsCounterClockwise  // 🔄 Tỷ lệ quay lại
];

const kpiColors = [
  'var(--primary-500)',
  'var(--warning-500)',
  'var(--success-500)',
  'var(--danger-500)',
  '#a855f7',
  '#ec4899'
];

function getSentimentIcon(s) {
  switch (s) {
    case '😊': return <Smiley size={16} weight="duotone" style={{ color: 'var(--success-500)' }} />;
    case '😐': return <SmileyMeh size={16} weight="duotone" style={{ color: 'var(--warning-500)' }} />;
    case '😞': return <SmileySad size={16} weight="duotone" style={{ color: 'var(--danger-500)' }} />;
    default: return null;
  }
}

export default function CustomersPage() {
  const [anim, setAnim] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState(1);

  useEffect(() => {
    setTimeout(() => setAnim(true), 200);
  }, []);

  const getStatusColor = (s) => {
    switch (s) {
      case 'VIP': return 'var(--primary-600)';
      case 'Nóng': return 'var(--danger-500)';
      case 'Tiềm năng': return 'var(--success-600)';
      case 'Lạnh': return 'var(--n-500)';
      case 'Toxic': return 'var(--orange-500)';
      default: return 'var(--n-600)';
    }
  };

  const getStatusBg = (s) => {
    switch (s) {
      case 'VIP': return 'var(--primary-50)';
      case 'Nóng': return 'var(--danger-50)';
      case 'Tiềm năng': return 'var(--success-50)';
      case 'Lạnh': return 'var(--n-50)';
      case 'Toxic': return 'var(--orange-100)';
      default: return 'var(--n-50)';
    }
  };

  const filteredCustomers = customerList.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.id.toString().includes(searchQuery) ||
                          c.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'vip') return matchesSearch && c.status === 'VIP';
    if (activeTab === 'hot') return matchesSearch && c.status === 'Nóng';
    if (activeTab === 'potential') return matchesSearch && c.status === 'Tiềm năng';
    if (activeTab === 'cold') return matchesSearch && c.status === 'Lạnh';
    if (activeTab === 'toxic') return matchesSearch && c.status === 'Toxic';
    return matchesSearch;
  });

  const selectedCustomer = customerList.find(c => c.id === selectedCustomerId) || customerList[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
        {customerKPIs.map((kpi, i) => {
          const IconComp = kpiIconMap[i];
          return (
            <div key={i} className="card anim-up" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', animationDelay: `${i * 50}ms` }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: kpi.bg || 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {IconComp && <IconComp size={18} weight="duotone" style={{ color: kpiColors[i] }} />}
              </div>
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--n-500)', whiteSpace: 'nowrap' }}>{kpi.label}</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--n-900)', margin: '1px 0' }}>{kpi.value}</div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: kpi.change.includes('↓') ? 'var(--danger-600)' : 'var(--success-600)' }}>
                {kpi.change} <span style={{ color: 'var(--n-400)', fontWeight: 400 }}>so với kỳ trước</span>
              </div>
            </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '14px', flex: 1, minHeight: 0 }}>
        {/* Left - Customer List */}
        <div className="card" style={{ flex: 1.6, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--n-800)' }}>Danh sách khách hàng</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid var(--n-200)', background: '#fff', color: 'var(--n-600)' }}>
                <Funnel size={12} /> Lọc nâng cao
              </button>
              <button style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', background: 'var(--primary-600)', color: '#fff', fontWeight: 600 }}>
                + Thêm khách hàng
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--n-50)', border: '1px solid var(--n-200)', borderRadius: '6px', padding: '5px 8px' }}>
              <MagnifyingGlass size={14} style={{ color: 'var(--n-400)' }} />
              <input 
                placeholder="Tìm khách hàng (tên, id, nguồn)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: 'transparent', fontSize: '12.5px', color: 'var(--n-700)' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'vip', label: 'Khách VIP' },
              { key: 'hot', label: 'Nóng (Mua ngay)' },
              { key: 'potential', label: 'Tiềm năng' },
              { key: 'cold', label: 'Lạnh' },
              { key: 'toxic', label: 'Toxic / Khiếu nại' },
            ].map(t => (
              <button 
                key={t.key} 
                onClick={() => setActiveTab(t.key)}
                style={{ 
                  padding: '4px 10px', 
                  borderRadius: '4px', 
                  fontSize: '12px', 
                  fontWeight: 500,
                  background: activeTab === t.key ? 'var(--primary-600)' : 'var(--n-50)',
                  color: activeTab === t.key ? '#fff' : 'var(--n-600)',
                  border: activeTab === t.key ? '1px solid var(--primary-600)' : '1px solid var(--n-200)',
                  whiteSpace: 'nowrap'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Quốc gia</th>
                  <th>Nguồn</th>
                  <th>Trạng thái</th>
                  <th>AI Purchase Score</th>
                  <th>Cảm xúc</th>
                  <th>Tổng mua</th>
                  <th>Số đơn</th>
                  <th>Mua cuối</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => setSelectedCustomerId(c.id)}
                    style={{ 
                      cursor: 'pointer', 
                      background: selectedCustomerId === c.id ? 'var(--primary-50)' : 'transparent',
                      borderLeft: selectedCustomerId === c.id ? '3px solid var(--primary-600)' : '3px solid transparent'
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-500), var(--primary-300))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#fff', fontWeight: 600 }}>
                          {c.name.split(' ').pop().substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--n-800)' }}>{c.name}</div>
                          <div style={{ fontSize: '10px', color: 'var(--n-400)' }}>#{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '14px' }}>{c.country}</span></td>
                    <td style={{ fontSize: '12px', color: 'var(--n-600)' }}>{c.source}</td>
                    <td>
                      <span className="tag" style={{ background: getStatusBg(c.status), color: getStatusColor(c.status) }}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '36px', background: 'var(--n-100)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.purchaseScore}%`, background: c.purchaseScore >= 80 ? 'var(--success-500)' : c.purchaseScore >= 50 ? 'var(--warning-500)' : 'var(--danger-500)', height: '100%' }} />
                        </div>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--n-700)' }}>{c.purchaseScore}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getSentimentIcon(c.sentiment)}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '12px' }}>{c.totalSpent}</td>
                    <td style={{ textAlign: 'center', fontSize: '12px' }}>{c.orders}</td>
                    <td style={{ fontSize: '11px', color: 'var(--n-500)' }}>{c.lastPurchase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right - Customer Details & AI Insight */}
        <div style={{ width: '310px', minWidth: '310px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' }}>
          {/* Detail card */}
          <div className="card anim-up" style={{ padding: '14px', animationDelay: '100ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid var(--n-100)', paddingBottom: '6px' }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--n-800)' }}>Chi tiết khách hàng</div>
              <span className="tag tag-purple">ID #{selectedCustomer.id}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-600), var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '21px', color: '#fff', fontWeight: 700 }}>
                {selectedCustomer.name.split(' ').pop().substring(0, 2).toUpperCase()}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--n-900)' }}>{selectedCustomer.name}</div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', marginTop: '2px' }}>
                  <span className="tag" style={{ background: getStatusBg(selectedCustomer.status), color: getStatusColor(selectedCustomer.status) }}>{selectedCustomer.status}</span>
                  <span style={{ fontSize: '12px', color: 'var(--n-500)' }}>{selectedCustomer.country}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--n-50)', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <Phone size={12} style={{ color: 'var(--n-400)' }} />
                <span style={{ color: 'var(--n-500)' }}>Số điện thoại:</span>
                <strong style={{ color: 'var(--n-700)', marginLeft: 'auto' }}>0987 *** 321</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <Envelope size={12} style={{ color: 'var(--n-400)' }} />
                <span style={{ color: 'var(--n-500)' }}>Email:</span>
                <strong style={{ color: 'var(--n-700)', marginLeft: 'auto' }}>m***@gmail.com</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <MapPin size={12} style={{ color: 'var(--n-400)' }} />
                <span style={{ color: 'var(--n-500)' }}>Kênh mua:</span>
                <strong style={{ color: 'var(--n-700)', marginLeft: 'auto' }}>{selectedCustomer.source}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <Calendar size={12} style={{ color: 'var(--n-400)' }} />
                <span style={{ color: 'var(--n-500)' }}>Mua cuối:</span>
                <strong style={{ color: 'var(--n-700)', marginLeft: 'auto' }}>{selectedCustomer.lastPurchase}</strong>
              </div>
            </div>

            <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--n-800)', marginBottom: '8px' }}>Thống kê mua sắm</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div style={{ border: '1px solid var(--n-200)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--n-400)' }}>TỔNG CHI TIÊU</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--success-600)', marginTop: '2px' }}>{selectedCustomer.totalSpent}</div>
              </div>
              <div style={{ border: '1px solid var(--n-200)', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--n-400)' }}>TỔNG ĐƠN HÀNG</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary-600)', marginTop: '2px' }}>{selectedCustomer.orders} đơn</div>
              </div>
            </div>

            {/* AI Prediction Section */}
            <div style={{ border: '1px solid var(--primary-100)', background: 'linear-gradient(135deg, var(--primary-50) 0%, #fff 100%)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary-700)', fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}>
                <Sparkle size={14} weight="duotone" style={{ color: 'var(--primary-600)' }} /> Dự báo hành vi bằng AI
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--n-600)' }}>Khả năng mua lại trong 30 ngày:</span>
                  <strong style={{ color: 'var(--success-600)', marginLeft: 'auto' }}>{selectedCustomer.purchaseScore >= 80 ? 'Cao (85%)' : selectedCustomer.purchaseScore >= 50 ? 'Trung bình (52%)' : 'Thấp (15%)'}</strong>
                </div>
                <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--n-600)' }}>Giá trị vòng đời ước tính (CLV):</span>
                  <strong style={{ color: 'var(--primary-700)', marginLeft: 'auto' }}>{selectedCustomer.status === 'VIP' ? '25.000.000đ' : '5.500.000đ'}</strong>
                </div>
                <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--n-600)' }}>Rủi ro rời bỏ (Churn Risk):</span>
                  <strong style={{ color: selectedCustomer.status === 'Toxic' ? 'var(--danger-600)' : 'var(--success-600)', marginLeft: 'auto' }}>{selectedCustomer.status === 'Toxic' ? 'Rất cao (90%)' : selectedCustomer.status === 'VIP' ? 'Rất thấp (< 5%)' : 'Thấp (12%)'}</strong>
                </div>
                <div style={{ marginTop: '4px', padding: '6px', background: '#fff', borderRadius: '4px', fontSize: '10.5px', color: 'var(--n-500)', borderLeft: '3px solid var(--primary-500)', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                  {selectedCustomer.status === 'VIP' && (
                    <>
                      <Lightbulb size={12} weight="duotone" style={{ color: 'var(--warning-500)', flexShrink: 0, marginTop: '1px' }} />
                      <span>Khách VIP. Đề xuất gửi mã ưu đãi 15% vào dịp sinh nhật.</span>
                    </>
                  )}
                  {selectedCustomer.status === 'Nóng' && (
                    <>
                      <Lightbulb size={12} weight="duotone" style={{ color: 'var(--warning-500)', flexShrink: 0, marginTop: '1px' }} />
                      <span>Đang có ý định mua cao. Nhân viên cần trả lời ngay trong 5 phút.</span>
                    </>
                  )}
                  {selectedCustomer.status === 'Toxic' && (
                    <>
                      <Warning size={12} weight="duotone" style={{ color: 'var(--danger-500)', flexShrink: 0, marginTop: '1px' }} />
                      <span>Cảnh báo: Khách phàn nàn về bảo hành. Chuyển cấp quản lý hỗ trợ gấp.</span>
                    </>
                  )}
                  {selectedCustomer.status === 'Tiềm năng' && (
                    <>
                      <Lightbulb size={12} weight="duotone" style={{ color: 'var(--warning-500)', flexShrink: 0, marginTop: '1px' }} />
                      <span>Quan tâm sản phẩm mới. Đề xuất gửi video feedback thực tế.</span>
                    </>
                  )}
                  {selectedCustomer.status === 'Lạnh' && (
                    <>
                      <Lightbulb size={12} weight="duotone" style={{ color: 'var(--warning-500)', flexShrink: 0, marginTop: '1px' }} />
                      <span>Đã lâu không tương tác. Đề xuất gửi tin nhắn chúc Tết/ngày lễ kèm voucher.</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Customer Insights */}
          <div className="card anim-up" style={{ padding: '14px', animationDelay: '250ms' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--n-800)', marginBottom: '8px' }}>AI Khách hàng Insight tháng này</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              {[
                { title: 'Tỷ lệ khách VIP quay lại mua sắm tăng', desc: 'Đạt 38.5% (tăng 4.2% so với tháng trước nhờ chiến dịch tri ân)', positive: true },
                { title: 'Lượng khiếu nại về bảo hành giảm', desc: 'Chỉ còn 37 trường hợp, giảm 12% do xưởng tối ưu quy trình xử lý', positive: true },
                { title: 'Khách từ Facebook Ads chốt nhanh nhất', desc: 'Thời gian chốt trung bình là 18 phút từ khi phát sinh chat', positive: true },
                { title: 'Khách hàng có xu hướng hỏi size', desc: 'Có 32% cuộc hội thoại hỏi về bảng size đo ngón tay', positive: false }
              ].map((insight, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '6px', padding: '5px 0', borderBottom: idx < 3 ? '1px solid var(--n-100)' : 'none' }}>
                  <span style={{ color: insight.positive ? 'var(--success-500)' : 'var(--primary-500)', flexShrink: 0 }}>●</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--n-800)' }}>{insight.title}</div>
                    <div style={{ fontSize: '10.5px', color: 'var(--n-500)', marginTop: '1px' }}>{insight.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
