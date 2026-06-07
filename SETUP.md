# Hướng dẫn Cài đặt Muacert Reseller trên Cloudflare (Mới nhất)

Dự án này sử dụng kiến trúc **Cloudflare Pages** kết hợp với **Cloudflare D1** (Database), **Cloudflare KV** (Cache & Rate Limit) và **Cloudflare Workers** (thông qua Pages Functions).

Dưới đây là hướng dẫn chi tiết từng bước từ A-Z để triển khai dự án lên Cloudflare.

---

## Bước 1: Chuẩn bị công cụ

1. Cài đặt **Node.js** (phiên bản 18 trở lên).
2. Mở Terminal/Command Prompt và cài đặt **Wrangler** (công cụ CLI của Cloudflare):
   ```bash
   npm install -g wrangler
   ```
3. Đăng nhập vào tài khoản Cloudflare của bạn thông qua Wrangler:
   ```bash
   wrangler login
   ```
   *(Một cửa sổ trình duyệt sẽ mở ra để bạn xác thực).*

---

## Bước 2: Tạo Database D1 và KV Namespace

Dự án này sử dụng Cloudflare D1 làm cơ sở dữ liệu chính và Cloudflare KV để cache cấu hình & chống spam (Rate Limit).

1. Mở Terminal và chạy lệnh sau để tạo một database mới (ví dụ tên là `muacert-db`):
   ```bash
   wrangler d1 create muacert-db
   ```
2. Sau khi chạy lệnh trên, Wrangler sẽ in ra một đoạn cấu hình giống như sau:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "muacert-db"
   database_id = "xxxx-xxxx-xxxx-xxxx"
   ```
   **Lưu lại đoạn `database_id` này**, bạn sẽ cần nó ở Bước 4.

3. Tiếp theo, tạo một KV Namespace (ví dụ tên là `muacert-kv`):
   ```bash
   wrangler kv:namespace create "muacert-kv"
   ```
4. Wrangler sẽ in ra một đoạn cấu hình KV:
   ```toml
   [[kv_namespaces]]
   binding = "KV"
   id = "yyyy-yyyy-yyyy-yyyy"
   ```
   **Lưu lại đoạn `id` này** cho Bước 4.

---

## Bước 3: Khởi tạo các bảng trong Database

Bạn cần nạp cấu trúc bảng (schema) vào database vừa tạo. File `schema.sql` đã có sẵn trong thư mục dự án.

1. Chạy lệnh sau để tạo bảng trên Cloudflare (môi trường production):
   ```bash
   wrangler d1 execute muacert-db --file=./schema.sql --remote
   ```

---

## Bước 4: Cấu hình file `wrangler.toml`

Để Cloudflare Pages biết cách kết nối với Database D1 và KV, bạn cần tạo một file cấu hình.

1. Tạo một file tên là `wrangler.toml` ở thư mục gốc của dự án (cùng cấp với `worker.js`).
2. Dán nội dung sau vào file `wrangler.toml`:

   ```toml
   name = "muacert-reseller"
   compatibility_date = "2024-03-20"
   pages_build_output_dir = "public"

   [[d1_databases]]
   binding = "DB"
   database_name = "muacert-db"
   database_id = "ĐIỀN_DATABASE_ID_CỦA_BẠN_VÀO_ĐÂY"

   [[kv_namespaces]]
   binding = "KV"
   id = "ĐIỀN_KV_ID_CỦA_BẠN_VÀO_ĐÂY"
   ```
   *(Thay các ID bằng ID bạn đã lưu ở Bước 2).*

---

## Bước 5: Cấu hình Biến môi trường (Environment Variables)

Để bảo mật, bạn nên thiết lập mật khẩu Admin và khóa JWT qua biến môi trường. **Các cấu hình khác sẽ được thiết lập trực tiếp trong trang Admin ở Bước 10.**

1. Mở file `wrangler.toml` và thêm đoạn sau vào cuối file:
   ```toml
   [vars]
   ADMIN_PASSWORD = "mat-khau-sieu-kho-cua-ban"
   JWT_SECRET = "chuoi-ky-tu-ngau-nhien-dai-va-kho-doan"
   ```
   *(Thay bằng mật khẩu và chuỗi JWT của bạn).*

> **Lưu ý:** Các cấu hình còn lại (Token Muacert, Pay2S, ngân hàng, Turnstile...) sẽ được nhập trực tiếp trong giao diện Admin sau khi đăng nhập. Không cần tạo biến môi trường cho chúng.

---

## Bước 6: Triển khai (Deploy) lên Cloudflare Pages

Bây giờ bạn đã sẵn sàng để đưa code lên Cloudflare.

1. Chạy lệnh deploy:
   ```bash
   wrangler pages deploy public
   ```
2. Lần đầu tiên chạy, Wrangler sẽ hỏi bạn một số thông tin:
   - **Create a new project?**: Chọn `Yes`
   - **Enter the name of your new project**: Nhập tên dự án (ví dụ: `muacert-reseller`)
   - **Enter the production branch name**: Nhấn Enter để chọn mặc định (thường là `main` hoặc `master`)

3. Đợi quá trình upload hoàn tất. Wrangler sẽ cung cấp cho bạn một đường link dạng `https://muacert-reseller.pages.dev`.

---

## Bước 7: Liên kết D1 Database và KV Namespace trên Dashboard

Mặc dù đã cấu hình trong `wrangler.toml`, đối với Cloudflare Pages, bạn **BẮT BUỘC** phải liên kết D1 và KV trong giao diện web của Cloudflare.

1. Đăng nhập vào trang quản trị [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Chọn menu **Workers & Pages** ở cột bên trái.
3. Bấm vào project bạn vừa tạo (ví dụ: `muacert-reseller`).
4. Chuyển sang tab **Settings** (Cài đặt) -> Chọn **Functions** ở menu bên trái.
5. Cuộn xuống phần **D1 database bindings**.
6. Bấm **Add binding**:
   - **Variable name**: Nhập chính xác chữ `DB` (viết hoa).
   - **D1 database**: Chọn database `muacert-db` mà bạn đã tạo ở Bước 2.
7. Cuộn xuống phần **KV namespace bindings**.
8. Bấm **Add binding**:
   - **Variable name**: Nhập chính xác chữ `KV` (viết hoa).
   - **KV namespace**: Chọn namespace `muacert-kv` mà bạn đã tạo ở Bước 2.
9. Bấm **Save**.

---

## Bước 8: Deploy lại để áp dụng Binding

Sau khi liên kết Database và KV trên Dashboard, bạn cần deploy lại một lần nữa để hệ thống nhận diện.

1. Quay lại Terminal và chạy lại lệnh:
   ```bash
   wrangler pages deploy public
   ```

---

## Bước 9: Cấu hình OTA Profile (Quan trọng cho iOS)

File `public/ota.mobileconfig` dùng để lấy UDID của thiết bị iOS. File này đang chứa một URL cứng. Bạn cần sửa nó thành URL thật của bạn.

1. Mở file `public/ota.mobileconfig` bằng trình soạn thảo code.
2. Tìm dòng có chứa URL:
   ```xml
   <string>https://muacertwoker.pages.dev/api/ota/enroll</string>
   ```
3. Thay `https://muacertwoker.pages.dev` bằng domain thật của bạn (ví dụ: `https://muacert-reseller.pages.dev` hoặc domain riêng của bạn).
4. Lưu file lại.
5. Chạy lại lệnh deploy để cập nhật file này lên server:
   ```bash
   wrangler pages deploy public
   ```

---

## Bước 10: Đăng nhập Admin và Cấu hình Hệ thống

1. Truy cập vào đường dẫn Admin của bạn: `https://[domain-cua-ban]/login.html`
2. Đăng nhập với tài khoản:
   - Username: `admin`
   - Password: Mật khẩu bạn đã đặt ở **Bước 5** (hoặc `admin123` nếu bạn bỏ qua bước đó).
3. Sau khi đăng nhập thành công, vào tab **Cấu hình Hệ thống** để thiết lập:
   - **Token Muacert**: Lấy từ muacert.com
   - **Cấu hình Pay2S**: Nhập thông tin API của Pay2S để nhận thanh toán tự động.
   - **Đổi mật khẩu Admin**: Rất quan trọng, hãy đổi ngay mật khẩu mặc định!
4. Vào tab **Cấu hình Giá & Gói** để thiết lập giá bán cho khách hàng.

---

## Bước 11: Cấu hình Webhook cho Pay2S (Nạp tiền tự động)

Để hệ thống tự động cộng tiền khi khách chuyển khoản, bạn cần copy đường dẫn Webhook hiển thị trong trang Admin và dán vào phần cấu hình Webhook/IPN trên trang quản trị của Pay2S.

---

## Xử lý sự cố thường gặp (Troubleshooting)

- **Lỗi 500 Internal Server Error khi gọi API**: Thường do bạn quên thực hiện Bước 6 (Liên kết D1 và KV trong Dashboard). Hãy kiểm tra lại tab Settings -> Functions.
- **Lỗi không lấy được UDID**: Do bạn chưa sửa URL trong file `ota.mobileconfig` (Bước 8) hoặc thiết bị iOS không có kết nối mạng ổn định.
- **Lỗi Font chữ tiếng Việt**: Nếu code bị lỗi font tiếng Việt, hãy đảm bảo bạn lưu các file `.js` và `.html` dưới định dạng **UTF-8**.

Chúc bạn cài đặt thành công!