import { FacebookLogo, InstagramLogo, MessengerLogo, TrendDown, TrendUp } from "@phosphor-icons/react";
import { createContext, type ReactNode, useContext } from "react";
import { cn } from "@/lib/utils";
import type { InsightSignal, Severity } from "./api";

export function ChannelIcon({ kind, size = 15, className }: { kind: string; size?: number; className?: string }) {
  const cls = cn("shrink-0", className);
  if (kind === "fb_comment") return <FacebookLogo size={size} className={cls} />;
  if (kind === "ig_comment") return <InstagramLogo size={size} className={cls} />;
  return <MessengerLogo size={size} className={cls} />;
}

export function channelName(kind: string) {
  if (kind === "fb_comment") return "Facebook";
  if (kind === "ig_comment") return "Instagram";
  return "Messenger";
}

export function Highlighted({ text, start, length }: { text: string; start: number; length: number }) {
  if (start < 0 || length <= 0 || start + length > text.length) return <>{text}</>;
  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded bg-amber-100 px-[3px] text-amber-900">{text.slice(start, start + length)}</mark>
      {text.slice(start + length)}
    </>
  );
}

const nf = new Intl.NumberFormat("vi-VN");

export const fmt = (n: number | null | undefined) => (n == null ? "—" : nf.format(Math.round(n)));

export const f1 = (n: number | null | undefined) =>
  n == null ? "—" : n.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const pctText = (n: number | null | undefined) => (n == null ? "—" : `${f1(n)}%`);

export function hoursText(h: number | null | undefined): string {
  if (h == null) return "—";
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} phút`;
  if (h < 48) return `${f1(h)} giờ`;
  return `${f1(h / 24)} ngày`;
}

export function minutesText(m: number | null | undefined): string {
  if (m == null) return "—";
  if (m < 1) return "dưới 1 phút";
  if (m < 90) return `${Math.round(m)} phút`;
  return `${f1(m / 60)} giờ`;
}

export function vnDateTime(iso: string): string {
  const d = new Date(new Date(iso).getTime() + 7 * 3_600_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

const MARK_BG: Record<Severity, string> = {
  bad: "bg-red-600",
  warn: "bg-amber-700",
  watch: "bg-indigo-600",
};

const MARK_RING: Record<Severity, string> = {
  bad: "shadow-[0_0_0_2px_#fff,0_0_0_5px_rgba(220,38,38,0.28)]",
  warn: "shadow-[0_0_0_2px_#fff,0_0_0_5px_rgba(180,83,9,0.28)]",
  watch: "shadow-[0_0_0_2px_#fff,0_0_0_5px_rgba(79,70,229,0.28)]",
};

type MarkContextValue = {
  signals: InsightSignal[];
  lit: number | null;
  setLit: (n: number | null) => void;
  jump: (n: number) => void;
};

export const MarkContext = createContext<MarkContextValue>({
  signals: [],
  lit: null,
  setLit: () => undefined,
  jump: () => undefined,
});

export function useSignal(match: (s: InsightSignal) => boolean): InsightSignal | undefined {
  const { signals } = useContext(MarkContext);
  return signals.find(match);
}

export function MarkDot({ severity, n, lit, small }: { severity: Severity; n: number; lit?: boolean; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full text-[11px] font-bold text-white shadow-[0_0_0_2px_#fff] transition-[transform,box-shadow] duration-200",
        small ? "h-5 w-5" : "h-[22px] w-[22px]",
        MARK_BG[severity],
        lit && cn("scale-110", MARK_RING[severity]),
      )}
    >
      {n}
    </span>
  );
}

export function Mark({ signal, small }: { signal: InsightSignal | undefined; small?: boolean }) {
  const { lit, setLit, jump } = useContext(MarkContext);
  if (!signal) return null;
  return (
    <button
      type="button"
      aria-label={`Xem tín hiệu cần chú ý số ${signal.n}`}
      className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-indigo-500"
      onPointerEnter={() => setLit(signal.n)}
      onPointerLeave={() => setLit(null)}
      onFocus={() => setLit(signal.n)}
      onBlur={() => setLit(null)}
      onClick={() => jump(signal.n)}
    >
      <MarkDot severity={signal.severity} n={signal.n} lit={lit === signal.n} small={small} />
    </button>
  );
}

export function TrendTag({ value, tone }: { value: number | null; tone: "good-up" | "bad-up" | "mute" }) {
  if (value == null) return <span className="text-[11.5px] font-semibold text-slate-500">—</span>;
  const up = value >= 0;
  const color =
    tone === "mute" ? "text-slate-500" : (up && tone === "good-up") || (!up && tone === "bad-up") ? "text-green-700" : "text-amber-700";
  const Icon = up ? TrendUp : TrendDown;
  return (
    <span className={cn("inline-flex items-center gap-0.5 whitespace-nowrap text-[11.5px] font-semibold tabular-nums", color)}>
      <Icon size={12} weight="bold" />
      {up ? "+" : "−"}
      {Math.abs(value).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%
    </span>
  );
}

export function SectionHead({ id, title, sub }: { id: string; title: string; sub: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h2 id={id} className="text-[17px] font-bold tracking-[-0.015em] text-slate-900">
        {title}
      </h2>
      <p className="text-[12.5px] text-slate-500">{sub}</p>
    </div>
  );
}

export function Callout({ tone, icon, title, children, className }: { tone: "warn" | "info"; icon: ReactNode; title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mx-[18px] mb-4 mt-auto flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-[12.5px] leading-snug",
        tone === "warn" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-indigo-100 bg-indigo-50 text-indigo-700",
        className,
      )}
    >
      <span className="shrink-0 text-[18px]">{icon}</span>
      <div>
        <b className={cn("block font-semibold", tone === "warn" ? "text-amber-900" : "text-indigo-950")}>{title}</b>
        {children ? <span className="mt-px block">{children}</span> : null}
      </div>
    </div>
  );
}

export function Tabs<T extends string>({
  label,
  value,
  options,
  onChange,
  idPrefix,
}: {
  label: string;
  value: T;
  options: Array<[T, string]>;
  onChange: (v: T) => void;
  idPrefix?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="inline-flex gap-0.5 rounded-[9px] bg-slate-100 p-[3px]"
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const i = options.findIndex((o) => o[0] === value);
        const next = options[(i + (e.key === "ArrowRight" ? 1 : options.length - 1)) % options.length][0];
        onChange(next);
        requestAnimationFrame(() => document.getElementById(`${idPrefix ?? label}-${next}`)?.focus());
      }}
    >
      {options.map(([k, l]) => (
        <button
          key={k}
          id={`${idPrefix ?? label}-${k}`}
          type="button"
          role="tab"
          aria-selected={value === k}
          tabIndex={value === k ? 0 : -1}
          onClick={() => onChange(k)}
          className={cn(
            "h-7 whitespace-nowrap rounded-[7px] px-3 text-[12.5px] font-medium transition-colors",
            value === k ? "bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.08)]" : "text-slate-600 hover:text-slate-900",
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function TickLegend({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 px-[18px] pb-3.5 text-[11.5px] text-slate-500">
      <span className="inline-block h-2.5 w-[1.5px] bg-slate-700" />
      {children}
    </div>
  );
}

export function Bar({ value, max, tick, color, height = 6 }: { value: number; max: number; tick?: number | null; color: string; height?: number }) {
  return (
    <div className="relative rounded-full bg-slate-100" style={{ height }}>
      <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
      {tick != null ? (
        <i
          className="absolute -ml-[0.75px] w-[1.5px] rounded-[1px] bg-slate-700"
          style={{ left: `${Math.min(100, (tick / max) * 100)}%`, top: -3, height: height + 6 }}
        />
      ) : null}
    </div>
  );
}
