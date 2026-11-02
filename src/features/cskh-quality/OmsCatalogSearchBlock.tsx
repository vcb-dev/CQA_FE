import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Search } from "lucide-react";
import type { OmsCatalogItem } from "./api";
import { fetchOmsCatalog } from "./api";
import { cn } from "@/lib/utils";

type OmsCatalogSearchBlockProps = {
  /** Đổi hội thoại → reset ô tìm & gợi ý từ khóa */
  conversationKey: string;
  seedQuery?: string;
  excludeVariantIds?: string[];
  enabled?: boolean;
  /** Modal tạo đơn: thêm dòng sản phẩm */
  onPick?: (item: OmsCatalogItem) => void;
  listMaxHeightClass?: string;
};

function CatalogRowContent({ p }: { p: OmsCatalogItem }) {
  return (
    <>
      {p.imageUrl ? (
        <img
          src={p.imageUrl}
          alt=""
          className="h-9 w-9 shrink-0 rounded-md object-cover border border-slate-100"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-700 leading-snug break-words">
          {p.name}
        </p>
        <p className="text-[9px] text-emerald-700/90 font-medium mt-0.5">
          {[p.variantTitle, p.sku ? `SKU ${p.sku}` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="text-[10px] text-violet-600 font-bold mt-0.5">
          {p.priceLabel}
          <span
            className={cn(
              "font-normal ml-1.5",
              p.inStock ? "text-slate-400" : "text-rose-500",
            )}
          >
            · Tồn {p.inventoryQuantity}
          </span>
        </p>
      </div>
    </>
  );
}

export function OmsCatalogSearchBlock({
  conversationKey,
  seedQuery = "",
  excludeVariantIds = [],
  enabled = true,
  onPick,
  listMaxHeightClass = "max-h-56",
}: OmsCatalogSearchBlockProps) {
  const [productSearch, setProductSearch] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(productSearch.trim()), 350);
    return () => window.clearTimeout(t);
  }, [productSearch]);

  useEffect(() => {
    const seed = seedQuery.trim();
    setProductSearch(seed);
    setDebouncedQ(seed);
  }, [conversationKey, seedQuery]);

  const catalogQ = useQuery({
    queryKey: ["cskh", "oms", "catalog", debouncedQ],
    queryFn: () => fetchOmsCatalog(debouncedQ),
    enabled,
    staleTime: 30_000,
  });

  const excludeSet = useMemo(
    () => new Set(excludeVariantIds),
    [excludeVariantIds],
  );

  const items = useMemo(() => {
    return (catalogQ.data?.items ?? []).filter(
      (p) => !excludeSet.has(p.variantId),
    );
  }, [catalogQ.data?.items, excludeSet]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <input
          type="search"
          value={productSearch}
          onChange={(e) => setProductSearch(e.target.value)}
          placeholder="Tìm tên hoặc SKU trên kho..."
          className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-2 text-[11px] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {catalogQ.isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-6 flex flex-col items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <p className="text-[11px] text-slate-500">Đang tải catalog kho...</p>
        </div>
      ) : catalogQ.isError ? (
        <p className="text-[11px] text-rose-600">
          {(
            catalogQ.error as Error & {
              response?: { data?: { message?: string } };
            }
          ).response?.data?.message || "Không tải được sản phẩm từ kho."}
        </p>
      ) : items.length === 0 ? (
        <p className="text-[11px] text-slate-400 italic py-2">
          {debouncedQ ? "Không tìm thấy sản phẩm." : "Không có sản phẩm khả dụng."}
        </p>
      ) : (
        <div
          className={cn(
            "overflow-y-auto space-y-1.5 pr-1",
            listMaxHeightClass,
          )}
        >
          {items.map((p) =>
            onPick ? (
              <button
                key={p.variantId}
                type="button"
                disabled={!p.inStock}
                onClick={() => onPick(p)}
                className={cn(
                  "w-full flex items-start gap-2 rounded-lg border px-2.5 py-2 text-left text-[11px] transition-colors",
                  p.inStock
                    ? "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                    : "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed",
                )}
              >
                <Plus className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                <CatalogRowContent p={p} />
              </button>
            ) : (
              <div
                key={p.variantId}
                className={cn(
                  "flex gap-2 rounded-lg border px-2.5 py-2 text-[11px]",
                  p.inStock
                    ? "border-slate-200 bg-white"
                    : "border-slate-100 bg-slate-50 opacity-80",
                )}
              >
                <CatalogRowContent p={p} />
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
