# Hướng dẫn Cài đặt Muacert Reseller trên Điện thoại (Mobile) qua GitHub

Nếu bạn không có máy tính, bạn hoàn toàn có thể triển khai dự án này lên Cloudflare trực tiếp từ điện thoại thông qua GitHub.

Dưới đây là hướng dẫn chi tiết từng bước.

---

## Bước 1: Fork mã nguồn về GitHub của bạn

Thay vì phải tải file lên thủ công, cách nhanh nhất là "Fork" (sao chép) mã nguồn từ kho lưu trữ gốc về tài khoản GitHub của bạn.

1. Mở trình duyệt trên điện thoại, truy cập [GitHub.com](https://github.com/) và đăng nhập (hoặc đăng ký tài khoản nếu chưa có).
2. Truy cập vào đường dẫn kho lưu trữ gốc: [https://github.com/khoindvn/khoindvn](https://github.com/khoindvn/khoindvn)
3. Chuyển trình duyệt sang chế độ **"Trang web cho máy tính" (Desktop site)** để dễ thao tác hơn.
4. Nhìn lên góc trên bên phải màn hình, bấm vào nút **Fork**.
5. Ở màn hình tiếp theo, phần "Repository name" bạn có thể giữ nguyên hoặc đổi tên tùy ý (ví dụ: `muacert-reseller`).
6. Đảm bảo bỏ chọn ô "Copy the main branch only" (nếu có) hoặc cứ để mặc định.
7. Bấm nút **Create fork** màu xanh lá cây.
8. Đợi vài giây, GitHub sẽ tạo một bản sao toàn bộ mã nguồn này về tài khoản của bạn.

---

## Bước 2: Tạo Database D1 và KV Namespace trên Cloudflare

1. Mở tab mới, truy cập [Cloudflare Dashboard](https://dash.cloudflare.com/) và đăng nhập.
2. Ở menu bên trái, chọn **Storage & Databases** -> **D1 SQL Database**.
3. Bấm nút **Create database**.
4. Đặt tên là `muacert-db` và bấm **Create**.
5. Bấm vào database vừa tạo, chuyển sang tab **Console**.
6. Mở file `schema.sql` trên GitHub của bạn, copy toàn bộ nội dung.
7. Dán nội dung đó vào ô Console của D1 trên Cloudflare và bấm **Execute** (hoặc Run) để tạo các bảng.
8. Tiếp theo, quay lại menu **Storage & Databases** -> Chọn **Workers KV**.
9. Bấm **Create a namespace**, đặt tên là `muacert-kv` và bấm **Add**.

---

## Bước 3: Kết nối GitHub với Cloudflare Pages

1. Quay lại menu **Compute** -> Chọn **Workers & Pages** trên Cloudflare.
2. Bấm nút **Create application**.
3. Ở phần **Looking to deploy Pages?** -> Chọn **[Get started]** -> sẽ thấy **Import an existing Git repository** -> Chọn **Get started**.
4. Chọn tài khoản GitHub của bạn và cấp quyền truy cập cho Cloudflare.
5. Chọn repository mà bạn vừa Fork ở Bước 1 -> Bấm **Begin setup**.
6. Ở phần **Build settings**:
   - **Framework preset**: Chọn `None`
   - **Build command**: Để trống
   - **Build output directory**: Nhập `public`
7. Bấm **Save and Deploy**.
8. *Lưu ý: Lần deploy đầu tiên này API sẽ bị lỗi 500 vì chưa kết nối Database. Đừng lo, hãy chuyển sang Bước 4.*

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

1. Tiếp tục ở phần **Settings** -> tìm **Bindings** -> Chọn **Add**.
2. Chọn **D1 database**:
   - **Variable name**: Nhập chính xác chữ `DB` (viết hoa).
   - **D1 database**: Chọn database `muacert-db` mà bạn đã tạo ở Bước 2.
3. Tiếp tục bấm **Add** -> Chọn **KV namespace**:
   - **Variable name**: Nhập chính xác chữ `KV` (viết hoa).
   - **KV namespace**: Chọn namespace `muacert-kv` mà bạn đã tạo ở Bước 2.
4. Bấm **Save**.

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
   - Password: Mật khẩu bạn đã đặt ở **Bước 4** (Phần `ADMIN_PASSWORD`: Mật khẩu đăng nhập Admin (ví dụ: `MatKhauSieuKho2026!`)).
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