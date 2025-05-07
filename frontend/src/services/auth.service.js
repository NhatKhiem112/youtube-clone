import axios from 'axios';

// Debug logging
const DEBUG = true;
const logService = (...args) => DEBUG && console.log('%c[AUTH-SERVICE]', 'background: #0f4c81; color: #fff', ...args);

const API_URL = 'http://localhost:8080/api/auth/';

class AuthService {
    async login(username, password) {
        logService(`📥 Login request cho user: ${username}`);
        try {
            const response = await axios.post(API_URL + 'signin', {
                username,
                password
            });

            // Handle JWT response
            if (response.data && response.data.token) {
                logService('📋 Nhận được token JWT, lưu vào localStorage');
                localStorage.setItem('user', JSON.stringify(response.data));
                
                // Kiểm tra xem đã lưu thành công chưa
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    logService('✅ Đã lưu user vào localStorage thành công');
                } else {
                    logService('⚠️ Không thể lưu user vào localStorage');
                }
            } else {
                logService('⚠️ Không nhận được token từ server');
            }
            return response.data;
        } catch (error) {
            logService("❌ Lỗi đăng nhập:", error.response?.status, error.response?.data || error.message);
            throw error;
        }
    }

    logout() {
        logService("🔑 Bắt đầu đăng xuất từ AuthService");
        try {
            // Xóa thông tin người dùng từ localStorage
            localStorage.clear();
            logService("🔑 Đã xóa localStorage");
            
            // Double-check xóa user
            localStorage.removeItem('user');
            logService("🔑 Đã xóa riêng user");
            
            // Xóa toàn bộ sessionStorage
            sessionStorage.clear();
            logService("🔑 Đã xóa sessionStorage");
            
            // Xóa cookies
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            logService("🔑 Đã xóa cookies");
            
            // Kích hoạt sự kiện để các component khác biết
            try {
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('logout'));
                logService("🔑 Đã gửi sự kiện storage và logout");
            } catch (e) {
                logService("🔑 Lỗi khi gửi sự kiện:", e);
            }
            
            // Kiểm tra lại
            const stillLoggedIn = localStorage.getItem('user');
            logService("🔑 Vẫn còn đăng nhập?", !!stillLoggedIn);
            if (stillLoggedIn) {
                logService("🔑 CẢNH BÁO: Vẫn còn đăng nhập sau khi đăng xuất!");
                // Thử xóa lại
                localStorage.removeItem('user');
                localStorage.clear();
            }
            
            logService("🔑 Đăng xuất hoàn tất");
            return true;
        } catch (error) {
            logService("🔑 Lỗi nghiêm trọng trong quá trình đăng xuất:", error);
            // Phương án cuối cùng
            localStorage.clear();
            sessionStorage.clear();
            return false;
        }
    }

    async register(username, email, password) {
        logService(`📝 Đăng ký user mới: ${username}, ${email}`);
        try {
            const response = await axios.post(API_URL + 'signup', {
                username,
                email,
                password
            });
            logService('✅ Đăng ký thành công:', response.data.message || 'Không có thông báo');
            return response.data;
        } catch (error) {
            logService("❌ Lỗi đăng ký:", error.response?.status, error.response?.data || error.message);
            throw error;
        }
    }

    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                logService('🔍 getCurrentUser: Không có user trong localStorage');
                return null;
            }
            
            const user = JSON.parse(userStr);
            logService('🔍 getCurrentUser:', user ? `${user.username} (token ${user.token ? 'có sẵn' : 'không có'})` : 'Dữ liệu user không hợp lệ');
            return user;
        } catch (error) {
            logService('❌ Lỗi khi lấy thông tin user hiện tại:', error);
            return null;
        }
    }

    isLoggedIn() {
        const user = this.getCurrentUser();
        const loggedIn = !!user;
        logService('🔑 Kiểm tra đăng nhập:', loggedIn ? 'Đã đăng nhập' : 'Chưa đăng nhập');
        return loggedIn;
    }
}

export default new AuthService(); 