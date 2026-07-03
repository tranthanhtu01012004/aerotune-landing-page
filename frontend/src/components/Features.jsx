import React, { useState } from 'react';
import useViewTracker from '../hooks/useViewTracker';
import useTilt from '../hooks/useTilt';
import Reveal from './Reveal';

/**
 * Card sản phẩm kiểu showcase (tham khảo layout Apple Store):
 * ảnh lớn phía trên + nút yêu thích góc phải, tên + tagline,
 * lưới 4 chip thông số, footer gồm giá bên trái + nút "Chọn mua" bên phải.
 */
function ProductCard({ prod, addToCart, addToWishlist, addToRecentlyViewed }) {
  const viewRef = useViewTracker(() => addToRecentlyViewed(prod.name));
  const tilt = useTilt(4);
  const [imgError, setImgError] = useState(false);

  const setRefs = (node) => {
    viewRef.current = node;
    tilt.ref.current = node;
  };

  return (
    <article
      className="product-card"
      ref={setRefs}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
    >
      {/* Vùng ảnh sản phẩm + nút yêu thích nổi góc phải */}
      <div className="product-media">
        <button
          className="product-fav"
          onClick={() => addToWishlist(prod.name)}
          aria-label={`Thêm ${prod.name} vào yêu thích`}
        >
          ♡
        </button>
        {!imgError && prod.img ? (
          <img
            src={prod.img}
            alt={prod.name}
            loading="lazy"
            decoding="async"
            width="400"
            height="300"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Fallback: nếu ảnh lỗi thì hiển thị emoji lớn thay thế */
          <span className="product-media-emoji" aria-hidden="true">{prod.icon}</span>
        )}
      </div>

      <div className="product-body">
        <h3 className="product-name">{prod.name}</h3>
        <p className="product-tagline">{prod.tagline}</p>

        {/* Lưới 2x2 chip thông số: nhãn nhỏ phía trên, giá trị đậm phía dưới */}
        <div className="product-specs">
          {prod.specs.map((spec) => (
            <div className="spec-chip" key={spec.label}>
              <span className="spec-chip-label">{spec.label}</span>
              <span className="spec-chip-value">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="product-footer">
        <span className="product-price">{prod.price.toLocaleString('vi-VN')}đ</span>
        <button className="btn btn-buy" onClick={() => addToCart(prod.name, prod.price, prod.img)}>
          Chọn mua
        </button>
      </div>
    </article>
  );
}

/**
 * Highlight typography-first (không icon): đường kẻ accent trên cùng,
 * nhãn phân loại uppercase nhỏ, tiêu đề lớn, mô tả — phong cách Linear/Vercel.
 */
function HighlightItem({ kicker, title, desc }) {
  return (
    <div className="highlight-item">
      <span className="highlight-kicker">{kicker}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

function Features({ addToCart, addToWishlist, addToRecentlyViewed }) {
  const ecoProducts = [
    {
      id: 'lite',
      name: 'AeroTune Lite',
      price: 1990000,
      icon: '🎧',
      img: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=480&auto=format&q=70',
      tagline: 'Phiên bản nhỏ gọn cho người dùng năng động.',
      specs: [
        { label: 'Pin', value: '25 giờ' },
        { label: 'Chống ồn', value: 'ANC tiêu chuẩn' },
        { label: 'Kết nối', value: 'Bluetooth 5.3' },
        { label: 'Trọng lượng', value: '180g' },
      ],
    },
    {
      id: 'charger',
      name: 'Đế Sạc Không Dây Cấp Tốc',
      price: 690000,
      icon: '⚡',
      img: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=480&auto=format&q=70',
      tagline: 'Sạc từ tính thông minh, an toàn tuyệt đối.',
      specs: [
        { label: 'Công suất', value: '15W' },
        { label: 'Công nghệ', value: 'Sạc từ tính' },
        { label: 'Cổng vào', value: 'USB-C' },
        { label: 'Bảo vệ', value: 'Chống quá nhiệt' },
      ],
    },
    {
      id: 'buds',
      name: 'AeroTune Buds Mini',
      price: 1290000,
      icon: '🎵',
      img: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=480&auto=format&q=70',
      tagline: 'Tai nghe true wireless nhỏ gọn trong lòng bàn tay.',
      specs: [
        { label: 'Pin', value: '20 giờ (kèm hộp)' },
        { label: 'Chống nước', value: 'IPX4' },
        { label: 'Kết nối', value: 'Bluetooth 5.3' },
        { label: 'Trọng lượng', value: '45g' },
      ],
    },
    {
      id: 'case',
      name: 'Hộp Đựng Da Cao Cấp',
      price: 450000,
      icon: '💼',
      img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=480&auto=format&q=70',
      tagline: 'Bảo vệ tai nghe tối đa với chất liệu da thật.',
      specs: [
        { label: 'Chất liệu', value: 'Da thật' },
        { label: 'Bảo vệ', value: 'Chống sốc' },
        { label: 'Bề mặt', value: 'Kháng nước' },
        { label: 'Khóa', value: 'Nam châm' },
      ],
    },
  ];

  return (
    <>
      <section id="features" className="features-section">
        <div className="container">
          <h2 className="section-title">Công Nghệ Đột Phá</h2>
          <div className="features-grid">
            <Reveal delay={0}>
              <HighlightItem kicker="Chống ồn" title="Smart-ANC 45dB" desc="Tự động điều chỉnh mức độ chống ồn dựa theo tạp âm xung quanh bạn." />
            </Reveal>
            <Reveal delay={100}>
              <HighlightItem kicker="Năng lượng" title="40 Giờ Chơi Nhạc" desc="Thời lượng pin ấn tượng, tích hợp sạc nhanh 10 phút cho 5 giờ sử dụng." />
            </Reveal>
            <Reveal delay={200}>
              <HighlightItem kicker="Âm thanh" title="Hi-Res Audio Gold" desc="Đạt chứng nhận âm thanh chất lượng cao, tái tạo trọn vẹn từng tần số." />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="products-list" className="features-section" style={{ background: 'var(--bg-primary)' }}>
        <div className="container">
          <h2 className="section-title">Hệ Sinh Thái AeroTune</h2>
          <div className="features-grid product-grid">
            {ecoProducts.map((prod, idx) => (
              <Reveal key={prod.id} delay={idx * 100}>
                <ProductCard
                  prod={prod}
                  addToCart={addToCart}
                  addToWishlist={addToWishlist}
                  addToRecentlyViewed={addToRecentlyViewed}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Features;
