import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/custom-ui/select";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { InstagramLogo } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink,
  EyeOff,
  ImageIcon,
  Loader2,
  MessageCircle,
  RefreshCw,
  Send,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  fetchCskhPages,
  fetchIgCommentMedia,
  fetchIgComments,
  hideIgComment,
  replyIgComment,
  syncIgCommentsFromGraph,
  type CskhIgComment,
  type CskhIgMedia,
} from "./api";
import { PlatformGlyph } from "./cskhPlatform";
import { cskhMediaProxySrc } from "./messageMedia";
import { useCskhInboxStream } from "./useCskhInboxStream";

function mediaTypeLabel(type: string | null | undefined): string {
  const t = (type || "").toUpperCase();
  if (t === "VIDEO" || t === "REELS") return "Video";
  if (t === "IMAGE") return "Ảnh";
  if (t === "CAROUSEL_ALBUM") return "Album";
  return type || "Bài đăng";
}

function formatCommentTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return "Vừa xong";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} phút trước`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} giờ trước`;
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type IgCommentNode = CskhIgComment & { children: IgCommentNode[] };

function buildCommentTree(comments: CskhIgComment[]): IgCommentNode[] {
  const nodes = new Map<string, IgCommentNode>();
  for (const c of comments) {
    nodes.set(c.igCommentId, { ...c, children: [] });
  }
  const roots: IgCommentNode[] = [];
  for (const c of comments) {
    const node = nodes.get(c.igCommentId)!;
    const parentId = c.parentIgCommentId;
    if (parentId && nodes.has(parentId)) {
      nodes.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const byTime = (a: IgCommentNode, b: IgCommentNode) =>
    new Date(a.commentedAt).getTime() - new Date(b.commentedAt).getTime();
  roots.sort(byTime);
  for (const n of nodes.values()) {
    n.children.sort(byTime);
  }
  return roots;
}

function MediaThumb({
  url,
  size = "sm",
}: {
  url?: string | null;
  size?: "sm" | "lg";
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [url]);
  const src = url ? cskhMediaProxySrc(url) || url : undefined;
  const box =
    size === "lg" ? "h-[88px] w-[88px] rounded-lg" : "h-14 w-14 rounded-xl";
  if (!src || failed) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100 text-pink-500 dark:from-pink-950/40 dark:to-purple-950/40",
          box,
        )}
      >
        <ImageIcon className="h-5 w-5 opacity-70" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      className={cn("shrink-0 object-cover ring-1 ring-black/5", box)}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function CommentAvatar({
  username,
  outbound,
  compact,
}: {
  username: string | null;
  outbound?: boolean;
  compact?: boolean;
}) {
  const label = (username || (outbound ? "Shop" : "?")).replace(/^@/, "");
  const letter = label.charAt(0).toUpperCase();
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        compact ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs",
        outbound
          ? "bg-gradient-to-br from-indigo-500 to-violet-600"
          : "bg-gradient-to-br from-pink-500 via-fuchsia-500 to-orange-400",
      )}
    >
      {letter}
    </div>
  );
}

function IgCommentRow({
  comment,
  depth,
  hidePending,
  onReply,
  onHide,
}: {
  comment: IgCommentNode;
  depth: number;
  hidePending: boolean;
  onReply: (c: CskhIgComment) => void;
  onHide: (c: CskhIgComment) => void;
}) {
  const outbound = comment.direction === "outbound";
  const username =
    comment.authorUsername?.replace(/^@/, "") || (outbound ? "shop" : "user");
  const compact = depth > 0;

  return (
    <li className={cn(depth > 0 && "ml-10")}>
      <div
        className={cn(
          "group flex gap-2.5 rounded-md px-1 py-1.5 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
          comment.hidden && "opacity-55",
        )}
      >
        <CommentAvatar
          username={comment.authorUsername}
          outbound={outbound}
          compact={compact}
        />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-snug text-foreground">
            <span className="font-semibold">@{username}</span>
            {outbound ? (
              <span className="ml-1.5 rounded bg-indigo-100 px-1 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                Shop
              </span>
            ) : null}
            <span className="text-foreground"> {comment.text}</span>
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-n-500">
            <span>{formatCommentTime(comment.commentedAt)}</span>
            {comment.hidden ? (
              <span className="font-medium text-n-600">Đã ẩn</span>
            ) : null}
            {!outbound && !comment.hidden ? (
              <>
                <button
                  type="button"
                  className="font-semibold text-n-600 hover:text-foreground"
                  onClick={() => onReply(comment)}
                >
                  Trả lời
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-0.5 font-medium hover:text-red-600"
                  disabled={hidePending}
                  onClick={() => onHide(comment)}
                >
                  <EyeOff className="h-3 w-3" />
                  Ẩn
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
      {comment.children.length > 0 ? (
        <ul className="space-y-0.5 border-l border-slate-200/80 pl-1 dark:border-slate-700/80">
          {comment.children.map((child) => (
            <IgCommentRow
              key={child.id}
              comment={child}
              depth={depth + 1}
              hidePending={hidePending}
              onReply={onReply}
              onHide={onHide}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function InstagramCommentsPane() {
  const qc = useQueryClient();
  const pagesQ = useQuery({
    queryKey: ["cskh", "pages", "lite"],
    queryFn: () => fetchCskhPages({ lite: true }),
  });
  const igPages = useMemo(
    () => (pagesQ.data?.pages ?? []).filter((p) => p.platform === "instagram"),
    [pagesQ.data],
  );
  const [pageId, setPageId] = useState("");
  const [mediaId, setMediaId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyTarget, setReplyTarget] = useState<CskhIgComment | null>(null);
  const [unreadMediaIds, setUnreadMediaIds] = useState<Set<string>>(
    () => new Set(),
  );

  const activePageId = pageId || igPages[0]?.pageId || "";
  const mediaIdRef = useRef(mediaId);
  const activePageIdRef = useRef(activePageId);
  useEffect(() => {
    mediaIdRef.current = mediaId;
  }, [mediaId]);
  useEffect(() => {
    activePageIdRef.current = activePageId;
  }, [activePageId]);

  const selectMedia = (id: string) => {
    setMediaId(id);
    setReplyTarget(null);
    setUnreadMediaIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const { connected } = useCskhInboxStream({
    enabled: Boolean(activePageId),
    onIgComment: (ev) => {
      if (ev.direction === "outbound") return;
      if (ev.pageId && ev.pageId !== activePageIdRef.current) return;
      const igMediaId = ev.conversationId;
      if (!igMediaId) return;
      if (igMediaId === mediaIdRef.current) return;
      setUnreadMediaIds((prev) => {
        if (prev.has(igMediaId)) return prev;
        const next = new Set(prev);
        next.add(igMediaId);
        return next;
      });
      const who = ev.authorUsername ? `@${ev.authorUsername}` : "khách";
      toast.info(`Bình luận mới từ ${who}`, {
        description: ev.text?.slice(0, 100) || "Mở bài để trả lời.",
        action: {
          label: "Xem",
          onClick: () => selectMedia(igMediaId),
        },
      });
    },
  });

  const mediaQ = useQuery({
    queryKey: ["cskh", "ig-comments", "media", activePageId],
    queryFn: () => fetchIgCommentMedia(activePageId, false),
    enabled: Boolean(activePageId),
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 503) return failureCount < 2;
      return failureCount < 1;
    },
  });

  const mediaSyncMut = useMutation({
    mutationFn: () => fetchIgCommentMedia(activePageId, true),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: ["cskh", "ig-comments", "media", activePageId],
      });
      toast.success("Đã cập nhật danh sách bài từ Instagram.");
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const commentsQ = useQuery({
    queryKey: ["cskh", "ig-comments", "list", activePageId, mediaId],
    queryFn: () => fetchIgComments(activePageId, mediaId!),
    enabled: Boolean(activePageId && mediaId),
  });

  const syncMut = useMutation({
    mutationFn: () => syncIgCommentsFromGraph(activePageId, mediaId!),
    onSuccess: (r) => {
      toast.success(`Đã đồng bộ ${r.synced} bình luận.`);
      void qc.invalidateQueries({
        queryKey: ["cskh", "ig-comments", "list", activePageId, mediaId],
      });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const replyMut = useMutation({
    mutationFn: () =>
      replyIgComment(activePageId, replyTarget!.igCommentId, replyText.trim()),
    onSuccess: () => {
      toast.success("Đã gửi phản hồi công khai trên Instagram.");
      setReplyText("");
      setReplyTarget(null);
      void qc.invalidateQueries({
        queryKey: ["cskh", "ig-comments", "list", activePageId, mediaId],
      });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const hideMut = useMutation({
    mutationFn: (c: CskhIgComment) =>
      hideIgComment(activePageId, c.igCommentId),
    onSuccess: () => {
      toast.success("Đã ẩn bình luận trên Instagram.");
      void qc.invalidateQueries({
        queryKey: ["cskh", "ig-comments", "list", activePageId, mediaId],
      });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const comments = commentsQ.data ?? [];
  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);

  const onReplyComment = (c: CskhIgComment) => {
    setReplyTarget(c);
    setReplyText("");
  };

  if (pagesQ.isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-n-500">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
        Đang tải kênh Instagram…
      </div>
    );
  }

  if (!igPages.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white">
          <InstagramLogo className="h-7 w-7" weight="fill" />
        </div>
        <p className="max-w-sm text-sm text-n-600 dark:text-n-400">
          Chưa có kênh Instagram. Gắn Instagram Professional vào Fanpage rồi cập
          nhật kết nối Facebook trong Cài đặt.
        </p>
      </div>
    );
  }

  const mediaList = mediaQ.data ?? [];
  const selectedMedia = mediaList.find((m) => m.igMediaId === mediaId);
  const inboundCount = comments.filter(
    (c) => c.direction === "inbound" && !c.hidden,
  ).length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2">
        <p className="text-[11px] font-medium text-n-500">
          {mediaList.length} bài đăng
        </p>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
              connected
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-slate-100 text-n-500",
            )}
            title={
              connected
                ? "Đang nhận bình luận mới realtime"
                : "Mất kết nối realtime — F5 hoặc đợi reconnect"
            }
          >
            {connected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {connected ? "Live" : "Offline"}
          </span>
          <Select
            value={activePageId}
            onValueChange={(val) => {
              setPageId(val);
              setMediaId(null);
              setReplyTarget(null);
              setUnreadMediaIds(new Set());
            }}
            disabled={pagesQ.isLoading}
          >
            <SelectTrigger
              className="h-8 w-[168px] overflow-hidden whitespace-nowrap rounded-lg border-slate-200 bg-white px-2.5 text-[11px] font-semibold shadow-none"
              aria-label="Chọn kênh Instagram"
            >
              <span className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
                <PlatformGlyph
                  name="instagram"
                  className="h-3.5 w-3.5 shrink-0 text-pink-500"
                />
                <span className="min-w-0 flex-1 truncate leading-none">
                  <SelectValue
                    placeholder={
                      pagesQ.isLoading ? "Đang tải…" : "Chọn kênh IG"
                    }
                  />
                </span>
              </span>
            </SelectTrigger>
            <SelectContent className="max-h-72 min-w-[240px] rounded-xl bg-white">
              {igPages.map((p) => (
                <SelectItem key={p.pageId} value={p.pageId}>
                  {p.pageName || p.pageId}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        {/* Media list */}
        <aside className="flex w-full shrink-0 flex-col border-r border-slate-200 md:w-[320px]">
          <div className="flex items-center justify-between gap-2 px-3 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-n-500">
              Bài đăng
              {unreadMediaIds.size > 0 ? (
                <span className="ml-1.5 rounded-full bg-pink-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {unreadMediaIds.size}
                </span>
              ) : null}
            </span>
            <Button
              type="button"
              className="cursor-pointer border border-slate-200"
              disabled={!activePageId || mediaSyncMut.isPending}
              onClick={() => mediaSyncMut.mutate()}
            >
              <RefreshCw
                className={cn(mediaSyncMut.isPending && "animate-spin")}
              />
              Tải từ IG
            </Button>
          </div>
          <div className="min-h-[120px] flex-1 overflow-y-auto px-2 pb-2 [scrollbar-width:thin]">
            {mediaQ.isLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-[72px] animate-pulse rounded-xl bg-muted/60"
                  />
                ))}
              </div>
            ) : mediaList.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <ImageIcon className="h-8 w-8 text-n-300" />
                <p className="text-xs text-n-500">
                  Chưa có bài. Bấm「Tải từ IG」để đồng bộ từ Meta.
                </p>
              </div>
            ) : (
              <ul className="space-y-1.5">
                {mediaList.map((m: CskhIgMedia) => {
                  const selected = mediaId === m.igMediaId;
                  const unread = unreadMediaIds.has(m.igMediaId);
                  return (
                    <li key={m.igMediaId}>
                      <button
                        type="button"
                        onClick={() => selectMedia(m.igMediaId)}
                        className={cn(
                          "flex w-full gap-3 rounded-xl p-2.5 text-left transition",
                          selected
                            ? "bg-gradient-to-r from-pink-500/10 to-purple-500/10 ring-2 ring-pink-500/40"
                            : unread
                              ? "bg-pink-50 ring-1 ring-pink-200 hover:bg-pink-50/80 dark:bg-pink-950/20 dark:ring-pink-900/40"
                              : "hover:bg-muted/50 ring-1 ring-transparent",
                        )}
                      >
                        <div className="relative shrink-0">
                          <MediaThumb url={m.thumbnailUrl} />
                          {unread ? (
                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-pink-500 ring-2 ring-white" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "line-clamp-2 text-xs leading-snug text-foreground",
                              unread ? "font-semibold" : "font-medium",
                            )}
                          >
                            {m.caption?.trim() || "Không có caption"}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            {unread ? (
                              <span className="rounded-md bg-pink-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                Mới
                              </span>
                            ) : (
                              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-n-600">
                                {mediaTypeLabel(m.mediaType)}
                              </span>
                            )}
                            {m.lastCommentAt ? (
                              <span className="text-[10px] text-n-500">
                                {formatCommentTime(m.lastCommentAt)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white dark:bg-background">
          {!mediaId ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <MessageCircle className="h-10 w-10 text-n-300" />
              <p className="text-sm font-medium text-foreground">
                Chọn một bài viết
              </p>
              <p className="max-w-xs text-xs text-n-500">
                Danh sách bình luận và phản hồi sẽ hiển thị ở đây. Comment mới
                trên bài bất kỳ sẽ hiện live ở cột trái.
              </p>
            </div>
          ) : (
            <>
              <div className="shrink-0 border-b border-slate-200 px-4 py-3">
                <div className="flex gap-3">
                  <MediaThumb url={selectedMedia?.thumbnailUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-3 text-sm leading-snug text-foreground">
                      {selectedMedia?.caption?.trim() || "Bài Instagram"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-n-500">
                      <span>{mediaTypeLabel(selectedMedia?.mediaType)}</span>
                      <span>·</span>
                      <span>
                        {commentsQ.isLoading
                          ? "…"
                          : `${inboundCount} bình luận khách`}
                      </span>
                      {selectedMedia?.permalink ? (
                        <>
                          <span>·</span>
                          <a
                            href={selectedMedia.permalink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-0.5 font-semibold text-pink-600 hover:underline dark:text-pink-400"
                          >
                            Mở trên IG
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-foreground transition hover:bg-slate-50 disabled:opacity-50"
                    disabled={syncMut.isPending}
                    onClick={() => syncMut.mutate()}
                    title="Đồng bộ bình luận"
                  >
                    <RefreshCw
                      className={cn(
                        "h-3.5 w-3.5",
                        syncMut.isPending && "animate-spin",
                      )}
                    />
                    Đồng bộ
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:thin] md:px-4">
                {commentsQ.isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-7 w-7 animate-spin text-pink-500" />
                  </div>
                ) : comments.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-16 text-center">
                    <MessageCircle className="h-8 w-8 text-n-300" />
                    <p className="text-sm text-n-500">
                      Chưa có bình luận trong hệ thống.
                    </p>
                    <button
                      type="button"
                      className="mt-1 text-xs font-semibold text-primary hover:underline"
                      onClick={() => syncMut.mutate()}
                    >
                      Đồng bộ từ Instagram
                    </button>
                  </div>
                ) : (
                  <ul className="mx-auto space-y-1">
                    {commentTree.map((c) => (
                      <IgCommentRow
                        key={c.id}
                        comment={c}
                        depth={0}
                        hidePending={hideMut.isPending}
                        onReply={onReplyComment}
                        onHide={(row) => hideMut.mutate(row)}
                      />
                    ))}
                  </ul>
                )}
              </div>

              {replyTarget ? (
                <div className="shrink-0 border-t border-slate-200 bg-white p-3 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] dark:bg-background">
                  <div className="mx-auto flex max-w-xl flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-n-500">
                        Trả lời{" "}
                        <span className="font-semibold text-foreground">
                          @{replyTarget.authorUsername || "user"}
                        </span>
                      </p>
                      <button
                        type="button"
                        className="rounded-lg p-1 text-n-500 hover:bg-muted"
                        onClick={() => {
                          setReplyTarget(null);
                          setReplyText("");
                        }}
                        aria-label="Đóng"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <textarea
                        className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-background px-3 py-2.5 text-sm outline-none ring-pink-500/20 focus:ring-2"
                        rows={2}
                        placeholder="Nội dung phản hồi công khai…"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            if (replyText.trim() && !replyMut.isPending) {
                              replyMut.mutate();
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-md transition hover:opacity-90 disabled:opacity-40"
                        disabled={!replyText.trim() || replyMut.isPending}
                        onClick={() => replyMut.mutate()}
                        aria-label="Gửi"
                      >
                        {replyMut.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-n-500">
                      Enter gửi · Shift+Enter xuống dòng
                    </p>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
