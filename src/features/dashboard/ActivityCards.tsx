import { ArrowsClockwise, CheckCircle, CircleNotch, Pause, Prohibit, Sparkle, XCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { CardHead, CardLink, DashCard, EmptyBlock, Skeleton } from "./DashboardParts";
import type { DashboardJob } from "./dashboardApi";
import { type JobState, f1, fmt, jobLabel, jobState, vnDay, vnTime } from "./dashboardModel";
import { dayMonth } from "./dashboardPeriod";

function whenLabel(iso: string, today: string): string {
  const day = vnDay(iso);
  return day === today ? vnTime(iso) : `${dayMonth(day)} ${vnTime(iso)}`;
}

const STATE_BADGE: Record<JobState, { label: string; className: string; icon: typeof CheckCircle }> = {
  run: { label: "Đang chạy", className: "bg-indigo-50 text-indigo-700", icon: CircleNotch },
  ok: { label: "Xong", className: "bg-green-50 text-green-700", icon: CheckCircle },
  paused: { label: "Tạm dừng", className: "bg-amber-50 text-amber-700", icon: Pause },
  cancelled: { label: "Đã hủy", className: "bg-slate-100 text-slate-600", icon: Prohibit },
  err: { label: "Lỗi", className: "bg-red-50 text-red-700", icon: XCircle },
};

function jobRange(job: DashboardJob, today: string): string {
  const start = whenLabel(job.startedAt, today);
  return job.finishedAt ? `${start}–${vnTime(job.finishedAt)}` : `bắt đầu ${start}`;
}

function jobMeta(job: DashboardJob, state: JobState): { text: string; progress: number | null } {
  const s = job.summary ?? {};
  if (state === "err") return { text: job.error?.trim() || "Dừng trước khi hoàn tất", progress: null };
  if (job.type === "audit") {
    const total = s.total ?? 0;
    const processed = s.processed ?? s.audited ?? 0;
    if (state === "run") {
      return {
        text: total > 0 ? `${fmt(processed)}/${fmt(total)} hội thoại` : "",
        progress: total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : null,
      };
    }
    const audited = s.audited ?? s.auditCount ?? processed;
    const parts = [audited ? `${fmt(audited)} audit` : "Không có hội thoại cần chấm", audited && s.avgScore != null ? `điểm TB ${f1(s.avgScore)}` : null];
    return { text: parts.filter(Boolean).join(" · "), progress: null };
  }
  const pages = s.pagesTotal ?? 0;
  const conversations = s.totalConversations ?? s.fetched ?? 0;
  const parts = [pages ? `${fmt(pages)} page` : null, conversations ? `${fmt(conversations)} hội thoại` : null];
  return {
    text: parts.filter(Boolean).join(" · "),
    progress: state === "run" && pages > 0 ? Math.min(100, Math.round(((s.pagesProcessed ?? 0) / pages) * 100)) : null,
  };
}

function groupRepeatedFailures(jobs: DashboardJob[]): Array<{ job: DashboardJob; repeat: number }> {
  const groups: Array<{ job: DashboardJob; repeat: number }> = [];
  for (const job of jobs) {
    const last = groups[groups.length - 1];
    const sameFailure =
      last &&
      jobState(job) === "err" &&
      jobState(last.job) === "err" &&
      last.job.type === job.type &&
      (last.job.error ?? "").trim() === (job.error ?? "").trim();
    if (sameFailure) last.repeat += 1;
    else groups.push({ job, repeat: 1 });
  }
  return groups;
}

export function JobFeedCard({
  state,
  jobs,
  today,
  className,
}: {
  state: "ready" | "loading" | "empty";
  jobs: DashboardJob[];
  today: string;
  className?: string;
}) {
  const running = jobs.some((j) => jobState(j) === "run");
  const head = (
    <CardHead
      id="jobsTitle"
      title="Tiến trình nền"
      subtitle={running ? "Tự làm mới mỗi 30 giây khi có tiến trình đang chạy" : "Đồng bộ tin nhắn và chấm điểm AI"}
      right={<CardLink to="/quality">Chi tiết</CardLink>}
    />
  );

  if (state === "loading") {
    return (
      <DashCard labelledBy="jobsTitle" className={className}>
        {head}
        <div className="flex flex-col gap-4 px-[18px] py-3.5">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-[34px]" />
          ))}
        </div>
      </DashCard>
    );
  }

  if (state === "empty" || jobs.length === 0) {
    return (
      <DashCard labelledBy="jobsTitle" className={className}>
        {head}
        <EmptyBlock>Chưa có tiến trình.</EmptyBlock>
      </DashCard>
    );
  }

  return (
    <DashCard labelledBy="jobsTitle" className={cn("@container", className)}>
      {head}
      <ul className="flex flex-col px-[18px] pb-2 pt-2">
        {groupRepeatedFailures(jobs).map(({ job, repeat }) => {
          const st = jobState(job);
          const badge = STATE_BADGE[st];
          const BadgeIcon = badge.icon;
          const meta = jobMeta(job, st);
          const JobIcon = job.type === "audit" ? Sparkle : ArrowsClockwise;
          return (
            <li
              key={job.id}
              className="grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-slate-100 py-3 last:border-0 @max-[460px]:grid-cols-[36px_minmax(0,1fr)] @max-[460px]:items-start"
            >
              <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-slate-100 bg-slate-50 text-[18px] text-slate-600 @max-[460px]:row-span-2">
                <JobIcon weight="duotone" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <b className="text-[13px] font-semibold text-slate-900">{jobLabel(job.type)}</b>
                  <span className={cn("inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-md px-2 text-[11px] font-semibold", badge.className)}>
                    <BadgeIcon size={12} weight="bold" className={st === "run" ? "animate-spin motion-reduce:animate-none" : undefined} />
                    {badge.label}
                  </span>
                  {repeat > 1 ? (
                    <span className="inline-flex h-[22px] items-center whitespace-nowrap rounded-md bg-slate-100 px-2 text-[11px] font-semibold tabular-nums text-slate-600">
                      {fmt(repeat)} lần liên tiếp
                    </span>
                  ) : null}
                </div>
                {meta.text ? (
                  <p className={cn("mt-0.5 text-[12px] leading-[1.45]", st === "err" ? "text-red-700" : "text-slate-500")}>{meta.text}</p>
                ) : null}
                {meta.progress != null ? (
                  <div
                    role="progressbar"
                    aria-valuenow={meta.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Tiến độ ${jobLabel(job.type).toLowerCase()}`}
                    className="mt-1.5 h-[5px] max-w-[420px] overflow-hidden rounded-full bg-indigo-100"
                  >
                    <span className="block h-full rounded-full bg-indigo-600" style={{ width: `${meta.progress}%` }} />
                  </div>
                ) : null}
              </div>
              <span className="whitespace-nowrap text-right text-[12px] tabular-nums text-slate-500 @max-[460px]:col-start-2 @max-[460px]:text-left">
                {repeat > 1 ? `gần nhất ${whenLabel(job.startedAt, today)}` : jobRange(job, today)}
              </span>
            </li>
          );
        })}
      </ul>
    </DashCard>
  );
}
