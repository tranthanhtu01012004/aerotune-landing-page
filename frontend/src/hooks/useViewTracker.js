import { useEffect, useRef } from 'react';

/**
 * Hook theo dõi hành vi cuộn: gọi onView() đúng 1 lần khi phần tử
 * cuộn vào ít nhất 50% khung nhìn (dùng cho tính năng "Sản phẩm đã xem").
 */
function useViewTracker(onView) {
  const ref = useRef(null);
  const hasViewedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasViewedRef.current) {
            hasViewedRef.current = true;
            onView();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [onView]);

  return ref;
}

export default useViewTracker;
