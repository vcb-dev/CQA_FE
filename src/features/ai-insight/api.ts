import { apiClient } from "@/lib/axios";

export type Severity = "bad" | "warn" | "watch";
export type EvidenceTab = "issue" | "question" | "praise";
export type SegmentKey = "priceLeave" | "considering" | "ready" | "comment" | "postbuy" | "unclear";

export interface InsightSignal {
  n: number;
  kind: string;
  severity: Severity;
  when: string;
  title: string;
  body: string;
  source: { icon: "truck" | "package" | "chat" | "tag" | "clock" | "journey"; label: string };
  memberKey: string;
  stats: Array<{ label: string; value: string; tone?: "bad" | "warn" }>;
  tip: string;
  related: { label: string; go: string } | null;
}

export type MemberFlag = "yes" | "no";

export interface SignalMember {
  conversationId: string;
  messageId: string | null;
  at: string | null;
  text: string | null;
  hitStart: number;
  hitLength: number;
  value: number | null;
  flag: boolean | null;
  customer: string;
  pageName: string;
  kind: string;
  fromAd: boolean;
  adTitle: string | null;
  messageType: string | null;
}

export interface SignalMembersResponse {
  ready: boolean;
  running: boolean;
  total: number;
  flagged: Record<MemberFlag, number>;
  nextOffset: number | null;
  items: SignalMember[];
}

export interface ConversationTarget {
  conversationId: string;
  week: string;
  messageId: string | null;
  hit: string;
  label: string | null;
  customer: string;
  pageName: string;
  kind: string;
}

export interface EvidenceItem {
  messageId: string;
  conversationId: string;
  pageId: string;
  pageName: string;
  kind: string;
  fromAd: boolean;
  customer: string;
  sentAt: string;
  text: string;
  hitStart: number;
  hitLength: number;
  group: string;
  label: string;
  tone: "bad" | "warn" | "mute" | "good";
}

interface Trend {
  spark: number[];
}

export interface TopicExample {
  messageId: string;
  conversationId: string;
  pageName: string;
  kind: string;
  customer: string;
  sentAt: string;
  text: string;
  hitStart: number;
  hitLength: number;
}

export interface TopicDetail {
  key: string;
  label: string;
  convs: number;
  share: number;
  change: number | null;
  rate: number | null;
  example: TopicExample | null;
}

export interface TopicItem {
  key: string;
  label: string;
  convs: number;
  share: number;
  change: number | null;
  rate: number | null;
  details?: TopicDetail[];
}

export interface AiInsightReport {
  weekStart: string;
  weekEnd: string;
  label: string;
  shortLabel: string;
  compareLabel: string | null;
  scope: string;
  scopeLabel: string;
  computedAt: string;
  ruleVersion: string;
  kpis: {
    customers: Trend & {
      value: number;
      prev: number | null;
      returningPct: number | null;
      returningDiff: number | null;
      fromAdPct: number | null;
    };
    buyers: Trend & { value: number; prev: number | null; ofInterestPct: number | null };
    signalHours: Trend & { value: number | null; prev: number | null };
    peakWindow: { label: string; start: number; value: number | null; reply15: number | null };
  };
  funnel: {
    total: number;
    steps: Array<{ key: "withText" | "interest" | "signal"; value: number; prev: number | null }>;
    greetingPct: number | null;
    afterQuotePct: number | null;
    waited1hPct: number | null;
    trend: Array<{ weekStart: string; label: string; withText: number; interest: number; signal: number }>;
  };
  signals: InsightSignal[];
  segments: {
    total: number;
    reply15Avg: number | null;
    items: Array<{
      key: SegmentKey;
      name: string;
      def: string;
      tip: string;
      n: number;
      change: number | null;
      msgPerCustomer: number | null;
      waitMin: number | null;
      reply15: number | null;
    }>;
  };
  heat: {
    inbound: number[][];
    reply15: Array<number | null>;
    peakDay: number;
    peakDayShare: number | null;
    peakBucket: number;
    weekendShare: number | null;
    highlightStart: number;
  };
  replyByPage: {
    overall: number | null;
    rows: Array<{ key: string; name: string; customers: number; rate: number | null; firstReplyMin: number | null; unanswered: number }>;
  };
  topics: {
    base: number;
    avgRate: number | null;
    items: TopicItem[];
  };
  decision: {
    buckets: Array<{ label: string; share: number; prevShare: number | null }>;
    medianMessages: number | null;
    repliedAfterQuotePct: number | null;
    lateChangePct: number | null;
  };
  products: {
    avgRate: number | null;
    items: Array<{ key: string; name: string; convs: number; signal: number; rate: number }>;
  };
  sources: {
    rows: Array<{
      key: string;
      name: string;
      type: "page" | "otherAds" | "organic";
      customers: number;
      signalRate: number | null;
      signalHours: number | null;
      firstReplyMin: number | null;
      returningPct: number | null;
      costPerConversation: number | null;
    }>;
    total: {
      customers: number;
      signalRate: number | null;
      signalHours: number | null;
      firstReplyMin: number | null;
      returningPct: number | null;
      costPerConversation: number | null;
    };
  };
  evidence: Record<EvidenceTab, EvidenceItem[]>;
  coverage: {
    scanned: { num: number; den: number };
    product: { num: number; den: number };
    staffReply: { num: number; den: number; auto: number };
    adSpend: { num: number; den: number };
  };
}

export interface AiInsightScope {
  scope: string;
  label: string;
  conversations: number;
  group: "all" | "kind" | "page";
}

export interface AiInsightResponse {
  weeks: Array<{ weekStart: string; label: string }>;
  running: string | null;
  latestExpected: string;
  scopes: AiInsightScope[];
  selected: { week: string; scope: string | null } | null;
  report: AiInsightReport | null;
}

export interface ThreadMessage {
  id: string;
  direction: "inbound" | "outbound";
  messageType: string;
  text: string;
  attachmentUrl: string | null;
  sentAt: string;
  phase: "before" | "week" | "after";
}

export interface InsightThread {
  conversation: {
    id: string;
    customer: string;
    pageName: string;
    kind: string;
    kindLabel: string;
    fromAd: boolean;
    adTitle: string | null;
    weekLabel: string;
  } | null;
  messages: ThreadMessage[];
  hasEarlier: boolean;
  moreAfter: boolean;
}

export async function fetchAiInsightReport(params: { week?: string; scope?: string }): Promise<AiInsightResponse> {
  const { data } = await apiClient.get<AiInsightResponse>("/cskh/ai-insights/report", {
    params: { week: params.week || undefined, scope: params.scope || undefined },
  });
  return data;
}

export async function fetchSignalMembers(params: {
  week: string;
  scope?: string;
  key: string;
  flag?: MemberFlag;
  offset: number;
  limit: number;
}): Promise<SignalMembersResponse> {
  const { data } = await apiClient.get<SignalMembersResponse>("/cskh/ai-insights/signals/members", {
    params: { ...params, scope: params.scope || undefined },
  });
  return data;
}

export async function fetchInsightThread(conversationId: string, params: { week: string; before?: string }): Promise<InsightThread> {
  const { data } = await apiClient.get<InsightThread>(`/cskh/ai-insights/conversations/${conversationId}`, { params });
  return data;
}

export async function runAiInsight(weekStart?: string): Promise<{ started: boolean; weekStart?: string; running?: string }> {
  const { data } = await apiClient.post("/cskh/ai-insights/runs", weekStart ? { weekStart } : {});
  return data;
}
