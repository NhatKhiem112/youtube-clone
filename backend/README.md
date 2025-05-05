# YouTube Clone Backend

Backend service cho YouTube Clone app, xử lý các chức năng lưu trữ dữ liệu như "Xem sau" và "Video đã thích".

## Yêu cầu hệ thống

- Java 22
- MySQL 8.0+
- Maven

## Thiết lập Database

### 1. Cài đặt MySQL và phpMyAdmin

#### Windows:
1. Tải và cài đặt [XAMPP](https://www.apachefriends.org/download.html) hoặc [WAMP](https://www.wampserver.com/en/) để có MySQL và phpMyAdmin trong một gói đơn giản
2. Khởi động MySQL service từ XAMPP/WAMP Control Panel
3. Truy cập phpMyAdmin tại http://localhost/phpmyadmin

#### macOS:
1. Sử dụng [Homebrew](https://brew.sh/) để cài đặt MySQL:
   ```
   brew install mysql
   ```
2. Bắt đầu dịch vụ MySQL:
   ```
   brew services start mysql
   ```
3. Cài đặt phpMyAdmin hoặc sử dụng MySQL Workbench

### 2. Tạo Database

Cơ sở dữ liệu `youtube_clone` sẽ được tạo tự động khi ứng dụng khởi động lần đầu tiên, nhưng bạn cũng có thể tạo thủ công:

1. Đăng nhập vào phpMyAdmin (thường là http://localhost/phpmyadmin)
2. Username mặc định: `root`, không có mật khẩu (như được cấu hình trong `application.properties`)
3. Tạo database mới tên là `youtube_clone`

## Khởi động ứng dụng

1. Di chuyển đến thư mục backend:
   ```
   cd backend
   ```

2. Biên dịch và chạy ứng dụng:
   ```
   mvn spring-boot:run
   ```

3. API sẽ có sẵn tại: http://localhost:8080/api

## Cấu hình Database

Nếu bạn cần thay đổi cấu hình database, hãy sửa file `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/youtube_clone?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&useLegacyDatetimeCode=false
spring.datasource.username=root
spring.datasource.password=
```

## Kiểm tra kết nối database

Sau khi khởi động ứng dụng, hãy kiểm tra:

1. Đăng nhập vào phpMyAdmin
2. Xem database `youtube_clone`
3. Các bảng sau sẽ được tạo tự động:
   - `users`
   - `roles`
   - `user_roles`
   - `liked_videos`
   - `watch_later_videos`

## Xử lý sự cố

- **Database Connection Error**: Đảm bảo MySQL đang chạy và truy cập được
- **Cannot Create Tables**: Kiểm tra quyền của người dùng MySQL
- **Port Conflict**: Nếu cổng 8080 đã được sử dụng, hãy thay đổi `server.port` trong `application.properties` 