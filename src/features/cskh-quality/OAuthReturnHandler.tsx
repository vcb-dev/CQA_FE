import { useCskhOAuthReturn } from './useCskhOAuthReturn'

/** Mount once in layout — cập nhật UI ngay sau OAuth Facebook. */
export function OAuthReturnHandler() {
  useCskhOAuthReturn()
  return null
}
