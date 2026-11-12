import {
  ArrowRight,
  ChatCircleText,
  CheckCircle,
  Coins,
  Minus,
  Package,
  SealCheck,
  TrendDown,
  TrendUp,
  Warning,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Skeleton } from "./DashboardParts";
import {
  type NeedsReplyModel,
  PASS_SCORE,
  type PlatformSplit,
  f1,
  fmt,
  money,
  moneyParts,
} from "./dashboardModel";

export interface KpiData {
  partial: boolean;
  revenue: { value: number; prev: number; avgOrder: number | null };
  orders: { value: number; prev: number; split: PlatformSplit };
  conversations: { value: number; prev: number; needsReply: NeedsReplyModel };
  qa: { value: number | null; prev: number | null; pass: number | null; audits: number };
}

const SPLIT_COLORS = ["#4f46e5", "#eb6834", "#1baf7a", "#94a3b8"];

function Delta({
  cur,
  prev,
  kind,
  compareLabel,
  partial,
  prevText,
}: {
  cur: number | null;
  prev: number | null;
  kind: "pct" | "pt";
  compareLabel: string;
  partial?: boolean;
  prevText?: string;
}) {
  if (partial && prevText != null) {
    return (
      <div className="mt-1 text-[12px] text-slate-500">
        Hôm qua cả ngày: <b className="font-semibold tabular-nums text-slate-700">{prevText}</b>
      </div>
    );
  }
  if (cur == null || prev == null || (kind === "pct" && prev === 0)) {
    return <div className="mt-1 text-[12px] text-slate-500">Chưa đủ dữ liệu để so với {compareLabel}</div>;
  }
  const diff = kind === "pct" ? ((cur - prev) / prev) * 100 : cur - prev;
  const flat = Math.abs(diff) < 0.05;
  const up = diff > 0;
  const unit = kind === "pct" ? "%" : " điểm";
  const tone = flat ? "text-slate-600" : up ? "text-green-700" : "text-red-700";
  const Icon = flat ? Minus : up ? TrendUp : TrendDown;
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-slate-500">
      <b className={cn("inline-flex items-center gap-[3px] font-semibold", tone)}>
        <Icon size={13} weight="bold" />
        {flat ? "0" : `${up ? "+" : "−"}${f1(Math.abs(diff))}`}
        {unit}
      </b>
      <span>so với {compareLabel}</span>
    </div>
  );
}

function Tile({
  label,
  icon,
  children,
  footer,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <article className="flex min-h-[156px] min-w-0 flex-col overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_6px_-2px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-0.5 px-[18px] pb-3.5 pt-4 max-[560px]:px-3.5 max-[560px]:pt-3.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[13px] font-medium text-slate-600">{label}</span>
          <span className="-mr-0.5 -mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-indigo-50 text-[20px] text-indigo-600 max-[560px]:hidden">
            {icon}
          </span>
        </div>
        {children}
      </div>
      {footer ? (
        <div className="mt-auto border-t border-slate-100 px-[18px] pb-3.5 pt-3 max-[560px]:px-3.5">{footer}</div>
      ) : null}
    </article>
  );
}

function Value({ children, unit, title }: { children: ReactNode; unit?: string; title?: string }) {
  return (
    <div
      title={title}
      className="-mt-1.5 text-[27px] font-bold leading-[1.15] tracking-[-0.02em] tabular-nums text-slate-900 max-[1280px]:text-[24px] max-[560px]:mt-0.5 max-[560px]:text-[22px]"
    >
      {children}
      {unit ? (
        <small className="ml-[5px] text-[14px] font-medium tracking-normal text-slate-500 max-[560px]:ml-0 max-[560px]:mt-0.5 max-[560px]:block max-[560px]:text-[12px]">
          {unit}
        </small>
      ) : null}
    </div>
  );
}

function FootRow({ icon, label, children }: { icon?: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
      {icon}
      <span className="min-w-0 truncate">{label}</span>
      <span className="ml-auto whitespace-nowrap text-[12.5px] font-semibold tabular-nums text-slate-900">{children}</span>
    </div>
  );
}

function SplitBar({ split }: { split: PlatformSplit }) {
  const total = split.reduce((s, x) => s + x.count, 0);
  return (
    <div className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={split.map((s) => `${s.label} ${s.count}`).join(", ")}
        className="flex h-2 gap-0.5 overflow-hidden rounded-full"
      >
        {split.map((s, i) => (
          <span key={s.platform} style={{ width: `${(s.count / total) * 100}%`, background: SPLIT_COLORS[i] }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-slate-600">
        {split.map((s, i) => (
          <span key={s.platform} className="inline-flex items-center gap-[5px]">
            <i className="inline-block h-2 w-2 rounded-[2px]" style={{ background: SPLIT_COLORS[i] }} />
            {s.label} <b className="font-semibold tabular-nums text-slate-900">{fmt(s.count)}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

const TILES = [
  { label: "Doanh thu", icon: <Coins weight="duotone" /> },
  { label: "Đơn chốt", icon: <Package weight="duotone" /> },
  { label: "Hội thoại hoạt động", icon: <ChatCircleText weight="duotone" /> },
  { label: "Chất lượng CSKH", icon: <SealCheck weight="duotone" /> },
];

export function KpiRow({
  data,
  loading,
  failed,
  compareLabel,
}: {
  data: KpiData | null;
  loading: boolean;
  failed: boolean;
  compareLabel: string;
}) {
  const grid = "grid grid-cols-4 gap-4 max-[1180px]:grid-cols-2 max-[560px]:gap-2.5";

  if (loading || !data) {
    return (
      <section aria-label="Chỉ số chính" className={grid}>
        {TILES.map((t) => (
          <Tile key={t.label} label={t.label} icon={t.icon}>
            {failed ? (
              <>
                <Value>—</Value>
                <div className="mt-1 text-[12px] text-slate-500">Không tải được số liệu</div>
              </>
            ) : (
              <>
                <Skeleton className="mt-1.5 h-7 w-[110px]" />
                <Skeleton className="mt-2 h-3 w-[150px]" />
              </>
            )}
          </Tile>
        ))}
      </section>
    );
  }

  const { revenue, orders, conversations, qa, partial } = data;
  const rev = moneyParts(revenue.value);
  const nr = conversations.needsReply;

  return (
    <section aria-label="Chỉ số chính" className={grid}>
      <Tile
        label={TILES[0].label}
        icon={TILES[0].icon}
        footer={
          <FootRow label="Giá trị đơn trung bình">{revenue.avgOrder != null ? money(revenue.avgOrder) : "—"}</FootRow>
        }
      >
        <Value unit={rev.unit} title={money(revenue.value)}>
          {rev.value}
        </Value>
        <Delta
          cur={revenue.value}
          prev={revenue.prev}
          kind="pct"
          compareLabel={compareLabel}
          partial={partial}
          prevText={money(revenue.prev)}
        />
      </Tile>

      <Tile
        label={TILES[1].label}
        icon={TILES[1].icon}
        footer={
          orders.split.length > 0 ? (
            <SplitBar split={orders.split} />
          ) : (
            <p className="text-[12px] text-slate-500">Chưa có đơn tạo từ hội thoại trong kỳ</p>
          )
        }
      >
        <Value unit="đơn">{fmt(orders.value)}</Value>
        <Delta
          cur={orders.value}
          prev={orders.prev}
          kind="pct"
          compareLabel={compareLabel}
          partial={partial}
          prevText={`${fmt(orders.prev)} đơn`}
        />
      </Tile>

      <Tile
        label={TILES[2].label}
        icon={TILES[2].icon}
        footer={
          nr.total > 0 ? (
            <Link
              to="/conversations?filter=unreplied"
              className="group -mx-1.5 -my-1 block rounded-md px-1.5 py-1 hover:bg-amber-50/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500"
            >
              <FootRow icon={<Warning size={14} weight="bold" className="shrink-0 text-amber-600" />} label="Đang chờ phản hồi">
                <span className="text-amber-700">{fmt(nr.total)}</span>
                {nr.share != null ? <span className="ml-1 font-medium text-slate-500">· {f1(nr.share)}%</span> : null}
                <ArrowRight size={12} weight="bold" className="ml-1 inline-block text-slate-500 transition-transform group-hover:translate-x-0.5" />
              </FootRow>
            </Link>
          ) : (
            <FootRow icon={<CheckCircle size={14} weight="bold" className="shrink-0 text-green-600" />} label="Không còn hội thoại chờ phản hồi">
              0
            </FootRow>
          )
        }
      >
        <Value>{fmt(conversations.value)}</Value>
        <Delta
          cur={conversations.value}
          prev={conversations.prev}
          kind="pct"
          compareLabel={compareLabel}
          partial={partial}
          prevText={fmt(conversations.prev)}
        />
      </Tile>

      <Tile
        label={TILES[3].label}
        icon={TILES[3].icon}
        footer={
          <FootRow label={`Audit đạt ngưỡng ${PASS_SCORE}`}>
            {qa.pass != null ? `${f1(qa.pass)}%` : "—"}
            <span className="ml-1 font-medium text-slate-500">· {fmt(qa.audits)} audit</span>
          </FootRow>
        }
      >
        <Value unit="/ 100">{qa.value != null ? f1(qa.value) : "—"}</Value>
        <Delta cur={qa.value} prev={qa.prev} kind="pt" compareLabel={compareLabel} />
      </Tile>
    </section>
  );
}
