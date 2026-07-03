import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Diamond,
  Lightbulb,
  Loader2,
  RefreshCw,
  Search,
  Smile,
  Meh,
  Frown,
  Sparkles,
  Star,
  TrendingUp,
  AlertTriangle,
  XCircle,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/custom-ui/select';
import { DatePicker } from '@/components/custom-ui/date-picker';
import { cn } from '@/lib/utils';
import { fetchCskhInsights } from '@/features/cskh-quality/api';

const CONCERN_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

const KPI_META = [
  { icon: Lightbulb, tone: 'text-indigo-600 bg-indigo-50' },
  { icon: AlertTriangle, tone: 'text-rose-600 bg-rose-50' },
  { icon: TrendingUp, tone: 'text-emerald-600 bg-emerald-50' },
  { icon: Search, tone: 'text-amber-600 bg-amber-50' },
];

const STATUS_BADGE = {
  good: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  critical: 'border-rose-200 bg-rose-50 text-rose-700',
};

function formatYmd(d) {
  return d.toISOString().slice(0, 10);
}

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: formatYmd(from), to: formatYmd(to) };
}

function StatusBadge({ status, label }) {
  return (
    <Badge variant="outline" className={cn('font-semibold', STATUS_BADGE[status])}>
      {label}
    </Badge>
  );
}

function ScoreBar({ score, className }) {
  const color =
    score >= 70 ? 'bg-emerald-500' : score >= 55 ? 'bg-amber-500' : 'bg-rose-500';
  const text =
    score >= 70 ? 'text-emerald-600' : score >= 55 ? 'text-amber-600' : 'text-rose-600';

  return (
    <div className={cn('flex min-w-[100px] items-center gap-2', className)}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className={cn('w-8 text-right text-xs font-bold tabular-nums', text)}>{score}</span>
    </div>
  );
}

function ConcernDonut({ data, total }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const pctSum = data.reduce((s, d) => s + d.pct, 0) || 1;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative mx-auto h-[148px] w-[148px] shrink-0 sm:mx-0">
        <svg width="148" height="148" className="-rotate-90">
          <circle cx="74" cy="74" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="16" />
          {data.map((d, i) => {
            const dash = (d.pct / pctSum) * c;
            const o = offset;
            offset += dash;
            return (
              <circle
                key={i}
                cx="74"
                cy="74"
                r={r}
                fill="none"
                stroke={d.color || CONCERN_COLORS[i % CONCERN_COLORS.length]}
                strokeWidth="16"
                strokeDasharray={`${dash} ${c - dash}`}
                strokeDashoffset={-o}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-xl font-bold tabular-nums text-foreground">
            {total.toLocaleString('vi-VN')}
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            đề cập
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: d.color || CONCERN_COLORS[i % CONCERN_COLORS.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-foreground">{d.label}</span>
            <span className="shrink-0 text-xs font-semibold text-muted-foreground">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChannelComparisonChart({ pages }) {
  const top = [...pages].sort((a, b) => a.avgScore - b.avgScore).slice(0, 10);

  return (
    <div className="space-y-2.5">
      {top.map((p) => {
        const bar =
          p.status === 'good'
            ? 'bg-emerald-500'
            : p.status === 'warning'
              ? 'bg-amber-500'
              : 'bg-rose-500';
        return (
          <div key={p.pageId} className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-foreground" title={p.pageName}>
                {p.pageName}
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn('h-full rounded-full', bar)}
                  style={{ width: `${p.avgScore}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-bold tabular-nums text-muted-foreground">{p.avgScore}</span>
          </div>
        );
      })}
    </div>
  );
}

function ChannelCard({ page, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(page.pageId)}
      className={cn(
        'w-full rounded-xl border p-3 text-left transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        page.status === 'good' && 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-300',
        page.status === 'warning' && 'border-amber-200 bg-amber-50/40 hover:border-amber-300',
        page.status === 'critical' && 'border-rose-200 bg-rose-50/40 hover:border-rose-300'
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {page.pageName}
        </p>
        <StatusBadge status={page.status} label={page.statusLabel} />
      </div>
      <ScoreBar score={page.avgScore} />
      <p className="mt-2 text-[11px] text-muted-foreground">
        {page.auditCount.toLocaleString('vi-VN')} HT · Rủi ro {page.riskRate}% · QA {page.passRate}%
      </p>
      {page.topIssue && (
        <p className="mt-2 line-clamp-2 text-[11px] font-medium text-rose-700">{page.topIssue}</p>
      )}
    </button>
  );
}

function KpiCards({ items }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi, i) => {
        const meta = KPI_META[i] ?? KPI_META[0];
        const Icon = meta.icon;
        return (
          <Card key={kpi.label} size="sm" className="shadow-sm">
            <CardContent className="flex items-start gap-3 pt-0">
              <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', meta.tone)}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                <p className="mt-0.5 truncate text-lg font-bold tracking-tight text-foreground">
                  {kpi.value}
                  {kpi.unit}
                </p>
                <p
                  className={cn(
                    'mt-1 text-[11px] font-medium',
                    kpi.changePositive === false ? 'text-rose-600' : 'text-emerald-600'
                  )}
                >
                  {kpi.change}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function AIInsightPage() {
  const [range, setRange] = useState(defaultRange);
  const [selectedPageId, setSelectedPageId] = useState('');

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['cskh', 'insights', range.from, range.to, selectedPageId || 'all'],
    queryFn: () =>
      fetchCskhInsights({
        auditDateFrom: range.from,
        auditDateTo: range.to,
        pageId: selectedPageId || undefined,
      }),
    staleTime: 60_000,
  });

  const kpiItems = useMemo(() => data?.kpis ?? [], [data]);
  const byPage = data?.byPage;
  const pageOptions = data?.pageDirectory ?? data?.byPage?.all ?? [];
  const isChannelDetail = Boolean(selectedPageId);

  const clearChannel = () => setSelectedPageId('');

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto pb-4">
      {/* Toolbar */}
      <Card className="shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isChannelDetail && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearChannel}
                    className="shrink-0 gap-1.5"
                  >
                    <ArrowLeft className="size-3.5" />
                    Chọn kênh khác
                  </Button>
                )}
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="size-4 text-primary" />
                  {isChannelDetail ? 'Chi tiết kênh' : 'Tổng quan AI Insight'}
                </CardTitle>
              </div>
              <CardDescription className="max-w-3xl text-sm leading-relaxed">
                {data?.intro ?? 'Đang tải dữ liệu từ bản ghi chấm điểm...'}
              </CardDescription>
              {data && (
                <p className="text-xs text-muted-foreground">
                  Điểm TB {data.avgScore}/100 · {data.totalAnalyzed.toLocaleString('vi-VN')} bản ghi
                  {byPage?.summary && !isChannelDetail && (
                    <>
                      {' '}
                      · {byPage.summary.good} ổn · {byPage.summary.warning} cần cải thiện ·{' '}
                      {byPage.summary.critical} cần xử lý
                    </>
                  )}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-end gap-2">
              <div className="w-[min(100%,220px)]">
                <p className="mb-1 text-[11px] font-medium text-muted-foreground">Kênh</p>
                <Select
                  value={selectedPageId || '__all__'}
                  onValueChange={(v) => setSelectedPageId(v === '__all__' ? '' : v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Tất cả kênh" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">Tất cả kênh</SelectItem>
                    {pageOptions.map((p) => (
                      <SelectItem key={p.pageId} value={p.pageId}>
                        {p.pageName} ({p.avgScore}đ)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[140px]">
                <p className="mb-1 text-[11px] font-medium text-muted-foreground">Từ ngày</p>
                <DatePicker
                  size="toolbar"
                  value={range.from}
                  onChange={(v) => setRange((r) => ({ ...r, from: v }))}
                  max={range.to}
                />
              </div>
              <div className="w-[140px]">
                <p className="mb-1 text-[11px] font-medium text-muted-foreground">Đến ngày</p>
                <DatePicker
                  size="toolbar"
                  value={range.to}
                  onChange={(v) => setRange((r) => ({ ...r, to: v }))}
                  min={range.from}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 gap-1.5"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Channel detail banner */}
      {isChannelDetail && data?.selectedPageName && (
        <Card className="border-primary/20 bg-primary/5 shadow-none">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="font-semibold">
                Đang xem
              </Badge>
              <span className="font-semibold text-foreground">{data.selectedPageName}</span>
            </div>
            <Button type="button" variant="default" size="sm" onClick={clearChannel} className="gap-1.5">
              <ArrowLeft className="size-3.5" />
              Quay lại danh sách kênh
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Đang tổng hợp insight...
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            Không tải được insight: {error?.message || 'Lỗi không xác định'}
          </CardContent>
        </Card>
      )}

      {data && !isLoading && (
        <>
          {/* Channel health — overview only */}
          {!isChannelDetail && byPage && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="size-4 text-primary" />
                  Sức khỏe từng kênh
                </CardTitle>
                <CardDescription>
                  Bấm vào kênh để xem chi tiết — ưu tiên các kênh đỏ/vàng trước
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-rose-600">
                      <XCircle className="size-3.5" />
                      Cần cải thiện ({byPage.needsAttention.length})
                    </p>
                    <div className="space-y-2">
                      {byPage.needsAttention.length > 0 ? (
                        byPage.needsAttention.map((p) => (
                          <ChannelCard key={p.pageId} page={p} onSelect={setSelectedPageId} />
                        ))
                      ) : (
                        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                          Không có kênh cảnh báo
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-600">
                      <ShieldCheck className="size-3.5" />
                      Kênh đang ổn ({byPage.topPerformers.length})
                    </p>
                    <div className="space-y-2">
                      {byPage.topPerformers.length > 0 ? (
                        byPage.topPerformers.map((p) => (
                          <ChannelCard key={p.pageId} page={p} onSelect={setSelectedPageId} />
                        ))
                      ) : (
                        <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                          Chưa đủ dữ liệu
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      So sánh điểm QA
                    </p>
                    <ChannelComparisonChart pages={byPage.all} />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Bảng tất cả kênh</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kênh</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Điểm</TableHead>
                        <TableHead>QA đạt</TableHead>
                        <TableHead>Rủi ro</TableHead>
                        <TableHead className="hidden md:table-cell">HT</TableHead>
                        <TableHead className="hidden lg:table-cell">Vấn đề chính</TableHead>
                        <TableHead className="w-8" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {byPage.all.map((p) => (
                        <TableRow
                          key={p.pageId}
                          className="cursor-pointer"
                          onClick={() => setSelectedPageId(p.pageId)}
                        >
                          <TableCell className="max-w-[180px] font-medium">
                            <span className="line-clamp-2">{p.pageName}</span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={p.status} label={p.statusLabel} />
                          </TableCell>
                          <TableCell>
                            <ScoreBar score={p.avgScore} />
                          </TableCell>
                          <TableCell>{p.passRate}%</TableCell>
                          <TableCell
                            className={cn(
                              'font-medium',
                              p.riskRate >= 75 ? 'text-rose-600' : 'text-muted-foreground'
                            )}
                          >
                            {p.riskRate}%
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {p.auditCount.toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell className="hidden max-w-[240px] truncate text-xs text-muted-foreground lg:table-cell">
                            {p.topIssue || '—'}
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="size-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          <KpiCards items={kpiItems} />

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">
                  {isChannelDetail ? 'Khách quan tâm gì?' : 'Khách quan tâm điều gì nhất?'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.customerConcerns?.items?.length > 0 ? (
                  <ConcernDonut
                    data={data.customerConcerns.items}
                    total={data.customerConcerns.total}
                  />
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">Chưa có từ khóa</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Yếu tố chốt & mất đơn</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <CheckCircle2 className="size-3.5" />
                      Giúp chốt cao
                    </p>
                    {(data.closeRateFactors?.highClose ?? []).map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-2 rounded-lg bg-emerald-50/60 px-2.5 py-2 text-xs"
                      >
                        <span className="text-foreground">{f.label}</span>
                        <Badge variant="outline" className="shrink-0 border-emerald-200 text-emerald-700">
                          {f.pct}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-1 text-xs font-bold text-rose-600">
                      <AlertTriangle className="size-3.5" />
                      Lý do mất đơn
                    </p>
                    {(data.closeRateFactors?.lostOrders ?? []).map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start justify-between gap-2 rounded-lg bg-rose-50/60 px-2.5 py-2 text-xs"
                      >
                        <span className="text-foreground">{f.label}</span>
                        <Badge variant="outline" className="shrink-0 border-rose-200 text-rose-700">
                          {f.pct}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-4 text-primary" />
                Gợi ý content video
              </CardTitle>
              <CardDescription>Từ khóa thực tế trong hội thoại đã chấm</CardDescription>
            </CardHeader>
            <CardContent>
              {(data.videoTopics ?? []).length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {(data.videoTopics ?? []).map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        'rounded-xl border p-3 transition-colors',
                        i === 0 ? 'border-primary/30 bg-primary/5' : 'bg-card'
                      )}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug text-foreground">
                          {item.question}
                        </p>
                        <Badge variant="secondary">{item.mentions} lần</Badge>
                      </div>
                      <p className="rounded-lg bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-800">
                        {item.angle}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.hook}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">Chưa có gợi ý</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Chủ đề được quan tâm</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chủ đề</TableHead>
                      <TableHead className="text-right">Lượt nhắc</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(data.products ?? []).map((p, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 font-medium">
                            <Diamond className="size-3.5 text-amber-500" />
                            {p.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {p.visits.toLocaleString('vi-VN')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Cảm xúc khách hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Smile, label: 'Tích cực', pct: data.sentiment?.positive, color: 'text-emerald-600' },
                    { icon: Meh, label: 'Trung tính', pct: data.sentiment?.neutral, color: 'text-amber-600' },
                    { icon: Frown, label: 'Tiêu cực', pct: data.sentiment?.negative, color: 'text-rose-600' },
                  ].map(({ icon: Icon, label, pct, color }) => (
                    <div
                      key={label}
                      className="flex flex-col items-center rounded-xl border bg-muted/20 px-3 py-4 text-center"
                    >
                      <Icon className={cn('mb-2 size-6', color)} />
                      <span className="text-2xl font-bold tabular-nums text-foreground">{pct}%</span>
                      <span className="mt-1 text-xs text-muted-foreground">{label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Hiệu quả theo nguồn hội thoại</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nguồn</TableHead>
                    <TableHead>Chất lượng</TableHead>
                    <TableHead>QA đạt</TableHead>
                    <TableHead className="text-right">Hội thoại</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(data.adEfficiency ?? []).map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star
                              key={j}
                              className={cn(
                                'size-3',
                                j < a.stars ? 'fill-amber-400 text-amber-400' : 'text-muted'
                              )}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground">{a.quality}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{a.closeRate}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {a.conversationCount.toLocaleString('vi-VN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
