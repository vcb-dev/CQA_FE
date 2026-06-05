import { useState, useEffect } from "react";
import {
  dashboardKPIs,
  qualityTrend,
  conversationSources,
  adCampaignEfficiency,
  topProducts,
  customerInsights,
  customerSentiment,
  funnelData,
  customersNeedCare,
  topPages,
  employeeRanking,
  recentActivities,
} from "../../data/mockData";
import {
  SealCheck,
  Smiley,
  ShoppingBag,
  CurrencyDollar,
  ChatCircleText,
  Megaphone,
  Coins,
  Ruler,
  Diamond,
  Wrench,
  Package,
  Gift,
  ArrowsCounterClockwise,
  Truck,
  ClockCounterClockwise,
  Hourglass,
  SmileySad,
  Crown,
  CheckCircle,
  Warning,
  FacebookLogo,
  Sparkle,
  Phone,
  SmileyMeh,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const kpiIcons = [
  SealCheck,
  Smiley,
  ShoppingBag,
  CurrencyDollar,
  ChatCircleText,
  Megaphone,
];

const insightIcons = [
  Coins, // giá cả
  Ruler, // size
  Diamond, // chất liệu
  Wrench, // bảo hành
  Ruler, // cách đo size
  Package, // có sẵn không
  Gift, // ưu đãi
  ArrowsCounterClockwise, // đổi trả
  Truck, // shipping
];

const careIconsComp = [
  ClockCounterClockwise, // Cần chăm sóc lại
  Wrench, // Cần bảo hành / đổi trả
  Hourglass, // Khách chưa chốt đơn
  SmileySad, // Khách có cảm xúc tiêu cực
  Crown, // Khách VIP
];

function getActivityIcon(icon) {
  switch (icon) {
    case "✅":
      return (
        <CheckCircle
          size={16}
          weight="duotone"
          style={{ color: "var(--success-500)" }}
        />
      );
    case "⚠️":
      return (
        <Warning
          size={16}
          weight="duotone"
          style={{ color: "var(--warning-500)" }}
        />
      );
    case "🔴":
      return <Coins size={16} weight="duotone" style={{ color: "#ef4444" }} />;
    case "💬":
      return (
        <ChatCircleText
          size={16}
          weight="duotone"
          style={{ color: "var(--primary-500)" }}
        />
      );
    case "📞":
      return <Wrench size={16} weight="duotone" style={{ color: "#3b82f6" }} />;
    default:
      return (
        <Sparkle
          size={16}
          weight="duotone"
          style={{ color: "var(--primary-600)" }}
        />
      );
  }
}

// ── Mini sparkline for KPI cards ──
const sparkPoints = [
  [4, 13, 11, 9, 14, 8, 12, 7, 10, 5, 8, 4, 6, 3],
  [13, 10, 12, 8, 11, 7, 9, 6, 8, 5, 7, 4, 6, 3],
  [12, 14, 10, 13, 9, 11, 7, 10, 6, 8, 5, 7, 4, 5],
  [14, 11, 13, 9, 12, 8, 10, 6, 9, 4, 7, 3, 5, 2],
  [13, 10, 11, 8, 10, 6, 9, 5, 8, 4, 7, 3, 5, 2],
  [14, 12, 13, 10, 12, 8, 10, 6, 9, 5, 8, 3, 6, 2],
];

function Sparkline({ idx, color }) {
  const raw = sparkPoints[idx] || sparkPoints[0];
  const pts = raw.map((y, i) => `${i * 4.8},${y}`).join(" ");
  const areaBot = raw.map((y, i) => `${i * 4.8},${y}`).join(" ");
  const id = `sp${idx}`;
  return (
    <svg
      width="64"
      height="28"
      viewBox="0 0 64 16"
      style={{ overflow: "visible", opacity: 0.85 }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,16 ${areaBot} 62,16`} fill={`url(#${id})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Quality trend SVG line chart ──
function QualityLineChart({ data }) {
  const W = 500;
  const H = 130;
  const pL = 26;
  const pR = 8;
  const pT = 10;
  const pB = 20;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const n = data.length;
  const gx = (i) => pL + (i / (n - 1)) * cW;
  const gy = (v, max) => pT + cH - (v / max) * cH;
  const series = [
    { key: "qa", color: "#6366f1", max: 100, label: "QA Score (TB)" },
    { key: "csat", color: "#22c55e", max: 100, label: "CSAT" },
    { key: "chotDon", color: "#f59e0b", max: 35, label: "Tỷ lệ chốt đơn" },
  ];
  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ overflow: "visible" }}
    >
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line
            x1={pL}
            y1={gy(v, 100)}
            x2={W - pR}
            y2={gy(v, 100)}
            stroke="#f1f5f9"
            strokeWidth="1"
          />
          <text
            x={pL - 4}
            y={gy(v, 100) + 3}
            textAnchor="end"
            fontSize="7"
            fill="#9ca3af"
          >
            {v}
          </text>
        </g>
      ))}
      {data.map((d, i) => (
        <text
          key={i}
          x={gx(i)}
          y={H - 3}
          textAnchor="middle"
          fontSize="7.5"
          fill="#9ca3af"
        >
          {d.date}
        </text>
      ))}
      {series.map((s) => {
        const pts = data
          .map((d, i) => `${gx(i)},${gy(d[s.key], s.max)}`)
          .join(" ");
        return (
          <g key={s.key}>
            <polyline
              points={pts}
              fill="none"
              stroke={s.color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            {data.map((d, i) => (
              <circle
                key={i}
                cx={gx(i)}
                cy={gy(d[s.key], s.max)}
                r="3"
                fill={s.color}
                stroke="#fff"
                strokeWidth="1.5"
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

// ── Donut chart ──
function DonutChart({ data, total, size = 116 }) {
  const r = size / 2 - 13;
  const c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0 }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--n-100)"
          strokeWidth="13"
        />
        {data.map((d, i) => {
          const dash = (d.pct / 100) * c;
          const o = off;
          off += dash;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color}
              strokeWidth="13"
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-o}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "16px",
            fontWeight: 800,
            color: "var(--n-900)",
            lineHeight: 1,
          }}
        >
          {total.toLocaleString()}
        </div>
        <div style={{ fontSize: "9px", color: "var(--n-500)", marginTop: 2 }}>
          hội thoại
        </div>
      </div>
    </div>
  );
}

const kpiSparkColors = [
  "#22c55e",
  "#6366f1",
  "#f59e0b",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
];
const careIcons = ["🔄", "🔧", "⏳", "😡", "👑"];

export default function DashboardPage() {
  const [anim, setAnim] = useState(false);
  useEffect(() => {
    setTimeout(() => setAnim(true), 120);
  }, []);
  const getQAColor = (s) =>
    s >= 80
      ? "var(--success-600)"
      : s >= 70
        ? "var(--warning-600)"
        : "var(--orange-500)";

  return (
    <div className="dash-grid">
      {/* ── KPI Row ── */}
      <div
        className="kpi-grid"
        style={{ gridTemplateColumns: "repeat(6, 1fr)" }}
      >
        {dashboardKPIs.map((kpi, i) => (
          <div
            key={i}
            className="kpi-card"
            style={{
              flexDirection: "column",
              gap: 0,
              padding: "14px 16px",
              borderRadius: "16px",
              position: "relative",
            }}
          >
            {/* Top: icon + label */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "9px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  background: kpi.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {(() => {
                  const IconComp = kpiIcons[i];
                  return (
                    <IconComp
                      size={18}
                      weight="duotone"
                      style={{ color: kpiSparkColors[i] }}
                    />
                  );
                })()}
              </div>
              <span
                style={{
                  fontSize: "12px",
                  color: "var(--n-500)",
                  lineHeight: 1.35,
                  paddingTop: "1px",
                }}
              >
                {kpi.label}
              </span>
            </div>
            {/* Value row */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "21px",
                    fontWeight: 800,
                    color: "var(--n-900)",
                    lineHeight: 1,
                    marginBottom: "5px",
                  }}
                >
                  {kpi.value}
                  {kpi.unit && (
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 400,
                        color: "var(--n-500)",
                        marginLeft: "2px",
                      }}
                    >
                      {kpi.unit}
                    </span>
                  )}
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "5px" }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "1px 7px",
                      borderRadius: 999,
                      background:
                        kpi.changeType === "up" ? "#f0fdf4" : "#fef2f2",
                      color: kpi.changeType === "up" ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {kpi.change}
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--n-400)" }}>
                    {kpi.sub}
                  </span>
                </div>
              </div>
              <Sparkline idx={i} color={kpiSparkColors[i]} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 2: Line Chart + Donut + Ad Efficiency ── */}
      <div className="dash-row">
        {/* Quality Trend Line Chart */}
        <div
          className="card"
          style={{ flex: 2, borderRadius: "16px", padding: "18px 20px" }}
        >
          <div className="card-title" style={{ marginBottom: "14px" }}>
            <span>Xu hướng chất lượng theo ngày</span>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                {[
                  ["#6366f1", "QA Score (TB)"],
                  ["#22c55e", "CSAT"],
                  ["#f59e0b", "Tỷ lệ chốt đơn"],
                ].map(([col, lbl]) => (
                  <span
                    key={lbl}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "11px",
                      color: "var(--n-500)",
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: col,
                        display: "inline-block",
                      }}
                    />
                    {lbl}
                  </span>
                ))}
              </div>
              <select
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  border: "1px solid var(--n-200)",
                  borderRadius: "7px",
                  color: "var(--n-600)",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                <option>Theo ngày</option>
              </select>
            </div>
          </div>
          <QualityLineChart data={qualityTrend} />
        </div>

        {/* Donut */}
        <div
          className="card"
          style={{ flex: 1, borderRadius: "16px", padding: "18px 20px" }}
        >
          <div className="card-title" style={{ marginBottom: "14px" }}>
            Nguồn hội thoại & tỷ lệ chốt
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <DonutChart
              data={conversationSources.sources}
              total={conversationSources.total}
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                flex: 1,
              }}
            >
              {conversationSources.sources.map((s, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      marginBottom: "2px",
                    }}
                  >
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: s.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "var(--n-800)",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 800,
                      color: "var(--n-900)",
                      marginLeft: "15px",
                      lineHeight: 1.2,
                    }}
                  >
                    {s.value.toLocaleString()}
                    <span
                      style={{
                        fontWeight: 400,
                        fontSize: "11px",
                        color: "var(--n-400)",
                        marginLeft: "4px",
                      }}
                    >
                      ({s.pct}%)
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--n-400)",
                      marginLeft: "15px",
                    }}
                  >
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ad Campaign Efficiency */}
        <div
          className="card"
          style={{ flex: 1.2, borderRadius: "16px", padding: "18px 20px" }}
        >
          <div className="card-title" style={{ marginBottom: "14px" }}>
            Hiệu quả check tin nhắn từ quảng cáo
            <span className="card-link">Xem tất cả</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nguồn quảng cáo</th>
                <th>Đã check</th>
                <th>Tỷ lệ check</th>
                <th>Tỷ lệ chốt</th>
              </tr>
            </thead>
            <tbody>
              {adCampaignEfficiency.map((c, i) => (
                <tr key={i}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FacebookLogo
                        size={14}
                        weight="fill"
                        style={{ color: "#1877f2", flexShrink: 0 }}
                      />
                      <span style={{ fontWeight: 500, fontSize: "12px" }}>
                        {c.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {c.checked.toLocaleString()}
                  </td>
                  <td>{c.checkRate}</td>
                  <td style={{ fontWeight: 700, color: "var(--primary-600)" }}>
                    {c.closeRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Row 3: Top Products + Insights + Sentiment ── */}
      <div className="dash-row">
        {/* Top Products */}
        <div
          className="card"
          style={{ flex: 1, borderRadius: "16px", padding: "18px 20px" }}
        >
          <div className="card-title" style={{ marginBottom: "14px" }}>
            Top sản phẩm được quan tâm
            <span className="card-link">Xem tất cả</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Lượt hỏi</th>
                <th>Tỷ lệ chốt</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={i}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        className={`rank-badge rank-${i < 3 ? i + 1 : "n"}`}
                        style={{
                          width: 20,
                          height: 20,
                          fontSize: "10px",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span style={{ fontSize: "12.5px", fontWeight: 500 }}>
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>
                    {p.visits.toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--primary-600)" }}>
                    {p.closeRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Customer Insights */}
        <div
          className="card"
          style={{ flex: 1, borderRadius: "16px", padding: "18px 20px" }}
        >
          <div className="card-title" style={{ marginBottom: "14px" }}>
            Insight khách hàng quan tâm
            <span className="card-link">Xem tất cả</span>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "8px",
            }}
          >
            {customerInsights.map((ins, i) => {
              const IconComp = insightIcons[i] || Coins;
              const insightColors = [
                "#f59e0b",
                "#6366f1",
                "#ec4899",
                "#3b82f6",
                "#06b6d4",
                "#10b981",
                "#ef4444",
                "#8b5cf6",
                "#f97316",
              ];
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 10px",
                    background: "var(--n-50)",
                    borderRadius: "10px",
                    border: "1px solid var(--n-100)",
                  }}
                >
                  <IconComp
                    size={16}
                    weight="duotone"
                    style={{
                      color: insightColors[i] || "var(--primary-600)",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: "10.5px",
                        color: "var(--n-500)",
                        marginBottom: "1px",
                      }}
                    >
                      {ins.label}
                    </div>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "var(--n-900)",
                      }}
                    >
                      {ins.value.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Sentiment */}
        <div
          className="card"
          style={{ flex: 0.72, borderRadius: "16px", padding: "18px 20px" }}
        >
          <div className="card-title" style={{ marginBottom: "14px" }}>
            Cảm xúc khách hàng (AI)
            <span className="card-link">Xem tất cả</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              paddingTop: "8px",
              paddingBottom: "4px",
            }}
          >
            {[
              {
                label: "Tích cực",
                data: customerSentiment.positive,
                goodUp: true,
                icon: Smiley,
                color: "var(--success-500)",
              },
              {
                label: "Trung tính",
                data: customerSentiment.neutral,
                goodUp: false,
                icon: SmileyMeh,
                color: "var(--warning-500)",
              },
              {
                label: "Tiêu cực",
                data: customerSentiment.negative,
                goodUp: false,
                icon: SmileySad,
                color: "var(--danger-500)",
              },
            ].map((s, i) => {
              const isUp = s.data.change.includes("↑");
              const isGood = s.goodUp ? isUp : !isUp;
              const IconComp = s.icon;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <IconComp
                    size={34}
                    weight="duotone"
                    style={{ color: s.color }}
                  />
                  <div
                    style={{
                      fontSize: "25px",
                      fontWeight: 800,
                      color: "var(--n-900)",
                      lineHeight: 1,
                    }}
                  >
                    {s.data.value}%
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--n-500)" }}>
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: isGood
                        ? "var(--success-600)"
                        : "var(--danger-600)",
                    }}
                  >
                    {s.data.change}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Row 4: Funnel + Care + Pages + Ranking ── */}
      <div className="dash-row">
        {/* Funnel */}
        <div
          className="card"
          style={{ flex: 1, borderRadius: "16px", padding: "18px 20px" }}
        >
          <div className="card-title" style={{ marginBottom: "14px" }}>
            Phễu chăm sóc & chốt đơn
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {funnelData.map((f, i) => {
              const w = 100 - i * 14;
              const colors = [
                "#4f46e5",
                "#6366f1",
                "#818cf8",
                "#a78bfa",
                "#22c55e",
              ];
              return (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--n-500)",
                      minWidth: "90px",
                      textAlign: "right",
                      lineHeight: 1.3,
                    }}
                  >
                    {f.label}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        height: "26px",
                        width: anim ? `${w}%` : "0%",
                        background: colors[i],
                        borderRadius: "5px",
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: "10px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#fff",
                        transition: `width 0.7s ease ${i * 0.08}s`,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.value.toLocaleString()}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "var(--n-400)",
                      minWidth: "36px",
                    }}
                  >
                    {f.pct || ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customers Need Care */}
        <div
          className="card"
          style={{ flex: 0.8, borderRadius: "16px", padding: "18px 20px" }}
        >
          <div className="card-title" style={{ marginBottom: "12px" }}>
            Khách hàng cần chăm sóc
            <span className="card-link">Xem tất cả</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {customersNeedCare.map((c, i) => {
              const IconComp = careIconsComp[i] || Crown;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "7px 10px",
                    background: "var(--n-50)",
                    borderRadius: "10px",
                  }}
                >
                  <IconComp
                    size={16}
                    weight="duotone"
                    style={{ color: c.color, flexShrink: 0 }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: "12px",
                      color: "var(--n-700)",
                      lineHeight: 1.3,
                    }}
                  >
                    {c.label}
                  </span>
                  <span
                    style={{
                      fontSize: "17px",
                      fontWeight: 800,
                      color: c.color,
                    }}
                  >
                    {c.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Pages */}
        <div
          className="card"
          style={{ flex: 1, borderRadius: "16px", padding: "18px 20px" }}
        >
          <div className="card-title" style={{ marginBottom: "14px" }}>
            Top page / kênh hiệu quả
            <span className="card-link">Xem tất cả</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Page / Kênh</th>
                <th>QA Score</th>
                <th>Tỷ lệ chốt</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((p, i) => (
                <tr key={i}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <FacebookLogo
                        size={14}
                        weight="fill"
                        style={{ color: "#1877f2", flexShrink: 0 }}
                      />
                      <span style={{ fontSize: "12px", fontWeight: 500 }}>
                        {p.name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background:
                          p.score >= 80
                            ? "var(--success-100)"
                            : "var(--warning-100)",
                        color:
                          p.score >= 80
                            ? "var(--success-600)"
                            : "var(--warning-600)",
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      {p.score}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700, color: "var(--primary-600)" }}>
                    {p.closeRate}
                  </td>
                  <td
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--n-700)",
                    }}
                  >
                    {p.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Employee Ranking */}
        <div
          className="card"
          style={{ flex: 1, borderRadius: "16px", padding: "18px 20px" }}
        >
          <div className="card-title" style={{ marginBottom: "14px" }}>
            Xếp hạng nhân viên (theo QA Score)
            <span className="card-link">Xem tất cả</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nhân viên</th>
                <th>QA</th>
                <th>Tỷ lệ chốt</th>
                <th>Hội thoại</th>
              </tr>
            </thead>
            <tbody>
              {employeeRanking.map((e, i) => (
                <tr key={i}>
                  <td>
                    <span className={`rank-badge rank-${i < 3 ? i + 1 : "n"}`}>
                      {e.rank}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                      }}
                    >
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          background: `hsl(${i * 67 + 200}, 58%, 55%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {e.avatar}
                      </div>
                      <span style={{ fontSize: "12.5px", fontWeight: 500 }}>
                        {e.name}
                        {i === 0 ? " 🏆" : ""}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 800, color: getQAColor(e.score) }}>
                    {e.score}
                  </td>
                  <td style={{ fontWeight: 500, color: "var(--n-700)" }}>
                    {e.closeRate}
                  </td>
                  <td style={{ color: "var(--n-400)" }}>{e.conversations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Row 5: Recent Activities ── */}
      <div
        className="card"
        style={{ borderRadius: "16px", padding: "16px 20px" }}
      >
        <div className="card-title" style={{ marginBottom: "12px" }}>
          Hoạt động gần đây
          <span className="card-link">Xem tất cả</span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            paddingBottom: "2px",
          }}
        >
          {recentActivities.map((a, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                padding: "8px 12px",
                background: "var(--n-50)",
                borderRadius: "10px",
                border: "1px solid var(--n-100)",
                flexShrink: 0,
                minWidth: 0,
              }}
            >
              {getActivityIcon(a.icon)}
              <div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--n-700)",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    marginBottom: "2px",
                  }}
                >
                  {a.text}
                </div>
                <div style={{ fontSize: "11px", color: "var(--n-400)" }}>
                  {a.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
