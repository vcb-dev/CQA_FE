import AnalyticsShell from "@/components/analytics/AnalyticsShell";
import KpiGrid from "@/components/analytics/KpiGrid";
import { fetchCustomersAnalytics } from "@/features/cskh-quality/api";
import { CskhPageAvatar } from "@/features/cskh-quality/cskhUi";
import {
  ArrowsCounterClockwise,
  Calendar,
  CaretLeft,
  CaretRight,
  ChatCircleText,
  CurrencyDollar,
  MagnifyingGlass,
  MapPin,
  Phone,
  ShoppingCart,
  UserPlus,
  Users,
} from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { memo, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const kpiMeta = [
  { key: "totalCustomers", icon: Users, color: "var(--primary-500)" },
  { key: "newThisMonth", icon: UserPlus, color: "#22c55e" },
  { key: "totalOrders", icon: ShoppingCart, color: "#f59e0b" },
  { key: "totalSpend", icon: CurrencyDollar, color: "#16a34a" },
  { key: "repeatCustomers", icon: ArrowsCounterClockwise, color: "#ec4899" },
  { key: "withPhone", icon: Phone, color: "#3b82f6" },
];

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return "—";
  }
}

const CustomerRow = memo(function CustomerRow({
  customer,
  selected,
  onSelect,
  isPotential,
}) {
  const lastDate = isPotential
    ? customer.potentialLeadAt || customer.lastMessageAt || customer.lastOrderAt
    : customer.lastOrderAt;

  return (
    <tr
      onClick={() => onSelect(customer.id)}
      className={selected ? "bg-indigo-50/60" : "hover:bg-slate-50/80"}
      style={{ cursor: "pointer" }}
    >
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CskhPageAvatar
            name={customer.name}
            pictureUrl={customer.pictureUrl}
            pageId={customer.pageId}
            psid={customer.participantPsid}
            className="!h-9 !w-9 !rounded-full"
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{customer.name}</div>
            <div style={{ fontSize: 10, color: "#9ca3af" }}>
              {customer.participantPsid
                ? `PSID ···${customer.participantPsid.slice(-6)}`
                : customer.id.slice(0, 18)}
            </div>
          </div>
        </div>
      </td>
      <td>
        <div style={{ fontSize: 12, fontWeight: 600 }}>{customer.channel}</div>
        <div style={{ fontSize: 10, color: "#9ca3af" }}>{customer.source}</div>
      </td>
      <td>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {(customer.statusLabels?.length
            ? customer.statusLabels
            : [{ name: customer.status, color: "#6366f1" }]
          ).map((lab) => (
            <span
              key={lab.name}
              className="tag"
              style={{
                background: `${lab.color}18`,
                color: lab.color,
                border: `1px solid ${lab.color}33`,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {lab.name}
            </span>
          ))}
        </div>
      </td>
      <td style={{ fontSize: 12 }}>
        {isPotential && !customer.phoneMasked
          ? "—"
          : customer.phoneMasked || "—"}
      </td>
      <td style={{ fontWeight: 600 }}>
        {isPotential ? "—" : customer.orderCountLabel}
      </td>
      <td style={{ fontWeight: 600 }}>
        {isPotential ? "—" : customer.totalSpendLabel}
      </td>
      <td style={{ fontSize: 12 }}>{formatDate(lastDate)}</td>
    </tr>
  );
});

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [pageId, setPageId] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const pageSize = 20;
  const [segment] = useState("potential");
  const isPotential = segment === "potential";

  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [pageId, status, segment]);

  const { data, isLoading, isError, error, isFetching, isPlaceholderData } =
    useQuery({
      queryKey: [
        "cskh",
        "customers",
        segment,
        appliedSearch,
        pageId,
        status,
        page,
        pageSize,
      ],
      queryFn: () =>
        fetchCustomersAnalytics({
          segment,
          q: appliedSearch || undefined,
          pageId: pageId || undefined,
          status: status || undefined,
          page,
          pageSize,
        }),
      staleTime: 60_000,
      placeholderData: keepPreviousData,
    });

  const items = data?.items ?? [];
  const channels = data?.channels ?? [];
  const statuses = data?.statuses ?? [];
  const pagination = data?.pagination ?? {
    page: 1,
    pageSize,
    total: 0,
    totalPages: 1,
  };

  const selected = useMemo(
    () => items.find((c) => c.id === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  );

  useEffect(() => {
    if (!selectedId && items[0]) setSelectedId(items[0].id);
    if (selectedId && items.length && !items.some((c) => c.id === selectedId)) {
      setSelectedId(items[0]?.id ?? null);
    }
  }, [items, selectedId]);

  const kpiItems = useMemo(() => {
    const list = data?.kpis ?? [];
    return kpiMeta.map((meta) => {
      const kpi = list.find((k) => k.key === meta.key);
      return {
        key: meta.key,
        label: kpi?.label ?? "…",
        value: kpi?.value ?? (isLoading && !data ? "…" : "0"),
        change: "",
        sub: kpi?.sub,
        icon: meta.icon,
        color: meta.color,
      };
    });
  }, [data?.kpis, isLoading, data]);

  return (
    <AnalyticsShell demo={false}>
      <div style={{ display: "flex", gap: 14, height: "100%" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            overflow: "auto",
            minWidth: 0,
          }}
        >
          {isError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Không tải được danh sách khách hàng:{" "}
              {error?.message || "Lỗi không xác định"}
            </div>
          ) : null}

          <KpiGrid items={kpiItems} columns={6} />

          <div
            className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col"
            style={{
              opacity: isFetching && isPlaceholderData ? 0.72 : 1,
              transition: "opacity .15s",
            }}
          >
            <div className="card-title">
              <span>
                {isPotential ? "Khách hàng tiềm năng" : "Danh sách khách hàng"}
                {isFetching ? (
                  <span className="ml-2 text-[10px] font-normal text-slate-400">
                    Đang tải…
                  </span>
                ) : null}
              </span>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 8px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                  }}
                >
                  <MagnifyingGlass size={12} style={{ color: "#9ca3af" }} />
                  <input
                    placeholder={
                      isPotential
                        ? "Tìm tên, PSID, kênh..."
                        : "Tìm tên, SĐT, kênh..."
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      background: "transparent",
                      fontSize: 11,
                      width: 160,
                    }}
                  />
                </div>
                <select
                  value={pageId}
                  onChange={(e) => setPageId(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    fontSize: 11,
                    maxWidth: 200,
                  }}
                >
                  <option value="">Tất cả kênh</option>
                  {channels.map((c) => (
                    <option key={c.pageId} value={c.pageId}>
                      {c.pageName} ({c.customerCount})
                    </option>
                  ))}
                </select>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 6,
                    fontSize: 11,
                  }}
                >
                  <option value="">Tất cả trạng thái</option>
                  {statuses.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.count})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Kênh</th>
                  <th>Trạng thái</th>
                  <th>SĐT</th>
                  <th>{isPotential ? "Đơn" : "Số đơn"}</th>
                  <th>{isPotential ? "Doanh thu" : "Tổng mua"}</th>
                  <th>{isPotential ? "Đánh dấu / chat cuối" : "Mua cuối"}</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && !data ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: 24,
                        color: "#9ca3af",
                      }}
                    >
                      Đang tải…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: 24,
                        color: "#9ca3af",
                        lineHeight: 1.5,
                      }}
                    >
                      {isPotential ? (
                        <>
                          Chưa có khách tiềm năng.
                          <br />
                          Vào{" "}
                          <Link
                            to="/conversations"
                            className="text-indigo-600 font-semibold hover:underline"
                          >
                            Hội thoại
                          </Link>
                          , mở khách → sidebar phải →{" "}
                          <strong>Đánh dấu là khách hàng tiềm năng</strong>.
                        </>
                      ) : (
                        <>
                          Chưa có khách nào từ đơn đã chốt. Tạo đơn từ hội thoại
                          để xuất hiện tại đây.
                        </>
                      )}
                    </td>
                  </tr>
                ) : (
                  items.map((c) => (
                    <CustomerRow
                      key={c.id}
                      customer={c}
                      selected={selected?.id === c.id}
                      onSelect={setSelectedId}
                      isPotential={isPotential}
                    />
                  ))
                )}
              </tbody>
            </table>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
                fontSize: 11,
                color: "#6b7280",
                padding: "0 4px 4px",
              }}
            >
              <span>
                Hiển thị{" "}
                {pagination.total === 0
                  ? "0"
                  : `${(pagination.page - 1) * pagination.pageSize + 1} - ${Math.min(
                      pagination.page * pagination.pageSize,
                      pagination.total,
                    )}`}{" "}
                trong {pagination.total.toLocaleString("vi-VN")}{" "}
                {isPotential ? "khách tiềm năng" : "khách"}
              </span>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <button
                  type="button"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{
                    width: 28,
                    height: 24,
                    borderRadius: 4,
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: page <= 1 ? 0.4 : 1,
                  }}
                >
                  <CaretLeft size={12} />
                </button>
                <span style={{ fontWeight: 600 }}>
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    width: 28,
                    height: 24,
                    borderRadius: 4,
                    background: "#f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: page >= pagination.totalPages ? 0.4 : 1,
                  }}
                >
                  <CaretRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            width: 280,
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflow: "auto",
          }}
        >
          {selected ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col p-4 gap-3">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CskhPageAvatar
                  name={selected.name}
                  pictureUrl={selected.pictureUrl}
                  pageId={selected.pageId}
                  psid={selected.participantPsid}
                  className="!h-12 !w-12 !rounded-full"
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {selected.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    {selected.channel}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {(selected.statusLabels?.length
                  ? selected.statusLabels
                  : [{ name: selected.status, color: "#6366f1" }]
                ).map((lab) => (
                  <span
                    key={lab.name}
                    className="tag"
                    style={{
                      background: `${lab.color}18`,
                      color: lab.color,
                      border: `1px solid ${lab.color}33`,
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {lab.name}
                  </span>
                ))}
              </div>

              {isPotential && selected.conversationId ? (
                <Link
                  to="/conversations"
                  className="block text-center rounded-xl border border-indigo-200 bg-indigo-50 py-2 text-[12px] font-bold text-indigo-700 hover:bg-indigo-100"
                >
                  Đi tới Hội thoại
                </Link>
              ) : null}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#374151",
                  }}
                >
                  <Phone size={14} className="text-slate-400" />
                  <span>{selected.phoneMasked || "Chưa có SĐT"}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    color: "#374151",
                  }}
                >
                  <MapPin
                    size={14}
                    className="text-slate-400 shrink-0 mt-0.5"
                  />
                  <span>{selected.address || "Chưa có địa chỉ"}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#374151",
                  }}
                >
                  <Calendar size={14} className="text-slate-400" />
                  <span>
                    {isPotential
                      ? `Đánh dấu tiềm năng: ${formatDate(
                          selected.potentialLeadAt || selected.lastOrderAt,
                        )}`
                      : `Mua cuối: ${formatDate(selected.lastOrderAt)}`}
                  </span>
                </div>
                {isPotential ? (
                  selected.lastMessageAt ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#374151",
                      }}
                    >
                      <ChatCircleText size={14} className="text-slate-400" />
                      <span>
                        Tin nhắn cuối: {formatDate(selected.lastMessageAt)}
                      </span>
                    </div>
                  ) : null
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#374151",
                    }}
                  >
                    <ChatCircleText size={14} className="text-slate-400" />
                    <span>Nguồn: {selected.source}</span>
                  </div>
                )}
                {isPotential ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: "#374151",
                    }}
                  >
                    <ChatCircleText size={14} className="text-slate-400" />
                    <span>Nguồn: {selected.source}</span>
                  </div>
                ) : null}
              </div>

              {isPotential ? (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-[12px] text-amber-900 leading-snug">
                  Lead từ inbox — chưa chốt đơn. Mở hội thoại để chăm sóc và tạo
                  đơn khi khách sẵn sàng.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <div
                      style={{
                        fontSize: 10,
                        color: "#9ca3af",
                        fontWeight: 600,
                      }}
                    >
                      Tổng chi tiêu
                    </div>
                    <div
                      style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}
                    >
                      {selected.totalSpendLabel}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <div
                      style={{
                        fontSize: 10,
                        color: "#9ca3af",
                        fontWeight: 600,
                      }}
                    >
                      Tổng đơn
                    </div>
                    <div
                      style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}
                    >
                      {selected.orderCountLabel}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 text-center text-sm text-slate-400">
              {!isLoading && pagination.total === 0 && isPotential
                ? "Chưa có lead nào được đánh dấu."
                : "Chọn khách hàng để xem chi tiết"}
            </div>
          )}

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 shadow-sm p-3">
            <div className="card-title" style={{ marginBottom: 8 }}>
              Ghi chú
            </div>
            <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.45 }}>
              {isPotential ? (
                <>
                  Danh sách khách được đánh dấu <strong>tiềm năng</strong> từ
                  sidebar hội thoại (giống Meta Business Suite). Trạng thái hiển
                  thị thêm nhãn hội thoại nếu có. Lọc kênh = Page
                  Facebook/Instagram của hội thoại.
                </>
              ) : (
                <>
                  Danh sách lấy từ đơn đã tạo khi chốt hàng trong hội thoại.
                  Trạng thái lấy từ nhãn hội thoại (Đã chốt, Follow…). Lọc theo
                  kênh = Page Facebook đã gắn với đơn.
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnalyticsShell>
  );
}
