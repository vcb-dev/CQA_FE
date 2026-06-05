import { useState, useEffect } from 'react';
import {
  MagnifyingGlass, FloppyDisk, Sparkle, CheckCircle, CaretRight, Sliders, Play, GearSix,
  Shield, HardDrive, ArrowsCounterClockwise, Megaphone, Package, Wrench, Brain, Key,
  Bell, Link, ClipboardText, Lightbulb
} from '@phosphor-icons/react';
import { settingsTabs, qaPrompts, qaCriteria, settingsQuickLinks } from '../../data/mockData';

export default function SettingsPage() {
  const [anim, setAnim] = useState(false);
  const [activeTabIdx, setActiveTabIdx] = useState(1); // Default to AI & Quality settings
  const [criteria, setCriteria] = useState(qaCriteria);
  const [prompts, setPrompts] = useState(qaPrompts);
  const [selectedPromptIdx, setSelectedPromptIdx] = useState(0);
  const [promptContent, setPromptContent] = useState(
    `Bạn là một chuyên gia đánh giá chất lượng chăm sóc khách hàng của thương hiệu trang sức VIENCHIBAO. Hãy phân tích đoạn hội thoại chat giữa Nhân viên tư vấn (Agent) và Khách hàng (Customer) để chấm điểm và rút ra nhận xét.

Các tiêu chí cần đánh giá:
1. Chào hỏi thân thiện, tạo thiện cảm ban đầu (Trọng số 10%)
2. Khai thác nhu cầu, hỏi rõ thắc mắc về size, chất liệu (Trọng số 25%)
3. Tư vấn giải pháp, gửi ảnh thật, báo giá đúng sản phẩm (Trọng số 20%)
4. Xử lý từ chối khéo léo khi khách hàng chần chừ về giá (Trọng số 10%)
5. Kỹ năng dẫn dắt chốt đơn, chốt size, tạo đơn hàng thành công (Trọng số 25%)
6. Theo dõi chăm sóc sau bán (Trọng số 10%)

Đầu ra định dạng JSON chứa điểm tổng quan, điểm từng tiêu chí, lý do chi tiết, ưu điểm và điểm cần cải thiện.`
  );
  
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro');
  const [showSavedNotification, setShowSavedNotification] = useState(false);
  const [autoAssign, setAutoAssign] = useState(true);
  const [backupFreq, setBackupFreq] = useState('daily');

  useEffect(() => {
    setTimeout(() => setAnim(true), 200);
  }, []);

  const handleWeightChange = (id, newWeight) => {
    setCriteria(prev => prev.map(c => c.id === id ? { ...c, weight: parseInt(newWeight) || 0 } : c));
  };

  const handleSaveSettings = () => {
    setShowSavedNotification(true);
    setTimeout(() => {
      setShowSavedNotification(false);
    }, 3000);
  };

  const currentCriteriaTotalWeight = criteria.reduce((sum, c) => sum + (c.active ? c.weight : 0), 0);

  return (
    <div style={{ display: 'flex', gap: '14px', height: '100%' }}>
      {/* Left - Settings Tabs Navigation */}
      <div className="card" style={{ width: '220px', minWidth: '220px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '12px' }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--n-800)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GearSix size={16} weight="duotone" style={{ color: 'var(--primary-600)' }} />
          Cấu hình hệ thống
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'auto' }}>
          {settingsTabs.map((tab, idx) => (
            <div 
              key={idx}
              onClick={() => setActiveTabIdx(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 10px',
                borderRadius: '8px',
                cursor: 'pointer',
                background: activeTabIdx === idx ? 'var(--primary-50)' : 'transparent',
                color: activeTabIdx === idx ? 'var(--primary-700)' : 'var(--n-700)',
                fontWeight: activeTabIdx === idx ? 600 : 500,
                fontSize: '13px',
                transition: 'all var(--tr-fast)'
              }}
            >
              <span>{tab}</span>
              {activeTabIdx === idx && <CaretRight size={14} />}
            </div>
          ))}
        </div>

        <button 
          onClick={handleSaveSettings}
          style={{ 
            marginTop: '10px', 
            padding: '8px', 
            borderRadius: '6px', 
            fontSize: '13px', 
            fontWeight: 700, 
            background: 'var(--primary-600)', 
            color: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '6px' 
          }}
        >
          <FloppyDisk size={14} /> Lưu tất cả
        </button>
      </div>

      {/* Center - Detailed settings parameters based on tab */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto', minWidth: 0 }}>
        {showSavedNotification && (
          <div style={{ padding: '10px 14px', background: 'var(--success-50)', border: '1px solid var(--success-100)', color: 'var(--success-600)', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.3s ease' }}>
            <CheckCircle size={16} weight="duotone" />
            Đã cập nhật cấu hình hệ thống thành công! Tất cả các mô hình chấm điểm AI đang tự động học lại theo tiêu chí mới.
          </div>
        )}

        {/* Cài đặt Hệ thống (Tab 0) */}
        {activeTabIdx === 0 && (
          <div className="card anim-up" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ borderBottom: '1px solid var(--n-100)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--n-900)' }}>Cài đặt hệ thống chung</h3>
              <p style={{ fontSize: '11px', color: 'var(--n-500)' }}>Quản lý hoạt động phân phối, múi giờ và tần suất sao lưu</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--n-700)' }}>Tên nền tảng (Platform Title)</span>
                <input style={{ padding: '8px', background: 'var(--n-50)', border: '1px solid var(--n-200)', borderRadius: '6px', fontSize: '12.5px', color: 'var(--n-800)' }} defaultValue="VIENCHIBAO Chat Quality Agent Platform" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--n-700)' }}>Múi giờ</span>
                  <select style={{ padding: '8px', background: 'var(--n-50)', border: '1px solid var(--n-200)', borderRadius: '6px', fontSize: '12.5px', color: 'var(--n-800)' }} defaultValue="gmt7">
                    <option value="gmt7">(GMT+07:00) Hà Nội, Bangkok, Jakarta</option>
                    <option value="gmt8">(GMT+08:00) Singapore, Manila, Beijing</option>
                    <option value="gmt0">(GMT+00:00) UTC Greenwich Mean Time</option>
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--n-700)' }}>Tần suất sao lưu hệ thống</span>
                  <select 
                    value={backupFreq} 
                    onChange={(e) => setBackupFreq(e.target.value)}
                    style={{ padding: '8px', background: 'var(--n-50)', border: '1px solid var(--n-200)', borderRadius: '6px', fontSize: '12.5px', color: 'var(--n-800)' }}
                  >
                    <option value="hourly">Hàng giờ</option>
                    <option value="daily">Hàng ngày (Vào lúc 00:00)</option>
                    <option value="weekly">Hàng tuần (Chủ nhật)</option>
                    <option value="monthly">Hàng tháng (Ngày 1)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'var(--n-50)', borderRadius: '8px' }}>
                <input 
                  type="checkbox" 
                  id="autoAssign" 
                  checked={autoAssign} 
                  onChange={(e) => setAutoAssign(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }} 
                />
                <label htmlFor="autoAssign" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--n-800)' }}>Tự động phân phối hội thoại (Smart Routing AI)</span>
                  <span style={{ fontSize: '10.5px', color: 'var(--n-500)' }}>Tự động gán hội thoại mới từ QC cho nhân viên đang rảnh và có tỷ lệ chốt sản phẩm đó cao nhất</span>
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'var(--n-50)', borderRadius: '8px' }}>
                <input 
                  type="checkbox" 
                  id="slackAlerts" 
                  defaultChecked={true}
                  style={{ width: 16, height: 16, cursor: 'pointer' }} 
                />
                <label htmlFor="slackAlerts" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--n-800)' }}>Thông báo cảnh báo tiêu cực tức thời</span>
                  <span style={{ fontSize: '10.5px', color: 'var(--n-500)' }}>Gửi thông báo gấp về kênh Slack quản lý ngay khi AI phát hiện hội thoại có cảm xúc &quot;Rất tiêu cực&quot;</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* AI & Chấm điểm (Tab 1) */}
        {activeTabIdx === 1 && (
          <>
            {/* Criteria weights setting */}
            <div className="card anim-up" style={{ padding: '14px', animationDelay: '50ms' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--n-100)', paddingBottom: '6px', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--n-900)' }}>Thiết lập Tiêu chí & Trọng số chấm điểm</h3>
                  <p style={{ fontSize: '10.5px', color: 'var(--n-500)' }}>Chỉnh sửa hệ thống thang điểm đánh giá cuộc hội thoại của Agent (Tổng trọng số phải bằng 100%)</p>
                </div>
                
                <span className="tag" style={{ 
                  background: currentCriteriaTotalWeight === 100 ? 'var(--success-50)' : 'var(--danger-50)',
                  color: currentCriteriaTotalWeight === 100 ? 'var(--success-600)' : 'var(--danger-600)',
                  fontWeight: 700,
                  fontSize: '12px'
                }}>
                  Tổng trọng số: {currentCriteriaTotalWeight}% {currentCriteriaTotalWeight === 100 ? '✓' : '⚠️'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {criteria.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '6px 8px', background: 'var(--n-50)', borderRadius: '6px' }}>
                    <input 
                      type="checkbox" 
                      checked={c.active} 
                      onChange={(e) => {
                        setCriteria(prev => prev.map(item => item.id === c.id ? { ...item, active: e.target.checked } : item));
                      }}
                      style={{ width: 14, height: 14, cursor: 'pointer' }}
                    />
                    <div style={{ width: '130px', minWidth: '130px' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: c.active ? 'var(--n-800)' : 'var(--n-400)' }}>{c.name}</div>
                      <div style={{ fontSize: '9.5px', color: 'var(--n-400)' }}>{c.desc}</div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="range" 
                        min="0" 
                        max="50" 
                        disabled={!c.active}
                        value={c.weight} 
                        onChange={(e) => handleWeightChange(c.id, e.target.value)}
                        style={{ flex: 1, height: '4px', cursor: c.active ? 'pointer' : 'default', accentColor: 'var(--primary-600)' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: c.active ? 'var(--n-800)' : 'var(--n-400)', minWidth: '30px', textAlign: 'right' }}>
                        {c.weight}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Model selector & System Prompts templates */}
            <div className="card anim-up" style={{ padding: '14px', animationDelay: '150ms', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ borderBottom: '1px solid var(--n-100)', paddingBottom: '6px' }}>
                <h3 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--n-900)' }}>Cấu hình Mô hình & AI System Prompts</h3>
                <p style={{ fontSize: '10.5px', color: 'var(--n-500)' }}>Tùy chọn LLM làm nhiệm vụ chấm điểm tự động và chỉnh sửa hướng dẫn Prompt mẫu</p>
              </div>

              {/* Model selection */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--primary-50)', padding: '10px', borderRadius: '8px' }}>
                <Sparkle size={18} weight="duotone" style={{ color: 'var(--primary-600)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--primary-900)' }}>Trí tuệ nhân tạo chấm điểm (LLM Audit Engine)</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--primary-700)' }}>Lựa chọn model phù hợp nhất cho bài toán đánh giá ngữ cảnh hội thoại phức tạp</div>
                </div>
                <select 
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: '6px', background: '#fff', border: '1px solid var(--primary-200)', fontSize: '12px', fontWeight: 600, color: 'var(--primary-800)', cursor: 'pointer' }}
                >
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Khuyên dùng)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Tốc độ cao)</option>
                  <option value="claude-3.5-sonnet">Claude 3.5 Sonnet (Đọc sâu)</option>
                  <option value="gpt-4o">GPT-4o (Đa dụng)</option>
                </select>
              </div>

              {/* Prompts config */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ width: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--n-500)', textTransform: 'uppercase' }}>Danh sách Prompt mẫu</span>
                  {prompts.map((p, idx) => (
                    <button 
                      key={idx}
                      onClick={() => {
                        setSelectedPromptIdx(idx);
                        // Just change mock template content slightly to simulate prompt load
                        if (idx === 0) setPromptContent(`Bạn là một chuyên gia đánh giá chất lượng chăm sóc khách hàng của thương hiệu trang sức VIENCHIBAO. Hãy phân tích đoạn hội thoại chat giữa Nhân viên tư vấn (Agent) và Khách hàng (Customer) để chấm điểm và rút ra nhận xét.

Các tiêu chí cần đánh giá:
1. Chào hỏi thân thiện, tạo thiện cảm ban đầu (Trọng số 10%)
2. Khai thác nhu cầu, hỏi rõ thắc mắc về size, chất liệu (Trọng số 25%)
3. Tư vấn giải pháp, gửi ảnh thật, báo giá đúng sản phẩm (Trọng số 20%)
4. Xử lý từ chối khéo léo khi khách hàng chần chừ về giá (Trọng số 10%)
5. Kỹ năng dẫn dắt chốt đơn, chốt size, tạo đơn hàng thành công (Trọng số 25%)
6. Theo dõi chăm sóc sau bán (Trọng số 10%)

Đầu ra định dạng JSON chứa điểm tổng quan, điểm từng tiêu chí, lý do chi tiết, ưu điểm và điểm cần cải thiện.`);
                        else if (idx === 1) setPromptContent(`Hướng dẫn chấm điểm CSKH cho AI:
- Nhận diện các câu nói nhạy cảm, thiếu lịch sự hoặc chậm trễ phản hồi (trên 15 phút).
- Chấm điểm nghiêm khắc các lỗi không chào hỏi và kết thúc hội thoại hời hợt.
- Kiểm tra nhân viên có chủ động tư vấn ưu đãi/ship hay không.`);
                        else setPromptContent(`Prompt gợi ý trả lời tự động cho Agent:
- Dựa trên câu hỏi khách hàng về: giá, size nhẫn, bảo hành, chất liệu.
- Tra cứu nhanh bảng size nhẫn tiêu chuẩn và tóm tắt ngắn gọn trong 2-3 câu, giọng điệu ấm áp và chuyên nghiệp.
- Luôn kết thúc bằng một câu hỏi gợi mở chốt đơn.`);
                      }}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        textAlign: 'left',
                        fontSize: '12px',
                        fontWeight: selectedPromptIdx === idx ? 600 : 500,
                        background: selectedPromptIdx === idx ? 'var(--primary-100)' : 'transparent',
                        color: selectedPromptIdx === idx ? 'var(--primary-700)' : 'var(--n-600)',
                        border: selectedPromptIdx === idx ? '1px solid var(--primary-200)' : '1px solid transparent',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Lightbulb size={12} weight={selectedPromptIdx === idx ? 'fill' : 'duotone'} />
                        <span>{p.name}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--n-500)', textTransform: 'uppercase' }}>HƯỚNG DẪN PROMPT HỆ THỐNG</span>
                  <textarea 
                    value={promptContent}
                    onChange={(e) => setPromptContent(e.target.value)}
                    style={{ 
                      flex: 1, 
                      minHeight: '160px', 
                      background: 'var(--n-50)', 
                      border: '1px solid var(--n-200)', 
                      borderRadius: '6px', 
                      padding: '8px', 
                      fontSize: '12px', 
                      fontFamily: 'monospace',
                      color: 'var(--n-800)',
                      lineHeight: 1.45,
                      resize: 'none'
                    }} 
                  />
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '12px', background: 'var(--n-100)', color: 'var(--n-700)', fontWeight: 500 }}>Khôi phục mặc định</button>
                    <button onClick={handleSaveSettings} style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '12px', background: 'var(--primary-600)', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}><Play size={10} weight="fill" /> Lưu và Thử nghiệm</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Phân quyền (Tab 7) */}
        {activeTabIdx === 7 && (
          <div className="card anim-up" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ borderBottom: '1px solid var(--n-100)', paddingBottom: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--n-900)' }}>Phân quyền & Quản trị viên</h3>
              <p style={{ fontSize: '11px', color: 'var(--n-500)' }}>Quản lý vai trò truy cập nền tảng và gán quyền cho nhân viên</p>
            </div>

            <div style={{ overflow: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Người dùng</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Quyền chính</th>
                    <th>Hoạt động cuối</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Bùi Duy Cường', email: 'cuong@vienchibao.com', role: 'Admin', permission: 'Toàn bộ hệ thống, chỉnh sửa tiêu chí & API', active: 'Vừa xong' },
                    { name: 'Nguyễn Thu Hương', email: 'huongnt@vienchibao.com', role: 'Manager', permission: 'Xem báo cáo, phê duyệt audit nháp', active: '10 phút trước' },
                    { name: 'Lê Thảo Vy', email: 'vylt@vienchibao.com', role: 'Auditor', permission: 'Chấm điểm thủ công, đánh giá phụ', active: '30 phút trước' },
                    { name: 'Trần Minh Quân', email: 'quantm@vienchibao.com', role: 'Agent', permission: 'Chỉ xem điểm cá nhân và chat khách hàng', active: '2 giờ trước' },
                  ].map((user, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--n-800)' }}>{user.name}</div>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--n-500)' }}>{user.email}</td>
                      <td>
                        <span className="tag" style={{ 
                          background: user.role === 'Admin' ? 'var(--primary-100)' : user.role === 'Manager' ? 'var(--success-50)' : 'var(--n-100)', 
                          color: user.role === 'Admin' ? 'var(--primary-700)' : user.role === 'Manager' ? 'var(--success-600)' : 'var(--n-600)',
                          fontWeight: 700
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--n-600)' }}>{user.permission}</td>
                      <td style={{ fontSize: '11px', color: 'var(--n-400)' }}>{user.active}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <button style={{ padding: '6px', fontSize: '12.5px', color: 'var(--primary-600)', fontWeight: 600, border: '1px dashed var(--primary-300)', borderRadius: '6px', marginTop: '6px' }}>
              + Thêm người dùng mới / Gán vai trò
            </button>
          </div>
        )}

        {/* Mock for other tabs */}
        {activeTabIdx !== 0 && activeTabIdx !== 1 && activeTabIdx !== 7 && (
          <div className="card anim-up" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center' }}>
              <GearSix size={32} weight="duotone" style={{ color: 'var(--primary-600)' }} />
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--n-900)' }}>{settingsTabs[activeTabIdx]}</h3>
              <p style={{ fontSize: '12px', color: 'var(--n-400)', marginTop: '4px', maxWidth: '300px' }}>
                Hệ thống đang cấu hình các thông số mặc định tốt nhất cho thương hiệu Viên Chi Bảo. Bạn có thể sử dụng ngay lập tức hoặc nhấn nút kích hoạt để ghi đè.
              </p>
            </div>
            <button onClick={handleSaveSettings} style={{ padding: '6px 16px', background: 'var(--primary-600)', color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>Kích hoạt mặc định</button>
          </div>
        )}
      </div>

      {/* Right - Quick settings links and Backup status */}
      <div style={{ width: '280px', minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="card anim-up" style={{ padding: '14px', animationDelay: '200ms' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--n-800)', marginBottom: '8px' }}>Liên kết thiết lập nhanh</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {settingsQuickLinks.map((link, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '8px', 
                  padding: '6px', 
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background var(--tr-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--n-50)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {(() => {
                  const quickLinkIcons = {
                    '📢': Megaphone,
                    '📦': Package,
                    '🔧': Wrench,
                    '🤖': Brain,
                    '🔐': Key,
                    '🔔': Bell,
                    '🔗': Link,
                    '🧠': Brain,
                    '💾': HardDrive,
                    '📋': ClipboardText
                  };
                  const IconComp = quickLinkIcons[link.icon] || GearSix;
                  return <IconComp size={16} weight="duotone" style={{ color: 'var(--primary-600)', flexShrink: 0, marginTop: '2px' }} />;
                })()}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--n-800)' }}>{link.title}</div>
                  <div style={{ fontSize: '10px', color: 'var(--n-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Database Health Card */}
        <div className="card anim-up" style={{ padding: '14px', animationDelay: '250ms', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#fff' }}>
          <div style={{ fontWeight: 700, fontSize: '13px', color: 'rgba(255,255,255,0.9)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <HardDrive size={14} weight="duotone" /> Trạng thái dữ liệu
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px', color: 'rgba(255,255,255,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Dung lượng đã dùng:</span>
              <strong style={{ color: '#fff' }}>12.4 GB / 50 GB (24.8%)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Số hội thoại lưu trữ:</span>
              <strong style={{ color: '#fff' }}>52.362 chat</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Độ trễ API AI:</span>
              <strong style={{ color: 'var(--success-500)' }}>Tốt (84ms)</strong>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Sao lưu tự động:</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--success-500)' }}><CheckCircle size={10} weight="fill" /> Bật</span>
            </div>
          </div>
          <button style={{ width: '100%', padding: '6px', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: '4px', fontSize: '11px', fontWeight: 600, marginTop: '8px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <ArrowsCounterClockwise size={10} /> Sao lưu ngay lập tức
          </button>
        </div>
      </div>
    </div>
  );
}
