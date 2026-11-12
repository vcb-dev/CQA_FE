import { Info, MagnifyingGlass, Megaphone, Stack } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { CardHead, CardLink, DashCard, Skeleton } from "@/features/dashboard/DashboardParts";
import type { AiInsightReport } from "./api";
import { f1, fmt, hoursText, minutesText } from "./InsightParts";

const th = "whitespace-nowrap border-b border-slate-200 px-3 py-2 text-left text-[12px] font-medium text-slate-500";
const td = "whitespace-nowrap border-b border-slate-100 px-3 py-[11px] tabular-nums text-slate-700";

export function SourcesCard({ report, loading }: { report: AiInsightReport | null; loading: boolean }) {
  if (loading || !report) {
    return (
      <DashCard labelledBy="aii-src-title">
        <CardHead id="aii-src-title" title="So sánh theo nguồn khách" />
        <div className="flex flex-col gap-3 px-[18px] py-4">{loading ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-7" />) : null}</div>
      </DashCard>
    );
  }
  const { rows, total } = report.sources;
  const hasCost = rows.some((r) => r.costPerConversation != null);
  return (
    <DashCard className="@container flex flex-col" labelledBy="aii-src-title">
      <CardHead
        id="aii-src-title"
        title="So sánh theo nguồn khách"
        subtitle="Khách từ từng page chạy quảng cáo so với khách tự tìm đến"
        right={<CardLink to="/ads">Quảng cáo</CardLink>}
      />
      <div className="overflow-x-auto px-1.5 pb-1 pt-2">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className={th}>Nguồn</th>
              <th className={cn(th, "text-right")}>Khách</th>
              <th className={cn(th, "text-right")}>Muốn mua</th>
              <th className={cn(th, "text-right @max-[720px]:hidden")}>Muốn mua sau</th>
              <th className={cn(th, "text-right @max-[900px]:hidden")}>Chờ trả lời đầu</th>
              <th className={cn(th, "text-right @max-[520px]:hidden")}>Khách cũ</th>
              <th className={cn(th, "text-right")}>Chi phí / hội thoại quảng cáo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const Icon = r.type === "organic" ? MagnifyingGlass : r.type === "otherAds" ? Stack : Megaphone;
              return (
                <tr key={r.key} className="transition-colors hover:bg-slate-50">
                  <td className={cn(td, "@max-[520px]:whitespace-normal")}>
                    <div className="flex items-center gap-2.5">
                      <Icon size={17} className="shrink-0 text-slate-500 @max-[520px]:hidden" />
                      <div className="min-w-0">
                        <b className="block max-w-[260px] truncate text-[13px] font-medium leading-tight text-slate-900">{r.name}</b>
                        <small className="block text-[11.5px] text-slate-500 @max-[520px]:hidden">{r.type === "organic" ? "Tự tìm đến hoặc khách cũ quay lại" : "Bấm quảng cáo trong tuần"}</small>
                      </div>
                    </div>
                  </td>
                  <td className={cn(td, "text-right")}>
                    {fmt(r.customers)}
                    <small className="ml-1 text-[11.5px] text-slate-500">{total.customers ? Math.round((r.customers / total.customers) * 100) : 0}%</small>
                  </td>
                  <td className={cn(td, "text-right")}>
                    <span className="inline-flex items-center justify-end gap-2">
                      <i className="relative block h-1.5 w-14 overflow-hidden rounded-full bg-slate-100">
                        <span className="absolute inset-y-0 left-0 rounded-full bg-indigo-600" style={{ width: `${Math.min(100, ((r.signalRate ?? 0) / 25) * 100)}%` }} />
                      </i>
                      {r.signalRate == null ? "—" : `${f1(r.signalRate)}%`}
                    </span>
                  </td>
                  <td className={cn(td, "text-right @max-[720px]:hidden", (r.signalHours ?? 0) >= 24 && "font-semibold text-amber-700")}>{hoursText(r.signalHours)}</td>
                  <td className={cn(td, "text-right @max-[900px]:hidden", (r.firstReplyMin ?? 0) >= 15 && "font-semibold text-amber-700")}>{minutesText(r.firstReplyMin)}</td>
                  <td className={cn(td, "text-right @max-[520px]:hidden")}>{r.returningPct == null ? "—" : `${f1(r.returningPct)}%`}</td>
                  <td className={cn(td, "text-right")}>
                    {r.type === "organic" ? (
                      <span className="inline-flex h-6 items-center rounded-[7px] bg-slate-100 px-2 text-[12px] font-semibold text-slate-600">Không chạy quảng cáo</span>
                    ) : r.costPerConversation == null ? (
                      <span className="text-slate-400">Chưa có số liệu</span>
                    ) : (
                      `${fmt(r.costPerConversation)} ₫`
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="font-semibold text-slate-900">
              <td className="border-t border-slate-200 px-3 py-[11px]">Tổng tuần</td>
              <td className="border-t border-slate-200 px-3 py-[11px] text-right tabular-nums">{fmt(total.customers)}</td>
              <td className="border-t border-slate-200 px-3 py-[11px] text-right tabular-nums">{total.signalRate == null ? "—" : `${f1(total.signalRate)}%`}</td>
              <td className="border-t border-slate-200 px-3 py-[11px] text-right tabular-nums @max-[720px]:hidden">{hoursText(total.signalHours)}</td>
              <td className="border-t border-slate-200 px-3 py-[11px] text-right tabular-nums @max-[900px]:hidden">{minutesText(total.firstReplyMin)}</td>
              <td className="border-t border-slate-200 px-3 py-[11px] text-right tabular-nums @max-[520px]:hidden">{total.returningPct == null ? "—" : `${f1(total.returningPct)}%`}</td>
              <td className="border-t border-slate-200 px-3 py-[11px] text-right tabular-nums">{total.costPerConversation == null ? "—" : `${fmt(total.costPerConversation)} ₫`}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-auto flex items-start gap-1.5 px-[18px] pb-3.5 pt-1 text-[11.5px] leading-[1.45] text-slate-500">
        <Info size={14} className="mt-px shrink-0" />
        {hasCost
          ? "Chi phí lấy theo từng page trên Meta Ads, chia cho số hội thoại Meta ghi nhận (chưa tách theo từng mẫu quảng cáo). Tỷ lệ muốn mua ở bảng này tính trên tất cả khách của nguồn, nên thấp hơn số ở phễu."
          : "Tuần này chưa có số liệu chi phí quảng cáo của các page. Tỷ lệ muốn mua ở bảng này tính trên tất cả khách của nguồn, nên thấp hơn số ở phễu."}
      </div>
    </DashCard>
  );
}
