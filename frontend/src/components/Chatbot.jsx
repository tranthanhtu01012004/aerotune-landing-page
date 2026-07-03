import React, { useState, useRef, useEffect } from 'react';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Xin chào! Tôi là trợ lý ảo AeroTune AI. Tôi có thể tư vấn gì về chiếc tai nghe cao cấp AeroTune Pro cho bạn không?' },
  ]);
  const logsEndRef = useRef(null);

  // Tự động cuộn xuống khi có tin nhắn mới hoặc khi bot đang gõ chữ
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // 1. Hiển thị tin nhắn của user lên màn hình ngay lập tức
    const userMsg = { from: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // 2. Lấy URL API từ biến môi trường của Vite (.env)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // 3. Gọi API lên Backend Node.js
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ message: trimmed })
      });
      
      const data = await response.json();

      if (response.ok && data.reply) {
        // 4. Hiển thị câu trả lời thông minh của Gemini AI
        setMessages((prev) => [...prev, { from: 'bot', text: data.reply }]);
      } else {
        throw new Error(data.error || 'Response lỗi');
      }
    } catch (error) {
      console.error('❌ Chatbot Error:', error);
      // Fallback khi backend mất kết nối hoặc gặp lỗi
      setMessages((prev) => [
        ...prev, 
        { from: 'bot', text: 'Mình chưa có thông tin chính xác cho câu hỏi này, bạn vui lòng để lại email ở form đăng ký để đội ngũ tư vấn viên liên hệ trực tiếp nhé!' }
      ]);
    } finally {
      setIsTyping(false);
    }
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
