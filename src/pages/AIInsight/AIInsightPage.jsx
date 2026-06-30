import { useState, useEffect } from 'react';
import { PaperPlaneRight, Star, Brain, Sparkle, Lightbulb, Warning, TrendUp, MagnifyingGlass, CheckCircle, Smiley, SmileyMeh, SmileySad, Diamond } from '@phosphor-icons/react';
import {
  insightKPIs, customerConcerns, closeRateFactors,
  insightProducts, insightByCountry, customerSentiment,
  adEfficiency, aiAssistantMessages, aiSuggestedQuestions,
} from '../../data/mockData';
import AnalyticsShell from '@/components/analytics/AnalyticsShell';
import KpiGrid from '@/components/analytics/KpiGrid';

const kpiIconMap = [
  Lightbulb,       // 💡 Insight mới
  Warning,         // ⚠️ Vấn đề rủi ro
  TrendUp,         // 📈 Xu hướng tăng mạnh
  MagnifyingGlass  // 🔍 Hội thoại bất thường
];

const kpiColors = [
  'var(--primary-500)',
  '#ef4444',
  '#22c55e',
  '#f59e0b'
];

const videoContentInsights = [
  {
    question: 'Bạc 925 có bị đen không, đeo tắm được không?',
    mentions: 1836,
    audience: 'Khách mới mua bạc lần đầu',
    angle: 'Giải thích thật, không né nhược điểm',
    hook: 'Bạc 925 bị đen không phải là bạc giả. Đây là lý do.',
    script: [
      'Mở video bằng cảnh nhẫn bạc hơi xỉn màu sau khi đeo.',
      'Giải thích bạc 925 phản ứng với mồ hôi, mỹ phẩm và môi trường lưu huỳnh.',
      'Demo lau sáng bằng khăn chuyên dụng trong 10 giây.',
      'Chốt bằng chính sách bảo hành đánh sáng trọn đời.'
    ],
    cta: 'Inbox shop để được gửi cách bảo quản bạc 925 miễn phí.'
  },
  {
    question: 'Không biết chọn size nhẫn như thế nào?',
    mentions: 1422,
    audience: 'Khách mua online, khách nước ngoài',
    angle: 'Video hướng dẫn đo size tại nhà',
    hook: 'Chỉ cần một sợi chỉ là đo được size nhẫn chuẩn tại nhà.',
    script: [
      'Cầm sợi chỉ/quấn quanh ngón tay tại vị trí đeo nhẫn.',
      'Đánh dấu điểm giao, đo chiều dài bằng thước.',
      'Đối chiếu bảng size Việt Nam, Nhật, US.',
      'Nhắc khách gửi số đo để nhân viên check lại trước khi chốt.'
    ],
    cta: 'Comment số đo, shop quy đổi size giúp bạn.'
  },
  {
    question: 'Mua làm quà tặng thì có hộp, thiệp không?',
    mentions: 1187,
    audience: 'Khách mua tặng người yêu, sinh nhật',
    angle: 'Unbox combo quà tặng',
    hook: 'Một món quà bạc nhìn chỉn chu hơn rất nhiều nếu gói đúng cách.',
    script: [
      'Quay close-up sản phẩm, hộp nơ, thiệp viết tay.',
      'Gợi ý 3 dịp tặng: sinh nhật, kỷ niệm, tốt nghiệp.',
      'Nhắc có thể khắc tên hoặc chọn thiệp riêng.',
      'Chốt bằng ưu đãi hộp quà cho đơn trong ngày.'
    ],
    cta: 'Nhắn "quà tặng" để shop gợi ý mẫu phù hợp.'
  },
  {
    question: 'Sản phẩm có giống ảnh/video quảng cáo không?',
    mentions: 964,
    audience: 'Khách đến từ ads, còn nghi ngại',
    angle: 'So sánh quảng cáo và ảnh thật',
    hook: 'Đây là sản phẩm ngoài đời, không filter, không chỉnh màu.',
    script: [
      'Đặt clip quảng cáo bên trái, video quay thật bên phải.',
      'Quay sản phẩm dưới ánh sáng tự nhiên và ánh sáng trong nhà.',
      'Zoom chất liệu, đá, khóa và độ hoàn thiện.',
      'Nhắc khách có thể yêu cầu video thật trước khi lên đơn.'
    ],
    cta: 'Inbox mã mẫu, shop gửi video thật trước khi bạn quyết định.'
  },
  {
    question: 'Chính sách đổi size, bảo hành như thế nào?',
    mentions: 812,
    audience: 'Khách sắp chốt nhưng sợ rủi ro',
    angle: 'Video xóa rào cản mua hàng',
    hook: 'Mua nhẫn online sợ sai size? Shop xử lý thế này.',
    script: [
      'Nêu nỗi lo phổ biến: sai size, bạc xỉn, giao hàng quốc tế.',
      'Giải thích đổi size miễn phí trong 7 ngày nếu đủ điều kiện.',
      'Nhắc bảo hành đánh sáng trọn đời cho bạc 925.',
      'Kết bằng quy trình 3 bước khi cần đổi/bảo hành.'
    ],
    cta: 'Lưu video này trước khi đặt nhẫn online.'
  }
];

function ConcernDonut({ data, total }) {
  const r = 55, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="concern-donut">
      <div className="concern-chart" style={{ width: 140, height: 140 }}>
        <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="70" cy="70" r={r} fill="none" stroke="#f3f4f6" strokeWidth="18" />
          {data.map((d, i) => {
            const dash = (d.pct / 132) * c; // normalize so total doesn't exceed circle
            const o = offset;
            offset += dash;
            return <circle key={i} cx="70" cy="70" r={r} fill="none" stroke={d.color} strokeWidth="18" strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-o} />;
          })}
        </svg>
        <div className="concern-center">
          <div className="num">{total.toLocaleString()}</div>
          <div className="lbl">Tổng đề cập</div>
        </div>
      </div>
      <div className="concern-legend">
        {data.map((d, i) => (
          <div key={i} className="concern-legend-item">
            <div className="concern-legend-dot" style={{ background: d.color }} />
            <span style={{ flex: 1, fontSize: '12px', color: '#374151' }}>{d.label}</span>
            <span className="concern-legend-pct">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIChat() {
  const [msgs, setMsgs] = useState(aiAssistantMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMsgs([...msgs, { sender: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMsgs(prev => [...prev, { sender: 'ai', text: 'Đang phân tích dữ liệu... Tôi sẽ trả lời trong giây lát.' }]);
    }, 800);
  };

  return (
    <div className="ai-chat-panel">
      <div className="ai-chat-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Brain size={20} weight="duotone" style={{ color: '#4f46e5' }} />
        <div>
          <strong>AI Assistant</strong>
          <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 400, marginTop: '2px' }}>Hỏi gì cũng biết về dữ liệu hội thoại</div>
        </div>
      </div>
      <div className="ai-chat-messages">
        {msgs.map((m, i) => (
          <div key={i} className={`ai-chat-msg ${m.sender === 'ai' ? 'ai' : 'user'}`}>{m.text}</div>
        ))}
      </div>
      <div className="ai-suggestions">
        {aiSuggestedQuestions.map((q, i) => (
          <button key={i} className="ai-suggestion-btn" onClick={() => setInput(q)}>{q}</button>
        ))}
      </div>
      <div className="ai-chat-input">
        <input placeholder="Hỏi AI về dữ liệu hội thoại..." value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
        <button className="send" onClick={handleSend}><PaperPlaneRight size={16} /></button>
      </div>
    </div>
  );
}

export default function AIInsightPage() {
  const [anim, setAnim] = useState(false);
  useEffect(() => { setTimeout(() => setAnim(true), 200); }, []);

  const kpiItems = insightKPIs.map((kpi, i) => ({
    ...kpi,
    icon: kpiIconMap[i],
    color: kpiColors[i],
    change: `${kpi.change} ${kpi.sub}`,
    changePositive: kpi.change.includes('↑'),
  }));

  return (
    <AnalyticsShell>
    <div style={{ display: 'flex', gap: '14px', height: '100%' }}>
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto', minWidth: 0 }}>
        {/* Intro */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ padding: '12px 16px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkle size={14} weight="duotone" style={{ color: '#4f46e5', flexShrink: 0 }} />
              <span><strong>Tổng quan AI Insight</strong> — AI đã phân tích <strong>52.362</strong> hội thoại trong khoảng thời gian 01/05/2026 - 31/05/2026</span>
            </div>
          </div>
        </div>

        <KpiGrid items={kpiItems} columns={4} />

        {/* Row: Concern Donut + Close Rate Factors */}
        <div style={{ display: 'flex', gap: '14px' }}>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 1, animationDelay: '300ms' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Khách hàng quan tâm điều gì nhất?</span>
              <MagnifyingGlass size={13} weight="bold" style={{ color: '#4f46e5' }} />
              <span className="card-link" style={{ marginLeft: 'auto' }}>Xem chi tiết</span>
            </div>
            <ConcernDonut data={customerConcerns.items} total={customerConcerns.total} />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 1.2, animationDelay: '350ms' }}>
            <div className="card-title">Vì sao tỷ lệ chốt thay đổi? <span className="card-link">Xem chi tiết</span></div>
            <div className="factors-grid">
              <div className="factor-col">
                <h4 style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle size={14} weight="fill" />
                  <span>Các yếu tố giúp chốt cao</span>
                </h4>
                {closeRateFactors.highClose.map((f, i) => (
                  <div key={i} className="factor-item">
                    <span className="name">{f.label}</span>
                    <span className="pct" style={{ color: '#16a34a' }}>↑ {f.pct}%</span>
                  </div>
                ))}
              </div>
              <div className="factor-col">
                <h4 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Warning size={14} weight="fill" />
                  <span>Các lý do mất đơn hàng</span>
                </h4>
                {closeRateFactors.lostOrders.map((f, i) => (
                  <div key={i} className="factor-item">
                    <span className="name">{f.label}</span>
                    <span className="pct" style={{ color: '#dc2626' }}>{f.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row: Turn customer questions into video content */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '380ms' }}>
          <div className="card-title" style={{ alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkle size={14} weight="duotone" style={{ color: '#4f46e5' }} />
              Biến insight khách hàng thành content video
            </span>
            <span className="card-link">Xuất lịch nội dung</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.4fr', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {videoContentInsights.map((item, i) => (
                <div key={i} style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '10px',
                  background: i === 0 ? '#eef2ff' : '#fff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '5px' }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#111827', lineHeight: 1.35 }}>{item.question}</div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#4f46e5', whiteSpace: 'nowrap' }}>{item.mentions.toLocaleString()} hỏi</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.45 }}>
                    Nhóm khách: <strong>{item.audience}</strong>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '12px', color: '#d97706', background: '#fffbeb', borderRadius: '6px', padding: '5px 7px', fontWeight: 700 }}>
                    Góc video: {item.angle}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {videoContentInsights.slice(0, 4).map((item, i) => (
                <div key={i} style={{ border: '1px solid #bfdbfe', background: '#eff6ff', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: 800, marginBottom: '5px' }}>Kịch bản video #{i + 1}</div>
                  <div style={{ fontSize: '14px', color: '#1e3a8a', fontWeight: 900, lineHeight: 1.35, marginBottom: '8px' }}>{item.hook}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {item.script.map((step, stepIndex) => (
                      <div key={stepIndex} style={{ display: 'flex', gap: '6px', fontSize: '12.2px', color: '#374151', lineHeight: 1.4 }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#dbeafe', color: '#1d4ed8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, flexShrink: 0 }}>{stepIndex + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: '8px', fontSize: '12px', color: '#16a34a', fontWeight: 800 }}>
                    CTA: {item.cta}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row: Products + Country Insights */}
        <div style={{ display: 'flex', gap: '14px' }}>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 1, animationDelay: '400ms' }}>
            <div className="card-title">Sản phẩm được quan tâm <span className="card-link">Xem chi tiết</span></div>
            <table className="data-table">
              <thead><tr><th>Sản phẩm</th><th>Lượt hỏi</th><th>Tỷ lệ chốt</th><th>Doanh thu</th></tr></thead>
              <tbody>
                {insightProducts.map((p, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Diamond size={13} weight="duotone" style={{ color: '#f59e0b' }} />
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td>{p.visits.toLocaleString()}</td>
                    <td style={{ fontWeight: 600 }}>{p.closeRate}</td>
                    <td>{p.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'center', marginTop: '8px' }}><span className="card-link">Xem tất cả sản phẩm</span></div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 1, animationDelay: '450ms' }}>
            <div className="card-title">Insight theo quốc gia</div>
            <div>
              {insightByCountry.map((c, i) => (
                <div key={i} className="country-row">
                  <span className="country-flag">{c.flag}</span>
                  <div className="country-info">
                    <div className="country-name">{c.country}</div>
                    <div className="country-insight">{c.insight}</div>
                  </div>
                  <span className="country-rate">{c.closeRate}</span>
                </div>
              ))}
              <div style={{ textAlign: 'center', marginTop: '8px' }}><span className="card-link">Xem tất cả quốc gia</span></div>
            </div>
          </div>
        </div>

        {/* Row: Sentiment + Ad Efficiency */}
        <div style={{ display: 'flex', gap: '14px' }}>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 1, animationDelay: '500ms' }}>
            <div className="card-title">Cảm xúc khách hàng (AI) <span className="card-link">Xem chi tiết</span></div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div className="sentiment-row" style={{ gap: '20px' }}>
                <div className="sentiment-item" style={{ gap: '3px' }}>
                  <Smiley size={24} weight="duotone" style={{ color: '#22c55e' }} />
                  <div className="sentiment-pct">68%</div>
                  <div className="sentiment-label">Tích cực</div>
                  <div className="sentiment-change up">↑ 6%</div>
                </div>
                <div className="sentiment-item" style={{ gap: '3px' }}>
                  <SmileyMeh size={24} weight="duotone" style={{ color: '#f59e0b' }} />
                  <div className="sentiment-pct">24%</div>
                  <div className="sentiment-label">Trung tính</div>
                  <div className="sentiment-change">↑ 2%</div>
                </div>
                <div className="sentiment-item" style={{ gap: '3px' }}>
                  <SmileySad size={24} weight="duotone" style={{ color: '#ef4444' }} />
                  <div className="sentiment-pct">8%</div>
                  <div className="sentiment-label">Tiêu cực</div>
                  <div className="sentiment-change down">↑ 2%</div>
                </div>
              </div>
              {/* Mini trend chart */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', textAlign: 'center' }}>Biến động cảm xúc theo ngày</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '80px' }}>
                  {[85, 78, 82, 90, 88, 92, 85, 80].map((v, i) => (
                    <div key={i} style={{ flex: 1, height: anim ? `${v * 0.8}px` : 0, background: 'linear-gradient(180deg,#22c55e,#16a34a)', borderRadius: '2px 2px 0 0', transition: 'height .6s ease', transitionDelay: `${i*50}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col animate-in fade-in slide-in-from-bottom-4" style={{ flex: 1, animationDelay: '550ms' }}>
            <div className="card-title">Hiệu quả quảng cáo (AI) <span className="card-link">Xem chi tiết</span></div>
            <table className="data-table">
              <thead><tr><th>Nguồn quảng cáo</th><th>Chất lượng khách</th><th>Tỷ lệ chốt</th><th>ROAS ước tính</th></tr></thead>
              <tbody>
                {adEfficiency.map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{a.name}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ display: 'flex', gap: '1px' }}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} size={10} weight={j < a.stars ? "fill" : "regular"} style={{ color: j < a.stars ? '#fbbf24' : '#e5e7eb' }} />
                          ))}
                        </div>
                        <span style={{ fontSize: '11px' }}>{a.quality}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{a.closeRate}</td>
                    <td style={{ fontWeight: 700, color: parseFloat(a.roas) >= 4 ? '#16a34a' : '#d97706' }}>{a.roas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: 'center', marginTop: '8px' }}><span className="card-link">Xem tất cả nguồn quảng cáo</span></div>
          </div>
        </div>
      </div>

      {/* AI Chat Panel */}
      <AIChat />
    </div>
    </AnalyticsShell>
  );
}
