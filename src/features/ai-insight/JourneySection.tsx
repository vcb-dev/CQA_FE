import { ArrowDown, Info } from "@phosphor-icons/react";
import { CardHead, DashCard, Skeleton } from "@/features/dashboard/DashboardParts";
import type { AiInsightReport } from "./api";
import { f1, fmt, Mark, TrendTag, useSignal } from "./InsightParts";

const STEP_META = {
  withText: { name: "Khách nhắn chữ", def: "Có ít nhất một tin nhắn chữ, không chỉ gửi ảnh hay sticker" },
  interest: { name: "Quan tâm sản phẩm", def: "Hỏi giá, size, chất liệu, nhắc tên sản phẩm hoặc đến từ quảng cáo" },
  signal: { name: "Muốn mua", def: "Hỏi cách đặt, gửi số điện thoại, địa chỉ hoặc chốt mẫu" },
} as const;

function pctChange(cur: number, prev: number | null): number | null {
  if (prev == null || prev <= 0) return null;
  return Math.round(((cur - prev) / prev) * 1000) / 10;
}

export function FunnelCard({ report, loading }: { report: AiInsightReport | null; loading: boolean }) {
  const priceSignal = useSignal((s) => s.kind === "priceLeave");
  const legend = (
    <div aria-hidden="true" className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-slate-600">
      <span className="inline-flex items-center gap-1.5">
        <i className="h-2 w-3.5 rounded-full bg-indigo-600" />
        Tuần này
      </span>
      {report?.compareLabel ? (
        <span className="inline-flex items-center gap-1.5">
          <i className="relative h-2 w-[18px] rounded-full bg-slate-100 after:absolute after:-top-[3px] after:left-1/2 after:h-3.5 after:w-[1.5px] after:-ml-[0.75px] after:rounded-[1px] after:bg-slate-700" />
          Tuần {report.compareLabel}
        </span>
      ) : null}
    </div>
  );

  return (
    <DashCard className="@container flex flex-col" labelledBy="aii-funnel-title">
      <CardHead id="aii-funnel-title" title="Khách dừng lại ở bước nào" subtitle="Giữa hai bước là số khách dừng lại và lý do thường gặp" right={report ? legend : undefined} />
      {loading ? (
        <div className="flex flex-col gap-3.5 px-[18px] py-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[30px]" />
          ))}
        </div>
      ) : !report ? null : (
        <>
          <ol className="list-none px-[18px] pb-2 pt-2.5">
            {report.funnel.steps.map((s, i) => {
              const top = report.funnel.steps[0].value || 1;
              const prevStep = i > 0 ? report.funnel.steps[i - 1] : null;
              const meta = STEP_META[s.key];
              const lost = prevStep ? prevStep.value - s.value : 0;
              const stepPct = prevStep ? (prevStep.value ? (s.value / prevStep.value) * 100 : 0) : report.funnel.total ? (s.value / report.funnel.total) * 100 : 0;
              return (
                <li key={s.key} className="list-none">
                  {prevStep && s.key === "interest" ? (
                    <div className="grid grid-cols-[minmax(150px,200px)_minmax(0,1fr)] gap-x-[18px] @max-[620px]:grid-cols-1">
                      <span className="@max-[620px]:hidden" />
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1.5 text-[12px] leading-snug text-slate-600">
                        <ArrowDown size={14} weight="bold" className="text-slate-400" />
                        <b className="whitespace-nowrap font-semibold tabular-nums text-slate-800">{fmt(lost)} khách chưa nhắc tới sản phẩm</b>
                        <span>
                          {report.funnel.greetingPct != null ? `${f1(report.funnel.greetingPct)}% chỉ chào hỏi, số còn lại hỏi chung chung` : "chỉ chào hỏi hoặc hỏi chung chung"}
                        </span>
                      </div>
                    </div>
                  ) : null}
                  {prevStep && s.key === "signal" ? (
                    <div className="grid grid-cols-[minmax(150px,200px)_minmax(0,1fr)] gap-x-[18px] @max-[620px]:grid-cols-1">
                      <span className="@max-[620px]:hidden" />
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[12px] leading-snug text-amber-900">
                        <ArrowDown size={14} weight="bold" className="text-amber-600" />
                        <Mark signal={priceSignal} small />
                        <b className="whitespace-nowrap font-semibold tabular-nums text-amber-700">{fmt(lost)} khách quan tâm nhưng chưa muốn mua</b>
                        <span>
                          {[
                            report.funnel.afterQuotePct != null ? `${f1(report.funnel.afterQuotePct)}% im lặng ngay sau tin báo giá` : null,
                            report.funnel.waited1hPct != null ? `${f1(report.funnel.waited1hPct)}% từng phải chờ trả lời hơn 1 giờ` : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>
                    </div>
                  ) : null}
                  <div className="grid grid-cols-[minmax(150px,200px)_minmax(0,1fr)_92px_84px] items-center gap-x-[18px] gap-y-1.5 py-2.5 @max-[620px]:grid-cols-[minmax(0,1fr)_auto] @max-[620px]:gap-x-3 @max-[620px]:gap-y-2">
                    <div className="@max-[620px]:order-1">
                      <b className="block text-[13.5px] font-semibold leading-snug text-slate-900">{meta.name}</b>
                      <span className="mt-0.5 block text-[12px] leading-snug text-slate-500">{meta.def}</span>
                    </div>
                    <div
                      role="img"
                      aria-label={`${meta.name}: ${fmt(s.value)} tuần này${s.prev != null ? `, ${fmt(s.prev)} tuần trước` : ""}`}
                      className="relative h-3.5 rounded-full bg-slate-100 @max-[620px]:order-3 @max-[620px]:col-span-2"
                    >
                      <span className="absolute inset-y-0 left-0 min-w-1.5 rounded-full bg-indigo-600" style={{ width: `${(s.value / top) * 100}%` }} />
                      {s.prev != null ? (
                        <i
                          className="absolute -top-1 -ml-[0.75px] h-[22px] w-[1.5px] rounded-[1px] bg-slate-700"
                          style={{ left: `${Math.min(100, (s.prev / top) * 100)}%` }}
                        />
                      ) : null}
                    </div>
                    <div className="text-right leading-tight @max-[620px]:order-2">
                      <b className="block text-[15px] font-bold tabular-nums text-slate-900">{fmt(s.value)}</b>
                      <TrendTag value={pctChange(s.value, s.prev)} tone="good-up" />
                    </div>
                    <div className="text-right text-[11.5px] leading-tight text-slate-500 @max-[620px]:order-4 @max-[620px]:col-span-2 @max-[620px]:text-left">
                      <b className="block text-[13px] font-semibold tabular-nums text-slate-800 @max-[620px]:mr-1.5 @max-[620px]:inline">{f1(stepPct)}%</b>
                      {prevStep ? "so với bước trên" : "tổng số khách"}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-auto flex items-start gap-1.5 px-[18px] pb-3.5 text-[11.5px] leading-[1.45] text-slate-500">
            <Info size={14} className="mt-px shrink-0" />
            Phễu dừng ở bước “Muốn mua” vì đơn tạo từ hội thoại chưa lưu sản phẩm và trạng thái thanh toán, nên chưa tính được bước đặt đơn và thanh toán.
          </div>
        </>
      )}
    </DashCard>
  );
}
