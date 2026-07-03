import React, { useRef } from 'react';
import useViewTracker from '../hooks/useViewTracker';
import useParallax from '../hooks/useParallax';
import Reveal from './Reveal';

function Hero({ addToCart, addToWishlist, addToRecentlyViewed }) {
  const viewRef = useViewTracker(() => addToRecentlyViewed('AeroTune Pro Premium'));
  const sectionRef = useRef(null);
  // Parallax: ảnh hero trôi chậm hơn tốc độ cuộn -> tạo chiều sâu cao cấp
  const parallaxRef = useParallax(0.18);

  // Cursor-follow spotlight: cập nhật toạ độ chuột vào CSS custom properties
  const handleMouseMove = (e) => {
    const node = sectionRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    node.style.setProperty('--spot-x', `${x}%`);
    node.style.setProperty('--spot-y', `${y}%`);
  };

  // Gộp 2 ref (viewRef từ hook + sectionRef cho spotlight) vào cùng 1 phần tử
  const setRefs = (node) => {
    sectionRef.current = node;
    viewRef.current = node;
  };

  return (
    <section
      id="hero"
      className="hero-section parallax-bg spotlight-active"
      ref={setRefs}
      onMouseMove={handleMouseMove}
    >
      <div className="container hero-grid">
        <div className="hero-content">
          <span className="badge">VVIP Edition 2026</span>
          <h1 className="hero-title">Âm Thanh Thuần Khiết.<br />Thiết Kế Tương Lai.</h1>
          <p>AeroTune Pro kết hợp công nghệ chống ồn chủ động thông minh thích ứng (Smart-ANC 45dB) và Driver Graphene mạ vàng giúp tái tạo âm thanh phòng thu trung thực nhất.</p>

          {/* Sóng âm thanh động — chi tiết đúng chủ đề tai nghe */}
          <div className="audio-waveform" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
          </div>

          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => addToCart('AeroTune Pro Premium', 4990000, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=128&auto=format&q=70')}>
              Mua Ngay - 4.990.000đ
            </button>
            <button className="btn btn-fav" onClick={() => addToWishlist('AeroTune Pro Premium')}>
              ❤️ Yêu Thích
            </button>
          </div>
        </div>
        <Reveal as="div" className="hero-image dynamic-float">
          {/* Ảnh LCP: srcset theo kích thước màn hình, auto=format trả về WebP/AVIF,
              width/height cố định để chống CLS, fetchpriority ưu tiên tải sớm */}
          <img
            ref={parallaxRef}
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&auto=format&q=70"
            srcSet="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=480&auto=format&q=70 480w, https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&auto=format&q=70 640w, https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=960&auto=format&q=70 960w"
            sizes="(max-width: 768px) 90vw, 530px"
            width="640"
            height="427"
            alt="Tai nghe không dây AeroTune Pro màu đen trên nền tối"
            fetchPriority="high"
            decoding="async"
          />
        </Reveal>
      </div>
    </section>
  );
}

export default Hero;
