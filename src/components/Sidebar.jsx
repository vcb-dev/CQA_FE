import { NavLink, useLocation } from 'react-router-dom';
import {
  Gauge, ChatCircleText, Brain, ShieldCheck, Users,
  UserCircle, Globe, Megaphone, Package, CurrencyDollar,
  ChartBar, Wrench, GearSix
} from '@phosphor-icons/react';

// Viên Chi Bảo flower logo — 8 petals at 45° intervals
function VCBIcon({ size = 26 }) {
  // Each petal: inner tip slightly inside center, outer tip far out
  // Wide near inner third, tapering to points at both ends
  const petal = 'M 0,9 C 11,3 11,-21 0,-43 C -11,-21 -11,3 0,9 Z';
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size, display: 'block', flexShrink: 0 }}
    >
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <path
          key={a}
          d={petal}
          transform={`rotate(${a})`}
          fill="rgba(255,255,255,0.95)"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

const navItems = [
  { to: '/', icon: Gauge, label: 'Tổng quan' },
  { to: '/conversations', icon: ChatCircleText, label: 'Hội thoại' },
  { to: '/ai-insight', icon: Brain, label: 'AI Insight' },
  { to: '/quality', icon: ShieldCheck, label: 'Chất lượng CSKH' },
  { to: '/employees', icon: Users, label: 'Nhân viên' },
  { to: '/customers', icon: UserCircle, label: 'Khách hàng' },
  { to: '/pages', icon: Globe, label: 'Page / Kênh' },
  { to: '/ads', icon: Megaphone, label: 'Quảng cáo' },
  { to: '/products', icon: Package, label: 'Sản phẩm' },
  { to: '/revenue', icon: CurrencyDollar, label: 'Doanh thu Chat' },
  { to: '/reports', icon: ChartBar, label: 'Báo cáo' },
  { to: '/warranty', icon: Wrench, label: 'Bảo hành' },
  { to: '/settings', icon: GearSix, label: 'Cài đặt' },
];

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><VCBIcon size={26} /></div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title">VIENCHIBAO</span>
          <span className="sidebar-logo-sub">Chat Quality Agent</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
          return (
            <NavLink key={item.to} to={item.to} className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <Icon weight="duotone" /><span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="ai-widget">
        <div className="ai-widget-header">
          <div className="ai-widget-avatar" style={{ background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={18} weight="duotone" style={{ color: 'var(--primary-600)' }} />
          </div>
          <div>
            <div className="ai-widget-title">AI Assistant</div>
            <div className="ai-widget-sub">Trợ lý AI luôn sẵn sàng hỗ trợ bạn 24/7</div>
          </div>
        </div>
        <button className="ai-widget-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%' }}>
          <ChatCircleText size={14} weight="fill" />
          <span>Trò chuyện ngay</span>
        </button>
      </div>
    </aside>
  );
}
