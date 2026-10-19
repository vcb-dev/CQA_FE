import type { CskhAdInsights, CskhInboxConversation } from "./api";

// resolveAdPostUrl là hàm để resolve permalink của post của ad từ conversation để lưu vào DB
export function resolveAdPostUrl(
  conversation: Pick<CskhInboxConversation, "adPostPermalink">,
  adInsights?: CskhAdInsights | null,
): string | null {
  const url =
    adInsights?.adPostUrl?.trim() || conversation.adPostPermalink?.trim() || "";
  return url.startsWith("http") ? url : null;
}
