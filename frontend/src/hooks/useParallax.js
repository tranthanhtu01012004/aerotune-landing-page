import { useEffect, useRef } from 'react';

/**
 * Hook Parallax: phần tử di chuyển CHẬM HƠN tốc độ cuộn trang,
 * tạo cảm giác chiều sâu (ảnh "trôi" lại phía sau khi người dùng cuộn).
 *
 * - Chỉ dùng transform translate3d -> chạy trên GPU, không gây reflow,
 *   không ảnh hưởng điểm Performance.
 * - Throttle bằng requestAnimationFrame: mỗi frame chỉ cập nhật 1 lần
 *   dù sự kiện scroll bắn liên tục.
 * - Tôn trọng prefers-reduced-motion: người dùng tắt chuyển động thì
 *   hook không làm gì cả.
 *
 * Cách dùng: const ref = useParallax(0.18); <img ref={ref} ... />
 * speed: 0.1–0.3 là đẹp; số càng lớn trôi càng nhiều.
 */
function useParallax(speed = 0.18) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let rafId = 0;

    const update = () => {
      rafId = 0;
      // Hero nằm đầu trang nên chỉ cần scrollY, không cần đo layout (tránh forced reflow)
      node.style.transform = `translate3d(0, ${window.scrollY * speed}px, 0)`;
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update(); // đồng bộ vị trí ban đầu (trường hợp trang load giữa chừng)

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [speed]);

  return ref;
}

export default useParallax;
