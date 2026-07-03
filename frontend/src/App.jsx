import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import Sidebars from './components/Sidebars';
import Hero from './components/Hero';
import Scrollytelling from './components/Scrollytelling';
import Features from './components/Features';
import Specs from './components/Specs';
import RegisterForm from './components/RegisterForm';
import Chatbot from './components/Chatbot';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Đọc dữ liệu đã lưu từ localStorage (an toàn: lỗi parse thì trả về giá trị mặc định)
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  // Theme: ưu tiên lựa chọn đã lưu, nếu chưa có thì theo hệ điều hành
  const [theme, setTheme] = useState(() =>
    loadFromStorage('aerotune-theme', null) ??
    (window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark')
  );
  // Giỏ hàng / yêu thích / đã xem: khôi phục từ localStorage để reload không mất dữ liệu
  const [cart, setCart] = useState(() => loadFromStorage('aerotune-cart', []));
  const [wishlist, setWishlist] = useState(() => loadFromStorage('aerotune-wishlist', []));
  const [recentlyViewed, setRecentlyViewed] = useState(() => loadFromStorage('aerotune-recent', []));
  const [activeSidebar, setActiveSidebar] = useState(null); // 'cart' | 'wishlist' | 'recent' | null
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const toastIdRef = useRef(0);

  // Đồng bộ data-theme trên thẻ <html> ngay khi trang load lần đầu,
  // và mỗi khi theme đổi (trước đây chỉ được set khi bấm nút toggle).
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Skeleton loading: ẩn ngay khi trang tải xong (sự kiện load), tối đa 600ms.
  // Trước đây delay cứng 1100ms làm chậm LCP → kéo điểm PageSpeed xuống.
  useEffect(() => {
    const done = () => setIsLoading(false);
    if (document.readyState === 'complete') {
      requestAnimationFrame(done);
      return;
    }
    window.addEventListener('load', done);
    const cap = setTimeout(done, 600); // chốt chặn: không giữ skeleton quá 600ms
    return () => {
      window.removeEventListener('load', done);
      clearTimeout(cap);
    };
  }, []);

  // Đồng bộ giỏ hàng / yêu thích / đã xem / theme xuống localStorage
  useEffect(() => { localStorage.setItem('aerotune-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('aerotune-wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('aerotune-recent', JSON.stringify(recentlyViewed)); }, [recentlyViewed]);
  useEffect(() => { localStorage.setItem('aerotune-theme', JSON.stringify(theme)); }, [theme]);

  // Toast: thay cho alert() chặn UI — tự động biến mất sau 3.2s.
  const showToast = useCallback((message, type = 'info') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Chuyển đổi giao diện Sáng / Tối
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Hàm mở/đóng Modal (cart / wishlist / recent)
  const toggleSidebar = (type) => {
    setActiveSidebar((prev) => (prev === type ? null : type));
  };

  // Thêm sản phẩm vào giỏ hàng (img: ảnh thumbnail hiển thị trong giỏ, có thể bỏ trống)
  const addToCart = (name, price, img = null) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.name === name);
      if (existingItem) {
        showToast(`Đã tăng số lượng ${name} trong giỏ hàng!`, 'success');
        return prevCart.map(item =>
          item.name === name ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      showToast(`Đã thêm ${name} vào giỏ hàng thành công!`, 'success');
      return [...prevCart, { name, price: Number(price) || 0, quantity: 1, img }];
    });
  };

  // Tăng / giảm số lượng bằng nút − + trong giỏ hàng.
  // Giảm về 0 thì tự động xóa sản phẩm khỏi giỏ.
  const updateCartQuantity = (name, delta) => {
    setCart((prevCart) => {
      const item = prevCart.find(i => i.name === name);
      if (!item) return prevCart;
      const nextQty = item.quantity + delta;
      if (nextQty <= 0) {
        showToast(`Đã xóa ${name} khỏi giỏ hàng.`, 'info');
        return prevCart.filter(i => i.name !== name);
      }
      return prevCart.map(i => (i.name === name ? { ...i, quantity: nextQty } : i));
    });
  };

  // XÓA sản phẩm khỏi giỏ hàng (dùng toast thay window.confirm để không chặn UI)
  const removeFromCart = (name) => {
    setCart((prevCart) => prevCart.filter(item => item.name !== name));
    showToast(`Đã xóa ${name} khỏi giỏ hàng.`, 'info');
  };

  // Thêm sản phẩm vào danh sách yêu thích
  const addToWishlist = (name) => {
    if (!wishlist.includes(name)) {
      setWishlist([...wishlist, name]);
      showToast(`Đã thêm ${name} vào danh sách yêu thích! ❤️`, 'success');
    } else {
      showToast(`${name} đã có trong danh sách yêu thích rồi!`, 'info');
    }
  };

  // Ghi nhận sản phẩm đã xem (gọi khi sản phẩm cuộn vào khung nhìn ≥ 50%)
  // Sản phẩm xem gần nhất hiển thị đầu danh sách, tối đa lưu 8 sản phẩm.
  // Đồng thời gửi lượt xem lên backend để lưu vào SQLite (đếm real-time, không chặn UI).
  const addToRecentlyViewed = useCallback((name) => {
    setRecentlyViewed((prev) => {
      const withoutDup = prev.filter((item) => item !== name);
      return [name, ...withoutDup].slice(0, 8);
    });

    axios.post(`${API_URL}/api/view`, { product: name }).catch(() => {
      // Bỏ qua lỗi mạng/backend offline — không ảnh hưởng trải nghiệm người dùng.
    });
  }, []);

  // XÓA sản phẩm khỏi danh sách yêu thích
  const removeFromWishlist = (name) => {
    setWishlist((prevWishlist) => prevWishlist.filter(item => item !== name));
  };

  // Hàm xử lý nút bấm Thanh Toán
  const checkoutAlert = async () => {
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        await axios.post(`${API_URL}/api/checkout`, { items: cart, total: totalPrice });
        showToast(`Cảm ơn bạn đã đặt mua! Tổng thanh toán: ${totalPrice.toLocaleString()}đ. Chúng tôi sẽ sớm liên hệ xác nhận.`, 'success');
        setCart([]); // Xóa sạch giỏ hàng sau khi thanh toán thành công
        setActiveSidebar(null); // Đóng modal
    } catch (error) {
        console.error('Lỗi khi lưu đơn hàng:', error?.response?.data || error.message);
        showToast('Không thể kết nối đến máy chủ để lưu đơn hàng. Vui lòng thử lại!', 'error');
        // Không xóa giỏ hàng nếu lưu thất bại, để khách không mất dữ liệu
    }
};

  return (
    <div className={`app-wrapper ${theme}`}>
      <a href="#hero" className="skip-link">Bỏ qua, đến nội dung chính</a>

      {isLoading && (
        <div className="skeleton-screen" aria-hidden="true">
          <div className="skeleton-header skeleton-block"></div>
          <div className="skeleton-hero-grid">
            <div>
              <div className="skeleton-block line-lg"></div>
              <div className="skeleton-block line-md"></div>
            </div>
            <div className="skeleton-block circle"></div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <Header
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        recentCount={recentlyViewed.length}
        toggleTheme={toggleTheme}
        theme={theme}
        toggleSidebar={toggleSidebar}
      />

      <Sidebars
        activeSidebar={activeSidebar}
        toggleSidebar={toggleSidebar}
        cart={cart}
        wishlist={wishlist}
        recentlyViewed={recentlyViewed}
        checkoutAlert={checkoutAlert}
        removeFromCart={removeFromCart}
        updateCartQuantity={updateCartQuantity}
        removeFromWishlist={removeFromWishlist}
      />

      <main>
        <Hero addToCart={addToCart} addToWishlist={addToWishlist} addToRecentlyViewed={addToRecentlyViewed} />
        <Scrollytelling />
        <Features addToCart={addToCart} addToWishlist={addToWishlist} addToRecentlyViewed={addToRecentlyViewed} />
        <Specs />
        <RegisterForm />
      </main>

      <Chatbot />
      <Footer />
    </div>
  );
}

export default App;
