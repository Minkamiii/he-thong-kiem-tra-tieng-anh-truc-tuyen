# Test Service - Hệ thống kiểm tra tiếng Anh trực tuyến

## Mô tả
Đây là service chính của hệ thống kiểm tra tiếng Anh trực tuyến, xây dựng bằng và MongoDB. Service này quản lý các bài test, câu hỏi, upload file audio/image, và hỗ trợ phân trang, tìm kiếm theo loại bài test.

## Cấu trúc chính
- **src/app.controller.ts**: Controller quản lý các API cho Test (CRUD, upload file, tìm kiếm theo loại, phân trang).
- **src/service/test.service.ts**: Service xử lý logic nghiệp vụ cho Test, thao tác với database, bulk insert/update/delete câu hỏi.
- **src/model/test/test.schema.ts**: Định nghĩa schema cho Test (bao gồm tasks, sections, questions).
- **src/dto/**: Các Data Transfer Object cho tạo mới, cập nhật Test.
- **src/main.ts**: File khởi động ứng dụng, cấu hình static file, CORS, port.

## Các chức năng nổi bật
- **Tạo mới bài test** (có thể upload file audio cho Listening).
- **Upload ảnh** cho các câu hỏi hoặc bài test.
- **Lấy danh sách test** (có phân trang).
- **Tìm kiếm test theo loại** (Reading, Listening, ...).
- **Xem chi tiết test** (populate câu hỏi).
- **Cập nhật, xóa test** (cập nhật đồng thời cả câu hỏi liên quan).
- **Quản lý file tĩnh** (uploads/audio, uploads/images).

## Các API đáng chú ý
- **API mặc định** http://[::1]:8000/api/test
- **Upload đề thi mới** (POST) http://[::1]:8000/api/test
- **Upload ảnh** (POST) http://[::1]:8000/api/test/image
- **Lấy danh sách đề thi theo trang** (GET) http://[::1]:8000/api/test?page=x (MẶC ĐỊNH x = 1)
- **Lấy đề thi theo id** (GET) http://[::1]:8000/api/test/:id
- **Lấy danh sách đề thi theo loại có phân trang** (GET) http://[::1]:8000/api/test/type/:type?page=x (MẶC ĐỊNH x = 1)
- **Cập nhật đề thi theo id** (PUT) http://[::1]:8000/api/test/:id
- **Xóa đề thi theo id** (DELETE) http://[::1]:8000/api/test/:id