export type DashboardPeriodKey = "today" | "7d" | "month";

export interface DayRange {
  from: string;
  to: string;
}

export interface DashboardPeriod {
  key: DashboardPeriodKey;
  today: string;
  current: DayRange;
  compare: DayRange;
  chartDays: string[];
  chartPrevDays: Array<string | null>;
  request: { from: string; to: string; compareFrom: string; compareTo: string };
  rangeLabel: string;
  compareLabel: string;
  chartSubtitle: string;
  currentSeriesLabel: string;
  prevSeriesLabel: string;
}

const VN_TZ = "Asia/Ho_Chi_Minh";
const WEEKDAYS = ["Chủ nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

export function vnToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: VN_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function toUtc(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function fromUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(ymd: string, days: number): string {
  const d = toUtc(ymd);
  d.setUTCDate(d.getUTCDate() + days);
  return fromUtc(d);
}

export function dayList(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function dayMonth(ymd: string): string {
  const [, m, d] = ymd.split("-");
  return `${d}/${m}`;
}

export function weekdayLabel(ymd: string): string {
  return WEEKDAYS[toUtc(ymd).getUTCDay()];
}

function monthStart(ymd: string): string {
  return `${ymd.slice(0, 7)}-01`;
}

function monthEnd(ymd: string): string {
  const d = toUtc(monthStart(ymd));
  d.setUTCMonth(d.getUTCMonth() + 1);
  d.setUTCDate(0);
  return fromUtc(d);
}

function monthNumber(ymd: string): number {
  return Number(ymd.slice(5, 7));
}

function fullDate(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
}

function spanLabel(range: DayRange): string {
  if (range.from === range.to) return dayMonth(range.from);
  if (range.from.slice(0, 7) === range.to.slice(0, 7)) {
    return `${range.from.slice(8, 10)}–${dayMonth(range.to)}`;
  }
  return `${dayMonth(range.from)}–${dayMonth(range.to)}`;
}

export function buildDashboardPeriod(key: DashboardPeriodKey, today: string = vnToday()): DashboardPeriod {
  if (key === "month") {
    const curFrom = monthStart(today);
    const prevStart = monthStart(addDays(curFrom, -1));
    const prevEnd = monthEnd(prevStart);
    const dayIndex = Number(today.slice(8, 10)) - 1;
    const compareTo = addDays(prevStart, dayIndex) > prevEnd ? prevEnd : addDays(prevStart, dayIndex);
    const chartDays = dayList(curFrom, monthEnd(today));
    const prevDays = dayList(prevStart, prevEnd);
    const compare = { from: prevStart, to: compareTo };
    const current = { from: curFrom, to: today };
    return {
      key,
      today,
      current,
      compare,
      chartDays,
      chartPrevDays: chartDays.map((_, i) => prevDays[i] ?? null),
      request: { from: curFrom, to: today, compareFrom: prevStart, compareTo: prevEnd },
      rangeLabel: `${spanLabel(current)}/${today.slice(0, 4)}`,
      compareLabel: spanLabel(compare),
      chartSubtitle: `Tháng ${monthNumber(today)}/${today.slice(0, 4)} so với tháng ${monthNumber(prevStart)}`,
      currentSeriesLabel: `Tháng ${monthNumber(today)}`,
      prevSeriesLabel: `Tháng ${monthNumber(prevStart)}`,
    };
  }
  if (key === "7d") {
    const current = { from: addDays(today, -6), to: today };
    const compare = { from: addDays(today, -13), to: addDays(today, -7) };
    const chartDays = dayList(current.from, current.to);
    const prevDays = dayList(compare.from, compare.to);
    return {
      key,
      today,
      current,
      compare,
      chartDays,
      chartPrevDays: prevDays,
      request: { from: current.from, to: current.to, compareFrom: compare.from, compareTo: compare.to },
      rangeLabel: `${spanLabel(current)}/${today.slice(0, 4)}`,
      compareLabel: spanLabel(compare),
      chartSubtitle: "7 ngày gần nhất so với 7 ngày trước đó",
      currentSeriesLabel: "Kỳ này",
      prevSeriesLabel: "Kỳ trước",
    };
  }
  const current = { from: today, to: today };
  const compare = { from: addDays(today, -1), to: addDays(today, -1) };
  const chartFrom = addDays(today, -13);
  const chartDays = dayList(chartFrom, today);
  const prevDays = dayList(addDays(today, -27), addDays(today, -14));
  return {
    key,
    today,
    current,
    compare,
    chartDays,
    chartPrevDays: prevDays,
    request: { from: today, to: today, compareFrom: addDays(today, -27), compareTo: addDays(today, -1) },
    rangeLabel: `${weekdayLabel(today)}, ${fullDate(today)}`,
    compareLabel: "hôm qua",
    chartSubtitle: "14 ngày gần nhất so với 14 ngày trước đó",
    currentSeriesLabel: "Kỳ này",
    prevSeriesLabel: "Kỳ trước",
  };
}
