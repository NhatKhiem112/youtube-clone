import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

class AuthService {
    async login(username, password) {
        try {
            const response = await axios.post(API_URL + 'signin', {
                username,
                password
            });

            // Handle JWT response
            if (response.data && response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    }

    logout() {
        console.log("🔑 Executing FORCED logout from AuthService");
        try {
            // Xóa toàn bộ localStorage
            localStorage.clear();
            console.log("🔑 All localStorage cleared");
            
            // Double-check xóa user
            localStorage.removeItem('user');
            console.log("🔑 User specifically removed");
            
            // Xóa toàn bộ sessionStorage
            sessionStorage.clear();
            console.log("🔑 All sessionStorage cleared");
            
            // Xóa cookies
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            console.log("🔑 All cookies cleared");
            
            // Kích hoạt sự kiện để các component khác biết
            try {
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new Event('logout'));
                console.log("🔑 Storage and logout events dispatched");
            } catch (e) {
                console.error("🔑 Error dispatching events:", e);
            }
            
            // Kiểm tra lại
            const stillLoggedIn = localStorage.getItem('user');
            console.log("🔑 Still logged in?", !!stillLoggedIn);
            if (stillLoggedIn) {
                console.warn("🔑 WARNING: Still logged in after logout attempt!");
                // Thử xóa lại
                localStorage.removeItem('user');
                localStorage.clear();
            }
            
            // Làm mới trang
            console.log("🔑 Will reload page in 50ms");
            setTimeout(() => {
                window.location.reload(true);
            }, 50);
            
            return true;
        } catch (error) {
            console.error("🔑 Critical error during logout:", error);
            // Phương án cuối cùng
            localStorage.clear();
            sessionStorage.clear();
            setTimeout(() => window.location.reload(true), 100);
            return false;
        }
    }

    async register(username, email, password) {
        try {
            const response = await axios.post(API_URL + 'signup', {
                username,
                email,
                password
                // No role field - backend will assign default role
            });
            return response.data;
        } catch (error) {
            console.error("Registration error:", error);
            throw error;
        }
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    isLoggedIn() {
        const user = this.getCurrentUser();
        return !!user;
    }
}

export default new AuthService(); 