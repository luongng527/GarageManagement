# 🚗 AutoGara — Hệ thống Quản lý Gara Ô tô

<div align="center">

![AutoGara Banner](https://img.shields.io/badge/AutoGara-Garage%20Management-1A2236?style=for-the-badge&logo=car&logoColor=white)

[![Live Demo](https://img.shields.io/badge/🌐%20Demo%20Online-se104gara.netlify.app-3B82F6?style=flat-square)](https://se104gara.netlify.app)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Ứng dụng web quản lý toàn diện cho gara ô tô vừa và nhỏ tại Việt Nam**

[Demo trực tuyến](https://se104gara.netlify.app) · [Báo cáo đồ án](#) · [Hướng dẫn cài đặt](#-cài-đặt-và-chạy-local)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cài đặt và chạy local](#-cài-đặt-và-chạy-local)
- [Cấu trúc mã nguồn](#-cấu-trúc-mã-nguồn)
- [API Documentation](#-api-documentation)
- [Tài khoản demo](#-tài-khoản-demo)
- [Nhóm thực hiện](#-nhóm-thực-hiện)

---

## 🎯 Giới thiệu

**AutoGara** là hệ thống quản lý gara ô tô được xây dựng nhằm số hoá toàn bộ quy trình nghiệp vụ của một gara cỡ vừa — từ tiếp nhận xe, sửa chữa, xuất hoá đơn đến thanh toán — trên một nền tảng web duy nhất.

> Đây là đồ án môn **SE104 — Nhập môn Công nghệ Phần mềm**, lớp SE104.Q26, Trường Đại học Công nghệ Thông tin — ĐHQG TP.HCM (2025–2026).

### Vấn đề giải quyết

Phần lớn gara vừa và nhỏ tại Việt Nam vẫn quản lý bằng sổ tay hoặc Excel rời rạc, dẫn đến:
- Khó tra cứu lịch sử sửa chữa của từng xe
- Không kiểm soát được tồn kho phụ tùng
- Dễ thất thoát doanh thu, thiếu dữ liệu ra quyết định

AutoGara giải quyết các vấn đề trên với chi phí triển khai bằng **0 đồng** (dùng free tier của Render + Neon).

---

## ✨ Tính năng

| Nhóm chức năng | Mô tả |
|---|---|
| 🔐 **Xác thực & Phân quyền** | Đăng nhập JWT, 2 vai trò: Quản lý / Nhân viên lễ tân |
| 👥 **Khách hàng & Xe** | CRUD, tìm kiếm theo SĐT/biển số, lịch sử sửa chữa |
| 🔧 **Phiếu sửa chữa** | Tạo phiếu, thêm dịch vụ/phụ tùng, cập nhật 4 trạng thái |
| 📦 **Kho phụ tùng** | Quản lý tồn kho, cảnh báo tồn thấp, nhập kho |
| 📅 **Lịch hẹn** | Đặt lịch, xác nhận, huỷ — 4 trạng thái |
| 🧾 **Hoá đơn & Thanh toán** | Xuất hoá đơn, 3 phương thức TT, snapshot giá |
| 📊 **Báo cáo & Dashboard** | Doanh thu theo ngày/tháng/năm, top 10 dịch vụ, KPI |
| 👨‍💼 **Quản lý nhân viên** | CRUD tài khoản nội bộ (chỉ Quản lý) |

---

## 🛠 Công nghệ sử dụng

**Frontend**
- HTML5, CSS3, JavaScript (ES6+) — SPA thuần không dùng framework
- Font Awesome 6.5, Google Fonts (Inter)

**Backend**
- Node.js 22 + Express 4
- `bcryptjs` — mã hoá mật khẩu
- `jsonwebtoken` — xác thực stateless
- `pg` (node-postgres) — connection pool + prepared statement

**Database**
- PostgreSQL 16 trên [Neon.tech](https://neon.tech) (serverless, SSL)

**DevOps**
- [Render.com](https://render.com) — hosting backend (auto-deploy từ GitHub)
- [Netlify](https://netlify.com) — hosting frontend
- Git + GitHub — quản lý mã nguồn

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────┐
│              CLIENT (Browser)                    │
│         HTML + CSS + JavaScript (SPA)            │
└──────────────────────┬──────────────────────────┘
                       │ HTTPS / REST API
                       │ Authorization: Bearer <JWT>
┌──────────────────────▼──────────────────────────┐
│           APPLICATION LAYER (Node.js)            │
│  CORS → auth() → adminOnly() → Route Handler     │
│              Express 4 REST API                  │
└──────────────────────┬──────────────────────────┘
                       │ SSL / Prepared Statement
┌──────────────────────▼──────────────────────────┐
│             DATA LAYER (PostgreSQL)              │
│        10 tables · 9 foreign key constraints     │
│              Neon.tech (serverless)              │
└─────────────────────────────────────────────────┘
```

**Bảo mật theo nguyên tắc Defense in Depth:**
- 🔒 bcrypt (salt=10) cho mật khẩu
- 🎫 JWT (HS256, hết hạn 12h) cho session stateless
- 🛡 RBAC middleware — phân quyền tại tầng server
- 💉 Prepared statement — chống SQL Injection (OWASP A03)
- 🔐 HTTPS + SSL bắt buộc trên mọi kết nối

---
<details>
## 🚀 Cài đặt và chạy local

### Yêu cầu
- Node.js ≥ 18
- PostgreSQL hoặc tài khoản [Neon.tech](https://neon.tech) (miễn phí)

### Các bước

```bash
# 1. Clone repo
git clone https://github.com/24520823-KFLora/GarageManagement.git
cd GarageManagement

# 2. Cài dependency
npm install

# 3. Tạo file môi trường
cp .env.example .env
```

Mở `.env` và điền thông tin:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-secret-key-at-least-32-chars
NODE_ENV=development
PORT=3000
```

```bash
# 4. Chạy server (tự động tạo bảng + seed admin lần đầu)
npm run dev

# 5. Truy cập
open http://localhost:3000
```

> **Lưu ý:** Server tự động chạy `initDB()` khi khởi động — tạo tất cả bảng và tài khoản admin mặc định nếu chưa có.

### Deploy lên Render.com

1. Fork repo về tài khoản GitHub của bạn
2. Tạo **Web Service** mới trên [Render.com](https://render.com), kết nối repo
3. Thêm Environment Variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`
4. Build Command: `npm install` · Start Command: `node server.js`
5. Deploy — sau 2–3 phút truy cập URL Render cấp

> ⚠️ **Free tier:** Backend tự ngủ sau 15 phút không có request. Lần đầu truy cập cần chờ ~60 giây để Render khởi động lại — đây là giới hạn của gói miễn phí, không phải lỗi.

---
</details>
## 🚀 Cài đặt và chạy Local

### Yêu cầu

- Git
- Node.js ≥ 18
- npm
- PostgreSQL hoặc tài khoản [Neon.tech](https://neon.tech) để sử dụng PostgreSQL trên Cloud

> Khuyến nghị sử dụng **Neon** để không cần cài PostgreSQL trực tiếp trên máy.

---

### 1. Clone Repository

```bash
git clone https://github.com/24520823-KFLora/GarageManagement.git
cd GarageManagement
```

Cấu trúc chính của project:

```text
GarageManagement/
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── index.html
│   └── script.js
│
├── .gitignore
└── README.md
```

---

### 2. Cài đặt Backend

`package.json` của Node.js nằm trong thư mục `backend`, vì vậy cần chuyển vào thư mục này trước khi chạy `npm install`:

```bash
cd backend
npm install
```

Sau khi hoàn tất, npm sẽ tạo thư mục:

```text
backend/node_modules/
```

> Không chạy `npm install` ở thư mục gốc `GarageManagement`.

---

### 3. Tạo PostgreSQL Database bằng Neon

Nếu sử dụng Neon:

1. Truy cập [Neon](https://neon.tech)
2. Đăng nhập hoặc tạo tài khoản
3. Tạo một Project mới
4. Mở phần **Connect**
5. Copy **Connection String**

Connection String sẽ có dạng:

```text
postgresql://username:password@hostname/database?sslmode=require
```

Ví dụ:

```text
postgresql://neondb_owner:password@ep-example.neon.tech/neondb?sslmode=require
```

> ⚠️ Không chia sẻ Connection String vì nó chứa thông tin đăng nhập database.

---

### 4. Tạo file `.env`

Tạo file:

```text
backend/.env
```

Nội dung:

```env
DATABASE_URL=YOUR_NEON_CONNECTION_STRING
JWT_SECRET=your-secret-key-at-least-32-characters
NODE_ENV=development
PORT=3000
```

Trong đó:

- `DATABASE_URL`: Connection String lấy từ Neon
- `JWT_SECRET`: chuỗi bí mật dùng để ký JWT, nên dài ít nhất 32 ký tự
- `NODE_ENV`: đặt `development` khi chạy local
- `PORT`: cổng backend local, mặc định `3000`

Ví dụ cấu trúc sau khi tạo:

```text
GarageManagement/
├── backend/
│   ├── .env
│   ├── node_modules/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
└── frontend/
```

> ⚠️ File `.env` chứa thông tin nhạy cảm và **không được commit lên GitHub**.

Đảm bảo `.gitignore` có:

```gitignore
.env
backend/.env
node_modules/
backend/node_modules/
```

---

### 5. Chạy Backend Local

Tại thư mục:

```text
GarageManagement/backend
```

Với Node.js hỗ trợ `--env-file`, chạy:

```bash
node --env-file=.env server.js
```

Nếu kết nối database thành công, terminal sẽ hiển thị tương tự:

```text
✅ Database sẵn sàng
🚗 AutoCare API running on port 3000
```

Server tự động chạy `initDB()` khi khởi động để:

- Kết nối PostgreSQL
- Tạo các bảng cần thiết nếu chưa tồn tại
- Tạo dữ liệu khởi tạo cần thiết
- Tạo tài khoản admin mặc định nếu chưa có

Kiểm tra backend tại:

```text
http://localhost:3000
```

Nếu hoạt động, API sẽ trả về trạng thái server đang chạy.

> Giữ terminal backend đang chạy trong khi sử dụng frontend local.

---

### 6. Chạy Frontend Local

Mở terminal mới:

```bash
cd GarageManagement/frontend
```

Trong `frontend/script.js`, khi muốn sử dụng backend local, đặt:

```javascript
const API = 'http://localhost:3000';
```

Frontend sử dụng HTML + JavaScript thuần nên **không cần chạy `npm install`**.

Có thể mở trực tiếp:

```text
frontend/index.html
```

Hoặc trên Windows Git Bash:

```bash
start index.html
```

Sau đó đăng nhập và sử dụng hệ thống.

---

## ☁️ Deploy Online bằng Render + Neon

Kiến trúc khi deploy:

```text
User
  │
  ▼
Render Static Site
Frontend (HTML + JavaScript)
  │
  ▼
Render Web Service
Backend (Node.js + Express)
  │
  ▼
Neon
PostgreSQL
```

### 1. Chuẩn bị GitHub

Fork repository về tài khoản GitHub của bạn hoặc sử dụng repository riêng.

Đảm bảo các file nhạy cảm không được commit:

```text
backend/.env
backend/node_modules/
```

Push source code lên GitHub:

```bash
git add .
git commit -m "Prepare project for deployment"
git push origin main
```

> ⚠️ Luôn kiểm tra `git status` trước khi commit để chắc chắn `.env` không được đưa lên GitHub.

---

## 🖥️ Deploy Backend lên Render

### 2. Tạo Web Service

Truy cập [Render](https://render.com), đăng nhập và kết nối GitHub.

Chọn:

```text
New
→ Web Service
→ Chọn repository GarageManagement
```

Cấu hình:

```text
Branch: main
Root Directory: backend
Build Command: npm install
Start Command: node server.js
```

### 3. Environment Variables

Thêm các biến:

```text
DATABASE_URL = YOUR_NEON_CONNECTION_STRING
JWT_SECRET   = YOUR_SECRET_KEY
NODE_ENV     = production
```

Không cần tự đặt `PORT` trên Render vì Render sẽ cung cấp biến `PORT` cho Web Service.

Sau đó chọn **Deploy Web Service**.

Nếu thành công, log sẽ hiển thị tương tự:

```text
✅ Database sẵn sàng
🚗 AutoCare API running on port 10000
==> Your service is live
```

Render sẽ cấp URL backend dạng:

```text
https://your-backend-name.onrender.com
```

Kiểm tra URL này trên trình duyệt trước khi tiếp tục.

---

## 🌐 Kết nối Frontend với Backend Render

Sau khi backend đã deploy thành công, mở:

```text
frontend/script.js
```

Thay:

```javascript
const API = 'http://localhost:3000';
```

bằng URL backend Render:

```javascript
const API = 'https://your-backend-name.onrender.com';
```

Sau đó commit và push:

```bash
git add frontend/script.js
git commit -m "Connect frontend to Render backend"
git push origin main
```

---

## 🌍 Deploy Frontend lên Render

Trên Render chọn:

```text
New
→ Static Site
→ Chọn repository GarageManagement
```

Cấu hình:

```text
Branch: main
Root Directory: frontend
Build Command: để trống
Publish Directory: .
```

Frontend không cần Environment Variables vì API backend đã được cấu hình trong `script.js`.

Chọn:

```text
Deploy Static Site
```

Nếu thành công, Render sẽ hiển thị:

```text
Your site is live 🎉
```

và cung cấp URL frontend dạng:

```text
https://your-frontend-name.onrender.com
```

Đây là URL chính để người dùng truy cập hệ thống.

---

## 🔄 Cập nhật Website sau khi Deploy

Sau khi đã kết nối GitHub với Render, quy trình cập nhật source code:

```bash
git add .
git commit -m "Update project"
git push origin main
```

Render sẽ tự động phát hiện commit mới trên branch `main` và triển khai lại service tương ứng.

Thông thường:

- Thay đổi trong `backend/` → Web Service backend được deploy lại
- Thay đổi trong `frontend/` → Static Site frontend được deploy lại

---

## ⚠️ Lưu ý

- Không commit `.env` lên GitHub.
- Không chia sẻ `DATABASE_URL`, password Neon hoặc `JWT_SECRET`.
- Frontend và backend là hai phần deploy riêng trên Render.
- Backend sử dụng Neon PostgreSQL nên không cần cài PostgreSQL local nếu sử dụng Neon.
- Khi chạy local, backend mặc định sử dụng `http://localhost:3000`.
- Khi chạy online, frontend phải trỏ `API` đến URL Web Service của Render.
- Nếu sử dụng gói Render có cơ chế sleep khi không hoạt động, lần truy cập đầu tiên sau một thời gian có thể cần chờ backend khởi động.

## 📁 Cấu trúc mã nguồn

```
GarageManagement/
├── server.js          # Entry point: toàn bộ REST routes + initDB()
├── public/            # Frontend SPA (static files)
│   ├── index.html     # Single HTML shell
│   ├── styles.css     # Toàn bộ CSS
│   └── script.js      # Logic frontend, fetch() calls
├── .env.example       # Mẫu biến môi trường
├── package.json       # Dependencies & scripts
└── README.md
```

**Scripts:**
```bash
npm run dev    # Chạy development với nodemon (auto-reload)
npm start      # Chạy production
```

---

## 📡 API Documentation

Tất cả endpoint (trừ `/api/auth/login`) yêu cầu header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Xác thực
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| POST | `/api/auth/login` | Đăng nhập, trả về JWT | Public |

### Khách hàng & Xe
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/api/customers` | Danh sách & tìm kiếm | Đăng nhập |
| POST | `/api/customers` | Thêm khách hàng | Đăng nhập |
| PUT/DELETE | `/api/customers/:id` | Sửa / Xoá | Đăng nhập |
| GET/POST/PUT/DELETE | `/api/vehicles[/:id]` | CRUD xe | Đăng nhập |

### Phiếu sửa chữa
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET/POST | `/api/repair-orders` | Danh sách & tạo phiếu | Đăng nhập |
| PUT | `/api/repair-orders/:id/status` | Cập nhật trạng thái | Đăng nhập |
| POST/DELETE | `/api/repair-orders/:id/services` | Thêm/xoá dịch vụ | Đăng nhập |
| POST/DELETE | `/api/repair-orders/:id/parts` | Thêm/xoá phụ tùng (± kho) | Đăng nhập |

### Báo cáo
| Method | Endpoint | Mô tả | Quyền |
|---|---|---|---|
| GET | `/api/reports/dashboard` | KPI tổng quan | Đăng nhập |
| GET | `/api/reports/revenue` | Doanh thu theo ngày/tháng/năm | **Quản lý** |
| GET | `/api/reports/services` | Top 10 dịch vụ | Đăng nhập |

**Ví dụ request/response:**
```bash
POST /api/auth/login
Content-Type: application/json

{ "username": "admin", "password": "admin123" }

# Response 200 OK
{ "token": "eyJhbGci...", "user": { "id": 1, "role": "quan_ly" } }
```

---

## 🔑 Tài khoản demo

| Vai trò | Username | Password | Quyền hạn |
|---|---|---|---|
| Quản lý | `admin` | `admin123` | Toàn quyền |
| Nhân viên | `nhanvien` | `nv123` | Giới hạn |

> ⚠️ Đây là tài khoản demo — không lưu dữ liệu nhạy cảm thật vào hệ thống này.

---

## 👨‍💻 Nhóm thực hiện

Đồ án môn **SE104.Q26 — Nhập môn Công nghệ Phần mềm**
Giảng viên hướng dẫn: **ThS. Huỳnh Ngọc Tín**

| MSSV | Họ và tên | Vai trò |
|---|---|---|
| 24520823 | Nguyễn Đăng Khoa | Nhóm trưởng · Phân tích YC · Thiết kế CSDL |
| 24520802 | Trương Công Khánh | Backend Node.js · REST API · PostgreSQL |
| 24521035 | Nguyễn Lương | Frontend · UI/UX · Dashboard |
| 24521040 | Bùi Duy Mạnh | Triển khai cloud · Kiểm thử |
| 24521743 | Phan Công Thuận | Khảo sát · Báo cáo · Tổng hợp |

---

## 📄 License

Dự án này được cấp phép theo [MIT License](LICENSE).

---

<div align="center">
  <sub>Được xây dựng với ❤️ bởi nhóm SE104.Q26 · UIT 2025</sub>
</div>
