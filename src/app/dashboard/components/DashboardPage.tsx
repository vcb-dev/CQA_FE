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
} from "@/data/mockData";
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
import { Card, CardContent } from "@/components/ui/card";
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

function getActivityIcon(icon = "✅") {
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

function Sparkline({ idx = 0, color = "var(--primary-600)" }) {
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
function QualityLineChart({ data }: { data: any[] }) {
  const W = 500;
  const H = 130;
  const pL = 26;
  const pR = 8;
  const pT = 10;
  const pB = 20;
  const cW = W - pL - pR;
  const cH = H - pT - pB;
  const n = data.length;
  const gx = (i: number) => pL + (i / (n - 1)) * cW;
  const gy = (v: number, max: number) => pT + cH - (v / max) * cH;
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
function DonutChart({
  data,
  total,
  size = 116,
}: {
  data: { pct: number; color: string }[];
  total: number;
  size?: number;
}) {
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
  const getQAColor = (s: number) =>
    s >= 80
      ? "var(--success-600)"
      : s >= 70
        ? "var(--warning-600)"
        : "var(--orange-500)";

  return (
    <div className="p-6 space-y-6">
      {/* ── KPI Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {dashboardKPIs.map((kpi, i) => (
          <Card key={i} className="flex flex-col gap-0 p-4 rounded-2xl relative">
            {/* Top: icon + label */}
            <div className="flex items-start gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: kpi.bg }}
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
              <span className="text-xs text-muted-foreground pt-0.5 leading-tight">
                {kpi.label}
              </span>
            </div>
            {/* Value row */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xl font-extrabold text-foreground leading-none mb-1">
                  {kpi.value}
                  {kpi.unit && (
                    <span className="text-xs font-normal text-muted-foreground ml-0.5">
                      {kpi.unit}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      kpi.changeType === "up"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {kpi.change}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {kpi.sub}
                  </span>
                </div>
              </div>
              <Sparkline idx={i} color={kpiSparkColors[i]} />
            </div>
          </Card>
        ))}
      </div>

      {/* ── Row 2: Line Chart + Donut + Ad Efficiency ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quality Trend Line Chart */}
        <Card className="lg:col-span-2 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-sm">Xu hướng chất lượng theo ngày</span>
            <div className="flex items-center gap-4">
              <div className="flex gap-3">
                {[
                  ["#6366f1", "QA Score (TB)"],
                  ["#22c55e", "CSAT"],
                  ["#f59e0b", "Tỷ lệ chốt đơn"],
                ].map(([col, lbl]) => (
                  <span key={lbl} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ background: col }}
                    />
                    {lbl}
                  </span>
                ))}
              </div>
              <select className="text-[11px] px-2 py-1 border rounded-lg text-muted-foreground bg-white cursor-pointer">
                <option>Theo ngày</option>
              </select>
            </div>
          </div>
          <QualityLineChart data={qualityTrend} />
        </Card>

        {/* Donut */}
        <Card className="p-5 rounded-2xl">
          <div className="font-semibold text-sm mb-4">
            Nguồn hội thoại & tỷ lệ chốt
          </div>
          <div className="flex items-center gap-4">
            <DonutChart
              data={conversationSources.sources}
              total={conversationSources.total}
            />
            <div className="flex flex-col gap-3 flex-1">
              {conversationSources.sources.map((s, i) => (
                <div key={i}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: s.color }}
                    />
                    <span className="text-xs font-semibold text-foreground">
                      {s.label}
                    </span>
                  </div>
                  <div className="text-sm font-extrabold text-foreground ml-3 leading-tight">
                    {s.value.toLocaleString()}
                    <span className="font-normal text-[10px] text-muted-foreground ml-1">
                      ({s.pct}%)
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground ml-3">
                    {s.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Ad Campaign Efficiency */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-sm">Hiệu quả quảng cáo</div>
            <span className="text-xs text-primary font-medium cursor-pointer">Xem tất cả</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground text-left">
                <th className="font-normal pb-2">Nguồn</th>
                <th className="font-normal pb-2">Check</th>
                <th className="font-normal pb-2">Tỷ lệ</th>
                <th className="font-normal pb-2">Chốt</th>
              </tr>
            </thead>
            <tbody>
              {adCampaignEfficiency.map((c, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <FacebookLogo
                        size={14}
                        weight="fill"
                        className="text-blue-600 flex-shrink-0"
                      />
                      <span className="font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 font-semibold">
                    {c.checked.toLocaleString()}
                  </td>
                  <td className="py-2.5">{c.checkRate}</td>
                  <td className="py-2.5 font-bold text-primary">
                    {c.closeRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* ── Row 3: Top Products + Insights + Sentiment ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-sm">Top sản phẩm quan tâm</div>
            <span className="text-xs text-primary font-medium cursor-pointer">Xem tất cả</span>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-5 h-5 flex items-center justify-center rounded text-[10px] font-bold ${i < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {i + 1}
                      </span>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 font-semibold text-right">
                    {p.visits.toLocaleString()}
                  </td>
                  <td className="py-2.5 font-bold text-primary text-right">
                    {p.closeRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Customer Insights */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-sm">Insight khách hàng</div>
            <span className="text-xs text-primary font-medium cursor-pointer">Xem tất cả</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {customerInsights.map((ins, i) => {
              const IconComp = insightIcons[i] || Coins;
              const insightColors = [
                "#f59e0b", "#6366f1", "#ec4899", "#3b82f6", "#06b6d4",
                "#10b981", "#ef4444", "#8b5cf6", "#f97316",
              ];
              return (
                <div key={i} className="flex items-center gap-2 p-2.5 bg-muted rounded-xl border">
                  <IconComp
                    size={16}
                    weight="duotone"
                    className="flex-shrink-0"
                    style={{ color: insightColors[i] || "var(--primary-600)" }}
                  />
                  <div>
                    <div className="text-[10px] text-muted-foreground">{ins.label}</div>
                    <div className="text-xs font-extrabold">{ins.value.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Customer Sentiment */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-sm">Cảm xúc khách hàng (AI)</div>
            <span className="text-xs text-primary font-medium cursor-pointer">Xem tất cả</span>
          </div>
          <div className="flex justify-around items-center pt-2">
            {[
              { label: "Tích cực", data: customerSentiment.positive, icon: Smiley, color: "#22c55e" },
              { label: "Trung tính", data: customerSentiment.neutral, icon: SmileyMeh, color: "#f59e0b" },
              { label: "Tiêu cực", data: customerSentiment.negative, icon: SmileySad, color: "#ef4444" },
            ].map((s, i) => {
              const IconComp = s.icon;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <IconComp size={32} weight="duotone" style={{ color: s.color }} />
                  <div className="text-xl font-extrabold">{s.data.value}%</div>
                  <div className="text-[10px] text-muted-foreground">{s.label}</div>
                  <div className={`text-[10px] font-bold ${s.data.change.includes("↑") ? 'text-emerald-600' : 'text-red-600'}`}>
                    {s.data.change}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Row 4: Funnel + Care + Pages + Ranking ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Funnel */}
        <Card className="p-5 rounded-2xl">
          <div className="font-semibold text-sm mb-4">Phễu chăm sóc & chốt đơn</div>
          <div className="flex flex-col gap-2">
            {funnelData.map((f, i) => {
              const w = 100 - i * 14;
              const colors = ["#4f46e5", "#6366f1", "#818cf8", "#a78bfa", "#22c55e"];
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20 text-right leading-tight">
                    {f.label}
                  </span>
                  <div className="flex-1 bg-muted rounded-md h-6 overflow-hidden">
                    <div
                      className="h-full rounded-md flex items-center px-2 text-[10px] font-bold text-white transition-all duration-700"
                      style={{ 
                        width: anim ? `${w}%` : "0%",
                        background: colors[i] 
                      }}
                    >
                      {f.value.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground w-8">
                    {f.pct || ""}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Customers Need Care */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-sm">Khách cần chăm sóc</div>
            <span className="text-xs text-primary font-medium cursor-pointer">Xem tất cả</span>
          </div>
          <div className="flex flex-col gap-2">
            {customersNeedCare.map((c, i) => {
              const IconComp = careIconsComp[i] || Crown;
              return (
                <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-xl">
                  <IconComp size={16} weight="duotone" style={{ color: c.color }} />
                  <span className="flex-1 text-[11px] text-foreground leading-tight">{c.label}</span>
                  <span className="text-sm font-extrabold" style={{ color: c.color }}>{c.value}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Pages */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-sm">Top page / kênh</div>
            <span className="text-xs text-primary font-medium cursor-pointer">Xem tất cả</span>
          </div>
          <table className="w-full text-[11px]">
            <tbody>
              {topPages.map((p, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <FacebookLogo size={14} weight="fill" className="text-blue-600" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold ${p.score >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      {p.score}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-primary">{p.closeRate}</td>
                  <td className="py-2.5 text-muted-foreground">{p.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Employee Ranking */}
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-sm">Xếp hạng nhân viên</div>
            <span className="text-xs text-primary font-medium cursor-pointer">Xem tất cả</span>
          </div>
          <table className="w-full text-[11px]">
            <tbody>
              {employeeRanking.map((e, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="py-2.5 font-bold">{e.rank}</td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: `hsl(${i * 67 + 200}, 58%, 55%)` }}>
                        {e.avatar}
                      </div>
                      <span className="font-medium">{e.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 font-bold" style={{ color: getQAColor(e.score) }}>{e.score}</td>
                  <td className="py-2.5 text-muted-foreground">{e.closeRate}</td>
                  <td className="py-2.5 text-muted-foreground">{e.conversations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* ── Row 5: Recent Activities ── */}
      <Card className="p-4 rounded-2xl">
        <div className="font-semibold text-sm mb-3">Hoạt động gần đây</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {recentActivities.map((a, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2 bg-muted rounded-xl border flex-shrink-0"
            >
              {getActivityIcon(a.icon)}
              <div>
                <div className="text-xs font-medium text-foreground whitespace-nowrap mb-0.5">
                  {a.text}
                </div>
                <div className="text-[10px] text-muted-foreground">{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
