import { useCallback, useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDashboardStats, fetchDashboardTrend } from "@/features/dashboard/dashboardApi";
import { buildDashboardPeriod, vnToday } from "@/features/dashboard/dashboardPeriod";
import {
  availablePlatforms,
  avgOrderValue,
  buildQueue,
  chartModel,
  concernModel,
  dailyTotals,
  f1,
  filteredPages,
  fmt,
  money,
  needsReplyModel,
  ordersSplit,
  pagePerformanceModel,
  passRate,
  qaAvg,
  sentimentModel,
  sumRange,
  vnTime,
} from "@/features/dashboard/dashboardModel";
import { DashboardToolbar } from "@/features/dashboard/DashboardToolbar";
import { KpiRow } from "@/features/dashboard/KpiRow";
import { TrendChart } from "@/features/dashboard/TrendChart";
import { ConcernCard, PagePerformanceCard } from "@/features/dashboard/InsightCards";
import { useMediaQuery } from "@/features/dashboard/useMediaQuery";
import { JobFeedCard } from "@/features/dashboard/ActivityCards";
import { StaffCard } from "@/features/dashboard/StaffCard";
import { fetchEmployeePerformance } from "@/features/employees/api";
import { usePermission } from "@/features/user-access/api";

const PERIOD_STORAGE_KEY = "cqa_dashboard_period_v1";
const PERIOD_KEYS = ["today", "7d", "month"];
const METRIC_STORAGE_KEY = "cqa_dashboard_metric_v1";
const METRIC_KEYS = ["revenue", "orders", "conv", "qa"];

function readStored(key, allowed, fallback) {
  try {
    const v = localStorage.getItem(key);
    return allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function periodForTrend(trend, today, fallback) {
  if (!trend) return fallback;
  return (
    PERIOD_KEYS.map((k) => buildDashboardPeriod(k, today)).find(
      (p) => p.request.from === trend.from && p.request.compareFrom === trend.compareFrom && p.request.to === trend.to,
    ) ?? fallback
  );
}

const PERIOD_WORD = { today: "hôm nay", "7d": "trong 7 ngày", month: "trong tháng" };

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const wide = useMediaQuery("(min-width: 1180px)");
  const [periodKey, setPeriodKey] = useState(() => readStored(PERIOD_STORAGE_KEY, PERIOD_KEYS, "month"));
  const [platform, setPlatform] = useState("all");
  const [metric, setMetricState] = useState(() => readStored(METRIC_STORAGE_KEY, METRIC_KEYS, "revenue"));
  const canViewStaff = usePermission("employee.view");
  const today = vnToday();
  const period = useMemo(() => buildDashboardPeriod(periodKey, today), [periodKey, today]);

  const setMetric = useCallback((key) => {
    setMetricState(key);
    store(METRIC_STORAGE_KEY, key);
  }, []);

  const statsQuery = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
    staleTime: 120_000,
    gcTime: 10 * 60_000,
    refetchInterval: (query) => {
      const jobs = query.state.data?.latestJobs;
      return Array.isArray(jobs) && jobs.some((j) => j.status === "running") ? 30_000 : false;
    },
  });

  const trendQuery = useQuery({
    queryKey: ["dashboardTrend", period.request],
    queryFn: ({ signal }) => fetchDashboardTrend(period.request, signal),
    staleTime: 300_000,
    gcTime: 30 * 60_000,
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const staffQuery = useQuery({
    queryKey: ["dashboardStaff", period.current.from, period.current.to],
    queryFn: () => fetchEmployeePerformance(period.current.from, period.current.to),
    enabled: canViewStaff,
    staleTime: 300_000,
    gcTime: 30 * 60_000,
    placeholderData: keepPreviousData,
    retry: 1,
  });

  const stats = statsQuery.data;
  const trend = trendQuery.data;
  const dataPeriod = useMemo(() => periodForTrend(trend, today, period), [trend, today, period]);
  const noChannels = stats ? stats.totalPages === 0 : false;

  const view = useMemo(() => {
    if (!trend) return null;
    const daily = dailyTotals(trend, platform);
    const cur = sumRange(daily, dataPeriod.current);
    const cmp = sumRange(daily, dataPeriod.compare);
    const pages = filteredPages(trend, platform);
    return {
      daily,
      cur,
      pages,
      kpi: {
        partial: dataPeriod.key === "today",
        revenue: { value: cur.revenue, prev: cmp.revenue, avgOrder: avgOrderValue(cur) },
        orders: { value: cur.orders, prev: cmp.orders, split: ordersSplit(trend, platform, dataPeriod.current) },
        conversations: {
          value: cur.conversations,
          prev: cmp.conversations,
          needsReply: needsReplyModel(pages, cur.conversations),
        },
        qa: { value: qaAvg(cur), prev: qaAvg(cmp), pass: passRate(cur), audits: cur.audits },
      },
      concerns: concernModel(trend, platform),
      sentiment: sentimentModel(daily, dataPeriod),
      pagePerformance: pagePerformanceModel(pages, 20),
    };
  }, [trend, platform, dataPeriod]);

  const chart = useMemo(
    () => (view ? chartModel(view.daily, dataPeriod, metric) : null),
    [view, dataPeriod, metric],
  );

  const queue = useMemo(
    () => buildQueue({ trend, stats, period: dataPeriod, filter: platform, daily: view?.daily }),
    [trend, stats, dataPeriod, platform, view],
  );

  const platforms = useMemo(() => availablePlatforms(trend), [trend]);

  const trendLoading = !trend && trendQuery.isPending;
  const trendFailed = !trend && trendQuery.isError;
  const trendState = noChannels ? "noChannels" : trendLoading ? "loading" : trendFailed ? "error" : "ready";
  const queueState = noChannels ? "noChannels" : (trendLoading && !trendFailed) || statsQuery.isPending ? "loading" : "ready";

  const counts = queue.reduce((acc, q) => ({ ...acc, [q.severity]: (acc[q.severity] ?? 0) + 1 }), {});
  const verdict = noChannels
    ? { kind: "empty" }
    : queueState === "loading"
      ? null
      : counts.bad
        ? { kind: "bad", count: counts.bad }
        : counts.warn
          ? { kind: "warn", count: counts.warn }
          : { kind: "calm" };

  const freshness = trendQuery.isFetching
    ? { kind: "fetching" }
    : trend && trendQuery.isError
      ? { kind: "stale", at: vnTime(trend.generatedAt) }
      : trend
        ? { kind: "fresh", at: vnTime(trend.generatedAt) }
        : null;

  const qualityLink = useCallback(
    (pageId) =>
      `/quality?auditFrom=${dataPeriod.current.from}&auditTo=${dataPeriod.current.to}${pageId ? `&auditPage=${encodeURIComponent(pageId)}` : ""}`,
    [dataPeriod],
  );

  const onPeriod = (key) => {
    setPeriodKey(key);
    store(PERIOD_STORAGE_KEY, key);
  };

  const onRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardTrend"] });
    queryClient.invalidateQueries({ queryKey: ["dashboardStaff"] });
  };

  const summary = view
    ? (() => {
        const word = PERIOD_WORD[dataPeriod.key];
        const { cur, kpi } = view;
        const [value, note] =
          metric === "revenue"
            ? [money(cur.revenue), `doanh thu ${word} · ${fmt(cur.orders)} đơn`]
            : metric === "orders"
              ? [fmt(cur.orders), `đơn ${word}${kpi.revenue.avgOrder != null ? ` · trung bình ${money(kpi.revenue.avgOrder)}/đơn` : ""}`]
              : metric === "qa"
                ? [
                    kpi.qa.value != null ? f1(kpi.qa.value) : "—",
                    `điểm trung bình ${word} · ${fmt(cur.audits)} audit${kpi.qa.pass != null ? `, ${f1(kpi.qa.pass)}% đạt` : ""}`,
                  ]
                : [fmt(cur.conversations), `hội thoại ${word}`];
        return (
          <>
            <span className="tabular-nums">{value}</span>
            <small className="ml-1 text-[13px] font-medium tracking-normal text-slate-500">{note}</small>
          </>
        );
      })()
    : null;

  const cardState = noChannels ? "empty" : trendLoading ? "loading" : "ready";
  const statsState = statsQuery.isPending ? "loading" : noChannels ? "empty" : "ready";
  const staffState = staffQuery.data ? "ready" : staffQuery.isError ? "error" : "loading";

  const jobFeed = (
    <JobFeedCard
      state={statsState}
      jobs={stats?.latestJobs ?? []}
      today={today}
      className={canViewStaff ? "col-span-2" : "self-start max-[1180px]:self-stretch"}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      <DashboardToolbar
        periodKey={periodKey}
        onPeriod={onPeriod}
        platform={platform}
        platforms={platforms}
        onPlatform={setPlatform}
        rangeLabel={period.rangeLabel}
        compareLabel={period.compareLabel}
        verdict={verdict}
        freshness={freshness}
        onRefresh={onRefresh}
      />

      <KpiRow
        data={noChannels ? null : (view?.kpi ?? null)}
        loading={!noChannels && trendLoading}
        failed={noChannels || trendFailed}
        compareLabel={dataPeriod.compareLabel}
      />

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] gap-4 max-[1180px]:flex max-[1180px]:flex-col">
        <TrendChart
          period={dataPeriod}
          model={chart}
          metric={metric}
          onMetric={setMetric}
          state={trendState}
          onRetry={() => trendQuery.refetch()}
          dimmed={trendQuery.isPlaceholderData}
          summary={summary}
          asOf={trend ? vnTime(trend.generatedAt) : null}
        />
        <div className="relative min-w-0">
          <PagePerformanceCard
            state={trendFailed ? "empty" : cardState}
            model={view?.pagePerformance ?? null}
            qualityLink={qualityLink}
            fill={wide}
          />
        </div>
        {canViewStaff ? (
          <StaffCard
            state={staffState}
            data={staffQuery.data}
            rangeLabel={period.rangeLabel}
            onRetry={() => staffQuery.refetch()}
            dimmed={staffQuery.isPlaceholderData}
          />
        ) : (
          jobFeed
        )}
        <ConcernCard
          state={trendFailed ? "empty" : cardState}
          concerns={view?.concerns ?? null}
          sentiment={view?.sentiment ?? null}
          compareLabel={dataPeriod.compareLabel}
        />
        {canViewStaff ? jobFeed : null}
      </div>
    </div>
  );
}
