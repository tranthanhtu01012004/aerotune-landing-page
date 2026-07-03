import React from 'react';

/**
 * Hiển thị danh sách toast góc trái màn hình, thay thế cho alert() chặn UI.
 * Mỗi toast tự biến mất sau vài giây (được điều khiển từ App.jsx qua setTimeout).
 */
function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type || 'info'}`}
          onClick={() => onDismiss(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
