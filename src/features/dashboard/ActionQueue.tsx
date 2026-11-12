import {
  ArrowRight,
  ChartLine,
  ChatCircleText,
  Check,
  CheckCircle,
  Clock,
  GearSix,
  Globe,
  Info,
  ShieldCheck,
  Tray,
} from "@phosphor-icons/react";
import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CardHead, Chip, DashCard, EmptyBlock, SEVERITY_META, SeverityIcon, Skeleton } from "./DashboardParts";
import type { QueueItem, QueueSource, Severity } from "./dashboardModel";

const SOURCE_ICON: Record<QueueSource, typeof ShieldCheck> = {
  audit: ShieldCheck,
  job: GearSix,
  inbox: ChatCircleText,
  trend: ChartLine,
  channel: Globe,
};

const NUM_BG: Record<Severity, string> = { bad: "bg-red-600", warn: "bg-amber-600", watch: "bg-indigo-500" };

export interface CalmCheck {
  label: string;
  detail: string;
}

export const ActionQueue = forwardRef<
  HTMLOListElement,
  {
    items: QueueItem[];
    state: "ready" | "loading" | "noChannels";
    lit: number | null;
    onLight: (n: number | null) => void;
    calmChecks: CalmCheck[];
    checkedAt: string | null;
  }
>(function ActionQueue({ items, state, lit, onLight, calmChecks, checkedAt }, listRef) {
  const counts = { bad: 0, warn: 0, watch: 0 };
  items.forEach((i) => counts[i.severity]++);
  const subtitle = "Xếp theo mức độ ảnh hưởng";

  if (state === "loading") {
    return (
      <DashCard labelledBy="queueTitle" className="flex flex-col">
        <CardHead id="queueTitle" title="Cần xử lý" subtitle={subtitle} />
        <div className="flex flex-col gap-1 px-2.5 py-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="grid grid-cols-[24px_minmax(0,1fr)] gap-2.5 px-2.5 py-3">
              <Skeleton className="h-[22px] w-[22px] rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-2.5 w-2/5" />
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-2.5 w-11/12" />
              </div>
            </div>
          ))}
        </div>
      </DashCard>
    );
  }

  if (state === "noChannels") {
    return (
      <DashCard labelledBy="queueTitle" className="flex flex-col">
        <CardHead id="queueTitle" title="Cần xử lý" subtitle={subtitle} />
        <EmptyBlock icon={<Tray weight="duotone" />} title="Chưa có gì để theo dõi">
          Hàng chờ sẽ tổng hợp hội thoại cần phản hồi, page có điểm QA thấp và tiến trình lỗi khi có dữ liệu.
        </EmptyBlock>
      </DashCard>
    );
  }

  if (items.length === 0) {
    return (
      <DashCard labelledBy="queueTitle" className="flex flex-col">
        <CardHead
          id="queueTitle"
          title="Cần xử lý"
          subtitle={subtitle}
          right={
            <Chip tone="good" icon={<Check size={13} weight="bold" />}>
              Ổn định
            </Chip>
          }
        />
        <div className="flex items-start gap-3 px-[18px] pb-1.5 pt-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green-50 text-[20px] text-green-600">
            <CheckCircle weight="duotone" />
          </span>
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900">Không có việc cần xử lý</h3>
            <p className="mt-0.5 text-[12.5px] text-slate-600">Các nguồn bên dưới đều trong ngưỡng ở lần kiểm tra gần nhất.</p>
          </div>
        </div>
        <ul className="flex flex-col px-[18px] pb-2 pt-1">
          {calmChecks.map((c) => (
            <li key={c.label} className="grid grid-cols-[20px_minmax(0,1fr)] gap-x-2.5 gap-y-px border-b border-slate-100 py-2.5 last:border-0">
              <CheckCircle size={18} weight="fill" className="row-span-2 mt-px text-green-600" />
              <b className="text-[13px] font-semibold text-slate-900">{c.label}</b>
              <span className="text-[12.5px] text-slate-600">{c.detail}</span>
            </li>
          ))}
        </ul>
        {checkedAt ? (
          <div className="mt-auto flex items-center gap-1.5 border-t border-slate-100 px-[18px] pb-4 pt-3 text-[12px] text-slate-500">
            <Clock size={14} />
            Kiểm tra lần cuối {checkedAt} · tự cập nhật khi có Audit hoặc tiến trình mới
          </div>
        ) : null}
      </DashCard>
    );
  }

  return (
    <DashCard labelledBy="queueTitle" className="flex flex-col">
      <CardHead
        id="queueTitle"
        title="Cần xử lý"
        subtitle={subtitle}
        right={<Chip tone="mute">{items.length} mục</Chip>}
      />
      <div className="flex flex-wrap gap-1.5 px-[18px] pb-1 pt-3">
        {counts.bad ? (
          <Chip tone="bad" icon={<SeverityIcon severity="bad" />}>
            {counts.bad} nghiêm trọng
          </Chip>
        ) : null}
        {counts.warn ? (
          <Chip tone="warn" icon={<SeverityIcon severity="warn" />}>
            {counts.warn} cần xử lý
          </Chip>
        ) : null}
        {counts.watch ? (
          <Chip tone="watch" icon={<SeverityIcon severity="watch" />}>
            {counts.watch} theo dõi
          </Chip>
        ) : null}
      </div>
      <ol ref={listRef} className="flex flex-col px-2.5 pb-1.5 pt-2">
        {items.map((item, idx) => {
          const sev = SEVERITY_META[item.severity];
          const SourceIcon = SOURCE_ICON[item.source];
          const isLit = lit === item.n;
          return (
            <li
              key={item.id}
              data-n={item.n}
              onPointerEnter={() => onLight(item.n)}
              onPointerLeave={() => onLight(null)}
              onFocus={() => onLight(item.n)}
              onBlur={() => onLight(null)}
              className={cn(
                "relative grid grid-cols-[24px_minmax(0,1fr)] gap-x-2.5 gap-y-1 rounded-[10px] px-2.5 py-3 transition-colors",
                isLit ? "bg-slate-50" : "hover:bg-slate-50",
                idx > 0 && !isLit && lit !== items[idx - 1].n
                  ? "before:absolute before:left-11 before:right-2.5 before:top-0 before:h-px before:bg-slate-100"
                  : "",
              )}
            >
              <span aria-hidden="true" className={cn("mt-px grid h-[22px] w-[22px] place-items-center rounded-full text-[11px] font-bold text-white", NUM_BG[item.severity])}>
                {item.n}
              </span>
              <div className="flex items-center gap-2 text-[11.5px] text-slate-500">
                <span className={cn("inline-flex items-center gap-1 font-semibold", sev.text)}>
                  <SeverityIcon severity={item.severity} />
                  {sev.label}
                </span>
                <span className="ml-auto whitespace-nowrap">{item.when}</span>
              </div>
              <h3 className="col-start-2 mt-0.5 text-[13.5px] font-semibold leading-[1.35] text-slate-900">{item.title}</h3>
              <p className="col-start-2 text-[12.5px] leading-[1.45] text-slate-600">{item.body}</p>
              <div className="col-start-2 mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-[5px] text-[11.5px] text-slate-500">
                  <SourceIcon size={13} />
                  {item.sourceLabel}
                </span>
                <Link
                  to={item.action.to}
                  className={cn(
                    "ml-auto inline-flex h-[30px] items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-[12.5px] font-semibold transition-colors",
                    item.primary
                      ? "bg-indigo-600 text-white shadow-[0_1px_2px_rgba(79,70,229,0.3)] hover:bg-indigo-700"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900",
                  )}
                >
                  {item.action.label}
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-auto flex items-center gap-1.5 border-t border-slate-100 px-[18px] pb-4 pt-3 text-[12px] text-slate-500">
        <Info size={14} />
        Tổng hợp từ Audit AI, hộp thư, tiến trình nền và cấu hình kênh
      </div>
    </DashCard>
  );
});
