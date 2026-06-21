# HK Trip Companion

PWA hỗ trợ du lịch Hồng Kông — chạy 100% offline sau lần mở đầu, cài được lên home screen iPhone/Android.

## Nhóm 1 — Đã có

- 💬 **Câu nói tiếng Quảng** — 50+ câu theo 6 chủ đề (Cơ bản / Taxi / Nhà hàng / Mua sắm / Hỏi đường / Khẩn cấp), có Hán tự + Jyutping. Ghim câu hay dùng.
- 📅 **Lịch trình** — thêm hoạt động theo ngày, tick hoàn thành.
- 💵 **Chi tiêu** — nhập nhanh HKD, tự quy đổi VND, tổng theo ngày/loại. Tab Quy đổi HKD ↔ VND.
- ✓ **Checklist** — 6 nhóm mặc định (Giấy tờ / Tiền / Điện tử / Quần áo / Sức khỏe / Khác), thêm item tự do.
- ℹ️ **Thông tin** — số khẩn cấp (bấm gọi trực tiếp), địa điểm đã lưu kèm tên tiếng Hoa, 12 mẹo nhanh.

Tất cả dữ liệu lưu localStorage. Reset bằng cách xoá storage trong DevTools hoặc gỡ app.

## Deploy lên GitHub Pages

```bash
cd C:/Users/HP/hk-trip
git init
git add .
git commit -m "init HK Trip Companion"
git branch -M main
git remote add origin https://github.com/ctdweb4work/hk-trip.git
git push -u origin main
```

Settings → Pages → Source: `main` / `/ (root)`. URL: `https://ctdweb4work.github.io/hk-trip/`

## Test offline

1. Mở app trên Chrome/Safari mobile
2. Lần đầu cần online để Service Worker cache
3. DevTools → Application → Service Workers → tick "Offline" → reload, vẫn chạy
4. iPhone: Safari → Share → "Add to Home Screen" → mở từ home screen như app

## Stack

- React 18 + Tailwind CSS (CDN, Babel 7)
- Service Worker (cache-first)
- localStorage cho persistence
- No build, no backend
