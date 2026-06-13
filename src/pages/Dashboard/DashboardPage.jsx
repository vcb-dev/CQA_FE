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
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--n-600)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(0,0,0,0.05)',
            borderTopColor: 'var(--primary-500)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ fontSize: '14px', color: 'var(--n-500)' }}>Đang tải số liệu hệ thống...</p>
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
      <div className="card" style={{ padding: '32px', textAlign: 'center', margin: '20px auto', maxWidth: '500px' }}>
        <Warning size={48} color="var(--danger-500)" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--n-900)', marginBottom: '8px' }}>Không thể tải dữ liệu</h3>
        <p style={{ color: 'var(--n-500)', fontSize: '14px', marginBottom: '20px' }}>
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
    <div className="dash-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── KPI Grid ── */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className="kpi-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 20px',
                borderRadius: '16px',
                background: 'var(--card-bg, #fff)',
                border: '1px solid var(--border, rgba(0,0,0,0.06))',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: kpi.bg,
                  color: kpi.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={20} weight="duotone" />
                </div>
                <span style={{ fontSize: '12.5px', color: 'var(--n-500)', fontWeight: 500 }}>{kpi.label}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--n-900)', lineHeight: 1.1 }}>{kpi.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--n-400)', marginTop: '4px' }}>{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Empty State / Main Content Row ── */}
      {!hasRealData ? (
        <div
          className="card anim-up"
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
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary-600)',
            marginBottom: '8px'
          }}>
            <Sparkle size={32} weight="duotone" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--n-900)', letterSpacing: '-0.02em' }}>
            Chào mừng bạn đến với CQA CRM
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--n-600)', maxWidth: '500px', lineHeight: 1.5 }}>
            Hệ thống hiện tại chưa thu thập cuộc hội thoại nào hoặc chưa chạy đánh giá chất lượng (Audit). Vui lòng thực hiện các bước sau để xem phân tích dữ liệu thực tế.
          </p>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            justifyContent: 'center',
            marginTop: '8px'
          }}>
            <button
              onClick={() => navigate('/settings?tab=channel')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                background: 'var(--primary-600)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-700)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary-600)'}
            >
              <GearSix size={16} weight="bold" />
              Cấu hình & Kết nối Kênh
              <ArrowRight size={14} weight="bold" />
            </button>
            <button
              onClick={() => navigate('/quality')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 20px',
                background: 'transparent',
                color: 'var(--n-700)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--n-50)';
                e.currentTarget.style.borderColor = 'var(--n-300)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              Chạy Đánh giá (Audit) AI
            </button>
          </div>
        </div>
      ) : null}

      {/* ── Row: Recent Audits & Recent Jobs ── */}
      <div className="dash-row" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Recent Audits Card */}
        <div className="card" style={{ flex: '2 1 450px', borderRadius: '16px', padding: '20px' }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span>Lượt đánh giá chất lượng gần đây</span>
            <span
              onClick={() => navigate('/quality')}
              style={{ fontSize: '11.5px', color: 'var(--primary-600)', cursor: 'pointer', fontWeight: 600 }}
            >
              Xem tất cả
            </span>
          </div>

          {!stats?.recentAudits?.length ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--n-400)', fontSize: '13px' }}>
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
                      <td style={{ fontSize: '12px', color: 'var(--n-400)' }}>
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
        <div className="card" style={{ flex: '1 1 300px', borderRadius: '16px', padding: '20px' }}>
          <div className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GearSix size={18} weight="bold" />
            <span>Tiến trình đồng bộ / AI Audit</span>
          </div>

          {!stats?.latestJobs?.length ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--n-400)', fontSize: '13px' }}>
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
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--n-800)', textTransform: 'capitalize' }}>
                      {j.type === 'monitor' ? 'Đồng bộ tin nhắn' : 'Chấm điểm AI'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--n-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
