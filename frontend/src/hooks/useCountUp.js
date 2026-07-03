import { useEffect, useRef, useState } from 'react';

/**
 * Hook đếm số từ 0 lên target khi phần tử cuộn vào khung nhìn (chạy đúng 1 lần).
 * Dùng requestAnimationFrame + easing ease-out cho chuyển động mượt,
 * tôn trọng prefers-reduced-motion (nhảy thẳng tới giá trị cuối).
 *
 * Cách dùng:
 *   const { ref, value } = useCountUp(45);            // 0 -> 45
 *   const { ref, value } = useCountUp(5.4, { decimals: 1 });
 *   <span ref={ref}>{value}</span>
 */
function useCountUp(target, { duration = 1400, decimals = 0 } = {}) {
  const ref = useRef(null);
  const startedRef = useRef(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        observer.disconnect();

        // Người dùng bật "giảm chuyển động" -> hiển thị ngay giá trị cuối
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setValue(target);
          return;
        }

        const startTime = performance.now();
        const tick = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setValue(Number((target * eased).toFixed(decimals)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration, decimals]);

  return { ref, value };
}

export default useCountUp;
