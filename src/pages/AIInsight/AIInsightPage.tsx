import { ArrowsClockwise, HourglassMedium, WarningCircle } from "@phosphor-icons/react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { toUserFacingError } from "@/lib/userFacingError";
import { DashCard, EmptyBlock } from "@/features/dashboard/DashboardParts";
import { usePermission } from "@/features/user-access/api";
import { type ConversationTarget, fetchAiInsightReport, runAiInsight } from "@/features/ai-insight/api";
import { ConversationDrawer } from "@/features/ai-insight/ConversationDrawer";
import { InsightToolbar } from "@/features/ai-insight/InsightToolbar";
import { MarkContext, SectionHead } from "@/features/ai-insight/InsightParts";
import { ConversionTrendCard } from "@/features/ai-insight/ConversionTrendCard";
import { FunnelCard } from "@/features/ai-insight/JourneySection";
import { DecisionCard, ProductsCard, TopicsCard } from "@/features/ai-insight/NeedsSection";
import { OverviewKpis } from "@/features/ai-insight/OverviewKpis";
import { SegmentsCard } from "@/features/ai-insight/SegmentsCard";
import { SignalsCard } from "@/features/ai-insight/SignalsCard";
import { SourcesCard } from "@/features/ai-insight/SourcesCard";
import { HeatmapCard, ReplyByPageCard } from "@/features/ai-insight/TimingSection";

const SECTION_FOR_GO: Record<string, string> = {
  "sec-seg": "aii-seg",
  "sec-time": "aii-time",
  "sec-need": "aii-need",
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function errorMessage(e: unknown): string {
  const raw = (e as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? (e as Error)?.message;
  return toUserFacingError(raw) || "Không tải được báo cáo. Thử làm mới lại sau ít phút.";
}

export default function AIInsightPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const weekParam = params.get("week") || undefined;
  const scopeParam = params.get("scope") || undefined;
  const canRun = usePermission("insight.run");
  const [lit, setLit] = useState<number | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [drawerTarget, setDrawerTarget] = useState<ConversationTarget | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);

  const query = useQuery({
    queryKey: ["aiInsightReport", weekParam ?? "", scopeParam ?? ""],
    queryFn: () => fetchAiInsightReport({ week: weekParam, scope: scopeParam }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    refetchInterval: (q) => (q.state.data?.running ? 10_000 : false),
  });
  const data = query.data;
  const report = data?.report ?? null;
  const loading = query.isPending;
  const week = data?.selected?.week ?? weekParam;
  const scope = data?.selected?.scope ?? scopeParam;

  const setParam = (key: "week" | "scope", value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key === "week" && scope) next.set("scope", scope);
    setParams(next, { replace: true });
  };

  const run = useMutation({
    mutationFn: () => runAiInsight(week),
    onSuccess: (res) => {
      if (res.started) toast.success("Đã bắt đầu tổng hợp lại báo cáo tuần");
      else toast.info("Đang có một lượt tổng hợp chạy, thử lại sau khi xong");
      queryClient.invalidateQueries({ queryKey: ["aiInsightReport"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const signals = useMemo(() => report?.signals ?? [], [report]);
  const selectedSignal = signals.find((s) => s.memberKey === selectedKey) ?? signals[0] ?? null;

  const jump = useCallback(
    (n: number) => {
      const signal = signals.find((s) => s.n === n);
      if (!signal) return;
      setSelectedKey(signal.memberKey);
      setLit(n);
      scrollToId("aii-signals");
      requestAnimationFrame(() => document.getElementById(`aii-signal-tab-${n}`)?.focus({ preventScroll: true }));
    },
    [signals],
  );

  const onGo = useCallback(
    (go: string) => {
      if (go.startsWith("link:")) {
        navigate(go.slice(5));
        return;
      }
      scrollToId(SECTION_FOR_GO[go] ?? go);
    },
    [navigate],
  );

  const markValue = useMemo(() => ({ signals, lit, setLit, jump }), [signals, lit, jump]);
  const openDrawer = useCallback((target: ConversationTarget, el: HTMLButtonElement) => {
    lastTrigger.current = el;
    setDrawerTarget(target);
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawerTarget(null);
    if (lastTrigger.current?.isConnected) lastTrigger.current.focus();
  }, []);

  const toolbar = (
    <InsightToolbar
      data={data}
      week={week}
      scope={scope ?? undefined}
      onWeek={(w) => setParam("week", w)}
      onScope={(s) => setParam("scope", s)}
      onRefresh={() => queryClient.invalidateQueries({ queryKey: ["aiInsightReport"] })}
      refreshing={query.isFetching && !loading}
      canRun={canRun}
      onRun={() => run.mutate()}
      runPending={run.isPending}
    />
  );

  if (query.isError && !data) {
    return (
      <div className="flex flex-col gap-6">
        {toolbar}
        <DashCard>
          <EmptyBlock
            icon={<WarningCircle weight="duotone" />}
            tone="bad"
            title="Không tải được báo cáo"
            actions={
              <button
                type="button"
                onClick={() => query.refetch()}
                className="inline-flex h-[34px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 hover:border-slate-300"
              >
                <ArrowsClockwise size={14} weight="bold" />
                Thử lại
              </button>
            }
          >
            {errorMessage(query.error)}
          </EmptyBlock>
        </DashCard>
      </div>
    );
  }

  if (data && !data.weeks.length) {
    return (
      <div className="flex flex-col gap-6">
        {toolbar}
        <DashCard>
          <EmptyBlock
            icon={<HourglassMedium weight="duotone" />}
            title={data.running ? "Đang tổng hợp báo cáo tuần đầu tiên" : "Chưa có báo cáo tuần nào"}
            actions={
              canRun && !data.running ? (
                <button
                  type="button"
                  onClick={() => run.mutate()}
                  disabled={run.isPending}
                  className="inline-flex h-[34px] items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-[12.5px] font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  Tổng hợp tuần gần nhất
                </button>
              ) : null
            }
          >
            Báo cáo được tổng hợp tự động lúc 05:30 sáng thứ Hai sau khi tuần kết thúc, từ tin nhắn, bình luận và chi phí quảng cáo.
          </EmptyBlock>
        </DashCard>
      </div>
    );
  }

  const noReport = !loading && !report;

  return (
    <MarkContext.Provider value={markValue}>
      <div className={cn("flex flex-col gap-6 transition-opacity", query.isPlaceholderData && "opacity-60")}>
        {toolbar}

        {noReport ? (
          <DashCard>
            <EmptyBlock icon={<HourglassMedium weight="duotone" />} title="Kênh này không có khách nhắn tin trong tuần">
              Chọn tuần khác hoặc đổi sang kênh khác để xem báo cáo.
            </EmptyBlock>
          </DashCard>
        ) : (
          <>
            <section id="aii-overview" aria-labelledby="aii-h-overview" className="flex scroll-mt-16 flex-col gap-3.5">
              <SectionHead
                id="aii-h-overview"
                title={report ? `Tổng quan tuần ${report.shortLabel}` : "Tổng quan tuần"}
                sub={report ? `${report.scopeLabel} · mỗi khách là một người đã nhắn tin hoặc bình luận với page trong tuần` : "Đang tổng hợp số liệu tuần…"}
              />
              <OverviewKpis report={report} loading={loading} />
            </section>

            <section id="aii-journey" aria-labelledby="aii-h-journey" className="flex scroll-mt-16 flex-col gap-3.5">
              <SectionHead id="aii-h-journey" title="Hành trình mua" sub="Từ lúc nhắn tin đến lúc muốn mua, khách dừng lại ở bước nào" />
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] gap-4 max-[1180px]:grid-cols-1">
                <FunnelCard report={report} loading={loading} />
                <ConversionTrendCard report={report} loading={loading} />
              </div>
            </section>

            <section id="aii-seg" aria-labelledby="aii-h-seg" className="flex scroll-mt-16 flex-col gap-3.5">
              <SectionHead id="aii-h-seg" title="Nhóm khách" sub="Chia khách theo những gì họ nhắn trong tuần; mỗi khách chỉ thuộc một nhóm" />
              <SegmentsCard report={report} loading={loading} />
            </section>

            <section id="aii-time" aria-labelledby="aii-h-time" className="flex scroll-mt-16 flex-col gap-3.5">
              <SectionHead id="aii-h-time" title="Giờ nhắn tin & tốc độ trả lời" sub="Khách nhắn nhiều vào lúc nào và từng page trả lời nhanh hay chậm" />
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(340px,1fr)] gap-4 max-[1180px]:grid-cols-1">
                <HeatmapCard report={report} loading={loading} />
                <ReplyByPageCard report={report} loading={loading} />
              </div>
            </section>

            <section id="aii-need" aria-labelledby="aii-h-need" className="flex scroll-mt-16 flex-col gap-3.5">
              <SectionHead id="aii-h-need" title="Nhu cầu & quyết định mua" sub="Khách hỏi gì, bao lâu thì muốn mua và sản phẩm nào được hỏi nhiều" />
              <TopicsCard
                report={report}
                loading={loading}
                onOpen={(d, el) =>
                  d.example &&
                  openDrawer(
                    {
                      conversationId: d.example.conversationId,
                      week: report!.weekStart,
                      messageId: d.example.messageId,
                      hit: d.example.text.slice(d.example.hitStart, d.example.hitStart + d.example.hitLength),
                      label: d.label,
                      customer: d.example.customer,
                      pageName: d.example.pageName,
                      kind: d.example.kind,
                    },
                    el,
                  )
                }
              />
              <div className="grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
                <DecisionCard report={report} loading={loading} />
                <ProductsCard report={report} loading={loading} />
              </div>
            </section>

            <section id="aii-src" aria-labelledby="aii-h-src" className="flex scroll-mt-16 flex-col gap-3.5">
              <SectionHead id="aii-h-src" title="Nguồn khách" sub="Khách từ quảng cáo và khách tự tìm đến khác nhau thế nào" />
              <SourcesCard report={report} loading={loading} />
            </section>

            <section id="aii-signals" aria-labelledby="aii-h-signals" className="flex scroll-mt-16 flex-col gap-3.5">
              <SectionHead
                id="aii-h-signals"
                title="Tín hiệu cần chú ý"
                sub="Những thay đổi đáng kể trong tuần. Chọn một mục để xem số liệu, cách xử lý và danh sách khách liên quan"
              />
              <SignalsCard
                report={report}
                loading={loading}
                week={report?.weekStart}
                scope={scope ?? undefined}
                selected={selectedSignal}
                onSelect={(s) => setSelectedKey(s.memberKey)}
                onGo={onGo}
                onOpen={(s, m, el) =>
                  openDrawer(
                    {
                      conversationId: m.conversationId,
                      week: report!.weekStart,
                      messageId: m.messageId,
                      hit: m.text && m.hitStart >= 0 ? m.text.slice(m.hitStart, m.hitStart + m.hitLength) : "",
                      label: s.title,
                      customer: m.customer,
                      pageName: m.pageName,
                      kind: m.kind,
                    },
                    el,
                  )
                }
              />
            </section>
          </>
        )}
      </div>
      <ConversationDrawer target={drawerTarget} ruleVersion={report?.ruleVersion ?? "v1"} onClose={closeDrawer} />
    </MarkContext.Provider>
  );
}
