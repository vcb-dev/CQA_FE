import { apiClient } from "@/lib/axios";

export type DashboardPlatform = "messenger" | "instagram" | "tiktok" | "other";

export interface DashboardJob {
  id: string;
  type: string;
  status: string;
  error?: string | null;
  summary?: {
    total?: number;
    processed?: number;
    audited?: number;
    errors?: number;
    avgScore?: number;
    auditCount?: number;
    fetched?: number;
    pagesTotal?: number;
    pagesProcessed?: number;
    totalConversations?: number;
    phase?: string;
  } | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface DashboardRecentAudit {
  id: string;
  agentName: string | null;
  customerName: string | null;
  channel: string | null;
  score: number | null;
  createdAt: string;
  pageId?: string | null;
  pageName?: string | null;
}

export interface DashboardStats {
  totalPages: number;
  enabledPages: number;
  totalAudits: number;
  avgScore: number;
  recentAudits: DashboardRecentAudit[];
  latestJobs: DashboardJob[];
}

export interface DashboardTrendSeriesRow {
  date: string;
  platform: DashboardPlatform;
  conversations: number;
  orders?: number;
  revenue?: number;
  audits: number;
  passed: number;
  scoreSum: number;
  positive: number;
  neutral: number;
  negative: number;
}

export interface DashboardTrendPage {
  pageId: string;
  pageName: string;
  platform: DashboardPlatform;
  enabled: boolean;
  configured: boolean;
  conversations?: number;
  orders?: number;
  revenue?: number;
  audits: number;
  passed: number;
  scoreSum: number;
  needsReply: number;
  lowSince: string | null;
}

export interface DashboardTrendIntent {
  platform: DashboardPlatform;
  label: string;
  count: number;
}

export interface DashboardTrend {
  generatedAt: string;
  from: string;
  to: string;
  compareFrom: string;
  compareTo: string;
  passScore: number;
  series: DashboardTrendSeriesRow[];
  pages: DashboardTrendPage[];
  intents: DashboardTrendIntent[];
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>("/cskh/dashboard/stats");
  return data;
}

export async function fetchDashboardTrend(
  params: { from: string; to: string; compareFrom: string; compareTo: string },
  signal?: AbortSignal,
): Promise<DashboardTrend> {
  const { data } = await apiClient.get<DashboardTrend>("/cskh/dashboard/trend", {
    params,
    signal,
  });
  return data;
}
