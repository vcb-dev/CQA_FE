import { useState, useRef, useEffect } from 'react';
import {
  MagnifyingGlass, Sliders, DotsThree, Star, Smiley,
  Paperclip, Image, Microphone, CaretDown, CaretLeft, CaretRight, Plus, FileText,
  QrCode, CheckCircle, Diamond, ClipboardText, Package,
  ArrowsCounterClockwise, Brain, Translate, Lightbulb,
  Megaphone, PaperPlaneRight
} from '@phosphor-icons/react';

// ── Tag style helper ──
const getTagStyle = (tag) => {
  const t = tag.toLowerCase();
  if (t.includes('quan tâm sản phẩm') || t.includes('khách quen') || t.includes('điểm tốt') || t.includes('tích cực') || t.includes('hài lòng') || t.includes('đã chốt đơn')) {
    return { bg: '#e8f5e9', color: '#1b5e20' }; // light green
  }
  if (t.includes('hỏi giá') || t.includes('nhẫn bạc') || t.includes('tự nhiên') || t.includes('zalo') || t.includes('hỏi cửa hàng') || t.includes('báo giá')) {
    return { bg: '#e3f2fd', color: '#0d47a1' }; // light blue
  }
  if (t.includes('size 16') || t.includes('size 17') || t.includes('size 6') || t.includes('quảng cáo') || t.includes('bảo hành') || t.includes('đính đá') || t.includes('tạo đơn')) {
    return { bg: '#fff3e0', color: '#e65100' }; // light orange
  }
  if (t.includes('chưa chốt đơn') || t.includes('cần xử lý') || t.includes('khiếu nại') || t.includes('mặc cả') || t.includes('tư vấn tệ') || t.includes('chờ chuyển')) {
    return { bg: '#f3e5f5', color: '#4a148c' }; // light purple
  }
  return { bg: '#f5f5f5', color: '#424242' }; // default grey
};

// ── Mock Translation Utility (Vietnamese -> Customer Language) ──
const mockTranslate = (text, flag) => {
  if (flag === '🇻🇳') return text;
  const t = text.toLowerCase();
  
  if (flag === '🇹🇭') {
    if (t.includes('chào') || t.includes('hello')) return 'สวัสดีค่ะ ยินดีต้อนรับค่ะ';
    if (t.includes('giá') || t.includes('bao nhiêu')) return 'ราคา 520 บาท พร้อมส่งวันนี้ค่ะ';
    if (t.includes('size') || t.includes('kích thước')) return 'แหวนวงนี้มีไซส์พร้อมส่งค่ะ';
    if (t.includes('bảo hành')) return 'รับประกันขัดเงาฟรีตลอดชีพค่ะ';
    return 'ยินดีให้บริการค่ะ';
  }
  if (flag === '🇺🇸') {
    if (t.includes('chào') || t.includes('hello')) return 'Hello! Welcome to Vienchibao Jewelry!';
    if (t.includes('giá') || t.includes('bao nhiêu')) return 'It is currently $25 with free worldwide shipping today.';
    if (t.includes('size') || t.includes('kích thước')) return 'Yes, we have all sizes from 5 to 10 in stock.';
    if (t.includes('bảo hành')) return 'We offer a 12-month warranty and free lifetime polishing.';
    return 'Thank you for your interest!';
  }
  if (flag === '🇯🇵') {
    if (t.includes('chào') || t.includes('hello')) return 'こんにちは！お問い合わせありがとうございます。';
    if (t.includes('giá') || t.includes('bao nhiêu')) return 'こちらは現在 3,800円でございます。';
    if (t.includes('size') || t.includes('kích thước')) return '日本サイズですと12号から18号までご用意がございます。';
    if (t.includes('bảo hành')) return '永久無料クリーニングと12ヶ月保証がございます。';
    return 'どうぞよろしくお願いいたします。';
  }
  if (flag === '🇪🇸') {
    if (t.includes('chào') || t.includes('hello')) return '¡Hola! Bienvenido a la joyería Vienchibao.';
    if (t.includes('giá') || t.includes('bao nhiêu')) return 'El precio es de 22 euros con envío gratuito hoy.';
    if (t.includes('size') || t.includes('kích thước')) return 'Sí, tenemos tallas disponibles de la 12 a la 20.';
    if (t.includes('bảo hành')) return 'Ofrecemos 12 meses de garantía y pulido gratuito de por vida.';
    return 'Muchas gracias por su interés.';
  }
  if (flag === '🇮🇩') {
    if (t.includes('chào') || t.includes('hello')) return 'Halo! Selamat datang di Toko Perak Vienchibao.';
    if (t.includes('giá') || t.includes('bao nhiêu')) return 'Harganya Rp 350.000 dengan gratis ongkir hari ini.';
    if (t.includes('size') || t.includes('kích thước')) return 'Ya, kami memiliki semua ukuran dari 14 hingga 22.';
    if (t.includes('bảo hành')) return 'Garansi 12 bulan dan gratis pembersihan selamanya.';
    return 'Terima kasih banyak atas ketertarikan Anda!';
  }
  return 'Translated message...';
};

// ─────────────────────────────────────────
// HAND-CRAFTED DETAILED MULTI-LINGUAL CONVERSATIONS
// ─────────────────────────────────────────
const detailedConversations = [
  {
    id: 1, name: 'Nattapong S.', flag: '🇹🇭', channel: 'Messenger',
    preview: 'สนใจจะเอาวันนี้เลยค่ะ...', time: '10:30', employee: 'Minh Anh',
    score: 72, status: 'reviewed', unread: 2, avatarColor: '#6366f1',
    isAds: true, page: 'Vienchibao Thailand',
    gender: 'Nam', phone: '0912 345 678', isReturning: false, lastPurchase: '-',
    source: 'Facebook Ads - C80 - 01/2026', campaign: 'Thailand Brand Ads', adset: 'Bangkok KM', cost: '14.500đ / Mess', firstMessage: 'สนใจจะเอาวันนี้เลยค่ะ',
    tags: ['Quan tâm sản phẩm', 'Hỏi giá'],
    customTags: ['Size 16', 'Chưa chốt đơn'],
    sentiment: { positive: 70, neutral: 20, negative: 10 },
    qualityScore: {
      overall: 72, max: 100, label: 'Trung bình', trend: '↑ 2.1% vs tháng trước',
      criteria: [
        { label: 'Chào hỏi', score: 15, max: 20 },
        { label: 'Khai thác nhu cầu', score: 12, max: 20 },
        { label: 'Tư vấn & giải đáp', score: 14, max: 20 },
        { label: 'Xử lý từ chối', score: 10, max: 20 },
        { label: 'Chăm sóc sau bán', score: 11, max: 20 },
        { label: 'Follow-up', score: 10, max: 20 },
        { label: 'Thời gian phản hồi', score: 13, max: 20 }
      ],
    },
    aiSummary: {
      customerSaid: ['Quan tâm mẫu nhẫn bạc.', 'Hỏi size có sẵn.', 'Hỏi giá size 16.'],
      goodPoints: ['Phản hồi nhanh', 'Trả lời đầy đủ thông tin size và giá', 'Tone giao tiếp lịch sự'],
      badPoints: ['Chưa khai thác: mục đích mua, ngân sách, sở thích mẫu.', 'Chưa tư vấn chất liệu, bảo hành, ưu điểm nổi bật.', 'Chưa có upsell/đề xuất mẫu phù hợp.'],
      suggestions: ['Hỏi thêm: "Anh/chị mua để làm gì ạ? (đeo hàng ngày, làm quà tặng...)"', 'Tư vấn thêm chất liệu bạc, bảo hành làm sáng.', 'Đề xuất thêm mẫu tương tự hoặc gợi ý kết hợp dây chuyền/lắc.'],
    },
    customerKeywords: ['Nhẫn bạc Classic', 'Đo size tay', 'Quà tặng bạn gái', 'Bạc 925'],
    interestedProducts: ['Nhẫn bạc nam Classic', 'Lắc tay đính đá CZ'],
    suggestedReplies: [
      `"Dạ nhẫn Classic size 16 bên em giá 520k và đang được miễn phí ship hôm nay. Em gửi anh/chị hướng dẫn đo size tay chuẩn để đeo vừa vặn nhất nhé ạ!"`,
      `"Dạ chất liệu bên em là bạc 925 cao cấp cam kết bảo hành đánh sáng trọn đời, anh/chị hoàn toàn yên tâm khi mua tặng bạn gái ạ! 🎁"`
    ],
    internalNotes: [
      { id: 101, author: 'Auditor Minh Anh', time: '10:35 15/05/2026', text: 'Nhân viên trả lời cộc lốc câu cuối cần được chấn chỉnh. Lần đầu nhắc nhở nhẹ.' }
    ],
    improvements: ['Chưa khai thác nhu cầu kỹ', 'Chưa tư vấn điểm khác biệt sản phẩm'],
    convInfo: { start: '15/05/2026 10:30', end: '15/05/2026 10:32', duration: '2 phút', msgCount: 6, status: 'Chưa chốt đơn' },
    scoreHistory: [{ date: '01/05', score: 50 }, { date: '08/05', score: 72 }, { date: '15/05', score: 45 }, { date: '22/05', score: 70 }, { date: '31/05', score: 60 }],
    messages: [
      { id: 1, sender: 'customer', text: 'สนใจจะเอาวันนี้เลยค่ะ', translation: 'Tôi quan tâm và muốn lấy mẫu này ngay hôm nay.', time: '10:30' },
      { id: 2, sender: 'agent', text: 'สวัสดีค่ะ แหวนรุ่นนี้มีไซส์ 12 ถึง 20 ค่ะ\n(Dạ chào anh/chị, nhẫn này có size từ 12 đến 20 ạ.)', time: '10:31', score: 'good' },
      { id: 3, sender: 'customer', text: 'เอาไซส์ 16 ครับ', translation: 'Cho tôi lấy size 16 nhé.', time: '10:31' },
      { id: 4, sender: 'agent', text: 'ได้เลยครับ! ไซส์ 16 ราคา 520 บาทครับ\n(Dạ vâng ạ, size 16 giá 520.000đ ạ.)', time: '10:32', score: 'good' },
      { id: 5, sender: 'customer', text: 'มีของแถมไหมครับ', translation: 'Có quà tặng kèm gì không shop?', time: '10:32' },
      { id: 6, sender: 'agent', text: 'ไม่มีของแถมครับ\n(Không có quà kèm đâu ạ.)', time: '10:33', score: 'low' },
    ],
  },
  {
    id: 2, name: 'Trần Quốc Bảo', flag: '🇻🇳', channel: 'Facebook',
    preview: 'Sản phẩm này còn size 17 không ạ?', time: '10:23', employee: 'Phương Linh',
    score: 88, status: 'reviewed', unread: 0, avatarColor: '#3b82f6',
    isAds: false, page: 'Vienchibao Jewelry',
    gender: 'Nam', phone: '0987 654 321', isReturning: true, lastPurchase: '20/04/2026',
    source: 'Tự nhiên (Organic)', campaign: '-', adset: '-', cost: '0đ (Organic)', firstMessage: 'Sản phẩm này còn size 17 không ạ?',
    tags: ['Khách quen', 'Quan tâm sản phẩm'],
    customTags: ['Size 17', 'Nhẫn bạc'],
    sentiment: { positive: 85, neutral: 10, negative: 5 },
    qualityScore: {
      overall: 88, max: 100, label: 'Tốt', trend: '↑ 4.5% vs tháng trước',
      criteria: [
        { label: 'Chào hỏi', score: 18, max: 20 },
        { label: 'Khai thác nhu cầu', score: 15, max: 20 },
        { label: 'Tư vấn & giải đáp', score: 18, max: 20 },
        { label: 'Xử lý từ chối', score: 12, max: 20 },
        { label: 'Chăm sóc sau bán', score: 13, max: 20 },
        { label: 'Follow-up', score: 12, max: 20 },
        { label: 'Thời gian phản hồi', score: 17, max: 20 }
      ],
    },
    aiSummary: {
      customerSaid: ['Hỏi còn size 17 không', 'Quan tâm nhẫn bạc classic', 'Khách quen mua lần 4'],
      goodPoints: ['Chào hỏi tốt, nhận ra khách quen', 'Tư vấn kỹ size và chất liệu', 'Upsell combo dây chuyền thành công'],
      badPoints: ['Phản hồi hơi chậm (3 phút)'],
      suggestions: ['Gửi ảnh thật sản phẩm mới', 'Đề xuất chương trình khách hàng thân thiết'],
    },
    customerKeywords: ['Khách quen', 'Size 17', 'Hộp quà cao cấp', 'Classic Ring'],
    interestedProducts: ['Nhẫn Classic Bạc size 17', 'Dây chuyền Bạc nam'],
    suggestedReplies: [
      `"Dạ anh Bảo ơi, em đã lên đơn giao về địa chỉ cũ cho mình rồi ạ. Đơn này shop tặng kèm hộp quà thắt nơ cao cấp tri ân khách quen ạ! 🥰"`,
      `"Dạ cảm ơn anh Bảo đã tin tưởng ủng hộ shop lần thứ 4, hàng sẽ được ship nhanh 2 ngày là tới ạ."`
    ],
    internalNotes: [
      { id: 102, author: 'Auditor Phương Linh', time: '10:25 15/05/2026', text: 'Chăm sóc khách quen rất tốt, tặng quà đúng lúc. Phát huy thêm!' }
    ],
    improvements: ['Phản hồi khách hàng hơi chậm (trễ 3 phút)'],
    convInfo: { start: '15/05/2026 10:20', end: '15/05/2026 10:23', duration: '3 phút', msgCount: 6, status: 'Đã chốt đơn' },
    scoreHistory: [{ date: '01/05', score: 80 }, { date: '08/05', score: 85 }, { date: '15/05', score: 88 }, { date: '22/05', score: 86 }, { date: '31/05', score: 88 }],
    messages: [
      { id: 1, sender: 'customer', text: 'Chào shop, mình muốn hỏi sản phẩm này còn size 17 không ạ?', time: '10:20' },
      { id: 2, sender: 'agent', text: 'Dạ chào anh Bảo! Cảm ơn anh đã quay lại shop ạ 😊 Nhẫn bạc Classic size 17 hiện vẫn còn hàng ạ.', time: '10:21', score: 'good' },
      { id: 3, sender: 'customer', text: 'Tốt quá! Giá bao nhiêu vậy shop?', time: '10:21' },
      { id: 4, sender: 'agent', text: 'Dạ nhẫn bạc Classic size 17 giá 520.000đ ạ. Anh đã mua 3 lần bên em rồi, em xin tặng anh thêm hộp quà premium nhé ạ! 🎁', time: '10:22', score: 'good' },
      { id: 5, sender: 'customer', text: 'Oke, mình lấy luôn nhé. Ship về địa chỉ cũ giúp mình.', time: '10:22' },
      { id: 6, sender: 'agent', text: 'Dạ em tạo đơn luôn cho anh ạ. Giao về 123 Nguyễn Huệ, Q1, HCM đúng không anh? Dự kiến 2-3 ngày ạ.', time: '10:23', score: 'good' },
    ],
  },
  {
    id: 3, name: 'Sarah Jenkins', flag: '🇺🇸', channel: 'Instagram',
    preview: 'Hi, I saw your Instagram ad...', time: '09:45', employee: 'Hoàng Nam',
    score: 95, status: 'reviewed', unread: 0, avatarColor: '#ec4899',
    isAds: true, page: 'Vienchibao USA',
    gender: 'Nữ', phone: '+1 202 555 0143', isReturning: false, lastPurchase: '-',
    source: 'Instagram Ads - Worldwide 05/2026', campaign: 'USA Campaign 05', adset: 'US Female Group', cost: '1.2$ / Mess', firstMessage: 'Hi, I saw your Instagram ad...',
    tags: ['Nước ngoài', 'Quan tâm sản phẩm'],
    customTags: ['Size 6', 'Ship Singapore'],
    sentiment: { positive: 90, neutral: 7, negative: 3 },
    qualityScore: {
      overall: 95, max: 100, label: 'Tốt', trend: '↑ 6.0% vs tháng trước',
      criteria: [
        { label: 'Chào hỏi', score: 20, max: 20 },
        { label: 'Khai thác nhu cầu', score: 18, max: 20 },
        { label: 'Tư vấn & giải đáp', score: 19, max: 20 },
        { label: 'Xử lý từ chối', score: 13, max: 20 },
        { label: 'Chăm sóc sau bán', score: 13, max: 20 },
        { label: 'Follow-up', score: 12, max: 20 },
        { label: 'Thời gian phản hồi', score: 20, max: 20 }
      ],
    },
    aiSummary: {
      customerSaid: ['Hỏi về ship hàng đi Singapore', 'Hỏi thời gian giao hàng', 'Muốn mua nhẫn bạc size 6'],
      goodPoints: ['Phản hồi bằng tiếng Anh chuẩn xác', 'Tư vấn rõ ràng về phí và thời gian ship', 'Chốt đơn nhanh và chuyên nghiệp'],
      badPoints: [],
      suggestions: ['Gửi mã tracking đơn hàng ngay khi gửi bưu điện', 'Đề xuất combo để được free ship quốc tế'],
    },
    customerKeywords: ['Singapore shipping', 'Size 6', 'Tracking number', 'Hypoallergenic'],
    interestedProducts: ['Classic Silver Ring size 6'],
    suggestedReplies: [
      `"Hello Sarah! I have reserved the Classic Silver Ring in size 6 for you. Here is the link to complete your secure payment. Thank you! ✈️"`,
      `"We will ship your order tomorrow and send the Yamato tracking number right away."`
    ],
    internalNotes: [
      { id: 103, author: 'Auditor Hoàng Nam', time: '09:50 15/05/2026', text: 'English chat support is exceptional. Fast chốt đơn.' }
    ],
    improvements: [],
    convInfo: { start: '15/05/2026 09:40', end: '15/05/2026 09:45', duration: '5 phút', msgCount: 6, status: 'Đã hoàn thành' },
    scoreHistory: [{ date: '01/05', score: 90 }, { date: '08/05', score: 92 }, { date: '15/05', score: 95 }, { date: '22/05', score: 94 }, { date: '31/05', score: 95 }],
    messages: [
      { id: 1, sender: 'customer', text: 'Hi, I saw your Instagram ad. Do you ship to Singapore?', translation: 'Xin chào, tôi thấy quảng cáo Instagram của shop. Shop có ship đi Singapore không?', time: '09:40' },
      { id: 2, sender: 'agent', text: 'Hello Sarah! Yes, we do provide international shipping to Singapore! ✈️ Shipping fee is around $10.\n(Chào chị Sarah! Dạ bên em có ship đi Singapore ạ, phí ship là $10.)', time: '09:41', score: 'good' },
      { id: 3, sender: 'customer', text: 'Great! How long does it usually take?', translation: 'Tuyệt quá! Giao hàng thường mất bao lâu?', time: '09:42' },
      { id: 4, sender: 'agent', text: 'It typically takes 5-7 business days. We will provide a tracking number as soon as it is shipped out.\n(Dạ thường mất 5-7 ngày làm việc ạ. Em sẽ gửi mã tracking ngay sau khi gửi đi.)', time: '09:43', score: 'good' },
      { id: 5, sender: 'customer', text: 'Perfect, I\'d like to order the classic silver ring in size 6.', translation: 'Tuyệt, tôi muốn đặt nhẫn bạc classic size 6.', time: '09:44' },
      { id: 6, sender: 'agent', text: 'Excellent choice! I\'ve reserved a size 6 for you. Let me send you the payment link to finalize your order.\n(Lựa chọn tuyệt vời ạ! Em đã giữ 1 nhẫn size 6 cho chị. Em gửi link thanh toán nhé.)', time: '09:45', score: 'good' },
    ],
  },
  {
    id: 4, name: 'Yuki Tanaka', flag: '🇯🇵', channel: 'Messenger',
    preview: 'サイズについて聞きたいのですが...', time: '09:12', employee: 'Thành Đạt',
    score: 58, status: 'pending', unread: 4, avatarColor: '#a855f7',
    isAds: false, page: 'Vienchibao Japan',
    gender: 'Nữ', phone: '+81 90 1234 5678', isReturning: false, lastPurchase: '-',
    source: 'Tự nhiên (Organic)', campaign: '-', adset: '-', cost: '0đ', firstMessage: 'サイズについて聞きたいのですが...',
    tags: ['Nước ngoài', 'Tư vấn kém'],
    customTags: ['Hỏi size', 'Kinh nghiệm yếu', 'Chưa chốt đơn'],
    sentiment: { positive: 10, neutral: 30, negative: 60 },
    qualityScore: {
      overall: 58, max: 100, label: 'Cần cải thiện', trend: '↓ 4.0% vs tháng trước',
      criteria: [
        { label: 'Chào hỏi', score: 10, max: 20 },
        { label: 'Khai thác nhu cầu', score: 8, max: 20 },
        { label: 'Tư vấn & giải đáp', score: 12, max: 20 },
        { label: 'Xử lý từ chối', score: 10, max: 20 },
        { label: 'Chăm sóc sau bán', score: 9, max: 20 },
        { label: 'Follow-up', score: 9, max: 20 },
        { label: 'Thời gian phản hồi', score: 9, max: 20 }
      ],
    },
    aiSummary: {
      customerSaid: ['Hỏi tư vấn chọn size nhẫn cho chu vi ngón tay 52mm', 'Gặp khó khăn trong việc tự đo size'],
      goodPoints: ['Phản hồi bằng tiếng Nhật đúng ngữ pháp cơ bản'],
      badPoints: ['Thái độ phục vụ thiếu nhiệt tình, trả lời cộc lốc', 'Bảo khách tự đo và tự lên mạng tìm kiếm thay vì hướng dẫn chi tiết', 'Gây ức chế cho khách hàng Nhật vốn quen với sự chu đáo'],
      suggestions: ['Yêu cầu nhân viên học lại quy trình tư vấn khách nước ngoài', 'Cung cấp bảng size nhẫn tiêu chuẩn Nhật Bản và Việt Nam', 'Sử dụng các mẫu câu lịch sự Keigo: "少々お待ちくださいませ..."'],
    },
    customerKeywords: ['Ring size 52mm', 'Đo chu vi tay', 'Japanese customer', 'Thái độ tệ'],
    interestedProducts: ['Nhẫn bạc Sterling nữ'],
    suggestedReplies: [
      `"指の周りが52mmでございますね。日本サイズですと12号がちょうど良いかと存じます。こちらがサイズ対応表でございます。😊"`,
      `"少々お待ちくださいませ。こちらで詳しく測り方をご案内いたします。"`
    ],
    internalNotes: [
      { id: 104, author: 'Auditor Thành Đạt', time: '09:15 15/05/2026', text: 'Thái độ phục vụ tệ hại. Đã chuyển quản lý team xử lý kỷ luật.' }
    ],
    improvements: ['Thái độ phục vụ thiếu nhiệt tình, cộc lốc', 'Yêu cầu khách tự lên mạng tra thay vì hướng dẫn'],
    convInfo: { start: '15/05/2026 09:05', end: '15/05/2026 09:12', duration: '2 phút', msgCount: 6, status: 'Chưa chốt đơn' },
    scoreHistory: [{ date: '01/05', score: 50 }, { date: '08/05', score: 70 }, { date: '15/05', score: 40 }, { date: '22/05', score: 60 }, { date: '31/05', score: 58 }],
    messages: [
      { id: 1, sender: 'customer', text: 'こんにちは、このシルバーリングのサイズについて聞きたいのですが。', translation: 'Xin chào, tôi muốn hỏi về size của chiếc nhẫn bạc này.', time: '09:05' },
      { id: 2, sender: 'agent', text: 'はい。\n(Vâng.)', time: '09:06', score: 'low' },
      { id: 3, sender: 'customer', text: '指の周りが52mmの場合、どのサイズが良いですか？', translation: 'Nếu chu vi ngón tay là 52mm thì đeo size nào tốt?', time: '09:08' },
      { id: 4, sender: 'agent', text: '自分で測ってください。\n(Chị tự đo đi ạ.)', time: '09:09', score: 'low' },
      { id: 5, sender: 'customer', text: 'えっ？測り方がわからないのですが...', translation: 'Ơ? Tôi không biết cách đo...', time: '09:10' },
      { id: 6, sender: 'agent', text: 'ネットで調べてください。\n(Chị lên mạng tìm nhé.)', time: '09:12', score: 'low' },
    ],
  }
];

// ─────────────────────────────────────────
// PROGRAMMATIC MOCKUP DATA GENERATOR (To reach exactly 50 conversations)
// ─────────────────────────────────────────
const firstNames = ['Somchai', 'John', 'Hanako', 'Miguel', 'Bambang', 'Lê Minh', 'Nguyễn Thị', 'Chatchai', 'Takashi', 'Sofia', 'Sri', 'Thanh Thảo', 'Hoàng', 'Minh', 'David', 'Laura', 'Budi', 'Anya', 'Peter', 'Yusuf', 'Kenji', 'Carlos', 'Elena', 'Linda', 'Robert', 'Trang', 'Dũng', 'Hồng', 'Tuyết', 'Tuấn'];
const lastNames = ['K.', 'Doe', 'S.', 'A.', 'H.', 'Tuấn', 'Hà', 'P.', 'Y.', 'R.', 'Wahyuni', 'Vân', 'Anh', 'Khánh', 'Smith', 'Martinez', 'Santoso', 'Taylor', 'Johnson', 'Putra', 'Sato', 'Garcia', 'Gomez', 'White', 'Lee', 'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Vũ'];
const flags = ['🇹🇭', '🇺🇸', '🇯🇵', '🇪🇸', '🇮🇩', '🇻🇳'];
const channels = ['Messenger', 'Facebook', 'Instagram', 'Zalo'];
const employees = ['Minh Anh', 'Phương Linh', 'Hoàng Nam', 'Thành Đạt'];
const pageBases = {
  '🇹🇭': 'Vienchibao Thailand',
  '🇺🇸': 'Vienchibao USA',
  '🇯🇵': 'Vienchibao Japan',
  '🇪🇸': 'Vienchibao Global',
  '🇮🇩': 'Vienchibao Indonesia',
  '🇻🇳': 'Vienchibao Jewelry'
};
const sources = {
  '🇹🇭': 'Facebook Ads - Thailand Campaign',
  '🇺🇸': 'Instagram Ads - US Brand Campaign',
  '🇯🇵': 'Google Search Ads - Japan Organic',
  '🇪🇸': 'Facebook Ads - Europe Campaign',
  '🇮🇩': 'Instagram Ads - Indonesia Retarget',
  '🇻🇳': 'Tự nhiên (Organic)'
};

const generatedConversations = Array.from({ length: 46 }, (_, idx) => {
  const id = idx + 5;
  const flag = flags[idx % flags.length];
  const name = `${firstNames[idx % firstNames.length]} ${lastNames[idx % lastNames.length]}`;
  const channel = channels[idx % channels.length];
  const employee = employees[idx % employees.length];
  const page = pageBases[flag];
  const isAds = idx % 2 === 0;
  const source = isAds ? sources[flag] : 'Tự nhiên (Organic)';
  
  let score = 85;
  if (idx % 3 === 0) score = 60 + (idx % 10);
  else if (idx % 3 === 1) score = 70 + (idx % 15);
  else score = 85 + (idx % 14);
  
  const status = idx % 4 === 0 ? 'pending' : 'reviewed';
  const label = score >= 85 ? 'Tốt' : score >= 70 ? 'Trung bình' : 'Cần cải thiện';
  
  const previews = {
    '🇹🇭': 'สนใจแหวนวงนี้ค่ะ...',
    '🇺🇸': 'Is this item available in stock?',
    '🇯🇵': '配送方法について...',
    '🇪🇸': '¿Cuánto cuesta el envío?',
    '🇮🇩': 'Cincin perak 925...',
    '🇻🇳': 'Sản phẩm này giá bao nhiêu ạ?'
  };

  const customerTexts = {
    '🇹🇭': 'สวัสดีค่ะ สนใจแหวนวงนี้ค่ะ มีไซส์ 15 ไหมคะ\nXin chào, tôi muốn hỏi nhẫn này có size 15 không?',
    '🇺🇸': 'Hi, is this sterling silver ring available in stock?\nHi shop, nhẫn bạc này còn hàng không?',
    '🇯🇵': 'こんにちは、日本への配送方法を教えてください。\nXin chào, vui lòng cho tôi biết cách ship sang Nhật Bản.',
    '🇪🇸': 'Hola, ¿cuánto cuesta el envío a Barcelona?\nXin chào, phí ship sang Barcelona là bao nhiêu?',
    '🇮🇩': 'Halo, apakah cincin perak 925 ini bisa dicustom grafir?\nHi shop, nhẫn bạc 925 này có khắc chữ được không?',
    '🇻🇳': 'Shop ơi, mẫu này giá bao nhiêu vậy ạ?'
  };
  
  const agentTexts = {
    '🇹🇭': score >= 85 ? 'สวัสดีค่ะ มีไซส์ 15 พร้อมส่งค่ะ! 💍\nDạ chào chị, nhẫn size 15 bên em có sẵn hàng ạ.' : 'ไม่มีค่ะ\nKhông có chị nha.',
    '🇺🇸': score >= 85 ? 'Hello! Yes, it is fully in stock and ready to ship today! ✈️\nDạ chào anh/chị, hàng sẵn có và có thể gửi ngay hôm nay ạ.' : 'Please wait, checking.\nVui lòng chờ chút để em kiểm tra.',
    '🇯🇵': score >= 85 ? 'お問い合わせありがとうございます！日本へはEMS郵便で追跡可能でお届けします。🇯🇵\nDạ bên em ship qua bưu điện quốc tế EMS có tracking đầy đủ ạ.' : 'No ship Japan.\nBên em không ship Nhật đâu.',
    '🇪🇸': score >= 85 ? '¡Hola! El envío a Barcelona cuesta 12 euros y tarda unos 7 días hábiles. 😊\nDạ ship Barcelona là 12 euro và mất khoảng 7 ngày ạ.' : 'Very expensive.\nPhí ship đắt lắm chị ơi.',
    '🇮🇩': score >= 85 ? 'Halo! Bisa banget kak, free grafir nama di bagian dalam cincin ya kak. ❤️\nDạ được chứ ạ, khắc tên hoàn toàn miễn phí mặt trong nhẫn ạ.' : 'Tidak bisa.\nKhông khắc được đâu.',
    '🇻🇳': score >= 85 ? 'Dạ mẫu nhẫn bạc Classic đính đá CZ này giá là 520.000đ và đang được ưu đãi miễn phí giao hàng toàn quốc hôm nay ạ! 🥰' : 'Nhìn giá trên hình đi ạ.'
  };

  const messages = [
    { id: 1, sender: 'customer', text: customerTexts[flag], translation: 'Tôi rất quan tâm mẫu nhẫn/lắc bạc mới bên bạn.', time: '08:00' },
    { id: 2, sender: 'agent', text: agentTexts[flag], time: '08:02', score: score >= 85 ? 'good' : score >= 70 ? 'medium' : 'low' }
  ];

  const c1 = Math.round(score * 0.17);
  const c2 = Math.round(score * 0.14);
  const c3 = Math.round(score * 0.17);
  const c4 = Math.round(score * 0.12);
  const c5 = Math.round(score * 0.12);
  const c6 = Math.round(score * 0.12);
  const c7 = score - (c1 + c2 + c3 + c4 + c5 + c6);

  const improvements = score >= 85 ? [] : score >= 70 ? [
    'Chưa khai thác kỹ nhu cầu thực tế của khách',
    'Cần tư vấn thêm về chính sách bảo hành'
  ] : [
    'Thái độ phản hồi khách hàng chưa nhiệt tình',
    'Thời gian chờ tin nhắn quá lâu'
  ];

  const customerKeywords = flag === '🇻🇳' 
    ? ['Hỏi size', 'Chất liệu bạc', 'Bảo hành'] 
    : ['Nước ngoài', 'Phí ship', 'Đo size'];
  const interestedProducts = flag === '🇻🇳'
    ? ['Nhẫn bạc Classic đính đá']
    : ['Nhẫn bạc 925 Global'];
  const suggestedReplies = [
    `"Dạ chào anh/chị, mẫu này làm bằng bạc 925 tinh khiết và bên em đang hỗ trợ miễn phí ship toàn quốc hôm nay ạ!"`,
    `"Dạ shop có tặng kèm hộp quà và thiệp chúc mừng thiết kế riêng nếu mình mua tặng người thân nhé ạ!"`
  ];

  const internalNotes = score < 70 ? [
    { id: 300 + idx, author: 'AI Audit Bot', time: '08:15 15/05/2026', text: 'Thời gian phản hồi trễ quá quy định (SLA > 5p). Cần chấn chỉnh.' }
  ] : [];

  return {
    id,
    name,
    flag,
    channel,
    preview: previews[flag],
    time: `08:${10 + idx % 45}`,
    employee,
    score,
    status,
    unread: idx % 5 === 0 ? (idx % 3) + 1 : 0,
    avatarColor: idx % 3 === 0 ? '#ec4899' : idx % 3 === 1 ? '#10b981' : '#6366f1',
    isAds,
    page,
    gender: idx % 2 === 0 ? 'Nam' : 'Nữ',
    phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
    isReturning: idx % 3 === 0,
    lastPurchase: idx % 3 === 0 ? '12/05/2026' : '-',
    source,
    campaign: isAds ? 'Ad Campaign ' + (idx + 1) : '-',
    adset: isAds ? 'Target Group ' + (idx + 1) : '-',
    cost: isAds ? '12.000đ / Mess' : '0đ',
    firstMessage: previews[flag],
    tags: [isAds ? 'Quảng cáo' : 'Tự nhiên', score >= 85 ? 'Có tín hiệu chốt' : 'Cần tư vấn thêm'],
    customTags: ['Mockup', 'Chưa chốt đơn'],
    sentiment: {
      positive: score >= 85 ? 80 : score >= 70 ? 50 : 20,
      neutral: score >= 85 ? 15 : score >= 70 ? 30 : 30,
      negative: score >= 85 ? 5 : score >= 70 ? 20 : 50
    },
    qualityScore: {
      overall: score,
      max: 100,
      label,
      trend: '↑ 2.5% vs tháng trước',
      criteria: [
        { label: 'Chào hỏi', score: c1, max: 20 },
        { label: 'Khai thác nhu cầu', score: c2, max: 20 },
        { label: 'Tư vấn & giải đáp', score: c3, max: 20 },
        { label: 'Xử lý từ chối', score: c4, max: 20 },
        { label: 'Chăm sóc sau bán', score: c5, max: 20 },
        { label: 'Follow-up', score: c6, max: 20 },
        { label: 'Thời gian phản hồi', score: c7, max: 20 }
      ]
    },
    aiSummary: {
      customerSaid: ['Quan tâm mẫu nhẫn/lắc tay mới.', 'Hỏi ship có sẵn.', 'Hỏi giá ưu đãi.'],
      goodPoints: score >= 70 ? ['Phản hồi nhanh', 'Tone giao tiếp lịch sự'] : ['Có phản hồi nhanh'],
      badPoints: score < 85 ? ['Chưa khai thác: mục đích mua, ngân sách.', 'Chưa tư vấn chất liệu, bảo hành.'] : [],
      suggestions: score < 85 ? ['Hỏi thêm: "Anh/chị mua dùng hay làm quà tặng?"', 'Tư vấn thêm chất liệu bạc, đánh bóng.'] : ['Tiếp tục duy trì kỹ năng chăm sóc tốt']
    },
    customerKeywords,
    interestedProducts,
    suggestedReplies,
    internalNotes,
    improvements,
    convInfo: {
      start: '15/05/2026 08:00',
      end: `15/05/2026 08:${10 + idx % 45}`,
      duration: '2 phút',
      msgCount: 2,
      status: score >= 85 ? 'Đã hoàn thành' : 'Chưa chốt đơn'
    },
    history: [
      { time: '08:00', text: 'Bắt đầu cuộc chat' },
      { time: '08:02', text: 'Nhân viên đã trả lời' }
    ],
    quickActions: [
      { icon: '📋', label: 'Tạo đơn hàng' },
      { icon: '📦', label: 'Báo giá nhanh' },
      { icon: '📝', label: 'Hỏi giá' },
      { icon: '🔄', label: 'Chuyển nhân viên khác' }
    ],
    messages
  };
});

const conversations = [...detailedConversations, ...generatedConversations];

const conversationTabs = [
  { key: 'all', label: 'Tất cả', count: 2304 },
  { key: 'pending', label: 'Chưa đọc', count: 128 },
  { key: 'waiting', label: 'Đang chờ', count: 342 },
  { key: 'done', label: 'Hoàn thành', count: 1834 }
];

const formatCompactNumber = (value) => new Intl.NumberFormat('vi-VN').format(value);

const cleanSuggestedReply = (reply = '') => {
  const trimmed = reply.trim();
  return trimmed.replace(/^["“”]+|["“”]+$/g, '');
};

const getMarketQuote = (conv) => {
  const quotes = {
    '🇹🇭': { price: '520 baht', localPrice: 'khoảng 520.000đ', shipping: 'miễn phí ship nội địa hôm nay' },
    '🇺🇸': { price: '$25', localPrice: 'khoảng 620.000đ', shipping: 'ship quốc tế có tracking' },
    '🇯🇵': { price: '3.800 yen', localPrice: 'khoảng 620.000đ', shipping: 'EMS có tracking' },
    '🇪🇸': { price: '22 euro', localPrice: 'khoảng 590.000đ', shipping: 'ship quốc tế 7-10 ngày' },
    '🇮🇩': { price: 'Rp 350.000', localPrice: 'khoảng 560.000đ', shipping: 'miễn phí ship trong ngày' },
    '🇻🇳': { price: '520.000đ', localPrice: '520.000đ', shipping: 'miễn phí giao hàng toàn quốc hôm nay' }
  };

  return quotes[conv.flag] || quotes['🇻🇳'];
};

const getSentimentInsight = (sentiment = {}) => {
  const positive = sentiment.positive || 0;
  const neutral = sentiment.neutral || 0;
  const negative = sentiment.negative || 0;

  if (negative >= 45) {
    return {
      label: 'Khách đang khó chịu',
      color: 'var(--danger-600)',
      bg: 'var(--danger-50)',
      explanation: 'Ưu tiên xin lỗi, hướng dẫn cụ thể và tránh trả lời ngắn. Nên xử lý vấn đề trước khi chốt đơn.'
    };
  }

  if (positive >= 75) {
    return {
      label: 'Tín hiệu mua cao',
      color: 'var(--success-600)',
      bg: 'var(--success-50)',
      explanation: 'Khách phản hồi tích cực, có thể báo giá rõ ràng, nhắc ưu đãi và xin thông tin chốt đơn.'
    };
  }

  return {
    label: 'Cần nuôi dưỡng thêm',
    color: 'var(--warning-600)',
    bg: 'var(--warning-50)',
    explanation: 'Khách còn đang cân nhắc. Nên hỏi thêm nhu cầu, size, mục đích mua và đưa 1-2 lựa chọn phù hợp.'
  };
};

const buildSalesAssistant = (conv) => {
  const quote = getMarketQuote(conv);
  const primaryProduct = conv.interestedProducts?.[0] || 'Sản phẩm khách đang hỏi';
  const keywords = conv.customerKeywords?.slice(0, 4) || [];
  const replyReasons = [
    'Câu này trả lời trực tiếp nhu cầu hiện tại, có giá rõ ràng và giữ giọng tư vấn lịch sự.',
    'Câu này bổ sung lý do tin tưởng như chất liệu, bảo hành hoặc quà tặng để giảm do dự trước khi chốt.'
  ];
  const products = [
    ...(conv.interestedProducts || []),
    keywords.some(k => k.toLowerCase().includes('quà') || k.toLowerCase().includes('gift')) ? 'Hộp quà premium + thiệp tặng kèm' : 'Combo phụ kiện bạc 925 cùng kiểu'
  ].filter(Boolean).slice(0, 3);

  return {
    sentiment: getSentimentInsight(conv.sentiment),
    quote: {
      product: primaryProduct,
      price: quote.price,
      localPrice: quote.localPrice,
      shipping: quote.shipping,
      script: `Dạ mẫu ${primaryProduct} bên em đang có giá ${quote.price}, đã kèm ${quote.shipping}. Em giữ đúng size/mẫu cho mình và hỗ trợ lên đơn ngay nếu mình chốt hôm nay ạ.`,
      explanation: `Nên báo giá theo đúng thị trường của page ${conv.page}, nhắc ưu đãi giao hàng và gắn với sản phẩm khách vừa hỏi để giảm vòng hỏi đáp.`
    },
    replies: (conv.suggestedReplies || []).slice(0, 2).map((reply, index) => ({
      text: cleanSuggestedReply(reply),
      reason: replyReasons[index] || replyReasons[0]
    })),
    products: products.map((name, index) => ({
      name,
      signal: index === 0 ? 'Khách đã nhắc trực tiếp hoặc đang hỏi size/giá.' : 'Phù hợp để upsell nhẹ khi khách hỏi quà tặng, bảo hành hoặc muốn xem thêm mẫu.',
      pitch: index === 0
        ? `Tập trung chốt ${quote.price}, xác nhận size và địa chỉ nhận hàng.`
        : 'Đưa như lựa chọn thêm, không làm khách bị phân tán khỏi sản phẩm chính.'
    }))
  };
};

const internalProducts = [
  {
    sku: 'VCB-R-CL16',
    name: 'Nhẫn bạc nam Classic',
    price: '520.000đ',
    altPrices: '520 baht / $25 / 3.800 yen',
    stock: 'Size 16: 18 chiếc, size 17: 12 chiếc, size 18: 7 chiếc',
    variants: 'Bạc trơn, bạc khắc tên, đính đá CZ nhỏ',
    note: 'Mẫu dễ chốt nhất khi khách hỏi nhẫn bạc nam hoặc quà tặng.'
  },
  {
    sku: 'VCB-BR-CZ01',
    name: 'Lắc tay đính đá CZ',
    price: '680.000đ',
    altPrices: '650 baht / $32',
    stock: '24 chiếc sẵn kho HCM, 9 chiếc kho quốc tế',
    variants: 'Bạc 925, đá CZ trắng, khóa lobster',
    note: 'Phù hợp upsell cùng nhẫn Classic.'
  },
  {
    sku: 'VCB-R-W06',
    name: 'Classic Silver Ring size 6',
    price: '$25',
    altPrices: '620.000đ / 3.800 yen',
    stock: 'Size 6: 9 chiếc, size 7: 6 chiếc',
    variants: 'Sterling silver, chống dị ứng, hộp quà tiêu chuẩn',
    note: 'Dùng cho khách US/Singapore hỏi ship quốc tế.'
  },
  {
    sku: 'VCB-N-M01',
    name: 'Dây chuyền bạc nam',
    price: '790.000đ',
    altPrices: '$36 / 780 baht',
    stock: '15 chiếc, chiều dài 45-50cm',
    variants: 'Bạc 925, dây trơn, dây xoắn nhẹ',
    note: 'Gợi ý thêm khi khách mua nhẫn nam.'
  },
  {
    sku: 'VCB-GIFT-PRE',
    name: 'Hộp quà premium + thiệp',
    price: '40.000đ',
    altPrices: 'Tặng miễn phí cho khách quen hoặc đơn từ 700.000đ',
    stock: '120 bộ',
    variants: 'Hộp nơ đen, hộp nơ đỏ, thiệp viết tay',
    note: 'Dùng để xử lý khách hỏi quà tặng kèm.'
  }
];

const internalPolicies = [
  'Bảo hành đánh sáng trọn đời cho sản phẩm bạc 925.',
  'Đổi size miễn phí trong 7 ngày nếu sản phẩm chưa qua sử dụng và còn hộp.',
  'Miễn phí giao hàng toàn quốc hôm nay cho đơn nhẫn/lắc bạc.',
  'COD nội địa, chuyển khoản, thẻ quốc tế và link thanh toán cho khách nước ngoài.',
  'Ship quốc tế 5-10 ngày làm việc, có mã tracking sau khi gửi hàng.',
  'Khắc tên miễn phí mặt trong nhẫn với mẫu hỗ trợ khắc.'
];

const findKnowledgeProducts = (question, conv) => {
  const q = question.toLowerCase();
  const context = `${conv.interestedProducts?.join(' ') || ''} ${conv.customerKeywords?.join(' ') || ''}`.toLowerCase();
  const haystack = `${q} ${context}`;
  const matches = internalProducts.filter(product => {
    const productText = `${product.name} ${product.sku} ${product.variants} ${product.note}`.toLowerCase();
    return productText.split(/\s+/).some(token => token.length > 3 && haystack.includes(token));
  });

  return matches.length ? matches.slice(0, 3) : internalProducts.slice(0, 3);
};

const answerInternalAI = (question, conv) => {
  const q = question.toLowerCase();
  const products = findKnowledgeProducts(question, conv);
  const asksPolicy = ['chính sách', 'bao hanh', 'bảo hành', 'đổi', 'doi', 'ship', 'giao', 'cod', 'thanh toán', 'tracking'].some(k => q.includes(k));
  const asksStock = ['tồn', 'kho', 'còn', 'con', 'stock', 'size'].some(k => q.includes(k));
  const asksPrice = ['giá', 'gia', 'price', 'báo giá', 'bao nhiêu'].some(k => q.includes(k));
  const asksModel = ['mẫu', 'mau', 'kiểu', 'kieu', 'model', 'sản phẩm', 'san pham'].some(k => q.includes(k));

  if (asksPolicy && !asksStock && !asksPrice && !asksModel) {
    return `Chính sách áp dụng:\n${internalPolicies.map(item => `- ${item}`).join('\n')}`;
  }

  const productLines = products.map(product => {
    const lines = [`${product.name} (${product.sku})`];
    if (asksPrice || (!asksStock && !asksModel)) lines.push(`Giá: ${product.price}; quy đổi: ${product.altPrices}`);
    if (asksStock) lines.push(`Tồn kho: ${product.stock}`);
    if (asksModel) lines.push(`Mẫu/biến thể: ${product.variants}`);
    lines.push(`Gợi ý dùng: ${product.note}`);
    return `- ${lines.join(' | ')}`;
  }).join('\n');

  const policyLine = asksPolicy ? `\n\nChính sách liên quan:\n${internalPolicies.slice(0, 3).map(item => `- ${item}`).join('\n')}` : '';

  return `${productLines}${policyLine}\n\nCâu có thể báo khách: "Dạ mẫu này bên em còn hàng, giá đang là ${products[0].price}. Hàng bạc 925 được bảo hành đánh sáng trọn đời và hỗ trợ lên đơn giao nhanh hôm nay ạ."`;
};

const getStaffListTags = (conv) => {
  const allTags = [...(conv.customTags || []), ...(conv.tags || [])];
  return allTags.filter(tag => {
    const t = tag.toLowerCase();
    if (t.includes('điểm') || t.includes('mockup')) return false;
    return (
      t.includes('chốt') ||
      t.includes('tạo đơn') ||
      t.includes('tư vấn') ||
      t.includes('bảo hành') ||
      t.includes('báo giá') ||
      t.includes('hỏi giá') ||
      t.includes('chờ chuyển') ||
      t.includes('cần xử lý')
    );
  }).filter((tag, index, arr) => arr.indexOf(tag) === index).slice(0, 3);
};

const getMessageDisplayParts = (msg, conv) => {
  if (msg.sender !== 'agent' || conv.flag === '🇻🇳') {
    return { text: msg.text, translation: msg.translation || '' };
  }

  const translationMatch = msg.text.match(/\n\(([\s\S]+)\)\s*$/);
  if (!translationMatch) {
    return { text: msg.text, translation: msg.translation || '' };
  }

  return {
    text: msg.text.slice(0, translationMatch.index).trim(),
    translation: translationMatch[1].trim()
  };
};

// ─────────────────────────────────────────
// LEFT: Conversation list with advanced filters
// ─────────────────────────────────────────
function ConvList({ activeId, onSelect, conversationsData, search, setSearch, adsOnly, setAdsOnly }) {
  const [tab, setTab] = useState('all');
  const filtered = conversationsData.filter(c => {
    if (adsOnly && !c.isAds) return false;
    if (tab === 'pending') return c.unread > 0;
    if (tab === 'waiting') return c.status === 'pending';
    if (tab === 'done') return c.status === 'reviewed';
    return true;
  });

  return (
    <div className="conv-panel" style={{ height: '100%', width: '100%', minWidth: 0 }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--n-100)', flexShrink: 0 }}>
        {conversationTabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '10px 4px', textAlign: 'center', cursor: 'pointer',
            borderBottom: tab === t.key ? '2.5px solid var(--primary-600)' : '2.5px solid transparent',
            transition: 'all 150ms ease',
          }}>
            <div style={{ fontSize: '11px', color: tab === t.key ? 'var(--n-600)' : 'var(--n-400)', fontWeight: 700, marginBottom: '2px' }}>
              {t.label}
            </div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: tab === t.key ? 'var(--primary-600)' : 'var(--n-800)' }}>
              {formatCompactNumber(t.count)}
            </div>
          </button>
        ))}
      </div>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--n-100)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'var(--n-50)', border: '1px solid var(--n-200)', borderRadius: '10px' }}>
          <MagnifyingGlass size={13} style={{ color: 'var(--n-400)', flexShrink: 0 }} />
          <input placeholder="Tìm kiếm hội thoại..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, background: 'transparent', fontSize: '12px', color: 'var(--n-700)' }} />
          <Sliders size={13} style={{ color: 'var(--n-400)', cursor: 'pointer' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setAdsOnly(!adsOnly)} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
            cursor: 'pointer', transition: 'all 150ms',
            background: adsOnly ? '#a855f7' : 'var(--n-50)',
            color: adsOnly ? '#fff' : 'var(--n-500)',
            border: adsOnly ? '1px solid #a855f7' : '1px solid var(--n-200)',
          }}>
            <Megaphone size={10} />
            Ads
          </button>
          <span style={{ fontSize: '11px', color: 'var(--n-400)', fontWeight: 600 }}>{filtered.length}/{formatCompactNumber(conversationTabs[0].count)} tin nhắn</span>
        </div>
      </div>

      {/* Conversation Items List */}
      <div className="conv-items" style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.map(c => {
          const isActive = activeId === c.id;
          const isUnread = c.unread > 0;
          const staffTags = getStaffListTags(c);
          
          const itemStyle = {
            borderLeft: isActive 
              ? '4px solid var(--primary-600)' 
              : isUnread
                ? '4px solid #f97316' 
                : '4px solid transparent',
            background: isActive
              ? '#eff6ff'
              : isUnread
                ? '#fff7ed' 
                : '#ffffff',
            transition: 'all 150ms ease',
            cursor: 'pointer',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            borderBottom: '1px solid var(--n-100)'
          };

          return (
            <div key={c.id} style={itemStyle} onClick={() => onSelect(c.id)}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div className="conv-item-avatar" style={{ background: c.avatarColor, width: 36, height: 36, fontSize: '13px' }}>
                  {c.name.charAt(0)}
                </div>
                {isUnread && (
                  <div style={{
                    position: 'absolute', top: -1, right: -1,
                    width: '10px', height: '10px', borderRadius: '50%',
                    background: '#f97316',
                    border: '2px solid white',
                    boxShadow: '0 0 4px rgba(249, 115, 22, 0.5)'
                  }} />
                )}
              </div>
              <div className="conv-item-content" style={{ flex: 1, minWidth: 0 }}>
                <div className="conv-item-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span className="conv-item-name" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', fontWeight: 600, color: 'var(--n-800)' }}>
                    {c.name} {c.flag}
                    {c.isAds && (
                      <span style={{
                        fontSize: '9px', fontWeight: 700, padding: '1px 4px',
                        background: '#a855f7', color: '#fff', borderRadius: '3px',
                        lineHeight: 1.3,
                      }}>Ads</span>
                    )}
                  </span>
                  <span className="conv-item-time" style={{ fontSize: '10px', color: 'var(--n-400)' }}>{c.time}</span>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--n-400)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  {c.channel}
                  <span style={{ color: 'var(--n-300)' }}>•</span>
                  <span style={{ color: 'var(--primary-500)', fontWeight: 500 }}>{c.page}</span>
                </div>
                <div className="conv-item-preview" style={{ fontSize: '11.5px', color: isUnread ? '#1e293b' : 'var(--n-500)', fontWeight: isUnread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.preview}
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--n-400)', marginTop: '2px' }}>
                  👤 {c.employee}
                </div>
                {staffTags.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '5px' }}>
                    {staffTags.map((tag, i) => {
                      const tagStyle = getTagStyle(tag);
                      return (
                        <span key={i} style={{
                          maxWidth: '100%',
                          fontSize: '9.5px',
                          padding: '2px 6px',
                          borderRadius: '5px',
                          background: tagStyle.bg,
                          color: tagStyle.color,
                          fontWeight: 800,
                          lineHeight: 1.25,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {tag}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              {isUnread && (
                <div style={{
                  background: '#f97316',
                  color: '#fff',
                  fontSize: '10.5px',
                  fontWeight: 800,
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                  flexShrink: 0,
                  alignSelf: 'center',
                  boxShadow: '0 1px 2px rgba(249, 115, 22, 0.2)'
                }}>
                  {c.unread}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MIDDLE: Chat panel (Taller textarea, suggested scripts, translation toggle, quick tags)
// ─────────────────────────────────────────
function ChatPanel({ conv, onSendMessage, onUpdateTags, draftReply }) {
  const messagesRef = useRef(null);
  const [inputText, setInputText] = useState('');
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [inputTab, setInputTab] = useState('reply');

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [conv.messages.length]);

  useEffect(() => {
    if (draftReply?.text) {
      setInputText(draftReply.text);
    }
  }, [draftReply]);

  const submitMessage = () => {
    if (inputText.trim()) {
      let finalMsgText = inputText.trim();
      
      // If Auto Translate is toggled ON and customer speaks foreign language
      if (autoTranslate && conv.flag !== '🇻🇳') {
        const foreignText = mockTranslate(inputText.trim(), conv.flag);
        finalMsgText = `${foreignText}\n(${inputText.trim()})`;
      }

      onSendMessage(conv.id, finalMsgText);
      setInputText('');
    }
  };

  return (
    <div className="chat-panel" style={{ height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--n-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: conv.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '16px', flexShrink: 0 }}>
            {conv.name.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--n-900)' }}>{conv.name} {conv.flag}</span>
              {conv.isAds && <span style={{ fontSize: '9.5px', fontWeight: 700, padding: '1px 5px', background: '#a855f7', color: '#fff', borderRadius: '3px' }}>Ads</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px' }}>
              <span style={{ width: 6, height: 6, background: '#22c55e', borderRadius: '50%', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ color: '#22c55e', fontWeight: 500 }}>{conv.channel}</span>
              <span style={{ color: 'var(--n-300)' }}>•</span>
              <span style={{ color: 'var(--primary-500)', fontWeight: 500, fontSize: '10.5px' }}>{conv.page}</span>
            </div>
          </div>
        </div>
        
        {/* Toggle Translation button for Customer foreign messages as requested! */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {conv.flag !== '🇻🇳' && (
            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px',
                border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
                background: showTranslation ? '#eff6ff' : '#fff',
                color: showTranslation ? '#2563eb' : 'var(--n-600)',
                cursor: 'pointer', transition: 'all 150ms'
              }}
            >
              <Translate size={14} style={{ color: showTranslation ? '#2563eb' : 'var(--n-500)' }} />
              {showTranslation ? 'Tắt dịch hội thoại' : 'Dịch hội thoại'}
            </button>
          )}
          <button className="chat-action-btn"><Star size={15} /></button>
          <button className="chat-action-btn"><Smiley size={15} /></button>
          <button className="chat-action-btn"><DotsThree size={15} /></button>
        </div>
      </div>

      {/* Customer Info Bar */}
      <div style={{ padding: '6px 16px', background: 'var(--n-50)', borderBottom: '1px solid var(--n-100)', display: 'flex', gap: '12px', fontSize: '11.5px', flexShrink: 0, flexWrap: 'wrap' }}>
        {[
          ['Giới tính', conv.gender],
          ['SĐT', conv.phone],
          ['Khách cũ', conv.isReturning ? `Có (${conv.lastPurchase})` : 'Chưa'],
          ['Nguồn', conv.source],
        ].map(([k, v]) => (
          <span key={k}>
            <span style={{ color: 'var(--n-400)' }}>{k}: </span>
            <span style={{ color: 'var(--n-800)', fontWeight: 600 }}>{v}</span>
          </span>
        ))}
      </div>

      {/* Messages dialogue box */}
      <div className="chat-messages" ref={messagesRef} style={{ background: '#f8fafc', padding: '12px 14px', gap: '10px', overflowY: 'auto', flex: 1 }}>
        {conv.messages.map(msg => {
          const isAgent = msg.sender === 'agent';
          const displayParts = getMessageDisplayParts(msg, conv);
          
          let bubbleStyle = {
            padding: '6px 10px',
            borderRadius: '12px',
            fontSize: '12.5px',
            lineHeight: '1.45',
            whiteSpace: 'pre-line',
            position: 'relative',
            transition: 'all 150ms ease'
          };

          if (isAgent) {
            bubbleStyle = {
              ...bubbleStyle,
              background: 'linear-gradient(135deg, var(--primary-600), var(--primary-500))',
              color: '#fff',
              borderBottomRightRadius: '2px'
            };
          } else {
            bubbleStyle = {
              ...bubbleStyle,
              background: '#ffffff',
              border: '1px solid var(--n-200)',
              color: 'var(--n-800)',
              borderBottomLeftRadius: '2px'
            };
          }

          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '75%', alignSelf: isAgent ? 'flex-end' : 'flex-start' }}>
              <div style={bubbleStyle}>
                {displayParts.text}
                
                {/* Visual Translation Toggle Display under foreign customer messages */}
                {!isAgent && showTranslation && msg.translation && (
                  <div style={{
                    marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed var(--n-200)',
                    fontSize: '11.5px', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <Translate size={11} />
                    <span>Dịch: {msg.translation}</span>
                  </div>
                )}
                {isAgent && showTranslation && conv.flag !== '🇻🇳' && displayParts.translation && (
                  <div style={{
                    marginTop: '5px', paddingTop: '5px', borderTop: '1px dashed rgba(255,255,255,.45)',
                    fontSize: '11.5px', color: '#eef2ff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <Translate size={11} />
                    <span>Tiếng Việt: {displayParts.translation}</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: isAgent ? 'flex-end' : 'flex-start', gap: '6px', padding: '0 2px' }}>
                <span className="chat-time" style={{ fontSize: '10px', color: 'var(--n-400)', marginTop: 0 }}>{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Area (taller text area rows=3, translate toggles, quick tags) */}
      <div style={{ borderTop: '1px solid var(--n-100)', flexShrink: 0, padding: '8px 14px', background: '#fff' }}>
        
        {/* Row 1: Quick tags gán nhãn as requested! */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--n-500)', display: 'flex', alignItems: 'center' }}>Gán nhãn nhanh:</span>
          {['Hỏi giá', 'Báo giá', 'Tạo đơn', 'Chờ chuyển'].map((quickTag, idx) => {
            const isTagAdded = conv.customTags.includes(quickTag) || conv.tags.includes(quickTag);
            const tagStyle = getTagStyle(quickTag);
            return (
              <button
                key={idx}
                onClick={() => {
                  if (isTagAdded) {
                    onUpdateTags(conv.id, conv.customTags.filter(t => t !== quickTag));
                  } else {
                    onUpdateTags(conv.id, [...conv.customTags, quickTag]);
                  }
                }}
                style={{
                  padding: '2px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 700,
                  background: isTagAdded ? tagStyle.bg : '#f1f5f9',
                  color: isTagAdded ? tagStyle.color : 'var(--n-500)',
                  border: isTagAdded ? `1px solid ${tagStyle.color}` : '1px solid var(--n-200)',
                  cursor: 'pointer', transition: 'all 150ms'
                }}
              >
                {isTagAdded ? `✓ ${quickTag}` : `+ ${quickTag}`}
              </button>
            );
          })}
        </div>

        {/* Input area Tab bar */}
        <div className="chat-input-tabs" style={{ marginBottom: '8px', display: 'flex', gap: '2px' }}>
          {[{ id: 'reply', label: 'Trả lời khách' }, { id: 'note', label: 'Ghi chú nội bộ' }].map(t => (
            <button key={t.id} className={`chat-input-tab ${inputTab === t.id ? 'active' : ''}`} onClick={() => setInputTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Taller Textarea for typing messages (Taller as requested!) */}
        <div style={{ position: 'relative', marginBottom: '8px' }}>
          <textarea
            rows={3}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitMessage();
              }
            }}
            placeholder={autoTranslate && conv.flag !== '🇻🇳' 
              ? `Nhập tin nhắn tiếng Việt... AI sẽ tự động dịch sang tiếng ${conv.flag === '🇹🇭' ? 'Thái' : conv.flag === '🇺🇸' ? 'Anh' : conv.flag === '🇯🇵' ? 'Nhật' : conv.flag === '🇪🇸' ? 'Tây Ban Nha' : 'Indo'}`
              : "Nhập tin nhắn... (Shift + Enter để xuống dòng, Enter để gửi)"
            }
            style={{
              width: '100%', fontSize: '12.5px', color: '#1e293b', padding: '8px 10px',
              background: '#f8fafc', border: '1px solid var(--n-200)', borderRadius: '10px',
              resize: 'none', minHeight: '65px', maxHeight: '100px', outline: 'none'
            }}
          />
          
          {/* Live Translation Preview beneath textarea if toggled on as requested! */}
          {autoTranslate && conv.flag !== '🇻🇳' && inputText.trim() && (
            <div style={{
              position: 'absolute', bottom: -20, left: 2, right: 2,
              background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '4px',
              padding: '3px 8px', fontSize: '10.5px', color: '#6d28d9', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '4px', zIndex: 10
            }}>
              <Translate size={11} />
              <span>Bản dịch AI gửi đi: "{mockTranslate(inputText.trim(), conv.flag)}"</span>
            </div>
          )}
        </div>

        {/* Bottom toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: autoTranslate && conv.flag !== '🇻🇳' && inputText.trim() ? '24px' : '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="chat-input-icons" style={{ display: 'flex', gap: '2px' }}>
              {[Smiley, FileText, Image, Paperclip, Microphone, QrCode].map((Icon, i) => (
                <button key={i} className="chat-input-icon"><Icon /></button>
              ))}
            </div>
            
            {/* Auto Translate Toggle Switch for typing Vietnamese but sending foreign language! */}
            {conv.flag !== '🇻🇳' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 700, color: '#6d28d9' }}>
                <input 
                  type="checkbox" 
                  checked={autoTranslate} 
                  onChange={e => setAutoTranslate(e.target.checked)} 
                  style={{ cursor: 'pointer' }}
                />
                AI Tự dịch khi gửi
              </label>
            )}
          </div>
          
          <button onClick={submitMessage} className="send-btn" style={{ background: 'var(--primary-600)', color: '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Gửi</span>
            <PaperPlaneRight size={12} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}

function InternalAIAssistant({ conv, collapsed, onToggle }) {
  const chatRef = useRef(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState(() => [
    {
      sender: 'ai',
      text: `Mình có thể tra cứu nhanh giá, tồn kho, mẫu mã và chính sách cho khách ${conv.name}.`
    }
  ]);

  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: `Đang hỗ trợ theo ngữ cảnh khách ${conv.name}. Hỏi ví dụ: "mẫu này còn size 16 không?", "giá báo khách Thái?", hoặc "chính sách đổi size".`
      }
    ]);
    setQuestion('');
  }, [conv.id, conv.name]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages.length]);

  const sendQuestion = (preset) => {
    const finalQuestion = (preset || question).trim();
    if (!finalQuestion) return;

    const aiText = answerInternalAI(finalQuestion, conv);
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: finalQuestion },
      { sender: 'ai', text: aiText }
    ]);
    setQuestion('');
  };

  const quickQuestions = [
    'Mẫu khách đang hỏi còn tồn kho không?',
    'Giá nên báo khách là bao nhiêu?',
    'Có mẫu nào upsell phù hợp?',
    'Chính sách bảo hành và đổi size?'
  ];

  if (collapsed) {
    return (
      <div style={{ height: '100%', width: 48, minWidth: 48, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '12px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 6px', gap: '10px', flexShrink: 0 }}>
        <button
          onClick={onToggle}
          title="Mở AI Assistant nội bộ"
          style={{ width: 34, height: 34, borderRadius: '9px', background: '#4c1d95', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Brain size={18} weight="fill" />
        </button>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success-500)' }} />
        <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '11px', color: '#4c1d95', fontWeight: 800, letterSpacing: 0, whiteSpace: 'nowrap' }}>
          AI nội bộ
        </div>
        <button
          onClick={onToggle}
          title="Mở rộng"
          style={{ marginTop: 'auto', width: 30, height: 30, borderRadius: '8px', background: '#ede9fe', color: '#4c1d95', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CaretRight size={15} weight="bold" />
        </button>
      </div>
    );
  }

  return (
    <div className="rp-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0, padding: 0, overflow: 'hidden', background: '#f5f3ff', border: '1px solid #ddd6fe' }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #ddd6fe', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#4c1d95', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Brain size={16} weight="fill" style={{ color: '#fff' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#312e81' }}>AI Assistant nội bộ</div>
            <div style={{ fontSize: '10.5px', color: '#6d28d9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Tra giá, tồn kho, mẫu mã, chính sách</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <span style={{ fontSize: '10px', color: 'var(--success-600)', background: 'var(--success-50)', border: '1px solid var(--success-100)', borderRadius: 999, padding: '2px 7px', fontWeight: 800 }}>Online</span>
          <button
            onClick={onToggle}
            title="Thu gọn AI Assistant"
            style={{ width: 28, height: 28, borderRadius: '7px', background: '#fff', color: '#4c1d95', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <CaretLeft size={14} weight="bold" />
          </button>
        </div>
      </div>

      <div style={{ padding: '9px 10px', display: 'flex', flexWrap: 'wrap', gap: '5px', borderBottom: '1px solid #ddd6fe', background: '#faf5ff' }}>
        {quickQuestions.map((item, i) => (
          <button
            key={i}
            onClick={() => sendQuestion(item)}
            style={{ padding: '4px 7px', borderRadius: '7px', border: '1px solid #ddd6fe', background: '#fff', color: '#4c1d95', fontSize: '10.5px', fontWeight: 700, lineHeight: 1.25 }}
          >
            {item}
          </button>
        ))}
      </div>

      <div ref={chatRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', background: '#f5f3ff', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.map((message, i) => {
          const isAI = message.sender === 'ai';
          return (
            <div key={i} style={{ alignSelf: isAI ? 'flex-start' : 'flex-end', maxWidth: '92%' }}>
              <div style={{
                padding: '8px 10px',
                borderRadius: '10px',
                borderBottomLeftRadius: isAI ? '2px' : '10px',
                borderBottomRightRadius: isAI ? '10px' : '2px',
                background: isAI ? '#312e81' : '#ecfeff',
                border: isAI ? '1px solid #312e81' : '1px solid #67e8f9',
                color: isAI ? '#fff' : '#155e75',
                fontSize: '11.5px',
                lineHeight: 1.5,
                whiteSpace: 'pre-line'
              }}>
                {message.text}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '9px 10px', borderTop: '1px solid #ddd6fe', background: '#ede9fe', display: 'flex', alignItems: 'flex-end', gap: '7px' }}>
        <textarea
          rows={2}
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendQuestion();
            }
          }}
          placeholder="Hỏi AI về giá, tồn kho, size, mẫu mã, chính sách..."
          style={{ flex: 1, resize: 'none', minHeight: 42, maxHeight: 70, padding: '7px 9px', borderRadius: '8px', border: '1px solid #c4b5fd', background: '#fff', color: '#312e81', fontSize: '11.5px', lineHeight: 1.4 }}
        />
        <button onClick={() => sendQuestion()} style={{ width: 34, height: 34, borderRadius: '8px', background: '#4c1d95', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PaperPlaneRight size={15} weight="fill" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// RIGHT: AI analysis panel
// ─────────────────────────────────────────
function RightPanel({ conv, onUpdateTags, onTriggerAction, onUseSuggestion }) {
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const sales = buildSalesAssistant(conv);
  const makeOrderDraft = () => ({
    product: sales.quote.product,
    quantity: 1,
    price: sales.quote.price,
    receiver: conv.name,
    phone: conv.phone === '-' ? '' : conv.phone,
    address: '',
    payment: 'COD',
    note: `Nguồn: ${conv.page}`
  });
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderDraft, setOrderDraft] = useState(makeOrderDraft);
  const visiblePanelTags = [
    ...(conv.tags || []),
    ...(conv.customTags || [])
  ].filter(tag => !tag.toLowerCase().includes('điểm'));

  useEffect(() => {
    setShowOrderForm(false);
    setOrderDraft(makeOrderDraft());
  }, [conv.id]);

  const handleAddTag = () => {
    if (newTag.trim()) {
      onUpdateTags(conv.id, [...conv.customTags, newTag.trim()]);
      setNewTag('');
      setAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    onUpdateTags(conv.id, conv.customTags.filter(t => t !== tagToRemove));
  };

  const handleActionClick = (actionId, label) => {
    if (actionId === 'create_order' || actionId === 'place_order') {
      setShowOrderForm(true);
    }
    onTriggerAction(actionId, label);
  };

  const submitOrder = () => {
    setShowOrderForm(false);
    onTriggerAction('confirm_order', `Lên đơn ${orderDraft.product}`);
  };

  const updateOrderDraft = (field, value) => {
    setOrderDraft(prev => ({ ...prev, [field]: value }));
  };

  const actionItems = [
    { id: 'create_order', label: 'Tạo đơn', icon: Package, color: 'var(--success-600)', bg: 'var(--success-50)' },
    { id: 'place_order', label: 'Đặt hàng', icon: ClipboardText, color: '#0f766e', bg: '#ecfdf5' },
    { id: 'ask_price', label: 'Hỏi giá', icon: Diamond, color: 'var(--warning-600)', bg: 'var(--warning-50)' },
    { id: 'quote_price', label: 'Báo giá', icon: Lightbulb, color: 'var(--primary-600)', bg: 'var(--primary-50)' },
    { id: 'transfer_agent', label: 'Chuyển NV', icon: ArrowsCounterClockwise, color: '#7c3aed', bg: '#f5f3ff' }
  ];

  return (
    <div className="right-panel" style={{ height: '100%', width: '100%', minWidth: 0, gap: '10px' }}>

      <div className="rp-card">
        <div className="rp-title">Thông tin khách</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: conv.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '15px', fontWeight: 800, flexShrink: 0 }}>
            {conv.name.charAt(0)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13.5px', fontWeight: 800, color: 'var(--n-900)' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.name}</span>
              <span>{conv.flag}</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--n-500)', marginTop: '1px' }}>{conv.channel} · {conv.page}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            ['Giới tính', conv.gender],
            ['SĐT', conv.phone],
            ['Khách cũ', conv.isReturning ? `Có (${conv.lastPurchase})` : 'Chưa'],
            ['Nguồn', conv.source],
            ['Campaign', conv.campaign],
            ['Adset', conv.adset],
            ['Chi phí ads', conv.cost],
            ['Tin đầu tiên', conv.firstMessage],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '6px', fontSize: '11.5px' }}>
              <span style={{ color: 'var(--n-400)', minWidth: '88px', flexShrink: 0 }}>{k}</span>
              <span style={{ color: 'var(--n-800)', fontWeight: 600, wordBreak: 'break-word' }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '6px', fontSize: '11.5px' }}>
            <span style={{ color: 'var(--n-400)', minWidth: '88px', flexShrink: 0 }}>Nhân viên phụ trách</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--n-800)', fontWeight: 600 }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff', fontWeight: 700, flexShrink: 0 }}>
                {conv.employee.charAt(0)}
              </div>
              {conv.employee}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', fontSize: '11.5px', alignItems: 'center' }}>
            <span style={{ color: 'var(--n-400)', minWidth: '88px', flexShrink: 0 }}>Trạng thái</span>
            <select style={{ fontSize: '11px', color: 'var(--warning-600)', fontWeight: 700, border: '1px solid var(--warning-200)', borderRadius: '7px', padding: '2px 6px', background: 'var(--warning-50)', cursor: 'pointer' }}>
              <option>{conv.status === 'reviewed' ? 'Đã hoàn thành' : 'Đang chờ'}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-title">Hành động nghiệp vụ</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '6px' }}>
          {actionItems.map((a, i) => {
            const IconComp = a.icon;
            return (
              <button
                key={i}
                onClick={() => handleActionClick(a.id, a.label)}
                title={a.label}
                style={{
                  minHeight: '54px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '7px 4px',
                  border: '1px solid var(--n-200)',
                  borderRadius: '8px',
                  background: '#fff',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = a.bg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--n-200)'; e.currentTarget.style.background = '#fff'; }}
              >
                <div style={{ width: 24, height: 24, borderRadius: '8px', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconComp size={13} style={{ color: a.color }} weight="duotone" />
                </div>
                <span style={{ fontSize: '9.8px', color: 'var(--n-700)', fontWeight: 800, lineHeight: 1.2, textAlign: 'center' }}>{a.label}</span>
              </button>
            );
          })}
        </div>

        {showOrderForm && (
          <div style={{ marginTop: '10px', border: '1px solid var(--success-100)', background: 'var(--success-50)', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 900, color: 'var(--success-600)' }}>Lên đơn cho khách</div>
              <button onClick={() => setShowOrderForm(false)} style={{ fontSize: '11px', color: 'var(--n-500)', fontWeight: 800 }}>Đóng</button>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px', color: 'var(--n-500)', fontWeight: 700 }}>
              Sản phẩm
              <input value={orderDraft.product} onChange={e => updateOrderDraft('product', e.target.value)} style={{ padding: '6px 8px', borderRadius: '7px', border: '1px solid var(--success-100)', color: 'var(--n-800)', background: '#fff' }} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: '7px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px', color: 'var(--n-500)', fontWeight: 700 }}>
                SL
                <input type="number" min="1" value={orderDraft.quantity} onChange={e => updateOrderDraft('quantity', e.target.value)} style={{ padding: '6px 8px', borderRadius: '7px', border: '1px solid var(--success-100)', color: 'var(--n-800)', background: '#fff' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px', color: 'var(--n-500)', fontWeight: 700 }}>
                Giá bán
                <input value={orderDraft.price} onChange={e => updateOrderDraft('price', e.target.value)} style={{ padding: '6px 8px', borderRadius: '7px', border: '1px solid var(--success-100)', color: 'var(--n-800)', background: '#fff' }} />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px', color: 'var(--n-500)', fontWeight: 700 }}>
                Người nhận
                <input value={orderDraft.receiver} onChange={e => updateOrderDraft('receiver', e.target.value)} style={{ padding: '6px 8px', borderRadius: '7px', border: '1px solid var(--success-100)', color: 'var(--n-800)', background: '#fff' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px', color: 'var(--n-500)', fontWeight: 700 }}>
                SĐT
                <input value={orderDraft.phone} onChange={e => updateOrderDraft('phone', e.target.value)} style={{ padding: '6px 8px', borderRadius: '7px', border: '1px solid var(--success-100)', color: 'var(--n-800)', background: '#fff' }} />
              </label>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px', color: 'var(--n-500)', fontWeight: 700 }}>
              Địa chỉ giao hàng
              <textarea rows={2} value={orderDraft.address} onChange={e => updateOrderDraft('address', e.target.value)} placeholder="Nhập địa chỉ khách xác nhận..." style={{ resize: 'none', padding: '6px 8px', borderRadius: '7px', border: '1px solid var(--success-100)', color: 'var(--n-800)', background: '#fff' }} />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px', color: 'var(--n-500)', fontWeight: 700 }}>
                Thanh toán
                <select value={orderDraft.payment} onChange={e => updateOrderDraft('payment', e.target.value)} style={{ padding: '6px 8px', borderRadius: '7px', border: '1px solid var(--success-100)', color: 'var(--n-800)', background: '#fff' }}>
                  <option>COD</option>
                  <option>Chuyển khoản</option>
                  <option>Link thanh toán</option>
                  <option>Thẻ quốc tế</option>
                </select>
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10.5px', color: 'var(--n-500)', fontWeight: 700 }}>
                Ghi chú
                <input value={orderDraft.note} onChange={e => updateOrderDraft('note', e.target.value)} style={{ padding: '6px 8px', borderRadius: '7px', border: '1px solid var(--success-100)', color: 'var(--n-800)', background: '#fff' }} />
              </label>
            </div>
            <button onClick={submitOrder} style={{ marginTop: '2px', width: '100%', padding: '8px 10px', borderRadius: '8px', background: 'var(--success-600)', color: '#fff', fontSize: '12px', fontWeight: 900 }}>
              Xác nhận lên đơn
            </button>
          </div>
        )}
      </div>

      <div className="rp-card">
        <div className="rp-title">
          <span>AI đánh giá cảm xúc khách hàng</span>
          <span style={{ fontSize: '10.5px', color: sales.sentiment.color, background: sales.sentiment.bg, padding: '2px 7px', borderRadius: 999, fontWeight: 800 }}>
            {sales.sentiment.label}
          </span>
        </div>
        {[
          ['Tích cực', conv.sentiment.positive, 'var(--success-500)'],
          ['Trung lập', conv.sentiment.neutral, 'var(--warning-500)'],
          ['Tiêu cực', conv.sentiment.negative, 'var(--danger-500)']
        ].map(([label, value, color]) => (
          <div key={label} style={{ display: 'grid', gridTemplateColumns: '58px 1fr 34px', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '11.5px' }}>
            <span style={{ color: 'var(--n-500)', fontWeight: 600 }}>{label}</span>
            <div style={{ height: '7px', background: 'var(--n-100)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 999 }} />
            </div>
            <span style={{ textAlign: 'right', color: 'var(--n-800)', fontWeight: 800 }}>{value}%</span>
          </div>
        ))}
        <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '8px', background: sales.sentiment.bg, color: 'var(--n-700)', fontSize: '11.5px', lineHeight: 1.55 }}>
          {sales.sentiment.explanation}
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-title">
          <span>AI gợi ý trả lời</span>
          <Brain size={14} weight="fill" style={{ color: 'var(--primary-600)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sales.replies.map((reply, i) => (
            <div key={i} style={{ border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: '10px', padding: '9px 10px' }}>
              <div style={{ fontSize: '12px', color: '#1e3a8a', lineHeight: 1.5, fontWeight: 650, whiteSpace: 'pre-line' }}>{reply.text}</div>
              <div style={{ marginTop: '7px', paddingTop: '7px', borderTop: '1px dashed #bfdbfe', fontSize: '11px', color: '#475569', lineHeight: 1.45 }}>
                <strong>Giải thích:</strong> {reply.reason}
              </div>
              <button onClick={() => onUseSuggestion?.(reply.text)} style={{ marginTop: '7px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 9px', borderRadius: '7px', background: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: 800 }}>
                <Lightbulb size={11} weight="fill" /> Dùng câu này
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rp-card">
        <div className="rp-title">
          <span>Gợi ý giá bán báo khách</span>
          <ClipboardText size={14} weight="duotone" style={{ color: 'var(--primary-600)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
          <div style={{ background: 'var(--n-50)', border: '1px solid var(--n-200)', borderRadius: '8px', padding: '8px' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--n-400)', fontWeight: 700 }}>Sản phẩm</div>
            <div style={{ fontSize: '12px', color: 'var(--n-900)', fontWeight: 800, lineHeight: 1.35 }}>{sales.quote.product}</div>
          </div>
          <div style={{ background: 'var(--success-50)', border: '1px solid var(--success-100)', borderRadius: '8px', padding: '8px' }}>
            <div style={{ fontSize: '10.5px', color: 'var(--success-600)', fontWeight: 700 }}>Giá nên báo</div>
            <div style={{ fontSize: '14px', color: 'var(--success-600)', fontWeight: 900 }}>{sales.quote.price}</div>
            <div style={{ fontSize: '10px', color: 'var(--n-500)', marginTop: '1px' }}>{sales.quote.localPrice}</div>
          </div>
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--n-700)', lineHeight: 1.55, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', padding: '8px 10px', whiteSpace: 'pre-line' }}>
          {sales.quote.script}
        </div>
        <div style={{ marginTop: '7px', fontSize: '11px', color: 'var(--n-500)', lineHeight: 1.45 }}>
          <strong>Giải thích:</strong> {sales.quote.explanation}
        </div>
        <button onClick={() => onUseSuggestion?.(sales.quote.script)} style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '5px 9px', borderRadius: '7px', background: 'var(--warning-500)', color: '#fff', fontSize: '11px', fontWeight: 800 }}>
          <ClipboardText size={11} weight="fill" /> Đưa vào ô trả lời
        </button>
      </div>

      <div className="rp-card">
        <div className="rp-title">
          <span>Sản phẩm khách có thể chốt</span>
          <Package size={14} weight="duotone" style={{ color: 'var(--success-600)' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sales.products.map((product, i) => (
            <div key={i} style={{ border: '1px solid var(--n-200)', borderRadius: '8px', padding: '8px 10px', background: i === 0 ? 'var(--success-50)' : '#fff' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--n-900)' }}>{product.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--n-500)', marginTop: '3px', lineHeight: 1.45 }}>{product.signal}</div>
              <div style={{ fontSize: '11px', color: 'var(--success-600)', marginTop: '4px', lineHeight: 1.45, fontWeight: 700 }}>{product.pitch}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="rp-card">
        <div className="rp-title">Nhãn</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {visiblePanelTags.map((t, i) => {
            const tagStyle = getTagStyle(t);
            const canRemove = conv.customTags.includes(t);
            return (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', background: tagStyle.bg, color: tagStyle.color, borderRadius: 999, fontSize: '11.5px', fontWeight: 700 }}>
                {t}
                {canRemove && (
                  <span onClick={() => handleRemoveTag(t)} style={{ fontSize: '10px', opacity: 0.6, cursor: 'pointer', lineHeight: 1 }}>×</span>
                )}
              </span>
            );
          })}
          
          {addingTag ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 6px', border: '1px solid #bfdbfe', borderRadius: '8px', background: '#eff6ff' }}>
              <input
                autoFocus
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddTag(); if (e.key === 'Escape') { setAddingTag(false); setNewTag(''); } }}
                placeholder="Nhập..."
                style={{ width: '70px', fontSize: '11px', background: 'transparent', color: '#1e293b', padding: '2px', border: 'none', outline: 'none' }}
              />
              <button onClick={handleAddTag} style={{ width: '15px', height: '15px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', padding: 0, border: 'none' }}>
                <CheckCircle size={10} />
              </button>
            </div>
          ) : (
            <button onClick={() => setAddingTag(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '3px 9px', border: '1px dashed var(--n-300)', borderRadius: 999, fontSize: '12px', color: 'var(--n-400)', cursor: 'pointer', background: 'transparent' }}>
              <Plus size={10} /> Thêm nhãn
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────
export default function ConversationsPage() {
  const [activeConv, setActiveConv] = useState(1);
  const [convData, setConvData] = useState(conversations);
  
  // Header filter states
  const ALL_PAGES = [
    { name: 'Vienchibao Jewelry', flag: '🇻🇳' },
    { name: 'Vienchibao Thailand', flag: '🇹🇭' },
    { name: 'Vienchibao USA', flag: '🇺🇸' },
    { name: 'Vienchibao Japan', flag: '🇯🇵' },
    { name: 'Vienchibao Global', flag: '🇪🇸' },
    { name: 'Vienchibao Indonesia', flag: '🇮🇩' }
  ];
  const [selectedPages, setSelectedPages] = useState(ALL_PAGES.map(p => p.name));
  const [showPageDropdown, setShowPageDropdown] = useState(false);
  const pageDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pageDropdownRef.current && !pageDropdownRef.current.contains(event.target)) {
        setShowPageDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [employeeFilter, setEmployeeFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('All');
  
  // Sidebar states
  const [search, setSearch] = useState('');
  const [adsOnly, setAdsOnly] = useState(false);

  // Business Action Toast Notifications State
  const [toastMessage, setToastMessage] = useState('');
  const [draftReply, setDraftReply] = useState(null);
  const [aiAssistantCollapsed, setAiAssistantCollapsed] = useState(false);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Filters calculation
  const filteredConversations = convData.filter(c => {
    // 1. Page Filter (Multi-select)
    if (selectedPages.length > 0 && !selectedPages.includes(c.page)) return false;
    if (selectedPages.length === 0) return false;
    // 2. Employee Filter
    if (employeeFilter !== 'All' && c.employee !== employeeFilter) return false;
    // 3. Tag Filter
    if (tagFilter !== 'All' && !c.tags.includes(tagFilter) && !c.customTags.includes(tagFilter)) return false;
    // 4. Search Filter
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || 
             c.employee.toLowerCase().includes(q) || 
             c.preview.toLowerCase().includes(q);
    }
    return true;
  });

  const selectedConv = convData.find(c => c.id === activeConv) || filteredConversations[0] || convData[0];

  const handleUpdateTags = (convId, newTags) => {
    setConvData(prev => prev.map(c => c.id === convId ? { ...c, customTags: newTags } : c));
  };

  const handleUseSuggestion = (text) => {
    setDraftReply({ text, id: Date.now() });
    triggerToast('Đã đưa câu gợi ý vào ô trả lời.');
  };

  // State-based live sending of messages as requested!
  const handleSendMessage = (convId, text) => {
    setConvData(prev => prev.map(c => {
      if (c.id === convId) {
        const newMsg = {
          id: Date.now(),
          sender: 'agent',
          text: text,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...c,
          preview: text.length > 25 ? text.substring(0, 25) + '...' : text,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));
  };

  // Handle business quick actions click as requested!
  const handleTriggerAction = (actionId, label) => {
    const addCustomTag = (tag) => {
      handleUpdateTags(selectedConv.id, Array.from(new Set([...selectedConv.customTags, tag])));
    };

    if (actionId === 'create_order' || actionId === 'place_order') {
      triggerToast(`Đã mở form lên đơn cho khách hàng ${selectedConv.name}.`);
      addCustomTag('Đang lên đơn');
    } else if (actionId === 'confirm_order') {
      triggerToast(`Đã lên đơn hàng thành công cho khách hàng ${selectedConv.name}!`);
      addCustomTag('Đã chốt đơn');
    } else if (actionId === 'ask_price') {
      triggerToast(`Đã gán nhãn [Hỏi giá] cho cuộc chat này.`);
      addCustomTag('Hỏi giá');
    } else if (actionId === 'quote_price') {
      triggerToast(`Đã gán nhãn [Báo giá] cho cuộc chat này.`);
      addCustomTag('Báo giá');
    } else if (actionId === 'transfer_agent') {
      triggerToast(`Đã chuyển hội thoại sang nhân viên khác chăm sóc thành công.`);
      addCustomTag('Chờ chuyển');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px', position: 'relative' }}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div style={{
          position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: '12px',
          fontSize: '13px', fontWeight: 700, zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #334155'
        }}>
          <CheckCircle size={16} style={{ color: '#22c55e' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER: Omni-channel multi-select filter selector row as requested! */}
      <div style={{
        background: '#fff', border: '1px solid var(--n-200)', borderRadius: '16px',
        padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center',
        justifyContent: 'space-between', flexShrink: 0, boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Brain size={20} weight="duotone" style={{ color: 'var(--primary-600)' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--n-900)' }}>Hộp thư đa kênh thông minh</div>
            <div style={{ fontSize: '11px', color: 'var(--n-400)' }}>AI-Powered Smart Omni-channel Inbox</div>
          </div>
        </div>
        
        {/* Advanced Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Page Filter Selector (Premium Multi-Select Dropdown) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', position: 'relative' }} ref={pageDropdownRef}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--n-500)' }}>Trang:</span>
            <button 
              onClick={() => setShowPageDropdown(!showPageDropdown)}
              style={{
                fontSize: '12px', fontWeight: 600, color: '#1e293b', background: '#f8fafc',
                border: '1px solid var(--n-200)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', minWidth: '150px', justifyContent: 'space-between',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                {selectedPages.length === ALL_PAGES.length ? (
                  <span>✨ Tất cả các Page ({selectedPages.length})</span>
                ) : selectedPages.length === 0 ? (
                  <span style={{ color: 'var(--n-400)' }}>Chưa chọn Page nào</span>
                ) : selectedPages.length === 1 ? (
                  <span>
                    {ALL_PAGES.find(p => p.name === selectedPages[0])?.flag} {selectedPages[0]}
                  </span>
                ) : (
                  <span>Đã chọn {selectedPages.length} Page</span>
                )}
              </span>
              <CaretDown size={12} style={{ color: 'var(--n-500)', transform: showPageDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
            </button>

            {showPageDropdown && (
              <div style={{
                position: 'absolute', top: '100%', right: 0, marginTop: '4px',
                width: '240px', background: '#ffffff', border: '1px solid var(--n-200)',
                borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                zIndex: 999, padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px'
              }}>
                {/* Quick actions for dropdown */}
                <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--n-100)', paddingBottom: '8px' }}>
                  <button 
                    onClick={() => setSelectedPages(ALL_PAGES.map(p => p.name))}
                    style={{
                      flex: 1, padding: '4px 6px', fontSize: '11px', fontWeight: 700,
                      background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                      borderRadius: '6px', cursor: 'pointer', transition: 'all 150ms'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                    onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                  >
                    Chọn tất cả
                  </button>
                  <button 
                    onClick={() => setSelectedPages([])}
                    style={{
                      flex: 1, padding: '4px 6px', fontSize: '11px', fontWeight: 700,
                      background: '#f8fafc', color: 'var(--n-600)', border: '1px solid var(--n-200)',
                      borderRadius: '6px', cursor: 'pointer', transition: 'all 150ms'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--n-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                  >
                    Bỏ chọn
                  </button>
                </div>

                {/* Page list with checkboxes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                  {ALL_PAGES.map((page, idx) => {
                    const isChecked = selectedPages.includes(page.name);
                    return (
                      <label 
                        key={idx}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px',
                          borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                          color: isChecked ? 'var(--n-900)' : 'var(--n-500)',
                          background: isChecked ? '#f8fafc' : 'transparent',
                          transition: 'all 100ms'
                        }}
                        onMouseEnter={e => { if(!isChecked) e.currentTarget.style.background = 'var(--n-50)'; }}
                        onMouseLeave={e => { if(!isChecked) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedPages(prev => prev.filter(name => name !== page.name));
                            } else {
                              setSelectedPages(prev => [...prev, page.name]);
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '14px' }}>{page.flag}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{page.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Employee Filter Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--n-500)' }}>Nhân viên:</span>
            <select 
              value={employeeFilter} 
              onChange={e => setEmployeeFilter(e.target.value)}
              style={{
                fontSize: '12px', fontWeight: 600, color: '#1e293b', background: '#f8fafc',
                border: '1px solid var(--n-200)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer'
              }}
            >
              <option value="All">Tất cả nhân viên</option>
              <option value="Minh Anh">Minh Anh</option>
              <option value="Phương Linh">Phương Linh</option>
              <option value="Hoàng Nam">Hoàng Nam</option>
              <option value="Thành Đạt">Thành Đạt</option>
            </select>
          </div>
          
          {/* Tag Filter Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--n-500)' }}>Nhãn tag:</span>
            <select 
              value={tagFilter} 
              onChange={e => setTagFilter(e.target.value)}
              style={{
                fontSize: '12px', fontWeight: 600, color: '#1e293b', background: '#f8fafc',
                border: '1px solid var(--n-200)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer'
              }}
            >
              <option value="All">Tất cả nhãn</option>
              <option value="Quan tâm sản phẩm">Quan tâm sản phẩm</option>
              <option value="Hỏi giá">Hỏi giá</option>
              <option value="Nước ngoài">Nước ngoài</option>
              <option value="Khách quen">Khách quen</option>
              <option value="Bảo hành">Bảo hành</option>
              <option value="Cần xử lý">Cần xử lý</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conversation workspace */}
      <div style={{ display: 'flex', gap: '10px', flex: 1, minHeight: 0 }}>
        {/* Fixed Width Sidebar for conversation items list */}
        <div style={{ width: '240px', minWidth: '240px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <ConvList 
            activeId={activeConv} 
            onSelect={setActiveConv} 
            conversationsData={filteredConversations} 
            search={search}
            setSearch={setSearch}
            adsOnly={adsOnly}
            setAdsOnly={setAdsOnly}
          />
        </div>
        
        {/* Chat Dialogue Panel */}
        <div style={{ flex: '1 1 auto', minWidth: 420, display: 'flex', flexDirection: 'column' }}>
          <ChatPanel 
            conv={selectedConv} 
            onSendMessage={handleSendMessage}
            onUpdateTags={handleUpdateTags}
            draftReply={draftReply}
          />
        </div>

        {/* Internal AI assistant column */}
        <div style={{
          width: aiAssistantCollapsed ? 48 : 'clamp(300px, 22vw, 360px)',
          minWidth: aiAssistantCollapsed ? 48 : 300,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'width 180ms ease, min-width 180ms ease'
        }}>
          <InternalAIAssistant
            conv={selectedConv}
            collapsed={aiAssistantCollapsed}
            onToggle={() => setAiAssistantCollapsed(prev => !prev)}
          />
        </div>
        
        {/* AI sales suggestion panel */}
        <div style={{ width: 'clamp(310px, 24vw, 380px)', minWidth: 310, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <RightPanel 
            conv={selectedConv} 
            onUpdateTags={handleUpdateTags}
            onTriggerAction={handleTriggerAction}
            onUseSuggestion={handleUseSuggestion}
          />
        </div>
      </div>
    </div>
  );
}
