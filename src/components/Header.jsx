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
import { fetchInboxConversations } from "@/features/cskh-quality/api";

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

  const [selectedPreset, setSelectedPreset] = useState("Tháng này");
  const [dateRange, setDateRange] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const page = pageTitles[location.pathname] || pageTitles["/"];
  
  const { data: user } = useQuery({
    queryKey: ["currentUserProfile"],
  });

  // Fetch conversations to calculate real unread notification count
  const { data: conversations } = useQuery({
    queryKey: ["cskh", "inbox-conversations"],
    queryFn: () => fetchInboxConversations(),
  });

  const unreadCount = conversations 
    ? conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0) 
    : 0;

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    const now = new Date();
    const format = (d) => {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    };

    if (preset === "Hôm nay") {
      setDateRange(`${format(now)} - ${format(now)}`);
    } else if (preset === "7 ngày qua") {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setDateRange(`${format(past)} - ${format(now)}`);
    } else if (preset === "30 ngày qua") {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setDateRange(`${format(past)} - ${format(now)}`);
    } else {
      // Tháng này
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setDateRange(`${format(firstDay)} - ${format(lastDay)}`);
    }
  };

  useEffect(() => {
    // Set default date range to current month
    handlePresetChange("Tháng này");
    
    // Set default initial update timestamp
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setLastUpdated(`Cập nhật lúc ${hh}:${mm}`);
  }, []);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    toast.loading("Đang cập nhật dữ liệu...", { id: "refresh-db" });
    try {
      await queryClient.invalidateQueries();
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setLastUpdated(`Cập nhật lúc ${hh}:${mm}`);
      toast.success("Đã cập nhật dữ liệu mới nhất!", { id: "refresh-db" });
    } catch {
      toast.error("Không thể làm mới dữ liệu", { id: "refresh-db" });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    queryClient.clear();
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  return (
    <header className="flex h-[56px] items-center justify-between border-b border-slate-200 bg-white px-5 z-40 shrink-0 shadow-sm">
      {/* Title */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="flex items-center gap-1.5 text-sm font-bold text-slate-800 leading-tight">
            {page.title}
            {page.badge && (
              <span className="flex items-center justify-center rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-700">
                {page.badge}
              </span>
            )}
          </h1>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{page.sub}</p>
        </div>
      </div>

      {/* Center - Dynamic Date Picker & Refresh Indicator */}
      <div className="hidden flex-1 items-center justify-center gap-4 md:flex">
        {/* Preset Select */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200/60 px-2.5 py-1 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100">
            <Calendar size={15} weight="duotone" className="text-indigo-600" />
            <select 
              value={selectedPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 font-bold cursor-pointer pr-1 py-0.5"
            >
              <option value="Tháng này">Tháng này</option>
              <option value="Hôm nay">Hôm nay</option>
              <option value="7 ngày qua">7 ngày qua</option>
              <option value="30 ngày qua">30 ngày qua</option>
            </select>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{dateRange}</span>
        </div>

        {/* Refresh Button */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-850 cursor-pointer ${
              isRefreshing ? "animate-spin text-indigo-600 bg-indigo-50" : ""
            }`}
            title="Cập nhật"
          >
            <ArrowsCounterClockwise size={15} weight="bold" />
          </button>
          <span className="text-[11px] text-slate-400 font-medium select-none">
            {lastUpdated}
          </span>
        </div>
      </div>

      {/* Right - Profile & Actions */}
      <div className="flex items-center gap-3">
        {/* Real search input */}
        <div className="hidden h-8 items-center gap-2 rounded-lg bg-slate-50 border border-slate-200/60 px-3 text-slate-400 lg:flex w-60 transition-all focus-within:bg-white focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-100">
          <MagnifyingGlass size={14} weight="bold" className="text-slate-400" />
          <input 
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Tìm kiếm hội thoại, khách..."
            className="bg-transparent text-xs outline-none border-none w-full text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Filter button */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
          title="Bộ lọc"
        >
          <Funnel size={15} weight="duotone" />
        </button>

        {/* Notification bell with real unread count */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 cursor-pointer relative"
          title="Thông báo"
        >
          <Bell size={15} weight="duotone" />
          {unreadCount > 0 && (
            <span
              className="absolute top-1.5 right-1.5 min-w-[15px] h-[15px] bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center px-0.5 shadow-sm"
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex cursor-pointer items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-slate-50" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-xs"
              style={{
                background: user?.avatarUrl ? "transparent" : "var(--primary-100)",
                color: user?.avatarUrl ? "inherit" : "var(--primary-700)",
              }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                getInitials(user?.fullName)
              )}
            </div>
            
            <div className="hidden flex-col md:flex">
              <span className="text-xs font-bold leading-tight text-slate-700">{user?.fullName || "Chưa đăng nhập"}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
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
