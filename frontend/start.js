// Tăng giới hạn bộ nhớ cho Node.js và thêm tùy chọn legacy-provider
process.env.NODE_OPTIONS = '--max-old-space-size=4096 --openssl-legacy-provider';

// Sử dụng polling thay vì theo dõi file để tránh lỗi EBUSY
process.env.CHOKIDAR_USEPOLLING = 'true';
process.env.CHOKIDAR_IGNOREINITIAL = 'true';

// Tắt source map để giảm tiêu thụ bộ nhớ
process.env.GENERATE_SOURCEMAP = 'false';

// Bỏ qua lỗi preflight check
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.REACT_APP_SKIP_PREFLIGHT_CHECK = 'true';

// Xử lý lỗi bỏ qua file DumpStack.log.tmp
const fs = require('fs');
const chokidar = require('chokidar');
const originalFsWatch = fs.watch;

// Thay thế hàm fs.watch để bỏ qua các lỗi với DumpStack.log.tmp
fs.watch = function(filename, options, listener) {
  try {
    if (filename && filename.includes('DumpStack.log.tmp')) {
      // Bỏ qua việc theo dõi file này
      return { close: () => {} };
    }
    return originalFsWatch(filename, options, listener);
  } catch (err) {
    console.log(`Bỏ qua lỗi theo dõi file: ${filename}, lỗi: ${err.message}`);
    return { close: () => {} };
  }
};

// Bắt lỗi không xử lý được
process.on('uncaughtException', (err) => {
  if (err.message && err.message.includes('EBUSY') && err.message.includes('DumpStack.log.tmp')) {
    console.log('Bỏ qua lỗi EBUSY trên file DumpStack.log.tmp');
  } else {
    console.error('Lỗi không xử lý được:', err);
  }
});

// Chạy script start của React
try {
  require('react-scripts/scripts/start');
} catch (err) {
  if (err.message && err.message.includes('JavaScript heap out of memory')) {
    console.error('Lỗi hết bộ nhớ heap. Vui lòng đóng bớt các ứng dụng và thử lại.');
    process.exit(1);
  } else {
    console.error('Lỗi khi khởi động ứng dụng:', err);
    process.exit(1);
  }
} 