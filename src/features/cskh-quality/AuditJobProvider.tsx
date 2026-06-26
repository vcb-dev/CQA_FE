import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Link, useLocation } from 'react-router-dom'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ClipboardCheck, Loader2 } from 'lucide-react'
import { getApiErrorMessage } from '@/lib/axios'
import { isTransientInfraError } from '@/lib/userFacingError'
import {
  fetchAuditProgress,
  fetchRunningCskhJob,
  type CskhAuditProgress,
} from './api'
import { auditProgressPercent } from './cskhUi'

export const AUDIT_JOB_STORAGE_KEY = 'cskh:audit-job-id'
const AUDIT_TOAST_ID = 'cskh-audit-progress-global'

function loadStoredJobId(): string | null {
  try {
    if (typeof sessionStorage === 'undefined') return null
    return sessionStorage.getItem(AUDIT_JOB_STORAGE_KEY)
  } catch {
    return null
  }
}

function persistJobId(jobId: string | null) {
  try {
    if (typeof sessionStorage === 'undefined') return
    if (jobId) sessionStorage.setItem(AUDIT_JOB_STORAGE_KEY, jobId)
    else sessionStorage.removeItem(AUDIT_JOB_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

function cskhQueryRetry(failureCount: number, error: unknown): boolean {
  const msg = getApiErrorMessage(error)
  if (isTransientInfraError(msg)) return failureCount < 4
  return failureCount < 1
}

function cskhQueryRetryDelay(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 8000)
}

type AuditJobContextValue = {
  jobId: string | null
  progress: CskhAuditProgress | undefined
  isRunning: boolean
  isFetching: boolean
  setJobId: (jobId: string | null) => void
  clearJobId: () => void
}

const AuditJobContext = createContext<AuditJobContextValue | null>(null)

export function useAuditJob(): AuditJobContextValue {
  const ctx = useContext(AuditJobContext)
  if (!ctx) {
    throw new Error('useAuditJob must be used within AuditJobProvider')
  }
  return ctx
}

export function useOptionalAuditJob(): AuditJobContextValue | null {
  return useContext(AuditJobContext)
}

export function AuditJobProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const location = useLocation()
  const [trackedJobId, setTrackedJobId] = useState<string | null>(() => loadStoredJobId())
  const prevStatusRef = useRef<string | null>(null)

  const { data: runningJob } = useQuery({
    queryKey: ['cskh', 'running-audit-job'],
    queryFn: () => fetchRunningCskhJob('audit'),
    refetchInterval: 6000,
    staleTime: 3000,
    retry: cskhQueryRetry,
    retryDelay: cskhQueryRetryDelay,
  })

  const jobId = useMemo(() => {
    if (runningJob?.status === 'running') return runningJob.id
    return trackedJobId
  }, [runningJob, trackedJobId])

  const setJobId = useCallback(
    (id: string | null) => {
      setTrackedJobId(id)
      persistJobId(id)
      if (id) {
        void qc.invalidateQueries({ queryKey: ['cskh', 'running-audit-job'] })
      }
    },
    [qc]
  )

  const clearJobId = useCallback(() => setJobId(null), [setJobId])

  useEffect(() => {
    if (runningJob?.status === 'running' && runningJob.id !== trackedJobId) {
      setTrackedJobId(runningJob.id)
      persistJobId(runningJob.id)
    }
    if (runningJob && runningJob.status !== 'running' && !trackedJobId) {
      persistJobId(null)
    }
  }, [runningJob, trackedJobId])

  const {
    data: progress,
    isFetching,
    isError: progressError,
    error: progressErr,
    failureCount: progressFailureCount,
  } = useQuery({
    queryKey: ['cskh', 'audit-progress', jobId],
    queryFn: () => fetchAuditProgress(jobId!),
    enabled: !!jobId,
    refetchInterval: (query) => (query.state.data?.status === 'running' ? 2000 : false),
    placeholderData: keepPreviousData,
    retry: cskhQueryRetry,
    retryDelay: cskhQueryRetryDelay,
  })

  const isRunning =
    progress?.status === 'running' ||
    runningJob?.status === 'running' ||
    (!!jobId && progress === undefined && !progressError)

  useEffect(() => {
    if (!progress || progress.status === 'running') return
    if (prevStatusRef.current === progress.status) return
    prevStatusRef.current = progress.status

    const count = progress.summary?.auditCount ?? progress.audits?.length ?? 0

    if (progress.status === 'done') {
      if (progress.summary?.allAlreadyAudited) {
        toast.info(`Đã chấm hết ${progress.summary.skippedAlready ?? count} hội thoại — không còn mới.`, {
          id: AUDIT_TOAST_ID,
          duration: 6000,
        })
      } else if (progress.summary?.paused || progress.summary?.partial) {
        toast.info(`Tạm dừng chấm CSKH — đã xử lý ${count} hội thoại.`, {
          id: AUDIT_TOAST_ID,
          duration: 7000,
        })
      } else if (count > 0) {
        toast.success(`Hoàn tất chấm ${count} hội thoại CSKH`, {
          id: AUDIT_TOAST_ID,
          duration: 6000,
        })
      } else {
        toast.dismiss(AUDIT_TOAST_ID)
      }
    } else if (progress.status === 'failed') {
      toast.error(progress.error || 'Chấm CSKH thất bại', { id: AUDIT_TOAST_ID, duration: 8000 })
    }

    setTrackedJobId(null)
    persistJobId(null)
    void qc.invalidateQueries({ queryKey: ['cskh', 'audits'] })
    void qc.invalidateQueries({ queryKey: ['cskh', 'audit-day-stats'] })
    void qc.invalidateQueries({ queryKey: ['cskh', 'inbox'] })
    void qc.invalidateQueries({ queryKey: ['cskh', 'running-audit-job'] })
  }, [progress, qc])

  useEffect(() => {
    if (!progressError || !jobId) return
    if (progressFailureCount < 4 && isTransientInfraError(getApiErrorMessage(progressErr))) return
    setTrackedJobId(null)
    persistJobId(null)
    toast.dismiss(AUDIT_TOAST_ID)
  }, [progressError, progressErr, progressFailureCount, jobId])

  const showBanner = isRunning && !location.pathname.startsWith('/quality')
  const summary = progress?.summary
  const percent = auditProgressPercent(summary)
  const statusLine =
    summary?.phase === 'audit'
      ? `Chấm điểm ${summary.processed ?? 0}/${summary.total ?? '…'}`
      : summary?.phase === 'fetch'
        ? `Quét inbox ${summary.fetched ?? 0}${summary.maxConversations ? `/${summary.maxConversations}` : ''}`
        : 'Đang chấm CSKH…'

  const value = useMemo<AuditJobContextValue>(
    () => ({
      jobId,
      progress,
      isRunning,
      isFetching,
      setJobId,
      clearJobId,
    }),
    [jobId, progress, isRunning, isFetching, setJobId, clearJobId]
  )

  return (
    <AuditJobContext.Provider value={value}>
      {children}
      {showBanner ? (
        <div className="pointer-events-none fixed bottom-4 left-1/2 z-[200] w-[min(100%-2rem,28rem)] -translate-x-1/2">
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-indigo-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md dark:border-indigo-900/40 dark:bg-slate-900/95">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ClipboardCheck className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                Chấm CSKH đang chạy ngầm · {percent}%
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{statusLine}</p>
            </div>
            <Link
              to="/quality?tab=audit"
              className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Xem
            </Link>
          </div>
        </div>
      ) : null}
    </AuditJobContext.Provider>
  )
}
