# 🧪 Hướng dẫn kiểm thử GarageManagement bằng Cypress

Tài liệu này hướng dẫn cài đặt và chạy kiểm thử **giao diện (UI/E2E)** và **API** trên máy cá nhân. Các tên file test và script có thể thay đổi theo phiên bản repository; kiểm tra `package.json`, `cypress.config.js` và thư mục `cypress/e2e/` trước khi chạy.

## 1. Yêu cầu

- Git, Node.js và npm (dùng phiên bản Node.js tương thích với `package.json` và Cypress của dự án).
- Trình duyệt hỗ trợ bởi Cypress.
- PostgreSQL hoặc Neon PostgreSQL **dành riêng cho kiểm thử** nếu chạy test có truy cập backend/database.

> **Không chạy bài kiểm thử có thao tác ghi/xóa dữ liệu trên database production.** Không dùng thông tin đăng nhập production trong các lệnh test.

## 2. Clone và cài dependencies

```bash
git clone https://github.com/luongng527/GarageManagement.git
cd GarageManagement
npm ci
cd backend
npm ci
```

> `npm ci` yêu cầu có `package-lock.json` khớp với `package.json` ở cả hai vị trí. Nếu chưa có lockfile phù hợp, dùng `npm install` và cập nhật lockfile trước khi chia sẻ repository.

## 3. Cấu hình backend test


```bash
cp .env.test.example .env.test
```

```bash
cd backend
npm run dev:test
```

- Chờ log báo backend kết nối database thành công. Thử mở `http://127.0.0.1:3000/` để xác nhận API hoạt động.

> **Lưu ý:** `dev:test` đang dùng `node --watch --env-file=.env.test server.js`, nên cần phiên bản Node.js hỗ trợ `--env-file` và `--watch`. Không chạy lệnh này tại thư mục gốc.

## 4. Chạy Cypress

Mở **terminal thứ hai** tại thư mục gốc `GarageManagement`:

```bash
npm run test:open
```

Lệnh trên chỉ dùng được khi script `test:open` đã được khai báo trong `package.json` gốc. Nếu chưa có, dùng:

```bash
npx cypress open
```

Chọn **E2E Testing**, trình duyệt, sau đó chọn file test trong `cypress/e2e/`.

### 4.1. Kiểm thử UI
Mở **terminal thứ ba** tại thư mục gốc `GarageManagement`để chạy UI local:
```bash
npm run serve:frontend
```
- Xác định `baseUrl` của Cypress trong `cypress.config.js` và URL frontend mà test sử dụng.
- Nếu bài test cần frontend local, mở frontend bằng phương thức mà dự án/test đang cấu hình.
- Chạy các spec UI trong `cypress/e2e/`.
- **Không tự động cho rằng UI test sử dụng database test**: kiểm tra URL API trong `frontend/script.js` và các lệnh `cy.intercept()`/mock trong test. Nếu frontend trỏ Render, test có thể đang gọi backend online.

### 4.2. Kiểm thử API (chỉ đọc)

Nếu repository có file `cypress/e2e/api/01-api-readonly.cy.js` và test dùng các biến môi trường sau, tại **CMD Windows** ở thư mục gốc chạy:

```cmd
set "CYPRESS_apiUrl=http://127.0.0.1:3000"
set "CYPRESS_adminUsername=admin"
set "CYPRESS_adminPassword=admin123"
set "CYPRESS_runApiReads=YES_TEST_BACKEND"
npm run test:open
```

Các lệnh `set` ở trên dành cho **CMD**, không phải PowerShell hoặc Git Bash. 

Chọn `cypress/e2e/api/01-api-readonly.cy.js` để chạy test. Nếu không có file này, chọn spec API thực tế trong repo và đọc yêu cầu của spec trước khi chạy.

## 5. Chạy test trên terminal (headless)

Tại thư mục gốc:

```bash
npx cypress run
```

Để chạy riêng một spec (nếu file tồn tại):

```bash
npx cypress run --spec "cypress/e2e/api/01-api-readonly.cy.js"
```

Các biến môi trường cần thiết vẫn phải được cung cấp theo yêu cầu của test.

## 6. Lỗi thường gặp

| Hiện tượng | Kiểm tra |
|---|---|
| `Missing script: test:open` | Script trong `package.json` gốc; có thể dùng `npx cypress open` |
| `ECONNREFUSED 127.0.0.1:3000` | Backend test chưa chạy hoặc sai cổng |
| Lỗi database | `DATABASE_URL` trong `backend/.env.test`, kết nối Neon/PostgreSQL, quyền truy cập |
| Test login thất bại | Tài khoản test đã được tạo chưa, URL API có đúng không |
| UI test gọi nhầm production | Kiểm tra `frontend/script.js`, `cypress.config.js`, `cy.intercept()` |
| Cypress không tìm thấy spec | Kiểm tra đường dẫn thật trong `cypress/e2e/` |

## 7. Những file nên đưa lên GitHub

```text
GarageManagement/
├── .gitignore
├── README_TEST.md
├── package.json
├── package-lock.json
├── cypress.config.js
├── cypress/
│   └── e2e/
└── backend/
    ├── package.json
    ├── package-lock.json
    ├── server.js
    └── .env.test.example  # Tạo mới, chỉ chứa giá trị mẫu
```

Không commit `node_modules/`, `backend/.env`, `backend/.env.test`, `cypress/videos/`, `cypress/screenshots/` hoặc thông tin đăng nhập thật.

## 8. Đóng góp test mới

1. Viết test trong `cypress/e2e/`.
2. Chạy test trên môi trường riêng.
3. Kiểm tra `git diff` và `git status` để tránh commit secret.
4. Commit và push source code, cấu hình và tài liệu cần thiết.
