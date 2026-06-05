# Tổng quan kỹ thuật dự án CRM_FE

Tài liệu này cung cấp cái nhìn tổng quan về stack công nghệ và các quy ước kỹ thuật cho dự án, giúp PM và các thành viên mới nắm bắt nhanh cơ sở hạ tầng của dự án.

## 1. Tổng quan Công nghệ (Tech Stack)

Dự án được xây dựng trên nền tảng hiện đại, tập trung vào hiệu năng và khả năng mở rộng:

- **Framework:** React 19 (với TypeScript)
- **Build Tool:** Vite (đảm bảo tốc độ phát triển và build cực nhanh)
- **Ngôn ngữ:** TypeScript (đảm bảo type-safety, giảm thiểu lỗi runtime)

## 2. Các thư viện cốt lõi

- **Quản lý trạng thái (State Management):** **Zustand**. Được chọn vì sự nhẹ nhàng, đơn giản, không gây re-render không cần thiết và dễ học hơn so với Redux.
- **Quản lý dữ liệu server (Data Fetching):** **TanStack Query**. Giúp xử lý caching, đồng bộ hóa dữ liệu từ server, tự động retry khi lỗi và quản lý trạng thái loading một cách chuyên nghiệp.
- **Giao diện người dùng (UI Components):** **Shadcn UI & Radix UI**. Sử dụng các component có khả năng truy cập cao (accessible), tùy biến dễ dàng và đồng nhất về giao diện.

## 3. Styling & Thiết kế

- **Styling:** **Tailwind CSS (v4)**. Sử dụng phương pháp "Utility-first" giúp code CSS nhanh, gọn và dễ bảo trì mà không cần file CSS cồng kềnh.
- **Phông chữ (Typography):** Dự án sử dụng font **Geist** (`@fontsource-variable/geist`). Đây là phông chữ variable hiện đại, tối ưu cho việc hiển thị trên các ứng dụng dashboard/CRM.

## 4. Tiêu chuẩn & Quy tắc Code

Để đảm bảo chất lượng code đồng nhất, dự án áp dụng:

- **TypeScript:** Bắt buộc sử dụng để định nghĩa kiểu dữ liệu chặt chẽ.
- **ESLint & Prettier:** Được tích hợp để tự động hóa việc kiểm tra lỗi cú pháp và định dạng code (format). Dev cần tuân thủ cấu hình này khi commit code.
- **Alias:** Sử dụng alias `@/` thay cho đường dẫn tương đối (ví dụ: `import { Button } from "@/components/ui/button"` thay vì `import { Button } from "../../../components/ui/button"`).

## 5. Lệnh thực thi cơ bản

- `npm run dev`: Khởi chạy môi trường phát triển cục bộ.
- `npm run build`: Build dự án cho môi trường production.
