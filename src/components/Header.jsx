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
    <header className="flex h-[52px] items-center justify-between border-b border-slate-200 bg-white px-5 z-40 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="flex items-center gap-1.5 text-sm font-bold text-slate-800 leading-tight">
            {page.title}
            {page.badge && <span className="flex items-center justify-center rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-700">{page.badge}</span>}
          </h1>
          <p className="text-[11px] text-slate-500">{page.sub}</p>
        </div>
      </div>
      <div className="hidden flex-1 items-center justify-center gap-3 md:flex">
        <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          <Calendar size={16} weight="duotone" />
          <span>01/05/2026 - 31/05/2026</span>
        </div>
        <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800" title="Cập nhật">
          <ArrowsCounterClockwise size={16} weight="bold" />
        </button>
        <span style={{ fontSize: "11px", color: "var(--n-400)" }}>
          Cập nhật lúc 10:30
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden h-8 items-center gap-2 rounded-lg bg-slate-100 px-3 text-slate-400 lg:flex w-64 transition-colors hover:bg-slate-200">
          <MagnifyingGlass size={14} weight="bold" />
          <span className="text-xs font-medium">Tìm kiếm hội thoại, khách hàng...</span>
        </div>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
          style={{ position: "relative" }}
          title="Bộ lọc"
        >
          <Funnel size={16} weight="duotone" />
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
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
          <div className="flex cursor-pointer items-center gap-2 rounded-xl p-1 pr-3 transition-colors hover:bg-slate-50" onClick={() => setShowDropdown(!showDropdown)}>
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-xs"
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
            <div className="hidden flex-col md:flex">
              <span className="text-xs font-bold leading-tight text-slate-800">{user?.fullName || "Chưa đăng nhập"}</span>
              <span className="text-[10px] text-slate-500" style={{ textTransform: "capitalize" }}>
                {user?.role === "admin" ? "Quản trị viên" : user?.role || "Nhân viên"}
              </span>
            </div>
          </div>
          {showDropdown && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-[1000] flex w-[220px] origin-top-right flex-col rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95">
              <div className="mb-1.5 border-b border-slate-100 px-3 py-2.5">
                <div className="text-[13.5px] font-bold leading-tight text-slate-900">{user?.fullName || "Người dùng"}</div>
                <div className="mt-0.5 break-all text-[11px] text-slate-500">{user?.email || ""}</div>
              </div>
              <div
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-indigo-700"
                onClick={() => {
                  setShowDropdown(false);
                  navigate("/settings");
                }}
              >
                <User weight="bold" />
                <span>Hồ sơ cá nhân</span>
              </div>
              <div className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700" onClick={handleLogout}>
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
