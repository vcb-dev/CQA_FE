import { CloudWarning, Info, PlugsConnected, ArrowsClockwise, Table, GearSix, Sparkle } from "@phosphor-icons/react";
import { type KeyboardEvent, type PointerEvent, type ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CardHead, DashCard, EmptyBlock, Skeleton } from "./DashboardParts";
import { type ChartMetric, type ChartModel, PASS_SCORE, f1, fmt, money, moneyShort } from "./dashboardModel";
import { type DashboardPeriod, dayMonth, weekdayLabel } from "./dashboardPeriod";
import { useElementWidth } from "./useElementWidth";

export type TrendState = "ready" | "loading" | "error" | "noChannels";

const METRICS: Array<{ key: ChartMetric; label: string }> = [
  { key: "revenue", label: "Doanh thu" },
  { key: "orders", label: "Đơn chốt" },
  { key: "conv", label: "Hội thoại" },
  { key: "qa", label: "Điểm QA" },
];

const METRIC_LABEL: Record<ChartMetric, string> = {
  revenue: "Doanh thu",
  orders: "Đơn chốt",
  conv: "Hội thoại",
  qa: "Điểm QA",
};

function niceScale(v: number): { y1: number; ticks: number[] } {
  if (v <= 0) return { y1: 4, ticks: [0, 1, 2, 3, 4] };
  const raw = v / 4;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = ([1, 2, 5, 10].find((x) => x * p >= raw) ?? 10) * p;
  const count = Math.max(1, Math.ceil(v / step));
  return { y1: step * count, ticks: Array.from({ length: count + 1 }, (_, i) => i * step) };
}

function qaDomain(values: number[]): { y0: number; y1: number; ticks: number[] } {
  const lo = Math.min(PASS_SCORE, ...values);
  const hi = Math.max(80, ...values);
  const y0 = Math.max(0, Math.floor((lo - 5) / 10) * 10);
  const y1 = Math.min(100, Math.ceil((hi + 5) / 10) * 10);
  const step = y1 - y0 > 60 ? 20 : 10;
  const ticks: number[] = [];
  for (let t = y0; t <= y1; t += step) ticks.push(t);
  return { y0, y1, ticks };
}

function tickIndexes(period: DashboardPeriod, n: number, plotWidth: number): number[] {
  if (period.key === "month") {
    return plotWidth < 440 ? [0, 9, 19, n - 1] : [0, 4, 9, 14, 19, 24, n - 1];
  }
  if (period.key === "7d") return Array.from({ length: n }, (_, i) => i);
  return Array.from({ length: n }, (_, i) => i).filter((i) => i % 2 === 1);
}

export function TrendChart({
  period,
  model,
  metric,
  onMetric,
  state,
  onRetry,
  dimmed,
  summary,
  asOf,
}: {
  period: DashboardPeriod;
  model: ChartModel | null;
  metric: ChartMetric;
  onMetric: (m: ChartMetric) => void;
  state: TrendState;
  onRetry: () => void;
  dimmed: boolean;
  summary: ReactNode;
  asOf: string | null;
}) {
  const [showTable, setShowTable] = useState(false);
  const [boxRef, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const i = METRICS.findIndex((m) => m.key === metric);
    const next = METRICS[(i + (e.key === "ArrowRight" ? 1 : METRICS.length - 1)) % METRICS.length];
    onMetric(next.key);
    const btn = e.currentTarget.querySelector<HTMLButtonElement>(`[data-metric="${next.key}"]`);
    btn?.focus();
  };

  const header = (
    <CardHead
      id="trendTitle"
      title="Xu hướng theo ngày"
      subtitle={period.chartSubtitle}
      right={
        <>
          <div role="tablist" aria-label="Chỉ số biểu đồ" onKeyDown={onTabKey} className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-[9px] bg-slate-100 p-[3px]">
            {METRICS.map((m) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                data-metric={m.key}
                aria-selected={metric === m.key}
                tabIndex={metric === m.key ? 0 : -1}
                onClick={() => onMetric(m.key)}
                className={cn(
                  "h-7 whitespace-nowrap rounded-[7px] px-3 text-[12.5px] font-medium transition-colors max-[560px]:px-2.5",
                  metric === m.key ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.08)]" : "text-slate-600 hover:text-slate-900",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-pressed={showTable}
            onClick={() => setShowTable((v) => !v)}
            className={cn(
              "inline-flex h-[34px] items-center gap-1.5 rounded-[9px] border px-2.5 text-[12.5px] font-medium",
              showTable ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
            )}
          >
            <Table size={15} />
            <span className="max-[760px]:hidden">Bảng</span>
          </button>
        </>
      }
    />
  );

  if (state === "loading") {
    return (
      <DashCard labelledBy="trendTitle">
        {header}
        <div className="px-[18px] pt-3.5">
          <Skeleton className="h-6 w-[180px]" />
        </div>
        <div className="px-[18px] pb-5 pt-4">
          <Skeleton className="h-[240px] rounded-[10px]" />
        </div>
      </DashCard>
    );
  }

  if (state === "noChannels") {
    return (
      <DashCard labelledBy="trendTitle">
        {header}
        <EmptyBlock
          className="min-h-[300px]"
          icon={<PlugsConnected weight="duotone" />}
          title="Chưa có dữ liệu hội thoại"
          actions={
            <>
              <Link
                to="/settings?tab=channel"
                className="inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-[12.5px] font-semibold text-white shadow-[0_1px_2px_rgba(79,70,229,0.3)] hover:bg-indigo-700"
              >
                <GearSix size={14} weight="bold" />
                Kết nối kênh
              </Link>
              <Link
                to="/quality"
                className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900"
              >
                <Sparkle size={14} weight="bold" />
                Chạy Audit AI
              </Link>
            </>
          }
        >
          Kết nối kênh Facebook và chạy Audit AI để bắt đầu phân tích hội thoại thật.
        </EmptyBlock>
      </DashCard>
    );
  }

  if (state === "error" || !model) {
    return (
      <DashCard labelledBy="trendTitle">
        {header}
        <EmptyBlock
          className="min-h-[300px]"
          tone="bad"
          icon={<CloudWarning weight="duotone" />}
          title="Không tải được xu hướng"
          actions={
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900"
            >
              <ArrowsClockwise size={14} weight="bold" />
              Thử lại
            </button>
          }
        >
          Máy chủ chưa trả về số liệu theo ngày. Các phần khác trên trang vẫn dùng được.
        </EmptyBlock>
      </DashCard>
    );
  }

  const n = model.days.length;
  const fmtV = (v: number) => (metric === "qa" ? f1(v) : metric === "revenue" ? money(v) : fmt(v));
  const fmtShort = (v: number) => (metric === "qa" ? f1(v) : metric === "revenue" ? moneyShort(v) : fmt(v));
  const fmtTick = (v: number) => (metric === "qa" ? String(v) : metric === "revenue" ? moneyShort(v) : fmt(v));
  const curLbl = period.currentSeriesLabel;
  const prevLbl = period.prevSeriesLabel;
  const hasData = model.cur.some((v) => v != null && v > 0);

  const legend = (
    <div className="ml-auto flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-600 max-[560px]:ml-0 max-[560px]:w-full">
      <span className="inline-flex items-center gap-1.5">
        <i className="inline-block h-0.5 w-3.5 rounded-sm bg-indigo-600" />
        {curLbl}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i className="inline-block h-0.5 w-3.5 rounded-sm bg-slate-400" />
        {prevLbl}
      </span>
    </div>
  );

  const summaryRow = (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-1.5 px-[18px] pt-3.5">
      <div className="text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-slate-900">{summary}</div>
      {legend}
    </div>
  );

  if (showTable) {
    return (
      <DashCard labelledBy="trendTitle" className={cn(dimmed && "opacity-60 transition-opacity")}>
        {header}
        {summaryRow}
        <div className="mx-[18px] mb-4 mt-2.5 max-h-[268px] overflow-auto rounded-[10px] border border-slate-100">
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr>
                {["Ngày", curLbl, prevLbl, "Chênh lệch"].map((h, i) => (
                  <th key={h} className={cn("sticky top-0 border-b border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-500", i === 0 ? "text-left" : "text-right")}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {model.days.map((d, i) => {
                const a = model.cur[i];
                if (d > period.today) return null;
                const b = model.prev[i];
                const diff =
                  a == null || b == null
                    ? "—"
                    : metric === "qa"
                      ? `${a - b >= 0 ? "+" : "−"}${f1(Math.abs(a - b))}`
                      : b === 0
                        ? "—"
                        : `${a - b >= 0 ? "+" : "−"}${f1(Math.abs(((a - b) / b) * 100))}%`;
                return (
                  <tr key={d} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-[7px] text-left text-slate-700">{`${weekdayLabel(d)}, ${dayMonth(d)}`}</td>
                    <td className="px-3 py-[7px] text-right tabular-nums text-slate-700">{a == null ? "—" : fmtV(a)}</td>
                    <td className="px-3 py-[7px] text-right tabular-nums text-slate-700">{b == null ? "—" : fmtV(b)}</td>
                    <td className="px-3 py-[7px] text-right tabular-nums text-slate-700">{diff}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashCard>
    );
  }

  const W = Math.max(300, width - 12);
  const margin = { l: 46, r: 56, t: 14, b: 34 };
  const pw = W - margin.l - margin.r;
  const X = (i: number) => margin.l + (n === 1 ? pw / 2 : (i / (n - 1)) * pw);
  const H = 300;
  const ph = H - margin.t - margin.b;

  const vals = [...model.cur, ...model.prev].filter((v): v is number => v != null);
  let y0 = 0;
  let { y1, ticks } = niceScale(Math.max(0, ...vals) * 1.08);
  if (metric === "qa") ({ y0, y1, ticks } = qaDomain(vals));
  const Y = (v: number) => margin.t + (1 - (v - y0) / (y1 - y0 || 1)) * ph;

  const path = (arr: Array<number | null>) => {
    let d = "";
    let on = false;
    arr.forEach((v, i) => {
      if (v == null) {
        on = false;
        return;
      }
      d += `${on ? "L" : "M"}${X(i).toFixed(1)} ${Y(v).toFixed(1)} `;
      on = true;
    });
    return d;
  };
  const prevD = path(model.prev);
  const firstCur = model.cur.findIndex((v) => v != null);
  let lastCur = -1;
  model.cur.forEach((v, i) => {
    if (v != null) lastCur = i;
  });
  const partialToday = lastCur >= 0 && model.days[lastCur] === period.today;
  const fullD = path(model.cur);
  const curD = partialToday ? path(model.cur.map((v, i) => (i === lastCur ? null : v))) : fullD;
  let beforeLast = -1;
  model.cur.forEach((v, i) => {
    if (v != null && i < lastCur) beforeLast = i;
  });
  const partialD =
    partialToday && beforeLast >= 0
      ? `M${X(beforeLast).toFixed(1)} ${Y(model.cur[beforeLast] as number).toFixed(1)} L${X(lastCur).toFixed(1)} ${Y(model.cur[lastCur] as number).toFixed(1)}`
      : "";
  const endY = lastCur >= 0 && model.cur[lastCur] != null ? Y(model.cur[lastCur] as number) : 0;
  const endLabelY = partialToday && asOf && endY > margin.t + ph - 26 ? endY - 22 : endY + 4;
  const areaD = fullD && lastCur >= 0 ? `${fullD}L${X(lastCur).toFixed(1)} ${Y(y0)} L${X(firstCur).toFixed(1)} ${Y(y0)} Z` : "";

  const tipIndex = hover;
  const tipLeft = tipIndex != null ? (X(tipIndex) + 14 + 250 > W ? X(tipIndex) - 258 : X(tipIndex) + 14) : 0;
  const animKey = `${metric}-${period.key}-${period.today}`;

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const sx = ((e.clientX - r.left) * W) / r.width;
    setHover(Math.max(0, Math.min(n - 1, Math.round(((sx - margin.l) / pw) * (n - 1)))));
  };

  return (
    <DashCard labelledBy="trendTitle" className={cn(dimmed && "opacity-60 transition-opacity")}>
      {header}
      {summaryRow}
      <div ref={boxRef} className="relative px-1.5 pb-2.5 pt-1">
        {width > 0 ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            height={H}
            role="img"
            aria-label={`Biểu đồ ${METRIC_LABEL[metric].toLowerCase()} theo ngày, ${curLbl} so với ${prevLbl}`}
            className="block w-full overflow-visible"
          >
            {model.lastIndex < n - 1 ? (
              <>
                <rect x={X(model.lastIndex + 0.5)} y={margin.t} width={margin.l + pw - X(model.lastIndex + 0.5)} height={ph} fill="#f8fafc" />
                <text x={(X(model.lastIndex + 0.5) + margin.l + pw) / 2} y={margin.t + 16} textAnchor="middle" className="fill-slate-500 text-[11px]">
                  Chưa diễn ra
                </text>
              </>
            ) : null}
            {ticks.map((t) => (
              <g key={t}>
                <line x1={margin.l} x2={margin.l + pw} y1={Y(t)} y2={Y(t)} stroke={t === y0 ? "#cbd5e1" : "#eef2f6"} strokeWidth={1} />
                <text x={margin.l - 10} y={Y(t) + 4} textAnchor="end" className="fill-slate-500 text-[11px] tabular-nums">
                  {t === y0 || vals.some((v) => v > 0) ? fmtTick(t) : ""}
                </text>
              </g>
            ))}
            {tickIndexes(period, n, pw).map((i) => (
              <text key={i} x={X(i)} y={margin.t + ph + 18} textAnchor="middle" className="fill-slate-500 text-[11px] tabular-nums">
                {dayMonth(model.days[i])}
              </text>
            ))}
            {metric === "qa" && PASS_SCORE >= y0 && PASS_SCORE <= y1 ? (
              <>
                <line x1={margin.l} x2={margin.l + pw} y1={Y(PASS_SCORE)} y2={Y(PASS_SCORE)} stroke="#dc2626" strokeOpacity={0.55} strokeWidth={1} />
                <text x={margin.l + pw + 6} y={Y(PASS_SCORE) + 4} className="fill-red-700 text-[11px] font-medium">
                  Ngưỡng {PASS_SCORE}
                </text>
              </>
            ) : null}
            {areaD ? <path d={areaD} fill="#4f46e5" opacity={0.07} /> : null}
            <path d={prevD} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
            {curD ? (
              <path
                key={animKey}
                d={curD}
                pathLength={1}
                fill="none"
                stroke="#4f46e5"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={1}
                className="[animation:dash-draw_900ms_cubic-bezier(.16,1,.3,1)_both] motion-reduce:[animation:none]"
              />
            ) : null}
            {partialD ? (
              <path d={partialD} fill="none" stroke="#4f46e5" strokeWidth={2} strokeDasharray="4 4" strokeLinecap="round" opacity={0.7} />
            ) : null}
            {lastCur >= 0 && model.cur[lastCur] != null ? (
              <>
                <circle
                  cx={X(lastCur)}
                  cy={Y(model.cur[lastCur] as number)}
                  r={4.5}
                  fill={partialToday ? "#fff" : "#4f46e5"}
                  stroke="#4f46e5"
                  strokeWidth={2}
                />
                <text x={X(lastCur) + 9} y={endLabelY} className="fill-slate-900 text-[12px] font-bold tabular-nums">
                  {fmtShort(model.cur[lastCur] as number)}
                </text>
                {partialToday && asOf ? (
                  <text x={X(lastCur) + 9} y={endLabelY + 14} className="fill-slate-500 text-[11px]">
                    đến {asOf}
                  </text>
                ) : null}
              </>
            ) : null}
            {tipIndex != null ? (
              <g className="pointer-events-none">
                <line x1={X(tipIndex)} x2={X(tipIndex)} y1={margin.t} y2={margin.t + ph} stroke="#94a3b8" strokeWidth={1} />
                {model.cur[tipIndex] != null ? (
                  <circle cx={X(tipIndex)} cy={Y(model.cur[tipIndex] as number)} r={4.5} fill="#4f46e5" stroke="#fff" strokeWidth={2} />
                ) : null}
                {model.prev[tipIndex] != null ? (
                  <circle cx={X(tipIndex)} cy={Y(model.prev[tipIndex] as number)} r={4} fill="#94a3b8" stroke="#fff" strokeWidth={2} />
                ) : null}
              </g>
            ) : null}
            <rect
              x={margin.l - 8}
              y={margin.t}
              width={pw + 16}
              height={ph}
              fill="transparent"
              onPointerMove={onMove}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
        ) : (
          <div style={{ height: 300 }} />
        )}
        {tipIndex != null && width > 0 ? (
          <div
            className="pointer-events-none absolute z-[5] min-w-[170px] max-w-[260px] rounded-[10px] border border-slate-200 bg-white px-3 py-2.5 text-[12px] shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18),0_2px_6px_rgba(15,23,42,0.06)]"
            style={{ left: tipLeft, top: margin.t + 4 }}
          >
            <div className="mb-1.5 font-medium text-slate-500">
              {model.days[tipIndex] <= period.today
                ? `${weekdayLabel(model.days[tipIndex])}, ${dayMonth(model.days[tipIndex])}${model.days[tipIndex] === period.today && asOf ? ` · đến ${asOf}` : ""}`
                : `${dayMonth(model.days[tipIndex])} · chưa diễn ra`}
            </div>
            {model.cur[tipIndex] != null ? (
              <div className="mt-[3px] flex items-center gap-2">
                <i className="inline-block h-0.5 w-3 rounded-sm bg-indigo-600" />
                <b className="text-[13px] tabular-nums text-slate-900">{fmtV(model.cur[tipIndex] as number)}</b>
                <span className="text-slate-500">{curLbl}</span>
              </div>
            ) : null}
            {model.prev[tipIndex] != null ? (
              <div className="mt-[3px] flex items-center gap-2">
                <i className="inline-block h-0.5 w-3 rounded-sm bg-slate-400" />
                <b className="text-[13px] tabular-nums text-slate-900">{fmtV(model.prev[tipIndex] as number)}</b>
                <span className="text-slate-500">
                  {prevLbl}
                  {model.prevDays[tipIndex] ? ` · ${dayMonth(model.prevDays[tipIndex] as string)}` : ""}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {!hasData ? (
        <div className="flex items-center gap-1.5 px-[18px] pb-3.5 text-[11.5px] text-slate-500">
          <Info size={14} className="shrink-0" />
          {metric === "revenue" || metric === "orders"
            ? "Chưa có đơn nào trong kỳ. Đơn và doanh thu được ghi nhận khi nhân viên tạo đơn OMS/Sapo từ hội thoại trong CRM."
            : `Chưa có số liệu ${METRIC_LABEL[metric].toLowerCase()} trong kỳ này.`}
        </div>
      ) : period.key === "month" && model.lastIndex < n - 1 ? (
        <div className="flex items-center gap-1.5 px-[18px] pb-3.5 text-[11.5px] text-slate-500">
          <Info size={14} />
          Từ {dayMonth(model.days[model.lastIndex + 1])} đến {dayMonth(model.days[n - 1])} chưa diễn ra; {prevLbl.toLowerCase()} hiển thị đủ {model.prevDays.filter(Boolean).length} ngày để so sánh.
        </div>
      ) : null}
    </DashCard>
  );
}
