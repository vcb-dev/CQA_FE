import { ArrowRight, CheckCircle, HourglassMedium, Lightbulb, Warning } from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CardHead, CardLink, Chip, DashCard, EmptyBlock, Skeleton } from "@/features/dashboard/DashboardParts";
import type { AiInsightReport, TopicDetail, TopicItem } from "./api";
import { Bar, Callout, f1, fmt, Highlighted, Mark, TickLegend, TrendTag, useSignal } from "./InsightParts";

function LoadingCard({ id, title, rows }: { id: string; title: string; rows: number }) {
  return (
    <DashCard labelledBy={id}>
      <CardHead id={id} title={title} />
      <div className="flex flex-col gap-3 px-[18px] py-4">
        {Array.from({ length: rows }, (_, i) => (
          <Skeleton key={i} className="h-[22px]" />
        ))}
      </div>
    </DashCard>
  );
}

function rateTone(rate: number | null, avg: number | null) {
  if (rate == null || avg == null) return "text-slate-500";
  return rate >= avg ? "text-green-700" : "text-amber-700";
}

function TopicRow({ item, base, max, avg, selected, onSelect }: { item: TopicItem; base: number; max: number; avg: number | null; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      id={`aii-topic-tab-${item.key}`}
      aria-selected={selected}
      aria-controls="aii-topic-panel"
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      className={cn(
        "relative grid w-full grid-cols-[minmax(0,1fr)_50px_58px] items-center gap-x-3 gap-y-1.5 rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-indigo-500",
        selected ? "bg-indigo-50" : "hover:bg-slate-50",
      )}
    >
      {selected ? <span aria-hidden="true" className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-indigo-600" /> : null}
      <span className="col-start-1 row-start-1 flex min-w-0 items-center gap-2 text-[13px] font-medium text-slate-800">
        <span className="truncate">{item.label}</span>
        {item.key === "other" ? null : <TrendTag value={item.change} tone="mute" />}
      </span>
      <span className="col-start-1 row-start-2">
        <Bar value={item.convs} max={max} color={selected ? "#4f46e5" : "#a5b4fc"} />
      </span>
      <span className="col-start-2 row-span-2 row-start-1 text-right text-[13px] font-semibold leading-tight tabular-nums text-slate-900">
        {base ? Math.round((item.convs / base) * 100) : 0}%<small className="block text-[11px] font-medium text-slate-500">{fmt(item.convs)}</small>
      </span>
      <span className={cn("col-start-3 row-span-2 row-start-1 text-right text-[13px] font-semibold tabular-nums", rateTone(item.rate, avg))}>
        {item.rate == null ? "—" : `${f1(item.rate)}%`}
      </span>
    </button>
  );
}

function DetailRow({ detail, max, avg, onOpen }: { detail: TopicDetail; max: number; avg: number | null; onOpen: (d: TopicDetail, el: HTMLButtonElement) => void }) {
  const ex = detail.example;
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_50px_58px] items-center gap-x-3 gap-y-1.5 border-b border-slate-100 py-3 last:border-b-0">
      <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-2 text-[13px] font-medium text-slate-800">
        <span className="min-w-0">{detail.label}</span>
        <TrendTag value={detail.change} tone="mute" />
      </div>
      <div className="col-start-1 row-start-2">
        <Bar value={detail.convs} max={max} color="#4f46e5" />
      </div>
      <div className="col-start-2 row-span-2 row-start-1 text-right text-[13px] font-semibold leading-tight tabular-nums text-slate-900">
        {Math.round(detail.share)}%<small className="block text-[11px] font-medium text-slate-500">{fmt(detail.convs)}</small>
      </div>
      <div className={cn("col-start-3 row-span-2 row-start-1 text-right text-[13px] font-semibold tabular-nums", rateTone(detail.rate, avg))}>
        {detail.rate == null ? "—" : `${f1(detail.rate)}%`}
      </div>
      {ex ? (
        <div className="col-span-3 row-start-3 flex min-w-0 items-start gap-3 rounded-md bg-slate-50 px-2.5 py-1.5 text-[12px] leading-[1.5] text-slate-600">
          <blockquote className="line-clamp-2 min-w-0 flex-1">
            “<Highlighted text={ex.text} start={ex.hitStart} length={ex.hitLength} />”
          </blockquote>
          <button
            type="button"
            onClick={(e) => onOpen(detail, e.currentTarget)}
            aria-label={`Đọc đoạn chat ví dụ cho: ${detail.label}`}
            className="group inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            Đọc chat
            <ArrowRight size={12} weight="bold" className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </div>
      ) : null}
    </li>
  );
}

const DETAILS_SHOWN = 6;

export function TopicsCard({ report, loading, onOpen }: { report: AiInsightReport | null; loading: boolean; onOpen: (d: TopicDetail, el: HTMLButtonElement) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  if (loading || !report) return <LoadingCard id="aii-topic-title" title="Khách hỏi gì" rows={6} />;
  const t = report.topics;
  const maxConvs = Math.max(1, ...t.items.map((i) => i.convs));
  const named = t.items.filter((i) => ["material", "stock", "size"].includes(i.key) && i.rate != null && i.convs >= 30);
  const best = [...named].sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0))[0];
  const price = t.items.find((i) => i.key === "price");
  const ratio = best && price && best.key !== "price" && price.rate ? (best.rate ?? 0) / price.rate : null;
  const selected = t.items.find((i) => i.key === picked) ?? t.items[0];
  const details = selected?.details ?? [];
  const maxDetail = Math.max(1, ...details.map((d) => d.convs));
  const hidden = Math.max(0, details.length - DETAILS_SHOWN);
  const shown = expanded ? details : details.slice(0, DETAILS_SHOWN);
  const select = (key: string, focus = false) => {
    setPicked(key);
    setExpanded(false);
    if (focus) requestAnimationFrame(() => document.getElementById(`aii-topic-tab-${key}`)?.focus());
  };

  return (
    <DashCard className="flex flex-col" labelledBy="aii-topic-title">
      <CardHead
        id="aii-topic-title"
        title="Khách hỏi gì"
        subtitle="Chọn một chủ đề để xem cụ thể khách hỏi gì, kèm câu nhắn thật của khách"
      />
      <div className="grid grid-cols-[minmax(320px,5fr)_minmax(0,7fr)] gap-x-5 px-[18px] pb-4 pt-3 max-[900px]:grid-cols-1 max-[900px]:gap-y-4">
        <div className="flex min-w-0 flex-col">
          <div className="grid grid-cols-[minmax(0,1fr)_50px_58px] gap-x-3 px-3 pb-1.5 text-[11px] font-medium text-slate-500">
            <span>Chủ đề{report.compareLabel ? " · so với tuần trước" : ""}</span>
            <span className="text-right">Chiếm</span>
            <span className="text-right">Muốn mua</span>
          </div>
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label="Chủ đề khách hỏi"
            className="flex flex-col gap-0.5 pb-3"
            onKeyDown={(e) => {
              if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
              e.preventDefault();
              const i = t.items.findIndex((x) => x.key === selected?.key);
              const next = t.items[(i + (e.key === "ArrowDown" ? 1 : t.items.length - 1)) % t.items.length];
              if (next) select(next.key, true);
            }}
          >
            {t.items.map((i) => (
              <TopicRow key={i.key} item={i} base={t.base} max={maxConvs} avg={t.avgRate} selected={i.key === selected?.key} onSelect={() => select(i.key)} />
            ))}
          </div>
          {ratio != null && ratio >= 1.5 ? (
            <Callout
              tone="info"
              icon={<Lightbulb weight="duotone" />}
              title={`Khách hỏi ${best.label.toLowerCase()} muốn mua nhiều gấp ${f1(ratio)} lần khách hỏi giá`}
              className="mx-0 mb-0 mt-auto"
            >
              Báo luôn {best.label.toLowerCase()} trong tin báo giá để giữ chân khách hỏi giá
            </Callout>
          ) : (
            <Callout tone="info" icon={<Lightbulb weight="duotone" />} title={`Trung bình ${f1(t.avgRate)}% khách nhắn chữ muốn mua`} className="mx-0 mb-0 mt-auto">
              Số màu xanh: cao hơn mức này; màu cam: thấp hơn
            </Callout>
          )}
        </div>

        <section
          id="aii-topic-panel"
          role="tabpanel"
          aria-labelledby={selected ? `aii-topic-tab-${selected.key}` : undefined}
          className="flex min-w-0 flex-col border-l border-slate-100 pl-5 max-[900px]:border-l-0 max-[900px]:border-t max-[900px]:pl-0 max-[900px]:pt-4"
        >
          {selected ? (
            <>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h3 className="text-[14px] font-semibold text-slate-900">Cụ thể khách {selected.key === "other" ? "nhắn gì" : `hỏi gì về ${selected.label.toLowerCase()}`}</h3>
                <span className="text-[12px] text-slate-500">
                  {fmt(selected.convs)} khách · {selected.rate == null ? "—" : `${f1(selected.rate)}%`} muốn mua
                </span>
              </div>
              <p className="mt-0.5 text-[11.5px] text-slate-500">% tính trên số khách của chủ đề này; một khách có thể hỏi nhiều ý nên tổng có thể vượt 100%</p>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)_50px_58px] gap-x-3 pb-1 text-[11px] font-medium text-slate-500">
                <span>Khách hỏi cụ thể</span>
                <span className="text-right">Chiếm</span>
                <span className="text-right">Muốn mua</span>
              </div>
              {details.length ? (
                <>
                  <ul className="flex list-none flex-col">
                    {shown.map((d) => (
                      <DetailRow key={d.key} detail={d} max={maxDetail} avg={t.avgRate} onOpen={onOpen} />
                    ))}
                  </ul>
                  {hidden ? (
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setExpanded((v) => !v)}
                      className="mt-2 self-start rounded-md text-[12.5px] font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    >
                      {expanded ? "Thu gọn" : `Xem thêm ${hidden} ý khác`}
                    </button>
                  ) : null}
                </>
              ) : (
                <p className="py-6 text-center text-[12.5px] text-slate-500">Chưa có chi tiết cho chủ đề này trong tuần.</p>
              )}
            </>
          ) : null}
        </section>
      </div>
    </DashCard>
  );
}

export function DecisionCard({ report, loading }: { report: AiInsightReport | null; loading: boolean }) {
  if (loading || !report) return <LoadingCard id="aii-dec-title" title="Bao lâu thì khách muốn mua" rows={5} />;
  const d = report.decision;
  const maxShare = Math.max(30, ...d.buckets.map((b) => Math.max(b.share, b.prevShare ?? 0))) * 1.05;
  return (
    <DashCard className="flex flex-col" labelledBy="aii-dec-title">
      <CardHead
        id="aii-dec-title"
        title="Bao lâu thì khách muốn mua"
        subtitle="Tính từ tin nhắn đầu tiên trong tuần đến lúc khách hỏi cách đặt hoặc chốt mẫu · % trên số khách muốn mua"
      />
      <ul className="flex flex-1 list-none flex-col px-[18px] pb-1 pt-3.5">
        {d.buckets.map((b, i) => (
          <li key={b.label} className="grid flex-1 grid-cols-[70px_minmax(0,1fr)_50px] content-center items-center gap-2.5 py-[7px]">
            <span className="whitespace-nowrap text-[12.5px] font-medium text-slate-700">{b.label}</span>
            <div role="img" aria-label={`${b.label}: ${f1(b.share)}% khách${b.prevShare != null ? `, tuần trước ${f1(b.prevShare)}%` : ""}`}>
              <Bar value={b.share} max={maxShare} tick={b.prevShare} color={i >= 3 ? "#eda100" : "#4f46e5"} height={12} />
            </div>
            <b className="text-right text-[13px] font-semibold tabular-nums text-slate-900">{f1(b.share)}%</b>
          </li>
        ))}
      </ul>
      {report.compareLabel ? <TickLegend>Vạch dọc: tuần {report.compareLabel}</TickLegend> : null}
      <div className="mx-[18px] mb-4 grid grid-cols-2 overflow-hidden rounded-[10px] border border-slate-200 max-[560px]:grid-cols-1">
        <div className="min-w-0 border-r border-slate-200 px-3 py-2.5 max-[560px]:border-b max-[560px]:border-r-0">
          <span className="block text-[11.5px] text-slate-500">Thường nhắn trước khi muốn mua</span>
          <b className="mt-0.5 block text-[14px] font-bold tabular-nums text-slate-900">
            {d.medianMessages == null ? "—" : fmt(d.medianMessages)}
            <small className="ml-[3px] text-[11.5px] font-medium text-slate-500">tin</small>
          </b>
        </div>
        <div className="min-w-0 px-3 py-2.5">
          <span className="block text-[11.5px] text-slate-500">Nhắn tiếp sau tin báo giá</span>
          <b className="mt-0.5 block text-[14px] font-bold tabular-nums text-slate-900">
            {d.repliedAfterQuotePct == null ? "—" : `${Math.round(d.repliedAfterQuotePct)}%`}
            <small className="ml-[3px] text-[11.5px] font-medium text-slate-500">khách được báo giá</small>
          </b>
        </div>
      </div>
      {d.lateChangePct != null && Math.abs(d.lateChangePct) >= 10 ? (
        <Callout
          tone={d.lateChangePct > 0 ? "warn" : "info"}
          icon={<HourglassMedium weight="duotone" />}
          title={`Khách cần hơn 1 ngày mới muốn mua ${d.lateChangePct > 0 ? "tăng" : "giảm"} ${Math.abs(d.lateChangePct)}%`}
          className="mt-0"
        >
          {d.lateChangePct > 0 ? "Khách cân nhắc lâu hơn tuần trước; nhắn lại sau 24 giờ cho khách đang cân nhắc" : "Khách quyết định nhanh hơn tuần trước"}
        </Callout>
      ) : null}
    </DashCard>
  );
}

export function ProductsCard({ report, loading }: { report: AiInsightReport | null; loading: boolean }) {
  const lowSignal = useSignal((s) => s.kind.startsWith("product:"));
  if (loading || !report) return <LoadingCard id="aii-product-title" title="Sản phẩm: từ quan tâm đến muốn mua" rows={5} />;
  const p = report.products;
  const avg = p.avgRate ?? 0;
  const max = Math.max(20, ...p.items.map((i) => i.rate)) * 1.15;
  const above = p.items.filter((i) => i.rate >= avg).length;
  return (
    <DashCard className="flex flex-col" labelledBy="aii-product-title">
      <CardHead
        id="aii-product-title"
        title="Sản phẩm: từ quan tâm đến muốn mua"
        subtitle="5 sản phẩm được hỏi nhiều nhất và % khách hỏi về sản phẩm đó muốn mua"
        right={<CardLink to="/products">Sản phẩm</CardLink>}
      />
      {p.items.length ? (
        <>
          <div className="flex flex-wrap gap-1.5 px-[18px] pb-0.5 pt-3">
            <Chip tone="good" icon={<CheckCircle size={13} weight="bold" />}>
              {above} trên trung bình
            </Chip>
            <Chip tone="warn" icon={<Warning size={13} weight="bold" />}>
              {p.items.length - above} dưới trung bình
            </Chip>
          </div>
          <ul className="flex flex-1 list-none flex-col px-[18px] pb-2.5 pt-1.5">
            {p.items.map((i) => {
              const good = i.rate >= avg;
              const mark = lowSignal && lowSignal.kind === `product:${i.key}` ? lowSignal : undefined;
              return (
                <li key={i.key} className="grid flex-1 grid-cols-[minmax(0,1fr)_auto] content-center items-center gap-x-2.5 gap-y-1.5 border-b border-slate-100 py-2.5 last:border-b-0">
                  <div className="flex min-w-0 items-center gap-[7px] text-[13px] font-medium text-slate-800">
                    <Mark signal={mark} small />
                    <span className="truncate">{i.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13.5px] font-bold tabular-nums text-slate-900">
                    <span className={cn("inline-flex items-center gap-[3px] text-[11.5px] font-semibold", good ? "text-green-700" : "text-amber-700")}>
                      {good ? <CheckCircle size={12} weight="bold" /> : <Warning size={12} weight="bold" />}
                      {good ? "Tốt" : "Thấp"}
                    </span>
                    {f1(i.rate)}%
                  </div>
                  <div className="col-span-2" role="img" aria-label={`${f1(i.rate)}% khách hỏi muốn mua, trung bình ${f1(avg)}%`}>
                    <Bar value={i.rate} max={max} tick={avg} color={good ? "#16a34a" : "#d97706"} />
                  </div>
                  <div className="col-span-2 text-[11.5px] tabular-nums text-slate-500">
                    {fmt(i.convs)} khách hỏi · {fmt(i.signal)} muốn mua
                  </div>
                </li>
              );
            })}
          </ul>
          <TickLegend>Vạch dọc: trung bình {f1(avg)}% của 5 sản phẩm</TickLegend>
        </>
      ) : (
        <EmptyBlock title="Chưa nhận ra sản phẩm nào">Khách chưa nhắc tới tên sản phẩm có trong danh mục hoặc trong tên quảng cáo.</EmptyBlock>
      )}
    </DashCard>
  );
}
