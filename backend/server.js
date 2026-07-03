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
- AeroTune Buds Mini: 1.290.000đ. True wireless nhỏ gọn, pin 20 giờ kèm hộp sạc, IPX4, nặng 45g.
- AeroTune Pro có 3 màu: Đen Titan, Trắng Bạc và Xanh Rêu.
- Bảo hành chính hãng 24 tháng, 1 đổi 1 trong 30 ngày đầu nếu lỗi nhà sản xuất.
- Đăng ký form trên website để nhận mã giảm giá 30% cho 500 khách đầu tiên.
- Giao hàng toàn quốc 2-4 ngày (nội thành hỗ trợ giao nhanh 24 giờ), miễn phí vận chuyển cho đơn từ 1.000.000đ.`;

// Bộ trả lời dự phòng theo từ khóa — dùng khi Gemini hết quota/lỗi mạng,
// đảm bảo chatbot KHÔNG BAO GIỜ "chết" trước mặt người dùng.
function fallbackReply(message) {
    const msg = (message || '').toLowerCase();
    if (msg.includes('giá') || msg.includes('bao nhiêu') || msg.includes('tiền'))
        return 'AeroTune Pro Premium có giá 4.990.000đ, bản Lite chỉ 1.990.000đ. Đăng ký form trên trang để nhận ngay mã giảm 30% cho 500 khách đầu tiên nhé!';
    if (msg.includes('pin') || msg.includes('sạc'))
        return 'AeroTune Pro dùng liên tục 40 giờ, sạc nhanh 10 phút cho 5 giờ nghe nhạc qua cổng USB-C bạn nhé!';
    if (msg.includes('ồn') || msg.includes('anc') || msg.includes('chống'))
        return 'Máy trang bị Smart-ANC 45dB tự điều chỉnh theo môi trường, kết hợp 6 micro AI cho cuộc gọi cực trong.';
    if (msg.includes('bảo hành') || msg.includes('đổi'))
        return 'Sản phẩm bảo hành chính hãng 24 tháng, 1 đổi 1 trong 30 ngày đầu nếu có lỗi nhà sản xuất ạ.';
    if (msg.includes('so sánh') || msg.includes('lite') || msg.includes('khác'))
        return 'Bản Pro (4.990.000đ): ANC 45dB, pin 40h, driver Graphene 40mm. Bản Lite (1.990.000đ): nhỏ gọn 180g, ANC tiêu chuẩn, pin 25h — phù hợp nhu cầu cơ bản. Nếu bạn cần chống ồn tốt và pin trâu thì Pro đáng đầu tư hơn!';
    if (msg.includes('nước') || msg.includes('mưa') || msg.includes('tập'))
        return 'AeroTune Pro đạt chuẩn kháng nước IPX5, thoải mái dùng khi tập luyện hay đi mưa nhỏ bạn nhé.';
    if (msg.includes('giao') || msg.includes('ship'))
        return 'Bên mình giao toàn quốc 2-4 ngày, nội thành hỗ trợ giao nhanh 24 giờ, miễn phí vận chuyển cho đơn từ 1 triệu đồng.';
    return 'Cảm ơn bạn đã quan tâm AeroTune Pro! Bạn có thể hỏi mình về giá, pin, chống ồn, bảo hành... hoặc để lại email ở form đăng ký để nhận tư vấn chi tiết kèm mã giảm 30% nhé!';
}

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Thiếu nội dung tin nhắn.' });
    }
    if (!GEMINI_API_KEY) {
        console.warn('⚠️ Chưa cấu hình GEMINI_API_KEY trong file .env. Chạy chế độ fallback.');
        return res.json({ reply: 'Xin chào! Trợ lý AI đang được bảo trì hệ thống kết nối nâng cao, bạn cần hỏi thông tin gì về sản phẩm AeroTune Pro không ạ?' });
    }

    try {
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
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
            // Hết quota / lỗi tạm thời -> chuyển sang bộ trả lời dự phòng, KHÔNG báo lỗi ra ngoài
            return res.json({ reply: fallbackReply(message) });
        }

        const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim();
        if (!reply) {
            return res.status(502).json({ error: 'Gemini không trả về nội dung.' });
        }

        res.json({ reply });
    } catch (err) {
        console.error('❌ Lỗi khi gọi Gemini:', err.message);
        res.json({ reply: fallbackReply(message) });
    }
});

// Xem lại toàn bộ đơn hàng đã lưu (test nhanh bằng cách mở link này trên trình duyệt)
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
