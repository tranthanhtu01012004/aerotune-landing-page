import React from 'react';

function Sidebars({
  activeSidebar,
  toggleSidebar,
  cart,
  wishlist,
  recentlyViewed,
  checkoutAlert,
  removeFromCart,
  updateCartQuantity,
  removeFromWishlist
}) {
  // Number(...) || 0 để phòng price bị undefined/chuỗi -> tránh hiển thị "NaN đ"
  const totalPrice = cart.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0
  );

  const closeOnOverlayClick = (type) => (e) => {
    if (e.target === e.currentTarget) toggleSidebar(type);
  };

  return (
    <>
      {/* MODAL GIỎ HÀNG */}
      <div
        className={`modal-overlay ${activeSidebar === 'cart' ? 'open' : ''}`}
        onClick={closeOnOverlayClick('cart')}
        role="dialog"
        aria-modal="true"
        aria-hidden={activeSidebar !== 'cart'}
      >
        <div className="modal-box">
          <div className="sidebar-header">
            <h3>Giỏ hàng của bạn</h3>
            <button className="close-btn" onClick={() => toggleSidebar('cart')} aria-label="Đóng giỏ hàng">×</button>
          </div>

          <div className="sidebar-content">
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Giỏ hàng của bạn đang trống.</p>
            ) : (
              cart.map((item) => {
                const unitPrice = Number(item.price) || 0;
                return (
                  <div className="cart-item" key={item.name}>
                    {/* Thumbnail sản phẩm — nếu không có ảnh thì hiện emoji tai nghe */}
                    <div className="cart-thumb">
                      {item.img
                        ? <img src={item.img} alt={item.name} loading="lazy" width="64" height="64" />
                        : <span aria-hidden="true">🎧</span>}
                    </div>

                    <div className="cart-info">
                      <strong className="cart-name">{item.name}</strong>
                      <span className="cart-unit-price">{unitPrice.toLocaleString('vi-VN')}đ</span>

                      {/* Bộ điều khiển số lượng: − [số] + */}
                      <div className="qty-control" role="group" aria-label={`Số lượng ${item.name}`}>
                        <button
                          className="qty-btn"
                          onClick={() => updateCartQuantity(item.name, -1)}
                          aria-label={`Giảm số lượng ${item.name}`}
                        >−</button>
                        <span className="qty-value" aria-live="polite">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateCartQuantity(item.name, 1)}
                          aria-label={`Tăng số lượng ${item.name}`}
                        >+</button>
                      </div>
                    </div>

                    <div className="cart-item-right">
                      <button
                        className="cart-remove"
                        onClick={() => removeFromCart(item.name)}
                        title="Xóa sản phẩm"
                        aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                      >
                        {/* Icon SVG thùng rác: màu kế thừa từ CSS (currentColor),
                            không dùng emoji vì emoji hiển thị mờ trên dark mode */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M3 6h18" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                      <span className="cart-line-total">
                        {(unitPrice * item.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {cart.length > 0 && (
            <div className="cart-total" style={{ display: 'block', padding: '15px 0 0', borderTop: '1px solid var(--border-color, #ccc)' }}>
              <p style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                <span>Tổng tiền thanh toán:</span>
                <strong style={{ color: 'var(--accent)' }}>{totalPrice.toLocaleString('vi-VN')}đ</strong>
              </p>
              <button className="btn btn-primary btn-block" style={{ width: '100%', padding: '12px', marginTop: '10px' }} onClick={checkoutAlert}>
                Đặt Hàng Ngay
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL SẢN PHẨM YÊU THÍCH */}
      <div
        className={`modal-overlay ${activeSidebar === 'wishlist' ? 'open' : ''}`}
        onClick={closeOnOverlayClick('wishlist')}
        role="dialog"
        aria-modal="true"
        aria-hidden={activeSidebar !== 'wishlist'}
      >
        <div className="modal-box">
          <div className="sidebar-header">
            <h3>Sản phẩm yêu thích</h3>
            <button className="close-btn" onClick={() => toggleSidebar('wishlist')} aria-label="Đóng danh sách yêu thích">×</button>
          </div>

          <div className="sidebar-content">
            {wishlist.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Chưa có sản phẩm yêu thích nào.</p>
            ) : (
              wishlist.map((name, idx) => (
                <div key={idx} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color, #eee)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>❤️ {name}</span>
                  <button
                    onClick={() => removeFromWishlist(name)}
                    style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '1.1rem', cursor: 'pointer', padding: '0 8px' }}
                    title="Bỏ yêu thích"
                    aria-label={`Bỏ yêu thích ${name}`}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL SẢN PHẨM ĐÃ XEM */}
      <div
        className={`modal-overlay ${activeSidebar === 'recent' ? 'open' : ''}`}
        onClick={closeOnOverlayClick('recent')}
        role="dialog"
        aria-modal="true"
        aria-hidden={activeSidebar !== 'recent'}
      >
        <div className="modal-box">
          <div className="sidebar-header">
            <h3>Sản phẩm đã xem</h3>
            <button className="close-btn" onClick={() => toggleSidebar('recent')} aria-label="Đóng danh sách đã xem">×</button>
          </div>

          <div className="sidebar-content">
            {recentlyViewed.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>Bạn chưa xem sản phẩm nào. Cuộn trang để khám phá nhé!</p>
            ) : (
              recentlyViewed.map((name, idx) => (
                <div key={idx} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color, #eee)' }}>
                  <span>👁 {name}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebars;
