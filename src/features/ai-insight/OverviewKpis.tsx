import { ChatsCircle, Clock, Info, Minus, ShoppingCartSimple, Timer, TrendDown, TrendUp } from "@phosphor-icons/react";
import { type ReactNode, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { DashCard, Skeleton } from "@/features/dashboard/DashboardParts";
import type { AiInsightReport } from "./api";
import { f1, fmt, hoursText } from "./InsightParts";

type Tone = "good" | "bad" | "flat";

const WINDOW_TICKS = [0, 4, 8, 12, 16, 20, 24];

const META: Array<{ label: string; icon: ReactNode }> = [
  { label: "Khách nhắn tin", icon: <ChatsCircle weight="duotone" /> },
  { label: "Khách muốn mua", icon: <ShoppingCartSimple weight="duotone" /> },
  { label: "Bao lâu thì khách muốn mua", icon: <Timer weight="duotone" /> },
  { label: "Giờ khách nhắn nhiều nhất", icon: <Clock weight="duotone" /> },
];

function Delta({ text, tone, up }: { text: string | null; tone: Tone; up: boolean }) {
  if (!text) return <div className="mt-1 text-[12px] text-slate-500">Chưa có tuần trước để so sánh</div>;
  const color = tone === "good" ? "text-green-700" : tone === "bad" ? "text-red-700" : "text-slate-600";
  const Icon = tone === "flat" ? Minus : up ? TrendUp : TrendDown;
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[12px] text-slate-500">
      <b className={cn("inline-flex items-center gap-[3px] font-semibold tabular-nums", color)}>
        <Icon size={13} weight="bold" />
        {text}
      </b>
      so với tuần trước
    </div>
  );
}

function CompareBars({ cur, prev, show }: { cur: number | null; prev: number | null; show: (v: number) => string }) {
  const max = Math.max(cur ?? 0, prev ?? 0) || 1;
  const rows: Array<{ label: string; v: number | null; now: boolean }> = [
    { label: "Tuần này", v: cur, now: true },
    { label: "Tuần trước", v: prev, now: false },
  ];
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1 @max-[270px]:grid-cols-[minmax(0,1fr)_auto]">
          <span className={cn("whitespace-nowrap text-[11.5px]", r.now ? "font-semibold text-slate-700" : "text-slate-500")}>{r.label}</span>
          <span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-slate-100 @max-[270px]:col-span-2 @max-[270px]:row-start-2">
            {r.v != null ? (
              <span className={cn("block h-full rounded-full", r.now ? "bg-indigo-600" : "bg-slate-300")} style={{ width: `${Math.max(2, (r.v / max) * 100)}%` }} />
            ) : null}
          </span>
          <span
            className={cn(
              "min-w-[48px] whitespace-nowrap text-right tabular-nums @max-[270px]:col-start-2 @max-[270px]:row-start-1",
              r.now ? "text-[12.5px] font-semibold text-slate-900" : "text-[12px] font-medium text-slate-600",
            )}
          >
            {r.v == null ? "—" : show(r.v)}
          </span>
        </div>
      ))}
    </div>
  );
}

function HourStrip({ shares, peakStart }: { shares: number[]; peakStart: number }) {
  const max = Math.max(...shares, 0) || 1;
  return (
    <div>
      <div
        role="img"
        aria-label={`Tỷ lệ tin nhắn theo khung giờ: ${shares.map((s, i) => `${i * 4}–${i * 4 + 4}h ${f1(s)}%`).join(", ")}`}
        className="flex h-8 gap-0.5"
      >
        {shares.map((s, i) => {
          const peak = i * 4 === peakStart;
          return (
            <div
              key={i}
              title={`${i * 4}–${i * 4 + 4}h: ${f1(s)}% tin nhắn`}
              className={cn(
                "grid min-w-0 flex-1 place-items-center text-[11px] font-semibold tabular-nums first:rounded-l-md last:rounded-r-md",
                peak ? "bg-indigo-600 text-white" : "text-indigo-950",
              )}
              style={peak ? undefined : { background: `color-mix(in oklab, #a5b4fc ${Math.round((s / max) * 100)}%, #eef2ff)` }}
            >
              <span className="@max-[200px]:hidden">{fmt(s)}%</span>
            </div>
          );
        })}
      </div>
      <div className="relative mt-1.5 h-[14px] text-[11px] text-slate-500">
        {WINDOW_TICKS.map((h) => (
          <span
            key={h}
            className={cn(
              "absolute tabular-nums",
              h === 0 ? "left-0" : h === 24 ? "right-0" : "-translate-x-1/2",
              h === peakStart || h === peakStart + 4 ? "font-semibold text-slate-700" : h % 12 !== 0 && "@max-[270px]:hidden",
            )}
            style={h === 0 || h === 24 ? undefined : { left: `${(h / 24) * 100}%` }}
          >
            {h}h
          </span>
        ))}
      </div>
    </div>
  );
}

function InfoTip({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button
        type="button"
        aria-label="Giải thích chỉ số"
        aria-describedby={open ? id : undefined}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500"
      >
        <Info size={14} weight="bold" />
      </button>
      {open ? (
        <div
          id={id}
          role="tooltip"
          className="absolute left-[18px] right-[18px] top-[42px] z-20 rounded-lg bg-slate-900 px-3 py-2.5 text-[12px] leading-[1.5] text-slate-100 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.4)] [&_b]:font-semibold [&_b]:text-white"
        >
          {children}
        </div>
      ) : null}
    </>
  );
}

function KpiFrame({ meta, info, children }: { meta: (typeof META)[number]; info?: ReactNode; children: ReactNode }) {
  return (
    <DashCard className="@container relative flex min-h-[176px] flex-col px-[18px] pb-4 pt-4 max-[560px]:px-3.5 max-[560px]:pt-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1">
          <span className="text-[13px] font-medium leading-snug text-slate-600">{meta.label}</span>
          {info ? <InfoTip>{info}</InfoTip> : null}
        </div>
        <span className="-mr-0.5 -mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-indigo-50 text-[20px] text-indigo-600 max-[560px]:hidden @max-[270px]:hidden">
          {meta.icon}
        </span>
      </div>
      {children}
    </DashCard>
  );
}

function KpiCard({ meta, info, value, unit, delta, chart }: { meta: (typeof META)[number]; info: ReactNode; value: string; unit: string; delta: ReactNode; chart: ReactNode }) {
  return (
    <KpiFrame meta={meta} info={info}>
      <div className="-mt-1.5 text-[27px] font-bold leading-[1.15] tracking-[-0.02em] text-slate-900 max-[1280px]:text-[24px] max-[560px]:mt-0.5 max-[560px]:text-[22px] @max-[270px]:mt-0.5">
        {value}
        {unit ? <small className="ml-[5px] text-[14px] font-medium tracking-normal text-slate-500">{unit}</small> : null}
      </div>
      {delta}
      <div className="mt-auto pt-5">{chart}</div>
    </KpiFrame>
  );
}

function pctDelta(cur: number, prev: number | null): { text: string | null; up: boolean; diff: number } {
  if (prev == null || prev <= 0) return { text: null, up: true, diff: 0 };
  const diff = ((cur - prev) / prev) * 100;
  return { text: `${diff >= 0 ? "+" : "−"}${f1(Math.abs(diff))}%`, up: diff >= 0, diff };
}

function toneOf(diff: number, goodWhenUp: boolean, flatBelow = 0.05): Tone {
  if (Math.abs(diff) < flatBelow) return "flat";
  return diff > 0 === goodWhenUp ? "good" : "bad";
}

export function OverviewKpis({ report, loading }: { report: AiInsightReport | null; loading: boolean }) {
  if (loading || !report) {
    return (
      <div className="grid grid-cols-4 gap-4 max-[1180px]:grid-cols-2 max-[560px]:gap-2.5">
        {META.map((m) => (
          <KpiFrame key={m.label} meta={m}>
            {loading ? (
              <>
                <Skeleton className="mt-0.5 h-7 w-[110px]" />
                <Skeleton className="mt-2 h-3 w-[150px]" />
                <Skeleton className="mt-auto h-11 w-full" />
              </>
            ) : (
              <>
                <div className="-mt-1.5 text-[27px] font-bold text-slate-900">—</div>
                <div className="mt-1 text-[12px] text-slate-500">Chưa có số liệu cho tuần này</div>
              </>
            )}
          </KpiFrame>
        ))}
      </div>
    );
  }

  const { customers, buyers, signalHours, peakWindow } = report.kpis;
  const cd = pctDelta(customers.value, customers.prev);
  const bd = pctDelta(buyers.value, buyers.prev);
  const hd = signalHours.value != null && signalHours.prev != null ? signalHours.value - signalHours.prev : null;
  const hdMin = hd == null ? null : Math.round(hd * 60);
  const hoursValue = signalHours.value;
  const hoursParts = hoursValue == null ? ["—", ""] : hoursValue < 1 ? [fmt(hoursValue * 60), "phút"] : [f1(hoursValue), "giờ"];
  const windowTotals = Array.from({ length: 6 }, (_, w) => report.heat.inbound.reduce((s, row) => s + (row[2 * w] ?? 0) + (row[2 * w + 1] ?? 0), 0));
  const inboundTotal = windowTotals.reduce((s, v) => s + v, 0) || 1;
  const retDiff = customers.returningDiff;

  return (
    <div className="grid grid-cols-4 gap-4 max-[1180px]:grid-cols-2 max-[560px]:gap-2.5">
      <KpiCard
        meta={META[0]}
        info={
          <>
            Mỗi khách là một người đã nhắn tin hoặc bình luận với page trong tuần. <b>{f1(customers.returningPct)}%</b> là khách cũ
            {retDiff != null ? ` (${retDiff >= 0 ? "tăng" : "giảm"} ${f1(Math.abs(retDiff))} điểm % so với tuần trước)` : ""}, <b>{f1(customers.fromAdPct)}%</b> bấm vào
            quảng cáo trong tuần.
          </>
        }
        value={fmt(customers.value)}
        unit="khách"
        delta={<Delta text={cd.text} up={cd.up} tone={toneOf(cd.diff, true)} />}
        chart={<CompareBars cur={customers.value} prev={customers.prev} show={fmt} />}
      />
      <KpiCard
        meta={META[1]}
        info={
          <>
            Khách đã hỏi cách đặt, gửi số điện thoại, địa chỉ hoặc chốt mẫu
            {buyers.ofInterestPct != null ? (
              <>
                , bằng <b>{f1(buyers.ofInterestPct)}%</b> số khách quan tâm sản phẩm
              </>
            ) : null}
            .
          </>
        }
        value={fmt(buyers.value)}
        unit="khách"
        delta={<Delta text={bd.text} up={bd.up} tone={toneOf(bd.diff, true)} />}
        chart={<CompareBars cur={buyers.value} prev={buyers.prev} show={fmt} />}
      />
      <KpiCard
        meta={META[2]}
        info={
          hoursValue == null ? (
            <>Chưa có khách muốn mua trong tuần.</>
          ) : (
            <>
              Một nửa số khách muốn mua chỉ cần dưới <b>{hoursText(hoursValue)}</b> kể từ tin nhắn đầu tiên trong tuần. Càng ngắn càng tốt.
            </>
          )
        }
        value={hoursParts[0]}
        unit={hoursParts[1]}
        delta={
          <Delta
            text={hd == null ? null : hdMin === 0 ? "Không đổi" : `${hd >= 0 ? "+" : "−"}${Math.abs(hd) < 1 ? `${Math.abs(hdMin!)} phút` : hoursText(Math.abs(hd))}`}
            up={(hd ?? 0) >= 0}
            tone={hd == null || hdMin === 0 ? "flat" : toneOf(hd, false, 0)}
          />
        }
        chart={<CompareBars cur={hoursValue} prev={signalHours.prev} show={(v) => hoursText(v)} />}
      />
      <KpiCard
        meta={META[3]}
        info={
          <>
            Khung 4 giờ có nhiều tin nhắn của khách nhất trong tuần
            {peakWindow.reply15 != null ? (
              <>
                ; <b>{f1(peakWindow.reply15)}%</b> số lần khách nhắn trong khung này được trả lời trong 15 phút
              </>
            ) : null}
            .
          </>
        }
        value={peakWindow.label}
        unit=""
        delta={
          <div className="mt-1 text-[12px] text-slate-500">
            Chiếm <b className="font-semibold text-slate-700">{f1(peakWindow.value)}%</b> tin nhắn của khách
          </div>
        }
        chart={<HourStrip shares={windowTotals.map((v) => (v / inboundTotal) * 100)} peakStart={peakWindow.start} />}
      />
    </div>
  );
}
