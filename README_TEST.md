# 🚗 GarageManagement — Hướng dẫn Automation Test bằng Cypress

> **Dành cho Windows (CMD / Terminal trong VS Code)**  
> Repository: https://github.com/luongng527/GarageManagement  
> Phạm vi: bộ Cypress đã thêm vào thư mục `cypress/`, gồm **UI Mock, API Readonly, Known Defects, API Workflow và Live Smoke**.  
> Cập nhật hướng dẫn: 05/11/2026.

## 1. Mục tiêu và nguyên tắc an toàn

Tài liệu này hướng dẫn **cài một lần, chạy từng nhóm test đúng môi trường, xem kết quả và xử lý lỗi thường gặp**. Bạn đã triển khai ứng dụng rồi, nên **không cần triển khai lại GarageManagement**.

**Không có lệnh nào đảm bảo tất cả test sẽ Pass nếu ứng dụng đang có bug.** Test Fail là thông tin quan trọng; cần phân biệt lỗi test, lỗi cấu hình và lỗi thực sự của Backend. Không đổi `Expected Result` để làm đẹp kết quả.

| Nhóm test | Vị trí | Nguồn dữ liệu | Có ghi DB? | Số test |
|---|---|---|---|---:|
| UI Mock | `cypress/e2e/ui/` (11 file) | `cy.intercept()` + `cypress/fixtures/garage.json` | **Không**, nếu request được mock như thiết kế | 38 |
| API Readonly | `cypress/e2e/api/01-api-readonly.cy.js` | Backend local → PostgreSQL **TEST** | Không ghi dữ liệu nghiệp vụ; có request login POST | 13 |
| Known Defects | `cypress/e2e/api/03-known-defects.cy.js` | Backend local → DB **TEST** | Không ghi | 1 |
| API Workflow | `cypress/e2e/api/02-api-workflow.cy.js` | Backend local → DB **TEST** | **Có** (tạo khách hàng, xe, phụ tùng, phiếu, hóa đơn, lịch hẹn, nhân viên) | 2 |
| Live Smoke | `cypress/e2e/live/01-live-smoke.cy.js` | Website đã triển khai → API thật do `frontend/script.js` cấu hình | Script test chỉ đăng nhập và đọc/điều hướng | 2 |
| **Tổng** | | | | **56** |

> **Rất quan trọng:** Frontend hiện có `const API = 'https://garagemanagement-wip3.onrender.com'` trong `frontend/script.js`. Vì vậy, **việc mở Frontend local không đồng nghĩa Frontend kết nối Backend TEST**. UI Mock chặn API để không truy cập DB; API Test gọi Backend local độc lập; Live Smoke truy cập backend mà frontend thực sự cấu hình.

### Cấu trúc mong đợi

```text
GarageManagement/
├── backend/
│   ├── .env.test             # Thông tin kết nối DB TEST (KHÔNG commit)
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── index.html
│   └── script.js
├── cypress/
│   ├── e2e/
│   │   ├── ui/              # 11 file, 38 test
│   │   ├── api/             # 3 file, 16 test
│   │   └── live/            # 1 file, 2 test
│   ├── fixtures/garage.json
│   └── support/
├── cypress.config.js
├── package.json             # Lệnh và dependencies cho Cypress
└── README_TEST.md           # Tài liệu này
```

## 2. Chuẩn bị MỘT LẦN

Mở **CMD** tại thư mục gốc `GarageManagement` (không phải `backend`):

```cmd
node -v
npm -v
npm install
npx cypress verify
```

Nếu Cypress báo thiếu binary do npm không chạy `postinstall`, thực hiện:

```cmd
npx cypress install
npx cypress verify
```

Nếu dự án đã cài Cypress và `verify` thành công, không cần cài lại. Bản Backend có `package.json` riêng; chỉ khi cần chạy Backend local mới thực hiện:

```cmd
cd backend
npm install
```

> Chú ý: Lệnh `npm run dev` chỉ chạy `nodemon server.js`; bản thân lệnh này **không tự chọn database TEST**. Với Node.js 24 của bạn, dùng `node --env-file=.env.test server.js` như ở mục 4.

## 3. Chạy UI Mock (38 test / 11 module) — không cần Backend

**Terminal A — tại thư mục gốc**:

```cmd
npm run serve:frontend
```

Kiểm tra `http://127.0.0.1:5500` mở được giao diện. **Giữ Terminal A chạy**.

**Terminal B — CMD khác, tại thư mục gốc**:

```cmd
set "CYPRESS_baseUrl="
set "CYPRESS_liveUi="
npx cypress run --spec "cypress/e2e/ui/*.cy.js"
```

Hoặc mở giao diện để xem từng thao tác:

```cmd
npm run test:open
```

Trong Cypress, chọn **E2E Testing → Chrome → `cypress/e2e/ui/`** rồi chọn file cần chạy (`01-auth` đến `11-staff`).

**Tài khoản `admin_test / demo123` trong UI Mock là dữ liệu giả lập**, không phải tài khoản PostgreSQL. `cy.intercept()` trả kết quả từ bộ nhớ, không lưu vào database.

**Lưu ý Windows:** Một số bản `package.json` của gói Cypress cũ dùng lệnh `--spec 'cypress/e2e/ui/**/*.cy.js'` với **dấu nháy đơn**. CMD có thể xử lý sai dấu nháy này. Dùng lệnh `npx cypress run --spec "cypress/e2e/ui/*.cy.js"` ở trên (nháy kép), hoặc sửa script `test:ui` trong `package.json` thành:

```json
"test:ui": "cypress run --spec \"cypress/e2e/ui/*.cy.js\""
```

Khi đó có thể chạy `npm run test:ui`.

## 4. Chuẩn bị Backend + Database TEST (cho API test)

**Nếu không muốn tạo database mới mà dùng database test có sẵn.** Thì dùng lệnh dưới:

```bash
cd backend
cp .env.test.example .env.test
```

**Hoặc muốn tạo database test riêng.** Hãy tạo một Neon Project/DB riêng cho test, rồi tạo file `backend/.env.test`:

```dotenv
DATABASE_URL=postgresql://TEST_USER:TEST_PASSWORD@TEST_HOST/TEST_DATABASE?sslmode=require
JWT_SECRET=your-own-long-random-test-secret
NODE_ENV=production
PORT=3000
```

`NODE_ENV=production` ở đây được dùng **vì `server.js` hiện bật SSL cho PostgreSQL khi biến này là `production`**; nó *không* tự khiến ứng dụng dùng production DB. Database thực tế do `DATABASE_URL` quyết định. Giá trị URL trên chỉ là ví dụ.

### 4.1 Chạy Backend TEST

**Terminal C — tại `GarageManagement/backend`:**

Bỏ qua lệnh này nếu đã ở backend:

```cmd
cd backend
```

Thực hiện 1 trong 2 lệnh dưới đây:

```cmd
node --env-file=.env.test server.js
```

Nếu bạn đã thêm script `dev:test` vào `backend/package.json` thì **chọn một trong hai cách**, không chạy đồng thời:

```cmd
npm run dev:test
```

Backend khởi động thành công sẽ báo database sẵn sàng và server chạy cổng 3000. Mở `http://127.0.0.1:3000/` để kiểm tra health check. **Giữ Terminal C mở**. Health check chỉ chứng minh server hoạt động; phải xem thông báo kết nối database và xác minh cấu hình DB như bước 4.1.

> Không chạy thêm `npm run dev` trên cùng port 3000; nếu không sẽ bị `EADDRINUSE`.

### 4.2 Cấu hình tài khoản TEST cho Cypress

Giữ Backend TEST ở cổng 3000 đang chạy. Trong **Terminal B — CMD tại thư mục gốc** chạy (khác Terminal Backend):

```cmd
set "CYPRESS_apiUrl=http://127.0.0.1:3000"
set "CYPRESS_adminUsername=admin"
set "CYPRESS_adminPassword=admin123"
set "CYPRESS_runApiReads=YES_TEST_BACKEND"
set "CYPRESS_runKnownDefects=YES_TEST_BACKEND"
set "CYPRESS_allowApiWrites=YES_TEST_DB"
set "CYPRESS_testDbConfirmed=YES"
npx cypress run --spec "cypress/e2e/api/*.cy.js" --config "baseUrl=http://127.0.0.1:3000"
```

**Hoặc mở giao diện để xem từng thao tác** bằng cách thay dòng lệnh cuối trong dòng lệnh trên bằng lệnh dưới:

```cmd
npm run test:open
```

**Bảo mật:** Không lưu mật khẩu hoặc `DATABASE_URL` thật vào README, repo, GitHub Actions hay ảnh chụp màn hình. Các lệnh `set` chỉ tồn tại trong cửa sổ CMD hiện tại. Nếu mở CMD mới, phải đặt lại biến.

**Sau khi test xong, tắt cờ cho phép ghi** trong CMD:

```cmd
set "CYPRESS_allowApiWrites="
set "CYPRESS_testDbConfirmed="
```

**Lưu ý quan trọng:** Bộ workflow hiện **không tự dọn sạch** toàn bộ dữ liệu nó tạo. Một số tài nguyên như Repair Order và Invoice không có DELETE API; chạy lại nhiều lần sẽ làm DB TEST tích lũy dữ liệu. Không dùng tài khoản Production hoặc DB chung với hệ thống thật. Nếu test dừng giữa chừng, có thể còn dữ liệu tạo dở; chỉ reset trong **DB TEST**, không chạy lệnh xóa hàng loạt trên DB production.

## 5. Live Smoke — chạy trên Frontend đã triển khai (2 test) Sau bước này là test xong (bên dưới có thể đọc thêm)

File Live Smoke đăng nhập và mở các trang; **không thực hiện thêm/sửa/xóa**. Tuy nhiên, nó **gửi request thật đến Backend mà Frontend triển khai đang trỏ tới**, có thể là production. Chỉ chạy bằng tài khoản được phép thử trên môi trường đó.

Để tránh ảnh hưởng `CYPRESS_baseUrl` của UI Mock, hãy **đóng Cypress nếu đang mở**, mở CMD mới tại thư mục gốc, rồi chạy:

```cmd
set "CYPRESS_baseUrl=https://garage-management-frontend-wnyv.onrender.com/"
set "CYPRESS_liveUi=YES"
set "CYPRESS_adminUsername=admin"
set "CYPRESS_adminPassword=admin123"
npx cypress run --spec "cypress/e2e/live/01-live-smoke.cy.js" --config "baseUrl=http://127.0.0.1:3000"
```

**Khi chạy lệnh cuối cần chờ 1, 2p để web gọi database**
**Hoặc mở giao diện để xem từng thao tác** bằng cách thay dòng lệnh cuối trong dòng lệnh trên bằng lệnh dưới:

```cmd
npm run test:open
```

- `LIVE-01`: đăng nhập thành công, Dashboard xuất hiện 6 KPI cards.
- `LIVE-02`: điều hướng qua 10 trang chức năng.

Chú ý: nếu frontend dùng URL Backend hard-code và Backend này bị lỗi, Live Smoke sẽ Fail mặc dù UI Mock Pass. Kết quả đó phản ánh khác biệt giữa test giả lập và ứng dụng đang chạy.

## 6. Lịch chạy tối ưu (không lặp lại việc cài đặt)

**Lần đầu (cần cấu hình):**

1. `npm install` tại **root**; `npm install` tại **backend** nếu chưa cài; `npx cypress verify`.
2. Tạo và xác minh `backend/.env.test` trỏ **DB TEST**.
3. Chạy UI Mock (không cần Backend).
4. Chạy Backend TEST ở port 3000.
5. Chạy API Readonly → Known Defects (sửa bug nếu có) → API Workflow (chỉ sau khi xác minh DB).
6. Chạy Live Smoke bằng CMD mới với `baseUrl` của website đã triển khai.

**Những lần sau (không cần cài lại):**

| Terminal | Thư mục | Mở khi nào | Lệnh |
|---|---|---|---|
| A | Root `GarageManagement` | Khi test UI Mock | `npm run serve:frontend` |
| C | `backend` | Khi test API | `node --env-file=.env.test server.js` |
| B | Root `GarageManagement` | Khi chạy Cypress | `npx cypress run --spec "..."` hoặc `npm run test:open` |

## 7. Xử lý lỗi thường gặp

| Triệu chứng | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| `'nodemon' is not recognized` | Chưa cài dependency trong `backend` | `cd backend` → `npm install`; hoặc dùng `node --env-file=.env.test server.js` |
| `Cannot find module 'express'` | Chưa `npm install` trong `backend` | Chạy `npm install` tại `backend`, không phải root |
| `EADDRINUSE: 3000` | Hai backend cùng chiếm port | Dừng tiến trình cũ, chỉ chạy một Backend TEST |
| Cypress `13 pending/skipped` ở API Readonly | Thiếu opt-in | `set "CYPRESS_runApiReads=YES_TEST_BACKEND"`, khởi động lại Cypress từ **cùng CMD** |
| `401 Unauthorized` ở login API | Sai tài khoản/mật khẩu TEST hoặc đã truyền biến môi trường cũ | Kiểm tra tài khoản trong **DB TEST**, đặt lại `CYPRESS_adminUsername`/`CYPRESS_adminPassword` |
| `500` khi báo cáo tháng 2 | Xử lý khoảng ngày sai trong Backend | Xem mục 6, sửa logic ngày và retest |
| `mockGarage.js:32` / lỗi parse body | Bộ mock cũ có thể `JSON.parse` body rỗng/không hợp lệ | Kiểm tra `cypress/support/mockGarage.js`, parse chuỗi bằng `try/catch` trước khi dùng |
| UI test không mở được trang | Frontend local chưa chạy, hoặc sai `baseUrl` | Chạy `npm run serve:frontend`; xóa `CYPRESS_baseUrl` khi quay từ Live về UI Mock |
| Cypress báo không tìm thấy spec trên Windows | Script dùng nháy đơn trong CMD | Dùng `--spec "cypress/e2e/ui/*.cy.js"` như mục 3 |
| Live Smoke 401/không thấy Dashboard | Sai tài khoản live hoặc frontend trỏ Backend khác | Kiểm tra `frontend/script.js` và tài khoản của môi trường live |
| Workflow Fail và DB có dữ liệu dở | Test thất bại sau khi đã tạo một phần bản ghi | Ghi lại lỗi; chỉ reset/cô lập **DB TEST** trước lần chạy kế tiếp |

Nếu `mockGarage.js` bản cũ lỗi tại đoạn `const body = ...`, có thể thay phần đọc body bằng cách xử lý an toàn sau; chỉ dùng để sửa test mock, **không phải sửa Backend**:

```javascript
let body = {};
if (typeof req.body === 'string') {
  try { body = req.body.trim() ? JSON.parse(req.body) : {}; }
  catch { body = {}; }
} else if (req.body && typeof req.body === 'object') {
  body = req.body;
}
```

## 8. Cách đánh giá kết quả kiểm thử

- **Pass (✓):** Test được chạy và assertion đạt. Không đồng nghĩa mọi chức năng của hệ thống đều đúng.
- **Fail (✗):** Test được chạy nhưng kết quả không khớp kỳ vọng. Xem tên test, URL/request, status thực tế, stack trace và log Backend.
- **Skipped/Pending (⊘):** Test **không được chạy**, thường do chưa bật cờ môi trường. Không tính là Pass.

Khi báo cáo kiểm thử, ghi: **Test Case ID, Module, Expected Result, Actual Result, Pass/Fail/Skipped, ảnh lỗi và nguyên nhân/khắc phục**.

Với lệnh `cypress run`, Cypress in tổng kết ở Terminal và mặc định lưu ảnh chụp test thất bại trong `cypress/screenshots/`. Gói hiện đặt `video: false`, nên **không có video mặc định**.

## 9. Git và GitHub Actions

Thêm/kiểm tra `.gitignore` (giữ các dòng cũ đang cần):

```gitignore
node_modules/
.env
.env.*
backend/.env.test
cypress/screenshots/
cypress/videos/
cypress/downloads/
```

**Không commit** file `.env.test`, token, mật khẩu hoặc URL database chứa thông tin bí mật. Có thể commit `README_TEST.md`, toàn bộ mã test, `cypress.config.js`, `package.json` và `package-lock.json` ở root. Nếu `backend/package-lock.json` thay đổi do cài dependencies, kiểm tra `git diff` trước khi commit.

Workflow `.github/workflows/cypress-ui.yml` có mục tiêu **chỉ chạy UI Mock** trên push/PR; không chạy API Workflow dùng DB thật. Nên kiểm tra script `test:ui` chạy được trên môi trường CI và Windows trước khi phụ thuộc hoàn toàn vào kết quả GitHub Actions.

---

## Checklist trước khi tuyên bố hoàn thành

- [ ] **38 UI Mock Test** chạy thực tế và có kết quả (không phải Skipped).
- [ ] **13 API Readonly Test** chạy trên Backend + DB TEST.
- [ ] **1 Regression Test** có kết quả; nếu Fail thì có defect report và retest sau sửa.
- [ ] **2 API Workflow Test** chạy trên DB TEST riêng, chấp nhận bản ghi test được tạo.
- [ ] **2 Live Smoke Test** chạy trên website được phép kiểm thử.
- [ ] Ghi lại tổng số **Pass / Fail / Skipped** và bằng chứng.
- [ ] `backend/.env.test` không nằm trong commit.

**Thứ tự khuyến nghị:** UI Mock → API Readonly → Known Defects → API Workflow → Live Smoke. Đây là cách giảm rủi ro, kiểm tra lỗi sớm và tránh cấu hình qua lại không cần thiết.
