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

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const response = await apiClient.get("/cskh/dashboard/stats");
      return response.data;
    },
    refetchInterval: 15000, // Auto refresh every 15 seconds to catch live progress updates
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-black/5 border-t-indigo-500" />
          <p className="text-sm text-slate-500">Đang tải số liệu hệ thống...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto my-5 max-w-[500px] rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-200">
        <Warning size={48} className="mb-4 text-red-500 mx-auto" />
        <h3 className="mb-2 text-lg font-bold text-slate-900">Không thể tải dữ liệu</h3>
        <p className="mb-5 text-sm text-slate-500">
          Vui lòng kiểm tra lại kết nối đến máy chủ Backend và thử lại.
        </p>
      </div>
    );
  }

  // 6 KPIs
  const kpis = [
    {
      label: "Tổng số kênh Facebook",
      value: stats?.totalPages ?? 0,
      sub: "Kênh đã liên kết",
      bg: "rgba(59, 130, 246, 0.08)",
      color: "#3b82f6",
      icon: Globe,
    },
    {
      label: "Kênh đang hoạt động",
      value: stats?.enabledPages ?? 0,
      sub: "Đang bật đồng bộ",
      bg: "rgba(34, 197, 94, 0.08)",
      color: "#22c55e",
      icon: CheckCircle,
    },
    {
      label: "Điểm QA trung bình",
      value: stats?.avgScore ? `${stats.avgScore}%` : "N/A",
      sub: "Điểm chất lượng CSKH",
      bg: "rgba(168, 85, 247, 0.08)",
      color: "#a855f7",
      icon: SealCheck,
    },
    {
      label: "Lượt đánh giá chất lượng",
      value: stats?.totalAudits ?? 0,
      sub: "Hội thoại đã chấm điểm",
      bg: "rgba(245, 158, 11, 0.08)",
      color: "#f59e0b",
      icon: Sparkle,
    },
    {
      label: "Hội thoại thu thập",
      value: stats?.totalConversations ?? 0,
      sub: "Conversations trong DB",
      bg: "rgba(6, 182, 212, 0.08)",
      color: "#06b6d4",
      icon: ChatCircleText,
    },
    {
      label: "Tin nhắn đồng bộ",
      value: stats?.totalMessages ?? 0,
      sub: "Messages trong DB",
      bg: "rgba(236, 72, 153, 0.08)",
      color: "#ec4899",
      icon: EnvelopeSimple,
    },
  ];

  const hasRealData = (stats?.totalConversations ?? 0) > 0 || (stats?.totalAudits ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6">
      
      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="flex flex-col p-4 rounded-2xl bg-white border border-slate-100 shadow-sm"
             
            >
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: kpi.bg, color: kpi.color }}>
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

      {/* ── Empty State / Main Content Row ── */}
      {!hasRealData ? (
        <div
          className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            borderRadius: '20px',
            padding: '40px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            maxWidth: '720px',
            margin: '0 auto',
            boxShadow: '0 10px 30px rgba(99, 102, 241, 0.05)'
          }}
        >
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600">
            <Sparkle size={32} weight="duotone" />
          </div>
          <h2 className="text-[22px] font-extrabold tracking-tight text-slate-900">
            Chào mừng bạn đến với CQA CRM
          </h2>
          <p className="max-w-[500px] text-[14.5px] leading-relaxed text-slate-600">
            Hệ thống hiện tại chưa thu thập cuộc hội thoại nào hoặc chưa chạy đánh giá chất lượng (Audit). Vui lòng thực hiện các bước sau để xem phân tích dữ liệu thực tế.
          </p>

          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate('/settings?tab=channel')} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-[13.5px] font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-700">
              <GearSix size={16} weight="bold" />
              Cấu hình & Kết nối Kênh
              <ArrowRight size={14} weight="bold" />
            </button>
            <button onClick={() => navigate('/quality')} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-transparent px-5 py-3 text-[13.5px] font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50">
              Chạy Đánh giá (Audit) AI
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Row: Recent Audits & Recent Jobs ── */}
      <div className="dash-row" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Recent Audits Card */}
        <div className="flex flex-col flex-[2_1_450px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span>Lượt đánh giá chất lượng gần đây</span>
            <span
              onClick={() => navigate('/quality')}
              style={{ fontSize: '11.5px', color: '#4f46e5', cursor: 'pointer', fontWeight: 600 }}
            >
              Xem tất cả
            </span>
          </div>

          {!stats?.recentAudits?.length ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#9ca3af', fontSize: '13px' }}>
              Chưa có dữ liệu đánh giá (Audit)
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Kênh</th>
                    <th>Nhân viên</th>
                    <th style={{ textAlign: 'center' }}>Điểm số</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAudits.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.customerName || "Khách hàng"}</td>
                      <td style={{ fontSize: '12px' }}>{a.channel || "Facebook"}</td>
                      <td>{a.agentName || "AI System"}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          background: a.score >= 80 ? 'rgba(34, 197, 94, 0.08)' : a.score >= 70 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                          color: a.score >= 80 ? '#16a34a' : a.score >= 70 ? '#d97706' : '#dc2626',
                        }}>
                          {a.score}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {new Date(a.createdAt).toLocaleString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Jobs Card */}
        <div className="flex flex-col flex-[1_1_300px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GearSix size={18} weight="bold" />
            <span>Tiến trình đồng bộ / AI Audit</span>
          </div>

          {!stats?.latestJobs?.length ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#9ca3af', fontSize: '13px' }}>
              Chưa chạy tiến trình nào
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.latestJobs.map((j) => (
                <div
                  key={j.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'var(--n-50, #f8fafc)',
                    border: '1px solid var(--border, rgba(0,0,0,0.04))',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', textTransform: 'capitalize' }}>
                      {j.type === 'monitor' ? 'Đồng bộ tin nhắn' : 'Chấm điểm AI'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {new Date(j.startedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    textTransform: 'uppercase',
                    background: j.status === 'completed' ? 'rgba(34, 197, 94, 0.08)' : j.status === 'running' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    color: j.status === 'completed' ? '#16a34a' : j.status === 'running' ? '#2563eb' : '#dc2626',
                  }}>
                    {j.status === 'completed' ? 'Xong' : j.status === 'running' ? 'Chạy' : 'Lỗi'}
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
