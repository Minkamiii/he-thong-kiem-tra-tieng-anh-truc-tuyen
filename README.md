# User Service - Hệ thống kiểm tra tiếng Anh trực tuyến

## Mô tả
Đây là service chính của hệ thống kiểm tra tiếng Anh trực tuyến, xây dựng bằng và mySQL. Service này quản lý các tài khoản của các user, phân quyền theo vai trò và hỗ trợ phân trang.

## Cấu trúc chính
- **Configuration/** : Cấu hình của dự án.
- **Controller/** : Controller quản lí cái API cho user.
- **Service/** : Service xử lí logic nghiệp vụ cho user, thoa tác với database.
- **dto/** : Chứa Data Transfer Object — dữ liệu dùng để trao đổi giữa tầng controller và service
- **entity/** : Định ngĩa lược đồ cho User
- **exception/** : Chứa các class xử lý lỗi, custom exception, global exception handler
- **repository** : Chứa các interface truy cập dữ liệu


## Các chức năng nổi bật
- **Đăng nhập** (phân biệt giữa đăng nhập trang user hoặc admin)
- **Đăng ký** ( đăng ký dối với người dùng hoặc thêm tài khoản đối với admin)
- **Lấy danh sách user** (có phân trang)
- **Xem chi tiết user**
- **Cập nhập hoặc xóa user**
- **Tạo và làm mới token**

## Các API đáng chú ý
- **API mặc định** http://localhost:8081/userservice/api
- **Đăng nhập** POST http://localhost:8081/userservice/api/auth/login
- **Đăng nhập trang Admin** POST http://localhost:8081/userservice/api/auth/loginAdmin
- **Đăng xuất**POST http://localhost:8081/userservice/api/auth/logout
- **Kiểm tra token có hợp lệ không** POST http://localhost:8081/userservice/api/auth/introspect
- **Làm mới token** POST http://localhost:8081/userservice/api/auth/refreshToken
- **Đăng ký** POST http://localhost:8081/userservice/api/user/register
- **Thêm user bằng admin** POST http://localhost:8081/userservice/api/user/adduser
- **Lấy tất cả user** GET http://localhost:8081/userservice/api/user/getAll
- **Lấy user theo id** GET http://localhost:8081/userservice/api/user/{userId}
- **Cập nhập user** PUT http://localhost:8081/userservice/api/user/update/{userId}
- **Cập nhập user bằng Admin** PUT http://localhost:8081/userservice/api/user/updateAdmin/{userId}
- **Xóa user** DELETE http://localhost:8081/userservice/api/user/delete/{userId}

## Các ErroCode
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception"),
    USER_EXISTED(1001, "User existed"),
    USERNAME_INVALID(1002, "username invalid"),
    PASSWORD_INVALID(1002, "password invalid"),
    EMAIL_INVALID(1002,"email invalid"),
    PHONEN_INVALID(1002,"phoneNum invalid"),
    DOB_INVALID(1002,"date of birth invalid"),
    INFORMATION_NOT_NULL(1003, "information not null"),
    UNAUTHENTICATED(1004, "unauthenticated"),
    INVALID_TOKEN(1005, "invalid token"),
    TOKEN_EXPIRED(1006, "token expired"),
    USER_UNEXISTED(404, "user not found")