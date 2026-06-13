import { useState, useEffect, useRef } from "react";
import {
  Bell,
  MagnifyingGlass,
  Calendar,
  Funnel,
  ArrowsCounterClockwise,
  User,
  SignOut,
} from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

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
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const page = pageTitles[location.pathname] || pageTitles["/"];
  
  const { data: user } = useQuery({
    queryKey: ["currentUserProfile"],
  });

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    queryClient.clear();
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

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
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <div className="header-user" onClick={() => setShowDropdown(!showDropdown)}>
            <div
              className="header-avatar"
              style={{
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: user?.avatarUrl ? "transparent" : "var(--primary-100)",
                color: user?.avatarUrl ? "inherit" : "var(--primary-700)",
                fontWeight: 700,
                fontSize: "12px",
              }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                />
              ) : (
                getInitials(user?.fullName)
              )}
            </div>
            <div className="header-user-info">
              <span className="header-user-name">{user?.fullName || "Chưa đăng nhập"}</span>
              <span className="header-user-role" style={{ textTransform: "capitalize" }}>
                {user?.role === "admin" ? "Quản trị viên" : user?.role || "Nhân viên"}
              </span>
            </div>
          </div>
          {showDropdown && (
            <div className="avatar-dropdown">
              <div className="avatar-dropdown-header">
                <div className="avatar-dropdown-name">{user?.fullName || "Người dùng"}</div>
                <div className="avatar-dropdown-email">{user?.email || ""}</div>
              </div>
              <div
                className="avatar-dropdown-item"
                onClick={() => {
                  setShowDropdown(false);
                  navigate("/settings");
                }}
              >
                <User weight="bold" />
                <span>Hồ sơ cá nhân</span>
              </div>
              <div className="avatar-dropdown-item danger" onClick={handleLogout}>
                <SignOut weight="bold" />
                <span>Đăng xuất</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
