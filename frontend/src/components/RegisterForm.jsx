import React, { useState } from 'react';
import Reveal from './Reveal';

// Đọc URL backend từ biến môi trường (.env) — fallback localhost:5000 khi chạy dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Danh sách quyền lợi hiển thị ở cột trái
const BENEFITS = [
  'Mã giảm giá 30% cho đơn hàng đầu tiên',
  'Ưu tiên giao hàng trong đợt mở bán sớm',
  'Tặng kèm hộp đựng da trị giá 450.000đ',
];

function RegisterForm() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra tính hợp lệ dữ liệu trước khi gửi về server
    const trimmedName = fullname.trim();
    const trimmedEmail = email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!trimmedName || !trimmedEmail) {
      setStatus({ type: 'error', msg: 'Vui lòng nhập đầy đủ thông tin!' });
      return;
    }
    if (trimmedName.length < 2) {
      setStatus({ type: 'error', msg: 'Họ tên phải có ít nhất 2 ký tự.' });
      return;
    }
    if (!emailPattern.test(trimmedEmail)) {
      setStatus({ type: 'error', msg: 'Địa chỉ email không hợp lệ, vui lòng kiểm tra lại.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus({ type: 'info', msg: 'Đang xử lý đăng ký...' });
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          message: 'Đăng ký nhận ưu đãi 30% AeroTune VVIP',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.success) {
        setStatus({ type: 'success', msg: 'Chúc mừng! Đăng ký nhận mã giảm giá 30% thành công.' });
        setFullname('');
        setEmail('');
      }
    } catch (error) {
      console.error('Lỗi khi gửi form đăng ký:', error.message);
      setStatus({ type: 'error', msg: 'Không thể kết nối đến máy chủ Backend.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" className="register-section">
      <Reveal as="div" className="container register-grid">
        {/* CỘT TRÁI: tiêu đề + danh sách quyền lợi */}
        <div className="register-intro">
          <span className="badge">Ưu đãi giới hạn</span>
          <h2>Đăng Ký Nhận<br />Ưu Đãi <span className="register-percent">30%</span></h2>
          <p>Dành riêng cho 500 khách hàng đầu tiên tham gia vòng trải nghiệm sớm AeroTune Pro.</p>

          <ul className="benefit-list">
            {BENEFITS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        {/* CỘT PHẢI: form card */}
        <div className="form-card">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="reg-name">Họ và tên</label>
              <input
                id="reg-name"
                type="text"
                placeholder="Nguyễn Văn A"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="reg-email">Địa chỉ email</label>
              <input
                id="reg-email"
                type="email"
                placeholder="ban@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
              {isSubmitting ? 'Đang gửi...' : 'Nhận Ưu Đãi Ngay'}
            </button>
            <p className="form-hint">Chúng tôi không chia sẻ email của bạn cho bên thứ ba.</p>
          </form>

          {status.msg && (
            <div className={`form-status ${status.type}`} role="status" aria-live="polite">
              {status.msg}
            </div>
          )}
        </div>
      </Reveal>
    </section>
  );
}

export default RegisterForm;
