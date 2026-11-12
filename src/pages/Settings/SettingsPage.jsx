import {
  connectTikTokAccounts,
  deleteCskhPage,
  fetchCskhPages,
  getCskhOAuthStartUrl,
  getCskhTikTokOAuthStartUrl,
  isAsyncInboxSync,
  refreshCskhOAuth,
  setCskhPageEnabled,
  syncInboxFromGraph,
} from "@/features/cskh-quality/api";
import { InstagramTestPrepPanel } from "@/features/cskh-quality/InstagramTestPrepPanel";
import { cskhPageAvatarSrc } from "@/features/cskh-quality/messageMedia";
import UserAccessPanel from "@/features/user-access/UserAccessPanel";
import RolePermissionsPanel from "@/features/user-access/RolePermissionsPanel";
import { hasPermission, useCurrentUserProfile } from "@/features/user-access/api";
import PancakeChannelsPanel from "@/features/pancake-test/PancakeChannelsPanel";
import { buildOAuthChannelReturnUrl } from "@/lib/authSession";
import {
  CaretRight,
  FacebookLogo,
  GearSix,
  InstagramLogo,
  ThreadsLogo,
  TiktokLogo,
  YoutubeLogo,
} from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const SETTINGS_TABS = [
  { key: "channel", label: "Cài đặt kênh", permission: "channel.manage" },
  { key: "accounts", label: "Tài khoản & phân kênh" },
  { key: "roles", label: "Phân quyền vai trò", permission: "role.manage" },
];

const FB_FALLBACK_IMG =
  "https://www.facebook.com/images/profile/timeline/homepage/composer/logo_graphic.png";
const IG_FALLBACK_IMG =
  "https://www.instagram.com/static/images/ico/favicon-192.png";
const TT_FALLBACK_IMG =
  "https://sf16-website-login.neutral.ttwstatic.com/obj/tiktok_web_login_static/tiktok/webapp/main/webapp-desktop/8152caf0c8e8bc67ae0d.png";

function ChannelPagesTable({
  pages,
  nameHeader,
  fallbackImg,
  busy,
  busyText,
  emptyText,
  onToggle,
  onDelete,
}) {
  if (busy) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "36px 24px",
          gap: "10px",
          background: "#f9fafb",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          color: "#6b7280",
        }}
      >
        <Loader2
          size={24}
          className="animate-spin"
          style={{ color: "#4f46e5" }}
        />
        <span style={{ fontSize: "12px", fontWeight: 500 }}>{busyText}</span>
      </div>
    );
  }
  if (!pages.length) {
    return (
      <div
        style={{
          padding: "18px",
          textAlign: "center",
          background: "#f9fafb",
          borderRadius: "8px",
          color: "#6b7280",
          fontSize: "12px",
          border: "1px solid #e5e7eb",
          lineHeight: 1.5,
        }}
      >
        {emptyText}
      </div>
    );
  }
  return (
    <div
      style={{
        overflow: "auto",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
      }}
    >
      <table className="data-table" style={{ margin: 0 }}>
        <thead>
          <tr>
            <th>Hình ảnh</th>
            <th>{nameHeader}</th>
            <th>ID kênh</th>
            <th>Trạng thái hoạt động</th>
            <th style={{ textAlign: "right" }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => {
            const avatarSrc =
              cskhPageAvatarSrc({
                pictureUrl: page.pagePictureUrl,
                pageId: page.pageId,
              }) || fallbackImg;
            const numericId = String(page.pageId || "").replace(/^tt_/, "");
            return (
            <tr key={page.pageId}>
              <td>
                <img
                  src={avatarSrc}
                  alt={page.pageName || ""}
                  referrerPolicy="no-referrer"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #e5e7eb",
                  }}
                  onError={(e) => {
                    e.target.src = fallbackImg;
                  }}
                />
              </td>
              <td>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "12.5px",
                    color: "#1f2937",
                  }}
                >
                  {page.pageName &&
                  page.pageName !== "undefined" &&
                  page.pageName !== "null"
                    ? page.pageName
                    : page.handle
                      ? `@${page.handle}`
                      : "Không có tên"}
                </div>
                {page.handle &&
                page.pageName !== `@${page.handle}` &&
                page.pageName !== page.handle ? (
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    @{page.handle}
                  </div>
                ) : null}
              </td>
              <td
                style={{
                  fontSize: "11.5px",
                  color: "#6b7280",
                  fontFamily: "monospace",
                }}
              >
                {page.handle ? (
                  <div>
                    <div>@{page.handle}</div>
                    <div style={{ fontSize: 10, color: "#9ca3af" }}>
                      {numericId}
                    </div>
                  </div>
                ) : (
                  numericId
                )}
              </td>
              <td>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <input
                    type="checkbox"
                    checked={page.enabled}
                    onChange={(e) => onToggle(page.pageId, e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: page.enabled ? "#16a34a" : "#6b7280",
                      fontWeight: 600,
                    }}
                  >
                    {page.enabled ? "Đang hoạt động" : "Tạm dừng"}
                  </span>
                </div>
              </td>
              <td style={{ textAlign: "right" }}>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Bạn có chắc muốn xóa ${page.pageName || page.pageId} khỏi hệ thống?`,
                      )
                    ) {
                      onDelete(page.pageId);
                    }
                  }}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    border: "1px solid #fee2e2",
                    background: "#fef2f2",
                    color: "#dc2626",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Xóa
                </button>
              </td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function SettingsPage() {
  const [anim, setAnim] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const { data: currentUser } = useCurrentUserProfile();
  const canManageChannels = hasPermission(currentUser, "channel.manage");
  const settingsTabs = SETTINGS_TABS.filter(
    (tab) => !tab.permission || hasPermission(currentUser, tab.permission),
  );
  const activeTab = settingsTabs[activeTabIdx] ?? settingsTabs[0];

  // Fetch real channels/pages
  const {
    data: pagesData,
    isLoading: isLoadingPages,
    isFetching: isFetchingPages,
  } = useQuery({
    queryKey: ["cskh", "pages"],
    queryFn: () => fetchCskhPages(),
    enabled: canManageChannels,
    refetchInterval: (query) =>
      query.state.data?.oauthSyncStatus === "running" ? 2_000 : false,
  });

  // Toggle active/inactive status
  const toggleMutation = useMutation({
    mutationFn: ({ pageId, enabled }) => setCskhPageEnabled(pageId, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cskh", "pages"] });
      toast.success("Cập nhật trạng thái trang thành công!");
    },
    onError: (err) => {
      toast.error("Lỗi khi cập nhật trạng thái trang: " + (err.message || err));
    },
  });

  // Delete page
  const deleteMutation = useMutation({
    mutationFn: (pageId) => deleteCskhPage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cskh", "pages"] });
      toast.success("Đã xóa trang thành công!");
    },
    onError: (err) => {
      toast.error("Lỗi khi xóa trang: " + (err.message || err));
    },
  });

  // Sync messages
  const [isSyncing, setIsSyncing] = useState(false);
  const syncMutation = useMutation({
    mutationFn: (pageId) => syncInboxFromGraph(pageId),
    onMutate: () => {
      setIsSyncing(true);
    },
    onSuccess: (data) => {
      setIsSyncing(false);
      if (isAsyncInboxSync(data)) {
        toast.info(
          data.message || "Đang đồng bộ nền — làm mới danh sách sau vài phút",
        );
        return;
      }
      toast.success(
        `Đồng bộ thành công ${data.synced} tin nhắn từ ${data.pageCount} trang!`,
      );
    },
    onError: (err) => {
      setIsSyncing(false);
      toast.error("Lỗi khi đồng bộ tin nhắn: " + (err.message || err));
    },
  });

  // Refresh OAuth pages list
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshMutation = useMutation({
    mutationFn: () => refreshCskhOAuth(),
    onMutate: () => {
      setIsRefreshing(true);
    },
    onSuccess: (data) => {
      setIsRefreshing(false);
      queryClient.invalidateQueries({ queryKey: ["cskh", "pages"] });
      const adsNote =
        typeof data.adAccountCount === "number"
          ? data.adsReadConnected
            ? ` Marketing API: ${data.adAccountCount} tài khoản QC.`
            : " Chưa thấy tài khoản QC — cần OAuth bằng admin quảng cáo."
          : "";
      toast.success(`Đã đồng bộ lại ${data.pageCount} trang.${adsNote}`);
    },
    onError: (err) => {
      setIsRefreshing(false);
      toast.error(
        "Lỗi khi đồng bộ lại danh sách trang: " + (err.message || err),
      );
    },
  });

  const isPagesBusy = isLoadingPages || isFetchingPages || isRefreshing;
  const isOAuthSyncing = pagesData?.oauthSyncStatus === "running";
  const allChannelPages = pagesData?.pages ?? [];
  const fbPages = allChannelPages.filter(
    (p) => p.platform !== "instagram" && p.platform !== "tiktok",
  );
  const igPages = allChannelPages.filter((p) => p.platform === "instagram");
  const ttPages = allChannelPages.filter((p) => p.platform === "tiktok");
  const tiktokConnected = ttPages.length > 0;

  const reconnectTikTokOn404Ref = useRef(false);
  const refreshTikTokMutation = useMutation({
    mutationFn: () => connectTikTokAccounts(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cskh", "pages"] });
      toast.success(`Đã cập nhật ${data.pageCount} kênh TikTok`);
    },
    onError: (err) => {
      const status = err?.response?.status;
      if (status === 404 && reconnectTikTokOn404Ref.current) {
        window.location.href = getCskhTikTokOAuthStartUrl(
          buildOAuthChannelReturnUrl(),
        );
        return;
      }
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Không cập nhật được kênh TikTok. Bấm Kết nối TikTok for Business.",
      );
    },
  });

  useEffect(() => {
    setTimeout(() => setAnim(true), 200);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const idx = settingsTabs.findIndex((tab) => tab.key === tabParam);
    if (idx !== -1) {
      setActiveTabIdx(idx);
    }
  }, [searchParams, settingsTabs.length]);

  return (
    <div style={{ display: "flex", gap: "14px", height: "100%" }}>
      {/* Left - Settings Tabs Navigation */}
      <div
        className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col"
        style={{
          width: "220px",
          minWidth: "220px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          padding: "12px",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "14px",
            color: "#1f2937",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <GearSix size={16} weight="duotone" style={{ color: "#4f46e5" }} />
          Cấu hình hệ thống
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            flex: 1,
            overflow: "auto",
          }}
        >
          {settingsTabs.map((tab, idx) => (
            <div
              key={tab.key}
              onClick={() => setActiveTabIdx(idx)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "9px 10px",
                borderRadius: "8px",
                cursor: "pointer",
                background: activeTab?.key === tab.key ? "#eef2ff" : "transparent",
                color: activeTab?.key === tab.key ? "#3730a3" : "#374151",
                fontWeight: activeTab?.key === tab.key ? 600 : 500,
                fontSize: "13px",
                transition: "all var(--tr-fast)",
              }}
            >
              <span>{tab.label}</span>
              {activeTab?.key === tab.key && <CaretRight size={14} />}
            </div>
          ))}
        </div>
      </div>

      {/* Center - Detailed settings parameters based on tab */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          overflow: "auto",
          minWidth: 0,
        }}
      >
        {/* Cài đặt kênh */}
        {activeTab?.key === "channel" && (
          <div
            className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4"
            style={{
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {isLoadingPages && !pagesData ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "64px 24px",
                  gap: "12px",
                  color: "#6b7280",
                }}
              >
                <Loader2
                  size={32}
                  className="animate-spin"
                  style={{ color: "#4f46e5" }}
                />
                <span style={{ fontSize: "13px", fontWeight: 500 }}>
                  Đang tải cấu hình kênh...
                </span>
              </div>
            ) : (
              <>
                <InstagramTestPrepPanel />
                <div
                  style={{
                    borderBottom: "1px solid #f3f4f6",
                    paddingBottom: "8px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    Cấu hình Kênh Kết nối
                  </h3>
                  <p style={{ fontSize: "11px", color: "#6b7280" }}>
                    Kết nối Meta (Facebook/Instagram) và TikTok for Business
                    riêng. Threads và YouTube chưa bật OAuth.
                  </p>
                </div>

                {/* ===== Kênh từ Facebook ===== */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <FacebookLogo
                        size={18}
                        weight="fill"
                        style={{ color: "#1877f2" }}
                      />
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#111827",
                          margin: 0,
                        }}
                      >
                        Tài khoản Meta
                      </h4>
                    </div>
                    {pagesData?.oauthConnected && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => refreshMutation.mutate()}
                          disabled={isRefreshing}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: "#f9fafb",
                            border: "1px solid #e5e7eb",
                            color: "#374151",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer",
                          }}
                        >
                          <RefreshCw
                            size={12}
                            className={isRefreshing ? "animate-spin" : ""}
                          />
                          Đồng bộ lại Pages
                        </button>

                        <button
                          onClick={() => syncMutation.mutate(undefined)}
                          disabled={isSyncing}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 600,
                            background: "#4f46e5",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            cursor: "pointer",
                          }}
                        >
                          <RefreshCw
                            size={12}
                            className={isSyncing ? "animate-spin" : ""}
                          />
                          Đồng bộ tin nhắn
                        </button>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      background: pagesData?.oauthConnected
                        ? "#f0fdf4"
                        : "#f9fafb",
                      border: pagesData?.oauthConnected
                        ? "1px solid #dcfce7"
                        : "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: pagesData?.oauthConnected
                            ? "#1877f2"
                            : "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        <FacebookLogo
                          size={20}
                          weight={
                            pagesData?.oauthConnected ? "fill" : "regular"
                          }
                        />
                      </div>
                      <div>
                        <h4
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#1f2937",
                          }}
                        >
                          {pagesData?.oauthConnected
                            ? `Tài khoản Facebook: ${pagesData.oauthUser}`
                            : "Chưa kết nối tài khoản Facebook"}
                        </h4>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            marginTop: "2px",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            flexWrap: "wrap",
                          }}
                        >
                          {isPagesBusy ? (
                            <>
                              <Loader2
                                size={12}
                                className="animate-spin"
                                style={{ color: "#4f46e5" }}
                              />
                              Đang cập nhật thông tin kết nối...
                            </>
                          ) : pagesData?.oauthConnected ? (
                            `Kết nối hoạt động. Đồng bộ cuối: ${pagesData.oauthUpdatedAt ? new Date(pagesData.oauthUpdatedAt).toLocaleString("vi-VN") : "Chưa rõ"}`
                          ) : (
                            "Kết nối Facebook để đồng bộ tin nhắn từ Fanpage của bạn."
                          )}
                        </p>
                        {pagesData?.oauthConnected && !isPagesBusy && (
                          <>
                            <p
                              style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                marginTop: "6px",
                                color:
                                  pagesData.adAccountCount === undefined
                                    ? "#6b7280"
                                    : pagesData.adsReadConnected
                                      ? "#15803d"
                                      : "#b45309",
                              }}
                            >
                              {pagesData.adAccountCount === undefined
                                ? "Trạng thái Marketing API: cần cập nhật server mới"
                                : pagesData.adsReadConnected
                                  ? `✓ Marketing API: ${pagesData.adAccountCount} tài khoản QC (Ads Manager)`
                                  : "⚠ Chưa thấy tài khoản QC — OAuth bằng admin trên Business Manager"}
                            </p>
                            {pagesData.adsReadConnected &&
                              pagesData.adAccountCount != null && (
                                <p
                                  style={{
                                    fontSize: "10px",
                                    color: "#9ca3af",
                                    marginTop: "4px",
                                    lineHeight: 1.45,
                                    maxWidth: "420px",
                                  }}
                                >
                                  Đây là số{" "}
                                  <strong>tài khoản chi tiêu QC</strong> trên
                                  Ads Manager — <strong>không phải</strong> số
                                  Fanpage đang chạy quảng cáo. Nhiều Page có thể
                                  chạy QC qua chung một tài khoản; bạn đang quản
                                  lý <strong>{fbPages.length} Fanpage</strong>{" "}
                                  bên dưới.
                                </p>
                              )}
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        window.location.href = getCskhOAuthStartUrl(
                          buildOAuthChannelReturnUrl(),
                        );
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        background: "#1877f2",
                        color: "#fff",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <Link2 size={14} />
                      {pagesData?.oauthConnected
                        ? "Cập nhật kết nối Facebook"
                        : "Kết nối tài khoản Facebook"}
                    </button>
                  </div>

                  {isOAuthSyncing && (
                    <div
                      style={{
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "8px",
                        padding: "12px 14px",
                        fontSize: "11px",
                        color: "#1d4ed8",
                        lineHeight: 1.5,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Loader2
                        size={14}
                        className="animate-spin"
                        style={{ flexShrink: 0 }}
                      />
                      <span>
                        <strong>Đang đồng bộ Fanpage từ Facebook...</strong> Bạn
                        có thể dùng hệ thống ngay; danh sách Page sẽ cập nhật tự
                        động trong vài giây.
                      </span>
                    </div>
                  )}

                  {pagesData?.oauthSyncStatus === "failed" &&
                    pagesData?.oauthSyncError && (
                      <div
                        style={{
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          borderRadius: "8px",
                          padding: "12px 14px",
                          fontSize: "11px",
                          color: "#b91c1c",
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>Đồng bộ Page thất bại:</strong>{" "}
                        {pagesData.oauthSyncError}
                      </div>
                    )}

                  {pagesData?.oauthConnected &&
                    pagesData.adsReadConnected === false && (
                      <div
                        style={{
                          background: "#fffbeb",
                          border: "1px solid #fde68a",
                          borderRadius: "8px",
                          padding: "12px 14px",
                          fontSize: "11px",
                          color: "#92400e",
                          lineHeight: 1.5,
                        }}
                      >
                        <strong>Chưa kết nối Marketing API:</strong> Facebook
                        Page đã kết nối nhưng hệ thống không thấy tài khoản
                        quảng cáo. Bấm{" "}
                        <strong>Cập nhật kết nối Facebook</strong> và đăng nhập
                        bằng tài khoản <strong>admin tài khoản QC</strong> trên
                        Business Manager (không phải nút &quot;Đồng bộ lại
                        Pages&quot;).
                      </div>
                    )}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    Kênh theo nền tảng
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      padding: "14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <FacebookLogo
                        size={18}
                        weight="fill"
                        style={{ color: "#1877f2" }}
                      />
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#111827",
                          margin: 0,
                        }}
                      >
                        Facebook
                      </h4>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#6b7280",
                          background: "#f3f4f6",
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        {fbPages.length} kênh
                      </span>
                    </div>
                    <ChannelPagesTable
                      pages={fbPages}
                      nameHeader="Tên Trang / Fanpage"
                      fallbackImg={FB_FALLBACK_IMG}
                      busy={isPagesBusy}
                      busyText={
                        isRefreshing
                          ? "Đang đồng bộ lại danh sách trang..."
                          : "Đang tải danh sách trang..."
                      }
                      emptyText={
                        pagesData?.oauthConnected
                          ? "Không tìm thấy Fanpage nào. Kiểm tra lại quyền truy cập Facebook."
                          : "Kết nối tài khoản Facebook để lấy Fanpage vào mục này."
                      }
                      onToggle={(pageId, enabled) =>
                        toggleMutation.mutate({ pageId, enabled })
                      }
                      onDelete={(pageId) => deleteMutation.mutate(pageId)}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      padding: "14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <InstagramLogo
                        size={18}
                        weight="fill"
                        style={{ color: "#e1306c" }}
                      />
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#111827",
                          margin: 0,
                        }}
                      >
                        Instagram
                      </h4>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#6b7280",
                          background: "#f3f4f6",
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        {igPages.length} kênh
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#6b7280",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      Instagram Professional gắn vào Fanpage trên Meta. Sau đó
                      bấm <strong>Cập nhật kết nối Facebook</strong> để cấp
                      quyền tin nhắn.
                    </p>
                    <ChannelPagesTable
                      pages={igPages}
                      nameHeader="Tên Instagram"
                      fallbackImg={IG_FALLBACK_IMG}
                      busy={isPagesBusy}
                      busyText="Đang tải kênh Instagram..."
                      emptyText={
                        pagesData?.oauthConnected
                          ? "Chưa thấy Instagram nào. Gắn Instagram Professional vào Fanpage (Meta Business Suite), rồi Cập nhật kết nối Facebook."
                          : "Kết nối Facebook trước, rồi gắn Instagram Professional vào Fanpage."
                      }
                      onToggle={(pageId, enabled) =>
                        toggleMutation.mutate({ pageId, enabled })
                      }
                      onDelete={(pageId) => deleteMutation.mutate(pageId)}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      padding: "14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <TiktokLogo
                        size={18}
                        weight="fill"
                        style={{ color: "#111827" }}
                      />
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#111827",
                          margin: 0,
                        }}
                      >
                        TikTok
                      </h4>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#6b7280",
                          background: "#f3f4f6",
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        {ttPages.length} kênh
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "#6b7280",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      OAuth <strong>Advertiser / Business Center</strong> — kéo
                      kênh TikTok đã gắn BC vào CRM. Chat (Business Messaging)
                      xin riêng sau khi list kênh xong.
                    </p>
                    <div
                      style={{
                        background: tiktokConnected ? "#f0fdf4" : "#f9fafb",
                        border: tiktokConnected
                          ? "1px solid #dcfce7"
                          : "1px solid #e5e7eb",
                        borderRadius: "8px",
                        padding: "14px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: tiktokConnected ? "#111827" : "#e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            flexShrink: 0,
                          }}
                        >
                          <TiktokLogo size={20} weight="fill" />
                        </div>
                        <div>
                          <h4
                            style={{
                              fontSize: "13px",
                              fontWeight: 700,
                              color: "#1f2937",
                              margin: 0,
                            }}
                          >
                            {tiktokConnected
                              ? `TikTok Business Center · ${ttPages.length} kênh`
                              : "Chưa kết nối TikTok for Business"}
                          </h4>
                          <p
                            style={{
                              fontSize: "11px",
                              color: "#6b7280",
                              margin: "2px 0 0",
                            }}
                          >
                            {tiktokConnected
                              ? "Đã ủy quyền. Danh sách bên dưới là kênh gắn Business Center."
                              : "Bấm kết nối để ủy quyền TikTok for Business và kéo kênh vào CRM."}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={refreshTikTokMutation.isPending}
                        onClick={() => {
                          if (tiktokConnected) {
                            reconnectTikTokOn404Ref.current = true;
                            refreshTikTokMutation.mutate();
                            return;
                          }
                          window.location.href = getCskhTikTokOAuthStartUrl(
                            buildOAuthChannelReturnUrl(),
                          );
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "6px",
                          fontSize: "12.5px",
                          fontWeight: 600,
                          background: "#111827",
                          color: "#fff",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Link2 size={14} />
                        {tiktokConnected
                          ? "Cập nhật kết nối TikTok"
                          : "Kết nối TikTok for Business"}
                      </button>
                    </div>
                    <ChannelPagesTable
                      pages={ttPages}
                      nameHeader="Tên kênh TikTok"
                      fallbackImg={TT_FALLBACK_IMG}
                      busy={refreshTikTokMutation.isPending}
                      busyText="Đang lấy tên, ID và ảnh kênh TikTok..."
                      emptyText="Chưa có kênh TikTok. Bấm Kết nối TikTok for Business để ủy quyền Business Center."
                      onToggle={(pageId, enabled) =>
                        toggleMutation.mutate({ pageId, enabled })
                      }
                      onDelete={(pageId) => deleteMutation.mutate(pageId)}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      padding: "14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <ThreadsLogo
                        size={18}
                        weight="fill"
                        style={{ color: "#111827" }}
                      />
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#111827",
                          margin: 0,
                        }}
                      >
                        Threads
                      </h4>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#6b7280",
                          background: "#f3f4f6",
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        0 kênh
                      </span>
                    </div>
                    <ChannelPagesTable
                      pages={[]}
                      nameHeader="Tên Threads"
                      fallbackImg={IG_FALLBACK_IMG}
                      busy={false}
                      busyText=""
                      emptyText="Chưa kết nối Threads. Nền tảng này cần OAuth riêng — chưa bật trên hệ thống."
                      onToggle={() => {}}
                      onDelete={() => {}}
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      padding: "14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <YoutubeLogo
                        size={18}
                        weight="fill"
                        style={{ color: "#ff0000" }}
                      />
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#111827",
                          margin: 0,
                        }}
                      >
                        YouTube
                      </h4>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#6b7280",
                          background: "#f3f4f6",
                          padding: "2px 8px",
                          borderRadius: 999,
                        }}
                      >
                        0 kênh
                      </span>
                    </div>
                    <ChannelPagesTable
                      pages={[]}
                      nameHeader="Tên kênh"
                      fallbackImg="https://www.youtube.com/s/desktop/favicon.ico"
                      busy={false}
                      busyText=""
                      emptyText="Chưa kết nối YouTube. Nền tảng này cần OAuth riêng — chưa bật trên hệ thống."
                      onToggle={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                </div>

                {/* ===== Kênh từ Pancake ===== */}
                <div
                  style={{
                    borderTop: "1px solid #f3f4f6",
                    paddingTop: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: "#4f46e5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      P
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#111827",
                          margin: 0,
                        }}
                      >
                        Kênh từ Pancake
                      </h4>
                      <p style={{ fontSize: 11, color: "#6b7280", margin: 0 }}>
                        Toàn bộ page/kênh gắn với User Access Token Pancake
                        (Facebook, IG, TikTok…).
                      </p>
                    </div>
                  </div>
                  <PancakeChannelsPanel />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab?.key === "accounts" && <UserAccessPanel />}
        {activeTab?.key === "roles" && <RolePermissionsPanel />}
      </div>
    </div>
  );
}
