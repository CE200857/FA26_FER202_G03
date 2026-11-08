import axios from 'axios';
import { STORAGE_KEYS, storageService } from './storageService';
import md5 from "md5";

const API_URL = 'http://localhost:5001';
const toUserInfo = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

const getUsersByEmail = async (email) => {
    let response;
    try {
        response = await axios.get(`${API_URL}/users`, { params: { email } });
    } catch {
        throw new Error('Không thể tải tài khoản. Kiểm tra json-server ở cổng 5001.');
    }
    if (!Array.isArray(response.data)) {
        throw new Error('Dữ liệu tài khoản không hợp lệ.');
    }
    return response.data;
};

export const authService = {
    login: async (email, password) => {
        const users = await getUsersByEmail(email);
        const passwordHash = md5(password);
        const user = users.find((u) => u.password === passwordHash);
        if (!user) {
            throw new Error('Email hoặc mật khẩu không chính xác!');
        }
        if (user.status !== 'active') {
            throw new Error('Tài khoản của bạn đã bị khóa bởi quản trị viên!');
        }
        const userInfo = toUserInfo(user);
        storageService.set(STORAGE_KEYS.CURRENT_USER, userInfo);
        return userInfo;
    },

    register: async (userData) => {
        const users = await getUsersByEmail(userData.email);
        if (users.length > 0) {
            throw new Error('Email này đã được sử dụng!');
        }
        const newUser = {
            name: userData.name,
            email: userData.email,
            password: md5(userData.password),
            phone: '',
            role: 'Customer',
            status: 'active',
        };
        let createdUser;
        try {
            const response = await axios.post(`${API_URL}/users`, newUser);
            createdUser = response.data;
        } catch {
            throw new Error('Không thể đăng ký tài khoản. Kiểm tra json-server ở cổng 5001.');
        }
        const userInfo = toUserInfo(createdUser);
        storageService.set(STORAGE_KEYS.CURRENT_USER, userInfo);
        return userInfo;
    },

    logout: () => {
        storageService.remove(STORAGE_KEYS.CURRENT_USER);
    },

    getCurrentUser: () => {
        return storageService.get(STORAGE_KEYS.CURRENT_USER, null);
    },
};