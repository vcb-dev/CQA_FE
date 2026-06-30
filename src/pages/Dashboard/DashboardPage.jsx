import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/axios";
import {
  Globe,
  CheckCircle,
  SealCheck,
  ChatCircleText,
  EnvelopeSimple,
  ArrowRight,
  Sparkle,
  GearSix,
  Clock,
  Warning,
} from "@phosphor-icons/react";

function formatCount(n) {
  if (n == null || Number.isNaN(Number(n))) return "0";
  return Number(n).toLocaleString("vi-VN");
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white border border-slate-100" />
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="h-64 rounded-2xl bg-white border border-slate-100" />
        <div className="h-64 rounded-2xl bg-white border border-slate-100" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: stats, isLoading, isError, isFetching } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await apiClient.get("/cskh/dashboard/stats");
      return response.data;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchInterval: (query) => {
      const jobs = query.state.data?.latestJobs;
      const hasRunning = Array.isArray(jobs) && jobs.some((j) => j.status === "running");
      return hasRunning ? 20_000 : 90_000;
    },
  });

  if (isLoading && !stats) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="mx-auto my-5 max-w-[500px] rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Warning size={48} className="mx-auto mb-4 text-red-500" />
        <h3 className="mb-2 text-lg font-bold text-slate-900">Không thể tải dữ liệu</h3>
        <p className="text-sm text-slate-500">
          Vui lòng kiểm tra kết nối Backend và thử lại.
        </p>
      </div>
    );
  }

  const kpis = [
    {
      label: "Tổng số kênh Facebook",
      value: formatCount(stats?.totalPages),
      sub: "Kênh đã liên kết",
      bg: "rgba(59, 130, 246, 0.08)",
      color: "#3b82f6",
      icon: Globe,
    },
    {
      label: "Kênh đang hoạt động",
      value: formatCount(stats?.enabledPages),
      sub: "Đang bật đồng bộ",
      bg: "rgba(34, 197, 94, 0.08)",
      color: "#22c55e",
      icon: CheckCircle,
    },
    {
      label: "Điểm QA trung bình",
      value: stats?.avgScore ? `${stats.avgScore}%` : "N/A",
      sub: "Chất lượng CSKH",
      bg: "rgba(168, 85, 247, 0.08)",
      color: "#a855f7",
      icon: SealCheck,
    },
    {
      label: "Lượt đánh giá",
      value: formatCount(stats?.totalAudits),
      sub: "Hội thoại đã chấm",
      bg: "rgba(245, 158, 11, 0.08)",
      color: "#f59e0b",
      icon: Sparkle,
    },
    {
      label: "Hội thoại",
      value: formatCount(stats?.totalConversations),
      sub: "Trong hệ thống",
      bg: "rgba(6, 182, 212, 0.08)",
      color: "#06b6d4",
      icon: ChatCircleText,
    },
    {
      label: "Tin nhắn",
      value: formatCount(stats?.totalMessages),
      sub: "Đã đồng bộ",
      bg: "rgba(236, 72, 153, 0.08)",
      color: "#ec4899",
      icon: EnvelopeSimple,
    },
  ];

  const hasRealData =
    (stats?.totalConversations ?? 0) > 0 || (stats?.totalAudits ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      {isFetching && stats ? (
        <div className="text-[11px] font-medium text-slate-400">Đang cập nhật số liệu...</div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ backgroundColor: kpi.bg, color: kpi.color }}
                >
                  <Icon size={20} weight="duotone" />
                </div>
                <span className="text-[12.5px] font-medium text-slate-500">{kpi.label}</span>
              </div>
              <div className="text-2xl font-extrabold leading-tight text-slate-900">{kpi.value}</div>
              <div className="mt-1 text-[11px] text-slate-400">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {!hasRealData ? (
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 px-6 py-10 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600">
            <Sparkle size={28} weight="duotone" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Chào mừng đến CQA CRM</h2>
          <p className="max-w-md text-sm leading-relaxed text-slate-600">
            Kết nối kênh Facebook và chạy Audit AI để bắt đầu phân tích hội thoại thật.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/settings?tab=channel")}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
            >
              <GearSix size={16} weight="bold" />
              Kết nối kênh
              <ArrowRight size={14} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/quality")}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Chạy Audit AI
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-semibold text-slate-800">Đánh giá gần đây</span>
            <button
              type="button"
              onClick={() => navigate("/quality")}
              className="text-[11.5px] font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Xem tất cả
            </button>
          </div>
          {!stats?.recentAudits?.length ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu Audit</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                    <th className="pb-2 font-medium">Khách</th>
                    <th className="pb-2 font-medium">Kênh</th>
                    <th className="pb-2 font-medium">NV</th>
                    <th className="pb-2 text-center font-medium">Điểm</th>
                    <th className="pb-2 font-medium">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAudits.map((a) => (
                    <tr key={a.id} className="border-b border-slate-50 last:border-0">
                      <td className="py-2.5 font-medium text-slate-800">{a.customerName || "Khách"}</td>
                      <td className="py-2.5 text-slate-600">{a.channel || "Facebook"}</td>
                      <td className="py-2.5 text-slate-600">{a.agentName || "AI"}</td>
                      <td className="py-2.5 text-center">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                            a.score >= 80
                              ? "bg-emerald-50 text-emerald-700"
                              : a.score >= 70
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {a.score}
                        </span>
                      </td>
                      <td className="py-2.5 text-xs text-slate-400">
                        {new Date(a.createdAt).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
            <GearSix size={18} weight="bold" />
            Tiến trình gần đây
          </div>
          {!stats?.latestJobs?.length ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có tiến trình</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.latestJobs.map((j) => (
                <div
                  key={j.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {j.type === "monitor" ? "Đồng bộ tin nhắn" : "Chấm điểm AI"}
                    </p>
                    <p className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={12} />
                      {new Date(j.startedAt).toLocaleTimeString("vi-VN")}
                    </p>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                      j.status === "completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : j.status === "running"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {j.status === "completed" ? "Xong" : j.status === "running" ? "Chạy" : "Lỗi"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
