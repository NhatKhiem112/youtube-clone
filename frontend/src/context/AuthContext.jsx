import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const userData = await AuthService.login(username, password);
            setCurrentUser(userData);
            return userData;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        console.log("⚠️ Logout triggered from AuthContext");
        try {
            // Đánh dấu đăng xuất trước khi thực hiện bất kỳ thao tác nào
            setCurrentUser(null);
            console.log("✓ User state set to null first");
            
            // Xóa hoàn toàn localStorage
            localStorage.clear();
            console.log("✓ All localStorage cleared");
            
            // Double-check xóa người dùng
            localStorage.removeItem('user');
            console.log("✓ User specifically removed from localStorage");
            
            // Xóa sessionStorage
            sessionStorage.clear();
            console.log("✓ SessionStorage cleared");
            
            // Xóa tất cả cookie
            document.cookie.split(";").forEach(function(c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            console.log("✓ Cookies cleared");
            
            // Xác nhận lại trạng thái đăng xuất
            console.log("✓ Logout confirmation - User in storage:", localStorage.getItem('user'));
            
            // Tải lại trang hoàn toàn
            console.log("✓ Force refreshing page");
            window.location.href = '/';
            setTimeout(() => window.location.reload(true), 100);
        } catch (error) {
            console.error("❌ Error during logout:", error);
            // Phương án dự phòng
            localStorage.removeItem('user');
            window.location.href = '/';
            setTimeout(() => window.location.reload(true), 100);
        }
    };

    const register = async (username, email, password) => {
        try {
            return await AuthService.register(username, email, password);
        } catch (error) {
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