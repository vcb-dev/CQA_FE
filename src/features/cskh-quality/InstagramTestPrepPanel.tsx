import { InstagramLogo } from "@phosphor-icons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Circle,
  Loader2,
  SearchCheck,
  Wand2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchInstagramTestReadiness,
  prepareInstagramTest,
  type InstagramTestReadiness,
} from "./api";

export function InstagramTestPrepPanel() {
  const qc = useQueryClient();
  const readinessQ = useQuery({
    queryKey: ["cskh", "instagram-test-readiness"],
    queryFn: fetchInstagramTestReadiness,
    staleTime: 15_000,
    enabled: false,
  });

  const runCheck = () => {
    void readinessQ.refetch().then((r) => {
      if (r.isError) toast.error("Kiểm tra kênh Instagram thất bại.");
    });
  };

  const prepareMut = useMutation({
    mutationFn: prepareInstagramTest,
    onSuccess: (res) => {
      qc.setQueryData(["cskh", "instagram-test-readiness"], res.readiness);
      if (res.repair.repaired > 0) {
        toast.success(`Đã gắn Fanpage cho ${res.repair.repaired} kênh IG.`);
      }
      if (res.repair.stillBroken.length) {
        toast.warning(`Chưa sửa được: ${res.repair.stillBroken.join(", ")}`);
      }
      const totalSynced = res.sync.reduce((s, r) => s + r.synced, 0);
      if (totalSynced > 0) {
        toast.success(`Đã đồng bộ ${totalSynced} tin từ Instagram.`);
      }
      const syncErr = res.sync.find((s) => s.error);
      if (syncErr?.error) {
        toast.error(`Đồng bộ IG: ${syncErr.error}`);
      }
      if (res.readiness.ready) {
        toast.success(
          "Sẵn sàng thử — mở Inbox, lọc Instagram, nhắn từ IG tester.",
        );
      }
      void qc.invalidateQueries({ queryKey: ["cskh"] });
      void qc.invalidateQueries({
        queryKey: ["cskh", "instagram-test-readiness"],
      });
    },
    onError: () => toast.error("Chuẩn bị thử IG thất bại."),
  });

  const data = readinessQ.data;
  const checking = readinessQ.isFetching && !data;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-gradient-to-r from-pink-50 to-purple-50 px-5 py-4 dark:from-pink-950/30 dark:to-purple-950/30">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 text-white">
              <InstagramLogo className="h-5 w-5" weight="fill" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Thử nghiệm Instagram (Development)
              </h3>
              <p className="text-xs text-n-500 dark:text-n-400">
                Fanpage + IG đã gắn — dùng IG tester đã kết nối để nhắn thử
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={checking || prepareMut.isPending}
              onClick={runCheck}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-n-50 disabled:opacity-50 dark:hover:bg-n-900"
            >
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SearchCheck className="h-4 w-4" />
              )}
              {data ? "Kiểm tra lại" : "Kiểm tra kênh Instagram"}
            </button>
            <button
              type="button"
              disabled={checking || prepareMut.isPending}
              onClick={() => prepareMut.mutate()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              {prepareMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Chuẩn bị thử IG
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        {checking ? (
          <div className="flex items-center gap-2 text-sm text-n-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Đang kiểm tra kênh
            Instagram…
          </div>
        ) : null}

        {!data && !checking ? (
          <p className="text-sm text-n-500 dark:text-n-400">
            Chưa kiểm tra — bấm{" "}
            <strong className="font-medium text-foreground">
              Kiểm tra kênh Instagram
            </strong>{" "}
            để gọi Meta Graph.
          </p>
        ) : null}

        {data ? (
          <>
            <StatusBanner readiness={data} />

            <ul className="space-y-2">
              {data.steps.map((step) => (
                <li key={step.id} className="flex gap-2 text-sm">
                  {step.ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="mt-0.5 h-4 w-4 shrink-0 text-n-400" />
                  )}
                  <div>
                    <p
                      className={
                        step.ok
                          ? "text-foreground"
                          : "text-n-600 dark:text-n-300"
                      }
                    >
                      {step.label}
                    </p>
                    {step.hint && !step.ok ? (
                      <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                        {step.hint}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>

            {data.channels.length > 0 ? (
              <div className="rounded-xl border border-border bg-n-50/50 p-3 dark:bg-n-900/40">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-n-500">
                  Kênh IG
                </p>
                <ul className="space-y-2 text-sm">
                  {data.channels.map((ch) => (
                    <li
                      key={ch.pageId}
                      className="flex flex-wrap items-center gap-x-2 gap-y-1"
                    >
                      <span className="font-medium">
                        {ch.pageName || ch.pageId}
                      </span>
                      {ch.facebookPageName ? (
                        <span className="text-xs text-n-500">
                          ← Fanpage {ch.facebookPageName}
                        </span>
                      ) : null}
                      {ch.graphConversationsOk ? (
                        <span className="text-xs text-emerald-600">
                          Graph OK
                          {ch.conversationSampleCount > 0
                            ? ` (${ch.conversationSampleCount} hội thoại Graph)`
                            : " — Graph 0 hội thoại"}
                          {typeof ch.dbConversationCount === "number" ? (
                            <span className="text-xs text-n-500">
                              · DB web: {ch.dbConversationCount}
                            </span>
                          ) : null}
                        </span>
                      ) : ch.graphError ? (
                        <span className="text-xs text-red-600">
                          {ch.graphError}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {data.nextStepHint ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
                {data.nextStepHint}
              </div>
            ) : null}
            <p className="text-xs text-n-500 dark:text-n-400">
              {data.testerReminder}
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                to="/conversations"
                className="inline-flex rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-n-50 dark:hover:bg-n-900"
              >
                Mở Inbox → lọc Instagram
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatusBanner({ readiness }: { readiness: InstagramTestReadiness }) {
  if (readiness.ready) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
        <strong>Sẵn sàng thử.</strong> Từ app Instagram (tài khoản tester), gửi
        tin nhắn vào shop IG đã kết nối, rồi xem trên Inbox.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
      Chưa đủ điều kiện — bấm <strong>Chuẩn bị thử IG</strong> hoặc hoàn thành
      các bước còn thiếu (OAuth, quyền Meta).
    </div>
  );
}
