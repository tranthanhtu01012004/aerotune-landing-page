import React from 'react';
import Reveal from './Reveal';
import useCountUp from '../hooks/useCountUp';

/**
 * Thông số kỹ thuật kiểu Bento Grid — typography-first, không icon.
 * Ô lớn bên trái chứa ảnh sản phẩm, các ô nhỏ là con số lớn có
 * hiệu ứng count-up (đếm từ 0) khi cuộn vào khung nhìn.
 */
function StatTile({ target, decimals = 0, suffix, label, note, featured = false }) {
  const { ref, value } = useCountUp(target, { decimals });
  return (
    <div className={`bento-tile ${featured ? 'bento-featured' : ''}`}>
      <div className="bento-num" ref={ref}>
        {decimals > 0 ? value.toFixed(decimals) : value}
        <span className="bento-suffix">{suffix}</span>
      </div>
      <div className="bento-label">{label}</div>
      <p className="bento-note">{note}</p>
    </div>
  );
}

function Specs() {
  return (
    <section id="specs" className="specs-section">
      <div className="container">
        <h2 className="section-title">Thông Số Kỹ Thuật</h2>

        <Reveal as="div" className="bento-grid">
          {/* Ô lớn: ảnh sản phẩm cận cảnh, chiếm 2 hàng */}
          <div className="bento-tile bento-media">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=640&auto=format&q=70"
              alt="Cận cảnh tai nghe AeroTune Pro"
              loading="lazy"
              decoding="async"
              width="640"
              height="427"
            />
            <div className="bento-media-caption">
              <strong>AeroTune Pro</strong>
              <span>Driver Graphene mạ vàng 40mm</span>
            </div>
          </div>

          <StatTile
            target={45}
            suffix="dB"
            label="Chống ồn chủ động"
            note="Smart-ANC tự thích ứng theo môi trường"
            featured
          />
          <StatTile
            target={40}
            suffix="h"
            label="Thời lượng pin"
            note="Sạc nhanh 10 phút cho 5 giờ nghe nhạc"
          />
          <StatTile
            target={5.4}
            decimals={1}
            suffix=""
            label="Bluetooth đa điểm"
            note="Kết nối 2 thiết bị cùng lúc, độ trễ thấp"
          />

          {/* Ô text tĩnh — không phải số nên không cần count-up */}
          <div className="bento-tile">
            <div className="bento-num">IPX5</div>
            <div className="bento-label">Kháng nước</div>
            <p className="bento-note">Chuẩn chống mồ hôi khi tập luyện</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Specs;
