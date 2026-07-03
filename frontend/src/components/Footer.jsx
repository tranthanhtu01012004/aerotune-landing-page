import React from 'react';

function Footer() {
  return (
    <footer>
      <div className="footer-glow" aria-hidden="true"></div>
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#hero" className="logo">Aero<span>Tune</span></a>
          <p>Âm thanh thuần khiết, thiết kế tương lai. AeroTune Pro mang phòng thu đến bên tai bạn, mọi lúc mọi nơi.</p>
          <div className="audio-waveform footer-waveform" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>

        <div className="footer-col">
          <h3 className="footer-heading">Khám phá</h3>
          <ul>
            <li><a href="#hero">Trang chủ</a></li>
            <li><a href="#features">Tính năng</a></li>
            <li><a href="#products-list">Sản phẩm</a></li>
            <li><a href="#specs">Thông số</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-heading">Hỗ trợ</h3>
          <ul>
            <li><a href="#register">Nhận ưu đãi 30%</a></li>
            <li><a href="#specs">Bảo hành &amp; đổi trả</a></li>
            <li><a href="#hero">Hỏi đáp cùng trợ lý AI</a></li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <p>&copy; 2026 AeroTune Premium. Dự án tối ưu hóa cao cấp phục vụ Bài test HELICORP.</p>
      </div>
    </footer>
  );
}

export default Footer;
