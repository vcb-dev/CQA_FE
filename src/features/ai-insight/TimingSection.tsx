import { CheckCircle, HourglassMedium, Warning } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CardHead, DashCard, EmptyBlock, Skeleton } from "@/features/dashboard/DashboardParts";
import type { AiInsightReport } from "./api";
import { Bar, f1, fmt, Mark, minutesText, useSignal } from "./InsightParts";

const GRID = "grid min-w-[520px] grid-cols-[62px_repeat(12,minmax(30px,1fr))] gap-[3px]";

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DAYS_FULL = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ nhật"];

export function HeatmapCard({ report, loading }: { report: AiInsightReport | null; loading: boolean }) {
  const peakSignal = useSignal((s) => s.kind === "peakWindow");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number; d: number; h: number } | null>(null);
  const key = (
    <div aria-hidden="true" className="flex items-center gap-1.5 text-[11.5px] text-slate-500">
      <span>Ít</span>
      <i className="h-2 w-[72px] rounded-full bg-[linear-gradient(90deg,rgba(79,70,229,0.08),rgba(79,70,229,1))]" />
      <span>Nhiều</span>
    </div>
  );
  if (loading || !report) {
    return (
      <DashCard labelledBy="aii-heat-title">
        <CardHead id="aii-heat-title" title="Khách nhắn tin vào lúc nào" subtitle="Màu càng đậm, khách nhắn càng nhiều" />
        <div className="flex flex-col gap-3 px-[18px] py-4">{loading ? [0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-[26px]" />) : null}</div>
      </DashCard>
    );
  }
  const heat = report.heat;
  const max = Math.max(1, ...heat.inbound.flat());
  const hb = heat.highlightStart / 2;
  const slowStart = peakSignal ? Number(peakSignal.memberKey.split(":")[1]) : NaN;
  const sb = Number.isFinite(slowStart) ? slowStart / 2 : null;
  const bucketTotals = Array.from({ length: 12 }, (_, b) => heat.inbound.reduce((s, r) => s + r[b], 0));
  const inboundTotal = bucketTotals.reduce((s, v) => s + v, 0);
  const slowest = bucketTotals
    .map((v, b) => ({ b, share: inboundTotal ? (v / inboundTotal) * 100 : 0, rate: heat.reply15[b] }))
    .filter((x): x is { b: number; share: number; rate: number } => x.rate != null && x.share >= 5)
    .sort((a, b) => a.rate - b.rate)[0];
  const bands = [
    { b: hb, text: sb === hb ? "Đông nhất · trả lời chậm" : "Đông nhất", slow: sb === hb },
    ...(sb != null && sb !== hb ? [{ b: sb, text: "Trả lời chậm", slow: true }] : []),
  ];

  return (
    <DashCard labelledBy="aii-heat-title">
      <CardHead
        id="aii-heat-title"
        title="Khách nhắn tin vào lúc nào"
        subtitle="Màu càng đậm, khách nhắn càng nhiều. Dòng cuối: % số lần khách nhắn được trả lời trong 15 phút"
        right={key}
      />
      <div ref={wrapRef} className="relative overflow-x-auto px-[18px] pb-1 pt-3.5">
        <div
          role="img"
          aria-label={`Bản đồ tin nhắn theo ngày và giờ; ngày đông nhất ${DAYS_FULL[heat.peakDay]}, khung đông nhất ${heat.highlightStart}–${heat.highlightStart + 4}h`}
          className={GRID}
        >
          <div className={cn(GRID, "col-span-full min-w-0")}>
            {bands.map((band) => (
              <div
                key={band.b}
                className={cn(
                  "mb-0.5 flex items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-1 pb-[5px] text-[11px] font-semibold",
                  band.slow ? "border-amber-600 text-amber-700" : "border-slate-400 text-slate-700",
                )}
                style={{ gridColumn: `${band.b + 2} / ${band.b + 4}`, gridRow: 1 }}
              >
                {band.slow ? <Mark signal={peakSignal} small /> : null}
                {band.text}
              </div>
            ))}
            <span className="h-[22px]" style={{ gridColumn: 1, gridRow: 1 }} />
          </div>
          <span />
          {Array.from({ length: 12 }, (_, j) => (
            <span
              key={j}
              className={cn(
                "pb-0.5 text-center text-[11px] tabular-nums",
                sb != null && (j === sb || j === sb + 1) ? "font-bold text-amber-700" : j === hb || j === hb + 1 ? "font-bold text-slate-800" : "text-slate-500",
              )}
            >
              {j * 2}h
            </span>
          ))}
          {heat.inbound.map((row, d) => (
            <div key={d} className="contents">
              <span className="flex items-center text-[12px] font-medium text-slate-600">{DAYS[d]}</span>
              {row.map((v, h) => (
                <span
                  key={h}
                  className="h-7 rounded-[5px] transition-shadow hover:shadow-[0_0_0_2px_#0f172a]"
                  style={{ background: `rgba(79,70,229,${(0.06 + 0.94 * (v / max)).toFixed(3)})` }}
                  onPointerEnter={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    const w = wrapRef.current?.getBoundingClientRect();
                    if (!w || !wrapRef.current) return;
                    setTip({ x: r.left - w.left + wrapRef.current.scrollLeft + r.width / 2, y: r.top - w.top, d, h });
                  }}
                  onPointerLeave={() => setTip(null)}
                />
              ))}
            </div>
          ))}
          <span className="mt-1.5 flex items-center text-[11px] leading-tight text-slate-500">
            Trả lời
            <br />≤ 15 phút
          </span>
          {heat.reply15.map((r, i) => (
            <span
              key={i}
              className={cn(
                "mt-1.5 grid h-6 place-items-center rounded-[5px] text-[11px] font-semibold tabular-nums",
                r == null ? "bg-slate-50 text-slate-400" : r < 60 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700",
              )}
            >
              {r == null ? "—" : `${r}%`}
            </span>
          ))}
        </div>
        {tip ? (
          <div
            className="pointer-events-none absolute z-[5] -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-2 text-[12px] leading-snug text-slate-200 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18)]"
            style={{ left: tip.x, top: tip.y }}
          >
            {DAYS_FULL[tip.d]}, {tip.h * 2}–{tip.h * 2 + 2}h
            <br />
            <b className="tabular-nums text-white">{fmt(heat.inbound[tip.d][tip.h])}</b> tin nhắn
            {heat.reply15[tip.h] != null ? (
              <>
                <br />
                Khung giờ này cả tuần: {heat.reply15[tip.h]}% được trả lời trong 15 phút
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="mx-[18px] mb-4 mt-3 grid grid-cols-3 overflow-hidden rounded-[10px] border border-slate-200 max-[560px]:grid-cols-1">
        <div className="min-w-0 border-r border-slate-200 px-3 py-2.5 max-[560px]:border-b max-[560px]:border-r-0">
          <span className="block text-[11.5px] text-slate-500">Ngày đông nhất</span>
          <b className="mt-0.5 block text-[14px] font-bold tabular-nums text-slate-900">
            {DAYS_FULL[heat.peakDay]}
            <small className="ml-[3px] text-[11.5px] font-medium text-slate-500">{f1(heat.peakDayShare)}% tin nhắn</small>
          </b>
        </div>
        <div className="min-w-0 border-r border-slate-200 px-3 py-2.5 max-[560px]:border-b max-[560px]:border-r-0">
          <span className="block text-[11.5px] text-slate-500">Trả lời chậm nhất</span>
          <b className="mt-0.5 block text-[14px] font-bold tabular-nums text-slate-900">
            {slowest ? `${slowest.b * 2}–${slowest.b * 2 + 2}h` : "—"}
            {slowest ? <small className="ml-[3px] text-[11.5px] font-medium text-slate-500">{slowest.rate}% trong 15 phút</small> : null}
          </b>
        </div>
        <div className="min-w-0 px-3 py-2.5">
          <span className="block text-[11.5px] text-slate-500">Thứ Bảy và Chủ nhật</span>
          <b className="mt-0.5 block text-[14px] font-bold tabular-nums text-slate-900">
            {f1(heat.weekendShare)}%<small className="ml-[3px] text-[11.5px] font-medium text-slate-500">tin nhắn cả tuần</small>
          </b>
        </div>
      </div>
    </DashCard>
  );
}

export function ReplyByPageCard({ report, loading }: { report: AiInsightReport | null; loading: boolean }) {
  if (loading || !report) {
    return (
      <DashCard labelledBy="aii-rbp-title">
        <CardHead id="aii-rbp-title" title="Tốc độ trả lời theo page" />
        <div className="flex flex-col gap-3 px-[18px] py-4">{loading ? [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-[38px]" />) : null}</div>
      </DashCard>
    );
  }
  const { overall, rows } = report.replyByPage;
  const singlePage = report.scope.startsWith("page:");
  return (
    <DashCard className="flex flex-col" labelledBy="aii-rbp-title">
      <CardHead
        id="aii-rbp-title"
        title="Tốc độ trả lời theo page"
        subtitle={`% số lần khách nhắn được trả lời trong 15 phút${overall != null ? ` · mức chung ${f1(overall)}%` : ""}`}
      />
      {rows.length ? (
        <>
          <ul className="flex flex-1 list-none flex-col px-[18px] pb-2 pt-2">
            {rows.map((r) => {
              const good = r.rate != null && overall != null && r.rate >= overall;
              return (
                <li key={r.key} className="flex flex-1 flex-col justify-center gap-1.5 border-b border-slate-100 py-2.5 last:border-b-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={cn("min-w-0 flex-1 truncate text-[13px] font-medium", r.key === "other" ? "text-slate-500" : "text-slate-800")} title={r.name}>
                      {r.name}
                    </span>
                    {r.rate != null && overall != null ? (
                      <span className={cn("inline-flex shrink-0 items-center gap-[3px] text-[11.5px] font-semibold", good ? "text-green-700" : "text-amber-700")}>
                        {good ? <CheckCircle size={12} weight="bold" /> : <Warning size={12} weight="bold" />}
                        {good ? "Tốt" : "Chậm"}
                      </span>
                    ) : null}
                    <b className="w-[46px] shrink-0 text-right text-[13.5px] font-bold tabular-nums text-slate-900">{r.rate == null ? "—" : `${f1(r.rate)}%`}</b>
                  </div>
                  <div role="img" aria-label={`${r.name}: ${f1(r.rate)}% số lần khách nhắn được trả lời trong 15 phút`}>
                    <Bar value={r.rate ?? 0} max={100} color={good ? "#16a34a" : "#d97706"} />
                  </div>
                  <span className="text-[11.5px] tabular-nums text-slate-500">
                    {fmt(r.customers)} khách · chờ câu trả lời đầu {minutesText(r.firstReplyMin)}
                    {r.unanswered ? ` · ${fmt(r.unanswered)} chưa được trả lời` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
          {singlePage ? (
            <p className="px-[18px] pb-3.5 text-[11.5px] leading-[1.45] text-slate-500">Đang xem một page. Chọn “Tất cả kênh” trên thanh công cụ để so sánh giữa các page.</p>
          ) : null}
        </>
      ) : (
        <EmptyBlock icon={<HourglassMedium weight="duotone" />} title="Chưa có số liệu theo page">
          Tuần này được tổng hợp từ trước khi có phần này. Bấm “Tổng hợp lại” trên thanh công cụ để tạo.
        </EmptyBlock>
      )}
    </DashCard>
  );
}
