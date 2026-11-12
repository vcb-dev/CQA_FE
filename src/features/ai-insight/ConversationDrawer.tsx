import { ArrowsClockwise, CaretUp, ListChecks, X } from "@phosphor-icons/react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Fragment, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/features/dashboard/DashboardParts";
import { type ConversationTarget, fetchInsightThread, type ThreadMessage } from "./api";
import { ChannelIcon, channelName, Highlighted, vnDateTime } from "./InsightParts";

const PHASE_LABEL: Record<ThreadMessage["phase"], string> = {
  before: "Trước tuần đang xem",
  week: "Trong tuần đang xem",
  after: "Sau tuần đang xem",
};

function placeholder(m: ThreadMessage) {
  if (m.messageType === "image") return "Hình ảnh";
  if (m.messageType === "ad_referral") return "Bấm vào quảng cáo";
  if (m.messageType === "sticker") return "Nhãn dán";
  if (m.messageType === "video") return "Video";
  if (m.messageType === "audio") return "Tin nhắn thoại";
  return m.messageType === "text" ? "Tin nhắn trống" : "Tệp đính kèm";
}

function Bubble({ m, focus, hit }: { m: ThreadMessage; focus: boolean; hit: string }) {
  const staff = m.direction === "outbound";
  const needle = focus ? hit.replace(/^…|…$/g, "") : "";
  const idx = needle ? m.text.indexOf(needle) : -1;
  return (
    <div
      data-focus={focus || undefined}
      className={cn(
        "max-w-[84%] scroll-my-24 border px-3 py-[9px] text-[13px] leading-normal",
        staff
          ? "self-end rounded-[12px_12px_6px_12px] border-indigo-100 bg-indigo-50 text-indigo-950"
          : "rounded-[12px_12px_12px_6px] border-slate-100 bg-slate-50 text-slate-800",
        focus && "ring-2 ring-amber-300",
      )}
    >
      {m.attachmentUrl ? (
        <a href={m.attachmentUrl} target="_blank" rel="noreferrer" className="mb-1 block">
          <img
            src={m.attachmentUrl}
            alt="Ảnh trong hội thoại"
            loading="lazy"
            className="max-h-40 rounded-lg object-cover"
            onError={(e) => (e.currentTarget.parentElement!.style.display = "none")}
          />
        </a>
      ) : null}
      {m.text ? (
        <span className="whitespace-pre-wrap break-words">
          {idx >= 0 ? <Highlighted text={m.text} start={idx} length={needle.length} /> : m.text}
        </span>
      ) : m.attachmentUrl ? null : (
        <i className="text-slate-500">[{placeholder(m)}]</i>
      )}
      <small className={cn("mt-1 block text-[11px]", staff ? "text-indigo-700" : "text-slate-500")}>
        {staff ? "Nhân viên" : "Khách"} · {vnDateTime(m.sentAt)}
      </small>
    </div>
  );
}

export function ConversationDrawer({
  target,
  ruleVersion,
  onClose,
}: {
  target: ConversationTarget | null;
  ruleVersion: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const scrolledFor = useRef<string | null>(null);
  const open = Boolean(target);

  const query = useInfiniteQuery({
    queryKey: ["aiInsightThread", target?.conversationId, target?.week],
    queryFn: ({ pageParam }) =>
      fetchInsightThread(target!.conversationId, { week: target!.week, before: pageParam ?? undefined }),
    initialPageParam: null as string | null,
    getNextPageParam: (last) => (last.hasEarlier && last.messages[0] ? last.messages[0].sentAt : undefined),
    enabled: open,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = [...panelRef.current.querySelectorAll<HTMLElement>("button,[href],[tabindex]:not([tabindex='-1'])")];
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const pages = query.data?.pages ?? [];
  const head = pages[0];
  const messages = [...pages.slice(1).reverse().flatMap((p) => p.messages), ...(head?.messages ?? [])];
  const conv = head?.conversation;
  const focusKey = target ? `${target.conversationId}:${target.messageId ?? ""}` : null;

  useEffect(() => {
    if (!open) {
      scrolledFor.current = null;
      return;
    }
    if (!head || scrolledFor.current === focusKey) return;
    scrolledFor.current = focusKey;
    requestAnimationFrame(() => {
      const el = listRef.current?.querySelector<HTMLElement>("[data-focus]");
      if (el) el.scrollIntoView({ block: "center" });
      else listRef.current?.parentElement?.scrollTo({ top: 0 });
    });
  }, [open, head, focusKey]);

  return (
    <>
      <div
        className={cn("fixed inset-0 z-[70] bg-slate-900/30 transition-opacity duration-200", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        aria-labelledby="aii-drawer-title"
        inert={!open}
        className={cn(
          "fixed right-0 top-0 z-[80] flex h-screen w-[min(480px,100%)] flex-col bg-white shadow-[-16px_0_40px_-24px_rgba(15,23,42,0.35)] transition-transform duration-[240ms] ease-[cubic-bezier(.16,1,.3,1)]",
          open ? "translate-x-0" : "translate-x-[102%]",
        )}
      >
        <div className="flex items-start gap-2.5 border-b border-slate-200 px-[18px] py-4">
          {target ? <ChannelIcon kind={target.kind} size={20} className="mt-0.5 text-slate-500" /> : null}
          <div className="min-w-0">
            <h3 id="aii-drawer-title" className="truncate text-[15px] font-semibold text-slate-900">
              {conv?.customer ?? target?.customer ?? "Hội thoại"}
            </h3>
            <p className="mt-0.5 truncate text-[12px] text-slate-500">
              {target ? `${channelName(target.kind)} · ${conv?.pageName ?? target.pageName}${conv ? ` · tuần ${conv.weekLabel}` : ""}` : ""}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[18px] text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <X weight="bold" />
          </button>
        </div>
        {target ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-[18px] pb-5 pt-4">
            <div className="grid grid-cols-3 overflow-hidden rounded-[10px] border border-slate-200 max-[560px]:grid-cols-1">
              {[
                ["Thuộc mục", target.label ?? "—"],
                ["Nguồn khách", conv ? (conv.fromAd ? "Quảng cáo" : "Tự tìm đến") : "—"],
                ["Kênh", conv?.kindLabel ?? channelName(target.kind)],
              ].map(([k, v]) => (
                <div key={k} className="min-w-0 border-r border-slate-200 px-3 py-2.5 last:border-r-0 max-[560px]:border-b max-[560px]:border-r-0 max-[560px]:last:border-b-0">
                  <span className="block text-[11.5px] text-slate-500">{k}</span>
                  <b className="mt-0.5 block truncate text-[12.5px] font-semibold text-slate-900" title={v}>
                    {v}
                  </b>
                </div>
              ))}
            </div>
            {conv?.fromAd && conv.adTitle ? (
              <p className="-mt-1 truncate text-[12px] text-slate-500" title={conv.adTitle}>
                Quảng cáo: <span className="text-slate-700">{conv.adTitle}</span>
              </p>
            ) : null}

            <div ref={listRef} className="flex flex-col gap-2.5">
              {query.isPending ? (
                [0, 1, 2, 3].map((i) => <Skeleton key={i} className={cn("h-12 w-4/5", i % 2 && "self-end")} />)
              ) : query.isError ? (
                <div className="flex flex-col items-start gap-2 text-[12.5px] text-slate-500">
                  Không tải được đoạn chat.
                  <button
                    type="button"
                    onClick={() => query.refetch()}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-700 hover:border-slate-300"
                  >
                    <ArrowsClockwise size={14} weight="bold" />
                    Thử lại
                  </button>
                </div>
              ) : (
                <>
                  {query.hasNextPage ? (
                    <button
                      type="button"
                      onClick={() => query.fetchNextPage()}
                      disabled={query.isFetchingNextPage}
                      className="inline-flex h-8 items-center gap-1.5 self-center rounded-full border border-slate-200 bg-white px-3.5 text-[12px] font-semibold text-slate-600 hover:border-slate-300 hover:text-slate-900 disabled:opacity-60"
                    >
                      <CaretUp size={13} weight="bold" />
                      {query.isFetchingNextPage ? "Đang tải…" : "Xem tin nhắn trước đó"}
                    </button>
                  ) : null}
                  {messages.map((m, i) => (
                    <Fragment key={m.id}>
                      {i === 0 || messages[i - 1].phase !== m.phase ? (
                        <div className="my-1 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-slate-400">
                          <span className="h-px flex-1 bg-slate-200" />
                          {PHASE_LABEL[m.phase]}
                          <span className="h-px flex-1 bg-slate-200" />
                        </div>
                      ) : null}
                      <Bubble m={m} focus={m.id === target.messageId} hit={target.hit} />
                    </Fragment>
                  ))}
                  {head?.moreAfter ? <p className="text-center text-[12px] text-slate-500">Còn tin nhắn mới hơn, xem tiếp trong hộp thư.</p> : null}
                </>
              )}
            </div>

            {target.label && target.hit ? (
              <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-3">
                <b className="flex items-center gap-1.5 text-[12.5px] font-semibold text-slate-900">
                  <ListChecks size={15} weight="duotone" className="text-indigo-600" />
                  Cách hệ thống nhận ra
                </b>
                <p className="mt-1.5 text-[12px] leading-[1.5] text-slate-600">
                  Tin nhắn được tô viền vàng có cụm từ <b className="font-semibold text-slate-800">“{target.hit}”</b>, khớp bộ quy tắc từ khóa {ruleVersion} của mục{" "}
                  <b className="font-semibold text-slate-800">{target.label}</b>.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </aside>
    </>
  );
}
