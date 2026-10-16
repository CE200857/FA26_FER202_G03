import { initialUsers } from '../data/mockData';

const initializeUsers = () => {
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(initialUsers));
    }
};

export const authService = {
    login: (email, password) => {
        initializeUsers();
        const users = JSON.parse(localStorage.getItem('users'));
        
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            throw new Error("Email hoặc mật khẩu không chính xác!");
        }
        if (user.status !== "active") {
            throw new Error("Tài khoản của bạn đã bị khóa bởi quản trị viên!");
        }

        const userInfo = { id: user.id, name: user.name, email: user.email, role: user.role };
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        
        return userInfo;
    },

    register: (userData) => {
        initializeUsers();
        const users = JSON.parse(localStorage.getItem('users'));
        
        const isEmailExist = users.some(u => u.email === userData.email);
        if (isEmailExist) {
            throw new Error("Email này đã được sử dụng!");
        }

        const newUser = {
            id: new Date().getTime(),
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: "Customer",
            status: "active"
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        const userInfo = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        
        return userInfo;
    },

    logout: () => {
        localStorage.removeItem('currentUser');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    }
};