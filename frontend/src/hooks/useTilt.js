import { useRef } from 'react';

/**
 * Hook tạo hiệu ứng nghiêng 3D (tilt) nhẹ theo vị trí con trỏ chuột trên card.
 * Trả về ref gắn vào phần tử + các event handler onMouseMove/onMouseLeave.
 */
function useTilt(maxTilt = 8) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    node.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  };

  const handleMouseLeave = () => {
    const node = ref.current;
    if (!node) return;
    node.style.transform = 'perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0)';
  };

  return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave };
}

export default useTilt;
