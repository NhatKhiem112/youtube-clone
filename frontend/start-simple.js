// Tăng giới hạn bộ nhớ cho Node.js và thêm tùy chọn legacy-provider
process.env.NODE_OPTIONS = '--max-old-space-size=4096 --openssl-legacy-provider';

// Sử dụng polling thay vì theo dõi file để tránh lỗi EBUSY
process.env.CHOKIDAR_USEPOLLING = 'true';

// Tắt source map để giảm tiêu thụ bộ nhớ
process.env.GENERATE_SOURCEMAP = 'false';

// Bắt lỗi không xử lý được
process.on('uncaughtException', (err) => {
  if (err.message && err.message.includes('EBUSY')) {
    console.log('Bỏ qua lỗi EBUSY');
    return;
  }
  console.error('Lỗi không xử lý được:', err);
});

// Chạy script start của React
require('react-scripts/scripts/start'); 