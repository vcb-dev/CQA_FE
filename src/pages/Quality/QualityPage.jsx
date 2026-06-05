import { useState, useRef, useEffect } from 'react';
import {
  MagnifyingGlass, Sliders, Star, DotsThree, Plus,
  FileText, Paperclip, Image, Smiley, X,
  CheckCircle, Warning, Lightbulb,
  Clock, ChatCircleText, Phone, User, Tag, PaperPlaneRight,
  BookOpen, Ticket, Flag, ArrowRight, ArrowSquareOut, Megaphone,
  Eye, ArrowsCounterClockwise, SmileySad, Package, SmileyMeh, ClipboardText, Crown, ArrowUpRight, Diamond
} from '@phosphor-icons/react';

// ── Score color helper ──
const getScoreColor = (s) => s >= 85 ? '#22c55e' : s >= 70 ? '#f59e0b' : '#ef4444';
const getScoreLabel = (s) => s >= 85 ? 'Tốt' : s >= 70 ? 'Trung bình' : 'Cần cải thiện';

// ── Tag style helper based on screenshot ──
const getTagStyle = (tag) => {
  const t = tag.toLowerCase();
  if (t.includes('quan tâm sản phẩm') || t.includes('khách quen') || t.includes('điểm tốt') || t.includes('tích cực') || t.includes('hài lòng')) {
    return { bg: '#e8f5e9', color: '#1b5e20' }; // light green
  }
  if (t.includes('hỏi giá') || t.includes('nhẫn bạc') || t.includes('tự nhiên') || t.includes('zalo') || t.includes('hỏi cửa hàng')) {
    return { bg: '#e3f2fd', color: '#0d47a1' }; // light blue
  }
  if (t.includes('size 16') || t.includes('size 17') || t.includes('size 6') || t.includes('quảng cáo') || t.includes('bảo hành') || t.includes('đính đá')) {
    return { bg: '#fff3e0', color: '#e65100' }; // light orange
  }
  if (t.includes('chưa chốt đơn') || t.includes('cần xử lý') || t.includes('khiếu nại') || t.includes('mặc cả') || t.includes('tư vấn tệ')) {
    return { bg: '#f3e5f5', color: '#4a148c' }; // light purple
  }
  return { bg: '#f5f5f5', color: '#424242' }; // default grey
};

// ─────────────────────────────────────────
// HAND-CRAFTED DETAILED MULTI-LINGUAL CONVERSATIONS
// ─────────────────────────────────────────
const detailedConversations = [
  {
    id: 1, name: 'Nattapong S.', flag: '🇹🇭', channel: 'Messenger',
    preview: 'สนใจจะเอาวันนี้เลยค่ะ...', time: '10:30', employee: 'Minh Anh',
    score: 72, status: 'reviewed', avatarColor: '#6366f1',
    isAds: true, page: 'Vienchibao Thailand',
    gender: 'Nam', phone: '0912 345 678', isReturning: false, lastPurchase: '-',
    source: 'Facebook Ads - C80 - 01/2026',
    tags: ['Quan tâm sản phẩm', 'Hỏi giá'],
    customTags: ['Size 16', 'Chưa chốt đơn'],
    sentiment: { positive: 70, neutral: 20, negative: 10 },
    qa: {
      overall: 72, max: 100, label: 'Trung bình',
      criteria: [
        { name: 'Chào hỏi', score: 15, max: 20 },
        { name: 'Khai thác nhu cầu', score: 12, max: 20 },
        { name: 'Tư vấn & giải đáp', score: 14, max: 20 },
        { name: 'Xử lý từ chối', score: 10, max: 20 },
        { name: 'Chăm sóc sau bán', score: 11, max: 20 },
        { name: 'Follow-up', score: 10, max: 20 },
        { name: 'Thời gian phản hồi', score: 13, max: 20 }
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
      { id: 1, sender: 'customer', text: 'สนใจจะเอาวันนี้เลยค่ะ\nTôi quan tâm đến mẫu nhẫn bạc này.', time: '10:30' },
      { id: 2, sender: 'agent', text: 'สวัสดีค่ะ แหวนรุ่นนี้มีไซส์ 12 ถึง 20 ค่ะ\nDạ chào anh/chị, nhẫn này có size từ 12 đến 20 ạ.', time: '10:31', score: 'good' },
      { id: 3, sender: 'customer', text: 'เอาไซส์ 16 ครับ\nCho tôi size 16 nhé.', time: '10:31' },
      { id: 4, sender: 'agent', text: 'ได้เลยครับ! ไซส์ 16 ราคา 520 บาทครับ\nDạ vâng ạ, size 16 giá 520.000đ ạ.', time: '10:32', score: 'good' },
      { id: 5, sender: 'customer', text: 'มีของแถมไหมครับ\nCó quà tặng kèm gì không shop?', time: '10:32' },
      { id: 6, sender: 'agent', text: 'ไม่มีของแถมครับ\nKhông có quà kèm đâu ạ.', time: '10:33', score: 'low' },
    ],
  },
  {
    id: 2, name: 'Trần Quốc Bảo', flag: '🇻🇳', channel: 'Facebook',
    preview: 'Sản phẩm này còn size 17 không ạ?', time: '10:23', employee: 'Phương Linh',
    score: 88, status: 'reviewed', avatarColor: '#3b82f6',
    isAds: false, page: 'Vienchibao Jewelry',
    gender: 'Nam', phone: '0987 654 321', isReturning: true, lastPurchase: '20/04/2026',
    source: 'Tự nhiên (Organic)',
    tags: ['Khách quen', 'Quan tâm sản phẩm'],
    customTags: ['Size 17', 'Nhẫn bạc'],
    sentiment: { positive: 85, neutral: 10, negative: 5 },
    qa: {
      overall: 88, max: 100, label: 'Tốt',
      criteria: [
        { name: 'Chào hỏi', score: 18, max: 20 },
        { name: 'Khai thác nhu cầu', score: 15, max: 20 },
        { name: 'Tư vấn & giải đáp', score: 18, max: 20 },
        { name: 'Xử lý từ chối', score: 12, max: 20 },
        { name: 'Chăm sóc sau bán', score: 13, max: 20 },
        { name: 'Follow-up', score: 12, max: 20 },
        { name: 'Thời gian phản hồi', score: 17, max: 20 }
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
    score: 95, status: 'reviewed', avatarColor: '#ec4899',
    isAds: true, page: 'Vienchibao USA',
    gender: 'Nữ', phone: '+1 202 555 0143', isReturning: false, lastPurchase: '-',
    source: 'Instagram Ads - Worldwide 05/2026',
    tags: ['Nước ngoài', 'Quan tâm sản phẩm'],
    customTags: ['Size 6', 'Ship Singapore'],
    sentiment: { positive: 90, neutral: 7, negative: 3 },
    qa: {
      overall: 95, max: 100, label: 'Tốt',
      criteria: [
        { name: 'Chào hỏi', score: 20, max: 20 },
        { name: 'Khai thác nhu cầu', score: 18, max: 20 },
        { name: 'Tư vấn & giải đáp', score: 19, max: 20 },
        { name: 'Xử lý từ chối', score: 13, max: 20 },
        { name: 'Chăm sóc sau bán', score: 13, max: 20 },
        { name: 'Follow-up', score: 12, max: 20 },
        { name: 'Thời gian phản hồi', score: 20, max: 20 }
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
      { id: 1, sender: 'customer', text: 'Hi, I saw your Instagram ad. Do you ship to Singapore?\nXin chào, tôi thấy quảng cáo Instagram của shop. Shop có ship đi Singapore không?', time: '09:40' },
      { id: 2, sender: 'agent', text: 'Hello Sarah! Yes, we do provide international shipping to Singapore! ✈️ Shipping fee is around $10.\nChào chị Sarah! Dạ bên em có ship đi Singapore ạ, phí ship là $10.', time: '09:41', score: 'good' },
      { id: 3, sender: 'customer', text: 'Great! How long does it usually take?\nTuyệt quá! Giao hàng thường mất bao lâu?', time: '09:42' },
      { id: 4, sender: 'agent', text: 'It typically takes 5-7 business days. We will provide a tracking number as soon as it is shipped out.\nDạ thường mất 5-7 ngày làm việc ạ. Em sẽ gửi mã tracking ngay sau khi gửi đi.', time: '09:43', score: 'good' },
      { id: 5, sender: 'customer', text: 'Perfect, I\'d like to order the classic silver ring in size 6.\nTuyệt, tôi muốn đặt nhẫn bạc classic size 6.', time: '09:44' },
      { id: 6, sender: 'agent', text: 'Excellent choice! I\'ve reserved a size 6 for you. Let me send you the payment link to finalize your order.\nLựa chọn tuyệt vời ạ! Em đã giữ 1 nhẫn size 6 cho chị. Em gửi link thanh toán nhé.', time: '09:45', score: 'good' },
    ],
  },
  {
    id: 4, name: 'Yuki Tanaka', flag: '🇯🇵', channel: 'Messenger',
    preview: 'サイズについて聞きたいのですが...', time: '09:12', employee: 'Thành Đạt',
    score: 58, status: 'pending', avatarColor: '#a855f7',
    isAds: false, page: 'Vienchibao Japan',
    gender: 'Nữ', phone: '+81 90 1234 5678', isReturning: false, lastPurchase: '-',
    source: 'Tự nhiên (Organic)',
    tags: ['Nước ngoài', 'Tư vấn kém'],
    customTags: ['Hỏi size', 'Kinh nghiệm yếu', 'Chưa chốt đơn'],
    sentiment: { positive: 10, neutral: 30, negative: 60 },
    qa: {
      overall: 58, max: 100, label: 'Cần cải thiện',
      criteria: [
        { name: 'Chào hỏi', score: 10, max: 20 },
        { name: 'Khai thác nhu cầu', score: 8, max: 20 },
        { name: 'Tư vấn & giải đáp', score: 12, max: 20 },
        { name: 'Xử lý từ chối', score: 10, max: 20 },
        { name: 'Chăm sóc sau bán', score: 9, max: 20 },
        { name: 'Follow-up', score: 9, max: 20 },
        { name: 'Thời gian phản hồi', score: 9, max: 20 }
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
      { id: 1, sender: 'customer', text: 'こんにちは、このシルバーリング of サイズについて聞きたいのですが。\nXin chào, tôi muốn hỏi về size của chiếc nhẫn bạc này.', time: '09:05' },
      { id: 2, sender: 'agent', text: 'はい。\nVâng.', time: '09:06', score: 'low' },
      { id: 3, sender: 'customer', text: '指の周りが52mmの場合、どのサイズが良いですか？\nNếu chu vi ngón tay là 52mm thì đeo size nào tốt?', time: '09:08' },
      { id: 4, sender: 'agent', text: '自分で測ってください。\nChị tự đo đi ạ.', time: '09:09', score: 'low' },
      { id: 5, sender: 'customer', text: 'えっ？測り方がわからないのですが...\nƠ? Tôi không biết cách đo...', time: '09:10' },
      { id: 6, sender: 'agent', text: 'ネットで調べてください。\nChị lên mạng tìm nhé.', time: '09:12', score: 'low' },
    ],
  },
  {
    id: 5, name: 'Carlos Gomez', flag: '🇪🇸', channel: 'Facebook',
    preview: 'Hola, ¿tienen stock de este anillo?', time: '08:50', employee: 'Phương Linh',
    score: 78, status: 'reviewed', avatarColor: '#f59e0b',
    isAds: true, page: 'Vienchibao Global',
    gender: 'Nam', phone: '+34 612 345 678', isReturning: false, lastPurchase: '-',
    source: 'Facebook Ads - Spain Campaign',
    tags: ['Nước ngoài', 'Phí ship cao'],
    customTags: ['Tây Ban Nha', 'Hỏi ship'],
    sentiment: { positive: 50, neutral: 40, negative: 10 },
    qa: {
      overall: 78, max: 100, label: 'Trung bình',
      criteria: [
        { name: 'Chào hỏi', score: 18, max: 20 },
        { name: 'Khai thác nhu cầu', score: 15, max: 20 },
        { name: 'Tư vấn & giải đáp', score: 17, max: 20 },
        { name: 'Xử lý từ chối', score: 10, max: 20 },
        { name: 'Chăm sóc sau bán', score: 10, max: 20 },
        { name: 'Follow-up', score: 8, max: 20 },
        { name: 'Thời gian phản hồi', score: 14, max: 20 }
      ],
    },
    aiSummary: {
      customerSaid: ['Hỏi về tình trạng hàng của nhẫn bạc', 'Hỏi phí ship về Madrid, Tây Ban Nha', 'Chê phí ship 15 euro hơi đắt'],
      goodPoints: ['Phản hồi bằng tiếng Tây Ban Nha thân thiện', 'Giới thiệu được chất liệu bạc 925 chuẩn'],
      badPoints: ['Chưa khéo léo xử lý lời từ chối về phí ship đắt', 'Chưa tạo động lực bằng việc đề xuất mua thêm để chia sẻ phí ship'],
      suggestions: ['Tư vấn: "Nếu mua thêm 1 sản phẩm nữa, shop sẽ hỗ trợ 50% phí ship..."', 'Nhấn mạnh giá trị sản phẩm bạc tinh xảo từ Việt Nam'],
    },
    customerKeywords: ['Stock de plata', 'Envío a Madrid', 'Phí ship đắt', 'Spain Campaign'],
    interestedProducts: ['Anillo de plata 925'],
    suggestedReplies: [
      `"¡Hola Carlos! Si compras un anillo adicional, podemos ofrecerte un 50% de descuento en el costo de envío. ¿Qué te parece? 😊"`,
      `"Dạ phí ship là do bưu điện tính, nếu anh lấy thêm 1 chiếc nữa bên em sẽ hỗ trợ phí ship chỉ còn 7 euro ạ."`
    ],
    internalNotes: [
      { id: 105, author: 'Auditor Phương Linh', time: '08:55 15/05/2026', text: 'Nhân viên cần được cải thiện kỹ năng đàm phán giá ship khi khách chê đắt.' }
    ],
    improvements: ['Chưa khéo léo xử lý lời chê phí ship đắt', 'Chưa có phương án upsell hỗ trợ chia sẻ phí ship'],
    convInfo: { start: '15/05/2026 08:42', end: '15/05/2026 08:50', duration: '8 phút', msgCount: 6, status: 'Đang chờ' },
    scoreHistory: [{ date: '01/05', score: 70 }, { date: '08/05', score: 75 }, { date: '15/05', score: 72 }, { date: '22/05', score: 78 }, { date: '31/05', score: 78 }],
    messages: [
      { id: 1, sender: 'customer', text: 'Hola, ¿tienen este anillo de plata en stock?\nXin chào, nhẫn bạc này còn hàng không?', time: '08:42' },
      { id: 2, sender: 'agent', text: '¡Hola Carlos! Sí, lo tenemos disponible en plata esterlina 925. 😊\nDạ chào anh Carlos! Có hàng sẵn bằng bạc 925 cao cấp ạ.', time: '08:44', score: 'good' },
      { id: 3, sender: 'customer', text: '¿Cuál es el costo de envío a Madrid?\nPhí ship đến Madrid là bao nhiêu?', time: '08:45' },
      { id: 4, sender: 'agent', text: 'El costo es de 15 euros, tarda de 5 a 10 ngày.\nPhí ship là 15 euro, mất khoảng 5-10 ngày ạ.', time: '08:47', score: 'medium' },
      { id: 5, sender: 'customer', text: 'Es un poco caro el envío.\nPhí ship hơi đắt nhỉ.', time: '08:48' },
      { id: 6, sender: 'agent', text: 'Es tarifa plana del correo, no podemos bajarla.\nĐó là giá cố định của bưu điện rồi, bên em không giảm được ạ.', time: '08:50', score: 'low' },
    ],
  },
  {
    id: 6, name: 'Adi Wijaya', flag: '🇮🇩', channel: 'Instagram',
    preview: 'Apakah produk cincin masih ada?', time: '08:20', employee: 'Minh Anh',
    score: 84, status: 'reviewed', avatarColor: '#10b981',
    isAds: true, page: 'Vienchibao Indonesia',
    gender: 'Nam', phone: '+62 812 3456 7890', isReturning: false, lastPurchase: '-',
    source: 'Instagram Ads - Jakarta KM',
    tags: ['Nước ngoài', 'COD'],
    customTags: ['Indonesia', 'Hỏi ship'],
    sentiment: { positive: 65, neutral: 30, negative: 5 },
    qa: {
      overall: 84, max: 100, label: 'Trung bình',
      criteria: [
        { name: 'Chào hỏi', score: 18, max: 20 },
        { name: 'Khai thác nhu cầu', score: 16, max: 20 },
        { name: 'Tư vấn & giải đáp', score: 18, max: 20 },
        { name: 'Xử lý từ chối', score: 12, max: 20 },
        { name: 'Chăm sóc sau bán', score: 10, max: 20 },
        { name: 'Follow-up', score: 10, max: 20 },
        { name: 'Thời gian phản hồi', score: 16, max: 20 }
      ],
    },
    aiSummary: {
      customerSaid: ['Hỏi nhẫn bạc còn sẵn không', 'Hỏi ship COD đến Nam Jakarta mất bao lâu', 'Hỏi giá tiền Rupiah'],
      goodPoints: ['Phản hồi tiếng Indo cực kỳ lịch sự và tự nhiên', 'Cung cấp thời gian ship COD chính xác cho khu vực Jabodetabek'],
      badPoints: ['Chưa báo giá ngay bằng tiền Rupiah ở tin nhắn thứ 2', 'Phản hồi tin nhắn cuối hơi chậm'],
      suggestions: ['Báo giá quy đổi ngay: "Harganya Rp 350.000..."', 'Gợi ý đo size tay theo chuẩn Indonesia'],
    },
    customerKeywords: ['Cincin perak 925', 'Bisa COD Jakarta', 'Harga Rupiah', 'Jakarta KM Ads'],
    interestedProducts: ['Cincin perak murni 925'],
    suggestedReplies: [
      `"Halo Kak Adi! Iya, harganya Rp 350.000 dan kami ada promo gratis ongkir COD hari ini ke Jakarta Selatan. 😊"`,
      `"Kak Adi, untuk ukurannya bisa mengikuti tabel ukuran standar Indonesia berikut nhé."`
    ],
    internalNotes: [
      { id: 106, author: 'Auditor Minh Anh', time: '08:25 15/05/2026', text: 'Chat bằng tiếng Indo chuẩn, cần chuẩn bị sẵn bảng quy đổi Rupiah nhanh hơn.' }
    ],
    improvements: ['Chưa báo giá quy đổi tiền Rupiah ngay từ tin nhắn đầu'],
    convInfo: { start: '15/05/2026 08:10', end: '15/05/2026 08:20', duration: '10 phút', msgCount: 6, status: 'Đang chờ' },
    scoreHistory: [{ date: '01/05', score: 80 }, { date: '08/05', score: 82 }, { date: '15/05', score: 81 }, { date: '22/05', score: 84 }, { date: '31/05', score: 84 }],
    messages: [
      { id: 1, sender: 'customer', text: 'Halo, apakah produk cincin perak ini masih ada?\nXin chào, mẫu nhẫn bạc này còn không?', time: '08:10' },
      { id: 2, sender: 'agent', text: 'Halo Kak Adi! Cincin perak 925 murni sẵn size 14-22 ạ. 😊', time: '08:12', score: 'good' },
      { id: 3, sender: 'customer', text: 'Bisa COD ke Jakarta Selatan?\nCó ship COD đến Nam Jakarta không?', time: '08:15' },
      { id: 4, sender: 'agent', text: 'Dạ ship COD qua bưu tá mất 2-3 ngày làm việc ạ.', time: '08:16', score: 'good' },
      { id: 5, sender: 'customer', text: 'Berapa harganya ya?\nGiá bao nhiêu vậy shop?', time: '08:18' },
      { id: 6, sender: 'agent', text: 'Harganya Rp 350.000 kak.\nGiá là 350.000 Rupiah ạ.', time: '08:20', score: 'medium' },
    ],
  },
  {
    id: 7, name: 'Phạm Thùy Linh', flag: '🇻🇳', channel: 'Messenger',
    preview: 'Cho mình địa chỉ cửa hàng nhé', time: '10:23', employee: 'Hoàng Nam',
    score: 85, status: 'pending', avatarColor: '#ec4899',
    isAds: true, page: 'Vienchibao Official',
    gender: 'Nữ', phone: '0933 456 789', isReturning: false, lastPurchase: '-',
    source: 'Instagram Ads - Story 03/2026',
    tags: ['Hỏi cửa hàng', 'Quan tâm sản phẩm'],
    customTags: ['Dây chuyền', 'HCM'],
    sentiment: { positive: 70, neutral: 25, negative: 5 },
    qa: {
      overall: 85, max: 100, label: 'Tốt',
      criteria: [
        { name: 'Chào hỏi', score: 18, max: 20 },
        { name: 'Khai thác nhu cầu', score: 16, max: 20 },
        { name: 'Tư vấn & giải đáp', score: 18, max: 20 },
        { name: 'Xử lý từ chối', score: 13, max: 20 },
        { name: 'Chăm sóc sau bán', score: 10, max: 20 },
        { name: 'Follow-up', score: 10, max: 20 },
        { name: 'Thời gian phản hồi', score: 18, max: 20 }
      ],
    },
    aiSummary: {
      customerSaid: ['Hỏi địa chỉ cửa hàng', 'Muốn xem trực tiếp dây chuyền', 'Ở khu vực HCM'],
      goodPoints: ['Cung cấp đầy đủ địa chỉ và giờ mở cửa', 'Mời khách xem thêm mẫu online', 'Phản hồi nhanh'],
      badPoints: ['Chưa đặt lịch hẹn cụ thể để chuẩn bị đón tiếp'],
      suggestions: ['Hỏi khách ghé lúc mấy giờ để nhân viên chuẩn bị nước và hàng mẫu'],
    },
    customerKeywords: ['Địa chỉ HCM', 'Ghé xem trực tiếp', 'Dây chuyền Bạc nữ'],
    interestedProducts: ['Dây chuyền Bạc đính đá', 'Mẫu lắc tay mới'],
    suggestedReplies: [
      `"Dạ chiều nay tầm mấy giờ chị Linh ghé qua quận 1 thế ạ? Em đặt nước và dặn các bạn sẵn sàng đón chị nhé! 🥰"`,
      `"Dạ cửa hàng bên em ngay trung tâm Quận 1 dễ tìm lắm, có chỗ đậu xe hơi thoải mái chị ạ."`
    ],
    internalNotes: [
      { id: 107, author: 'Auditor Hoàng Nam', time: '10:26 15/05/2026', text: 'Khách muốn xem trực tiếp, nhân viên trả lời lịch sự và cung cấp định vị map.' }
    ],
    improvements: ['Chưa chủ động mời đặt lịch hẹn đón tiếp'],
    convInfo: { start: '15/05/2026 10:20', end: '15/05/2026 10:23', duration: '3 phút', msgCount: 4, status: 'Đang chờ' },
    scoreHistory: [{ date: '01/05', score: 75 }, { date: '08/05', score: 80 }, { date: '15/05', score: 83 }, { date: '22/05', score: 85 }, { date: '31/05', score: 85 }],
    messages: [
      { id: 1, sender: 'customer', text: 'Hi shop, cho mình hỏi cửa hàng ở đâu vậy ạ?', time: '10:20' },
      { id: 2, sender: 'agent', text: 'Dạ chào chị Linh! Shop có cửa hàng tại 123 Nguyễn Huệ, Quận 1, TP. HCM ạ. Mở cửa 9h-21h hàng ngày chị nhé.', time: '10:21', score: 'good' },
      { id: 3, sender: 'customer', text: 'Ok mình ở gần đó, chiều nay mình ghé qua xem dây chuyền bạc nhé', time: '10:22' },
      { id: 4, sender: 'agent', text: 'Dạ tuyệt vời quá ạ! Chị Linh ghé qua tầm mấy giờ để em báo các bạn nhân viên chuẩn bị sẵn các mẫu dây chuyền đẹp nhất đón tiếp chị ạ? 🥰', time: '10:23', score: 'good' },
    ],
  },
  {
    id: 8, name: 'Lê Hoàng Nam', flag: '🇻🇳', channel: 'Facebook',
    preview: 'Bảo hành nhẫn bạc đính đá CZ...', time: '10:20', employee: 'Thành Đạt',
    score: 95, status: 'reviewed', avatarColor: '#f59e0b',
    isAds: true, page: 'Vienchibao Jewelry',
    gender: 'Nam', phone: '0981 654 321', isReturning: true, lastPurchase: '10/05/2026',
    source: 'Facebook Ads - Video Ring 05/2026',
    tags: ['Khách VIP', 'Mua quà tặng'],
    customTags: ['Bảo hành', 'Đính đá CZ'],
    sentiment: { positive: 90, neutral: 10, negative: 0 },
    qa: {
      overall: 95, max: 100, label: 'Tốt',
      criteria: [
        { name: 'Chào hỏi', score: 19, max: 20 },
        { name: 'Khai thác nhu cầu', score: 19, max: 20 },
        { name: 'Tư vấn & giải đáp', score: 20, max: 20 },
        { name: 'Xử lý từ chối', score: 13, max: 20 },
        { name: 'Chăm sóc sau bán', score: 12, max: 20 },
        { name: 'Follow-up', score: 12, max: 20 },
        { name: 'Thời gian phản hồi', score: 19, max: 20 }
      ],
    },
    aiSummary: {
      customerSaid: ['Hỏi về chế độ bảo hành nhẫn bạc đính đá CZ', 'Muốn mua tặng sinh nhật bạn gái', 'Rất hài lòng với dịch vụ gói quà'],
      goodPoints: ['Tư vấn bảo hành cực kỳ rõ ràng chi tiết (12 tháng, đánh bóng trọn đời)', 'Chủ động tặng kèm hộp quà và thiệp chúc mừng sinh nhật', 'Thái độ cực kỳ nhiệt tình, tạo trải nghiệm mua hàng vượt trội'],
      badPoints: [],
      suggestions: ['Nhắc nhở bộ phận vận chuyển giao đúng hẹn ngày sinh nhật', 'Lưu thông tin ngày sinh nhật bạn gái khách hàng vào CRM để gửi ưu đãi năm sau'],
    },
    customerKeywords: ['Bảo hành đá CZ', 'Tặng sinh nhật bạn gái', 'Hộp quà thắt nơ', 'Khách VIP'],
    interestedProducts: ['Nhẫn bạc đính đá CZ cao cấp'],
    suggestedReplies: [
      `"Dạ em đã dặn bưu tá giao đúng ngày sinh nhật rồi ạ. Gửi tặng anh thiệp thiết kế riêng nhé."`,
      `"Bên em có chính sách ưu đãi riêng giảm 10% cho khách VIP vào tháng sinh nhật nữa ạ!"`
    ],
    internalNotes: [
      { id: 108, author: 'Auditor Thành Đạt', time: '10:22 15/05/2026', text: 'Tư vấn xuất sắc, chốt đơn combo cao cấp, khách rất hài lòng.' }
    ],
    improvements: [],
    convInfo: { start: '15/05/2026 10:05', end: '15/05/2026 10:20', duration: '15 phút', msgCount: 4, status: 'Đã chốt đơn' },
    scoreHistory: [{ date: '01/05', score: 90 }, { date: '08/05', score: 91 }, { date: '15/05', score: 93 }, { date: '22/05', score: 95 }, { date: '31/05', score: 95 }],
    messages: [
      { id: 1, sender: 'customer', text: 'Chào shop, nhẫn bạc đính đá CZ bảo hành thế nào vậy?', time: '10:05' },
      { id: 2, sender: 'agent', text: 'Dạ chào anh Nam ạ! Nhẫn bạc đá CZ bên em được bảo hành 12 tháng về lỗi kỹ thuật và đánh bóng trọn đời miễn phí anh nhé! ✨', time: '10:08', score: 'good' },
      { id: 3, sender: 'customer', text: 'Đánh bóng trọn đời luôn hả shop? Tốt quá. Mình muốn mua tặng bạn gái sinh nhật.', time: '10:12' },
      { id: 4, sender: 'agent', text: 'Dạ đúng rồi ạ, đánh bóng hoàn toàn miễn phí ạ! 🎁 Đặc biệt nhân dịp sinh nhật bạn gái anh, shop xin tặng kèm hộp quà thắt nơ premium và thiệp chúc mừng thiết kế riêng nữa ạ!', time: '10:15', score: 'good' },
    ],
  },
  {
    id: 9, name: 'Anong P.', flag: '🇹🇭', channel: 'Messenger',
    preview: 'แหวนวงนี้ลดราคาได้อีกไหม...', time: '07:45', employee: 'Minh Anh',
    score: 62, status: 'reviewed', avatarColor: '#3b82f6',
    isAds: false, page: 'Vienchibao Thailand',
    gender: 'Nữ', phone: '+66 89 765 4321', isReturning: false, lastPurchase: '-',
    source: 'Tự nhiên (Organic)',
    tags: ['Nước ngoài', 'Mặc cả'],
    customTags: ['Thái Lan', 'Thái độ chưa tốt', 'Chưa chốt đơn'],
    sentiment: { positive: 20, neutral: 40, negative: 40 },
    qa: {
      overall: 62, max: 100, label: 'Cần cải thiện',
      criteria: [
        { name: 'Chào hỏi', score: 15, max: 20 },
        { name: 'Khai thác nhu cầu', score: 10, max: 20 },
        { name: 'Tư vấn & giải đáp', score: 13, max: 20 },
        { name: 'Xử lý từ chối', score: 8, max: 20 },
        { name: 'Chăm sóc sau bán', score: 8, max: 20 },
        { name: 'Follow-up', score: 8, max: 20 },
        { name: 'Thời gian phản hồi', score: 15, max: 20 }
      ],
    },
    aiSummary: {
      customerSaid: ['Hỏi xem nhẫn có được giảm giá thêm không', 'Nói rằng shop khác bán rẻ hơn'],
      goodPoints: ['Phản hồi nhanh bằng tiếng Thái'],
      badPoints: ['Thái độ phản đối khách hàng quá gay gắt ("Nếu shop khác rẻ hơn thì đi mua bên đó đi")', 'Vi phạm quy chuẩn giao tiếp tôn trọng khách hàng của thương hiệu'],
      suggestions: ['Nhân viên cần được đào tạo lại kỹ năng kiểm soát cảm xúc', 'Cung cấp kịch bản so sánh chất lượng để chứng minh giá trị: "Dạ nhẫn của shop được chế tác tinh xảo, hàm lượng bạc chuẩn 925..."'],
    },
    customerKeywords: ['Mặc cả giá', 'Chê đắt', 'So sánh đối thủ', 'Thái độ gay gắt'],
    interestedProducts: ['Nhẫn bạc nữ đính đá'],
    suggestedReplies: [
      `"お客様、こちらのリングは最高品質の925スターリングシルバーを使用しており、手作業で仕上げております。そのため、これ以上の値下げは難しくなっております。ご理解いただけますと幸いです。🌸"`,
      `"Dạ nhẫn bên em được làm thủ công tinh xảo chuẩn hàm lượng bạc. So với chất lượng thì mức giá này cực tốt rồi chị ạ."`
    ],
    internalNotes: [
      { id: 109, author: 'Auditor Minh Anh', time: '07:48 15/05/2026', text: 'Nhân viên trả lời quá nóng nảy, vi phạm quy tắc ứng xử tôn trọng khách hàng.' }
    ],
    improvements: ['Thái độ phản đối khách hàng quá gay gắt, thiếu chuyên nghiệp'],
    convInfo: { start: '15/05/2026 07:40', end: '15/05/2026 07:45', duration: '5 phút', msgCount: 4, status: 'Đã hoàn thành' },
    scoreHistory: [{ date: '01/05', score: 60 }, { date: '08/05', score: 65 }, { date: '15/05', score: 62 }, { date: '22/05', score: 64 }, { date: '31/05', score: 62 }],
    messages: [
      { id: 1, sender: 'customer', text: 'แหวนวงนี้ลดราคาได้อีกไหมคะ\nNhẫn này giảm giá thêm được không shop?', time: '07:40' },
      { id: 2, sender: 'agent', text: 'ราคานี้ giảm không được nữa ạ, là giá niêm yết cố định rồi.', time: '07:42', score: 'medium' },
      { id: 3, sender: 'customer', text: 'แต่ร้านอื่นขายถูกกว่านี้นะคะ\nNhưng shop khác bán rẻ hơn thế này đó.', time: '07:43' },
      { id: 4, sender: 'agent', text: 'ถ้าร้านอื่นถูกกว่าก็ไปซื้อร้านอื่นสิคะ\nNếu shop khác rẻ hơn thì chị cứ đi mua bên đó đi.', time: '07:45', score: 'low' },
    ],
  },
  {
    id: 10, name: 'Kenji Sato', flag: '🇯🇵', channel: 'Facebook',
    preview: 'プレゼント用のラッピングは...', time: '07:15', employee: 'Hoàng Nam',
    score: 91, status: 'reviewed', avatarColor: '#10b981',
    isAds: false, page: 'Vienchibao Japan',
    gender: 'Nam', phone: '+81 80 9876 5432', isReturning: true, lastPurchase: '01/05/2026',
    source: 'Tự nhiên (Organic)',
    tags: ['Nước ngoài', 'Mua quà tặng'],
    customTags: ['Nhật Bản', 'Hài lòng cao'],
    sentiment: { positive: 95, neutral: 5, negative: 0 },
    qa: {
      overall: 91, max: 100, label: 'Tốt',
      criteria: [
        { name: 'Chào hỏi', score: 19, max: 20 },
        { name: 'Khai thác nhu cầu', score: 17, max: 20 },
        { name: 'Tư vấn & giải đáp', score: 19, max: 20 },
        { name: 'Xử lý từ chối', score: 12, max: 20 },
        { name: 'Chăm sóc sau bán', score: 12, max: 20 },
        { name: 'Follow-up', score: 12, max: 20 },
        { name: 'Thời gian phản hồi', score: 19, max: 20 }
      ],
    },
    aiSummary: {
      customerSaid: ['Hỏi về việc gói quà tặng', 'Hỏi thời gian vận chuyển đến Tokyo, Nhật Bản'],
      goodPoints: ['Phản hồi bằng tiếng Nhật lịch sự, chuyên nghiệp, sử dụng Keigo tốt', 'Tư vấn rõ ràng chính xác về đơn vị vận chuyển Yamato và cam kết thời gian đóng gói'],
      badPoints: [],
      suggestions: ['Gửi kèm thư cảm ơn viết tay bằng tiếng Nhật bên trong hộp quà'],
    },
    customerKeywords: ['Gói quà miễn phí', 'Ship Tokyo Yamato', 'Keigo Japanese', 'Premium box'],
    interestedProducts: ['Hộp quà cao cấp', 'Nhẫn bạc chế tác'],
    suggestedReplies: [
      `"佐藤様、プレゼント用の手書きメッセージカードを添えて発送させていただきます。ぜひお任せください。🚚"`,
      `"Dạ shop có hỗ trợ ghi tay thiệp chúc bằng tiếng Nhật gửi kèm hộp quà cho anh Sato nhé."`
    ],
    internalNotes: [
      { id: 110, author: 'Auditor Hoàng Nam', time: '07:18 15/05/2026', text: 'Excellent Keigo usage. Japanese client is extremely pleased with the premium wrapping option.' }
    ],
    improvements: [],
    convInfo: { start: '15/05/2026 07:05', end: '15/05/2026 07:15', duration: '10 phút', msgCount: 4, status: 'Đã chốt đơn' },
    scoreHistory: [{ date: '01/05', score: 85 }, { date: '08/05', score: 88 }, { date: '15/05', score: 90 }, { date: '22/05', score: 91 }, { date: '31/05', score: 91 }],
    messages: [
      { id: 1, sender: 'customer', text: 'プレゼント用のラッピングは可能ですか？\nCó dịch vụ gói quà tặng không shop?', time: '07:05' },
      { id: 2, sender: 'agent', text: '佐藤様、お問い合わせありがとうございます！はい、高級感のあるオリジナルギフトボックスにリボンをかけてお届け可能です（無料サービス）🎁\nDạ chào anh Sato! Dạ được chứ ạ, shop tặng hộp quà cao cấp thắt nơ miễn phí cho anh ạ.', time: '07:08', score: 'good' },
      { id: 3, sender: 'customer', text: '素晴らしい！発送までどのくらいかかりますか？\nTuyệt vời! Gửi hàng mất bao lâu vậy shop?', time: '07:11' },
      { id: 4, sender: 'agent', text: 'ご注文後、通常1〜2日以内に発送いたします。東京へは発送後2日程度で到着予定です。ヤマト運輸で追跡番号付きでお送りします！🚚\nSau khi đặt hàng bên em gửi đi trong 1-2 ngày ạ. Dự kiến giao đến Tokyo sau 2 ngày qua Yamato.', time: '07:15', score: 'good' },
    ],
  },
  {
    id: 11, name: 'Maria Silva', flag: '🇪🇸', channel: 'Instagram',
    preview: 'Mi pedido no ha llegado...', time: '06:30', employee: 'Thành Đạt',
    score: 45, status: 'pending', avatarColor: '#ef4444',
    isAds: false, page: 'Vienchibao Global',
    gender: 'Nữ', phone: '+34 688 111 222', isReturning: false, lastPurchase: '-',
    source: 'Tự nhiên (Organic)',
    tags: ['Khiếu nại', 'Tư vấn tệ'],
    customTags: ['Tây Ban Nha', 'Đòi hoàn tiền', 'Chưa chốt đơn'],
    sentiment: { positive: 0, neutral: 10, negative: 90 },
    qa: {
      overall: 45, max: 100, label: 'Cần cải thiện',
      criteria: [
        { name: 'Chào hỏi', score: 8, max: 20 },
        { name: 'Khai thác nhu cầu', score: 6, max: 20 },
        { name: 'Tư vấn & giải đáp', score: 10, max: 20 },
        { name: 'Xử lý từ chối', score: 7, max: 20 },
        { name: 'Chăm sóc sau bán', score: 7, max: 20 },
        { name: 'Follow-up', score: 7, max: 20 },
        { name: 'Thời gian phản hồi', score: 7, max: 20 }
      ],
    },
    aiSummary: {
      customerSaid: ['Đơn hàng #DH8839 đã đặt 2 tuần nhưng chưa nhận được', 'Yêu cầu hoàn tiền ngay lập tức'],
      goodPoints: [],
      badPoints: ['Thái độ vô trách nhiệm, đổ lỗi cho đơn vị bưu điện ("Đó là lỗi của bưu điện chứ không phải lỗi của chúng tôi")', 'Tuyên bố lạnh lùng không hoàn tiền mà không có phương án đền bù hay hỗ trợ kiểm tra', 'Lời chào hỏi ban đầu cực kỳ cộc lốc và thiếu tôn trọng khách hàng khi đang gặp sự cố'],
      suggestions: ['Liên hệ xin lỗi khẩn cấp, tặng voucher giảm giá 50%', 'Chủ động check bưu điện quốc tế hoặc gửi lại đơn thay thế miễn phí cho khách'],
    },
    customerKeywords: ['Pedido no ha llegado', 'Quiero mi dinero', 'Đòi hoàn tiền', 'Đổ lỗi bưu điện'],
    interestedProducts: ['Đơn hàng #DH8839 đã mất'],
    suggestedReplies: [
      `"Hola Maria, le pedimos sinceras disculpas por este gran inconveniente. Vamos a verificar inmediatamente con el correo y, si el paquete está perdido, le enviaremos otro sin costo o le devolveremos su dinero. 🌹"`,
      `"Dạ em xin lỗi chị Maria nhiều ạ. Em sẽ kiểm tra gấp bưu điện quốc tế, nếu bị thất lạc bên em cam kết hoàn tiền 100% cho chị ngay ạ."`
    ],
    internalNotes: [
      { id: 111, author: 'Auditor Thành Đạt', time: '06:35 15/05/2026', text: 'Thái độ vô trách nhiệm, đổ lỗi cho đơn vị bưu điện. Cần kỷ luật nhân viên ngay.' }
    ],
    improvements: ['Thái độ vô trách nhiệm, đổ lỗi cho đơn vị vận chuyển', 'Tuyên bố không hỗ trợ hoàn tiền mà không kiểm tra'],
    convInfo: { start: '15/05/2026 06:20', end: '15/05/2026 06:30', duration: '10 phút', msgCount: 4, status: 'Cần xử lý gấp' },
    scoreHistory: [{ date: '01/05', score: 50 }, { date: '08/05', score: 55 }, { date: '15/05', score: 45 }, { date: '22/05', score: 48 }, { date: '31/05', score: 45 }],
    messages: [
      { id: 1, sender: 'customer', text: 'Mi pedido #DH8839 no ha llegado, ¿dónde está?\nĐơn hàng #DH8839 của tôi vẫn chưa tới, nó đang ở đâu rồi?', time: '06:20' },
      { id: 2, sender: 'agent', text: 'No lo sé, espere por favor.\nTôi không biết, vui lòng chờ đi.', time: '06:22', score: 'low' },
      { id: 3, sender: 'customer', text: 'Ya pasaron 2 semanas. ¡Quiero mi dinero de vuelta!\nĐã qua 2 tuần rồi. Tôi muốn hoàn lại tiền ngay!', time: '06:25' },
      { id: 4, sender: 'agent', text: 'No hacemos devoluciones. El problema es del correo, no de nosotros.\nBên em không hoàn tiền. Lỗi do bưu điện giao chậm chứ không phải do bên em.', time: '06:30', score: 'low' },
    ],
  },
  {
    id: 12, name: 'Putri Indah', flag: '🇮🇩', channel: 'Messenger',
    preview: 'Apakah kalung perak ini hypoallergenic?', time: '06:12', employee: 'Phương Linh',
    score: 90, status: 'reviewed', avatarColor: '#10b981',
    isAds: true, page: 'Vienchibao Indonesia',
    gender: 'Nữ', phone: '+62 819 8888 7777', isReturning: true, lastPurchase: '15/04/2026',
    source: 'Facebook Ads - Indonesia Retarget',
    tags: ['Nước ngoài', 'Da nhạy cảm'],
    customTags: ['Indonesia', 'Hỏi chất liệu'],
    sentiment: { positive: 90, neutral: 10, negative: 0 },
    qa: {
      overall: 90, max: 100, label: 'Tốt',
      criteria: [
        { name: 'Chào hỏi', score: 18, max: 20 },
        { name: 'Khai thác nhu cầu', score: 18, max: 20 },
        { name: 'Tư vấn & giải đáp', score: 19, max: 20 },
        { name: 'Xử lý từ chối', score: 12, max: 20 },
        { name: 'Chăm sóc sau bán', score: 12, max: 20 },
        { name: 'Follow-up', score: 11, max: 20 },
        { name: 'Thời gian phản hồi', score: 18, max: 20 }
      ],
    },
    aiSummary: {
      customerSaid: ['Hỏi dây chuyền bạc có gây dị ứng cho da nhạy cảm không', 'Quyết định mua ngay sau khi được tư vấn chu đáo'],
      goodPoints: ['Tư vấn chất liệu bạc 925 tinh khiết không chứa niken cực kỳ chi tiết', 'Tạo lòng tin cao bằng cách dẫn chứng trải nghiệm thực tế của các khách hàng cũ có da nhạy cảm', 'Quy trình tạo đơn hàng nhanh gọn, thân thiện'],
      badPoints: [],
      suggestions: ['Khuyên khách hàng cách vệ sinh dây chuyền định kỳ để giữ lớp sáng bóng'],
    },
    customerKeywords: ['Hypoallergenic', 'Kulit sensitif', 'Bebas nikel', 'Da nhạy cảm'],
    interestedProducts: ['Kalung perak 925 murni'],
    suggestedReplies: [
      `"Iya Kak Putri, kalung perak kami hypoallergenic 100% bebas nikel, dijamin sangat aman untuk kulit sensitif kak. ❤️"`,
      `"Kak, ini tips merawat perak agar tetap berkilau indah ya."`
    ],
    internalNotes: [
      { id: 112, author: 'Auditor Phương Linh', time: '06:15 15/05/2026', text: 'Tư vấn chất liệu chuyên nghiệp, chốt đơn rất mượt qua chat.' }
    ],
    improvements: [],
    convInfo: { start: '15/05/2026 06:00', end: '15/05/2026 06:12', duration: '12 phút', msgCount: 4, status: 'Đã chốt đơn' },
    scoreHistory: [{ date: '01/05', score: 85 }, { date: '08/05', score: 87 }, { date: '15/05', score: 89 }, { date: '22/05', score: 90 }, { date: '31/05', score: 90 }],
    messages: [
      { id: 1, sender: 'customer', text: 'Apakah kalung perak ini hypoallergenic? Kulit saya sangat sensitif.\nDây chuyền bạc này có chống dị ứng da không vậy shop? Da mình rất nhạy cảm.', time: '06:00' },
      { id: 2, sender: 'agent', text: 'Halo Kak Putri! Iya kak, kalung kami terbuat dari Bạc 925 murni bebas nikel, aman sekali untuk kulit sensitif. Nhiều khách da nhạy cảm đều đeo rất thoải mái ạ. 😊', time: '06:04', score: 'good' },
      { id: 3, sender: 'customer', text: 'Bagus sekali. Saya mau beli 1 ya. Kirim ke Jakarta.\nTuyệt quá. Mình lấy 1 chiếc nhé. Gửi về Jakarta giúp mình.', time: '06:08' },
      { id: 4, sender: 'agent', text: 'Siap Kak! Untuk kalungnya ready stok ya kak. Kami kemas hari này cũng thế. Silakan gửi tên và địa chỉ của bạn để bên em gửi hàng nhé! ❤️', time: '06:12', score: 'good' },
    ],
  }
];

// ─────────────────────────────────────────
// PROGRAMMATIC MOCKUP DATA GENERATOR (to reach exactly 30)
// ─────────────────────────────────────────
const firstNames = ['Somchai', 'John', 'Hanako', 'Miguel', 'Bambang', 'Lê Minh', 'Nguyễn Thị', 'Chatchai', 'Takashi', 'Sofia', 'Sri', 'Thanh Thảo', 'Hoàng', 'Minh', 'David', 'Laura', 'Budi', 'Anya'];
const lastNames = ['K.', 'Doe', 'S.', 'A.', 'H.', 'Tuấn', 'Hà', 'P.', 'Y.', 'R.', 'Wahyuni', 'Vân', 'Anh', 'Khánh', 'Smith', 'Martinez', 'Santoso', 'Taylor'];
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

const generatedConversations = Array.from({ length: 18 }, (_, idx) => {
  const id = idx + 13;
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
    { id: 1, sender: 'customer', text: customerTexts[flag], time: '08:00' },
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
    { id: 200 + idx, author: 'AI Audit Bot', time: '08:15 15/05/2026', text: 'Thời gian phản hồi trễ quá quy định (SLA > 5p). Cần chấn chỉnh.' }
  ] : [];

  return {
    id,
    name,
    flag,
    channel,
    preview: previews[flag],
    time: `08:${10 + idx}`,
    employee,
    score,
    status,
    avatarColor: idx % 3 === 0 ? '#ec4899' : idx % 3 === 1 ? '#10b981' : '#6366f1',
    isAds,
    page,
    gender: idx % 2 === 0 ? 'Nam' : 'Nữ',
    phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
    isReturning: idx % 3 === 0,
    lastPurchase: idx % 3 === 0 ? '12/05/2026' : '-',
    source,
    tags: [isAds ? 'Quảng cáo' : 'Tự nhiên', score >= 85 ? 'Điểm tốt' : 'Điểm thấp'],
    customTags: ['Mockup', 'Chưa chốt đơn'],
    sentiment: {
      positive: score >= 85 ? 80 : score >= 70 ? 50 : 20,
      neutral: score >= 85 ? 15 : score >= 70 ? 30 : 30,
      negative: score >= 85 ? 5 : score >= 70 ? 20 : 50
    },
    qa: {
      overall: score,
      max: 100,
      label,
      criteria: [
        { name: 'Chào hỏi', score: c1, max: 20 },
        { name: 'Khai thác nhu cầu', score: c2, max: 20 },
        { name: 'Tư vấn & giải đáp', score: c3, max: 20 },
        { name: 'Xử lý từ chối', score: c4, max: 20 },
        { name: 'Chăm sóc sau bán', score: c5, max: 20 },
        { name: 'Follow-up', score: c6, max: 20 },
        { name: 'Thời gian phản hồi', score: c7, max: 20 }
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
      end: `15/05/2026 08:${10 + idx}`,
      duration: '2 phút',
      msgCount: 2,
      status: score >= 85 ? 'Đã hoàn thành' : 'Chưa chốt đơn'
    },
    scoreHistory: [
      { date: '01/05', score: score - 15 },
      { date: '08/05', score: score - 5 },
      { date: '15/05', score: score + 5 },
      { date: '22/05', score: score - 8 },
      { date: '31/05', score: score }
    ],
    messages
  };
});

const allConversations = [...detailedConversations, ...generatedConversations];

// ── KPI data ──
const qualityKPIs = [
  { label: 'QA Score trung bình', value: '85', unit: '/100', change: '↑ 6.2 điểm', changeType: 'up', sub: 'so với tháng trước', bg: '#e0f2fe' },
  { label: 'CSAT (Hài lòng)', value: '92%', change: '↑ 5%', changeType: 'up', sub: 'vs 87%', bg: '#fffbeb' },
  { label: 'Tỷ lệ phản hồi đúng chuẩn', value: '94%', change: '↑ 4%', changeType: 'up', sub: 'vs 90%', bg: '#f3e8fd' },
  { label: 'Tỷ lệ bỏ sót khách', value: '3.2%', change: '↓ 1.1%', changeType: 'down', sub: 'vs 4.3%', bg: '#fee2e2' },
  { label: 'Tỷ lệ follow-up', value: '78%', change: '↑ 6%', changeType: 'up', sub: 'vs 72%', bg: '#e2fbf0' },
  { label: 'Tỷ lệ khách tiêu cực', value: '6%', change: '↓ 2%', changeType: 'down', sub: 'vs 8%', bg: '#fee2e2' },
  { label: 'Tỷ lệ chốt', value: '28.6%', change: '↑ 4.1%', changeType: 'up', sub: 'vs 24.5%', bg: '#eff6ff' },
];

// ─────────────────────────────────────────
// LEFT: Conversation list with filters (continuous scroll styled)
// ─────────────────────────────────────────
function QualityConvList({ activeId, onSelect, conversations }) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [adsOnly, setAdsOnly] = useState(false);

  const tabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ đánh giá', count: conversations.filter(c => c.status === 'pending').length },
    { key: 'high', label: 'Điểm cao', count: conversations.filter(c => c.score >= 85).length },
    { key: 'medium', label: 'Trung bình', count: conversations.filter(c => c.score >= 70 && c.score < 85).length },
    { key: 'low', label: 'Điểm thấp', count: conversations.filter(c => c.score < 70).length },
    { key: 'need_action', label: 'Cần xử lý', count: conversations.filter(c => c.score < 70 || c.status === 'pending' || c.tags.includes('Khiếu nại')).length },
  ];

  const filtered = conversations.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.employee.toLowerCase().includes(search.toLowerCase())) return false;
    if (adsOnly && !c.isAds) return false;
    
    if (tab === 'pending') return c.status === 'pending';
    if (tab === 'high') return c.score >= 85;
    if (tab === 'medium') return c.score >= 70 && c.score < 85;
    if (tab === 'low') return c.score < 70;
    if (tab === 'need_action') {
      return c.score < 70 || c.status === 'pending' || c.tags.includes('Khiếu nại') || c.customTags.includes('Cần xử lý');
    }
    return true;
  });

  return (
    <div className="conv-panel" style={{ height: '100%', width: '100%' }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--n-100)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--n-900)' }}>Danh sách hội thoại</div>
            <div style={{ fontSize: '11px', color: 'var(--n-400)' }}>2.582 hội thoại</div>
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button className="chat-action-btn"><Star size={14} /></button>
            <button className="chat-action-btn"><Sliders size={14} /></button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'var(--n-50)', border: '1px solid var(--n-200)', borderRadius: '8px' }}>
          <MagnifyingGlass size={13} style={{ color: 'var(--n-400)', flexShrink: 0 }} />
          <input placeholder="Tìm kiếm hội thoại, khách hàng..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', fontSize: '12px', color: 'var(--n-700)' }} />
        </div>
        {/* Ads filter toggle */}
        <div style={{ marginTop: '6px', display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button onClick={() => setAdsOnly(!adsOnly)} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 150ms',
            background: adsOnly ? '#a855f7' : 'var(--n-50)',
            color: adsOnly ? '#fff' : 'var(--n-500)',
            border: adsOnly ? '1px solid #a855f7' : '1px solid var(--n-200)',
          }}>
            <Megaphone size={10} />
            Chỉ Ads
          </button>
          {adsOnly && (
            <span style={{ fontSize: '10px', color: 'var(--n-400)' }}>
              {conversations.filter(c => c.isAds).length} QC
            </span>
          )}
        </div>
      </div>

      {/* Tabs list (Modern pill style, flex wrapped for 280px sidebar) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '8px', borderBottom: '1px solid var(--n-100)', flexShrink: 0, background: 'var(--n-50)' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '4px 8px', borderRadius: '6px', cursor: 'pointer',
            transition: 'all 150ms ease', fontSize: '11px',
            background: tab === t.key ? 'var(--primary-600)' : 'transparent',
            color: tab === t.key ? '#fff' : 'var(--n-600)',
            fontWeight: tab === t.key ? 600 : 500,
            border: tab === t.key ? '1px solid var(--primary-600)' : '1px solid transparent',
          }}>
            {t.label}{t.count != null ? ` (${t.count})` : ''}
          </button>
        ))}
      </div>

      {/* List Container with scroll vertical */}
      <div className="conv-items" style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.map(c => {
          const isActive = activeId === c.id;
          const scoreColor = getScoreColor(c.score);
          
          // Style whole conversation item container based on QA score to draw attention as requested!
          const itemStyle = {
            borderLeft: isActive 
              ? '4px solid var(--primary-600)' 
              : `4px solid ${scoreColor}`,
            background: isActive
              ? '#eff6ff' // Selected soft blue background
              : c.score >= 85
                ? '#ffffff' // High score clean white
                : c.score >= 70
                  ? '#fffbeb' // Medium score soft yellow
                  : '#fef2f2', // Low score soft red
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
                <div style={{
                  position: 'absolute', bottom: -3, right: -3,
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: scoreColor,
                  color: '#fff', fontSize: '9px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid white',
                }}>
                  {c.score}
                </div>
              </div>
              <div className="conv-item-content">
                <div className="conv-item-top">
                  <span className="conv-item-name" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', fontWeight: 600 }}>
                    {c.name} {c.flag}
                    {c.isAds && (
                      <span style={{
                        fontSize: '9px', fontWeight: 700, padding: '1px 4px',
                        background: '#a855f7', color: '#fff', borderRadius: '3px',
                        lineHeight: 1.3,
                      }}>Ads</span>
                    )}
                  </span>
                  <span className="conv-item-time" style={{ fontSize: '10px' }}>{c.time}</span>
                </div>
                <div style={{ fontSize: '10.5px', color: 'var(--n-400)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                  {c.channel}
                  <span style={{ color: 'var(--n-300)' }}>•</span>
                  <span style={{ color: 'var(--primary-500)', fontWeight: 500 }}>{c.page}</span>
                </div>
                <div className="conv-item-preview" style={{ fontSize: '11.5px' }}>{c.preview}</div>
                <div style={{ fontSize: '10.5px', color: 'var(--n-400)', marginTop: '2px' }}>
                  👤 {c.employee}
                </div>
                {c.tags && (
                  <div className="conv-item-badges" style={{ marginTop: '3px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {c.tags.slice(0, 2).map((b, i) => {
                      const tagStyle = getTagStyle(b);
                      return (
                        <span key={i} className="tag" style={{
                          fontSize: '9.5px', padding: '2px 6px', borderRadius: '4px',
                          background: tagStyle.bg, color: tagStyle.color, fontWeight: 700
                        }}>{b}</span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Continuous Scroll Mock Indicator */}
        <div style={{
          padding: '14px 10px',
          borderTop: '1px solid var(--n-100)',
          background: 'var(--n-50)',
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--n-400)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <ArrowsCounterClockwise size={12} className="anim-spin" style={{ color: 'var(--primary-500)' }} />
            <span>Hiển thị {filtered.length} / 2.582 hội thoại</span>
          </div>
          <span style={{ fontSize: '9.5px', color: 'var(--n-400)' }}>Cuộn xuống để tự động tải thêm</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MIDDLE: Chat panel (tighter, smaller bubbles, color-coded agent bubble scores)
// ─────────────────────────────────────────
function QualityChatPanel({ conv }) {
  const messagesRef = useRef(null);
  const [noteTab, setNoteTab] = useState('note');

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [conv.id]);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button className="chat-action-btn"><Star size={15} /></button>
          <button className="chat-action-btn"><Sliders size={15} /></button>
          <button className="chat-action-btn"><DotsThree size={15} /></button>
        </div>
      </div>

      {/* Customer info bar */}
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

      {/* Messages dialogue box (Tighter padding & font sizing) */}
      <div className="chat-messages" ref={messagesRef} style={{ background: '#f8fafc', padding: '12px 14px', gap: '10px', overflowY: 'auto', flex: 1 }}>
        {conv.messages.map(msg => {
          if (msg.product) {
            return (
              <div key={msg.id} style={{ alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
                <span className="chat-system-msg">{msg.text}</span>
                <div style={{ background: 'white', border: '1px solid var(--n-200)', borderRadius: '12px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '10px', maxWidth: '280px', boxShadow: '0 1px 3px rgba(0,0,0,.03)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '8px', background: 'var(--n-50)', border: '1px solid var(--n-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Diamond size={20} weight="duotone" style={{ color: 'var(--warning-500)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--n-800)', marginBottom: '2px' }}>{msg.product.name}</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--danger-500)' }}>{msg.product.price}</div>
                  </div>
                  <button style={{ padding: '4px 8px', background: 'var(--primary-50)', color: 'var(--primary-600)', borderRadius: '6px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--primary-200)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Xem chi tiết
                  </button>
                </div>
              </div>
            );
          }

          const isAgent = msg.sender === 'agent';
          
          let bubbleStyle = {
            padding: '6px 10px',
            borderRadius: '12px',
            fontSize: '12.5px',
            lineHeight: '1.45',
            whiteSpace: 'pre-line',
            position: 'relative',
            transition: 'all 150ms ease'
          };

          let badge = null;

          if (isAgent) {
            if (msg.score === 'good') {
              bubbleStyle = {
                ...bubbleStyle,
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
                borderBottomRightRadius: '2px'
              };
              badge = (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9.5px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 5px', borderRadius: '4px' }}>
                  <CheckCircle size={10} weight="fill" /> Đạt chuẩn
                </span>
              );
            } else if (msg.score === 'medium') {
              bubbleStyle = {
                ...bubbleStyle,
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                color: '#92400e',
                borderBottomRightRadius: '2px'
              };
              badge = (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9.5px', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '1px 5px', borderRadius: '4px' }}>
                  <Warning size={10} weight="fill" /> Trung bình
                </span>
              );
            } else if (msg.score === 'low') {
              bubbleStyle = {
                ...bubbleStyle,
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#991b1b',
                borderBottomRightRadius: '2px'
              };
              badge = (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9.5px', fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '1px 5px', borderRadius: '4px' }}>
                  <Warning size={10} weight="fill" /> Cần xử lý
                </span>
              );
            } else {
              bubbleStyle = {
                ...bubbleStyle,
                background: 'linear-gradient(135deg, var(--primary-600), var(--primary-500))',
                color: '#fff',
                borderBottomRightRadius: '2px'
              };
            }
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
                {msg.text}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: isAgent ? 'flex-end' : 'flex-start', gap: '6px', padding: '0 2px' }}>
                {badge}
                <span className="chat-time" style={{ fontSize: '10px', color: 'var(--n-400)', marginTop: 0 }}>{msg.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom: Internal Notes for agent */}
      <div style={{ borderTop: '1px solid var(--n-100)', flexShrink: 0 }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--n-100)' }}>
          {[{ id: 'note', label: 'Ghi chú nội bộ' }, { id: 'order', label: 'Thông tin đơn hàng' }].map(t => (
            <button key={t.id} onClick={() => setNoteTab(t.id)} style={{
              padding: '8px 16px', fontSize: '12px', fontWeight: noteTab === t.id ? 600 : 500,
              color: noteTab === t.id ? 'var(--primary-600)' : 'var(--n-500)',
              borderBottom: noteTab === t.id ? '2px solid var(--primary-600)' : '2px solid transparent',
              cursor: 'pointer',
            }}>
              {t.label}
            </button>
          ))}
        </div>
        <div style={{ padding: '8px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input placeholder="Nhập ghi chú... (chỉ nhân viên nội bộ xem được)"
              style={{ flex: 1, fontSize: '12px', color: 'var(--n-700)', padding: '6px 10px', background: 'var(--n-50)', border: '1px solid var(--n-200)', borderRadius: '8px' }} />
            <button style={{ padding: '6px 14px', background: 'var(--primary-600)', color: '#fff', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Lưu
            </button>
          </div>
        </div>
        <div style={{ padding: '4px 14px 8px', display: 'flex', gap: '2px' }}>
          {[Smiley, FileText, Image, Paperclip, Tag, BookOpen].map((Icon, i) => (
            <button key={i} className="chat-input-icon"><Icon /></button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// RIGHT: AI quality panel (Exactly identical 2 vertical columns of cards side-by-side)
// ─────────────────────────────────────────
function QualityRightPanel({ conv, onUpdateTags, onAddNote }) {
  const [anim, setAnim] = useState(false);
  const [addingTag, setAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [localNoteText, setLocalNoteText] = useState('');
  
  useEffect(() => { setAnim(false); setTimeout(() => setAnim(true), 100); }, [conv.id]);

  const qs = conv.qa;
  const r = 34;
  const circ = 2 * Math.PI * r;
  const pct = qs.overall / qs.max;
  const scoreColor = getScoreColor(qs.overall);

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

  const submitNote = () => {
    if (localNoteText.trim()) {
      onAddNote(conv.id, localNoteText.trim());
      setLocalNoteText('');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px', height: '100%', width: '100%', overflowY: 'auto', paddingRight: '4px' }}>
      
      {/* LEFT COLUMN OF CARDS */}
      <div style={{ flex: 1.1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
        
        {/* Card 1: AI Chấm điểm hội thoại */}
        <div className="rp-card" style={{ background: '#fff', border: '1px solid var(--n-200)', borderRadius: '16px', padding: '14px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e3a8a', marginBottom: '12px' }}>
            AI Chấm điểm hội thoại
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
            {/* Gauge on left */}
            <div style={{ position: 'relative', width: 84, height: 84, flexShrink: 0 }}>
              <svg width="84" height="84" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="42" cy="42" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
                <circle cx="42" cy="42" r={r} fill="none" stroke={scoreColor} strokeWidth="7"
                  strokeLinecap="round" strokeDasharray={circ}
                  strokeDashoffset={anim ? circ - pct * circ : circ}
                  style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
                  <span style={{ fontSize: '21px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{qs.overall}</span>
                  <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--n-400)' }}>/{qs.max}</span>
                </div>
                <span style={{
                  fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '99px', marginTop: '2px',
                  background: qs.overall >= 85 ? '#dcfce7' : qs.overall >= 70 ? '#ffedd5' : '#fee2e2',
                  color: qs.overall >= 85 ? '#15803d' : qs.overall >= 70 ? '#b45309' : '#b91c1c',
                  whiteSpace: 'nowrap'
                }}>{qs.label}</span>
              </div>
            </div>
            
            {/* Criteria list on right with score color-coding (Good -> green, Medium -> orange, Low -> red) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {qs.criteria.map((cr, i) => {
                const criteriaPct = cr.score / cr.max;
                const crColor = criteriaPct >= 0.85 
                  ? '#16a34a' // Green for Good
                  : criteriaPct >= 0.70 
                    ? '#d97706' // Orange for Medium
                    : '#dc2626'; // Red for Low

                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                    <span style={{ color: '#475569', fontWeight: 500 }}>{cr.name}</span>
                    <span style={{ fontWeight: 700, color: crColor }}>{cr.score}/{cr.max}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Cần cải thiện box */}
          <div style={{
            background: qs.overall >= 85 ? '#f0fdf4' : '#fffbeb',
            border: qs.overall >= 85 ? '1px solid #bbf7d0' : '1px solid #fef3c7',
            borderRadius: '10px', padding: '10px 12px', display: 'flex', gap: '8px', alignItems: 'flex-start'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '18px', height: '18px', borderRadius: '50%',
              background: qs.overall >= 85 ? '#dcfce7' : '#ffedd5', flexShrink: 0
            }}>
              {qs.overall >= 85 ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v10" />
                  <path d="M12 16v.01" />
                </svg>
              )}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: qs.overall >= 85 ? '#15803d' : '#b45309', marginBottom: '4px' }}>
                {qs.overall >= 85 ? 'Đạt chuẩn' : 'Cần cải thiện'}
              </div>
              <ul style={{ paddingLeft: '12px', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {conv.improvements && conv.improvements.map((pt, idx) => (
                  <li key={idx} style={{ fontSize: '11.5px', color: qs.overall >= 85 ? '#16a34a' : '#b45309', listStyleType: 'disc', lineHeight: 1.4 }}>{pt}</li>
                ))}
                {(!conv.improvements || conv.improvements.length === 0) && (
                  <li style={{ fontSize: '11.5px', color: '#16a34a', listStyleType: 'none', marginLeft: '-12px' }}>✓ Nhân viên đã thực hiện rất tốt các quy chuẩn!</li>
                )}
              </ul>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <span className="card-link" style={{ fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600, color: '#2563eb' }}>
              Xem chi tiết chấm điểm <ArrowRight size={11} />
            </span>
          </div>
        </div>

        {/* Card 2: AI Tóm tắt & đánh giá (Expanded with Keywords, Products & Suggested Replies) */}
        <div className="rp-card" style={{ background: '#fff', border: '1px solid var(--n-200)', borderRadius: '16px', padding: '14px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e3a8a' }}>AI Tóm tắt & đánh giá</div>
          
          {/* Customer Keywords & Products Row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px dashed var(--n-200)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--n-500)', marginRight: '4px' }}>Từ khóa:</span>
              {conv.customerKeywords && conv.customerKeywords.map((kw, i) => (
                <span key={i} style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, background: '#f0f9ff', color: '#0369a1', borderRadius: '4px' }}>#{kw}</span>
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--n-500)', marginRight: '4px' }}>Sản phẩm:</span>
              {conv.interestedProducts && conv.interestedProducts.map((p, i) => (
                <span key={i} style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, background: '#f0fdf4', color: '#15803d', borderRadius: '4px' }}>{p}</span>
              ))}
            </div>
          </div>

          {/* Khách hàng nói gì */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', marginBottom: '6px' }}>
              Khách hàng nói gì?
            </div>
            <ul style={{ paddingLeft: '14px', margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {conv.aiSummary.customerSaid.map((item, i) => (
                <li key={i} style={{ fontSize: '11.5px', color: '#334155', lineHeight: 1.4, listStyleType: 'disc' }}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Nhân viên đã làm tốt */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#15803d', marginBottom: '6px' }}>
              Nhân viên đã làm tốt
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {conv.aiSummary.goodPoints.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11.5px', color: '#334155', lineHeight: 1.4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2.5px', flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chưa đạt */}
          {conv.aiSummary.badPoints && conv.aiSummary.badPoints.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', marginBottom: '6px' }}>
                Chưa đạt
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {conv.aiSummary.badPoints.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11.5px', color: '#334155', lineHeight: 1.4 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2.5px', flexShrink: 0 }}>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Gợi ý xử lý tốt hơn */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--n-200)', borderRadius: '10px', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#1e3a8a', marginBottom: '2px' }}>
              AI Gợi ý xử lý tốt hơn
            </div>
            <ol style={{ paddingLeft: '14px', margin: 0, marginBottom: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {conv.aiSummary.suggestions.map((item, i) => (
                <li key={i} style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>{item}</li>
              ))}
            </ol>
            
            {/* Suggested Sample Replies for Agent as requested! */}
            <div style={{ background: '#f3e8fd', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b21a8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lightbulb size={12} weight="fill" style={{ color: '#a855f7' }} /> Gợi ý câu trả lời mẫu
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {conv.suggestedReplies && conv.suggestedReplies.map((reply, i) => (
                  <div key={i} style={{
                    fontSize: '11px', color: '#581c87', fontStyle: 'italic', background: 'rgba(255,255,255,0.7)',
                    padding: '6px 8px', borderRadius: '6px', borderLeft: '3px solid #a855f7', lineHeight: 1.4
                  }}>
                    {reply}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <button style={{
                padding: '6px 14px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                borderRadius: '6px', fontSize: '10.5px', fontWeight: 700, cursor: 'pointer',
                transition: 'all 150ms'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; }}>
                Kịch bản gợi ý
              </button>
              <span className="card-link" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600, color: '#2563eb' }}>
                Xem kịch bản mẫu <ArrowRight size={11} />
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Thông tin hội thoại */}
        <div className="rp-card" style={{ background: '#fff', border: '1px solid var(--n-200)', borderRadius: '16px', padding: '14px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e3a8a', marginBottom: '10px' }}>Thông tin hội thoại</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              ['Thời gian bắt đầu', conv.convInfo.start],
              ['Thời gian kết thúc', conv.convInfo.end],
              ['Tổng thời gian', conv.convInfo.duration],
              ['Số tin nhắn', conv.convInfo.msgCount],
              ['Trạng thái', conv.convInfo.status],
              ['Nhân viên xử lý', conv.employee],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', fontSize: '11.5px', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--n-500)', fontWeight: 500 }}>{k}</span>
                {k === 'Nhân viên xử lý' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#2563eb', color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {v.charAt(0)}
                    </div>
                    <span style={{ color: '#1e293b', fontWeight: 700 }}>{v}</span>
                  </div>
                ) : k === 'Trạng thái' ? (
                  <span style={{
                    fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                    background: v === 'Chưa chốt đơn' ? '#fff3e0' : '#e8f5e9',
                    color: v === 'Chưa chốt đơn' ? '#ef6c00' : '#2e7d32'
                  }}>{v}</span>
                ) : (
                  <span style={{ color: '#1e293b', fontWeight: 700 }}>{v}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* RIGHT COLUMN OF CARDS */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
        
        {/* Card 1: Lịch sử điểm chất lượng */}
        <div className="rp-card" style={{ background: '#fff', border: '1px solid var(--n-200)', borderRadius: '16px', padding: '14px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e3a8a', marginBottom: '12px' }}>
            Lịch sử điểm chất lượng
          </div>
          <div style={{ margin: '12px 0 6px', display: 'flex', justifyContent: 'center' }}>
            <svg width="100%" height={90} viewBox="0 0 220 90" style={{ overflow: 'visible' }}>
              {/* Y-axis gridlines & labels */}
              <line x1="25" y1="15" x2="210" y2="15" stroke="var(--n-200)" strokeWidth="0.5" strokeDasharray="3 3" />
              <text x="15" y="18" textAnchor="end" fontSize="7" fontWeight="600" fill="var(--n-400)">100</text>
              
              <line x1="25" y1="45" x2="210" y2="45" stroke="var(--n-200)" strokeWidth="0.5" strokeDasharray="3 3" />
              <text x="15" y="48" textAnchor="end" fontSize="7" fontWeight="600" fill="var(--n-400)">50</text>
              
              <line x1="25" y1="75" x2="210" y2="75" stroke="var(--n-200)" strokeWidth="0.5" />
              <text x="15" y="78" textAnchor="end" fontSize="7" fontWeight="600" fill="var(--n-400)">0</text>
              
              {/* Line graph paths */}
              <path d="M 40,45 L 80,31.8 L 120,48 L 160,33 L 200,39" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              
              {[
                { x: 40, y: 45, date: '01/05', score: 50 },
                { x: 80, y: 31.8, date: '08/05', score: 72 },
                { x: 120, y: 48, date: '15/05', score: 45 },
                { x: 160, y: 33, date: '22/05', score: 70 },
                { x: 200, y: 39, date: '31/05', score: 60 },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="3" fill="#2563eb" stroke="white" strokeWidth="1" />
                  <text x={pt.x} y={87} textAnchor="middle" fontSize="7" fontWeight="600" fill="var(--n-500)">{pt.date}</text>
                </g>
              ))}
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '8px' }}>
            <span className="card-link" style={{ fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600, color: '#2563eb' }}>
              Xem chi tiết lịch sử <ArrowRight size={11} />
            </span>
          </div>
        </div>

        {/* Card 2: Cảm xúc của khách */}
        <div className="rp-card" style={{ background: '#fff', border: '1px solid var(--n-200)', borderRadius: '16px', padding: '14px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e3a8a', marginBottom: '10px' }}>Cảm xúc của khách</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '6px 0 10px' }}>
            {[
              { label: 'Tích cực', pct: conv.sentiment.positive, fill: '#dcfce7', stroke: '#16a34a' },
              { label: 'Trung tính', pct: conv.sentiment.neutral, fill: '#fef3c7', stroke: '#d97706' },
              { label: 'Tiêu cực', pct: conv.sentiment.negative, fill: '#fee2e2', stroke: '#dc2626' },
            ].map((s, i) => {
              let emojiSvg = null;
              if (i === 0) {
                emojiSvg = (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" fill={s.fill} stroke={s.stroke} strokeWidth="1.5" />
                    <circle cx="8.5" cy="10" r="1.2" fill={s.stroke} />
                    <circle cx="15.5" cy="10" r="1.2" fill={s.stroke} />
                    <path d="M7.5 14 C 9 16.5, 15 16.5, 16.5 14" stroke={s.stroke} strokeWidth="2" strokeLinecap="round" fill="none" />
                  </svg>
                );
              } else if (i === 1) {
                emojiSvg = (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" fill={s.fill} stroke={s.stroke} strokeWidth="1.5" />
                    <circle cx="8.5" cy="10" r="1.2" fill={s.stroke} />
                    <circle cx="15.5" cy="10" r="1.2" fill={s.stroke} />
                    <line x1="8" y1="15" x2="16" y2="15" stroke={s.stroke} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                );
              } else {
                emojiSvg = (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" fill={s.fill} stroke={s.stroke} strokeWidth="1.5" />
                    <circle cx="8.5" cy="11" r="1.2" fill={s.stroke} />
                    <circle cx="15.5" cy="11" r="1.2" fill={s.stroke} />
                    <path d="M8 8.5 L 9.5 9.5" stroke={s.stroke} strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M16 8.5 L 14.5 9.5" stroke={s.stroke} strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M16 16.5 C 14.5 15, 9.5 15, 8 16.5" stroke={s.stroke} strokeWidth="2" strokeLinecap="round" fill="none" />
                  </svg>
                );
              }

              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
                  {emojiSvg}
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{s.label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{s.pct}%</span>
                </div>
              );
            })}
          </div>
          <span className="card-link" style={{ fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600, color: '#2563eb' }}>
            Xem phân tích cảm xúc <ArrowRight size={11} />
          </span>
        </div>

        {/* Card 3: Nhãn hội thoại */}
        <div className="rp-card" style={{ background: '#fff', border: '1px solid var(--n-200)', borderRadius: '16px', padding: '14px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e3a8a', marginBottom: '10px' }}>Nhãn hội thoại</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {conv.tags.map((t, i) => {
              const tagStyle = getTagStyle(t);
              return (
                <span key={i} style={{
                  padding: '4px 10px', fontSize: '11px', fontWeight: 700, borderRadius: '8px',
                  background: tagStyle.bg, color: tagStyle.color
                }}>{t}</span>
              );
            })}
            {conv.customTags.map((t, i) => {
              const tagStyle = getTagStyle(t);
              return (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px',
                  background: tagStyle.bg, color: tagStyle.color, borderRadius: '8px',
                  fontSize: '11px', fontWeight: 700
                }}>
                  {t}
                  <button onClick={() => handleRemoveTag(t)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '12px', height: '12px', borderRadius: '50%', cursor: 'pointer',
                    background: tagStyle.color, color: '#fff', fontSize: '9px', padding: 0,
                    border: 'none', opacity: 0.8
                  }}>
                    <X size={6} />
                  </button>
                </span>
              );
            })}
          </div>
          
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
            <button onClick={() => setAddingTag(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', border: '1px dashed var(--n-300)', borderRadius: '8px', fontSize: '11px', color: '#2563eb', fontWeight: 700, cursor: 'pointer', background: 'transparent', transition: 'all 150ms' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--n-300)'; }}>
              <Plus size={11} /> Thêm nhãn
            </button>
          )}
        </div>

        {/* Card 4: Ghi chú nội bộ (Dedicated note area for Auditors in Right Panel as requested!) */}
        <div className="rp-card" style={{ background: '#fff', border: '1px solid var(--n-200)', borderRadius: '16px', padding: '14px', boxShadow: 'var(--shadow-card)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ClipboardText size={15} weight="fill" style={{ color: '#2563eb' }} />
            Ghi chú nội bộ (Auditor)
          </div>
          
          {/* Notes list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '110px', overflowY: 'auto', paddingRight: '2px' }}>
            {(!conv.internalNotes || conv.internalNotes.length === 0) ? (
              <span style={{ fontSize: '11.5px', color: 'var(--n-400)', fontStyle: 'italic', padding: '4px 0' }}>Chưa có ghi chú nội bộ cho hội thoại này.</span>
            ) : (
              conv.internalNotes.map(n => (
                <div key={n.id} style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', fontWeight: 700, color: '#b45309' }}>
                    <span>👤 {n.author}</span>
                    <span>{n.time}</span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#78350f', lineHeight: 1.3 }}>{n.text}</div>
                </div>
              ))
            )}
          </div>
          
          {/* Note Input */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <input
              placeholder="Thêm ghi chú đánh giá..."
              value={localNoteText}
              onChange={e => setLocalNoteText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitNote(); }}
              style={{
                flex: 1, fontSize: '11.5px', color: '#1e293b', padding: '6px 10px',
                background: '#f8fafc', border: '1px solid var(--n-200)', borderRadius: '8px'
              }}
            />
            <button
              onClick={submitNote}
              style={{
                padding: '6px 12px', background: '#2563eb', color: '#fff',
                borderRadius: '8px', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer',
                transition: 'opacity 150ms'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = 0.9}
              onMouseLeave={e => e.currentTarget.style.opacity = 1}
            >
              Lưu
            </button>
          </div>
        </div>

        {/* Card 5: Hành động */}
        <div className="rp-card" style={{ background: '#fff', border: '1px solid var(--n-200)', borderRadius: '16px', padding: '14px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e3a8a', marginBottom: '10px' }}>Hành động</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              {
                label: 'Gán cho nhân viên khác',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )
              },
              {
                label: 'Chuyển hội thoại',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m17 2 4 4-4 4" />
                    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
                    <path d="m7 22-4-4 4-4" />
                    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
                  </svg>
                )
              },
              {
                label: 'Tạo ticket hỗ trợ',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="6" y1="12" x2="18" y2="12" />
                    <line x1="6" y1="8" x2="10" y2="8" />
                  </svg>
                )
              },
              {
                label: 'Đánh dấu ưu tiên',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                )
              },
              {
                label: 'Báo cáo vấn đề',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                )
              }
            ].map((a, i) => (
              <button key={i} style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
                border: '1px solid var(--n-200)', borderRadius: '8px', cursor: 'pointer',
                background: 'white', fontSize: '12px', fontWeight: 600, color: '#1e293b',
                transition: 'all 150ms ease', width: '100%', justifyContent: 'flex-start'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.background = '#f0f9ff'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--n-200)'; e.currentTarget.style.background = 'white'; }}>
                {a.icon}
                <span>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Card 6: Tệp đính kèm */}
        <div className="rp-card" style={{ background: '#fff', border: '1px solid var(--n-200)', borderRadius: '16px', padding: '14px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e3a8a', marginBottom: '10px' }}>Tệp đính kèm</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '8px', background: '#f1f5f9', border: '1px solid var(--n-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="13" r="6" stroke="#64748b" strokeWidth="2" />
                  <circle cx="12" cy="13" r="6" stroke="#94a3b8" strokeWidth="1" />
                  <rect x="10" y="5" width="4" height="2.5" rx="0.5" fill="#3b82f6" stroke="#2563eb" strokeWidth="1" />
                  <circle cx="12" cy="6.2" r="1" fill="white" />
                </svg>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: '8px', background: '#cbd5e1', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                +2
              </div>
            </div>
            <span className="card-link" style={{ fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '2.5px', fontWeight: 600, color: '#2563eb' }}>
              Xem tất cả <ArrowRight size={11} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────
export default function QualityPage() {
  const [activeConv, setActiveConv] = useState(1);
  const [convData, setConvData] = useState(allConversations);
  const [anim, setAnim] = useState(false);
  useEffect(() => { setTimeout(() => setAnim(true), 120); }, []);

  const selectedConv = convData.find(c => c.id === activeConv) || convData[0];

  const handleUpdateTags = (convId, newTags) => {
    setConvData(prev => prev.map(c => c.id === convId ? { ...c, customTags: newTags } : c));
  };

  const handleAddNote = (convId, noteText) => {
    setConvData(prev => prev.map(c => c.id === convId ? {
      ...c,
      internalNotes: [
        ...(c.internalNotes || []),
        {
          id: Date.now(),
          author: 'Auditor Minh Anh',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString('vi-VN'),
          text: noteText
        }
      ]
    } : c));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .anim-spin {
          animation: spin 1.2s linear infinite;
        }
      `}</style>

      {/* KPI Row - exactly 7 columns in 1 row (with tiny SVG sparklines inside Card 1, 2, 3) */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', flexShrink: 0, gap: '10px' }}>
        {qualityKPIs.map((kpi, i) => {
          let sparkline = null;
          if (i === 0) {
            sparkline = (
              <svg width="45" height="25" style={{ overflow: 'visible', marginLeft: 'auto', flexShrink: 0 }}>
                <path d="M 0,18 L 10,10 L 20,20 L 30,8 L 45,3" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="45" cy="3" r="2.5" fill="#2563eb" />
              </svg>
            );
          } else if (i === 1) {
            sparkline = (
              <svg width="45" height="25" style={{ overflow: 'visible', marginLeft: 'auto', flexShrink: 0 }}>
                <path d="M 0,22 L 10,14 L 20,18 L 30,10 L 45,5" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="45" cy="5" r="2.5" fill="#16a34a" />
              </svg>
            );
          } else if (i === 2) {
            sparkline = (
              <svg width="45" height="25" style={{ overflow: 'visible', marginLeft: 'auto', flexShrink: 0 }}>
                <path d="M 0,20 L 10,24 L 20,12 L 30,18 L 45,8" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="45" cy="8" r="2.5" fill="#8b5cf6" />
              </svg>
            );
          }

          let iconContent = null;
          if (i === 0) {
            iconContent = (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 11 2 2 4-4" />
              </svg>
            );
          } else if (i === 1) {
            iconContent = (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            );
          } else if (i === 2) {
            iconContent = (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7" />
                <path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12" />
              </svg>
            );
          } else if (i === 3) {
            iconContent = (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            );
          } else if (i === 4) {
            iconContent = (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="6" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            );
          } else if (i === 5) {
            iconContent = (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                <path d="M9 10L7.5 9" />
                <path d="M15 10L16.5 9" />
              </svg>
            );
          } else {
            iconContent = (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            );
          }

          const isUp = kpi.change.includes('↑');
          const badgeColor = isUp ? '#16a34a' : '#dc2626';
          const badgeBg = isUp ? '#f0fdf4' : '#fef2f2';

          return (
            <div key={i} className="kpi-card" style={{
              flexDirection: 'row', alignItems: 'center', gap: '8px', padding: '12px 14px', borderRadius: '16px', minWidth: 0, height: '100%',
              background: '#fff', border: '1px solid var(--n-200)', boxShadow: 'var(--shadow-card)'
            }}>
              {/* Centered card content columns as requested! */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                {/* Title Row - Centered */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '6px', minWidth: 0 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: kpi.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {iconContent}
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e3a8a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{kpi.label}</span>
                </div>
                
                {/* Value row - Centered */}
                {i === 0 ? (
                  // Card 1 Layout
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '3px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '19px', fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>{kpi.value}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--n-600)' }}>{kpi.unit}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'nowrap' }}>
                      <span style={{
                        fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px',
                        background: badgeBg, color: badgeColor, whiteSpace: 'nowrap'
                      }}>{kpi.change}</span>
                      <span style={{ fontSize: '9px', color: 'var(--n-500)', whiteSpace: 'nowrap' }}>so với tháng trước</span>
                    </div>
                  </div>
                ) : (
                  // Cards 2-7 Layout
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '19px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{kpi.value}</span>
                      <span style={{
                        fontSize: '9px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px',
                        background: badgeBg, color: badgeColor, whiteSpace: 'nowrap'
                      }}>{kpi.change}</span>
                    </div>
                    <span style={{ fontSize: '9.5px', color: 'var(--n-400)', whiteSpace: 'nowrap' }}>{kpi.sub}</span>
                  </div>
                )}
              </div>
              
              {/* Sparkline chart on right side */}
              {sparkline}
            </div>
          );
        })}
      </div>

      {/* 3-Column Layout with expanded right panel viewport */}
      <div style={{ display: 'flex', gap: '12px', flex: 1, minHeight: 0 }}>
        {/* Fixed Width Sidebar for conversation items list */}
        <div style={{ width: '280px', minWidth: '280px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <QualityConvList activeId={activeConv} onSelect={setActiveConv} conversations={convData} />
        </div>
        
        {/* Narrower Chat Dialogue Panel */}
        <div style={{ flex: 1.1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <QualityChatPanel conv={selectedConv} />
        </div>
        
        {/* Expanded 2-column cards Right Panel */}
        <div style={{ flex: 2.1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <QualityRightPanel conv={selectedConv} onUpdateTags={handleUpdateTags} onAddNote={handleAddNote} />
        </div>
      </div>
    </div>
  );
}
