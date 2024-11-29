# Black Menu - Hướng Dẫn Cài Đặt và Sử Dụng

## Yêu Cầu Hệ Thống
- Node.js phiên bản 16.x trở lên
- npm hoặc yarn (khuyến nghị sử dụng yarn)
- Visual Studio Code (IDE được khuyến nghị)

## Cài Đặt

1. **Clone dự án**
```bash
git clone [url-của-repository]
cd black-menu
```

2. **Cài đặt các dependencies**
```bash
npm install
# hoặc
yarn install
```

## Cấu Hình

### Cấu Hình API
- Đường dẫn: `src/services/api/`
- Các file cần chú ý:
  - `machines.ts`: API cho dữ liệu máy
  - `cpu.ts`: API cho dữ liệu CPU
  - `report.ts`: API cho báo cáo

Để thay đổi địa chỉ API, chỉnh sửa các file tương ứng trong thư mục `src/services/api/`.

### Components
Các components chính nằm trong thư mục `src/app/components/`:
- `Card.tsx`: Component hiển thị thông tin từng máy
- `Header.tsx`: Component header của ứng dụng
- `Sidebar.tsx`: Component thanh điều hướng
- `Footer.tsx`: Component footer
- `Loading.tsx`: Component loading
- `CustomToast.tsx`: Component thông báo

## Chạy Ứng Dụng

1. **Chạy môi trường development**
```bash
npm run dev
# hoặc
yarn dev
```
- Truy cập: http://localhost:3000

2. **Build và chạy production**
```bash
# Build
npm run build
# hoặc
yarn build

# Không build được do xung đột thư viện


## Cấu Trúc Thư Mục

```
black-menu/
├── src/
│   ├── app/
│   │   ├── components/     # Các components dùng chung
│   │   ├── context/        # Context providers (ArrowKeyContext, etc.)
│   │   ├── dashboard/      # Trang dashboard chính
│   │   ├── setttingMove/   # Trang cài đặt di chuyển
│   │   ├── api/           # API routes và endpoints
│   │   ├── layout.tsx     # Layout chung của ứng dụng
│   │   └── page.tsx       # Trang chủ
│   ├── services/
│   │   └── api/          # Service calls (machines, report, etc.)
│   ├── styles/           # Global CSS và theme styles
├── public/              # Static files và assets
├── package.json        # Dependencies và scripts
└── tsconfig.json      # TypeScript configuration
```

## Tính Năng Chính

1. **Trang Chủ (`/`)**
   - Hiển thị biểu đồ mục tiêu và thực hiện
   - Hiển thị danh sách máy
   - Điều hướng bằng phím mũi tên

2. **Trang Cài Đặt (`/setttingMove`)**
   - Cấu hình thông số máy
   - Bật/tắt máy
   - Cài đặt thời gian

3. **Trang Chi Tiết (`/detail`)**
   - Xem thông tin chi tiết của máy
   - Biểu đồ hiệu suất theo thời gian
   - Theo dõi trạng thái hoạt động

4. **Trang Báo Cáo (`/report`)**
   - Xem báo cáo thống kê
   - Cài đặt thời gian báo cáo

## Lưu Ý

1. **Phím tắt**
   - Mũi tên trái/phải: Điều hướng danh sách máy
   - Mũi tên lên/xuống: Điều hướng menu

2. **Theme**
   - Hỗ trợ Dark/Light mode
   - Thay đổi trong context/ThemeContext.tsx

3. **Responsive**
   - Ứng dụng được thiết kế cho màn hình desktop
   - Không hỗ trợ thiết bị di động

## Xử Lý Lỗi Thường Gặp

1. **Lỗi kết nối API**
   - Kiểm tra địa chỉ API trong các file service
   - Kiểm tra kết nối mạng
   - Kiểm tra console để xem chi tiết lỗi

2. **Lỗi hiển thị**
   - Xóa cache của trình duyệt
   - Kiểm tra console để xem lỗi JavaScript
   - Thử hard refresh (Ctrl + F5)
