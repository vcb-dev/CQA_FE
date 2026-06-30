import { useState } from 'react';
import { Calendar, Download, CheckCircle, Printer, ShareNetwork, Sparkle, Clock, Plus, Sliders, ChartBar, ChatCircleText, Users, User, FacebookLogo, Megaphone, Package, CurrencyDollar, Smiley, TrendUp } from '@phosphor-icons/react';
import { reportTypes } from '../../data/mockData';
import AnalyticsShell from '@/components/analytics/AnalyticsShell';

const reportIcons = {
  '📊': ChatCircleText,
  '👥': Users,
  '👤': User,
  '📘': FacebookLogo,
  '📢': Megaphone,
  '📦': Package,
  '💰': CurrencyDollar,
  '😊': Smiley,
  '📈': TrendUp
};

const reportColors = {
  '📊': '#4f46e5',
  '👥': '#10b981',
  '👤': '#3b82f6',
  '📘': '#1877f2',
  '📢': '#ef4444',
  '📦': '#f59e0b',
  '💰': '#16a34a',
  '😊': '#a855f7',
  '📈': '#ec4899'
};

export default function ReportsPage() {
  const [selectedReportIdx, setSelectedReportIdx] = useState(0);
  const [dateRange, setDateRange] = useState('this_month');
  const [format, setFormat] = useState('pdf');
  const [successMsg, setSuccessMsg] = useState('');

  const handleExport = () => {
    setSuccessMsg('Đang khởi tạo xuất file dữ liệu...');
    setTimeout(() => {
      setSuccessMsg(`Xuất báo cáo dạng ${format.toUpperCase()} thành công! Tải xuống tự động sau vài giây.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1500);
  };

  const selectedReport = reportTypes[selectedReportIdx] || reportTypes[0];

  const scheduledReports = [
    { id: 1, title: 'Báo cáo chất lượng CSKH hàng ngày', channel: 'Slack #cskh-alerts', time: 'Hàng ngày, 21:00', status: 'Hoạt động' },
    { id: 2, title: 'Báo cáo doanh thu & tỷ lệ chốt đơn hàng tuần', channel: 'Zalo Nhóm Ban Giám Đốc', time: 'Thứ Hai, 08:30', status: 'Hoạt động' },
    { id: 3, title: 'Phân tích từ khóa tiêu cực bằng AI', channel: 'Email: cuong@vienchibao.com', time: 'Mỗi tháng, ngày 1', status: 'Hoạt động' },
  ];

  return (
    <AnalyticsShell>
    <div style={{ display: 'flex', gap: '14px', height: '100%' }}>
      {/* Left - Report Types list */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ width: '250px', minWidth: '250px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: '#1f2937', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ChartBar size={16} weight="duotone" style={{ color: '#4f46e5' }} />
          Trung tâm báo cáo
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'auto' }}>
          {reportTypes.map((rep, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedReportIdx(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 8px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: selectedReportIdx === idx ? '#eef2ff' : 'transparent',
                borderLeft: selectedReportIdx === idx ? '3px solid #4f46e5' : '3px solid transparent',
                transition: 'all var(--tr-fast)'
              }}
            >
              {(() => {
                const IconComp = reportIcons[rep.icon] || ChartBar;
                const iconColor = reportColors[rep.icon] || '#4b5563';
                return (
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: selectedReportIdx === idx ? '#e0e7ff' : '#f9fafb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <IconComp size={16} weight="duotone" style={{ color: selectedReportIdx === idx ? '#3730a3' : iconColor }} />
                  </div>
                );
              })()}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rep.title}</div>
                <div style={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{rep.desc}</div>
              </div>
              <span style={{ fontSize: '10px', padding: '2px 5px', borderRadius: '10px', background: selectedReportIdx === idx ? '#e0e7ff' : '#f3f4f6', color: selectedReportIdx === idx ? '#3730a3' : '#4b5563' }}>
                {rep.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Center - Config and Preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto', minWidth: 0 }}>
        {/* Report configuration */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col" style={{ padding: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{selectedReport.title}</h3>
              <p style={{ fontSize: '11px', color: '#6b7280' }}>Cấu hình tham số và xuất báo cáo dữ liệu định kỳ</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', fontSize: '12px' }}>
                <Calendar size={12} style={{ color: '#9ca3af' }} />
                <select 
                  value={dateRange} 
                  onChange={(e) => setDateRange(e.target.value)}
                  style={{ background: 'transparent', color: '#374151', fontWeight: 500 }}
                >
                  <option value="today">Hôm nay</option>
                  <option value="yesterday">Hôm qua</option>
                  <option value="this_week">Tuần này</option>
                  <option value="last_7_days">7 ngày qua</option>
                  <option value="this_month">Tháng này (5/2026)</option>
                  <option value="last_month">Tháng trước (4/2026)</option>
                  <option value="this_year">Năm nay</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 8px', fontSize: '12px' }}>
                <select 
                  value={format} 
                  onChange={(e) => setFormat(e.target.value)}
                  style={{ background: 'transparent', color: '#374151', fontWeight: 500 }}
                >
                  <option value="pdf">Xuất file PDF</option>
                  <option value="xlsx">Xuất file Excel (.xlsx)</option>
                  <option value="csv">Xuất file CSV</option>
                </select>
              </div>

              <button 
                onClick={handleExport}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  padding: '5px 12px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  background: '#4f46e5', 
                  color: '#fff', 
                  fontWeight: 600 
                }}
              >
                <Download size={12} weight="bold" /> Xuất báo cáo
              </button>
            </div>
          </div>

          {successMsg && (
            <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f0fdf4', border: '1px solid #dcfce7', color: '#16a34a', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={14} weight="duotone" /> {successMsg}
            </div>
          )}
        </div>

        {/* Visual Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', animationDelay: '100ms' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Xem trước báo cáo</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ color: '#9ca3af' }}><Printer size={14} /></button>
              <button style={{ color: '#9ca3af' }}><ShareNetwork size={14} /></button>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', opacity: anim ? 1 : 0, transition: 'opacity 0.6s ease' }}>
            {/* Report Header Mockup */}
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>VIENCHIBAO - BÁO CÁO HỆ THỐNG</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#4f46e5', marginTop: '2px' }}>{selectedReport.title.toUpperCase()}</div>
              <div style={{ fontSize: '10.5px', color: '#6b7280', marginTop: '2px' }}>Thời gian: 01/05/2026 - 31/05/2026 | Người kết xuất: Bùi Duy Cường (Admin)</div>
            </div>

            {/* Statistics grid mockup */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {[
                { label: 'Tổng số mẫu thu thập', val: '5.253 mẫu', rate: '↑ 14.5%', positive: true },
                { label: 'Tỷ lệ hoàn thành đánh giá', val: '98.2%', rate: '↑ 2.1%', positive: true },
                { label: 'Điểm số trung bình (QA)', val: '85.4 điểm', rate: '↑ 6.2đ', positive: true },
                { label: 'Độ chính xác AI định vị', val: '94.8%', rate: '↑ 1.8%', positive: true },
              ].map((stat, idx) => (
                <div key={idx} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px' }}>
                  <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>{stat.label}</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginTop: '2px' }}>{stat.val}</div>
                  <div style={{ fontSize: '10px', color: stat.positive ? '#16a34a' : '#dc2626', fontWeight: 600, marginTop: '2px' }}>{stat.rate} so với tháng trước</div>
                </div>
              ))}
            </div>

            {/* Fake Chart / Visual Component in Preview */}
            <div style={{ flex: 1, minHeight: '140px', background: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginBottom: '10px' }}>BIỂU ĐỒ TRỰC QUAN HÓA XU HƯỚNG TỔNG QUAN</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '90px', width: '80%', paddingBottom: '6px' }}>
                {[60, 75, 45, 90, 85, 68, 88].map((h, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                    <div style={{ width: '100%', height: anim ? `${h}%` : 0, background: 'linear-gradient(180deg, #4f46e5 0%, var(--primary-400) 100%)', borderRadius: '4px 4px 0 0', transition: 'height .8s ease', transitionDelay: `${i * 60}ms` }} />
                    <span style={{ fontSize: '9px', color: '#9ca3af' }}>T{i+1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Executive Summary */}
            <div style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #fff 100%)', border: '1px solid #e0e7ff', borderRadius: '8px', padding: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 700, color: '#3730a3', marginBottom: '4px' }}>
                <Sparkle size={14} weight="duotone" style={{ color: '#4f46e5' }} /> Tóm tắt điều hành bằng AI (AI Executive Summary)
              </div>
              <p style={{ fontSize: '11.5px', color: '#374151', lineHeight: 1.45 }}>
                Dữ liệu tháng này cho thấy hiệu suất CSKH cải thiện vượt bậc, nâng điểm QA trung bình từ 79.2 lên 85.4. Kênh chat Facebook ghi nhận doanh số đóng góp cao nhất (632.5M). Trái lại, tỷ lệ phản hồi của Livechat Website chỉ đạt 72.8%, cần bổ sung nhân sự trực ca đêm hoặc kích hoạt chatbot hỗ trợ ngoài giờ làm việc.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right - Scheduled Automation reports list */}
      <div style={{ width: '300px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 1, padding: '14px', animationDelay: '200ms', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} weight="duotone" style={{ color: '#4f46e5' }} /> Gửi báo cáo tự động
            </div>
            <button style={{ color: '#4f46e5', fontSize: '19px', padding: 0 }}><Plus size={16} /></button>
          </div>
          <p style={{ fontSize: '10.5px', color: '#6b7280', marginBottom: '10px' }}>Đặt lịch gửi báo cáo tự động qua Zalo, Slack, Telegram hoặc Email của quản lý</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflow: 'auto' }}>
            {scheduledReports.map(rep => (
              <div key={rep.id} style={{ padding: '8px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '12px', color: '#1f2937' }}>{rep.title}</strong>
                  <span style={{ fontSize: '9px', padding: '1px 4px', borderRadius: '3px', background: '#dcfce7', color: '#16a34a', fontWeight: 600 }}>{rep.status}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginTop: '4px', fontSize: '10px', color: '#6b7280' }}>
                  <span>Nơi nhận: <strong>{rep.channel}</strong></span>
                  <span>Thời gian: <strong>{rep.time}</strong></span>
                </div>
              </div>
            ))}
          </div>

          <button style={{ marginTop: '10px', padding: '6px', fontSize: '12px', color: '#4f46e5', fontWeight: 600, border: '1px dashed var(--primary-300)', borderRadius: '6px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Sliders size={12} /> Quản lý lịch biểu gửi tự động
          </button>
        </div>
      </div>
    </div>
    </AnalyticsShell>
  );
}
