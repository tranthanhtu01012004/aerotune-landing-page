import React, { useEffect, useRef, useState } from 'react';

/**
 * Bọc quanh bất kỳ nội dung nào cần hiệu ứng fade-in + trượt lên khi cuộn tới.
 * Dùng chung class .reveal-on-scroll / .active đã có sẵn trong App.css.
 *
 * Props:
 *  - as: thẻ HTML bao ngoài (mặc định 'div')
 *  - delay: độ trễ (ms) trước khi kích hoạt hiệu ứng, dùng để tạo stagger
 */
function Reveal({ children, as: Tag = 'div', delay = 0, className = '', ...rest }) {
  const ref = useRef(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let timer = null; // lưu ra ngoài để cleanup được (return trong forEach bị bỏ qua)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            timer = setTimeout(() => setIsActive(true), delay);
            observer.unobserve(node);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer); // tránh setState sau khi component unmount
    };
  }, [delay]);

  return (
    <Tag ref={ref} className={`reveal-on-scroll ${isActive ? 'active' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export default Reveal;
