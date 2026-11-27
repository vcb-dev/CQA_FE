import type { QueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { format, isThisYear, parseISO } from "date-fns";
import {
  BadgeCheck,
  ChevronDown,
  CircleCheckBig,
  CircleX,
  Clock,
  Loader2,
  MapPin,
  PackageCheck,
  Receipt,
  RefreshCw,
  TriangleAlert,
  Truck,
  Undo2,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  conversationOrdersQueryKey,
  fetchConversationOrderDetail,
  fetchConversationOrders,
  type CreateOmsOrderResult,
  type CskhConversationOrder,
  type CskhConversationOrderList,
  type CskhOrderDetail,
  type CskhOrderPayment,
  type CskhOrderStage,
} from "./api";

const VISIBLE_ORDERS = 5;
const REFETCH_AFTER_CREATE_MS = 2_000;
const PENDING_PREFIX = "pending-";

type Tone = "good" | "warn" | "bad" | "watch" | "mute";

const TONE_CLASS: Record<Tone, string> = {
  good: "bg-green-50 text-green-700",
  warn: "bg-amber-50 text-amber-700",
  bad: "bg-red-50 text-red-700",
  watch: "bg-indigo-50 text-indigo-700",
  mute: "bg-slate-100 text-slate-600",
};

const STAGE_META: Record<CskhOrderStage, { label: string; tone: Tone; icon: LucideIcon }> = {
  pending: { label: "Chờ xác nhận", tone: "warn", icon: Clock },
  confirmed: { label: "Đã xác nhận", tone: "watch", icon: BadgeCheck },
  shipping: { label: "Đang giao", tone: "watch", icon: Truck },
  delivered: { label: "Đã giao", tone: "good", icon: PackageCheck },
  completed: { label: "Hoàn thành", tone: "good", icon: CircleCheckBig },
  cancelled: { label: "Đã huỷ", tone: "bad", icon: CircleX },
};

const PAYMENT_META: Record<CskhOrderPayment, { label: string; tone: Tone; icon: LucideIcon }> = {
  unpaid: { label: "Chưa thanh toán", tone: "mute", icon: Wallet },
  partially_paid: { label: "Thanh toán một phần", tone: "warn", icon: Wallet },
  paid: { label: "Đã thanh toán", tone: "good", icon: Wallet },
  refunded: { label: "Đã hoàn tiền", tone: "mute", icon: Undo2 },
};

const SOURCE_LABEL: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktokshop: "TikTok Shop",
  zalo: "Zalo",
  shopee: "Shopee",
  lazada: "Lazada",
  web: "Website",
  pos: "Tại cửa hàng",
};

function formatMoney(amount: number): string {
  return `${Math.round(amount).toLocaleString("vi-VN")}đ`;
}

function parseMoney(raw: string | null): number {
  if (!raw) return 0;
  const n = Number(String(raw).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function formatShortTime(iso: string): string {
  try {
    const d = parseISO(iso);
    return format(d, isThisYear(d) ? "dd/MM HH:mm" : "dd/MM/yyyy");
  } catch {
    return "";
  }
}

function formatFullTime(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return format(parseISO(iso), "HH:mm dd/MM/yyyy");
  } catch {
    return null;
  }
}

function orderLabel(order: CskhConversationOrder): string {
  return order.orderName || `#${order.externalOrderId}`;
}

export function addCreatedOrderToCache(
  qc: QueryClient,
  conversationId: string,
  result: CreateOmsOrderResult,
) {
  const key = conversationOrdersQueryKey(conversationId);
  const totalPrice = parseMoney(result.totalPrice);
  qc.setQueryData<CskhConversationOrderList>(key, (prev) => {
    if (!prev) return prev;
    if (prev.items.some((o) => o.externalOrderId === result.orderId)) {
      return prev;
    }
    const created: CskhConversationOrder = {
      id: `${PENDING_PREFIX}${result.orderId}`,
      source: result.source,
      externalOrderId: result.orderId,
      orderName: result.orderName,
      totalPrice,
      createdAt: new Date().toISOString(),
      createdByName: null,
      oms: null,
    };
    return {
      items: [created, ...prev.items],
      totalCount: prev.totalCount + 1,
      totalValue: prev.totalValue + totalPrice,
    };
  });
  window.setTimeout(() => {
    void qc.invalidateQueries({ queryKey: key });
  }, REFETCH_AFTER_CREATE_MS);
}

function StatusChip({
  label,
  tone,
  icon: Icon,
}: {
  label: string;
  tone: Tone;
  icon: LucideIcon;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] shrink-0 items-center gap-1 rounded-full px-2 text-[11px] font-semibold",
        TONE_CLASS[tone],
      )}
    >
      <Icon className="h-3 w-3" strokeWidth={2.5} aria-hidden />
      {label}
    </span>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-slate-100" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="space-y-2 px-3 py-3">
          <div className="flex justify-between gap-6">
            <div className="h-3.5 w-24 animate-pulse rounded bg-slate-200/80" />
            <div className="h-3.5 w-16 animate-pulse rounded bg-slate-200/80" />
          </div>
          <div className="h-3 w-40 animate-pulse rounded bg-slate-100" />
          <div className="h-[22px] w-24 animate-pulse rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function DetailGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h5 className="text-[11.5px] font-semibold text-slate-600">{title}</h5>
      {children}
    </section>
  );
}

function MoneyRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={cn("text-[12px]", strong ? "font-semibold text-slate-900" : "text-slate-600")}>
        {label}
      </dt>
      <dd
        className={cn(
          "tabular-nums",
          strong ? "text-[13px] font-bold text-slate-900" : "text-[12px] text-slate-800",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function OrderDetailBody({
  detail,
  createdByName,
}: {
  detail: CskhOrderDetail;
  createdByName: string | null;
}) {
  const payment = PAYMENT_META[detail.payment];
  const remaining = Math.max(detail.totalPrice - detail.totalReceived, 0);
  const info: Array<[string, string]> = [];
  if (detail.customer?.name) {
    const history =
      detail.customer.totalOrders != null && detail.customer.totalOrders > 0
        ? ` · ${detail.customer.totalOrders} đơn đã mua`
        : "";
    info.push(["Khách", `${detail.customer.name}${history}`]);
  }
  if (detail.locationName) info.push(["Kho xuất", detail.locationName]);
  if (detail.sourceName) {
    info.push(["Nguồn", SOURCE_LABEL[detail.sourceName] ?? detail.sourceName]);
  }
  if (detail.saleName) info.push(["Sale", detail.saleName]);
  if (detail.editorName) info.push(["Editor", detail.editorName]);
  if (createdByName) info.push(["Người tạo", createdByName]);
  const createdOn = formatFullTime(detail.createdOn);
  if (createdOn) info.push(["Ngày tạo", createdOn]);

  return (
    <div className="space-y-3.5">
      {detail.stockShortage.length > 0 && (
        <div className="flex gap-2 rounded-lg bg-amber-50 px-2.5 py-2 text-[11.5px] leading-snug text-amber-800">
          <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
          <div>
            <p className="font-semibold">Kho chưa đủ hàng</p>
            {detail.stockShortage.map((s) => (
              <p key={s.sku} className="tabular-nums">
                {s.sku}: cần {s.required}, còn {s.onHand}
              </p>
            ))}
          </div>
        </div>
      )}

      <DetailGroup title={`Sản phẩm (${detail.items.length})`}>
        <ul className="space-y-2">
          {detail.items.map((item) => (
            <li key={item.id} className="flex gap-2.5">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-9 w-9 shrink-0 rounded-md border border-slate-200 object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[12.5px] font-medium leading-snug text-slate-900">
                  {item.name}
                </p>
                {(item.variantTitle || item.sku) && (
                  <p className="break-all text-[11px] leading-snug text-slate-500">
                    {[item.variantTitle, item.sku].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[12.5px] font-semibold tabular-nums text-slate-900">
                  {formatMoney(item.total)}
                </p>
                <p className="text-[11px] tabular-nums text-slate-500">
                  {item.quantity} × {formatMoney(item.price)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </DetailGroup>

      <dl className="space-y-1 border-t border-slate-200/70 pt-2.5">
        <MoneyRow label="Tiền hàng" value={formatMoney(detail.subtotalPrice)} />
        {detail.totalDiscounts > 0 && (
          <MoneyRow label="Giảm giá" value={`−${formatMoney(detail.totalDiscounts)}`} />
        )}
        <MoneyRow label="Phí giao hàng" value={formatMoney(detail.totalShippingPrice)} />
        <MoneyRow label="Tổng cộng" value={formatMoney(detail.totalPrice)} strong />
        <div className="flex items-center justify-between gap-3 pt-0.5">
          <dt className="text-[12px] text-slate-600">Thanh toán</dt>
          <dd>
            <StatusChip label={payment.label} tone={payment.tone} icon={payment.icon} />
          </dd>
        </div>
        {detail.totalReceived > 0 && (
          <>
            <MoneyRow label="Đã thu" value={formatMoney(detail.totalReceived)} />
            {remaining > 0 && (
              <MoneyRow label="Còn phải thu" value={formatMoney(remaining)} />
            )}
          </>
        )}
      </dl>

      {detail.shipping && (
        <DetailGroup title="Giao đến">
          <div className="flex gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden />
            <div className="min-w-0 text-[12px] leading-snug text-slate-700">
              {(detail.shipping.name || detail.shipping.phone) && (
                <p className="font-medium text-slate-900">
                  {[detail.shipping.name, detail.shipping.phone].filter(Boolean).join(" · ")}
                </p>
              )}
              {detail.shipping.address && <p>{detail.shipping.address}</p>}
            </div>
          </div>
        </DetailGroup>
      )}

      {info.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-t border-slate-200/70 pt-2.5 text-[12px]">
          {info.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-slate-500">{label}</dt>
              <dd className="min-w-0 break-words text-slate-800">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {detail.note && (
        <DetailGroup title="Ghi chú">
          <p className="whitespace-pre-line text-[12px] leading-snug text-slate-700">
            {detail.note}
          </p>
        </DetailGroup>
      )}
    </div>
  );
}

function OrderDetailPanel({
  conversationId,
  order,
  panelId,
}: {
  conversationId: string;
  order: CskhConversationOrder;
  panelId: string;
}) {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [...conversationOrdersQueryKey(conversationId), "detail", order.id],
    queryFn: ({ signal }) => fetchConversationOrderDetail(conversationId, order.id, signal),
    staleTime: 30_000,
    retry: 0,
  });

  const errorText = isError
    ? "Không tải được chi tiết đơn."
    : data && !data.detail
      ? data.detailError || "Không lấy được chi tiết đơn từ kho."
      : null;

  return (
    <div id={panelId} className="border-t border-slate-100 bg-slate-50/80 px-3 pb-3.5 pt-3">
      {isLoading ? (
        <div className="space-y-2" aria-label="Đang tải chi tiết đơn">
          <div className="h-[22px] w-40 animate-pulse rounded-full bg-slate-200/70" />
          <div className="h-3 w-full animate-pulse rounded bg-slate-200/70" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200/70" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200/70" />
        </div>
      ) : errorText ? (
        <div className="flex items-start justify-between gap-3">
          <p className="text-[12px] leading-snug text-red-700">{errorText}</p>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[11.5px] font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} aria-hidden />
            Thử lại
          </button>
        </div>
      ) : data?.detail ? (
        <OrderDetailBody detail={data.detail} createdByName={data.order.createdByName} />
      ) : null}
    </div>
  );
}

function OrderRow({
  conversationId,
  order,
  open,
  onToggle,
}: {
  conversationId: string;
  order: CskhConversationOrder;
  open: boolean;
  onToggle: () => void;
}) {
  const pending = order.id.startsWith(PENDING_PREFIX);
  const stage = order.oms ? STAGE_META[order.oms.stage] : null;
  const cancelled = order.oms?.stage === "cancelled";
  const firstItem = order.oms?.firstItemName ?? null;
  const itemsQuantity = order.oms?.itemsQuantity ?? 0;
  const panelId = `order-detail-${order.id}`;
  const showTotal = !pending || order.totalPrice > 0;

  const body = (
    <div className="flex items-start gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[13px] font-semibold tabular-nums text-slate-900">
            {orderLabel(order)}
          </span>
          {showTotal && (
            <span
              className={cn(
                "shrink-0 text-[13px] font-semibold tabular-nums",
                cancelled ? "text-slate-500 line-through" : "text-slate-900",
              )}
            >
              {formatMoney(order.totalPrice)}
            </span>
          )}
        </div>
        {firstItem && (
          <p className="mt-0.5 flex min-w-0 gap-1 text-[12px] text-slate-600">
            <span className="truncate">{firstItem}</span>
            {itemsQuantity > 1 && (
              <span className="shrink-0 text-slate-500">· {itemsQuantity} sản phẩm</span>
            )}
          </p>
        )}
        <div className="mt-1.5 flex items-center justify-between gap-2">
          {pending ? (
            <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-slate-100 px-2 text-[11px] font-semibold text-slate-600">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              Đang đồng bộ
            </span>
          ) : stage ? (
            <StatusChip label={stage.label} tone={stage.tone} icon={stage.icon} />
          ) : (
            <span className="text-[11px] font-medium text-slate-500">
              {order.source === "sapo" ? "Đơn Sapo" : "Chưa có trạng thái"}
            </span>
          )}
          <span className="shrink-0 text-[11px] tabular-nums text-slate-500">
            {formatShortTime(order.createdAt)}
          </span>
        </div>
      </div>
      {!pending && (
        <ChevronDown
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      )}
    </div>
  );

  if (pending) {
    return <li className="px-3 py-2.5">{body}</li>;
  }

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={cn(
          "block w-full px-3 py-2.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500",
          open && "bg-slate-50",
        )}
      >
        {body}
      </button>
      {open && (
        <OrderDetailPanel conversationId={conversationId} order={order} panelId={panelId} />
      )}
    </li>
  );
}

export function ConversationOrdersSection({
  conversationId,
}: {
  conversationId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: conversationOrdersQueryKey(conversationId),
    queryFn: ({ signal }) => fetchConversationOrders(conversationId, signal),
    staleTime: 60_000,
  });

  const items = data?.items ?? [];
  const visible = expanded ? items : items.slice(0, VISIBLE_ORDERS);
  const hiddenCount = items.length - visible.length;
  const hasOrders = Boolean(data && data.totalCount > 0);

  return (
    <div className="px-5 py-4 space-y-3">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 flex items-center gap-1.5 w-full">
        <Receipt className="w-3 h-3" />
        Đơn hàng
        {hasOrders && data && (
          <span
            title="Tổng giá trị không tính đơn đã huỷ"
            className="ml-auto text-[11px] font-semibold normal-case tracking-normal tabular-nums text-slate-600"
          >
            {data.totalCount} đơn · {formatMoney(data.totalValue)}
          </span>
        )}
      </h4>

      {isLoading ? (
        <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-white">
          <SkeletonRows />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-between gap-3 rounded-[10px] border border-slate-200 bg-white px-3 py-2.5">
          <p className="text-[12px] text-red-700">Không tải được đơn hàng.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-[11.5px] font-semibold text-slate-700 hover:border-slate-300 hover:text-slate-900 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} aria-hidden />
            Thử lại
          </button>
        </div>
      ) : !hasOrders ? (
        <div className="flex items-center gap-3 rounded-[10px] border border-dashed border-slate-200 bg-white px-3 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Receipt className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-semibold text-slate-800">Chưa có đơn nào</p>
            <p className="text-[11.5px] leading-snug text-slate-500">
              Đơn tạo từ hội thoại này sẽ hiện ở đây.
            </p>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "overflow-hidden rounded-[10px] border border-slate-200 bg-white transition-opacity",
            isFetching && "opacity-60",
          )}
        >
          <ul className="divide-y divide-slate-100">
            {visible.map((order) => (
              <OrderRow
                key={order.id}
                conversationId={conversationId}
                order={order}
                open={openId === order.id}
                onToggle={() => setOpenId((cur) => (cur === order.id ? null : order.id))}
              />
            ))}
          </ul>
          {items.length > VISIBLE_ORDERS && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="block w-full border-t border-slate-100 py-2 text-[12px] font-semibold text-indigo-600 hover:bg-slate-50 hover:text-indigo-700 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500"
            >
              {expanded ? "Thu gọn" : `Xem thêm ${hiddenCount} đơn`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
