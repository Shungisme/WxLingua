# Hướng dẫn thiết lập Profile & Password Reset

## 🎯 Chức năng đã thêm

### Backend

1. **Database**: Bảng `PasswordResetToken` để lưu trữ mã reset
2. **Email Service**: Gửi email qua Gmail SMTP
3. **API Endpoints**:
   - `PUT /auth/profile` - Cập nhật profile (name, avatar)
   - `POST /auth/change-password` - Đổi mật khẩu
   - `POST /auth/forgot-password` - Gửi mã reset qua email
   - `POST /auth/reset-password` - Reset mật khẩu với mã

### Frontend

1. **Trang Profile** (`/profile`): Chỉnh sửa thông tin cá nhân và đổi mật khẩu
2. **Trang Quên mật khẩu** (`/forgot-password`): Yêu cầu mã reset
3. **Trang Đặt lại mật khẩu** (`/reset-password`): Nhập mã và mật khẩu mới

## 📋 Các bước cài đặt

### 1. Cài đặt dependencies (Backend)

```bash
cd backend
npm install nodemailer @types/nodemailer
```

### 2. Cấu hình Gmail SMTP

#### Tạo App Password cho Gmail:

1. Truy cập https://myaccount.google.com/
2. Chọn **Security** → **2-Step Verification** (bật nếu chưa có)
3. Chọn **App passwords**
4. Tạo app password mới cho "Mail" → "Other" → Nhập "WxLingua"
5. Copy mã 16 ký tự

#### Cập nhật file `.env` (backend):

```env
# Existing variables...
DATABASE_URL="postgresql://..."
JWT_SECRET="..."

# New SMTP variables
SMTP_EMAIL="your-gmail@gmail.com"
SMTP_PASSWORD="your-16-char-app-password"
```

### 3. Chạy Prisma migration

```bash
cd backend
npx prisma migrate dev --name add-password-reset-token
npx prisma generate
```

### 4. Kiểm tra errors và build

```bash
# Check for TypeScript errors
npm run typecheck

# Start development server
npm run start:dev
```

## 🧪 Test các chức năng

### 1. Test Update Profile

```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Name","avatar":"https://example.com/avatar.jpg"}'
```

### 2. Test Change Password

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"old123","newPassword":"new123456"}'
```

### 3. Test Forgot Password

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

Kiểm tra email → Nhận được mã 6 chữ số

### 4. Test Reset Password

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"code":"123456","newPassword":"newpass123"}'
```

## 🎨 UI/UX Flow

### Profile Management

1. User click vào avatar góc trên → chọn "Chỉnh sửa hồ sơ"
2. Trang `/profile` hiện 2 tabs:
   - **Thông tin cá nhân**: Sửa tên và avatar URL
   - **Đổi mật khẩu**: Nhập mật khẩu cũ và mới

### Password Reset Flow

1. User vào `/forgot-password` → nhập email
2. Nhận email với mã 6 chữ số
3. Vào `/reset-password` → nhập mã + mật khẩu mới
4. Success → redirect về `/login`

## 📧 Email Template

Email sẽ có format:

- **Subject**: Mã xác nhận đặt lại mật khẩu - WxLingua
- **Body**: HTML email với mã 6 chữ số in đậm, rõ ràng
- **Expiry**: Mã có hiệu lực trong 1 giờ

## 🔒 Bảo mật

- Mã reset được hash trước khi lưu vào DB (bcrypt)
- Mã expire sau 1 giờ
- Mã chỉ sử dụng 1 lần (marked as `used`)
- Mật khẩu mới tối thiểu 6 ký tự

## ⚠️ Lưu ý

1. **Gmail App Password**: Không dùng mật khẩu Gmail thật, phải dùng App Password
2. **Rate Limiting**: Nên thêm rate limit cho endpoint forgot-password để tránh spam
3. **Avatar Upload**: Hiện tại chỉ hỗ trợ URL, có thể mở rộng thành file upload sau
4. **Testing**: Kiểm tra kỹ việc gửi email trong môi trường dev trước khi deploy

## 🚀 Các cải tiến có thể thêm

- [ ] File upload cho avatar (Multer + S3/Cloudinary)
- [ ] Rate limiting cho password reset
- [ ] Email template tốt hơn với branding
- [ ] 2FA authentication
- [ ] Password strength meter
- [ ] Account activity log

## 📝 Database Schema

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   // Hashed reset code
  expiresAt DateTime
  used      Boolean  @default(false)

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
}
```

## ✅ Checklist triển khai

- [x] Cập nhật Prisma schema
- [x] Tạo Email service
- [x] Thêm DTOs
- [x] Implement service methods
- [x] Thêm controller endpoints
- [x] Tạo frontend profile page
- [x] Tạo forgot/reset password pages
- [ ] Install nodemailer
- [ ] Cấu hình Gmail SMTP trong .env
- [ ] Chạy migrations
- [ ] Test toàn bộ flow
- [ ] Deploy và test trên production

---

Chúc bạn triển khai thành công! 🎉
