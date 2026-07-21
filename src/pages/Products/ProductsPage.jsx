import { memo, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  MagnifyingGlass,
  Package,
  ShoppingCart,
  CurrencyDollar,
  ChartBar,
  Diamond,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';
import AnalyticsShell from '@/components/analytics/AnalyticsShell';
import KpiGrid from '@/components/analytics/KpiGrid';
import { fetchProductsAnalytics } from '@/features/cskh-quality/api';

const kpiMeta = [
  { key: 'totalProducts', icon: Package, color: 'var(--primary-500)' },
  { key: 'unitsSold', icon: ShoppingCart, color: '#f59e0b' },
  { key: 'revenue', icon: CurrencyDollar, color: '#22c55e' },
  { key: 'productsWithSales', icon: ChartBar, color: '#3b82f6' },
];

const ProductRow = memo(function ProductRow({ p }) {
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt=""
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Diamond size={18} weight="duotone" style={{ color: '#f59e0b' }} />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: '12px',
                lineHeight: 1.35,
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}
            >
              {p.name}
            </div>
            <div style={{ fontSize: '10px', color: '#9ca3af' }}>{p.code}</div>
            {p.craftType ? (
              <div style={{ fontSize: '9px', color: '#6366f1', marginTop: 2 }}>{p.craftType}</div>
            ) : null}
          </div>
        </div>
      </td>
      <td>
        <span className="tag tag-gray">{p.category}</span>
      </td>
      <td style={{ fontSize: '12px' }}>{p.material || '—'}</td>
      <td style={{ fontSize: '12px', color: p.size?.includes('chưa có') ? '#9ca3af' : undefined }}>
        {p.size || 'chưa có size'}
      </td>
      <td style={{ fontSize: '12px', color: p.color?.includes('chưa có') ? '#9ca3af' : undefined }}>
        {p.color || 'chưa có màu'}
      </td>
      <td style={{ fontWeight: 600 }}>{p.unitsSoldLabel}</td>
      <td style={{ fontWeight: 500 }}>{p.revenueLabel}</td>
    </tr>
  );
});

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') ?? '';
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const setCategory = (value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set('category', value);
        else next.delete('category');
        return next;
      },
      { replace: true },
    );
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [category]);

  useEffect(() => {
    const t = setTimeout(() => {
      setAppliedSearch(search.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, error, isFetching, isPlaceholderData } = useQuery({
    queryKey: ['cskh', 'products', 'analytics', appliedSearch, category, page, pageSize],
    queryFn: () =>
      fetchProductsAnalytics({
        q: appliedSearch || undefined,
        category: category || undefined,
        page,
        pageSize,
      }),
    staleTime: 90_000,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });

  const kpiItems = useMemo(() => {
    const list = data?.kpis ?? [];
    return kpiMeta.map((meta) => {
      const kpi = list.find((k) => k.key === meta.key);
      return {
        key: meta.key,
        label: kpi?.label ?? '…',
        value: kpi?.value ?? (isLoading && !data ? '…' : '0'),
        change: '',
        sub: kpi?.sub,
        icon: meta.icon,
        color: meta.color,
      };
    });
  }, [data?.kpis, isLoading, data]);

  useEffect(() => {
    if (data?.categories?.length) {
      queryClient.setQueryData(['cskh', 'products', 'categories'], data.categories);
    }
  }, [data?.categories, queryClient]);

  const items = data?.items ?? [];
  const pagination = data?.pagination ?? { page: 1, pageSize, total: 0, totalPages: 1 };
  const topByRevenue = data?.topByRevenue ?? [];
  const insights = data?.insights ?? [];
  const categories = data?.categories ?? [];

  return (
    <AnalyticsShell demo={false}>
      <div style={{ display: 'flex', gap: '14px', height: '100%' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto', minWidth: 0 }}>
          {isError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Không tải được dữ liệu sản phẩm: {error?.message || 'Lỗi không xác định'}
            </div>
          ) : null}

          <KpiGrid items={kpiItems} columns={4} />

          <div
            className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col"
            style={{ opacity: isFetching && isPlaceholderData ? 0.72 : 1, transition: 'opacity .15s' }}
          >
            <div className="card-title">
              <span>
                Danh sách sản phẩm
                {category ? (
                  <span className="ml-2 text-[11px] font-normal text-slate-500">· {category}</span>
                ) : null}
                {isFetching ? (
                  <span className="ml-2 text-[10px] font-normal text-slate-400">Đang tải…</span>
                ) : null}
              </span>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                  }}
                >
                  <MagnifyingGlass size={12} style={{ color: '#9ca3af' }} />
                  <input
                    placeholder="Tìm tên, SKU, danh mục..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ background: 'transparent', fontSize: '11px', width: '160px' }}
                  />
                </div>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Chất liệu</th>
                  <th>Size</th>
                  <th>Màu</th>
                  <th>Đã bán</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && !data ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                      Đang tải sản phẩm từ database…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
                      Không có sản phẩm
                    </td>
                  </tr>
                ) : (
                  items.map((p) => <ProductRow key={p.productId} p={p} />)
                )}
              </tbody>
            </table>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '8px',
                fontSize: '11px',
                color: '#6b7280',
                padding: '0 4px 4px',
              }}
            >
              <span>
                Hiển thị{' '}
                {pagination.total === 0
                  ? '0'
                  : `${(pagination.page - 1) * pagination.pageSize + 1} - ${Math.min(
                      pagination.page * pagination.pageSize,
                      pagination.total,
                    )}`}{' '}
                trong {pagination.total.toLocaleString('vi-VN')} sản phẩm
              </span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button
                  type="button"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{
                    width: 28,
                    height: 24,
                    borderRadius: 4,
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                    background: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
            width: '270px',
            minWidth: '270px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflow: 'auto',
          }}
        >
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col">
            <div className="card-title">Top doanh thu</div>
            {topByRevenue.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>
                Chưa có doanh thu từ đơn inbox
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 4px 8px' }}>
                {topByRevenue.map((p, i) => (
                  <div
                    key={p.productId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                    }}
                  >
                    <span
                      className={`rank-badge ${i < 3 ? `rank-${i + 1}` : 'rank-n'}`}
                      style={{ width: '24px', height: '24px', fontSize: '11px' }}
                    >
                      {p.rank}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#1f2937',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }}
                      >
                        {p.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#9ca3af' }}>{p.unitsSoldLabel}</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>{p.revenueLabel}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 shadow-sm flex flex-col">
            <div className="card-title">Ghi chú</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 4px 8px' }}>
              {insights.map((text, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: '12px',
                    lineHeight: 1.4,
                    color: '#374151',
                    padding: '4px 0',
                    borderBottom: i < insights.length - 1 ? '1px solid #e0e7ff' : 'none',
                  }}
                >
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnalyticsShell>
  );
}
