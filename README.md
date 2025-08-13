# Temp Mail Asia - Ứng dụng Email Tạm Thời

Ứng dụng React JS để tạo và quản lý email tạm thời sử dụng API của Temp Mail Asia.

## Tính năng

- ✅ Lấy danh sách các domain có sẵn
- ✅ Tạo email ngẫu nhiên
- ✅ Tạo email tùy chỉnh (chọn tên và domain)
- ✅ Xem tin nhắn đến
- ✅ Xóa tin nhắn
- ✅ Tự động làm mới tin nhắn
- ✅ Copy email và mật khẩu vào clipboard
- ✅ Giao diện tin nhắn đẹp như email client thực tế
- ✅ Click để mở/đóng nội dung tin nhắn chi tiết
- ✅ Giao diện đẹp và responsive
- ✅ Hỗ trợ tiếng Việt

## Cài đặt

1. Cài đặt các dependencies:
```bash
npm install
```

2. Chạy ứng dụng:
```bash
npm start
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## Cách sử dụng

### 1. Xem danh sách Domain
- Ứng dụng sẽ tự động tải danh sách các domain có sẵn
- Bạn có thể nhấn nút "Làm mới" để tải lại danh sách

### 2. Tạo Email Tạm Thời
- **Email Ngẫu Nhiên**: Nhấn nút "Tạo Email Ngẫu Nhiên" để tạo một email ngẫu nhiên
- **Email Tùy Chỉnh**: Nhấn nút "Tạo Email Tùy Chỉnh" để mở form tùy chỉnh
  - Nhập tên người dùng mong muốn
  - Chọn domain từ danh sách có sẵn
  - Nhấn "Tạo Email Tùy Chỉnh" để tạo
- Email sẽ được hiển thị và sẵn sàng nhận tin nhắn
- Bạn có thể copy email bằng cách nhấn vào biểu tượng copy
- Bạn cũng có thể xóa email khi không cần thiết nữa

### 3. Xem Tin Nhắn
- Sau khi tạo email, tin nhắn sẽ được tự động tải
- **Danh sách tin nhắn**: Hiển thị chủ đề, người gửi và thời gian
- **Xem chi tiết**: Click vào tin nhắn để mở nội dung đầy đủ
- **Giao diện đẹp**: Thiết kế giống email client thực tế
- Bạn có thể bật "Tự động làm mới" để tự động cập nhật tin nhắn mỗi 10 giây
- Nhấn nút "Làm mới" để tải lại tin nhắn thủ công

### 4. Xóa Tin Nhắn
- Mỗi tin nhắn có nút xóa (biểu tượng thùng rác)
- Nhấn vào để xóa tin nhắn không mong muốn

## API Endpoints

Ứng dụng sử dụng các API sau:

- `GET /api/domains/{key}` - Lấy danh sách domain
- `GET /api/random-email/{key}` - Tạo email ngẫu nhiên
- `GET /api/messages/{email}/{key}` - Lấy tin nhắn
- `DELETE /api/message/{message_id}/{key}` - Xóa tin nhắn

## Email Tùy Chỉnh

Email tùy chỉnh hoạt động theo môi trường:

### **Development (localhost):**
- Tạo email **client-side** để tránh CORS error
- Email format: `username@domain`

### **Production (Vercel):**
- **Thử gọi API** Priyo Email trước
- Nếu API thành công: Email được tạo qua server
- Nếu API thất bại: **Fallback** về client-side
- Đảm bảo hoạt động trong mọi trường hợp

## Công nghệ sử dụng

- **React 18** - Framework chính
- **CSS thuần** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Create React App** - Build tool

## Cấu trúc dự án

```
src/
├── App.js          # Component chính
├── index.js        # Entry point
└── index.css       # Styles chính

public/
└── index.html      # HTML template

package.json        # Dependencies
```

## Tùy chỉnh

Bạn có thể thay đổi API key trong file `src/App.js`:

```javascript
const API_KEY = 'your-api-key-here';
```

**Lưu ý**: API key hiện tại `7skiQDEg2v8ZuKYMrm1C` là key công khai và có thể bị giới hạn.

## Lưu ý

- Email tạm thời có thể bị xóa sau một thời gian
- Không sử dụng cho các mục đích quan trọng
- API key được sử dụng là key công khai, có thể bị giới hạn

## Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Kết nối internet
2. API key có hợp lệ không
3. Console browser để xem lỗi chi tiết

## License

Dự án này được phát triển cho mục đích học tập và sử dụng cá nhân. 