// =========================================================
// MOCK DATA - VIENCHIBAO Chat Quality Agent (Full Platform)
// =========================================================

export const currentUser = { name: 'Bùi Duy Cường', role: 'Admin', avatar: 'BD' };

// ==================== DASHBOARD ====================
export const dashboardKPIs = [
  { label: 'QA Score (Chất lượng TB)', value: '85', unit: '/100', change: '↑ 6.2 điểm', changeType: 'up', sub: 'so với 01/04 - 30/04', icon: '✅', color: '#22c55e', bg: '#f0fdf4' },
  { label: 'CSAT (Hài lòng)', value: '92%', unit: '', change: '↑ 5%', changeType: 'up', sub: 'vs 87%', icon: '😊', color: '#6366f1', bg: '#eef2ff' },
  { label: 'Tỷ lệ chốt đơn', value: '28.6%', unit: '', change: '↑ 4.1%', changeType: 'up', sub: 'vs 24.5%', icon: '📦', color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Doanh thu ước tính', value: '1.286.450.000đ', unit: '', change: '↑ 23.4%', changeType: 'up', sub: 'vs 1.042.350.000đ', icon: '💰', color: '#22c55e', bg: '#f0fdf4' },
  { label: 'Đơn từ tin nhắn tự nhiên', value: '972', unit: ' đơn (64.7%)', change: '↑ 17.6%', changeType: 'up', sub: 'vs 827 đơn', icon: '💬', color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Đơn từ quảng cáo', value: '530', unit: ' đơn (35.3%)', change: '↑ 16.2%', changeType: 'up', sub: 'vs 456 đơn', icon: '📢', color: '#a855f7', bg: '#faf5ff' },
];

export const qualityTrend = [
  { date: '01/05', qa: 78, csat: 85, chotDon: 24 },
  { date: '06/05', qa: 80, csat: 87, chotDon: 25 },
  { date: '11/05', qa: 82, csat: 88, chotDon: 26 },
  { date: '16/05', qa: 79, csat: 86, chotDon: 27 },
  { date: '21/05', qa: 84, csat: 90, chotDon: 28 },
  { date: '26/05', qa: 85, csat: 91, chotDon: 29 },
  { date: '31/05', qa: 85, csat: 92, chotDon: 29 },
];

export const conversationSources = {
  total: 5253,
  sources: [
    { label: 'Tin nhắn tự nhiên', value: 3402, pct: 64.7, color: '#6366f1', sub: 'Chốt đơn: 972 (28.6%)' },
    { label: 'Quảng cáo', value: 1851, pct: 35.3, color: '#a855f7', sub: 'Chốt đơn: 530 (26.8%)' },
  ],
};

export const adCampaignEfficiency = [
  { name: 'Facebook Ads - Campaign 01', checked: 1245, checkRate: '78.6%', closeRate: '29.5%' },
  { name: 'Facebook Ads - Campaign 02', checked: 1012, checkRate: '73.2%', closeRate: '27.1%' },
  { name: 'Facebook Ads - Campaign 03', checked: 823, checkRate: '69.4%', closeRate: '24.6%' },
  { name: 'Facebook Ads - Campaign 04', checked: 612, checkRate: '66.1%', closeRate: '21.8%' },
  { name: 'Facebook Ads - Campaign 05', checked: 402, checkRate: '61.3%', closeRate: '18.7%' },
];

export const topProducts = [
  { name: 'Nhẫn bạc Kim Hoàn Trọn Classic', emoji: '💍', visits: 1125, closeRate: '31.4%' },
  { name: 'Dây chuyền bạc nữ', emoji: '📿', visits: 856, closeRate: '28.1%' },
  { name: 'Lắc tay bạc', emoji: '⌚', visits: 741, closeRate: '27.2%' },
  { name: 'Bông tai bạc', emoji: '✨', visits: 623, closeRate: '26.5%' },
  { name: 'Nhẫn bạc đính đá', emoji: '💎', visits: 512, closeRate: '24.6%' },
];

export const customerInsights = [
  { icon: '💰', label: 'giá cả', value: 3254 }, { icon: '📏', label: 'size', value: 2118 },
  { icon: '🧵', label: 'chất liệu', value: 1842 }, { icon: '🔧', label: 'bảo hành', value: 1532 },
  { icon: '📐', label: 'cách đo size', value: 1125 }, { icon: '📦', label: 'có sẵn không', value: 1023 },
  { icon: '🎁', label: 'ưu đãi', value: 842 }, { icon: '↩️', label: 'đổi trả', value: 732 },
  { icon: '🚚', label: 'shipping', value: 687 },
];

export const customerSentiment = { positive: { value: 78, change: '↑ 6%' }, neutral: { value: 16, change: '↓ 2%' }, negative: { value: 6, change: '↑ 2%' } };

export const funnelData = [
  { label: 'Tổng hội thoại', value: 5253 }, { label: 'Đã tư vấn', value: 3982, pct: '75.8%' },
  { label: 'Khách quan tâm', value: 2146, pct: '53.9%' }, { label: 'Báo giá', value: 1762, pct: '82.1%' },
  { label: 'Chốt đơn', value: 1502, pct: '85.2%' },
];

export const customersNeedCare = [
  { label: 'Cần chăm sóc lại', value: 267, color: '#6366f1' },
  { label: 'Cần bảo hành / đổi trả', value: 83, color: '#f59e0b' },
  { label: 'Khách chưa chốt đơn (quá 24h)', value: 145, color: '#ef4444' },
  { label: 'Khách có cảm xúc tiêu cực', value: 37, color: '#ec4899' },
  { label: 'Khách VIP', value: 59, color: '#a855f7' },
];

export const topPages = [
  { name: 'Viên Chi Bảo - Trang chính', icon: 'f', score: 87, closeRate: '31.7%', revenue: '632.5M' },
  { name: 'Viên Chi Bảo - HN', icon: 'f', score: 83, closeRate: '27.8%', revenue: '421.3M' },
  { name: 'Viên Chi Bảo - HCM', icon: 'f', score: 81, closeRate: '26.1%', revenue: '312.4M' },
  { name: 'Viên Chi Bảo - Đà Nẵng', icon: 'f', score: 78, closeRate: '24.5%', revenue: '201.7M' },
  { name: 'Viên Chi Bảo - Shop 2', icon: 'f', score: 76, closeRate: '22.9%', revenue: '134.5M' },
];

export const employeeRanking = [
  { rank: 1, name: 'Trung Hiếu', avatar: 'T', score: 92, closeRate: '34.6%', conversations: 632 },
  { rank: 2, name: 'Hoangvan Hoangvan', avatar: 'H', score: 88, closeRate: '29.7%', conversations: 598 },
  { rank: 3, name: 'Oanh Lê', avatar: 'O', score: 86, closeRate: '28.1%', conversations: 512 },
  { rank: 4, name: 'Jarvis Nguyen', avatar: 'J', score: 84, closeRate: '27.4%', conversations: 478 },
  { rank: 5, name: 'Gọc Phø Mua Thu', avatar: 'G', score: 82, closeRate: '25.9%', conversations: 430 },
];

export const recentActivities = [
  { icon: '✅', text: 'Audit hoàn thành: Hội thoại #5204 - 85 điểm', time: '10:29' },
  { icon: '⚠️', text: 'Khách hàng cần chăm sóc lại (quá 24h): 5 khách', time: '10:15' },
  { icon: '🔴', text: 'Đã chốt đơn mới: #DH73921 - 1.950.000đ', time: '09:58' },
  { icon: '💬', text: '3 hội thoại có cảm xúc tiêu cực', time: '09:40' },
  { icon: '📞', text: 'Khách yêu cầu bảo hành: #BH3201', time: '09:22' },
];

// ==================== CONVERSATIONS ====================
export const conversationTabs = [
  { key: 'all', label: 'Tất cả', count: 2582 }, { key: 'unread', label: 'Chưa đọc', count: 128 },
  { key: 'waiting', label: 'Đang chờ', count: 312 }, { key: 'flagged', label: 'Đánh dấu', count: 48 },
];

export const conversations = [
  { id: 1, name: 'Nguyễn Minh Anh', avatar: 'N', avatarColor: '#6366f1', preview: 'Mình muốn hỏi về nhẫn bạc kim hoàn...', time: '10:30', badges: ['Quảng cáo', 'Đang chờ'], unread: 2 },
  { id: 2, name: 'Trần Quốc Bảo', avatar: 'T', avatarColor: '#3b82f6', preview: 'Sản phẩm này còn size 17 không ạ?', time: '10:28', badges: ['Tin nhắn tự nhiên'], unread: 0 },
  { id: 3, name: 'Phạm Thùy Linh', avatar: 'P', avatarColor: '#ec4899', preview: 'Cho mình địa chỉ cửa hàng nhé', time: '10:23', badges: ['Tin nhắn tự nhiên'], unread: 1 },
  { id: 4, name: 'Lê Hoàng Nam', avatar: 'L', avatarColor: '#f59e0b', preview: 'Đặt hàng #DH73921', time: '10:19', badges: ['Quảng cáo', 'Đã chốt đơn'], unread: 0, done: true },
  { id: 5, name: 'Vũ Thị Mai', avatar: 'V', avatarColor: '#22c55e', preview: 'Chỉ cần hỗ trợ đổi size', time: '10:18', badges: ['Quảng cáo', 'Chăm sóc sau bán'], unread: 0 },
  { id: 6, name: 'Đặng Anh Khoa', avatar: 'D', avatarColor: '#14b8a6', preview: 'Có chương trình khuyến mãi gì không?', time: '10:15', badges: ['Quảng cáo'], unread: 0 },
  { id: 7, name: 'Hoàng Yến Nhi', avatar: 'H', avatarColor: '#a855f7', preview: 'Cảm ơn shop nhé!', time: '10:12', badges: ['Tin nhắn tự nhiên', 'Khách VIP'], unread: 0 },
  { id: 8, name: 'Bùi Thanh Tùng', avatar: 'B', avatarColor: '#ef4444', preview: 'Sản phẩm đẹp quá!', time: '10:10', badges: ['Quảng cáo', 'Đánh giá tốt'], unread: 0 },
  { id: 9, name: 'Ngô Gia Hân', avatar: 'N', avatarColor: '#6366f1', preview: 'Shop ơi, cho mình hỏi bảo hành...', time: '10:08', badges: ['Tin nhắn tự nhiên', 'Bảo hành'], unread: 0 },
];

export const currentChat = {
  customer: { name: 'Nguyễn Minh Anh', badge: 'Quảng cáo', channel: 'Messenger', gender: 'Nữ', phone: '0987 654 321', tier: 'Có (3 đơn)', lastPurchase: '15/04/2026' },
  messages: [
    { id: 1, sender: 'customer', text: 'Mình muốn hỏi về nhẫn bạc kim hoàn trọn classic', time: '10:30' },
    { id: 2, sender: 'customer', text: 'Không biết size 16 còn hàng không ạ?', time: '10:30' },
    { id: 3, sender: 'agent', text: 'Dạ chào chị Minh Anh ạ!\nNhẫn bạc kim hoàn trọn classic bên em hiện còn đầy đủ size từ 12 đến 20 ạ.', time: '10:31' },
    { id: 4, sender: 'customer', text: 'Chỉ cần size 16 đúng không ạ?', time: '10:31' },
    { id: 5, sender: 'agent', text: 'Dạ đúng rồi ạ', time: '10:31' },
    { id: 6, sender: 'customer', text: 'Giá bao nhiêu vậy shop?', time: '10:32' },
    { id: 7, sender: 'agent', text: 'Dạ nhẫn bạc kim hoàn trọn classic size 16 giá 520.000đ ạ. Shop có hỗ trợ ship toàn quốc và kiểm tra hàng trước khi thanh toán ạ.', time: '10:32' },
    { id: 8, sender: 'system', text: 'Khách hàng đã xem sản phẩm', time: '10:33', product: { name: 'Nhẫn bạc kim hoàn trọn classic', price: '520.000đ', emoji: '💍' } },
  ],
  qualityScore: { overall: 85, max: 100, stars: 4, trend: '↑ 12 điểm', criteria: [
    { label: 'Thái độ nhân viên', score: 90, max: 100 }, { label: 'Mức độ đầy đủ', score: 82, max: 100 },
    { label: 'Tốc độ phản hồi', score: 88, max: 100 }, { label: 'Giải quyết vấn đề', score: 80, max: 100 },
  ]},
  conversationInfo: { source: 'Quảng cáo (Facebook Ads)', campaign: 'VCB - Nhẫn bạc - 05/2026', adset: 'Nhẫn bạc - Nhóm 1', cost: '12.450đ', firstMessage: '01/05/2026 10:30', assignee: 'Hoàng Văn An', status: 'Đang chờ' },
  tags: ['Quan tâm', 'Size 16', 'Nhẫn bạc', 'Giá'],
  history: [
    { time: '10:31', text: 'Hoàng Văn An đã trả lời' }, { time: '10:30', text: 'Hội thoại được tạo từ quảng cáo' },
    { time: '15/04/2026', text: 'Đã mua 2 sản phẩm (1.250.000đ)' }, { time: '20/03/2026', text: 'Đã mua 1 sản phẩm (550.000đ)' },
  ],
  quickActions: [
    { icon: '📋', label: 'Tạo đơn hàng' }, { icon: '📦', label: 'Gửi sản phẩm' },
    { icon: '📝', label: 'Gửi mẫu trả lời' }, { icon: '🔄', label: 'Chuyển nhân viên' },
    { icon: '🏁', label: 'Kết thúc hội thoại' },
  ],
};

// ==================== AI INSIGHT ====================
export const insightKPIs = [
  { label: 'Insight mới', value: 128, icon: '💡', change: '↑ 18%', sub: 'so với kỳ trước', color: '#6366f1', bg: '#eef2ff' },
  { label: 'Vấn đề rủi ro', value: 23, icon: '⚠️', change: '↓ 7%', sub: 'so với kỳ trước', color: '#ef4444', bg: '#fef2f2' },
  { label: 'Xu hướng tăng mạnh', value: 8, icon: '📈', change: '↑ 14%', sub: 'so với kỳ trước', color: '#22c55e', bg: '#f0fdf4' },
  { label: 'Hội thoại bất thường', value: 42, icon: '🔍', change: '↑ 9%', sub: 'so với kỳ trước', color: '#f59e0b', bg: '#fffbeb' },
];

export const customerConcerns = {
  total: 18765,
  items: [
    { label: 'Quan tâm size nhỏ nữ', pct: 32, color: '#6366f1' }, { label: 'Hỏi bạc thật không', pct: 28, color: '#818cf8' },
    { label: 'Quan tâm bảo hành', pct: 24, color: '#a78bfa' }, { label: 'Hỏi có ship COD', pct: 21, color: '#c4b5fd' },
    { label: 'Quan tâm quà tặng', pct: 18, color: '#ddd6fe' }, { label: 'Khác', pct: 9, color: '#e5e7eb' },
  ],
};

export const closeRateFactors = {
  highClose: [
    { label: 'Gửi video/ảnh thật sản phẩm', pct: 28 }, { label: 'Hỏi nhu cầu trước báo giá', pct: 24 },
    { label: 'Tư vấn size/fit kỹ', pct: 20 }, { label: 'Follow-up đúng thời điểm', pct: 18 },
    { label: 'Chăm sóc sau bán tốt', pct: 15 },
  ],
  lostOrders: [
    { label: 'Báo giá quá sớm', pct: 32 }, { label: 'Không follow-up', pct: 28 },
    { label: 'Không hỏi nhu cầu', pct: 22 }, { label: 'Trả lời chậm', pct: 18 },
    { label: 'Không gửi ảnh/Video thật', pct: 15 },
  ],
};

export const insightByCountry = [
  { country: 'Thailand', flag: '🇹🇭', insight: 'Thích mẫu minimal, quan tâm COD', closeRate: '29.6%' },
  { country: 'Indonesia', flag: '🇮🇩', insight: 'Quan tâm giá tốt, thích combo', closeRate: '24.8%' },
  { country: 'Philippines', flag: '🇵🇭', insight: 'Thích mẫu trendy, hay hỏi size', closeRate: '27.3%' },
  { country: 'United States', flag: '🇺🇸', insight: 'Quan tâm chất liệu, authenticity', closeRate: '34.2%' },
  { country: 'Vietnam', flag: '🇻🇳', insight: 'Quan tâm bảo hành, mua làm quà', closeRate: '28.1%' },
];

export const adEfficiency = [
  { name: 'Facebook Ads', stars: 4, quality: '29.5%', closeRate: '16.3%', roas: '4.2x' },
  { name: 'TikTok Ads', stars: 3, quality: '24.8%', closeRate: '12.1%', roas: '2.8x' },
  { name: 'Instagram Ads', stars: 4, quality: '24.8%', closeRate: '14.5%', roas: '3.6x' },
  { name: 'Google Ads', stars: 3, quality: '18.2%', closeRate: '11.8%', roas: '2.4x' },
  { name: 'Organic (Tự nhiên)', stars: 5, quality: '31.7%', closeRate: '18.2%', roas: '5.3x' },
];

export const aiAssistantMessages = [
  { sender: 'ai', text: 'Hỏi gì cũng biết về dữ liệu hội thoại' },
  { sender: 'user', text: 'Khách hàng tháng này quan tâm điều gì nhiều nhất?' },
  { sender: 'ai', text: 'Dựa trên 52.362 hội thoại:\n1. Size nhỏ nữ (32%)\n2. Bạc thật / chất liệu (28%)\n3. Bảo hành (24%)\n4. Ship COD (21%)\n5. Quà tặng / Packaging (18%)' },
];

export const aiSuggestedQuestions = [
  'Top sản phẩm được hỏi nhiều?', 'Khách hàng phàn nàn điều gì?',
  'Nhân viên có hiệu suất tốt nhất?', 'Insight khách hàng theo độ tuổi?',
];

// ==================== QUALITY CSKH ====================
export const qualityScoreDetail = { overall: 85, max: 100, status: 'Đạt', stars: 4, rank: 'Tốt' };
export const criteriaScores = [
  { name: 'Chào hỏi, thiện cảm', score: 20, max: 20 }, { name: 'Khai thác nhu cầu', score: 18, max: 20 },
  { name: 'Tư vấn, giải đáp', score: 19, max: 20 }, { name: 'Xử lý từ chối / thắc mắc', score: 15, max: 20 },
  { name: 'Kết thúc, CS sau bán', score: 13, max: 20 },
];

// ==================== EMPLOYEES ====================
const formatVnd = (value) => `${value.toLocaleString('vi-VN')}đ`;

const employeeProfiles = [
  { name: 'Trung Hiếu', team: 'Team A', score: 92, conversations: 632, closeRate: 34.6, csat: 4.8, aov: 1163000, focus: 'Duy trì upsell' },
  { name: 'Hoangvan Hoangvan', team: 'Team A', score: 88, conversations: 598, closeRate: 29.7, csat: 4.6, aov: 1118000, focus: 'Tăng follow-up' },
  { name: 'Oanh Lê', team: 'Team B', score: 86, conversations: 512, closeRate: 28.1, csat: 4.5, aov: 1225000, focus: 'Gợi ý combo' },
  { name: 'Jarvis Nguyen', team: 'Team B', score: 84, conversations: 478, closeRate: 27.4, csat: 4.4, aov: 1162000, focus: 'Chốt sau báo giá' },
  { name: 'Góc Phố Mùa Thu', team: 'Team A', score: 82, conversations: 430, closeRate: 25.9, csat: 4.3, aov: 1270000, focus: 'Khai thác nhu cầu' },
  { name: 'Phương Anh', team: 'Team C', score: 80, conversations: 385, closeRate: 24.2, csat: 4.2, aov: 1377000, focus: 'Phản hồi nhanh' },
  { name: 'Thùy Nguyên', team: 'Team C', score: 78, conversations: 342, closeRate: 22.8, csat: 4.1, aov: 1485000, focus: 'Tư vấn size' },
  { name: 'Minh Châu', team: 'Team B', score: 75, conversations: 310, closeRate: 21.5, csat: 4.0, aov: 1470000, focus: 'Xử lý từ chối' },
  { name: 'Minh Anh', team: 'Team A', score: 91, conversations: 604, closeRate: 33.2, csat: 4.8, aov: 1124000, focus: 'Duy trì chất lượng' },
  { name: 'Phương Linh', team: 'Team B', score: 89, conversations: 586, closeRate: 31.4, csat: 4.7, aov: 1086000, focus: 'Tăng đơn combo' },
  { name: 'Hoàng Nam', team: 'Team C', score: 87, conversations: 548, closeRate: 30.2, csat: 4.6, aov: 1072000, focus: 'Duy trì tốc độ' },
  { name: 'Thành Đạt', team: 'Team A', score: 85, conversations: 521, closeRate: 28.8, csat: 4.5, aov: 1183000, focus: 'Gửi ảnh thật' },
  { name: 'Thu Hà', team: 'Team B', score: 84, conversations: 505, closeRate: 28.0, csat: 4.4, aov: 1065000, focus: 'Bám sát tồn kho' },
  { name: 'Bảo Ngọc', team: 'Team D', score: 83, conversations: 492, closeRate: 27.1, csat: 4.4, aov: 1058000, focus: 'Tăng câu hỏi chốt' },
  { name: 'Ngọc Mai', team: 'Team C', score: 82, conversations: 468, closeRate: 26.8, csat: 4.3, aov: 1102000, focus: 'Tư vấn bảo hành' },
  { name: 'Quỳnh Chi', team: 'Team A', score: 81, conversations: 455, closeRate: 26.1, csat: 4.3, aov: 1035000, focus: 'Follow-up 24h' },
  { name: 'Gia Hân', team: 'Team D', score: 80, conversations: 442, closeRate: 25.4, csat: 4.2, aov: 1018000, focus: 'Gợi ý sản phẩm' },
  { name: 'Thanh Tùng', team: 'Team B', score: 79, conversations: 426, closeRate: 24.9, csat: 4.2, aov: 990000, focus: 'Chốt đơn mềm' },
  { name: 'Khánh Vy', team: 'Team C', score: 79, conversations: 418, closeRate: 24.6, csat: 4.1, aov: 1044000, focus: 'Tư vấn size' },
  { name: 'Đức Anh', team: 'Team A', score: 78, conversations: 405, closeRate: 24.0, csat: 4.1, aov: 972000, focus: 'Xử lý giá cao' },
  { name: 'Hà My', team: 'Team D', score: 77, conversations: 394, closeRate: 23.7, csat: 4.0, aov: 982000, focus: 'Gửi mẫu thật' },
  { name: 'Kim Anh', team: 'Team B', score: 77, conversations: 382, closeRate: 23.1, csat: 4.0, aov: 956000, focus: 'Khai thác nhu cầu' },
  { name: 'Tuấn Minh', team: 'Team C', score: 76, conversations: 369, closeRate: 22.8, csat: 3.9, aov: 944000, focus: 'Phản hồi nhanh' },
  { name: 'Hải Yến', team: 'Team A', score: 76, conversations: 358, closeRate: 22.4, csat: 3.9, aov: 930000, focus: 'Chăm sóc sau bán' },
  { name: 'Thảo Vy', team: 'Team D', score: 75, conversations: 346, closeRate: 22.1, csat: 3.9, aov: 912000, focus: 'Báo giá rõ hơn' },
  { name: 'Minh Quân', team: 'Team B', score: 74, conversations: 337, closeRate: 21.6, csat: 3.8, aov: 926000, focus: 'Chốt sau báo giá' },
  { name: 'Ngọc Trâm', team: 'Team C', score: 74, conversations: 328, closeRate: 21.2, csat: 3.8, aov: 918000, focus: 'Tư vấn chất liệu' },
  { name: 'Anh Khoa', team: 'Team A', score: 73, conversations: 318, closeRate: 20.9, csat: 3.8, aov: 904000, focus: 'Giữ giọng thân thiện' },
  { name: 'Bích Ngân', team: 'Team D', score: 73, conversations: 307, closeRate: 20.3, csat: 3.7, aov: 896000, focus: 'Hẹn giờ follow-up' },
  { name: 'Hoài Nam', team: 'Team B', score: 72, conversations: 298, closeRate: 20.0, csat: 3.7, aov: 882000, focus: 'Xử lý từ chối' },
  { name: 'Diễm My', team: 'Team C', score: 72, conversations: 289, closeRate: 19.6, csat: 3.7, aov: 875000, focus: 'Tư vấn size' },
  { name: 'Lan Anh', team: 'Team A', score: 71, conversations: 281, closeRate: 19.3, csat: 3.6, aov: 868000, focus: 'Nắm tồn kho' },
  { name: 'Quốc Bảo', team: 'Team D', score: 71, conversations: 273, closeRate: 18.9, csat: 3.6, aov: 854000, focus: 'Gợi ý sản phẩm' },
  { name: 'Thanh Bình', team: 'Team B', score: 70, conversations: 264, closeRate: 18.5, csat: 3.6, aov: 846000, focus: 'Tăng tỷ lệ chốt' },
  { name: 'Mỹ Linh', team: 'Team C', score: 70, conversations: 255, closeRate: 18.2, csat: 3.5, aov: 838000, focus: 'Trả lời đủ ý' },
  { name: 'Hữu Phước', team: 'Team A', score: 69, conversations: 248, closeRate: 17.8, csat: 3.5, aov: 830000, focus: 'Phản hồi nhanh' },
  { name: 'Ngọc Hân', team: 'Team D', score: 69, conversations: 241, closeRate: 17.5, csat: 3.5, aov: 822000, focus: 'Chăm sóc sau bán' },
  { name: 'Vân Anh', team: 'Team B', score: 68, conversations: 235, closeRate: 17.2, csat: 3.4, aov: 815000, focus: 'Khai thác nhu cầu' },
  { name: 'Đức Huy', team: 'Team C', score: 68, conversations: 228, closeRate: 16.9, csat: 3.4, aov: 806000, focus: 'Xử lý giá cao' },
  { name: 'Nhã Uyên', team: 'Team A', score: 67, conversations: 220, closeRate: 16.5, csat: 3.4, aov: 798000, focus: 'Báo giá rõ hơn' },
  { name: 'Bảo Trân', team: 'Team D', score: 67, conversations: 214, closeRate: 16.2, csat: 3.3, aov: 790000, focus: 'Gửi ảnh/video thật' },
  { name: 'Hoàng Phúc', team: 'Team B', score: 66, conversations: 207, closeRate: 15.9, csat: 3.3, aov: 782000, focus: 'Chốt đơn mềm' },
  { name: 'Phương Thảo', team: 'Team C', score: 66, conversations: 201, closeRate: 15.5, csat: 3.3, aov: 775000, focus: 'Tư vấn bảo hành' },
  { name: 'Nhật Minh', team: 'Team A', score: 65, conversations: 195, closeRate: 15.2, csat: 3.2, aov: 768000, focus: 'Tăng follow-up' },
  { name: 'Cẩm Tú', team: 'Team D', score: 65, conversations: 188, closeRate: 14.9, csat: 3.2, aov: 760000, focus: 'Phản hồi nhanh' },
  { name: 'Thiên An', team: 'Team B', score: 64, conversations: 182, closeRate: 14.5, csat: 3.2, aov: 752000, focus: 'Khai thác nhu cầu' },
  { name: 'Huyền Trang', team: 'Team C', score: 64, conversations: 176, closeRate: 14.1, csat: 3.1, aov: 744000, focus: 'Xử lý từ chối' },
  { name: 'Trọng Nghĩa', team: 'Team A', score: 63, conversations: 169, closeRate: 13.8, csat: 3.1, aov: 736000, focus: 'Tư vấn size' },
  { name: 'Hà Linh', team: 'Team D', score: 63, conversations: 163, closeRate: 13.5, csat: 3.1, aov: 728000, focus: 'Giữ giọng thân thiện' },
  { name: 'Khải Hoàn', team: 'Team B', score: 62, conversations: 156, closeRate: 13.1, csat: 3.0, aov: 720000, focus: 'Tăng tỷ lệ chốt' },
];

const rankedEmployeeProfiles = [...employeeProfiles].sort((a, b) => (
  b.score - a.score || b.closeRate - a.closeRate || b.conversations - a.conversations
));

const assignedPagePool = [
  { name: 'Vienchibao Japan', channel: 'Messenger' },
  { name: 'Vienchibao Thailand', channel: 'Messenger' },
  { name: 'Vienchibao USA', channel: 'Instagram' },
  { name: 'Vienchibao Indonesia', channel: 'Messenger' },
  { name: 'Vienchibao Global', channel: 'Zalo' },
  { name: 'Vienchibao Jewelry', channel: 'Facebook' },
  { name: 'Website Chat', channel: 'Live chat' },
  { name: 'Shopee - Vienchibao', channel: 'Marketplace' },
];

const qualityCriteriaLabels = [
  'Chào hỏi',
  'Khai thác nhu cầu',
  'Tư vấn sản phẩm',
  'Xử lý từ chối',
  'Chốt đơn',
  'CS sau bán',
];

export const employees = rankedEmployeeProfiles.map((employee, index) => {
  const orders = Math.round(employee.conversations * employee.closeRate / 100);
  const revenueValue = orders * employee.aov;
  const improvementScore = Math.max(
    0,
    Math.round((100 - employee.score) * 0.65 + (32 - employee.closeRate) * 0.45 + (4.7 - employee.csat) * 7)
  );
  const conversationTarget = Math.round(employee.conversations * (1.04 + (index % 4) * 0.025));
  const orderTarget = Math.round(orders * (1.08 + (index % 5) * 0.02));
  const closeRateTarget = Number((employee.closeRate + 1.8 + (index % 3) * 0.4).toFixed(1));
  const csatTarget = Number(Math.min(4.9, employee.csat + 0.2).toFixed(1));
  const achievementRate = Math.round(
    (Math.min(employee.conversations / conversationTarget, 1.2) * 35)
    + (Math.min(orders / orderTarget, 1.2) * 35)
    + (Math.min(employee.closeRate / closeRateTarget, 1.2) * 20)
    + (Math.min(employee.csat / csatTarget, 1.2) * 10)
  );
  const assignedPages = Array.from({ length: 2 + (index % 3) }, (_, pageIndex) => {
    const page = assignedPagePool[(index + pageIndex * 2) % assignedPagePool.length];

    return {
      ...page,
      checked: Math.round(employee.conversations / (2.4 + pageIndex * 0.7)),
      pending: 8 + ((index + pageIndex * 5) % 28),
      quality: Math.max(58, Math.min(98, employee.score - 4 + pageIndex * 3)),
    };
  });
  const qualityBreakdown = qualityCriteriaLabels.map((label, criteriaIndex) => ({
    label,
    score: Math.max(48, Math.min(98, employee.score + ((criteriaIndex % 3) - 1) * 5 - (index % 4))),
  }));
  const qualityTrend = Array.from({ length: 6 }, (_, trendIndex) => ({
    label: `T${trendIndex + 1}`,
    score: Math.max(45, Math.min(98, employee.score - 10 + trendIndex * 2 + ((index + trendIndex) % 5))),
  }));

  return {
    id: index + 1,
    rank: index + 1,
    name: employee.name,
    team: employee.team,
    score: employee.score,
    conversations: employee.conversations,
    closeRate: `${employee.closeRate.toFixed(1)}%`,
    closeRateValue: employee.closeRate,
    csat: `${employee.csat.toFixed(1)}/5`,
    csatValue: employee.csat,
    orders,
    revenue: formatVnd(revenueValue),
    revenueValue,
    avgResponse: `${35 + (index % 9) * 9}s`,
    improvementScore,
    improvementFocus: employee.focus,
    assignedPages,
    qualityBreakdown,
    qualityTrend,
    kpiTargets: {
      conversations: conversationTarget,
      orders: orderTarget,
      closeRate: closeRateTarget,
      csat: csatTarget,
    },
    achievementRate,
    online: index % 3 !== 1,
    status: employee.score >= 80 ? 'Đạt chuẩn' : employee.score >= 70 ? 'Cần theo dõi' : 'Cần cải thiện',
  };
});

// ==================== CUSTOMERS ====================
export const customerKPIs = [
  { label: 'Tổng khách hàng', value: '8.254', icon: '👥', change: '↑ 12.3%', bg: '#eef2ff' },
  { label: 'Khách VIP', value: '486', icon: '⭐', change: '↑ 8.5%', bg: '#fffbeb' },
  { label: 'Khách mới tháng này', value: '1.245', icon: '🆕', change: '↑ 15.2%', bg: '#f0fdf4' },
  { label: 'Khách tiêu cực', value: '37', icon: '😞', change: '↓ 12%', bg: '#fef2f2' },
  { label: 'AI Purchase Score TB', value: '72/100', icon: '🎯', change: '↑ 5.1', bg: '#faf5ff' },
  { label: 'Tỷ lệ quay lại', value: '38.5%', icon: '🔄', change: '↑ 4.2%', bg: '#f0fdf4' },
];

export const customerList = [
  { id: 1, name: 'Nguyễn Minh Anh', country: '🇻🇳 VN', source: 'Facebook Ads', status: 'VIP', purchaseScore: 92, sentiment: '😊', totalSpent: '3.850.000đ', orders: 5, lastPurchase: '15/04/2026' },
  { id: 2, name: 'Sarah Johnson', country: '🇺🇸 US', source: 'Instagram', status: 'Tiềm năng', purchaseScore: 78, sentiment: '😊', totalSpent: '1.200.000đ', orders: 2, lastPurchase: '20/04/2026' },
  { id: 3, name: 'Somchai Prasit', country: '🇹🇭 TH', source: 'Facebook Ads', status: 'Nóng', purchaseScore: 85, sentiment: '😊', totalSpent: '2.450.000đ', orders: 3, lastPurchase: '10/05/2026' },
  { id: 4, name: 'Trần Quốc Bảo', country: '🇻🇳 VN', source: 'Organic', status: 'VIP', purchaseScore: 95, sentiment: '😊', totalSpent: '12.500.000đ', orders: 15, lastPurchase: '25/05/2026' },
  { id: 5, name: 'Maria Santos', country: '🇵🇭 PH', source: 'TikTok Ads', status: 'Lạnh', purchaseScore: 35, sentiment: '😐', totalSpent: '550.000đ', orders: 1, lastPurchase: '01/03/2026' },
  { id: 6, name: 'Lê Hoàng Nam', country: '🇻🇳 VN', source: 'Facebook Ads', status: 'Nóng', purchaseScore: 88, sentiment: '😊', totalSpent: '4.200.000đ', orders: 4, lastPurchase: '26/05/2026' },
  { id: 7, name: 'Yuki Tanaka', country: '🇯🇵 JP', source: 'Google Ads', status: 'Tiềm năng', purchaseScore: 65, sentiment: '😐', totalSpent: '0', orders: 0, lastPurchase: '-' },
  { id: 8, name: 'Phạm Thùy Linh', country: '🇻🇳 VN', source: 'Organic', status: 'Toxic', purchaseScore: 20, sentiment: '😞', totalSpent: '850.000đ', orders: 1, lastPurchase: '12/04/2026' },
];

// ==================== PAGE / KÊNH ====================
export const pageKPIs = [
  { label: 'Tổng tin nhắn', value: '8.625', change: '↑ 13%', changeType: 'up', sub: '↑ 18.6% so với tháng trước' },
  { label: 'Tin nhắn phản hồi', value: '7.352', change: '↑ 21.3%', changeType: 'up', sub: '' },
  { label: 'Tỷ lệ phản hồi', value: '85.3%', change: '↑ 3.8%', changeType: 'up', sub: 'so với tháng trước' },
  { label: 'Tỷ lệ chốt ①', value: '28.6%', change: '↑ 4.2%', changeType: 'up', sub: '' },
  { label: 'Doanh thu từ chat', value: '1.248.500.000đ', change: '↑ 22.5%', changeType: 'up', sub: 'so với tháng trước' },
];

export const pageChannels = [
  { id: 1, name: 'Vienchibao Jewelry', type: 'Facebook Page', score: 92, msgs: 128, processing: 32, avatar: '📘', color: '#1877f2' },
  { id: 2, name: 'Vienchibao Thailand', type: 'Facebook Page', score: 88, msgs: 96, processing: 28, avatar: '📘', color: '#1877f2' },
  { id: 3, name: 'Vienchibao Official', type: 'Instagram', score: 85, msgs: 64, processing: 15, avatar: '📸', color: '#e4405f' },
  { id: 4, name: '@vienchibao.th', type: 'TikTok', score: 82, msgs: 48, processing: 12, avatar: '🎵', color: '#000' },
  { id: 5, name: 'Vienchibao Support', type: 'Zalo Official Account', score: 79, msgs: 36, processing: 8, avatar: '💬', color: '#0068ff' },
  { id: 6, name: 'Shopee - Vienchibao', type: 'Shopee Chat', score: 78, msgs: 22, processing: 6, avatar: '🛒', color: '#ee4d2d' },
  { id: 7, name: 'Lazada - Vienchibao', type: 'Lazada Chat', score: 75, msgs: 18, processing: 4, avatar: '🏪', color: '#0f146d' },
  { id: 8, name: 'Website Chat', type: 'Live Chat', score: 72, msgs: 14, processing: 3, avatar: '🌐', color: '#22c55e' },
];

export const pagePerformance = [
  { name: 'Vienchibao Jewelry', type: 'Facebook Page', msgs: 2352, responseRate: '89.2%', closeRate: '32.1%', csat: '4.8/5', revenue: '426.500.000đ', quality: 92, trend: '↑' },
  { name: 'Vienchibao Thailand', type: 'Facebook Page', msgs: 1856, responseRate: '86.7%', closeRate: '29.8%', csat: '4.6/5', revenue: '312.000.000đ', quality: 88, trend: '↑' },
  { name: 'Vienchibao Official', type: 'Instagram', msgs: 1248, responseRate: '84.1%', closeRate: '26.7%', csat: '4.5/5', revenue: '210.800.000đ', quality: 85, trend: '↑' },
  { name: '@vienchibao.th', type: 'TikTok', msgs: 864, responseRate: '82.3%', closeRate: '24.9%', csat: '4.3/5', revenue: '128.600.000đ', quality: 82, trend: '→' },
  { name: 'Vienchibao Support', type: 'Zalo', msgs: 632, responseRate: '78.5%', closeRate: '22.3%', csat: '4.1/5', revenue: '86.300.000đ', quality: 79, trend: '↓' },
  { name: 'Shopee - Vienchibao', type: 'Shopee', msgs: 356, responseRate: '76.1%', closeRate: '19.8%', csat: '4.0/5', revenue: '54.700.000đ', quality: 78, trend: '→' },
  { name: 'Lazada - Vienchibao', type: 'Lazada', msgs: 248, responseRate: '74.3%', closeRate: '18.6%', csat: '3.9/5', revenue: '28.900.000đ', quality: 75, trend: '↓' },
  { name: 'Website Chat', type: 'Live Chat', msgs: 178, responseRate: '72.8%', closeRate: '17.2%', csat: '3.8/5', revenue: '6.500.000đ', quality: 72, trend: '→' },
];

export const pageDistribution = [
  { label: 'Facebook Page', pct: 49.0, value: 4208, color: '#1877f2' },
  { label: 'Instagram', pct: 14.5, value: 1248, color: '#e4405f' },
  { label: 'TikTok', pct: 10.0, value: 864, color: '#010101' },
  { label: 'Zalo', pct: 7.3, value: 632, color: '#0068ff' },
  { label: 'Shopee', pct: 4.1, value: 356, color: '#ee4d2d' },
  { label: 'Khác', pct: 15.1, value: 1317, color: '#9ca3af' },
];

// ==================== PRODUCTS ====================
export const productKPIs = [
  { label: 'Tổng sản phẩm', value: '286', change: '↑ 12 sản phẩm', icon: '📦' },
  { label: 'Sản phẩm có tin nhắn', value: '184 (64.3%)', change: '↑ 18.5%', icon: '💬' },
  { label: 'Tổng tin nhắn', value: '12.458', change: '↑ 24.3%', icon: '📨' },
  { label: 'Sản phẩm đã bán', value: '1.248', change: '↑ 22.5%', icon: '🛒' },
  { label: 'Doanh thu từ SP', value: '1.248.500.000đ', change: '↑ 25.1%', icon: '💰' },
  { label: 'Tỷ lệ chốt trung bình', value: '10.02%', change: '↑ 2.1%', icon: '📊' },
];

export const productList = [
  { id: 'SP001', name: 'Nhẫn bạc Classic', category: 'Nhẫn', msgs: 1245, responseRate: '86.7%', closeRate: '12.4%', sold: 156, revenue: '156.000.000đ', revenuePerUnit: '1.000.000đ', aiScore: 92, trend: '↑' },
  { id: 'SP002', name: 'Dây chuyền bạc Minimal', category: 'Dây chuyền', msgs: 1086, responseRate: '84.1%', closeRate: '9.8%', sold: 112, revenue: '112.000.000đ', revenuePerUnit: '1.000.000đ', aiScore: 87, trend: '↑' },
  { id: 'SP003', name: 'Lắc tay bạc Basic', category: 'Lắc tay', msgs: 943, responseRate: '82.3%', closeRate: '8.7%', sold: 82, revenue: '82.000.000đ', revenuePerUnit: '1.000.000đ', aiScore: 84, trend: '→' },
  { id: 'SP004', name: 'Bông tai bạc Tiny', category: 'Bông tai', msgs: 765, responseRate: '78.6%', closeRate: '7.3%', sold: 56, revenue: '56.000.000đ', revenuePerUnit: '1.000.000đ', aiScore: 78, trend: '↓' },
  { id: 'SP005', name: 'Nhẫn bạc đá CZ', category: 'Nhẫn', msgs: 652, responseRate: '76.1%', closeRate: '6.1%', sold: 40, revenue: '40.000.000đ', revenuePerUnit: '1.000.000đ', aiScore: 73, trend: '→' },
  { id: 'SP006', name: 'Vòng tay bạc Charm', category: 'Vòng tay', msgs: 512, responseRate: '74.8%', closeRate: '5.2%', sold: 26, revenue: '26.000.000đ', revenuePerUnit: '1.000.000đ', aiScore: 68, trend: '↓' },
];

export const productTopRevenue = [
  { rank: 1, name: 'Nhẫn bạc Classic', revenue: '156.000.000đ', sold: '156 đã bán' },
  { rank: 2, name: 'Dây chuyền Minimal', revenue: '112.000.000đ', sold: '112 đã bán' },
  { rank: 3, name: 'Lắc tay bạc Basic', revenue: '82.000.000đ', sold: '82 đã bán' },
  { rank: 4, name: 'Bông tai bạc Tiny', revenue: '56.000.000đ', sold: '56 đã bán' },
  { rank: 5, name: 'Nhẫn bạc đá CZ', revenue: '40.000.000đ', sold: '40 đã bán' },
];

// ==================== REVENUE ====================
export const revenueKPIs = [
  { label: 'Tổng doanh thu từ chat', value: '1.248.500.000đ', change: '↑ 22.5%', icon: '💰', bg: '#f0fdf4' },
  { label: 'Tổng đơn chốt từ chat', value: '1.502 đơn', change: '↑ 18.6%', icon: '📦', bg: '#eef2ff' },
  { label: 'Giá trị đơn trung bình', value: '832.000đ', change: '↑ 3.3%', icon: '💵', bg: '#fffbeb' },
  { label: 'Tỷ lệ chốt doanh thu', value: '28.6%', change: '↑ 4.2%', icon: '📊', bg: '#faf5ff' },
  { label: 'Doanh thu từ quảng cáo', value: '786.000.000đ', change: '↑ 24.3%', icon: '📢', bg: '#fef2f2' },
  { label: 'Doanh thu từ organic', value: '462.500.000đ', change: '↑ 19.8%', icon: '🌱', bg: '#f0fdf4' },
  { label: 'ROI Chat (ROAS)', value: '5.2x', change: '↑ 0.8x', icon: '🎯', bg: '#fffbeb' },
];

export const revenueTrend = [
  { date: '01/05', revenue: 32, orders: 38, closeRate: 25 },
  { date: '05/05', revenue: 35, orders: 42, closeRate: 26 },
  { date: '10/05', revenue: 42, orders: 48, closeRate: 28 },
  { date: '15/05', revenue: 63, orders: 55, closeRate: 31 },
  { date: '20/05', revenue: 52, orders: 50, closeRate: 29 },
  { date: '25/05', revenue: 48, orders: 46, closeRate: 27 },
  { date: '31/05', revenue: 55, orders: 52, closeRate: 30 },
];

export const revenueByEmployee = [
  { name: 'Nguyễn Thu Hương', revenue: '254.800.000đ', orders: 312, closeRate: '32.1%', csat: '88/100' },
  { name: 'Trần Minh Quân', revenue: '198.500.000đ', orders: 241, closeRate: '29.7%', csat: '85/100' },
  { name: 'Lê Thảo Vy', revenue: '176.400.000đ', orders: 205, closeRate: '27.3%', csat: '82/100' },
  { name: 'Phạm Hoàng Nam', revenue: '142.300.000đ', orders: 168, closeRate: '25.6%', csat: '80/100' },
  { name: 'Vũ Bình Khoa', revenue: '118.600.000đ', orders: 132, closeRate: '23.1%', csat: '75/100' },
];

export const revenueByPage = [
  { name: 'Vienchibao Jewelry', revenue: '456.200.000đ', msgs: 4256, closeRate: '29.4%', score: '87/100' },
  { name: 'Vienchibao Official', revenue: '397.300.000đ', msgs: 2148, closeRate: '27.8%', score: '85/100' },
  { name: 'Facebook Page', revenue: '395.000.000đ', msgs: 3200, closeRate: '25.6%', score: '82/100' },
];

export const revenueFunnel = [
  { label: 'Tin nhắn', value: 18625, pct: '100%' },
  { label: 'Quan tâm', value: 6245, pct: '33.5%' },
  { label: 'Báo giá', value: 3248, pct: '17.4%' },
  { label: 'Chốt đơn', value: 1502, pct: '8.1%' },
  { label: 'Thanh toán', value: 1412, pct: '7.6%' },
  { label: 'Mua lại', value: 486, pct: '2.6%' },
];

// ==================== WARRANTY ====================
export const warrantyKPIs = [
  { label: 'Tổng yêu cầu bảo hành', value: '356', change: '↑ 18.6%', icon: '🔧', bg: '#eef2ff' },
  { label: 'Đang xử lý', value: '82', change: '↑ 12.3%', icon: '⏳', bg: '#fffbeb' },
  { label: 'Hoàn thành', value: '248', change: '↑ 22.1%', icon: '✅', bg: '#f0fdf4' },
  { label: 'Khách tiêu cực', value: '26', change: '↓ 8.7%', icon: '😞', bg: '#fef2f2' },
  { label: 'Tỷ lệ xử lý đúng hạn', value: '92%', change: '↑ 6.2%', icon: '⏰', bg: '#f0fdf4' },
  { label: 'Thời gian xử lý TB', value: '2.4 ngày', change: '↓ 0.6 ngày', icon: '📅', bg: '#fffbeb' },
  { label: 'Tỷ lệ khách quay lại sau BH', value: '38%', change: '↑ 9.4%', icon: '🔄', bg: '#faf5ff' },
];

export const warrantyList = [
  { id: 1, customer: 'Nguyễn Thu Hương', phone: '0909 123 456', product: 'Nhẫn bạc Classic', size: 'Size 16', orderCode: '#VCB12568', reason: 'Nhỏ size', status: 'Đang xử lý', time: '2 ngày', employee: 'Trần Minh Quân', sentiment: 'Khá chờ...', priority: 'VIP' },
  { id: 2, customer: 'Lê Minh Châu', phone: '0933 456 789', product: 'Dây chuyền Bạc Minimal', size: '', orderCode: 'DC83821', reason: 'Đứt dây', status: 'Chờ xưởng', time: '3 ngày', employee: 'Vũ Thị Kim Anh', sentiment: 'Khó chịu', priority: '' },
  { id: 3, customer: 'Trần Quốc Anh', phone: '0981 654 321', product: 'Lắc tay bạc BASIC', size: 'XIn mầu', orderCode: '#VCB12540', reason: 'Xin mầu', status: 'Chờ xưởng', time: '3 ngày', employee: 'Lê Thảo Vy', sentiment: '', priority: '' },
  { id: 4, customer: 'Phạm Minh Đức', phone: '0987 654 321', product: 'Nhẫn bạc CZ', size: '', orderCode: '#VCB1515', reason: 'Rớt đá', status: 'Chờ xưởng', time: '', employee: '', sentiment: '', priority: '' },
  { id: 5, customer: 'Hoàng Hải Nam', phone: '0987 321 654', product: 'Vòng tay bạc Charm', size: 'Gãy mốc', orderCode: '', reason: 'Gãy mốc', status: 'Hoàn thành', time: '', employee: 'Nguyễn Văn Hào', sentiment: 'Hài lòng', priority: '' },
  { id: 6, customer: 'Nguyễn Thùy Linh', phone: '0922 111 222', product: 'Nhẫn bạc Classic', size: 'Nhỏ size', orderCode: '#VCB12477', reason: 'Nhỏ size', status: 'Chờ thường', time: '4 ngày', employee: 'Trần Minh Quân', sentiment: '', priority: 'VIP' },
];

export const warrantyProcess = [
  { step: 1, label: 'Khách báo lỗi', value: 356 },
  { step: 2, label: 'CSKH tiếp nhận', value: 356 },
  { step: 3, label: 'Xác minh', value: 284 },
  { step: 4, label: 'Xưởng xử lý', value: 103 },
  { step: 5, label: 'Gửi lại khách', value: 82 },
  { step: 6, label: 'Khách xác nhận', value: 64 },
];

export const warrantySentiment = [
  { label: 'Tích cực', value: 128, pct: '35.9%', color: '#22c55e' },
  { label: 'Bình thường', value: 142, pct: '39.9%', color: '#f59e0b' },
  { label: 'Tiêu cực', value: 60, pct: '16.9%', color: '#ef4444' },
  { label: 'Rất tiêu cực', value: 26, pct: '7.3%', color: '#dc2626' },
];

export const warrantyByProduct = [
  { name: 'Nhẫn bạc Classic', count: 128, pct: '4.8%', reason: 'Nhỏ size' },
  { name: 'Dây chuyền Bạc Minimal', count: 86, pct: '3.2%', reason: 'Đứt dây' },
  { name: 'Lắc tay bạc BASIC', count: 52, pct: '2.6%', reason: 'Xin mầu' },
  { name: 'Vòng tay bạc Charm', count: 34, pct: '2.1%', reason: 'Gãy mốc' },
  { name: 'Nhẫn bạc CZ', count: 28, pct: '1.7%', reason: 'Rớt đá' },
];

// ==================== ADS ====================
export const adsKPIs = [
  { label: 'Chi phí quảng cáo', value: '245.600.000đ', change: '↑ 12.5%', icon: '💸', bg: '#fef2f2' },
  { label: 'Tin nhắn từ QC', value: '1.851', change: '↑ 15.2%', icon: '📩', bg: '#eef2ff' },
  { label: 'Chi phí/tin nhắn', value: '132.700đ', change: '↓ 8.3%', icon: '📉', bg: '#f0fdf4' },
  { label: 'Tỷ lệ phản hồi', value: '82.4%', change: '↑ 5.1%', icon: '💬', bg: '#fffbeb' },
  { label: 'Tỷ lệ chốt', value: '28.6%', change: '↑ 4.2%', icon: '📦', bg: '#f0fdf4' },
  { label: 'Doanh thu từ chat', value: '786.000.000đ', change: '↑ 24.3%', icon: '💰', bg: '#f0fdf4' },
  { label: 'ROAS AI', value: '3.2x', change: '↑ 0.5x', icon: '🎯', bg: '#fffbeb' },
];

export const adsCampaigns = [
  { name: 'Nhẫn bạc Classic - Video 1', target: 'Nữ 25-35', cost: '28.600.000đ', msgs: 342, orders: 98, revenue: '203.500.000đ', quality: 4, toxic: '2.1%', roas: '7.1x' },
  { name: 'Dây chuyền Summer Sale', target: 'Nữ 18-30', cost: '24.100.000đ', msgs: 286, orders: 72, revenue: '162.800.000đ', quality: 4, toxic: '3.5%', roas: '6.8x' },
  { name: 'Lắc tay Minimal - Video 2', target: 'Nữ 20-35', cost: '18.500.000đ', msgs: 215, orders: 56, revenue: '98.400.000đ', quality: 3, toxic: '5.2%', roas: '5.3x' },
  { name: 'Bông tai Collection', target: 'Nữ 22-40', cost: '15.300.000đ', msgs: 186, orders: 42, revenue: '68.300.000đ', quality: 3, toxic: '4.8%', roas: '4.5x' },
  { name: 'TikTok - Trend Ring', target: 'Nữ 16-28', cost: '12.800.000đ', msgs: 325, orders: 35, revenue: '42.000.000đ', quality: 2, toxic: '8.5%', roas: '3.3x' },
];

// ==================== REPORTS ====================
export const reportTypes = [
  { icon: '📊', title: 'Báo cáo hội thoại', desc: 'Tổng hợp số liệu hội thoại', count: 12 },
  { icon: '👥', title: 'Báo cáo khách hàng', desc: 'Phân tích khách hàng', count: 8 },
  { icon: '👤', title: 'Báo cáo nhân viên', desc: 'Hiệu suất nhân viên', count: 6 },
  { icon: '📘', title: 'Báo cáo page', desc: 'Hiệu suất theo page', count: 5 },
  { icon: '📢', title: 'Báo cáo quảng cáo', desc: 'Hiệu quả ads', count: 7 },
  { icon: '📦', title: 'Báo cáo sản phẩm', desc: 'Hiệu suất sản phẩm', count: 4 },
  { icon: '💰', title: 'Báo cáo doanh thu', desc: 'Phân tích doanh thu', count: 9 },
  { icon: '😊', title: 'Báo cáo cảm xúc', desc: 'Phân tích sentiment', count: 3 },
  { icon: '📈', title: 'Báo cáo xu hướng', desc: 'Xu hướng & dự đoán', count: 5 },
];

// ==================== SETTINGS ====================
export const settingsTabs = [
  'Cài đặt hệ thống', 'AI & Chấm điểm', 'Cài đặt kênh', 'Hội thoại', 'Quảng cáo',
  'Sản phẩm', 'Bảo hành', 'Automation', 'Phân quyền', 'Thông báo', 'Tích hợp',
];

export const qaPrompts = [
  { name: 'Prompt phân tích hội thoại', desc: 'AI phân tích và đánh giá chất lượng hội thoại' },
  { name: 'Prompt chấm điểm CSKH', desc: 'AI chấm điểm dựa trên tiêu chí và trọng số' },
  { name: 'Prompt gợi ý trả lời', desc: 'AI gợi ý câu trả lời phù hợp ngữ cảnh' },
  { name: 'Prompt phân tích cảm xúc', desc: 'AI nhận diện cảm xúc khách hàng' },
  { name: 'Prompt tạo summary', desc: 'AI tóm tắt nội dung hội thoại' },
];

export const qaCriteria = [
  { id: 1, name: 'Chào hỏi', weight: 10, desc: 'Chào hỏi, tạo thiện cảm', active: true },
  { id: 2, name: 'Khai thác nhu cầu', weight: 25, desc: 'Hỏi đúng, nắm thắc mắc', active: true },
  { id: 3, name: 'Tư vấn giải pháp', weight: 20, desc: 'Tư vấn đúng nhu cầu', active: true },
  { id: 4, name: 'Xử lý từ chối', weight: 10, desc: 'Xử lý khéo léo', active: true },
  { id: 5, name: 'Chốt đơn', weight: 25, desc: 'Dẫn đến chốt hiệu quả', active: true },
  { id: 6, name: 'Follow-up & chăm sóc', weight: 10, desc: 'Quan tâm, theo dõi sau bán', active: true },
];

export const settingsQuickLinks = [
  { icon: '📢', title: 'Cài đặt Quảng cáo', desc: 'Kết nối, mapping và theo dõi nguồn quảng cáo' },
  { icon: '📦', title: 'Cài đặt Sản phẩm', desc: 'Quản lý danh mục, thuộc tính và AI matching' },
  { icon: '🔧', title: 'Cài đặt Bảo hành', desc: 'Thiết lập quy trình, SLA và biểu mẫu' },
  { icon: '🤖', title: 'Automation Center', desc: 'Thiết lập quy tắc tự động và lịch bán' },
  { icon: '🔐', title: 'Phân quyền & Vai trò', desc: 'Quản lý người dùng, vai trò và quyền' },
  { icon: '🔔', title: 'Thông báo', desc: 'Cấu hình thông báo theo kênh và mức độ' },
  { icon: '🔗', title: 'Tích hợp', desc: 'Kết nối với các nền tảng bên thứ ba' },
  { icon: '🧠', title: 'AI Learning', desc: 'Quản lý dữ liệu huấn luyện và mô hình AI' },
  { icon: '💾', title: 'Sao lưu & Dữ liệu', desc: 'Quản lý sao lưu, xuất dữ liệu và API' },
  { icon: '📋', title: 'Nhật ký hệ thống', desc: 'Xem nhật ký hoạt động và thay đổi' },
];

export const insightProducts = [
  { name: 'Nhẫn bạc Kim Hoàn Trọn Classic', emoji: '💍', visits: 1125, closeRate: '31.4%', revenue: '585.000.000đ' },
  { name: 'Dây chuyền bạc nữ Minimal', emoji: '📿', visits: 856, closeRate: '28.1%', revenue: '456.000.000đ' },
  { name: 'Lắc tay bạc BASIC', emoji: '⌚', visits: 741, closeRate: '27.2%', revenue: '312.000.000đ' },
  { name: 'Bông tai bạc Tiny', emoji: '✨', visits: 623, closeRate: '26.5%', revenue: '128.000.000đ' },
  { name: 'Nhẫn bạc đính đá CZ', emoji: '💎', visits: 512, closeRate: '24.6%', revenue: '98.000.000đ' },
];
