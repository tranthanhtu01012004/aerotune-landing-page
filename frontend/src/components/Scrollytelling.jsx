import React, { useEffect, useRef, useState } from 'react';

/**
 * Scrollytelling đúng nghĩa: cột trái là panel STICKY đứng yên giữa màn hình,
 * cột phải cuộn qua từng bước. IntersectionObserver theo dõi bước nào đang
 * ở giữa khung nhìn -> panel trái đổi chỉ số + thanh progress tương ứng.
 */
const STEPS = [
  {
    num: '01',
    title: 'Màng loa Graphene 40mm cao cấp',
    desc: 'Được phủ một lớp carbon nguyên tử siêu mỏng giúp giảm thiểu biến dạng âm thanh, mang lại dải bass sâu và âm treble trong trẻo tuyệt đối.',
    stat: '40mm',
    statLabel: 'Driver Graphene mạ vàng',
  },
  {
    num: '02',
    title: 'Hệ thống 6 Micro AI cách âm',
    desc: 'Thuật toán thông minh liên tục phân tích và triệt tiêu tiếng ồn môi trường bên ngoài, giữ cuộc gọi luôn sắc nét trong mọi hoàn cảnh.',
    stat: '45dB',
    statLabel: 'Chống ồn chủ động',
  },
  {
    num: '03',
    title: 'Pin Lithium-Polymer thế hệ mới',
    desc: 'Mật độ năng lượng cao trong thân máy siêu nhẹ, kết hợp chip quản lý nguồn thông minh tự tối ưu theo thói quen nghe của bạn.',
    stat: '40h',
    statLabel: 'Nghe nhạc liên tục',
  },
];

function Scrollytelling() {
  const [activeIdx, setActiveIdx] = useState(0);
  const stepRefs = useRef([]);

  useEffect(() => {
    // Theo dõi từng step: step nào lọt vào dải giữa màn hình thì active.
    // rootMargin bóp khung quan sát lại còn ~40% giữa viewport để mỗi
    // thời điểm chỉ có đúng 1 step được tính là "đang xem".
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.dataset.idx);
            setActiveIdx(idx);
          }
        });
      },
      { rootMargin: '-30% 0px -30% 0px', threshold: 0 }
    );

    stepRefs.current.forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const active = STEPS[activeIdx];

  return (
    <section className="scrollytelling-section">
      <div className="container">
        <h2 className="section-title">Khám Phá Cấu Tạo Bên Trong</h2>

        <div className="story-layout">
          {/* CỘT TRÁI: panel sticky — đứng yên trong khi cột phải cuộn */}
          <div className="story-sticky">
            <div className="story-panel">
              <span className="story-panel-num" aria-hidden="true">{active.num}</span>
              <div className="story-panel-stat" key={active.stat}>{active.stat}</div>
              <div className="story-panel-label">{active.statLabel}</div>

              {/* Thanh progress: mỗi đoạn ứng với 1 bước */}
              <div className="story-progress" role="presentation">
                {STEPS.map((s, idx) => (
                  <span
                    key={s.num}
                    className={`story-progress-seg ${idx <= activeIdx ? 'filled' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: các bước cuộn qua */}
          <div className="story-steps">
            {STEPS.map((step, idx) => (
              <div
                key={step.num}
                data-idx={idx}
                ref={(node) => { stepRefs.current[idx] = node; }}
                className={`story-step-card ${idx === activeIdx ? 'active' : ''}`}
              >
                <span className="story-step-kicker">Bước {step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scrollytelling;
