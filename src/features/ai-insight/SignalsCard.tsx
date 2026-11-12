import {
  ArrowRight,
  ArrowsClockwise,
  CaretDown,
  CaretRight,
  ChatCircleDots,
  ChatCircleText,
  Clock,
  Eye,
  HourglassMedium,
  Info,
  Lightbulb,
  Package,
  Tag,
  Tray,
  Truck,
  Warning,
  WarningCircle,
  WarningOctagon,
} from "@phosphor-icons/react";
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { type KeyboardEvent, useContext, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Chip, type ChipTone, DashCard, EmptyBlock, SEVERITY_META, SeverityIcon, Skeleton } from "@/features/dashboard/DashboardParts";
import { type AiInsightReport, fetchSignalMembers, type InsightSignal, type MemberFlag, type SignalMember } from "./api";
import { ChannelIcon, fmt, Highlighted, hoursText, MarkContext, MarkDot, Tabs, vnDateTime } from "./InsightParts";

const PAGE_SIZE = 20;

const FRAME =
  "grid h-[clamp(600px,calc(100vh-160px),860px)] grid-cols-[minmax(280px,340px)_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] overflow-hidden max-[980px]:h-auto max-[980px]:grid-cols-1 max-[980px]:grid-rows-none";

const SOURCE_ICON = {
  truck: Truck,
  package: Package,
  chat: ChatCircleDots,
  tag: Tag,
  clock: Clock,
  journey: ChatCircleDots,
} as const;

type ListMeta = {
  noun: string;
  order: string;
  flags?: Array<[MemberFlag, string]>;
  badge?: (m: SignalMember) => { tone: ChipTone; text: string } | null;
};

const waitText = (minutes: number | null) => hoursText(minutes == null ? null : minutes / 60);

function listMeta(key: string): ListMeta {
  if (key === "waiting") {
    return {
      noun: "khách đang chờ",
      order: "Chờ lâu nhất xếp trước, thời gian chờ tính đến hết Chủ nhật",
      badge: (m) => (m.value == null ? null : { tone: "warn", text: `Chờ ${waitText(m.value)}` }),
    };
  }
  if (key === "priceLeave") {
    return {
      noun: "khách",
      order: "Hỏi giá gần nhất xếp trước",
      flags: [
        ["yes", "Shop đã báo giá"],
        ["no", "Chưa thấy tin báo giá"],
      ],
      badge: (m) => (m.flag ? { tone: "mute", text: "Đã báo giá, khách không nhắn thêm" } : { tone: "warn", text: "Chưa thấy tin báo giá" }),
    };
  }
  if (key.startsWith("product:")) {
    return {
      noun: "khách hỏi về sản phẩm",
      order: "Mới nhất xếp trước",
      flags: [
        ["no", "Chưa muốn mua"],
        ["yes", "Đã muốn mua"],
      ],
      badge: (m) => (m.flag ? { tone: "good", text: "Đã muốn mua" } : { tone: "mute", text: "Chưa muốn mua" }),
    };
  }
  if (key.startsWith("window:")) {
    return {
      noun: "khách bị trả lời chậm",
      order: "Chờ lâu nhất xếp trước",
      flags: [
        ["no", "Chưa được trả lời"],
        ["yes", "Trả lời sau hơn 15 phút"],
      ],
      badge: (m) => (m.flag ? { tone: "warn", text: `Trả lời sau ${waitText(m.value)}` } : { tone: "bad", text: "Chưa được trả lời trong tuần" }),
    };
  }
  return { noun: "khách", order: "Mới nhất xếp trước" };
}

function memberFallback(m: SignalMember) {
  if (m.messageType === "image") return "Khách gửi hình ảnh";
  if (m.messageType === "ad_referral") return m.adTitle ? `Khách bấm vào quảng cáo “${m.adTitle}”` : "Khách bấm vào quảng cáo";
  if (m.adTitle) return `Đến từ quảng cáo “${m.adTitle}”`;
  return "Tin nhắn không có chữ (ảnh, sticker hoặc tệp)";
}

function MemberRow({ m, meta, onOpen }: { m: SignalMember; meta: ListMeta; onOpen: (m: SignalMember, el: HTMLButtonElement) => void }) {
  const badge = meta.badge?.(m);
  return (
    <li>
      <button
        type="button"
        onClick={(e) => onOpen(m, e.currentTarget)}
        className="group grid w-full grid-cols-[32px_minmax(0,1fr)_auto] items-start gap-x-3 rounded-[10px] px-3 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500">
          <ChannelIcon kind={m.kind} size={16} />
        </span>
        <span className="min-w-0">
          <span className="flex min-w-0 items-baseline gap-2">
            <b className="truncate text-[13px] font-semibold text-slate-900">{m.customer}</b>
            <span className="truncate text-[12px] text-slate-500">{m.pageName}</span>
          </span>
          <span className="mt-1 line-clamp-2 block text-[13px] leading-[1.5] text-slate-700">
            {m.text ? (
              <>
                “<Highlighted text={m.text} start={m.hitStart} length={m.hitLength} />”
              </>
            ) : (
              <i className="text-slate-500">{memberFallback(m)}</i>
            )}
          </span>
          {badge || m.fromAd ? (
            <span className="mt-2 flex flex-wrap gap-1.5">
              {badge ? <Chip tone={badge.tone}>{badge.text}</Chip> : null}
              {m.fromAd ? <Chip tone="mute">Từ quảng cáo</Chip> : null}
            </span>
          ) : null}
        </span>
        <span className="flex h-full flex-col items-end justify-between gap-2 text-[11.5px] text-slate-500">
          <span className="whitespace-nowrap tabular-nums">{m.at ? vnDateTime(m.at) : ""}</span>
          <span className="inline-flex items-center gap-0.5 whitespace-nowrap font-semibold text-slate-400 transition-colors group-hover:text-indigo-600 group-focus-visible:text-indigo-600">
            Xem
            <CaretRight size={12} weight="bold" />
          </span>
        </span>
      </button>
    </li>
  );
}

function SignalMembers({
  signal,
  week,
  scope,
  onOpen,
}: {
  signal: InsightSignal;
  week: string;
  scope: string | undefined;
  onOpen: (s: InsightSignal, m: SignalMember, el: HTMLButtonElement) => void;
}) {
  const meta = listMeta(signal.memberKey);
  const [flag, setFlag] = useState<"all" | MemberFlag>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const changeFlag = (next: "all" | MemberFlag) => {
    setFlag(next);
    scrollRef.current?.scrollTo({ top: 0 });
  };
  const query = useInfiniteQuery({
    queryKey: ["aiInsightMembers", week, scope ?? "", signal.memberKey, flag],
    queryFn: ({ pageParam }) =>
      fetchSignalMembers({
        week,
        scope,
        key: signal.memberKey,
        flag: flag === "all" ? undefined : flag,
        offset: pageParam,
        limit: PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (last) => last.nextOffset ?? undefined,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    refetchInterval: (q) => (q.state.data?.pages[0]?.running ? 10_000 : false),
  });

  const first = query.data?.pages[0];
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const matching = first ? (flag === "all" ? first.total : first.flagged[flag]) : 0;
  const remaining = Math.max(0, matching - items.length);

  return (
    <div className="mt-4 flex min-h-0 flex-1 flex-col border-t border-slate-100 pt-3.5 max-[980px]:flex-none">
      <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 px-1">
        <div className="min-w-0">
          <h4 className="text-[14px] font-semibold text-slate-900">
            {first?.ready ? `${fmt(first.total)} ${meta.noun}` : "Khách liên quan"}
          </h4>
          <p className="mt-0.5 text-[12px] text-slate-500">{meta.order}. Bấm vào một dòng để đọc nguyên đoạn chat</p>
        </div>
        {meta.flags && first?.ready && first.total ? (
          <div className="ml-auto max-w-full overflow-x-auto">
            <Tabs
              label="Lọc danh sách"
              idPrefix="aii-member-flag"
              value={flag}
              onChange={changeFlag}
              options={[["all", `Tất cả · ${fmt(first.total)}`], ...meta.flags.map(([k, l]): [MemberFlag, string] => [k, `${l} · ${fmt(first.flagged[k])}`])]}
            />
          </div>
        ) : null}
      </div>

      <div
        ref={scrollRef}
        className={cn(
          "-mx-2 mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-1 transition-opacity max-[980px]:max-h-[560px] max-[980px]:flex-none",
          query.isPlaceholderData && "opacity-60",
        )}
      >
        {query.isPending ? (
          <div className="flex flex-col gap-3 px-3 py-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3.5 w-[85%]" />
                </div>
              </div>
            ))}
          </div>
        ) : query.isError ? (
          <EmptyBlock
            icon={<WarningCircle weight="duotone" />}
            tone="bad"
            title="Không tải được danh sách khách"
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
            Thử lại sau ít phút.
          </EmptyBlock>
        ) : first && !first.ready ? (
          <EmptyBlock icon={<HourglassMedium weight="duotone" />} title={first.running ? "Đang tổng hợp lại tuần này" : "Tuần này chưa có danh sách khách"}>
            {first.running
              ? "Danh sách sẽ hiện ra khi tổng hợp xong, thường trong vài phút."
              : "Tuần này được tổng hợp từ trước khi có tính năng danh sách. Bấm “Tổng hợp lại” trên thanh công cụ để tạo."}
          </EmptyBlock>
        ) : items.length ? (
          <ul className="flex list-none flex-col divide-y divide-slate-100">
            {items.map((m) => (
              <MemberRow key={m.conversationId} m={m} meta={meta} onOpen={(row, el) => onOpen(signal, row, el)} />
            ))}
          </ul>
        ) : (
          <EmptyBlock icon={<ChatCircleText weight="duotone" />} title="Không có khách nào">
            {flag === "all" ? "Kênh đang chọn không có khách nào thuộc tín hiệu này." : "Không có khách nào khớp bộ lọc này."}
          </EmptyBlock>
        )}

        {query.hasNextPage && remaining ? (
          <button
            type="button"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="mx-auto my-2 flex h-[34px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-[12.5px] font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900 disabled:opacity-60"
          >
            <CaretDown size={13} weight="bold" />
            {query.isFetchingNextPage ? "Đang tải…" : `Xem thêm ${fmt(Math.min(PAGE_SIZE, remaining))} trong ${fmt(remaining)} còn lại`}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function SignalDetail({
  signal,
  week,
  scope,
  onGo,
  onOpen,
}: {
  signal: InsightSignal;
  week: string;
  scope: string | undefined;
  onGo: (go: string) => void;
  onOpen: (s: InsightSignal, m: SignalMember, el: HTMLButtonElement) => void;
}) {
  const meta = SEVERITY_META[signal.severity];
  const Icon = SOURCE_ICON[signal.source.icon] ?? Info;
  const cols = signal.stats.length >= 4 ? "grid-cols-4" : signal.stats.length === 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <div
      id="aii-signal-panel"
      role="tabpanel"
      aria-labelledby={`aii-signal-tab-${signal.n}`}
      className="flex min-h-0 min-w-0 flex-col px-5 pb-3 pt-4 max-[560px]:px-3.5"
    >
      <div className="shrink-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-500">
          <span className={cn("inline-flex items-center gap-1 font-semibold", meta.text)}>
            <SeverityIcon severity={signal.severity} />
            {meta.label}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon size={13} />
            {signal.source.label}
          </span>
          <span>{signal.when}</span>
        </div>
        <h3 className="mt-1.5 text-[17px] font-semibold leading-snug tracking-[-0.01em] text-slate-900">{signal.title}</h3>
        <p className="mt-1 max-w-[76ch] text-[13px] leading-[1.55] text-slate-600">{signal.body}</p>

        {signal.stats.length ? (
          <dl className={cn("mt-4 grid gap-px overflow-hidden rounded-[10px] border border-slate-200 bg-slate-200 max-[1100px]:grid-cols-2", cols)}>
            {signal.stats.map((st) => (
              <div key={st.label} className="min-w-0 bg-white px-3.5 py-2.5">
                <dt className="line-clamp-2 text-[11.5px] leading-snug text-slate-500" title={st.label}>
                  {st.label}
                </dt>
                <dd
                  title={st.value}
                  className={cn(
                    "mt-0.5 truncate text-[16px] font-bold tabular-nums text-slate-900",
                    st.tone === "bad" && "text-red-700",
                    st.tone === "warn" && "text-amber-700",
                  )}
                >
                  {st.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[10px] bg-slate-50 px-3 py-2.5 text-[12.5px] leading-snug text-slate-700">
          <Lightbulb size={16} weight="duotone" className="shrink-0 text-amber-600" />
          <span className="min-w-0 flex-1">
            <b className="font-semibold text-slate-900">Gợi ý xử lý: </b>
            {signal.tip}
          </span>
          {signal.related ? (
            <button
              type="button"
              onClick={() => onGo(signal.related!.go)}
              className="group inline-flex items-center gap-1 whitespace-nowrap rounded-md text-[12.5px] font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {signal.related.label}
              <ArrowRight size={13} weight="bold" className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          ) : null}
        </div>
      </div>

      <SignalMembers key={signal.memberKey} signal={signal} week={week} scope={scope} onOpen={onOpen} />
    </div>
  );
}

function SignalTab({ s, active, onSelect }: { s: InsightSignal; active: boolean; onSelect: (s: InsightSignal) => void }) {
  const { lit, setLit } = useContext(MarkContext);
  const meta = SEVERITY_META[s.severity];
  const Icon = SOURCE_ICON[s.source.icon] ?? Info;
  return (
    <button
      id={`aii-signal-tab-${s.n}`}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls="aii-signal-panel"
      tabIndex={active ? 0 : -1}
      onClick={() => onSelect(s)}
      onPointerEnter={() => setLit(s.n)}
      onPointerLeave={() => setLit(null)}
      onFocus={() => setLit(s.n)}
      onBlur={() => setLit(null)}
      className={cn(
        "grid w-full scroll-mt-24 grid-cols-[22px_minmax(0,1fr)_14px] gap-x-2.5 rounded-[10px] px-2.5 py-[11px] text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500",
        active ? "bg-indigo-50/70" : "hover:bg-slate-50",
      )}
    >
      <span className="mt-px">
        <MarkDot severity={s.severity} n={s.n} lit={lit === s.n} />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-[11.5px]">
          <span className={cn("inline-flex items-center gap-1 font-semibold", meta.text)}>
            <SeverityIcon severity={s.severity} />
            {meta.label}
          </span>
          <span className="ml-auto whitespace-nowrap text-slate-500">{s.when}</span>
        </span>
        <span className={cn("mt-1 block text-[13.5px] font-semibold leading-snug", active ? "text-indigo-950" : "text-slate-900")}>{s.title}</span>
        <span className="mt-1 inline-flex items-center gap-[5px] text-[11.5px] text-slate-500">
          <Icon size={13} />
          {s.source.label}
        </span>
      </span>
      <CaretRight size={14} weight="bold" className={cn("self-center transition-colors", active ? "text-indigo-600" : "text-slate-300")} />
    </button>
  );
}

export function SignalsCard({
  report,
  loading,
  week,
  scope,
  selected,
  onSelect,
  onGo,
  onOpen,
}: {
  report: AiInsightReport | null;
  loading: boolean;
  week: string | undefined;
  scope: string | undefined;
  selected: InsightSignal | null;
  onSelect: (s: InsightSignal) => void;
  onGo: (go: string) => void;
  onOpen: (s: InsightSignal, m: SignalMember, el: HTMLButtonElement) => void;
}) {
  const signals = report?.signals ?? [];
  const counts = { bad: 0, warn: 0, watch: 0 };
  signals.forEach((s) => (counts[s.severity] += 1));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const i = signals.findIndex((s) => s.memberKey === selected?.memberKey);
    const next = signals[(i + (e.key === "ArrowDown" ? 1 : signals.length - 1)) % signals.length];
    onSelect(next);
    requestAnimationFrame(() => document.getElementById(`aii-signal-tab-${next.n}`)?.focus());
  };

  if (loading) {
    return (
      <DashCard labelledBy="aii-h-signals" className={FRAME}>
        <div className="flex flex-col gap-4 border-r border-slate-100 px-4 py-4 max-[980px]:border-r-0">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2.5">
              <Skeleton className="h-[22px] w-[22px] rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-2.5 w-2/5" />
                <Skeleton className="h-3.5 w-[85%]" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 px-5 py-5 max-[980px]:hidden">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-16" />
          <Skeleton className="h-40" />
        </div>
      </DashCard>
    );
  }
  if (!report) return null;
  if (!signals.length || !selected || !week) {
    return (
      <DashCard labelledBy="aii-h-signals">
        <EmptyBlock icon={<Tray weight="duotone" />} tone="good" title="Không có tín hiệu vượt ngưỡng">
          Tuần này chưa có phản ánh, nhóm khách hay khung giờ nào thay đổi đủ lớn để cần xử lý ngay.
        </EmptyBlock>
      </DashCard>
    );
  }

  return (
    <DashCard labelledBy="aii-h-signals" className={FRAME}>
      <div className="flex min-h-0 min-w-0 flex-col border-r border-slate-100 max-[980px]:border-b max-[980px]:border-r-0">
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 px-[18px] pb-1 pt-4">
          {counts.bad ? (
            <Chip tone="bad" icon={<WarningOctagon size={13} weight="bold" />}>
              {counts.bad} nghiêm trọng
            </Chip>
          ) : null}
          {counts.warn ? (
            <Chip tone="warn" icon={<Warning size={13} weight="bold" />}>
              {counts.warn} cần xử lý
            </Chip>
          ) : null}
          {counts.watch ? (
            <Chip tone="watch" icon={<Eye size={13} weight="bold" />}>
              {counts.watch} theo dõi
            </Chip>
          ) : null}
        </div>
        <div
          role="tablist"
          aria-label="Tín hiệu cần chú ý"
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
          className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-2 py-2"
        >
          {signals.map((s) => (
            <SignalTab key={s.n} s={s} active={s.memberKey === selected.memberKey} onSelect={onSelect} />
          ))}
        </div>
        <div className="flex shrink-0 items-start gap-1.5 border-t border-slate-100 px-[18px] pb-4 pt-3 text-[11.5px] leading-[1.45] text-slate-500">
          <Info size={14} className="mt-px shrink-0" />
          Số tròn trên các biểu đồ phía trên trỏ tới tín hiệu cùng số ở đây. Danh sách bên phải gồm đúng những khách tạo ra tín hiệu, theo kênh đang chọn.
        </div>
      </div>
      <SignalDetail signal={selected} week={week} scope={scope} onGo={onGo} onOpen={onOpen} />
    </DashCard>
  );
}
