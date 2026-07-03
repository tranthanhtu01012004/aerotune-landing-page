# 🎧 AeroTune Pro — Landing Page

Landing page giới thiệu tai nghe không dây cao cấp **AeroTune Pro**, xây dựng cho bài test Vòng 2 — TTS IT Phát triển Website (HELICORP).

**🔗 Demo:** https://aerotune-pro.vercel.app
**🔗 Backend API:** https://aerotune-backend.onrender.com

> ⚠️ Backend chạy trên Render free tier nên request đầu tiên có thể mất ~30s để "đánh thức" server.

## Tech Stack

| Phần | Công nghệ |
|---|---|
| Frontend | React 19 + Vite 8 (không dùng thư viện UI ngoài) |
| Backend | Node.js + Express 5 |
| Database | SQLite 3 |
| Deploy | Vercel (frontend) + Render (backend) |

## Tính năng chính

- **Cấu trúc đầy đủ theo đề bài** — Hero, tính năng nổi bật, thông số kỹ thuật, form đăng ký nhận tin
- **Scrollytelling thật** (điểm cộng) — panel trái `position: sticky` đứng yên, cột phải cuộn qua từng bước; IntersectionObserver điều khiển bước đang xem, panel đổi chỉ số kèm thanh progress
- **Specs kiểu Bento Grid** — typography-first, con số lớn có **count-up animation** (đếm từ 0 khi cuộn tới, dùng `requestAnimationFrame` + easing)
- **Dark mode** — theme navy sâu, tự nhận theo hệ điều hành, lưu lựa chọn vào localStorage
- **Mini e-commerce** (điểm cộng) — giỏ hàng có nút −/+ chỉnh số lượng, thumbnail sản phẩm; danh sách yêu thích; sản phẩm đã xem; tất cả **persist qua localStorage**
- **Theo dõi hành vi người dùng** (điểm cộng) — IntersectionObserver ghi nhận sản phẩm cuộn vào khung nhìn ≥ 50%, gửi `POST /api/view` lưu real-time vào SQLite, kèm toast thông báo hành vi click
- **Kiểm tra hợp lệ dữ liệu** (điểm cộng) — validate họ tên + email bằng regex phía client trước khi gửi về backend
- **Chatbot tư vấn** (điểm cộng) — rule-based theo từ khóa (giá, pin, chống ồn, bảo hành...), sẵn kiến trúc để thay bằng API OpenAI/Gemini
- **Hiệu ứng** — Reveal-on-scroll có stagger, tilt 3D theo chuột, cursor spotlight, skeleton loading, micro-interactions
- **Accessibility** — skip-link, aria-label, focus-visible, heading đúng thứ tự, modal dùng `visibility` để loại khỏi tab order khi đóng, hỗ trợ `prefers-reduced-motion`

## Tối ưu Performance và SEO

- **Ảnh Hero (LCP)**: `preconnect` + `preload`, `srcset` responsive, WebP/AVIF qua `auto=format`, `fetchpriority="high"`, khai báo `width/height` chống CLS
- **Code-splitting**: Chatbot tách chunk riêng bằng `React.lazy`, chỉ tải sau khi trang chính render
- **Không dependency thừa**: dùng `fetch` API thay axios, system font stack thay web font — bundle chính chỉ ~70 KB gzip
- **Skeleton thông minh**: ẩn ngay khi trang load xong (tối đa 600ms), không delay nhân tạo
- **Animation** chỉ dùng `transform`/`opacity` chạy trên GPU
- **SEO**: đầy đủ Meta Title, Description, Open Graph, Twitter Card, canonical + `robots.txt` và `sitemap.xml`

## Chạy local

```bash
# Backend (cổng 5000)
cd backend && npm install && npm start

# Frontend (cổng 5173)
cd frontend && npm install
cp .env.example .env   # chỉnh VITE_API_URL nếu cần
npm run dev
```

Build production và xem thử (dùng bản này để đo Lighthouse):

```bash
npm run build && npm run preview
```

## Cấu trúc thư mục

```
├── backend/              # Express API + SQLite (contacts, product_views, orders)
│   └── server.js
└── frontend/
    ├── public/           # robots.txt, sitemap.xml, favicon, og-image
    ├── index.html        # SEO meta: Title, Description, Open Graph, Twitter Card
    └── src/
        ├── components/   # Header, Hero, Scrollytelling, Features, Specs,
        │                 # RegisterForm, Chatbot, Sidebars, Toast, Reveal...
        └── hooks/        # useViewTracker (scroll tracking), useTilt (3D hover),
                          # useCountUp (số đếm khi cuộn tới)
```

## API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/` | Health check |
| POST | `/api/contact` | Lưu đăng ký nhận tin từ form |
| POST | `/api/view` | Ghi nhận 1 lượt xem sản phẩm (upsert) |
| GET | `/api/views` | Thống kê lượt xem theo sản phẩm |
| POST | `/api/checkout` | Lưu đơn hàng khi thanh toán |
| GET | `/api/orders` | Danh sách đơn hàng đã lưu |