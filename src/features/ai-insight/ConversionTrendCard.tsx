import { Minus, TrendDown, TrendUp } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CardHead, DashCard, Skeleton } from "@/features/dashboard/DashboardParts";
import type { AiInsightReport } from "./api";
import { f1, fmt } from "./InsightParts";

function niceMax(value: number) {
  const raw = Math.max(value, 1) / 3;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  return { step, max: Math.ceil(value / step) * step || step };
}

function dayMonth(weekStart: string) {
  const [, m, d] = weekStart.split("-");
  return `${d}/${m}`;
}

function ChangeLine({ cur, prev }: { cur: number; prev: number | null }) {
  if (prev == null) return <span className="text-slate-500">Chưa có tuần trước để so sánh</span>;
  const diff = Math.round((cur - prev) * 10) / 10;
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-slate-600">
        <Minus size={13} weight="bold" />
        Bằng tuần trước
      </span>
    );
  }
  const up = diff > 0;
  const Icon = up ? TrendUp : TrendDown;
  return (
    <span className={cn("inline-flex items-center gap-1 font-medium", up ? "text-green-700" : "text-amber-700")}>
      <Icon size={13} weight="bold" />
      {up ? "Tăng" : "Giảm"} từ {f1(prev)}% của tuần trước
    </span>
  );
}

export function ConversionTrendCard({ report, loading }: { report: AiInsightReport | null; loading: boolean }) {
  const [active, setActive] = useState<number | null>(null);
  const points = (report?.funnel.trend ?? []).filter((r) => r.interest > 0).map((r) => ({ ...r, rate: (r.signal / r.interest) * 100 }));
  const cur = points[points.length - 1];
  const prev = points.length > 1 ? points[points.length - 2] : null;
  const sumSignal = points.reduce((s, p) => s + p.signal, 0);
  const sumInterest = points.reduce((s, p) => s + p.interest, 0);
  const avg = sumInterest ? (sumSignal / sumInterest) * 100 : null;
  const best = points.length ? points.reduce((a, b) => (b.rate > a.rate ? b : a)) : null;
  const worst = points.length ? points.reduce((a, b) => (b.rate < a.rate ? b : a)) : null;
  const scale = niceMax(Math.max(0, ...points.map((p) => p.rate)));
  const ticks = Array.from({ length: Math.round(scale.max / scale.step) + 1 }, (_, i) => i * scale.step);
  const shown = active != null ? points[active] : null;

  return (
    <DashCard className="flex flex-col" labelledBy="aii-trend-title">
      <CardHead id="aii-trend-title" title="Tỷ lệ khách muốn mua" subtitle="Trong số khách hỏi về sản phẩm, bao nhiêu người hỏi đặt hoặc chốt mẫu" />
      {loading ? (
        <div className="flex flex-1 flex-col gap-3 px-[18px] py-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="min-h-[150px] flex-1" />
        </div>
      ) : !report ? null : !cur ? (
        <div className="flex flex-1 items-center justify-center px-6 py-10 text-center text-[12.5px] text-slate-500">Chưa có khách quan tâm sản phẩm để tính tỷ lệ.</div>
      ) : (
        <>
          <div className="flex items-center gap-3.5 px-[18px] pt-3.5">
            <b className="text-[30px] font-bold leading-none tracking-[-0.02em] text-slate-900">{f1(cur.rate)}%</b>
            <div className="min-w-0 text-[12.5px] leading-snug text-slate-700">
              <span className="block">
                Tuần này, cứ 100 khách quan tâm có khoảng <b className="font-semibold text-slate-900">{fmt(cur.rate)}</b> người muốn mua
              </span>
              <span className="mt-0.5 block text-[12px]">
                <ChangeLine cur={cur.rate} prev={prev?.rate ?? null} />
              </span>
            </div>
          </div>

          <div
            tabIndex={0}
            role="group"
            aria-label="Tỷ lệ khách muốn mua theo tuần. Dùng phím mũi tên trái phải để xem từng tuần"
            onKeyDown={(e) => {
              if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
              e.preventDefault();
              const base = active ?? points.length - 1;
              setActive(Math.max(0, Math.min(points.length - 1, base + (e.key === "ArrowRight" ? 1 : -1))));
            }}
            onBlur={() => setActive(null)}
            className="mx-[18px] mt-4 flex min-h-[150px] flex-1 flex-col rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500 max-[1180px]:min-h-[190px]"
          >
            <div className="relative ml-9 flex-1" onPointerLeave={() => setActive(null)}>
              {ticks.map((t) => (
                <div key={t} className={cn("absolute inset-x-0 border-t", t === 0 ? "border-slate-300" : "border-slate-100")} style={{ bottom: `${(t / scale.max) * 100}%` }}>
                  <span className="absolute -left-9 w-7 -translate-y-1/2 text-right text-[11px] tabular-nums text-slate-400">{t.toLocaleString("vi-VN")}%</span>
                </div>
              ))}
              <div className="absolute inset-0 flex items-end gap-1">
                {points.map((p, i) => {
                  const h = (p.rate / scale.max) * 100;
                  const isCur = i === points.length - 1;
                  return (
                    <div key={p.weekStart} className="relative flex h-full flex-1 items-end justify-center" onPointerEnter={() => setActive(i)}>
                      {isCur ? (
                        <span className="absolute text-[11.5px] font-semibold tabular-nums text-slate-900" style={{ bottom: `calc(${h}% + 4px)` }}>
                          {f1(p.rate)}%
                        </span>
                      ) : null}
                      <span
                        className={cn(
                          "block w-full max-w-[24px] rounded-t-[4px] transition-colors",
                          isCur ? (active === i ? "bg-indigo-700" : "bg-indigo-600") : active === i ? "bg-slate-300" : "bg-slate-200",
                        )}
                        style={{ height: `${Math.max(2, h)}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              {shown ? (
                <div
                  className={cn(
                    "pointer-events-none absolute top-0 z-10 w-max max-w-[220px] rounded-lg bg-slate-900 px-2.5 py-1.5 text-[11.5px] leading-snug text-slate-200 shadow-[0_8px_20px_-8px_rgba(15,23,42,0.4)]",
                    active! < points.length / 2 ? "left-0" : "right-0",
                  )}
                >
                  <b className="block font-semibold text-white">
                    Tuần {shown.label}: {f1(shown.rate)}%
                  </b>
                  {fmt(shown.signal)} trong {fmt(shown.interest)} khách quan tâm đã muốn mua
                </div>
              ) : null}
            </div>
            <div className="ml-9 mt-1.5 flex gap-1 text-[11px] text-slate-500">
              {points.map((p, i) => (
                <span key={p.weekStart} className={cn("flex-1 text-center tabular-nums", i === points.length - 1 && "font-semibold text-slate-700")}>
                  {dayMonth(p.weekStart)}
                </span>
              ))}
            </div>
          </div>

          <table className="sr-only">
            <caption>Tỷ lệ khách quan tâm sản phẩm muốn mua theo tuần</caption>
            <thead>
              <tr>
                <th>Tuần</th>
                <th>Tỷ lệ</th>
                <th>Khách muốn mua / khách quan tâm</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p.weekStart}>
                  <td>{p.label}</td>
                  <td>{f1(p.rate)}%</td>
                  <td>
                    {fmt(p.signal)} / {fmt(p.interest)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="mx-[18px] mb-4 mt-3.5 grid grid-cols-3 overflow-hidden rounded-[10px] border border-slate-200 text-[11.5px] max-[420px]:grid-cols-1">
            {[
              [`Trung bình ${points.length} tuần`, avg == null ? "—" : `${f1(avg)}%`, null],
              ["Tuần cao nhất", best ? `${f1(best.rate)}%` : "—", best ? dayMonth(best.weekStart) : null],
              ["Tuần thấp nhất", worst ? `${f1(worst.rate)}%` : "—", worst ? dayMonth(worst.weekStart) : null],
            ].map(([k, v, w]) => (
              <div key={k} className="min-w-0 border-r border-slate-200 px-3 py-2 last:border-r-0 max-[420px]:border-b max-[420px]:border-r-0 max-[420px]:last:border-b-0">
                <dt className="truncate text-slate-500">{k}</dt>
                <dd className="mt-0.5 text-[13.5px] font-semibold text-slate-900">
                  {v}
                  {w ? <small className="ml-1 text-[11px] font-medium text-slate-500">tuần {w}</small> : null}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </DashCard>
  );
}
