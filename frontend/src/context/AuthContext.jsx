import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth.service';

// Debug logging
const DEBUG = true;
const logAuth = (...args) => DEBUG && console.log('%c[AUTH]', 'background: #4c0235; color: #fff', ...args);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        logAuth('Khởi tạo AuthContext, user từ localStorage:', user ? `${user.username} (${user.email})` : 'Không có');
        if (user) {
            setCurrentUser(user);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            logAuth('Đang xử lý đăng nhập cho:', username);
            const userData = await AuthService.login(username, password);
            logAuth('Đăng nhập thành công:', userData.username);
            setCurrentUser(userData);
            return userData;
        } catch (error) {
            logAuth('Lỗi đăng nhập:', error);
            throw error;
        }
    };

    const logout = () => {
        logAuth('⚠️ Bắt đầu quá trình đăng xuất');
        try {
            // Đánh dấu đăng xuất trước khi thực hiện bất kỳ thao tác nào
            setCurrentUser(null);
            logAuth('✓ User state set to null');
            
            // Xóa hoàn toàn localStorage
            localStorage.clear();
            logAuth('✓ Đã xóa toàn bộ localStorage');
            
            // Double-check xóa người dùng
            localStorage.removeItem('user');
            logAuth('✓ Đã xóa riêng user từ localStorage');
            
            // Xóa sessionStorage
            sessionStorage.clear();
            logAuth('✓ Đã xóa sessionStorage');
            
            // Xóa tất cả cookie
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            logAuth('✓ Đã xóa cookies');
            
            // Xác nhận lại trạng thái đăng xuất
            logAuth('✓ Xác nhận đăng xuất - User trong storage:', localStorage.getItem('user'));
            
            // Tải lại trang hoàn toàn
            logAuth('✓ Sắp làm mới trang...');
            window.location.href = '/';
            setTimeout(() => window.location.reload(true), 100);
        } catch (error) {
            logAuth('❌ Lỗi trong quá trình đăng xuất:', error);
            // Phương án dự phòng
            localStorage.removeItem('user');
            window.location.href = '/';
            setTimeout(() => window.location.reload(true), 100);
        }
    };

    const register = async (username, email, password) => {
        try {
            logAuth('Đang xử lý đăng ký cho:', username, email);
            const result = await AuthService.register(username, email, password);
            logAuth('Đăng ký thành công, kết quả:', result);
            return result;
        } catch (error) {
            logAuth('Lỗi đăng ký:', error);
            throw error;
        }
    };

    const value = {
        currentUser,
        loading,
        login,
        logout,
        register,
        isLoggedIn: !!currentUser
    };

    logAuth('Render AuthProvider, trạng thái đăng nhập:', !!currentUser);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 