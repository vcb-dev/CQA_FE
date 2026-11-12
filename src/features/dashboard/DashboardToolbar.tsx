import { ArrowsClockwise, CaretDown, CheckCircle, CircleNotch, Clock, Funnel, Plugs, Warning } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Chip, type ChipTone, SeverityIcon } from "./DashboardParts";
import { PLATFORM_LABEL, type PlatformFilter } from "./dashboardModel";
import type { DashboardPeriodKey } from "./dashboardPeriod";

const PERIODS: Array<{ key: DashboardPeriodKey; label: string }> = [
  { key: "today", label: "Hôm nay" },
  { key: "7d", label: "7 ngày" },
  { key: "month", label: "Tháng này" },
];

export type Verdict =
  | { kind: "bad"; count: number }
  | { kind: "warn"; count: number }
  | { kind: "calm" }
  | { kind: "empty" }
  | null;

export type Freshness =
  | { kind: "fetching" }
  | { kind: "stale"; at: string }
  | { kind: "fresh"; at: string }
  | null;

function VerdictChip({ verdict }: { verdict: Verdict }) {
  if (!verdict) return null;
  const map: Record<string, { tone: ChipTone; icon: ReactNode; text: string }> = {
    bad: { tone: "bad", icon: <SeverityIcon severity="bad" />, text: verdict.kind === "bad" ? `Cần chú ý · ${verdict.count} nghiêm trọng` : "" },
    warn: { tone: "warn", icon: <SeverityIcon severity="warn" />, text: verdict.kind === "warn" ? `Cần theo dõi · ${verdict.count} việc` : "" },
    calm: { tone: "good", icon: <CheckCircle size={13} weight="bold" />, text: "Ổn định" },
    empty: { tone: "mute", icon: <Plugs size={13} weight="bold" />, text: "Chưa có dữ liệu" },
  };
  const v = map[verdict.kind];
  return (
    <span role="status">
      <Chip tone={v.tone} icon={v.icon}>
        {v.text}
      </Chip>
    </span>
  );
}

export function DashboardToolbar({
  periodKey,
  onPeriod,
  platform,
  platforms,
  onPlatform,
  rangeLabel,
  compareLabel,
  verdict,
  freshness,
  onRefresh,
}: {
  periodKey: DashboardPeriodKey;
  onPeriod: (k: DashboardPeriodKey) => void;
  platform: PlatformFilter;
  platforms: PlatformFilter[];
  onPlatform: (p: PlatformFilter) => void;
  rangeLabel: string;
  compareLabel: string;
  verdict: Verdict;
  freshness: Freshness;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div role="group" aria-label="Khoảng thời gian" className="inline-flex gap-0.5 rounded-[10px] bg-slate-200/70 p-[3px] max-[560px]:w-full">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            aria-pressed={periodKey === p.key}
            onClick={() => onPeriod(p.key)}
            className={cn(
              "h-[30px] rounded-lg px-3.5 text-[13px] font-medium transition-[background-color,color,box-shadow] max-[560px]:flex-1 max-[560px]:px-2",
              periodKey === p.key
                ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)]"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <label className="relative inline-flex items-center max-[560px]:w-full">
        <Funnel size={16} className="pointer-events-none absolute left-[11px] text-slate-500" />
        <select
          aria-label="Kênh"
          value={platform}
          onChange={(e) => onPlatform(e.target.value as PlatformFilter)}
          className="h-9 cursor-pointer appearance-none rounded-[10px] border border-slate-200 bg-white pl-[34px] pr-[34px] text-[13px] font-medium text-slate-700 hover:border-slate-300 max-[560px]:w-full"
        >
          {platforms.map((p) => (
            <option key={p} value={p}>
              {p === "all" ? "Tất cả kênh" : PLATFORM_LABEL[p]}
            </option>
          ))}
        </select>
        <CaretDown size={12} weight="bold" className="pointer-events-none absolute right-[11px] text-slate-500" />
      </label>
      <span className="text-[12.5px] text-slate-600 max-[760px]:order-3 max-[760px]:w-full">
        <b className="font-medium text-slate-700">{rangeLabel}</b> · so với {compareLabel}
      </span>
      <div className="ml-auto flex items-center gap-2 max-[760px]:ml-0 max-[760px]:w-full max-[760px]:flex-wrap">
        <VerdictChip verdict={verdict} />
        {freshness ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 text-[12px] max-[760px]:ml-auto",
              freshness.kind === "stale" ? "text-amber-700" : "text-slate-600",
            )}
          >
            {freshness.kind === "fetching" ? (
              <>
                <CircleNotch size={14} weight="bold" className="animate-spin motion-reduce:animate-none" />
                Đang cập nhật…
              </>
            ) : freshness.kind === "stale" ? (
              <>
                <Warning size={14} weight="bold" />
                Số liệu từ bản lưu {freshness.at}
              </>
            ) : (
              <>
                <Clock size={14} />
                Cập nhật {freshness.at}
              </>
            )}
          </span>
        ) : null}
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Làm mới số liệu"
          className="grid h-9 w-9 place-items-center rounded-[10px] border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
        >
          <ArrowsClockwise size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}
