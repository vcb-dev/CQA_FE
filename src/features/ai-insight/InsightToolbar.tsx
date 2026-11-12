import {
  ArrowsClockwise,
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  CheckCircle,
  CircleNotch,
  Clock,
  Funnel,
  Warning,
  WarningCircle,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Chip } from "@/features/dashboard/DashboardParts";
import type { AiInsightReport, AiInsightResponse } from "./api";
import { f1, fmt, vnDateTime } from "./InsightParts";

const selectCls =
  "h-9 cursor-pointer appearance-none rounded-[10px] border border-slate-200 bg-white pl-[34px] pr-[34px] text-[13px] font-medium text-slate-700 hover:border-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 max-[560px]:w-full";
const iconBtn =
  "grid h-9 w-9 place-items-center rounded-[10px] border border-slate-200 bg-white text-[16px] text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

function CoverageItem({ label, num, den, note }: { label: string; num: number; den: number; note: string }) {
  const value = den > 0 ? (num / den) * 100 : null;
  const low = value != null && value < 75;
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-2.5 gap-y-[5px]">
      <span className="text-[12.5px] font-medium text-slate-700">{label}</span>
      <b className={cn("text-[13px] font-bold tabular-nums", low ? "text-amber-700" : "text-slate-900")}>
        {value == null ? "—" : `${f1(value)}%`}
      </b>
      <div className="col-span-2 h-[5px] overflow-hidden rounded-full bg-slate-100">
        <i className={cn("block h-full rounded-full", low ? "bg-amber-600" : "bg-indigo-600")} style={{ width: `${value ?? 0}%` }} />
      </div>
      <small className="col-span-2 text-[11.5px] tabular-nums text-slate-500">{note}</small>
    </li>
  );
}

function CoveragePopover({ report }: { report: AiInsightReport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const c = report.coverage;
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative max-[760px]:static">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="aii-coverage"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex h-[34px] items-center gap-1.5 whitespace-nowrap rounded-[9px] border px-2.5 text-[12.5px] font-medium transition-colors",
          open ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
        )}
      >
        <Warning size={15} weight="bold" className="text-amber-600" />
        Độ tin cậy dữ liệu
      </button>
      {open ? (
        <div
          id="aii-coverage"
          role="dialog"
          aria-labelledby="aii-coverage-title"
          className="absolute right-0 top-[calc(100%+8px)] z-30 w-[min(370px,calc(100vw-32px))] rounded-xl border border-slate-200 bg-white px-4 pb-4 pt-3.5 shadow-[0_8px_24px_-6px_rgba(15,23,42,0.18),0_2px_6px_rgba(15,23,42,0.06)] max-[760px]:left-0 max-[760px]:right-0 max-[760px]:w-auto"
        >
          <h2 id="aii-coverage-title" className="text-[13.5px] font-semibold text-slate-900">
            Độ tin cậy dữ liệu tuần này
          </h2>
          <p className="mt-0.5 text-[12px] text-slate-500">Số liệu càng gần 100% thì báo cáo càng sát thực tế</p>
          <ul className="mt-3.5 flex flex-col gap-3">
            <CoverageItem label="Khách có tin nhắn chữ" num={c.scanned.num} den={c.scanned.den} note={`${fmt(c.scanned.num)} / ${fmt(c.scanned.den)} khách có chữ để đọc nội dung; số còn lại chỉ gửi ảnh, sticker`} />
            <CoverageItem label="Nhận ra được sản phẩm" num={c.product.num} den={c.product.den} note={`${fmt(c.product.num)} / ${fmt(c.product.den)} khách quan tâm nhắc tới một sản phẩm cụ thể`} />
            <CoverageItem label="Câu trả lời đầu do nhân viên gửi" num={c.staffReply.num} den={c.staffReply.den} note={`Đã bỏ qua ${fmt(c.staffReply.auto)} tin trả lời tự động (gửi trong vòng 10 giây)`} />
            <CoverageItem label="Khách quảng cáo có số liệu chi phí" num={c.adSpend.num} den={c.adSpend.den} note={`${fmt(c.adSpend.num)} / ${fmt(c.adSpend.den)} khách từ quảng cáo thuộc page đã có chi phí`} />
          </ul>
          <div className="mt-3.5 flex gap-2 border-t border-slate-100 pt-3 text-[12px] leading-[1.45] text-slate-600">
            <CheckCircle size={15} weight="fill" className="mt-px shrink-0 text-green-600" />
            <span>
              Số liệu được tính tự động bằng bộ quy tắc từ khóa (phiên bản {report.ruleVersion}) trên tin nhắn và dữ liệu quảng cáo, chưa dùng AI để suy luận.
            </span>
          </div>
          <div className="mt-2.5 flex gap-2 text-[12px] leading-[1.45] text-slate-600">
            <WarningCircle size={15} weight="fill" className="mt-px shrink-0 text-amber-600" />
            <span>Chưa có số đơn, doanh thu và ROAS vì đơn tạo từ hội thoại chưa lưu sản phẩm và trạng thái thanh toán.</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function InsightToolbar({
  data,
  week,
  scope,
  onWeek,
  onScope,
  onRefresh,
  refreshing,
  canRun,
  onRun,
  runPending,
}: {
  data: AiInsightResponse | undefined;
  week: string | undefined;
  scope: string | undefined;
  onWeek: (w: string) => void;
  onScope: (s: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  canRun: boolean;
  onRun: () => void;
  runPending: boolean;
}) {
  const weeks = data?.weeks ?? [];
  const idx = weeks.findIndex((w) => w.weekStart === week);
  const scopes = data?.scopes ?? [];
  const report = data?.report ?? null;
  const running = Boolean(data?.running) || runPending;
  const groups: Array<{ key: string; label: string }> = [
    { key: "kind", label: "Nền tảng" },
    { key: "page", label: "Page" },
  ];

  return (
    <div className="relative flex flex-wrap items-center gap-2.5">
      <div role="group" aria-label="Tuần báo cáo" className="inline-flex items-center gap-1.5 max-[560px]:flex-1">
        <button type="button" className={iconBtn} aria-label="Tuần trước" disabled={idx < 0 || idx >= weeks.length - 1} onClick={() => onWeek(weeks[idx + 1].weekStart)}>
          <CaretLeft weight="bold" />
        </button>
        <label className="relative inline-flex items-center max-[560px]:min-w-0 max-[560px]:flex-1">
          <CalendarBlank size={16} className="pointer-events-none absolute left-[11px] text-slate-500" />
          <select aria-label="Chọn tuần" className={selectCls} value={week ?? ""} onChange={(e) => onWeek(e.target.value)} disabled={!weeks.length}>
            {weeks.length ? null : <option value="">Chưa có tuần nào</option>}
            {weeks.map((w) => (
              <option key={w.weekStart} value={w.weekStart}>
                {w.label}
              </option>
            ))}
          </select>
          <CaretDown size={12} weight="bold" className="pointer-events-none absolute right-[11px] text-slate-500" />
        </label>
        <button type="button" className={iconBtn} aria-label="Tuần sau" disabled={idx <= 0} onClick={() => onWeek(weeks[idx - 1].weekStart)}>
          <CaretRight weight="bold" />
        </button>
      </div>

      <label className="relative inline-flex items-center max-[560px]:w-full">
        <Funnel size={16} className="pointer-events-none absolute left-[11px] text-slate-500" />
        <select aria-label="Kênh và nền tảng" className={cn(selectCls, "max-w-[280px]")} value={scope ?? ""} onChange={(e) => onScope(e.target.value)} disabled={!scopes.length}>
          {scopes.filter((s) => s.group === "all").map((s) => (
            <option key={s.scope} value={s.scope}>
              Tất cả {fmt(scopes.filter((x) => x.group === "page").length)} kênh
            </option>
          ))}
          {groups.map((g) => {
            const items = scopes.filter((s) => s.group === g.key);
            if (!items.length) return null;
            return (
              <optgroup key={g.key} label={g.label}>
                {items.map((s) => (
                  <option key={s.scope} value={s.scope}>
                    {s.label} · {fmt(s.conversations)}
                  </option>
                ))}
              </optgroup>
            );
          })}
        </select>
        <CaretDown size={12} weight="bold" className="pointer-events-none absolute right-[11px] text-slate-500" />
      </label>

      <div className="ml-auto flex items-center gap-2 max-[760px]:ml-0 max-[760px]:w-full max-[760px]:flex-wrap">
        {running ? (
          <span role="status">
            <Chip tone="watch" icon={<CircleNotch size={13} weight="bold" className="animate-spin" />}>
              Đang tổng hợp {data?.running ? `tuần ${data.running.slice(8, 10)}/${data.running.slice(5, 7)}` : ""}
            </Chip>
          </span>
        ) : report ? (
          <span role="status" title="Tuần đã kết thúc nên số liệu không thay đổi nữa">
            <Chip tone="good" icon={<CheckCircle size={13} weight="bold" />}>
              Đã chốt số liệu
            </Chip>
          </span>
        ) : null}
        {report ? <CoveragePopover report={report} /> : null}
        {report ? (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] text-slate-600 max-[760px]:ml-auto">
            <Clock size={14} />
            Cập nhật {vnDateTime(report.computedAt)}
          </span>
        ) : null}
        {canRun ? (
          <button
            type="button"
            onClick={onRun}
            disabled={running || !week}
            className="inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-slate-200 bg-white px-3 text-[12.5px] font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            Tổng hợp lại
          </button>
        ) : null}
        <button type="button" className={iconBtn} aria-label="Làm mới số liệu" onClick={onRefresh} disabled={refreshing}>
          <ArrowsClockwise weight="bold" className={refreshing ? "animate-spin" : undefined} />
        </button>
      </div>
    </div>
  );
}
