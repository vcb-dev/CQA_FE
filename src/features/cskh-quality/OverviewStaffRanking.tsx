import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/axios";
import { vnToday } from "@/features/dashboard/dashboardPeriod";
import {
  fetchEmployeePerformance,
  type EmployeePerformance,
} from "@/features/employees/api";
import { usePermission } from "@/features/user-access/api";

const LIMIT = 10;

function displayName(e: EmployeePerformance): string {
  return e.fullName?.trim() || e.email.split("@")[0];
}

function initials(name: string): string {
  const parts = name.trim().split(/[\s@._-]+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function rankEmployees(list: EmployeePerformance[]): EmployeePerformance[] {
  return [...list].sort(
    (a, b) =>
      (b.score ?? -1) - (a.score ?? -1) ||
      (b.closeRate ?? -1) - (a.closeRate ?? -1) ||
      b.conversations - a.conversations ||
      Number(b.isActive) - Number(a.isActive) ||
      displayName(a).localeCompare(displayName(b), "vi"),
  );
}

function scoreBadgeClass(score: number | null): string {
  if (score == null)
    return "bg-n-100 text-n-500 border-border dark:bg-n-800 dark:text-n-400";
  if (score >= 80)
    return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400";
  if (score >= 60)
    return "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400";
  return "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400";
}

const formatDecimal = (value: number) =>
  value.toLocaleString("vi-VN", { maximumFractionDigits: 1 });

function MessageRow({ text, tone = "muted" }: { text: string; tone?: "muted" | "error" }) {
  return (
    <tr>
      <td
        colSpan={5}
        className={cn(
          "py-6 text-center text-[11px]",
          tone === "error" ? "text-rose-600" : "text-n-500",
        )}
      >
        {text}
      </td>
    </tr>
  );
}

export function OverviewStaffRanking() {
  const canView = usePermission("employee.view");
  const to = vnToday();
  const from = `${to.slice(0, 7)}-01`;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["employees", "performance", from, to],
    queryFn: () => fetchEmployeePerformance(from, to),
    enabled: canView,
    staleTime: 60_000,
    retry: 1,
  });

  const employees = data?.employees ?? [];
  const rows = rankEmployees(employees).slice(0, LIMIT);

  let body;
  if (!canView) body = <MessageRow text="Bạn chưa có quyền xem số liệu nhân viên" />;
  else if (isLoading) body = <MessageRow text="Đang tải…" />;
  else if (isError) body = <MessageRow text={getApiErrorMessage(error)} tone="error" />;
  else if (!rows.length) body = <MessageRow text="Chưa có tài khoản nhân viên" />;
  else {
    body = rows.map((employee, idx) => {
      const name = displayName(employee);
      return (
        <tr
          key={employee.id}
          className={cn("text-[11px]", !employee.isActive && "opacity-60")}
        >
          <td className="py-1 text-center font-black text-n-400 dark:text-n-500">
            {idx + 1}
          </td>
          <td className="py-1 font-bold text-n-700 dark:text-n-300 flex items-center gap-1 min-w-0">
            {employee.avatarUrl ? (
              <img
                src={employee.avatarUrl}
                alt=""
                className="h-5 w-5 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="h-5 w-5 rounded-full bg-gradient-to-br from-indigo-50 to-purple-500 text-[9px] font-black text-white flex items-center justify-center shrink-0">
                {initials(name)}
              </div>
            )}
            <span className="truncate flex items-center gap-0.5 min-w-0" title={employee.email}>
              <span className="truncate">{name}</span>
              {idx === 0 && employee.score != null && (
                <span className="shrink-0 text-[10px]">🏆</span>
              )}
            </span>
          </td>
          <td className="py-1 text-center">
            <span
              className={cn(
                "inline-flex min-w-[22px] items-center justify-center rounded border px-1 py-0.5 text-[9px] font-black",
                scoreBadgeClass(employee.score),
              )}
            >
              {employee.score == null ? "—" : formatDecimal(employee.score)}
            </span>
          </td>
          <td className="py-1 text-right font-semibold text-n-800 dark:text-n-200 tabular-nums">
            {employee.closeRate == null ? "—" : `${formatDecimal(employee.closeRate)}%`}
          </td>
          <td className="py-1 text-right font-semibold text-n-800 dark:text-n-200 tabular-nums">
            {employee.conversations.toLocaleString("vi-VN")}
          </td>
        </tr>
      );
    });
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-col rounded-xl border border-border bg-card text-card-foreground p-3 shadow-sm lg:flex-1 lg:min-h-0">
      <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2">
        <h3 className="text-xs font-extrabold text-foreground sm:text-sm">
          Xếp hạng nhân viên
          <span className="ml-1.5 text-[10px] font-semibold text-n-500">Tháng này</span>
        </h3>
        {canView && (
          <Link
            to="/employees"
            className="text-[10px] font-bold text-primary hover:underline"
          >
            Tất cả
          </Link>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto [scrollbar-width:thin]">
        <table className="w-full min-w-[240px] border-collapse text-left">
          <thead>
            <tr className="border-b border-border text-[9px] font-bold text-n-400 dark:text-n-500 uppercase tracking-wider sticky top-0 bg-card z-10">
              <th className="pb-1 text-center font-black w-5">#</th>
              <th className="pb-1 font-black">Nhân viên</th>
              <th className="pb-1 text-center font-black">QA</th>
              <th className="pb-1 text-right font-black">Chốt</th>
              <th className="pb-1 text-right font-black">Hội thoại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">{body}</tbody>
        </table>
      </div>
    </div>
  );
}
