import React from "react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-slate-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8 px-6 sm:px-10 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold">Chính sách Bảo mật Quyền riêng tư</h1>
          <p className="text-blue-100 mt-2 text-sm">Hệ thống Quản lý & Đánh giá Chất lượng CSKH (CQA CRM)</p>
          <p className="text-blue-200 mt-1 text-xs">Cập nhật lần cuối: 18 tháng 6, 2026</p>
        </div>

        <div className="p-6 sm:p-10 space-y-8">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 border-slate-100">1. Giới thiệu</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Chào mừng bạn đến với <strong>CQA CRM</strong>. Chúng tôi tôn trọng quyền riêng tư của bạn và cam kết bảo vệ dữ liệu cá nhân của người dùng cũng như khách hàng tương tác với các trang Facebook Fanpage được liên kết với hệ thống của chúng tôi. Chính sách này giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin khi bạn sử dụng ứng dụng.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 border-slate-100">2. Thu thập Thông tin</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Khi bạn liên kết trang Facebook Fanpage của doanh nghiệp bạn với CQA CRM, chúng tôi có thể thu thập các thông tin sau qua Facebook Graph API để phục vụ cho các tính năng hỗ trợ quản lý tin nhắn và đánh giá chất lượng CSKH:
            </p>
            <ul className="list-disc list-inside text-slate-600 text-sm pl-2 space-y-1">
              <li>Thông tin cơ bản của Fanpage (Tên trang, ID trang).</li>
              <li>Thông tin cơ bản của khách hàng tương tác (Tên người dùng Messenger, ảnh đại diện công khai).</li>
              <li>Nội dung các tin nhắn văn bản, hình ảnh, hoặc file phương tiện được gửi đến Fanpage.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 border-slate-100">3. Sử dụng Thông tin</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Chúng tôi chỉ sử dụng các thông tin thu thập được cho các mục đích cụ thể sau:
            </p>
            <ul className="list-disc list-inside text-slate-600 text-sm pl-2 space-y-1">
              <li>Đồng bộ hộp thư hỗ trợ để nhân viên CSKH có thể xem và phản hồi khách hàng tập trung trên Web CQA.</li>
              <li>Phân tích chất lượng cuộc hội thoại (đánh giá điểm KPI, thái độ phục vụ) bằng AI.</li>
              <li>Cải thiện chất lượng và trải nghiệm sử dụng hệ thống.</li>
            </ul>
            <p className="text-slate-600 leading-relaxed text-sm font-semibold text-amber-700 mt-2">
              Chúng tôi cam kết không bán, không cho thuê, không chia sẻ hoặc chuyển giao thông tin này cho bất kỳ bên thứ ba nào ngoài mục đích vận hành các tính năng cốt lõi được mô tả ở trên.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 border-slate-100">4. Bảo mật Thông tin</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức nghiêm ngặt (như mã hóa SSL/TLS khi truyền dữ liệu, kiểm soát truy cập hạn chế) để ngăn chặn truy cập trái phép, sửa đổi, tiết lộ hoặc phá hủy dữ liệu cá nhân của bạn. Dữ liệu access token của Facebook Page luôn được lưu trữ mã hóa an toàn trên hệ thống cơ sở dữ liệu.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 border-slate-100">5. Xóa bỏ Dữ liệu (Data Deletion Instructions)</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Theo chính sách của Meta đối với Nền tảng Messenger và Graph API, người dùng có quyền yêu cầu xóa dữ liệu cá nhân của họ. 
            </p>
            <p className="text-slate-600 leading-relaxed text-sm">
              Nếu bạn muốn yêu cầu xóa các dữ liệu liên kết hoặc lịch sử nhắn tin khỏi hệ thống CQA CRM, vui lòng thực hiện theo các bước sau:
            </p>
            <ol className="list-decimal list-inside text-slate-600 text-sm pl-2 space-y-1">
              <li>Gửi email yêu cầu đến địa chỉ liên hệ chính: <a href="mailto:duycuong@metatop.vn" className="text-blue-600 hover:underline">duycuong@metatop.vn</a>.</li>
              <li>Nội dung email vui lòng ghi rõ tên Fanpage và ID trang cần ngắt kết nối và xóa dữ liệu.</li>
              <li>Bộ phận kỹ thuật của chúng tôi sẽ xác nhận và tiến hành xóa sạch toàn bộ dữ liệu tin nhắn, thông tin người dùng liên quan khỏi cơ sở dữ liệu trong vòng 24-48 giờ làm việc và phản hồi email xác nhận cho bạn.</li>
            </ol>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 border-b pb-2 border-slate-100">6. Liên hệ chúng tôi</h2>
            <p className="text-slate-600 leading-relaxed text-sm">
              Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào liên quan đến Chính sách Bảo mật này, xin vui lòng liên hệ:
            </p>
            <div className="bg-slate-50 p-4 rounded border border-slate-100 text-slate-600 text-sm space-y-1">
              <p><strong>Đại diện ứng dụng:</strong> CQA CRM Team (METATOP)</p>
              <p><strong>Email:</strong> <a href="mailto:duycuong@metatop.vn" className="text-blue-600 hover:underline">duycuong@metatop.vn</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
