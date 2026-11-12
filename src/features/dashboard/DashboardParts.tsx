import {
  ArrowRight,
  Eye,
  InstagramLogo,
  MessengerLogo,
  Globe,
  TiktokLogo,
  Warning,
  WarningOctagon,
  CheckCircle,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { DashboardPlatform } from "./dashboardApi";
import type { ScoreStatus, Severity } from "./dashboardModel";

export function DashCard({
  className,
  children,
  labelledBy,
}: {
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn(
        "min-w-0 rounded-[12px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_2px_6px_-2px_rgba(15,23,42,0.06)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHead({
  id,
  title,
  subtitle,
  right,
}: {
  id: string;
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start gap-x-3 gap-y-2 px-[18px] pt-4">
      <div className="min-w-0">
        <h2 id={id} className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-slate-900">
          {title}
        </h2>
        {subtitle ? <p className="mt-0.5 text-[12.5px] text-slate-500">{subtitle}</p> : null}
      </div>
      {right ? <div className="ml-auto flex shrink-0 items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function CardLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1 whitespace-nowrap rounded-md text-[12.5px] font-semibold text-indigo-600 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
    >
      {children}
      <ArrowRight size={13} weight="bold" className="transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  );
}

const CHIP_TONE = {
  bad: "bg-red-50 text-red-700",
  warn: "bg-amber-50 text-amber-700",
  watch: "bg-indigo-50 text-indigo-700",
  good: "bg-green-50 text-green-700",
  mute: "bg-slate-100 text-slate-600",
} as const;

export type ChipTone = keyof typeof CHIP_TONE;

export function Chip({ tone, icon, children }: { tone: ChipTone; icon?: ReactNode; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-[5px] whitespace-nowrap rounded-full px-[9px] text-[11.5px] font-semibold",
        CHIP_TONE[tone],
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <span className={cn("block animate-pulse rounded-md bg-slate-100", className)} />;
}

export function EmptyBlock({
  icon,
  tone = "indigo",
  title,
  children,
  actions,
  className,
}: {
  icon?: ReactNode;
  tone?: "indigo" | "good" | "bad";
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  const toneClass =
    tone === "good" ? "bg-green-50 text-green-600" : tone === "bad" ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600";
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-9 text-center", className)}>
      {icon ? (
        <div className={cn("mb-1 grid h-11 w-11 place-items-center rounded-full text-[22px]", toneClass)}>{icon}</div>
      ) : null}
      {title ? <h3 className="text-[14.5px] font-semibold text-slate-900">{title}</h3> : null}
      {children ? <p className="max-w-[360px] text-[12.5px] text-slate-500">{children}</p> : null}
      {actions ? <div className="mt-2 flex flex-wrap justify-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PlatformIcon({ platform, size = 15, className }: { platform: DashboardPlatform; size?: number; className?: string }) {
  const cls = cn("shrink-0 text-slate-500", className);
  if (platform === "instagram") return <InstagramLogo size={size} className={cls} />;
  if (platform === "tiktok") return <TiktokLogo size={size} className={cls} />;
  if (platform === "other") return <Globe size={size} className={cls} />;
  return <MessengerLogo size={size} className={cls} />;
}

export const SEVERITY_META: Record<Severity, { label: string; text: string; dot: string; color: string }> = {
  bad: { label: "Nghiêm trọng", text: "text-red-700", dot: "bg-red-600", color: "#dc2626" },
  warn: { label: "Cần xử lý", text: "text-amber-700", dot: "bg-amber-600", color: "#d97706" },
  watch: { label: "Theo dõi", text: "text-indigo-700", dot: "bg-indigo-500", color: "#6366f1" },
};

export function SeverityIcon({ severity, size = 13 }: { severity: Severity; size?: number }) {
  if (severity === "bad") return <WarningOctagon size={size} weight="bold" />;
  if (severity === "warn") return <Warning size={size} weight="bold" />;
  return <Eye size={size} weight="bold" />;
}

export const STATUS_META: Record<ScoreStatus, { label: string; text: string; bar: string; chip: string }> = {
  good: { label: "Tốt", text: "text-green-700", bar: "bg-green-600", chip: "bg-green-50 text-green-700" },
  warn: { label: "Cảnh báo", text: "text-amber-700", bar: "bg-amber-600", chip: "bg-amber-50 text-amber-700" },
  bad: { label: "Nghiêm trọng", text: "text-red-700", bar: "bg-red-600", chip: "bg-red-50 text-red-700" },
};

export function StatusIcon({ status, size = 12 }: { status: ScoreStatus; size?: number }) {
  if (status === "good") return <CheckCircle size={size} weight="bold" />;
  if (status === "warn") return <Warning size={size} weight="bold" />;
  return <WarningOctagon size={size} weight="bold" />;
}
