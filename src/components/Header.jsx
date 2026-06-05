import {
  Bell,
  MagnifyingGlass,
  Calendar,
  Funnel,
  ArrowsCounterClockwise,
} from "@phosphor-icons/react";
import { useLocation } from "react-router-dom";
import { currentUser } from "@/data/mockData";

const pageTitles = {
  "/": {
    title: "Tổng quan",
    sub: "Theo dõi chất lượng hội thoại và hiệu suất chăm sóc khách hàng",
  },
  "/conversations": {
    title: "Hội thoại",
    sub: "Quản lý và phân tích toàn bộ hội thoại với khách hàng",
  },
  "/ai-insight": {
    title: "AI Insight",
    sub: "Phân tích chuyên sâu từ toàn bộ hội thoại bằng AI",
    badge: "Beta",
  },
  "/quality": {
    title: "Chất lượng CSKH",
    sub: "Đánh giá và theo dõi chất lượng chăm sóc khách hàng",
  },
  "/employees": {
    title: "Nhân viên",
    sub: "Quản lý và đánh giá hiệu suất nhân viên",
  },
};

export default function Header() {
  const location = useLocation();
  const page = pageTitles[location.pathname] || pageTitles["/"];

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-title">
          <h1 style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {page.title}
            {page.badge && <span className="tag tag-purple">{page.badge}</span>}
          </h1>
          <p>{page.sub}</p>
        </div>
      </div>
      <div className="header-center">
        <div className="header-date">
          <Calendar size={16} weight="duotone" />
          <span>01/05/2026 - 31/05/2026</span>
        </div>
        <button className="header-btn" title="Cập nhật">
          <ArrowsCounterClockwise size={16} weight="bold" />
        </button>
        <span style={{ fontSize: "11px", color: "var(--n-400)" }}>
          Cập nhật lúc 10:30
        </span>
      </div>
      <div className="header-right">
        <div className="header-search">
          <MagnifyingGlass size={14} weight="bold" />
          <span>Tìm kiếm hội thoại, khách hàng...</span>
        </div>
        <button
          className="header-btn"
          style={{ position: "relative" }}
          title="Bộ lọc"
        >
          <Funnel size={16} weight="duotone" />
        </button>
        <button
          className="header-btn"
          style={{ position: "relative" }}
          title="Thông báo"
        >
          <Bell size={16} weight="duotone" />
          <span
            style={{
              position: "absolute",
              top: 2,
              right: 2,
              minWidth: 16,
              height: 16,
              background: "var(--danger-500)",
              borderRadius: "99px",
              border: "2px solid white",
              fontSize: "9px",
              fontWeight: 700,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
            }}
          >
            3
          </span>
        </button>
        <div className="header-user">
          <div className="header-avatar">{currentUser.avatar}</div>
          <div className="header-user-info">
            <span className="header-user-name">{currentUser.name}</span>
            <span className="header-user-role">{currentUser.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
