import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/** Xử lý redirect sau OAuth Facebook — refetch pages ngay, không cần restart. */
export function useCskhOAuthReturn() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const handledRef = useRef<string | null>(null)

  useEffect(() => {
    const oauthError = searchParams.get('oauth_error')
    const fbConnected = searchParams.get('fb_connected')
    const signature = oauthError
      ? `err:${oauthError}`
      : fbConnected != null && fbConnected !== ''
        ? `ok:${fbConnected}`
        : null

    if (!signature || handledRef.current === signature) return
    handledRef.current = signature

    const next = new URLSearchParams(searchParams)

    if (oauthError) {
      toast.error(`Lỗi kết nối Facebook: ${decodeURIComponent(oauthError)}`)
      next.delete('oauth_error')
      next.delete('fb_connected')
      setSearchParams(next, { replace: true })
      return
    }

    const pageCount = Number(fbConnected)
    toast.success(
      Number.isFinite(pageCount) && pageCount > 0
        ? `Kết nối Facebook thành công! Đã đồng bộ ${pageCount} trang.`
        : 'Kết nối Facebook thành công!'
    )

    void queryClient.invalidateQueries({ queryKey: ['cskh'] })
    void queryClient.refetchQueries({ queryKey: ['cskh', 'pages'] })

    next.delete('fb_connected')
    next.delete('oauth_error')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams, queryClient])
}
