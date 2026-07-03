require('dotenv').config(); // Nạp biến môi trường từ file .env (DISCORD_WEBHOOK_URL, GEMINI_API_KEY,...)
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Kết nối cơ sở dữ liệu SQLite (sẽ tự tạo file aerotune.db nếu chưa có)
const db = new sqlite3.Database('./aerotune.db', (err) => {
    if (err) console.error(err.message);
    else {
        console.log('Đã kết nối cơ sở dữ liệu SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT
        )`);
        // Bảng lưu lượt "đã xem" theo từng sản phẩm — dùng cho tính năng đếm view real-time.
        db.run(`CREATE TABLE IF NOT EXISTS product_views (
            product TEXT PRIMARY KEY,
            count INTEGER NOT NULL DEFAULT 0
        )`);
        // Bảng lưu đơn hàng khi khách bấm "Thanh toán ngay"
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            items TEXT NOT NULL,
            total INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// ============ WEBHOOK THỰC TẾ (Discord) ============
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

function sendToWebhook(title, fields) {
    if (!WEBHOOK_URL) return; // Chưa cấu hình webhook thì bỏ qua êm đẹp

    fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            embeds: [{
                title,
                color: 0x2997ff, // màu accent của thương hiệu AeroTune
                fields,
                timestamp: new Date().toISOString(),
                footer: { text: 'AeroTune Landing Page' },
            }],
        }),
    }).catch((err) => console.warn('⚠️ Gửi webhook thất bại:', err.message));
}

// ============ API CHATBOT TÍCH HỢP GEMINI AI ============
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Thiếu nội dung tin nhắn (message).' });
    }

    // Nếu chưa cấu hình Key trong .env, tự động fallback về hệ thống rule-based cũ để tránh sập app
    if (!GEMINI_API_KEY) {
        console.warn('⚠️ Chưa cấu hình GEMINI_API_KEY trong file .env. Chạy chế độ fallback.');
        return res.json({ reply: "Xin chào! Trợ lý AI đang được bảo trì hệ thống kết nối nâng cao, bạn cần hỏi thông tin gì về sản phẩm AeroTune Pro không ạ?" });
    }

    try {
        // Gọi API đến mô hình Gemini 2.5 Flash thông qua fetch thuần của Node.js
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Bạn là trợ lý ảo thông minh, thân thiện của dòng tai nghe cao cấp AeroTune Pro. 
                        Hãy trả lời khách hàng một cách ngắn gọn (dưới 3 câu), lịch sự, sử dụng các thông tin chính xác sau:
                        - AeroTune Pro (Bản cao cấp): Giá 4.990.000đ. Thời lượng pin 40 giờ, hỗ trợ sạc nhanh Type-C (sạc 10 phút dùng 5 giờ). Công nghệ chống ồn chủ động Smart-ANC lên đến 45dB. Chống nước chuẩn IPX5 (kháng mồ hôi tốt khi tập thể thao). Có 3 màu sắc thời thượng: Đen Titan, Trắng Bạc và Xanh Rêu. Bảo hành chính hãng 12 tháng, lỗi 1 đổi 1 trong vòng 30 ngày.
                        - AeroTune Lite (Bản rút gọn): Giá 1.990.000đ nếu khách muốn phiên bản nhỏ gọn, tiết kiệm hơn.
                        - Hướng dẫn mua hàng: Khách có thể bấm nút "Mua Ngay" hoặc điền Form đăng ký nhận tin trên website để nhận ngay ưu đãi giảm giá 30%.
                        - Vận chuyển: Giao hàng toàn quốc từ 2-4 ngày, khu vực nội thành hỗ trợ giao nhanh trong 24 giờ.
                        Tin nhắn của khách hàng: "${message}"`
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            const botReply = data.candidates[0].content.parts[0].text;
            res.json({ reply: botReply.trim() });
        } else {
            throw new Error('Cấu trúc phản hồi từ Gemini API không hợp lệ.');
        }

    } catch (error) {
        console.error('❌ Lỗi kết nối Gemini AI:', error.message);
        res.status(500).json({ reply: 'Mình chưa có thông tin chính xác cho câu hỏi này, bạn vui lòng để lại email ở form đăng ký để đội ngũ tư vấn viên liên hệ trực tiếp nhé!' });
    }
});

// ============ CÁC API KHÁC CỦA HỆ THỐNG ============

// API nhận dữ liệu từ React Form
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    console.log('📩 Nhận yêu cầu đăng ký:', { name, email });

    if (!name || !email) {
        console.warn('⚠️  Thiếu name hoặc email trong request body:', req.body);
        return res.status(400).json({ error: 'Thiếu tên hoặc email.' });
    }

    const sql = `INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)`;
    db.run(sql, [name, email, message], function(err) {
        if (err) {
            console.error('❌ Lỗi khi ghi vào database:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Đã lưu contact id=${this.lastID} (${name})`);

        sendToWebhook('📩 Đăng ký nhận ưu đãi mới', [
            { name: 'Họ tên', value: name, inline: true },
            { name: 'Email', value: email, inline: true },
            { name: 'Nội dung', value: message || '(trống)' },
        ]);

        res.json({ success: true, id: this.lastID });
    });
});

// Ghi nhận 1 lượt xem cho sản phẩm
app.post('/api/view', (req, res) => {
    const { product } = req.body;
    if (!product) return res.status(400).json({ error: 'Thiếu tên sản phẩm (product).' });

    const sql = `
        INSERT INTO product_views (product, count) VALUES (?, 1)
        ON CONFLICT(product) DO UPDATE SET count = count + 1
    `;
    db.run(sql, [product], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get(`SELECT count FROM product_views WHERE product = ?`, [product], (err2, row) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ success: true, product, count: row ? row.count : 1 });
        });
    });
});

// Lấy toàn bộ thống kê lượt xem
app.get('/api/views', (req, res) => {
    db.all(`SELECT product, count FROM product_views ORDER BY count DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Lưu đơn hàng khi khách bấm "Thanh toán ngay"
app.post('/api/checkout', (req, res) => {
    const { items, total } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Giỏ hàng trống, không có gì để thanh toán.' });
    }

    const sql = `INSERT INTO orders (items, total) VALUES (?, ?)`;
    db.run(sql, [JSON.stringify(items), total], function (err) {
        if (err) {
            console.error('❌ Lỗi khi lưu đơn hàng:', err.message);
            return res.status(500).json({ error: err.message });
        }
        console.log(`✅ Đã lưu đơn hàng id=${this.lastID}, tổng tiền ${total}đ`);

        const itemLines = items
            .map((i) => `• ${i.name} x${i.quantity} — ${(i.price * i.quantity).toLocaleString('vi-VN')}đ`)
            .join('\n');
        sendToWebhook('🛒 Đơn hàng mới', [
            { name: 'Sản phẩm', value: itemLines.slice(0, 1000) },
            { name: 'Tổng tiền', value: `${Number(total).toLocaleString('vi-VN')}đ`, inline: true },
        ]);

        res.json({ success: true, id: this.lastID });
    });
});

<<<<<<< HEAD
// ============ CHATBOT AI (Google Gemini) ============
// Key đặt trong .env (GEMINI_API_KEY) — TUYỆT ĐỐI không đưa key xuống frontend,
// vì mọi thứ trong frontend đều public, ai cũng đọc được key và xài chùa.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// "Bộ não" của chatbot: cung cấp thông tin sản phẩm để AI tư vấn đúng,
// và giới hạn phạm vi trả lời để không lan man ngoài chủ đề.
const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn bán hàng của AeroTune, một thương hiệu tai nghe cao cấp.
Trả lời NGẮN GỌN (tối đa 3-4 câu), thân thiện, bằng tiếng Việt, xưng "mình" gọi khách là "bạn".
Chỉ tư vấn về sản phẩm AeroTune. Câu hỏi ngoài chủ đề thì khéo léo lái về sản phẩm.

THÔNG TIN SẢN PHẨM:
- AeroTune Pro Premium: 4.990.000đ. Chống ồn chủ động Smart-ANC 45dB tự thích ứng,
  pin 40 giờ, sạc nhanh 10 phút cho 5 giờ nghe, driver Graphene mạ vàng 40mm,
  6 micro AI đàm thoại, Bluetooth 5.4 đa điểm (2 thiết bị), chuẩn kháng nước IPX5,
  nặng 250g, đệm tai memory foam, chứng nhận Hi-Res Audio Gold.
- AeroTune Lite: 1.990.000đ. Bản nhỏ gọn, pin 25 giờ, ANC tiêu chuẩn, nặng 180g.
- Đế Sạc Không Dây Cấp Tốc: 690.000đ, công suất 15W, sạc từ tính, cổng USB-C.
- Hộp Đựng Da Cao Cấp: 450.000đ, da thật, chống sốc, kháng nước bề mặt, khóa nam châm.
- Bảo hành chính hãng 24 tháng, 1 đổi 1 trong 30 ngày đầu nếu lỗi nhà sản xuất.
- Đăng ký form trên website để nhận mã giảm giá 30% cho 500 khách đầu tiên.
- Giao hàng toàn quốc 2-4 ngày, miễn phí vận chuyển cho đơn từ 1.000.000đ.`;

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Thiếu nội dung tin nhắn.' });
    }
    if (!GEMINI_API_KEY) {
        console.warn('⚠️ Chưa cấu hình GEMINI_API_KEY trong .env');
        return res.status(503).json({ error: 'Chatbot AI chưa được cấu hình.' });
    }

    try {
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                    contents: [{ role: 'user', parts: [{ text: message.trim().slice(0, 500) }] }],
                    generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
                }),
            }
        );

        const data = await geminiRes.json();

        if (!geminiRes.ok) {
            console.error('❌ Gemini API lỗi:', data.error?.message || geminiRes.status);
            return res.status(502).json({ error: data.error?.message || 'Gemini API trả về lỗi.' });
        }

        const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim();
        if (!reply) {
            return res.status(502).json({ error: 'Gemini không trả về nội dung.' });
        }

        res.json({ reply });
    } catch (err) {
        console.error('❌ Lỗi khi gọi Gemini:', err.message);
        res.status(500).json({ error: 'Không thể kết nối tới Gemini API.' });
    }
});

// Xem lại toàn bộ đơn hàng đã lưu (test nhanh bằng cách mở link này trên trình duyệt)
=======
// Xem lại toàn bộ đơn hàng đã lưu
>>>>>>> 2f8c162f52de52adb41e160d2a3e7564f9d9e88a
app.get('/api/orders', (req, res) => {
    db.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'AeroTune Backend API' });
});

app.listen(PORT, () => console.log(`Backend chạy tại http://localhost:${PORT}`));
