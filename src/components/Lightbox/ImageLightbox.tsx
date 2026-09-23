import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  cskhMediaProxySrc,
  cskhMediaSrc,
} from "../../features/cskh-quality/messageMedia";

export type ImageLightboxProps = {
  urls: string[];
  /** `null` = đóng */
  index: number | null;
  onClose: () => void;
};

/**
 * Kiểm tra xem URL có phải là URL của CDN hay không
 */
function isCdnUrl(url: string): boolean {
  return (
    !url.startsWith("blob:") &&
    /fbcdn|fbsbx|facebook\.com|fb\.com|cdninstagram|instagram\.com/i.test(url)
  );
}

/**
 * Resolve src của ảnh
 * @param url - URL của ảnh
 * @param useProxy - true nếu sử dụng proxy, false nếu không
 */
function resolveSrc(url: string, useProxy: boolean): string | undefined {
  if (url.startsWith("blob:")) return url;
  return useProxy ? cskhMediaProxySrc(url) : cskhMediaSrc(url);
}

export function ImageLightbox({ urls, index, onClose }: ImageLightboxProps) {
  const url = typeof index === "number" ? (urls[index] ?? null) : null;
  const isCdn = Boolean(url && isCdnUrl(url));
  // Sử dụng proxy nếu URL là URL của CDN
  const [useProxy, setUseProxy] = useState(isCdn);

  useEffect(() => {
    setUseProxy(isCdn);
  }, [url, isCdn]);

  if (index === null || !url) return null;

  // src: CDN hay hệ thống
  const src = resolveSrc(url, useProxy);
  if (!src) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        aria-label="Đóng ảnh"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Xem ảnh"
        className="relative z-10 max-h-[90vh] max-w-[90vw]"
      >
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
          onClick={(e) => e.stopPropagation()}
          onError={() => {
            if (!useProxy) setUseProxy(true);
          }}
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-800 shadow"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
