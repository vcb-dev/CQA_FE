# UI-Kit: CRM_FE (Tài liệu chuẩn)

Tài liệu này là nguồn tham chiếu duy nhất về thiết kế và giao diện cho dự án, dựa trên kiến trúc `shadcn/radix-nova` và hệ thống biến CSS `oklch` được cấu hình trong `src/index.css`.

## 1. Design Principles
- **Triết lý:** Tập trung vào sự rõ ràng, mật độ thông tin cao và hiệu năng xử lý (CRM dashboard).
- **Tone & Feel:** Chuyên nghiệp, đáng tin cậy, hiện đại.
- **UX Guidelines:**
  - Ưu tiên thao tác phím tắt và tốc độ phản hồi.
  - Phản hồi trực quan thông qua hiệu ứng hoạt ảnh nhẹ nhàng.

## 2. Color System

### Neutral Colors
| Biến CSS | Hex |
| :--- | :--- |
| `--n-950` | #030712 |
| `--n-900` | #111827 |
| `--n-800` | #1f2937 |
| `--n-700` | #374151 |
| `--n-600` | #4b5563 |
| `--n-500` | #6b7280 |
| `--n-400` | #9ca3af |
| `--n-300` | #d1d5db |
| `--n-200` | #e5e7eb |
| `--n-100` | #f3f4f6 |
| `--n-50` | #f9fafb |

### Functional Colors
| Biến CSS | Hex | Mục đích |
| :--- | :--- | :--- |
| `--success-600`| #16a34a | Success feedback |
| `--success-500`| #22c55e | Success feedback |
| `--success-100`| #dcfce7 | Success feedback |
| `--success-50` | #f0fdf4 | Success feedback |
| `--warning-600`| #d97706 | Warning |
| `--warning-500`| #f59e0b | Warning |
| `--warning-100`| #fef3c7 | Warning |
| `--warning-50` | #fffbeb | Warning |
| `--danger-600` | #dc2626 | Error/Danger |
| `--danger-500` | #ef4444 | Error/Danger |
| `--danger-100` | #fee2e2 | Error/Danger |
| `--danger-50`  | #fef2f2 | Error/Danger |

### Semantic Colors (Oklch Variables)
Dùng cho Dark Mode tự động:
| Biến | Mục đích |
| :--- | :--- |
| `--primary` | Các hành động chính |
| `--background` | Nền ứng dụng |
| `--foreground` | Văn bản chủ đạo |
| `--border` | Đường kẻ, phân cách |
| `--destructive` | Hành động nguy hiểm/Lỗi |

## 3. Typography
- **Font Family:** `Roboto` (Variable font).
- **Fallback:** `-apple-system`, `BlinkMacSystemFont`, `"Segoe UI"`, `sans-serif`.
- **Cấu hình:** `html { font-size: 14px; }`.

## 4. Spacing System (4px Grid)
- **Cơ sở:** 4px.
- **Layout:** Header (`--header-h`: 52px), Sidebar (`--sidebar-w`: 210px), Padding content (16px 20px).

## 5. Border Radius
- `sm`: 4px (`--radius-sm`)
- `md`: 6px (`--radius-md`)
- `lg`: 8px (`--radius-lg`)
- `xl`: 12px (`--radius-xl`)
- `full`: 9999px (`--radius-full`)

## 6. Shadows
- Card: `0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)`
- MD: `0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)`

## 7. Layout System
- **Sidebar:** Width 210px.
- **Header:** Height 52px.
- **Content:** Flex layout, full-height, hidden overflow, min-height 0.

## 8. Components Reference
- **Buttons:** Dùng thẻ `<button>`, tự động thừa kế font.
- **Cards:** Class `.card` (đã bao gồm shadow, padding, border-radius).
- **Sidebar:** Class `.sidebar` (background gradient).
- **Tables:** Class `.data-table` (border-b-1, tr:hover).

## 9. Icons
- **Library:** Lucide Icons (config `components.json`).
- **Quy tắc:** Dùng kích thước 16px, 20px, 24px.

## 10. Animation Guidelines
- **Duration:** 150ms (`--tr-fast`), 200ms (`--tr-base`).
- **Keyframes:** `.anim-fade` (fade in), `.anim-up` (slide up).

## 11. Dark Mode
- Tự động thay đổi thông qua selector `.dark` và biến CSS `oklch`.

## 12. AI Coding Rules (Ràng buộc bắt buộc)
1. **KHÔNG** hardcode hex color. Sử dụng Tailwind classes hoặc biến CSS.
2. **LUÔN** bọc trang trong `.app-content` để đúng layout.
3. **LUÔN** hỗ trợ Dark Mode thông qua biến CSS.
4. **IMPORT:** Sử dụng alias `@/` cho components, lib, hooks.

## 13. Frontend Token Export (JSON)
```json
{
  "colors": {
    "primary": "oklch(0.205 0 0)",
    "background": "oklch(1 0 0)",
    "foreground": "oklch(0.145 0 0)"
  },
  "spacing": {
    "sidebar": "210px",
    "header": "52px"
  },
  "font": "Roboto"
}
```
