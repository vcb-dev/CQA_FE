import { Lightbulb } from "@phosphor-icons/react";
import { CardHead, DashCard, Skeleton } from "@/features/dashboard/DashboardParts";
import type { AiInsightReport, SegmentKey } from "./api";
import { f1, fmt, Mark, minutesText, TickLegend, TrendTag, useSignal } from "./InsightParts";

const SEG_COLOR: Record<SegmentKey, string> = {
  priceLeave: "#eb6834",
  considering: "#eda100",
  ready: "#1baf7a",
  comment: "#4f46e5",
  postbuy: "#e87ba4",
  unclear: "#cbd5e1",
};

const TREND_TONE: Record<SegmentKey, "good-up" | "bad-up" | "mute"> = {
  priceLeave: "bad-up",
  considering: "mute",
  ready: "good-up",
  comment: "mute",
  postbuy: "bad-up",
  unclear: "mute",
};

export function SegmentsCard({ report, loading }: { report: AiInsightReport | null; loading: boolean }) {
  const priceSignal = useSignal((s) => s.kind === "priceLeave");
  const postbuySignal = useSignal((s) => s.kind === "issue:delivery" || s.kind === "issue:quality");
  const seg = report?.segments;

  if (loading || !seg) {
    return (
      <DashCard labelledBy="aii-seg-title">
        <CardHead id="aii-seg-title" title="6 nhóm khách theo cách họ nhắn tin" subtitle="Mỗi khách thuộc đúng một nhóm" />
        <div className="flex flex-col gap-3.5 px-[18px] py-4">
          {loading ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-11" />) : null}
        </div>
      </DashCard>
    );
  }

  const items = seg.items;

  return (
    <DashCard labelledBy="aii-seg-title">
      <CardHead id="aii-seg-title" title="6 nhóm khách theo cách họ nhắn tin" subtitle={`${fmt(seg.total)} khách trong tuần · mỗi khách thuộc đúng một nhóm`} />
      <div className="grid grid-cols-3 gap-3 px-[18px] pb-[18px] pt-4 max-[1320px]:grid-cols-2 max-[760px]:grid-cols-1">
        {items.map((s) => {
          const color = SEG_COLOR[s.key];
          const mark = s.key === "priceLeave" ? priceSignal : s.key === "postbuy" ? postbuySignal : undefined;
          return (
            <article
              key={s.key}
              className="relative flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white py-3.5 pl-4 pr-3.5 transition-[border-color,box-shadow] hover:border-slate-300 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_6px_-2px_rgba(15,23,42,0.06)]"
            >
              <span className="absolute -left-px bottom-3.5 top-3.5 w-[3px] rounded-r-[3px]" style={{ background: color }} />
              <div className="flex min-w-0 items-center gap-2">
                <Mark signal={mark} small />
                <b className="truncate text-[13.5px] font-semibold text-slate-900">{s.name}</b>
                <span className="ml-auto">
                  <TrendTag value={s.change} tone={TREND_TONE[s.key]} />
                </span>
              </div>
              <p className="-mt-1 text-[12px] leading-[1.45] text-slate-500">{s.def}</p>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="block text-[11px] text-slate-500">Khách</span>
                  <b className="block whitespace-nowrap text-[16px] font-bold leading-snug tabular-nums text-slate-900">
                    {fmt(s.n)}
                    <small className="ml-[3px] text-[11px] font-medium text-slate-500">{f1(seg.total ? (s.n / seg.total) * 100 : 0)}%</small>
                  </b>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">Tin mỗi khách</span>
                  <b className="block text-[16px] font-bold leading-snug tabular-nums text-slate-900">{f1(s.msgPerCustomer)}</b>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-500">Chờ trả lời đầu</span>
                  <b className="block whitespace-nowrap text-[16px] font-bold leading-snug tabular-nums text-slate-900">{minutesText(s.waitMin)}</b>
                </div>
              </div>
              <div
                role="img"
                aria-label={`${f1(s.reply15)}% số lần khách nhắn được trả lời trong 15 phút, mức chung ${f1(seg.reply15Avg)}%`}
                className="relative h-1.5 rounded-full bg-slate-100"
              >
                <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${s.reply15 ?? 0}%`, background: color }} />
                {seg.reply15Avg != null ? <i className="absolute -top-[3px] -ml-[0.75px] h-3 w-[1.5px] rounded-[1px] bg-slate-700" style={{ left: `${seg.reply15Avg}%` }} /> : null}
              </div>
              <div className="mt-auto flex gap-[7px] border-t border-slate-100 pt-2.5 text-[12px] leading-[1.45] text-slate-700">
                <Lightbulb size={15} weight="duotone" className="mt-px shrink-0 text-indigo-600" />
                <span>{s.tip}</span>
              </div>
            </article>
          );
        })}
      </div>
      <TickLegend>Thanh màu: % số lần khách nhắn được trả lời trong 15 phút · vạch dọc: mức chung {f1(seg.reply15Avg)}% của mọi nhóm</TickLegend>
    </DashCard>
  );
}
