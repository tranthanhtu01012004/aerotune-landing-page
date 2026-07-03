# 🎧 AeroTune Pro — Landing Page

Landing page giới thiệu tai nghe không dây **AeroTune Pro** — bài test Vòng 2, TTS IT Phát triển Website (HELICORP).

**🔗 Demo:** https://aerotune-pro.vercel.app
**🔗 Backend API:** https://aerotune-backend.onrender.com

> ⚠️ Backend chạy Render free tier — lần truy cập đầu cần ~30s để "đánh thức" server.

**Tech stack:** React 19 + Vite (frontend, deploy Vercel) · Node.js + Express + SQLite (backend, deploy Render)

## Tính năng nổi bật

| Tính năng | Mô tả |
|---|---|
| ⭐ Scrollytelling + Parallax | Panel sticky đổi chỉ số theo bước cuộn (IntersectionObserver); ảnh Hero trôi chậm hơn tốc độ cuộn |
| ⭐ Webhook thực tế | Đăng ký / đơn hàng mới → bắn thông báo real-time về Discord |
| ⭐ Chatbot Gemini AI | Tư vấn sản phẩm qua Gemini API, key giấu ở backend, frontend gọi qua `/api/chat` |
| ⭐ Mini e-commerce | Giỏ hàng (chỉnh số lượng −/+), yêu thích, đã xem — persist localStorage |
| ⭐ Theo dõi hành vi | Scroll vào sản phẩm ≥50% → lưu lượt xem vào SQLite + toast thông báo |
| ⭐ Validate dữ liệu | Kiểm tra họ tên + email bằng regex trước khi gửi backend |
| ⭐ Dark Mode | Tự nhận theo hệ điều hành, lưu lựa chọn |
| ⭐ Hiệu ứng | Skeleton, reveal-on-scroll, count-up, tilt 3D, spotlight, micro-interactions |

*(⭐ = mục điểm cộng trong đề bài)*

## Performance & SEO (PageSpeed Mobile 99/100)

Tối ưu ảnh LCP (preload + srcset + WebP), code-splitting chatbot bằng `React.lazy`, không dependency thừa (fetch thay axios, system font) — bundle ~70KB gzip. SEO đủ Meta/OG/Twitter Card + `robots.txt` + `sitemap.xml`. Accessibility: skip-link, focus-visible, `prefers-reduced-motion`.

## Chạy local

```bash
# Backend (cổng 5000) — tạo backend/.env theo mẫu .env.example trước
cd backend && npm install && npm start

# Frontend (cổng 5173)
cd frontend && npm install && npm run dev
```

## API chính

`POST /api/contact` đăng ký nhận tin · `POST /api/chat` chatbot Gemini · `POST /api/view` + `GET /api/views` lượt xem sản phẩm · `POST /api/checkout` + `GET /api/orders` đơn hàng · `GET /` health check