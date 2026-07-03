import React from 'react';
// Import các icon hiện đại từ thư viện
import { HiOutlineSun, HiOutlineMoon, HiOutlineEye } from 'react-icons/hi2'; // Heroicons
import { FaRegHeart } from 'react-icons/fa'; // FontAwesome Heart
import { FiShoppingCart } from 'react-icons/fi'; // Feather Icon Cart

function Header({ cartCount, wishlistCount, recentCount, toggleTheme, theme, toggleSidebar }) {
  // Style chung để căn giữa icon và text count, và tạo khoảng cách
  const iconWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px', // Khoảng cách giữa icon và số
    cursor: 'pointer',
    fontSize: '1.1rem' // Tăng nhẹ kích thước icon
  };

  // Style riêng cho icon SVG để nó đồng màu với chữ
  const svgIconStyle = {
    fontSize: '1.4rem', // Kích thước icon SVG
    strokeWidth: 1.5 // Độ mảnh của nét vẽ (cho Heroicons/Feather)
  };

  return (
    <header>
      <div className="container navbar">
        <a href="#" className="logo">Aero<span>Tune</span></a>
        <nav>
          <ul className="nav-links">
            <li><a href="#hero">Trang Chủ</a></li>
            <li><a href="#features">Tính Năng</a></li>
            <li><a href="#products-list">Sản phẩm</a></li>
            <li><a href="#specs">Thông Số</a></li>
            <li><a href="#register">Đăng Ký</a></li>
          </ul>
        </nav>
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
         
          {/* 1. Icon Theme (Sáng/Tối) - Dùng Heroicons */}
          <button
            id="theme-toggle"
            onClick={toggleTheme}
            title="Chuyển chế độ Sáng/Tối"
            aria-label="Chuyển chế độ Sáng/Tối"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}
          >
            {theme === 'dark'
              ? <HiOutlineSun style={{ ...svgIconStyle, color: '#fbbf24' }} /> // Màu vàng cho mặt trời
              : <HiOutlineMoon style={svgIconStyle} />
            }
          </button>

          {/* 2. Icon Đã xem (Recent) - Dùng Heroicons Eye */}
          <div
            className="nav-icon-btn"
            onClick={() => toggleSidebar('recent')}
            title="Sản phẩm đã xem"
            role="button"
            tabIndex={0}
            aria-label={`Sản phẩm đã xem (${recentCount})`}
            onKeyDown={(e) => e.key === 'Enter' && toggleSidebar('recent')}
            style={iconWrapperStyle}
          >
            <HiOutlineEye style={svgIconStyle} />
            <span id="recent-count" style={{ fontWeight: '500' }}>{recentCount}</span>
          </div>

          {/* 3. Icon Yêu thích (Wishlist) - Dùng FontAwesome Heart (nét mảnh) */}
          <div
            className="nav-icon-btn"
            onClick={() => toggleSidebar('wishlist')}
            title="Sản phẩm yêu thích"
            role="button"
            tabIndex={0}
            aria-label={`Sản phẩm yêu thích (${wishlistCount})`}
            onKeyDown={(e) => e.key === 'Enter' && toggleSidebar('wishlist')}
            style={iconWrapperStyle}
          >
            <FaRegHeart style={{ ...svgIconStyle, fontSize: '1.25rem' }} /> {/* FontAwesome tim hơi to nên giảm xíu */}
            <span id="wishlist-count" style={{ fontWeight: '500' }}>{wishlistCount}</span>
          </div>

          {/* 4. Icon Giỏ hàng (Cart) - Dùng Feather ShoppingCart */}
          <div
            className="nav-icon-btn"
            onClick={() => toggleSidebar('cart')}
            title="Giỏ hàng"
            role="button"
            tabIndex={0}
            aria-label={`Giỏ hàng (${cartCount})`}
            onKeyDown={(e) => e.key === 'Enter' && toggleSidebar('cart')}
            style={iconWrapperStyle}
          >
            <FiShoppingCart style={svgIconStyle} />
            <span id="cart-count" style={{ fontWeight: '500' }}>{cartCount}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
