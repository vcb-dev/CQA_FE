import { useState, useEffect } from 'react';
import {
  MagnifyingGlass, Funnel, Star, Sparkle, Phone, Envelope, MapPin, Calendar,
  Users, Crown, UserPlus, SmileySad, Target, ArrowsCounterClockwise, Smiley,
  SmileyMeh, Lightbulb, Warning
} from '@phosphor-icons/react';
import { customerKPIs, customerList } from '../../data/mockData';
import AnalyticsShell from '@/components/analytics/AnalyticsShell';
import KpiGrid from '@/components/analytics/KpiGrid';

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
  '#f59e0b',
  '#22c55e',
  '#ef4444',
  '#a855f7',
  '#ec4899'
];

function getSentimentIcon(s) {
  switch (s) {
    case '😊': return <Smiley size={16} weight="duotone" style={{ color: '#22c55e' }} />;
    case '😐': return <SmileyMeh size={16} weight="duotone" style={{ color: '#f59e0b' }} />;
    case '😞': return <SmileySad size={16} weight="duotone" style={{ color: '#ef4444' }} />;
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
      case 'VIP': return '#4f46e5';
      case 'Nóng': return '#ef4444';
      case 'Tiềm năng': return '#16a34a';
      case 'Lạnh': return '#6b7280';
      case 'Toxic': return 'var(--orange-500)';
      default: return '#4b5563';
    }
  };

  const getStatusBg = (s) => {
    switch (s) {
      case 'VIP': return '#eef2ff';
      case 'Nóng': return '#fef2f2';
      case 'Tiềm năng': return '#f0fdf4';
      case 'Lạnh': return '#f9fafb';
      case 'Toxic': return 'var(--orange-100)';
      default: return '#f9fafb';
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

  const kpiItems = customerKPIs.map((kpi, i) => ({
    ...kpi,
    icon: kpiIconMap[i],
    color: kpiColors[i],
    changePositive: !kpi.change.includes('↓'),
  }));

  return (
    <AnalyticsShell>
    <div className="flex h-full min-h-0 flex-col gap-4">
      <KpiGrid items={kpiItems} columns={6} />

      <div style={{ display: 'flex', gap: '14px', flex: 1, minHeight: 0 }}>
        {/* Left - Customer List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ flex: 1.6, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#1f2937' }}>Danh sách khách hàng</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', border: '1px solid #e5e7eb', background: '#fff', color: '#4b5563' }}>
                <Funnel size={12} /> Lọc nâng cao
              </button>
              <button style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', background: '#4f46e5', color: '#fff', fontWeight: 600 }}>
                + Thêm khách hàng
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 8px' }}>
              <MagnifyingGlass size={14} style={{ color: '#9ca3af' }} />
              <input 
                placeholder="Tìm khách hàng (tên, id, nguồn)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: 'transparent', fontSize: '12.5px', color: '#374151' }} 
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
                  background: activeTab === t.key ? '#4f46e5' : '#f9fafb',
                  color: activeTab === t.key ? '#fff' : '#4b5563',
                  border: activeTab === t.key ? '1px solid #4f46e5' : '1px solid #e5e7eb',
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
                      background: selectedCustomerId === c.id ? '#eef2ff' : 'transparent',
                      borderLeft: selectedCustomerId === c.id ? '3px solid #4f46e5' : '3px solid transparent'
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-500), var(--primary-300))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#fff', fontWeight: 600 }}>
                          {c.name.split(' ').pop().substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '12.5px', color: '#1f2937' }}>{c.name}</div>
                          <div style={{ fontSize: '10px', color: '#9ca3af' }}>#{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontSize: '14px' }}>{c.country}</span></td>
                    <td style={{ fontSize: '12px', color: '#4b5563' }}>{c.source}</td>
                    <td>
                      <span className="tag" style={{ background: getStatusBg(c.status), color: getStatusColor(c.status) }}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '36px', background: '#f3f4f6', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.purchaseScore}%`, background: c.purchaseScore >= 80 ? '#22c55e' : c.purchaseScore >= 50 ? '#f59e0b' : '#ef4444', height: '100%' }} />
                        </div>
                        <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#374151' }}>{c.purchaseScore}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {getSentimentIcon(c.sentiment)}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '12px' }}>{c.totalSpent}</td>
                    <td style={{ textAlign: 'center', fontSize: '12px' }}>{c.orders}</td>
                    <td style={{ fontSize: '11px', color: '#6b7280' }}>{c.lastPurchase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right - Customer Details & AI Insight */}
        <div style={{ width: '310px', minWidth: '310px', display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'auto' }}>
          {/* Detail card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '14px', animationDelay: '100ms' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #f3f4f6', paddingBottom: '6px' }}>
              <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#1f2937' }}>Chi tiết khách hàng</div>
              <span className="tag tag-purple">ID #{selectedCustomer.id}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, var(--primary-400))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '21px', color: '#fff', fontWeight: 700 }}>
                {selectedCustomer.name.split(' ').pop().substring(0, 2).toUpperCase()}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{selectedCustomer.name}</div>
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center', marginTop: '2px' }}>
                  <span className="tag" style={{ background: getStatusBg(selectedCustomer.status), color: getStatusColor(selectedCustomer.status) }}>{selectedCustomer.status}</span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>{selectedCustomer.country}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#f9fafb', padding: '10px', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <Phone size={12} style={{ color: '#9ca3af' }} />
                <span style={{ color: '#6b7280' }}>Số điện thoại:</span>
                <strong style={{ color: '#374151', marginLeft: 'auto' }}>0987 *** 321</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <Envelope size={12} style={{ color: '#9ca3af' }} />
                <span style={{ color: '#6b7280' }}>Email:</span>
                <strong style={{ color: '#374151', marginLeft: 'auto' }}>m***@gmail.com</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <MapPin size={12} style={{ color: '#9ca3af' }} />
                <span style={{ color: '#6b7280' }}>Kênh mua:</span>
                <strong style={{ color: '#374151', marginLeft: 'auto' }}>{selectedCustomer.source}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <Calendar size={12} style={{ color: '#9ca3af' }} />
                <span style={{ color: '#6b7280' }}>Mua cuối:</span>
                <strong style={{ color: '#374151', marginLeft: 'auto' }}>{selectedCustomer.lastPurchase}</strong>
              </div>
            </div>

            <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#1f2937', marginBottom: '8px' }}>Thống kê mua sắm</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>TỔNG CHI TIÊU</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>{selectedCustomer.totalSpent}</div>
              </div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>TỔNG ĐƠN HÀNG</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#4f46e5', marginTop: '2px' }}>{selectedCustomer.orders} đơn</div>
              </div>
            </div>

            {/* AI Prediction Section */}
            <div style={{ border: '1px solid #e0e7ff', background: 'linear-gradient(135deg, #eef2ff 0%, #fff 100%)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3730a3', fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}>
                <Sparkle size={14} weight="duotone" style={{ color: '#4f46e5' }} /> Dự báo hành vi bằng AI
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#4b5563' }}>Khả năng mua lại trong 30 ngày:</span>
                  <strong style={{ color: '#16a34a', marginLeft: 'auto' }}>{selectedCustomer.purchaseScore >= 80 ? 'Cao (85%)' : selectedCustomer.purchaseScore >= 50 ? 'Trung bình (52%)' : 'Thấp (15%)'}</strong>
                </div>
                <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#4b5563' }}>Giá trị vòng đời ước tính (CLV):</span>
                  <strong style={{ color: '#3730a3', marginLeft: 'auto' }}>{selectedCustomer.status === 'VIP' ? '25.000.000đ' : '5.500.000đ'}</strong>
                </div>
                <div style={{ display: 'flex', justifySelf: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#4b5563' }}>Rủi ro rời bỏ (Churn Risk):</span>
                  <strong style={{ color: selectedCustomer.status === 'Toxic' ? '#dc2626' : '#16a34a', marginLeft: 'auto' }}>{selectedCustomer.status === 'Toxic' ? 'Rất cao (90%)' : selectedCustomer.status === 'VIP' ? 'Rất thấp (< 5%)' : 'Thấp (12%)'}</strong>
                </div>
                <div style={{ marginTop: '4px', padding: '6px', background: '#fff', borderRadius: '4px', fontSize: '10.5px', color: '#6b7280', borderLeft: '3px solid var(--primary-500)', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                  {selectedCustomer.status === 'VIP' && (
                    <>
                      <Lightbulb size={12} weight="duotone" style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
                      <span>Khách VIP. Đề xuất gửi mã ưu đãi 15% vào dịp sinh nhật.</span>
                    </>
                  )}
                  {selectedCustomer.status === 'Nóng' && (
                    <>
                      <Lightbulb size={12} weight="duotone" style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
                      <span>Đang có ý định mua cao. Nhân viên cần trả lời ngay trong 5 phút.</span>
                    </>
                  )}
                  {selectedCustomer.status === 'Toxic' && (
                    <>
                      <Warning size={12} weight="duotone" style={{ color: '#ef4444', flexShrink: 0, marginTop: '1px' }} />
                      <span>Cảnh báo: Khách phàn nàn về bảo hành. Chuyển cấp quản lý hỗ trợ gấp.</span>
                    </>
                  )}
                  {selectedCustomer.status === 'Tiềm năng' && (
                    <>
                      <Lightbulb size={12} weight="duotone" style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
                      <span>Quan tâm sản phẩm mới. Đề xuất gửi video feedback thực tế.</span>
                    </>
                  )}
                  {selectedCustomer.status === 'Lạnh' && (
                    <>
                      <Lightbulb size={12} weight="duotone" style={{ color: '#f59e0b', flexShrink: 0, marginTop: '1px' }} />
                      <span>Đã lâu không tương tác. Đề xuất gửi tin nhắn chúc Tết/ngày lễ kèm voucher.</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Customer Insights */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '14px', animationDelay: '250ms' }}>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#1f2937', marginBottom: '8px' }}>AI Khách hàng Insight tháng này</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              {[
                { title: 'Tỷ lệ khách VIP quay lại mua sắm tăng', desc: 'Đạt 38.5% (tăng 4.2% so với tháng trước nhờ chiến dịch tri ân)', positive: true },
                { title: 'Lượng khiếu nại về bảo hành giảm', desc: 'Chỉ còn 37 trường hợp, giảm 12% do xưởng tối ưu quy trình xử lý', positive: true },
                { title: 'Khách từ Facebook Ads chốt nhanh nhất', desc: 'Thời gian chốt trung bình là 18 phút từ khi phát sinh chat', positive: true },
                { title: 'Khách hàng có xu hướng hỏi size', desc: 'Có 32% cuộc hội thoại hỏi về bảng size đo ngón tay', positive: false }
              ].map((insight, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '6px', padding: '5px 0', borderBottom: idx < 3 ? '1px solid #f3f4f6' : 'none' }}>
                  <span style={{ color: insight.positive ? '#22c55e' : 'var(--primary-500)', flexShrink: 0 }}>●</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1f2937' }}>{insight.title}</div>
                    <div style={{ fontSize: '10.5px', color: '#6b7280', marginTop: '1px' }}>{insight.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </AnalyticsShell>
  );
}
