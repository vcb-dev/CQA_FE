import { useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CardHead, CardLink, DashCard, EmptyBlock, PlatformIcon, STATUS_META, Skeleton, StatusIcon } from "./DashboardParts";
import {
  type ConcernModel,
  type PagePerformanceModel,
  type SentimentModel,
  f1,
  fmt,
  money,
  moneyShort,
} from "./dashboardModel";

const SLICE_COLORS = ["#4f46e5", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#cbd5e1"];
const SENTIMENT = [
  { key: "positive", label: "Tích cực", color: "#2a78d6" },
  { key: "neutral", label: "Trung lập", color: "#cbd5e1" },
  { key: "negative", label: "Tiêu cực", color: "#e34948" },
] as const;

export function ConcernCard({
  state,
  concerns,
  sentiment,
  compareLabel,
}: {
  state: "ready" | "loading" | "empty";
  concerns: ConcernModel | null;
  sentiment: SentimentModel | null;
  compareLabel: string;
}) {
  const [focus, setFocus] = useState<number | null>(null);
  const head = (
    <CardHead
      id="concernTitle"
      title="Khách hàng quan tâm"
      subtitle={state === "empty" ? "Chưa có hội thoại được phân tích" : "Nhu cầu chính trong hội thoại đã chấm"}
      right={<CardLink to="/ai-insight">AI Insight</CardLink>}
    />
  );

  if (state === "loading") {
    return (
      <DashCard labelledBy="concernTitle" className="flex flex-col @container">
        {head}
        <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-4 px-[18px] pb-[18px] pt-4 @max-[420px]:grid-cols-[112px_minmax(0,1fr)]">
          <Skeleton className="aspect-square w-full rounded-full" />
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-3" />
            ))}
          </div>
        </div>
      </DashCard>
    );
  }

  if (state === "empty" || !concerns || concerns.total === 0) {
    return (
      <DashCard labelledBy="concernTitle" className="flex flex-col">
        {head}
        <EmptyBlock>
          {concerns && concerns.unknown > 0
            ? `${fmt(concerns.unknown)} hội thoại đã chấm nhưng AI chưa xác định được nhu cầu.`
            : "Chưa có hội thoại nào được AI phân tích nhu cầu trong kỳ này."}
        </EmptyBlock>
      </DashCard>
    );
  }

  const R = 60;
  const C = 2 * Math.PI * R;
  const gap = 2.5;
  let offset = 0;
  const segments = concerns.items.map((it, i) => {
    const len = (it.count / concerns.total) * C;
    const seg = { i, len, offset, color: SLICE_COLORS[i] ?? SLICE_COLORS[SLICE_COLORS.length - 1] };
    offset += len;
    return seg;
  });
  const focused = focus != null ? concerns.items[focus] : null;

  return (
    <DashCard labelledBy="concernTitle" className="flex flex-col @container">
      {head}
      <div className="grid grid-cols-[140px_minmax(0,1fr)] items-center gap-4 px-[18px] pb-[18px] pt-4 @max-[420px]:grid-cols-[112px_minmax(0,1fr)] @max-[420px]:gap-3.5 @max-[300px]:grid-cols-1 @max-[300px]:justify-items-center">
        <div className="relative h-[140px] w-[140px] @max-[420px]:h-[112px] @max-[420px]:w-[112px] @max-[300px]:h-[140px] @max-[300px]:w-[140px]">
          <svg viewBox="0 0 148 148" role="img" aria-label="Phân bổ nhu cầu khách hàng" className="h-full w-full -rotate-90">
            {segments.map((s) => (
              <circle
                key={s.i}
                cx={74}
                cy={74}
                r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={focus === s.i ? 19 : 16}
                strokeDasharray={`${Math.max(0, s.len - gap)} ${C}`}
                strokeDashoffset={-s.offset}
                opacity={focus == null || focus === s.i ? 1 : 0.25}
                className="transition-[opacity,stroke-width] duration-200"
                onPointerEnter={() => setFocus(s.i)}
                onPointerLeave={() => setFocus(null)}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <b className="text-[19px] font-bold leading-[1.1] tracking-[-0.02em] tabular-nums text-slate-900">
              {fmt(focused ? focused.count : concerns.total)}
            </b>
            <span className="mt-0.5 max-w-[104px] whitespace-pre-line text-[11px] leading-[1.3] text-slate-500">
              {focused ? focused.label : "hội thoại\nrõ nhu cầu"}
            </span>
          </div>
        </div>
        <ul className="flex w-full flex-col gap-0.5">
          {concerns.items.map((it, i) => (
            <li
              key={it.label}
              title={`${fmt(it.count)} hội thoại`}
              onPointerEnter={() => setFocus(i)}
              onPointerLeave={() => setFocus(null)}
              className={cn(
                "grid grid-cols-[10px_minmax(0,1fr)_38px] items-center gap-2 rounded-[7px] px-1.5 py-[5px] text-[12.5px] text-slate-700",
                focus === i ? "bg-slate-50" : "hover:bg-slate-50",
              )}
            >
              <i className="h-2.5 w-2.5 rounded-[3px]" style={{ background: SLICE_COLORS[i] ?? SLICE_COLORS[SLICE_COLORS.length - 1] }} />
              <span className="truncate">{it.label}</span>
              <span className="text-right font-semibold tabular-nums text-slate-900">{it.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
      {concerns.unknown > 0 ? (
        <p className="-mt-2 px-[18px] pb-3 text-[11.5px] text-slate-500">
          {fmt(concerns.unknown)} hội thoại chưa rõ nhu cầu không tính vào biểu đồ.
        </p>
      ) : null}
      {sentiment ? (
        <div className="mx-[18px] mt-auto border-t border-slate-100 pb-[18px] pt-3.5">
          <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
            <b className="whitespace-nowrap text-[13px] font-semibold text-slate-900">Cảm xúc khách hàng</b>
            <span className="text-[12px] text-slate-500">
              {sentiment.positiveChange != null
                ? `Tích cực ${sentiment.positiveChange >= 0 ? "+" : "−"}${f1(Math.abs(sentiment.positiveChange))} điểm so với ${compareLabel}`
                : `${fmt(sentiment.analyzed)} hội thoại đã phân tích`}
            </span>
          </div>
          <div
            role="img"
            aria-label={SENTIMENT.map((s) => `${s.label} ${Math.round(sentiment[s.key])}%`).join(", ")}
            className="flex h-2.5 gap-0.5 overflow-hidden rounded-full"
          >
            {SENTIMENT.map((s) => (
              <span key={s.key} style={{ width: `${sentiment[s.key]}%`, background: s.color }} />
            ))}
          </div>
          <div className="mt-[9px] flex flex-wrap gap-x-3.5 gap-y-1 text-[12px] text-slate-600">
            {SENTIMENT.map((s) => (
              <span key={s.key} className="inline-flex items-center gap-1.5">
                <i className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: s.color }} />
                {s.label} <b className="font-semibold tabular-nums text-slate-900">{Math.round(sentiment[s.key])}%</b>
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </DashCard>
  );
}

const TH = "whitespace-nowrap border-b border-slate-200 px-2.5 py-2 text-[12px] font-medium text-slate-500";
const TD = "whitespace-nowrap px-2.5 py-2.5 tabular-nums";
const PAGE_ROWS = 6;

function useFitRows(enabled: boolean, total: number) {
  const [box, setBox] = useState<HTMLDivElement | null>(null);
  const [fit, setFit] = useState(PAGE_ROWS);

  useLayoutEffect(() => {
    if (!enabled || !box) return;
    const measure = () => {
      const row = box.querySelector("tbody tr");
      if (!row) return;
      const style = getComputedStyle(box);
      const head = box.querySelector("thead")?.getBoundingClientRect().height ?? 0;
      const space = box.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom) - head;
      setFit(Math.max(1, Math.floor(space / row.getBoundingClientRect().height)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
  }, [enabled, box, total]);

  return [setBox, Math.min(total, enabled ? fit : PAGE_ROWS)] as const;
}

export function PagePerformanceCard({
  state,
  model,
  qualityLink,
  fill = false,
}: {
  state: "ready" | "loading" | "empty";
  model: PagePerformanceModel | null;
  qualityLink: (pageId?: string) => string;
  fill?: boolean;
}) {
  const [boxRef, visible] = useFitRows(fill && state === "ready", model?.rows.length ?? 0);
  const cardClass = cn("flex flex-col", fill && "absolute inset-0");
  const subtitle =
    state === "loading" || !model
      ? "Đang tải…"
      : model.rows.length === 0
        ? "Chưa có page hoạt động trong kỳ"
        : model.hasRevenue
          ? `Xếp theo doanh thu · ${fmt(model.active)} page hoạt động`
          : "Chưa có doanh thu · xếp theo hội thoại";
  const head = (
    <CardHead id="pagesTitle" title="Hiệu quả theo page" subtitle={subtitle} right={<CardLink to="/pages">Page / Kênh</CardLink>} />
  );

  if (state === "loading") {
    return (
      <DashCard labelledBy="pagesTitle" className={cn(cardClass, "overflow-hidden")}>
        {head}
        <div className="flex flex-col gap-3.5 px-[18px] pb-4 pt-4">
          {Array.from({ length: fill ? 8 : 5 }, (_, i) => (
            <Skeleton key={i} className="h-[26px]" />
          ))}
        </div>
      </DashCard>
    );
  }

  if (state === "empty" || !model || model.rows.length === 0) {
    return (
      <DashCard labelledBy="pagesTitle" className={cardClass}>
        {head}
        <EmptyBlock className={cn(fill && "flex-1")}>
          Hội thoại, đơn chốt và điểm QA của từng page sẽ hiện ở đây khi có hoạt động trong kỳ.
        </EmptyBlock>
      </DashCard>
    );
  }

  return (
    <DashCard labelledBy="pagesTitle" className={cn(cardClass, "@container")}>
      {head}
      <div ref={boxRef} className={cn("px-2 pb-3 pt-2", fill ? "min-h-0 flex-1 overflow-hidden" : "overflow-x-auto")}>
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className={cn(TH, "w-full text-left")}>Page</th>
              <th className={cn(TH, "text-right")}>Hội thoại</th>
              <th className={cn(TH, "text-right @max-[420px]:hidden")}>Đơn</th>
              <th className={cn(TH, "text-right")}>Doanh thu</th>
              <th className={cn(TH, "text-right")}>Điểm QA</th>
            </tr>
          </thead>
          <tbody>
            {model.rows.slice(0, visible).map((r) => {
              const st = r.status ? STATUS_META[r.status] : null;
              return (
                <tr key={r.page.pageId} className="border-b border-slate-100 last:border-0">
                  <td className="max-w-0 px-2.5 py-2.5">
                    <span className="flex min-w-0 items-center gap-[7px] font-medium text-slate-800" title={r.page.pageName}>
                      <PlatformIcon platform={r.page.platform} />
                      <span className="truncate">{r.page.pageName}</span>
                    </span>
                  </td>
                  <td className={cn(TD, "text-right text-slate-700")}>{fmt(r.conversations)}</td>
                  <td className={cn(TD, "text-right @max-[420px]:hidden", r.orders ? "text-slate-700" : "text-slate-500")}>{fmt(r.orders)}</td>
                  <td
                    className={cn(TD, "text-right", r.revenue ? "font-semibold text-slate-900" : "text-slate-500")}
                    title={money(r.revenue)}
                  >
                    {moneyShort(r.revenue)}
                  </td>
                  <td className={cn(TD, "text-right")}>
                    {st && r.avg != null && r.status ? (
                      <Link
                        to={qualityLink(r.page.pageId)}
                        title={`${st.label} · ${fmt(r.page.audits)} audit`}
                        className={cn(
                          "inline-flex h-6 items-center gap-1 rounded-[7px] px-2 text-[12px] font-bold hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
                          st.chip,
                        )}
                      >
                        <StatusIcon status={r.status} />
                        {f1(r.avg)}
                      </Link>
                    ) : (
                      <span className="text-[12px] text-slate-500">Chưa chấm</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {model.active > visible ? (
        <p className="mt-auto px-[18px] pb-3.5 text-[11.5px] text-slate-500">
          Và {fmt(model.active - visible)} page khác có hoạt động trong kỳ.
        </p>
      ) : null}
    </DashCard>
  );
}
