const fs = require('fs');

// Read as bytes
let buf = fs.readFileSync('worker.js');

// Convert to string
let str = buf.toString('utf8');

// Remove orphaned C0 control characters (0x00-0x1F) except \t(0x09), \n(0x0A), \r(0x0D)
// These are invalid in UTF-8 outside of multi-byte sequences and are causing corruption
str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');

// Now fix the remaining corrupted Vietnamese words
// The control chars were removed, but some characters are still wrong due to the original encoding issue

const fixes = [
  // After removing control chars, fix patterns
  ['Đc tộ', 'Đọc từ'],
  ['độtặ¯t', 'đời của'],
  ['đng bị" tođn', 'đồng bộ toàn'],
  ['trđng (chặm nhặ¥t)', 'trống (chậm nhất)'],
  ['ngưộ£c', 'ngược'],
  ['hÆ¡n', 'hơn'],
  ['XđA TK KO HOặ T ĐãNG SAU 3 NGđY', 'XÓA TK KHÔNG HOẠT ĐỘNG SAU 3 NGÀY'],
  ['đnhiộu', 'đã nhiều'],
  ['Quđnhiộu', 'Quá nhiều'], // but this was Quá nhiều? Let me check
  
  // Register/login messages
  ['Đng kđ', 'Đăng ký'],
  ['đĐng nhặp', 'đăng nhập'],
  ['mặt khặ©u', 'mật khẩu'],
  ['Tđn', 'Tên'],
  ['đđtđn tại', 'đã tồn tại'],
  ['hộ£p lHệ', 'hợp lệ'],
  ['khđộng hộ£p lHệ', 'không hợp lệ'],
  ['Đng nhặp', 'Đăng nhập'],
  ['Tđn đĐng nhặp', 'Tên đăng nhập'],
  ['đđtđn tại', 'đã tồn tại'],
  ['Chưa đĐng nhặp', 'Chưa đăng nhập'],
  
  // Deposit
  ['Tặ¡o mởnạp tiộn', 'Tạo mã nạp tiền'],
  ['Sđ tiộn', 'Số tiền'],
  ['tđi thiộu', 'tối thiểu'],
  ['mởnạp tiộn', 'mã nạp tiền'],
  ['Nặ¡p tiộn từ đđ"ng', 'Nạp tiền tự động'],
  
  // IPN
  ['Xộ¬ LđNặ P TIộ¬N Tộ° ĐãNG', 'XỬ LÝ NẠP TIỀN TỰ ĐỘNG'],
  ['Sộa lýi', 'Sửa lỗi'],
  ['vàkiộm tra', 'và kiểm tra'],
  ['số dđểng', 'sử dụng'],
  ['thđểng tin', 'thông tin'],
  ['độ biặ¿t', 'để biết'],
  ['Cđ"ng', 'Cộng'],
  ['Cộng tiộn', 'Cộng tiền'],
  ['Nặ¡p tiộn', 'Nạp tiền'],
  
  // Purchase
  ['Sđ dư không độ§', 'Số dư không đủ'],
  ['TRÆ¯ộC KHI', 'TRƯỚC KHI'],
  ['trừ tiộn', 'trừ tiền'],
  ['đđãược', 'đã được'],
  ['đĐng kđtrưđ:c', 'đăng ký trước'],
  ['trưđ:c đđ', 'trước đó'],
  ['Trộ« tiộn', 'Trừ tiền'],
  ['trđnh', 'tránh'],
  ['trênh', 'tránh'],
  ['Hođn tiộn', 'Hoàn tiền'],
  ['vàlýi', 'vì lỗi'],
  ['Gđi nđy đđhặ¿t hđểng', 'Gói này đã hết hạn'],
  ['hđ trộ£', 'hỗ trợ'],
  ['lýi kặ¿t nđi', 'lỗi kết nối'],
  ['Lđi kặ¿t nđi', 'Lỗi kết nối'],
  ['hođn lại', 'hoàn lại'],
  ['vui lýểng', 'vui lòng'],
  
  // Devices
  ['THIẾT BỊ ĐĐNG Kđ', 'THIẾT BỊ ĐÃ ĐĂNG KÝ'],
  ['tộ« Đxđa gặ§n đđy', 'từ Đã xóa gần đây'],
  ['Đxđa gặ§n đđy', 'Đã xóa gần đây'],
  ['cộ§a chđnh mởnh', 'của chính mình'],
  ['Chuyộn vào', 'Chuyển vào'],
  ['Thiặ¿t bị9', 'Thiết bị'],
  ['không tđn tại', 'không tồn tại'],
  ['thuộc vộ', 'thuộc về'],
  ['Đchuyộn', 'Đã chuyển'],
  ['mộ¥c', 'mục'],
  
  // Webhook
  ['chuyộn khoản', 'chuyển khoản'],
  ['trộ±c tiặ¿p', 'trực tiếp'],
  ['tưÆ¡ng thđch ngưộ£c', 'tương thích ngược'],
  ['mởnạp tiộn dặ¡ng', 'mã nạp tiền dạng'],
  ['Dđểng', 'Dùng'],
  ['Đlưu', 'Đã lưu'],
  
  // Admin
  ['Đ"i mặt khặ©u', 'Đổi mật khẩu'],
  ['Đãđ"i', 'Đã đổi'],
  ['Đkhóa', 'Đã khóa'],
  ['Đmở khóa', 'Đã mở khóa'],
  ['Cộng/Trộ«', 'Cộng/Trừ'],
  ['điộu chỉnh', 'điều chỉnh'],
  ['Đthay đđ"i số dư', 'Đã thay đổi số dư'],
  
  // Other
  ['Sộ dộ¥ng', 'Sử dụng'],
  ['đặ£m bảo', 'đảm bảo'],
  ['tênh tođn vặ¹n', 'tính toàn vẹn'],
  ['vàchđng', 'và chống'],
  ['cógiới hạn', 'có giới hạn'],
  ['lưộ£ng', 'lượng'],
  ['cóc chunk', 'các chunk'],
  ['mởi chunk', 'mỗi chunk'],
  ['mởi trưộộ', 'môi trường'],
  ['lặ¥y config', 'lấy config'],
  ['Đi sođt', 'Đối soát'],
  ['Lấy cóc', 'Lấy các'],
  ['vàộng 2 giộn', 'vòng 2 giờ'],
  ['Dộn dặ¹p', 'Dọn dẹp'],
  ['hoạt đđ"ng', 'hoạt động'],
  ['log cÅ©', 'log cũ'],
  ['giđ:i hặ¡n', 'giới hạn'],
  ['kđch thưđ:c', 'kích thước'],
  ['quđhặ¡n', 'quá hạn'],
  ['chưa xộ lý', 'chưa xử lý'],
  ['tđn miộn', 'tên miền'],
  ['gđc', 'gốc'],
  ['mđy chộ§', 'máy chủ'],
  ['kđapp', 'và app'],
  ['mđ', 'mở'],
  ['chđnh', 'chính'],
  ['sđ', 'số'],
  
  // Common character fixes (đ -> đ is intentional, Vietnamese đ is different from d)
  // Actually let me fix specific patterns from the scan
  ['đđ', 'đã'],  // đã
  ['vđ', 'và'],  // và
  ['cđ', 'có'],  // có
  ['bđ', 'bị'],  // bị
  ['lđi', 'lỗi'], // lỗi
  ['lđ', 'lý'],  // lý
  ['chđ', 'chỉ'], // chỉ (be careful)
  ['thđ', 'thử'], // thử
];

let count = 0;
for (const [from, to] of fixes) {
  const before = str;
  str = str.split(from).join(to);
  if (str !== before) {
    count++;
    console.log('Fixed: ' + from.substring(0, 50));
  }
}

fs.writeFileSync('worker.js', str, 'utf8');
console.log(`\nApplied ${count} fixes.`);
