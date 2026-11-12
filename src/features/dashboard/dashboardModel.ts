import type {
  DashboardJob,
  DashboardPlatform,
  DashboardStats,
  DashboardTrend,
  DashboardTrendPage,
} from "./dashboardApi";
import { type DashboardPeriod, type DayRange, dayList, dayMonth } from "./dashboardPeriod";

export type PlatformFilter = "all" | Exclude<DashboardPlatform, "other">;
export type ChartMetric = "revenue" | "orders" | "conv" | "qa";
export type Severity = "bad" | "warn" | "watch";
export type ScoreStatus = "good" | "warn" | "bad";

export const PASS_SCORE = 70;
export const GOOD_SCORE = 80;
const MIN_PAGE_AUDITS = 5;
const MIN_DAY_AUDITS = 10;
const VN_TZ = "Asia/Ho_Chi_Minh";

export const PLATFORM_LABEL: Record<DashboardPlatform, string> = {
  messenger: "Messenger",
  instagram: "Instagram",
  tiktok: "TikTok",
  other: "Khác",
};

const INTENT_LABEL: Record<string, string> = {
  "hỏi giá": "Hỏi giá",
  "tư vấn sp": "Tư vấn sản phẩm",
  "chốt đơn": "Chốt đơn",
  "khiếu nại": "Khiếu nại",
  "hỏi ship": "Hỏi phí ship",
  "hỏi size": "Hỏi size",
  "đổi trả": "Đổi trả",
  "hỏi tiến độ đơn hàng": "Hỏi tiến độ đơn",
  "hỏi địa chỉ": "Hỏi địa chỉ",
  "hỏi tình trạng hàng": "Hỏi tình trạng hàng",
};

const nf = new Intl.NumberFormat("vi-VN");
export const fmt = (n: number) => nf.format(Math.round(n));
export const f1 = (n: number) =>
  n.toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const compact = (n: number) =>
  n.toLocaleString("vi-VN", { maximumFractionDigits: Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 10 ? 1 : 2 });

export const money = (n: number) => `${fmt(n)} ₫`;

export function moneyParts(n: number): { value: string; unit: string } {
  const abs = Math.abs(n);
  if (abs >= 1e9) return { value: compact(n / 1e9), unit: "tỷ ₫" };
  if (abs >= 1e6) return { value: compact(n / 1e6), unit: "triệu ₫" };
  return { value: fmt(n), unit: "₫" };
}

export function moneyShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${compact(n / 1e9)} tỷ`;
  if (abs >= 1e6) return `${compact(n / 1e6)} tr`;
  if (abs >= 1e3) return `${compact(n / 1e3)}k`;
  return fmt(n);
}

export function vnTime(iso: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: VN_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function vnDay(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: VN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function scoreStatus(score: number): ScoreStatus {
  if (score >= GOOD_SCORE) return "good";
  if (score >= PASS_SCORE) return "warn";
  return "bad";
}

export interface DayTotals {
  conversations: number;
  orders: number;
  revenue: number;
  audits: number;
  passed: number;
  scoreSum: number;
  positive: number;
  neutral: number;
  negative: number;
}

const emptyTotals = (): DayTotals => ({
  conversations: 0,
  orders: 0,
  revenue: 0,
  audits: 0,
  passed: 0,
  scoreSum: 0,
  positive: 0,
  neutral: 0,
  negative: 0,
});

const matchesPlatform = (platform: DashboardPlatform, filter: PlatformFilter) =>
  filter === "all" || platform === filter;

export function dailyTotals(trend: DashboardTrend, filter: PlatformFilter): Map<string, DayTotals> {
  const map = new Map<string, DayTotals>();
  for (const row of trend.series) {
    if (!matchesPlatform(row.platform, filter)) continue;
    const t = map.get(row.date) ?? emptyTotals();
    t.conversations += row.conversations;
    t.orders += row.orders ?? 0;
    t.revenue += row.revenue ?? 0;
    t.audits += row.audits;
    t.passed += row.passed;
    t.scoreSum += row.scoreSum;
    t.positive += row.positive;
    t.neutral += row.neutral;
    t.negative += row.negative;
    map.set(row.date, t);
  }
  return map;
}

export function sumRange(daily: Map<string, DayTotals>, range: DayRange): DayTotals {
  const total = emptyTotals();
  for (const d of dayList(range.from, range.to)) {
    const t = daily.get(d);
    if (!t) continue;
    total.conversations += t.conversations;
    total.orders += t.orders;
    total.revenue += t.revenue;
    total.audits += t.audits;
    total.passed += t.passed;
    total.scoreSum += t.scoreSum;
    total.positive += t.positive;
    total.neutral += t.neutral;
    total.negative += t.negative;
  }
  return total;
}

export const qaAvg = (t: DayTotals | undefined) => (t && t.audits > 0 ? t.scoreSum / t.audits : null);
export const passRate = (t: DayTotals | undefined) => (t && t.audits > 0 ? (t.passed / t.audits) * 100 : null);

export const avgOrderValue = (t: DayTotals | undefined) => (t && t.orders > 0 ? t.revenue / t.orders : null);

export function metricValue(t: DayTotals | undefined, metric: ChartMetric): number | null {
  if (metric === "qa") return qaAvg(t);
  if (metric === "revenue") return t?.revenue ?? 0;
  if (metric === "orders") return t?.orders ?? 0;
  return t?.conversations ?? 0;
}

export function filteredPages(trend: DashboardTrend, filter: PlatformFilter): DashboardTrendPage[] {
  return trend.pages.filter((p) => matchesPlatform(p.platform, filter));
}

export type PlatformSplit = Array<{ platform: DashboardPlatform; label: string; count: number }>;

const PLATFORM_ORDER: DashboardPlatform[] = ["messenger", "instagram", "tiktok", "other"];

function toSplit(byPlatform: Map<DashboardPlatform, number>): PlatformSplit {
  return PLATFORM_ORDER.filter((pl) => (byPlatform.get(pl) ?? 0) > 0).map((pl) => ({
    platform: pl,
    label: PLATFORM_LABEL[pl],
    count: byPlatform.get(pl) ?? 0,
  }));
}

export interface NeedsReplyModel {
  total: number;
  share: number | null;
  split: PlatformSplit;
}

export function needsReplyModel(
  pages: DashboardTrendPage[],
  currentConversations: number,
): NeedsReplyModel {
  const byPlatform = new Map<DashboardPlatform, number>();
  let total = 0;
  for (const p of pages) {
    if (p.needsReply <= 0) continue;
    total += p.needsReply;
    byPlatform.set(p.platform, (byPlatform.get(p.platform) ?? 0) + p.needsReply);
  }
  return {
    total,
    share: currentConversations > 0 ? (total / currentConversations) * 100 : null,
    split: toSplit(byPlatform),
  };
}

export function ordersSplit(trend: DashboardTrend, filter: PlatformFilter, range: DayRange): PlatformSplit {
  const byPlatform = new Map<DashboardPlatform, number>();
  for (const row of trend.series) {
    if (!matchesPlatform(row.platform, filter) || row.date < range.from || row.date > range.to) continue;
    const orders = row.orders ?? 0;
    if (orders > 0) byPlatform.set(row.platform, (byPlatform.get(row.platform) ?? 0) + orders);
  }
  return toSplit(byPlatform);
}

export interface ChartModel {
  days: string[];
  prevDays: Array<string | null>;
  cur: Array<number | null>;
  prev: Array<number | null>;
  lastIndex: number;
}

export function chartModel(
  daily: Map<string, DayTotals>,
  period: DashboardPeriod,
  metric: ChartMetric,
): ChartModel {
  const cur = period.chartDays.map((d) => (d > period.today ? null : metricValue(daily.get(d), metric)));
  const prev = period.chartPrevDays.map((d) => (d ? metricValue(daily.get(d), metric) : null));
  let lastIndex = 0;
  period.chartDays.forEach((d, i) => {
    if (d <= period.today) lastIndex = i;
  });
  return { days: period.chartDays, prevDays: period.chartPrevDays, cur, prev, lastIndex };
}

export type QueueSource = "audit" | "job" | "inbox" | "trend" | "channel";

export interface QueueItem {
  id: string;
  n: number;
  severity: Severity;
  when: string;
  title: string;
  body: string;
  source: QueueSource;
  sourceLabel: string;
  action: { label: string; to: string };
  primary?: boolean;
  pinDate: string | null;
  metric: ChartMetric;
}

export function jobLabel(type: string): string {
  if (type === "audit") return "Chấm điểm AI";
  if (type === "monitor") return "Đồng bộ tin nhắn";
  if (type === "inbox-backfill") return "Đồng bộ lịch sử hội thoại";
  return type;
}

export type JobState = "run" | "ok" | "paused" | "cancelled" | "err";

export function jobState(job: DashboardJob): JobState {
  if (job.status === "running") return "run";
  if (job.status === "done" || job.status === "completed") return "ok";
  if (job.status === "paused") return "paused";
  if (job.status === "cancelled" || /hủy/i.test(job.error ?? "")) return "cancelled";
  return "err";
}

const qualityLink = (range: DayRange, pageId?: string) =>
  `/quality?auditFrom=${range.from}&auditTo=${range.to}${pageId ? `&auditPage=${encodeURIComponent(pageId)}` : ""}`;

const truncate = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1)}…` : s);

export function buildQueue(params: {
  trend: DashboardTrend | undefined;
  stats: DashboardStats | undefined;
  period: DashboardPeriod;
  filter: PlatformFilter;
  daily: Map<string, DayTotals> | undefined;
}): QueueItem[] {
  const { trend, stats, period, filter, daily } = params;
  const items: Omit<QueueItem, "n">[] = [];
  const inChart = (d: string | null) => (d && period.chartDays.includes(d) ? d : null);

  if (trend && daily) {
    const pages = filteredPages(trend, filter);
    const lowPages = pages
      .filter((p) => p.audits >= MIN_PAGE_AUDITS && p.scoreSum / p.audits < PASS_SCORE)
      .sort((a, b) => a.scoreSum / a.audits - b.scoreSum / b.audits);
    lowPages.slice(0, 2).forEach((p, i) => {
      const avg = p.scoreSum / p.audits;
      items.push({
        id: `page-${p.pageId}`,
        severity: "bad",
        when: p.lowSince ? `Từ ${dayMonth(p.lowSince)}` : "Trong kỳ",
        title: `${p.pageName}: điểm QA ${f1(avg)}`,
        body: `${fmt(p.audits - p.passed)}/${fmt(p.audits)} audit không đạt trong kỳ.${p.lowSince ? ` Dưới ngưỡng ${PASS_SCORE} từ ${dayMonth(p.lowSince)}.` : ""}`,
        source: "audit",
        sourceLabel: "Audit AI",
        action: { label: "Xem audit của page", to: qualityLink(period.current, p.pageId) },
        primary: i === 0,
        pinDate: inChart(p.lowSince),
        metric: "qa",
      });
    });
    if (lowPages.length > 2) {
      items.push({
        id: "page-rest",
        severity: "bad",
        when: "Trong kỳ",
        title: `${fmt(lowPages.length - 2)} page khác dưới ngưỡng ${PASS_SCORE}`,
        body: lowPages
          .slice(2, 5)
          .map((p) => p.pageName)
          .join(", ")
          .concat(lowPages.length > 5 ? "…" : "."),
        source: "audit",
        sourceLabel: "Audit AI",
        action: { label: "Xem audit trong kỳ", to: qualityLink(period.current) },
        pinDate: null,
        metric: "qa",
      });
    }

    const cur = sumRange(daily, period.current);
    const avg = qaAvg(cur);
    const auditedDays = dayList(period.current.from, period.current.to)
      .map((d) => ({ d, t: daily.get(d) }))
      .filter((x): x is { d: string; t: DayTotals } => !!x.t && x.t.audits >= MIN_DAY_AUDITS);
    if (avg != null && cur.audits >= MIN_DAY_AUDITS && avg < PASS_SCORE) {
      const lowest = [...auditedDays].sort((a, b) => a.t.scoreSum / a.t.audits - b.t.scoreSum / b.t.audits)[0];
      items.push({
        id: "qa-period",
        severity: "bad",
        when: period.key === "today" ? "Hôm nay" : `Kỳ ${period.rangeLabel.split("/").slice(0, 2).join("/")}`,
        title: `Điểm QA trung bình ${f1(avg)}, dưới ngưỡng ${PASS_SCORE}`,
        body: `${fmt(cur.audits - cur.passed)}/${fmt(cur.audits)} audit không đạt.${lowest && period.key !== "today" ? ` Thấp nhất ngày ${dayMonth(lowest.d)} (${f1(lowest.t.scoreSum / lowest.t.audits)}).` : ""}`,
        source: "trend",
        sourceLabel: "Xu hướng",
        action: { label: "Xem audit trong kỳ", to: qualityLink(period.current) },
        pinDate: lowest && period.key !== "today" ? inChart(lowest.d) : null,
        metric: "qa",
      });
    } else {
      auditedDays
        .filter((x) => x.t.scoreSum / x.t.audits < PASS_SCORE)
        .sort((a, b) => a.t.scoreSum / a.t.audits - b.t.scoreSum / b.t.audits)
        .slice(0, 2)
        .forEach(({ d, t }) => {
          items.push({
            id: `qa-day-${d}`,
            severity: "watch",
            when: dayMonth(d),
            title: `Ngày ${dayMonth(d)}: điểm QA trung bình ${f1(t.scoreSum / t.audits)}`,
            body: `${fmt(t.audits - t.passed)}/${fmt(t.audits)} audit không đạt ngưỡng ${PASS_SCORE}.`,
            source: "trend",
            sourceLabel: "Xu hướng",
            action: { label: `Xem audit ngày ${dayMonth(d)}`, to: qualityLink({ from: d, to: d }) },
            pinDate: inChart(d),
            metric: "qa",
          });
        });
    }

    const nr = needsReplyModel(pages, cur.conversations);
    if (nr.total > 0) {
      const top = filter === "all" && nr.split.length > 1 ? [...nr.split].sort((a, b) => b.count - a.count)[0] : null;
      items.push({
        id: "needs-reply",
        severity: "warn",
        when: "Hiện tại",
        title: `${fmt(nr.total)} hội thoại đang chờ phản hồi`,
        body: `${nr.share != null ? `Chiếm ${f1(nr.share)}% hội thoại hoạt động trong kỳ.` : "Trong các hội thoại hoạt động của kỳ."}${top ? ` ${top.label} nhiều nhất (${fmt(top.count)}).` : ""}`,
        source: "inbox",
        sourceLabel: "Hộp thư",
        action: { label: "Mở hộp thư", to: "/conversations?filter=unreplied" },
        pinDate: null,
        metric: "conv",
      });
    }

    const disabled = pages.filter((p) => p.configured && !p.enabled);
    const configured = pages.filter((p) => p.configured);
    if (disabled.length > 0) {
      items.push({
        id: "channels-off",
        severity: "watch",
        when: "Cấu hình",
        title: `${fmt(disabled.length)}/${fmt(configured.length)} kênh đang tắt đồng bộ`,
        body: `${disabled
          .slice(0, 2)
          .map((p) => p.pageName)
          .join(", ")}${disabled.length > 2 ? "…" : ""} không nhận tin nhắn mới và không được chấm điểm.`,
        source: "channel",
        sourceLabel: "Page / Kênh",
        action: { label: "Kiểm tra kênh", to: "/settings?tab=channel" },
        pinDate: null,
        metric: "conv",
      });
    }
  }

  for (const job of stats?.latestJobs ?? []) {
    if (jobState(job) !== "err") continue;
    const day = vnDay(job.startedAt);
    if (day < period.current.from || day > period.current.to) continue;
    items.push({
      id: `job-${job.id}`,
      severity: "bad",
      when: day === period.today ? `${vnTime(job.startedAt)} hôm nay` : `${dayMonth(day)} ${vnTime(job.startedAt)}`,
      title: `${jobLabel(job.type)} bị lỗi`,
      body: truncate(job.error?.trim() || "Tiến trình dừng trước khi hoàn tất.", 140),
      source: "job",
      sourceLabel: "Tiến trình nền",
      action: { label: "Xem tiến trình", to: "/quality" },
      pinDate: inChart(day),
      metric: job.type === "audit" ? "qa" : "conv",
    });
  }

  const rank: Record<Severity, number> = { bad: 0, warn: 1, watch: 2 };
  return items
    .map((item, i) => ({ item, i }))
    .sort((a, b) => rank[a.item.severity] - rank[b.item.severity] || a.i - b.i)
    .map(({ item }, i) => ({ ...item, n: i + 1 }));
}

export interface PagePerformanceRow {
  page: DashboardTrendPage;
  conversations: number;
  orders: number;
  revenue: number;
  avg: number | null;
  status: ScoreStatus | null;
}

export interface PagePerformanceModel {
  rows: PagePerformanceRow[];
  active: number;
  hasRevenue: boolean;
}

export function pagePerformanceModel(pages: DashboardTrendPage[], limit = 6): PagePerformanceModel {
  const rows = pages
    .map((page) => {
      const avg = page.audits > 0 ? page.scoreSum / page.audits : null;
      return {
        page,
        conversations: page.conversations ?? 0,
        orders: page.orders ?? 0,
        revenue: page.revenue ?? 0,
        avg,
        status: avg == null ? null : scoreStatus(avg),
      };
    })
    .filter((r) => r.conversations > 0 || r.orders > 0 || r.avg != null)
    .sort((a, b) => b.revenue - a.revenue || b.orders - a.orders || b.conversations - a.conversations);
  return {
    rows: rows.slice(0, limit),
    active: rows.length,
    hasRevenue: rows.some((r) => r.revenue > 0),
  };
}

export interface ConcernModel {
  items: Array<{ label: string; count: number; pct: number }>;
  total: number;
  unknown: number;
}

export function concernModel(trend: DashboardTrend, filter: PlatformFilter, maxSlices = 5): ConcernModel {
  const counts = new Map<string, number>();
  let unknown = 0;
  for (const it of trend.intents) {
    if (!matchesPlatform(it.platform, filter)) continue;
    if (it.label === "chưa rõ") {
      unknown += it.count;
      continue;
    }
    counts.set(it.label, (counts.get(it.label) ?? 0) + it.count);
  }
  const other = counts.get("khác") ?? 0;
  counts.delete("khác");
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const head = sorted.slice(0, maxSlices);
  const rest = sorted.slice(maxSlices).reduce((s, [, c]) => s + c, 0) + other;
  const rows = head.map(([label, count]) => ({
    label: INTENT_LABEL[label] ?? label.charAt(0).toUpperCase() + label.slice(1),
    count,
  }));
  if (rest > 0) rows.push({ label: "Khác", count: rest });
  const total = rows.reduce((s, r) => s + r.count, 0);
  return {
    items: rows.map((r) => ({ ...r, pct: total > 0 ? Math.round((r.count / total) * 100) : 0 })),
    total,
    unknown,
  };
}

export interface SentimentModel {
  positive: number;
  neutral: number;
  negative: number;
  analyzed: number;
  positiveChange: number | null;
}

function sentimentShare(t: DayTotals) {
  const analyzed = t.positive + t.neutral + t.negative;
  if (analyzed === 0) return null;
  return {
    analyzed,
    positive: (t.positive / analyzed) * 100,
    neutral: (t.neutral / analyzed) * 100,
    negative: (t.negative / analyzed) * 100,
  };
}

export function sentimentModel(daily: Map<string, DayTotals>, period: DashboardPeriod): SentimentModel | null {
  const cur = sentimentShare(sumRange(daily, period.current));
  if (!cur) return null;
  const prev = sentimentShare(sumRange(daily, period.compare));
  return {
    positive: cur.positive,
    neutral: cur.neutral,
    negative: cur.negative,
    analyzed: cur.analyzed,
    positiveChange: prev ? cur.positive - prev.positive : null,
  };
}

export function availablePlatforms(trend: DashboardTrend | undefined): PlatformFilter[] {
  const set = new Set<PlatformFilter>(["all"]);
  for (const p of trend?.pages ?? []) {
    if (p.configured && p.platform !== "other") set.add(p.platform);
  }
  return (["all", "messenger", "instagram", "tiktok"] as PlatformFilter[]).filter((p) => set.has(p));
}
