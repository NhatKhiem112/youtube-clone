const axios = require('axios');

// Lấy token từ localStorage
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.accessToken) {
    return user.accessToken;
  }
  return null;
};

// Kiểm tra API lịch sử xem
const testWatchHistoryAPI = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log('Không tìm thấy token. Vui lòng đăng nhập trước!');
      return;
    }

    console.log('Đang kiểm tra API lịch sử xem...');
    const response = await axios.get('http://localhost:8080/api/videos/history', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Kết quả API:');
    console.log(`- Trạng thái: ${response.status}`);
    console.log(`- Dữ liệu: ${JSON.stringify(response.data)}`);
    
    if (Array.isArray(response.data)) {
      console.log(`- Số lượng video: ${response.data.length}`);
    } else {
      console.log('- Dữ liệu không phải là mảng!');
    }
  } catch (error) {
    console.error('Lỗi khi gọi API:');
    if (error.response) {
      console.error(`- Trạng thái lỗi: ${error.response.status}`);
      console.error(`- Dữ liệu lỗi: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('- Không nhận được phản hồi từ server');
    } else {
      console.error(`- Lỗi: ${error.message}`);
    }
  }
};

// Thêm video vào lịch sử xem
const addVideoToHistory = async (videoId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      console.log('Không tìm thấy token. Vui lòng đăng nhập trước!');
      return;
    }

    const videoData = {
      videoId: videoId,
      title: 'Test Video',
      description: 'This is a test video',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      channelTitle: 'Test Channel'
    };

    console.log('Đang thêm video vào lịch sử xem...');
    const response = await axios.post('http://localhost:8080/api/videos/history', videoData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Kết quả thêm video:');
    console.log(`- Trạng thái: ${response.status}`);
    console.log(`- Dữ liệu: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error('Lỗi khi thêm video:');
    if (error.response) {
      console.error(`- Trạng thái lỗi: ${error.response.status}`);
      console.error(`- Dữ liệu lỗi: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('- Không nhận được phản hồi từ server');
    } else {
      console.error(`- Lỗi: ${error.message}`);
    }
  }
};

// Chạy các hàm kiểm tra
console.log('=== BẮT ĐẦU KIỂM TRA API ===');
testWatchHistoryAPI();
// Bỏ comment dòng dưới để thêm video vào lịch sử
// addVideoToHistory('dQw4w9WgXcQ'); 