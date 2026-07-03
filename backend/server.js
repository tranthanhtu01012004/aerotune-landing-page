require('dotenv').config(); // Nạp biến môi trường từ file .env (DISCORD_WEBHOOK_URL,...)
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
// Gửi thông báo tới Discord Webhook mỗi khi có dữ liệu người dùng gửi về.
// - URL đặt trong file .env (DISCORD_WEBHOOK_URL) — không hardcode vào code.
// - Fire-and-forget: lỗi webhook không được làm hỏng response trả về client.
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

        // Đẩy dữ liệu đăng ký sang Discord Webhook (thời gian thực)
        sendToWebhook('📩 Đăng ký nhận ưu đãi mới', [
            { name: 'Họ tên', value: name, inline: true },
            { name: 'Email', value: email, inline: true },
            { name: 'Nội dung', value: message || '(trống)' },
        ]);

        res.json({ success: true, id: this.lastID });
    });
});

// Ghi nhận 1 lượt xem cho sản phẩm (gọi từ hook useViewTracker phía frontend).
// Dùng UPSERT: nếu sản phẩm đã có thì +1, chưa có thì tạo mới với count = 1.
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

// Lấy toàn bộ thống kê lượt xem — có thể dùng để hiển thị "X lượt xem" trên UI.
app.get('/api/views', (req, res) => {
    db.all(`SELECT product, count FROM product_views ORDER BY count DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Lưu đơn hàng khi khách bấm "Thanh toán ngay" ở giỏ hàng
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

        // Đẩy thông tin đơn hàng sang Discord Webhook
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

// Xem lại toàn bộ đơn hàng đã lưu (test nhanh bằng cách mở link này trên trình duyệt)
app.get('/api/orders', (req, res) => {
    db.all(`SELECT * FROM orders ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Health check — Render/UptimeRobot ping vào đây để giữ server "thức"
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'AeroTune Backend API' });
});

app.listen(PORT, () => console.log(`Backend chạy tại http://localhost:${PORT}`));
