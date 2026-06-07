# Hướng dẫn Cài đặt Muacert Reseller trên Điện thoại (Mobile) qua GitHub

Nếu bạn không có máy tính, bạn hoàn toàn có thể triển khai dự án này lên Cloudflare trực tiếp từ điện thoại thông qua GitHub.

Dưới đây là hướng dẫn chi tiết từng bước.

---

## Bước 1: Đưa mã nguồn lên GitHub

1. Mở trình duyệt trên điện thoại, truy cập [GitHub.com](https://github.com/) và đăng nhập (hoặc đăng ký tài khoản nếu chưa có).
2. Chuyển trình duyệt sang chế độ **"Trang web cho máy tính" (Desktop site)** để dễ thao tác hơn.
3. Bấm vào dấu **+** ở góc trên bên phải -> Chọn **New repository**.
4. Đặt tên cho repository (ví dụ: `muacert-reseller`), chọn **Private** (để bảo mật mã nguồn), rồi bấm **Create repository**.
5. Bấm vào **"uploading an existing file"** trên màn hình tiếp theo.
6. Chọn tất cả các file và thư mục của dự án (bao gồm `worker.js`, `schema.sql`, thư mục `public`, `functions`, v.v.) từ điện thoại của bạn và tải lên.
7. Bấm **Commit changes** để lưu mã nguồn lên GitHub.

---

## Bước 2: Tạo Database D1 và KV Namespace trên Cloudflare

1. Mở tab mới, truy cập [Cloudflare Dashboard](https://dash.cloudflare.com/) và đăng nhập.
2. Ở menu bên trái, chọn **Workers & Pages** -> **D1 SQL Database**.
3. Bấm nút **Create database**.
4. Đặt tên là `muacert-db` và bấm **Create**.
5. Bấm vào database vừa tạo, chuyển sang tab **Console**.
6. Mở file `schema.sql` trên GitHub của bạn, copy toàn bộ nội dung.
7. Dán nội dung đó vào ô Console của D1 trên Cloudflare và bấm **Execute** (hoặc Run) để tạo các bảng.
8. Tiếp theo, quay lại menu **Workers & Pages** -> Chọn **KV**.
9. Bấm **Create a namespace**, đặt tên là `muacert-kv` và bấm **Add**.

---

## Bước 3: Kết nối GitHub với Cloudflare Pages

1. Quay lại menu **Workers & Pages** trên Cloudflare.
2. Bấm nút **Create application** -> Chọn tab **Pages** -> Bấm **Connect to Git**.
3. Chọn tài khoản GitHub của bạn và cấp quyền truy cập cho Cloudflare.
4. Chọn repository `muacert-reseller` mà bạn vừa tạo ở Bước 1 -> Bấm **Begin setup**.
5. Ở phần **Build settings**:
   - **Framework preset**: Chọn `None`
   - **Build command**: Để trống
   - **Build output directory**: Nhập `public`
6. Bấm **Save and Deploy**.
7. *Lưu ý: Lần deploy đầu tiên này API sẽ bị lỗi 500 vì chưa kết nối Database. Đừng lo, hãy chuyển sang Bước 4.*

---

## Bước 4: Cấu hình Biến môi trường (Environment Variables)

Để bảo mật, bạn nên thiết lập mật khẩu Admin và khóa JWT qua biến môi trường. **Các cấu hình khác sẽ được thiết lập trực tiếp trong trang Admin ở Bước 8.**

1. Trên Cloudflare Dashboard, vào project Pages của bạn.
2. Vào tab **Settings** -> Chọn **Environment variables**.
3. Bấm **Add variable** để thêm 2 biến sau:
   - `ADMIN_PASSWORD`: Mật khẩu đăng nhập Admin (ví dụ: `MatKhauSieuKho2026!`)
   - `JWT_SECRET`: Khóa bí mật mã hóa phiên đăng nhập (Nhập 1 chuỗi ngẫu nhiên dài)
4. Bấm **Save**.
5. Vào lại tab **Deployments** -> bấm **Retry deployment** để áp dụng biến môi trường.

> **Lưu ý:** Các cấu hình còn lại (Token Muacert, Pay2S, ngân hàng, Turnstile...) sẽ được nhập trực tiếp trong giao diện Admin sau khi đăng nhập. Không cần tạo biến môi trường cho chúng.

---

## Bước 5: Liên kết Database D1 và KV Namespace với Pages

1. Sau khi deploy xong, bấm **Continue to project**.
2. Chuyển sang tab **Settings** -> Chọn **Functions** ở menu bên trái.
3. Cuộn xuống phần **D1 database bindings**.
4. Bấm **Add binding**:
   - **Variable name**: Nhập chính xác chữ `DB` (viết hoa).
   - **D1 database**: Chọn database `muacert-db` mà bạn đã tạo ở Bước 2.
5. Cuộn xuống phần **KV namespace bindings**.
6. Bấm **Add binding**:
   - **Variable name**: Nhập chính xác chữ `KV` (viết hoa).
   - **KV namespace**: Chọn namespace `muacert-kv` mà bạn đã tạo ở Bước 2.
7. Bấm **Save**.

---

## Bước 6: Deploy lại để áp dụng Database

1. Chuyển sang tab **Deployments** của project trên Cloudflare.
2. Bấm vào dấu 3 chấm ở bản deploy mới nhất -> Chọn **Retry deployment**.
3. Đợi quá trình deploy hoàn tất. Lúc này API đã kết nối thành công với Database.

---

## Bước 7: Cấu hình OTA Profile (Quan trọng cho iOS)

File `public/ota.mobileconfig` dùng để lấy UDID của thiết bị iOS. Bạn cần sửa URL trong file này thành domain thật của bạn.

1. Quay lại GitHub, mở repository của bạn.
2. Mở file `public/ota.mobileconfig`.
3. Bấm vào biểu tượng **Cây bút (Edit)**.
4. Tìm dòng có chứa URL:
   ```xml
   <string>https://muacertwoker.pages.dev/api/ota/enroll</string>
   ```
5. Thay `https://muacertwoker.pages.dev` bằng domain Cloudflare Pages của bạn (ví dụ: `https://muacert-reseller.pages.dev`).
6. Cuộn xuống dưới cùng, bấm **Commit changes**.
7. Cloudflare sẽ tự động nhận diện thay đổi trên GitHub và tự động deploy lại. Đợi khoảng 1-2 phút là xong.

---

## Bước 8: Đăng nhập Admin và Cấu hình Hệ thống

1. Truy cập vào đường dẫn Admin của bạn: `https://[domain-cua-ban]/login.html`
2. Đăng nhập với tài khoản:
   - Username: `admin`
   - Password: Mật khẩu bạn đã đặt ở **Bước 4** (hoặc `admin123` nếu bạn bỏ qua bước đó).
3. Sau khi đăng nhập thành công, vào tab **Cấu hình Hệ thống** để thiết lập:
   - **Token Muacert**: Lấy từ muacert.com
   - **Cấu hình Pay2S**: Nhập thông tin API của Pay2S để nhận thanh toán tự động.
   - **Đổi mật khẩu Admin**: Rất quan trọng, hãy đổi ngay mật khẩu mặc định!
4. Vào tab **Cấu hình Giá & Gói** để thiết lập giá bán cho khách hàng.

---

## Bước 9: Cấu hình Webhook cho Pay2S (Nạp tiền tự động)

Để hệ thống tự động cộng tiền khi khách chuyển khoản, bạn cần copy đường dẫn Webhook hiển thị trong trang Admin và dán vào phần cấu hình Webhook/IPN trên trang quản trị của Pay2S.

---

## Xử lý sự cố thường gặp

- **Lỗi 500 Internal Server Error khi gọi API**: Thường do bạn quên thực hiện Bước 4 (Liên kết D1 Database). Hãy kiểm tra lại tab Settings -> Functions -> D1 database bindings.
- **Lỗi không lấy được UDID**: Do bạn chưa sửa URL trong file `ota.mobileconfig` (Bước 6) hoặc thiết bị iOS không có kết nối mạng ổn định.
- **Lỗi khi upload file lên GitHub**: Nếu upload qua trình duyệt điện thoại bị lỗi, bạn có thể dùng các ứng dụng Git client trên điện thoại (như Working Copy cho iOS hoặc Termux cho Android) để push code lên.