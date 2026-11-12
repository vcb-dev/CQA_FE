import { ArrowsClockwise, CloudWarning, Info, UsersThree } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import type { EmployeePerformance, EmployeePerformanceResponse } from "@/features/employees/api";
import { CardHead, CardLink, DashCard, EmptyBlock, STATUS_META, Skeleton, StatusIcon } from "./DashboardParts";
import { f1, fmt, money, moneyShort, scoreStatus } from "./dashboardModel";

const LIMIT = 5;
const TH = "whitespace-nowrap border-b border-slate-200 px-2.5 py-2 text-right text-[12px] font-medium text-slate-500";
const TD = "whitespace-nowrap px-2.5 py-2.5 text-right tabular-nums";

const hasActivity = (e: EmployeePerformance) => e.conversations > 0 || e.orders > 0 || e.auditCount > 0;

function displayName(e: EmployeePerformance): string {
  return e.fullName?.trim() || e.email.split("@")[0];
}

function initials(name: string): string {
  const parts = name.trim().split(/[\s@._-]+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ e }: { e: EmployeePerformance }) {
  const name = displayName(e);
  if (e.avatarUrl) {
    return <img src={e.avatarUrl} alt="" className="h-8 w-8 shrink-0 rounded-full border border-slate-200 object-cover" />;
  }
  return (
    <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-700">
      {initials(name)}
    </span>
  );
}

function Count({ value }: { value: number }) {
  return <span className={value ? "text-slate-700" : "text-slate-500"}>{fmt(value)}</span>;
}

export function StaffCard({
  state,
  data,
  rangeLabel,
  onRetry,
  dimmed,
}: {
  state: "ready" | "loading" | "error";
  data: EmployeePerformanceResponse | undefined;
  rangeLabel: string;
  onRetry: () => void;
  dimmed: boolean;
}) {
  const employees = data?.employees ?? [];
  const active = employees
    .filter(hasActivity)
    .sort((a, b) => b.revenue - a.revenue || b.orders - a.orders || b.conversations - a.conversations);
  const idle = active.length === 0;
  const rows = idle ? employees.filter((e) => e.isActive).slice(0, LIMIT) : active.slice(0, LIMIT);

  const subtitle =
    state === "loading"
      ? "Đang tải…"
      : state === "error"
        ? "Không tải được số liệu nhân viên"
        : employees.length === 0
          ? "Chưa có tài khoản nhân viên"
          : idle
            ? `Chưa ghi nhận hoạt động · ${rangeLabel}`
            : `${fmt(active.length)}/${fmt(employees.length)} nhân viên có hoạt động · xếp theo doanh thu`;

  const head = <CardHead id="staffTitle" title="Hiệu suất nhân viên" subtitle={subtitle} right={<CardLink to="/employees">Chi tiết</CardLink>} />;

  if (state === "loading") {
    return (
      <DashCard labelledBy="staffTitle">
        {head}
        <div className="flex flex-col gap-3.5 px-[18px] py-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[30px]" />
          ))}
        </div>
      </DashCard>
    );
  }

  if (state === "error") {
    return (
      <DashCard labelledBy="staffTitle">
        {head}
        <EmptyBlock
          tone="bad"
          icon={<CloudWarning weight="duotone" />}
          actions={
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900"
            >
              <ArrowsClockwise size={14} weight="bold" />
              Thử lại
            </button>
          }
        >
          Máy chủ chưa trả về bảng hiệu suất. Các phần khác trên trang vẫn dùng được.
        </EmptyBlock>
      </DashCard>
    );
  }

  if (rows.length === 0) {
    return (
      <DashCard labelledBy="staffTitle">
        {head}
        <EmptyBlock icon={<UsersThree weight="duotone" />} title="Chưa có nhân viên để theo dõi">
          Tạo tài khoản vai trò Nhân viên và giao kênh để theo dõi hội thoại, đơn và doanh thu của từng người.
        </EmptyBlock>
      </DashCard>
    );
  }

  return (
    <DashCard labelledBy="staffTitle" className={cn("flex flex-col @container", dimmed && "opacity-55 transition-opacity")}>
      {head}
      {idle ? (
        <p className="mx-[18px] mt-3 flex items-start gap-2 rounded-[10px] bg-slate-50 px-3 py-2.5 text-[12.5px] leading-[1.45] text-slate-600">
          <Info size={15} className="mt-px shrink-0 text-slate-500" />
          Chưa có hội thoại, đơn hay audit nào gắn với nhân viên trong kỳ. Số liệu được ghi nhận khi nhân viên trả lời khách hoặc tạo đơn trong CRM.
        </p>
      ) : null}
      <div className="overflow-x-auto px-2 pb-3 pt-2">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th className={cn(TH, "w-full text-left")}>Nhân viên</th>
              <th className={cn(TH, "@max-[560px]:hidden")}>Hội thoại</th>
              <th className={TH}>Đơn chốt</th>
              <th className={TH}>Doanh thu</th>
              <th className={cn(TH, "@max-[480px]:hidden")}>Tỉ lệ chốt</th>
              <th className={TH}>Điểm QA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => {
              const name = displayName(e);
              const status = e.score != null ? scoreStatus(e.score) : null;
              const st = status ? STATUS_META[status] : null;
              return (
                <tr key={e.id} className="border-b border-slate-100 last:border-0">
                  <td className="max-w-0 px-2.5 py-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar e={e} />
                      <div className="min-w-0">
                        <b className="block truncate text-[13px] font-medium leading-tight text-slate-900" title={name}>
                          {name}
                        </b>
                        <small className="block truncate text-[11.5px] text-slate-500">
                          {e.assignedPageCount ? `${fmt(e.assignedPageCount)} kênh được giao` : "Chưa giao kênh"}
                        </small>
                      </div>
                    </div>
                  </td>
                  <td className={cn(TD, "@max-[560px]:hidden")}>
                    <Count value={e.conversations} />
                  </td>
                  <td className={TD}>
                    <Count value={e.orders} />
                  </td>
                  <td className={cn(TD, e.revenue ? "font-semibold text-slate-900" : "text-slate-500")} title={money(e.revenue)}>
                    {moneyShort(e.revenue)}
                  </td>
                  <td className={cn(TD, "@max-[480px]:hidden", e.closeRate != null ? "text-slate-700" : "text-slate-500")}>
                    {e.closeRate != null ? `${f1(e.closeRate)}%` : "—"}
                  </td>
                  <td className={TD}>
                    {st && status && e.score != null ? (
                      <span
                        title={`${st.label} · ${fmt(e.auditCount)} audit`}
                        className={cn("inline-flex h-6 items-center gap-1 rounded-[7px] px-2 text-[12px] font-bold", st.chip)}
                      >
                        <StatusIcon status={status} />
                        {f1(e.score)}
                      </span>
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
      {!idle && active.length > rows.length ? (
        <p className="mt-auto px-[18px] pb-3.5 text-[11.5px] text-slate-500">
          Và {fmt(active.length - rows.length)} nhân viên khác có hoạt động trong kỳ.
        </p>
      ) : null}
    </DashCard>
  );
}
