import React, { useState, useRef, useEffect } from 'react';

// Bộ câu trả lời rule-based dựa theo từ khóa trong câu hỏi của khách.
// Có thể thay thế bằng API thật (OpenAI/Gemini) bằng cách gọi API trong hàm getBotReply.
const KNOWLEDGE_BASE = [
  { keywords: ['giá', 'bao nhiêu tiền', 'giá bán'], reply: 'AeroTune Pro Premium hiện có giá 4.990.000đ. Ngoài ra tụi mình còn có AeroTune Lite giá 1.990.000đ nếu bạn muốn phiên bản nhỏ gọn hơn nhé!' },
  { keywords: ['pin', 'sạc', 'thời lượng'], reply: 'AeroTune Pro cho thời lượng pin lên đến 40 giờ nghe nhạc, hỗ trợ sạc nhanh USB-C: chỉ 10 phút sạc là dùng được 5 giờ đó ạ.' },
  { keywords: ['chống ồn', 'anc', 'ồn'], reply: 'Sản phẩm dùng công nghệ Smart-ANC chống ồn chủ động lên đến 45dB, tự động thích ứng theo tiếng ồn xung quanh bạn.' },
  { keywords: ['chống nước', 'nước', 'ipx'], reply: 'AeroTune Pro đạt chuẩn chống nước IPX5, kháng mồ hôi rất tốt khi tập luyện thể thao.' },
  { keywords: ['bảo hành'], reply: 'Sản phẩm được bảo hành chính hãng 12 tháng, 1 đổi 1 trong 30 ngày đầu nếu có lỗi từ nhà sản xuất.' },
  { keywords: ['giao hàng', 'ship', 'vận chuyển'], reply: 'Tụi mình giao hàng toàn quốc, thường mất 2-4 ngày. Nội thành có thể nhận trong 24h.' },
  { keywords: ['màu', 'màu sắc'], reply: 'AeroTune Pro hiện có 3 màu: Đen Titan, Trắng Bạc và Xanh Rêu.' },
  { keywords: ['mua', 'đặt hàng', 'order'], reply: 'Bạn có thể bấm nút "Mua Ngay" ở đầu trang để thêm sản phẩm vào giỏ hàng, hoặc điền form đăng ký để nhận ưu đãi 30% trước khi đặt mua nhé!' },
  { keywords: ['xin chào', 'hello', 'hi', 'chào'], reply: 'Xin chào! Rất vui được hỗ trợ bạn. Bạn muốn hỏi về giá, thời lượng pin, tính năng chống ồn hay chính sách bảo hành ạ?' },
];

const FALLBACK_REPLY = 'Mình chưa có thông tin chính xác cho câu hỏi này, bạn vui lòng để lại email ở form đăng ký để đội ngũ tư vấn viên liên hệ trực tiếp nhé!';

function getBotReply(userText) {
  const text = userText.toLowerCase();
  const matched = KNOWLEDGE_BASE.find((item) =>
    item.keywords.some((kw) => text.includes(kw))
  );
  return matched ? matched.reply : FALLBACK_REPLY;
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Xin chào! Tôi có thể tư vấn gì về chiếc tai nghe cao cấp AeroTune Pro cho bạn không?' },
  ]);
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { from: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Giả lập độ trễ trả lời tự nhiên (500-1000ms) trước khi bot phản hồi
    const delay = 500 + Math.random() * 500;
    setTimeout(() => {
      const reply = getBotReply(trimmed);
      setMessages((prev) => [...prev, { from: 'bot', text: reply }]);
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <>
      <div
        id="chatbot-bubble"
        className="chatbot-bubble"
        onClick={() => setIsOpen(!isOpen)}
        title="Trợ lý ảo AeroTune AI"
        role="button"
        tabIndex={0}
        aria-label="Mở trợ lý ảo AeroTune AI"
        onKeyDown={(e) => e.key === 'Enter' && setIsOpen((v) => !v)}
      >🤖</div>

      <div id="chatbot-window" className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <h3 className="chat-title">Trợ Lý Ảo AeroTune AI</h3>
          <button onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div id="chat-logs" className="chat-logs">
          {messages.map((msg, idx) => (
            <div key={idx} className={`msg ${msg.from}`}>{msg.text}</div>
          ))}
          {isTyping && <div className="msg bot typing-indicator">Đang trả lời...</div>}
          <div ref={logsEndRef} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            id="chat-input"
            placeholder="Hỏi về thời lượng pin, giá bán..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={sendMessage}>Gửi</button>
        </div>
      </div>
    </>
  );
}

export default Chatbot;
