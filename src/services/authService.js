import axios from "axios";
import { STORAGE_KEYS, storageService } from "./storageService";

const API_URL = "http://localhost:5001";

const getUsersByEmail = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    throw new Error("Không thể kết nối đến máy chủ!");
  }
};

const toUserInfo = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const authService = {
  login: async (email, password) => {
    const users = await getUsersByEmail(email);

    const user = users.find((u) => u.password === password);

    if (!user) {
      throw new Error("Email hoặc mật khẩu không chính xác!");
    }
    if (user.status !== "active") {
      throw new Error("Tài khoản của bạn đã bị khóa bởi quản trị viên!");
    }

    const userInfo = toUserInfo(user);
    storageService.set(STORAGE_KEYS.CURRENT_USER, userInfo);

    return userInfo;
  },

  register: async (userData) => {
    const users = await getUsersByEmail(userData.email);

    if (users.length > 0) {
      throw new Error("Email này đã được sử dụng!");
    }

    const newUser = {
      id: "U" + new Date().getTime(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      phone: "",
      role: "Customer",
      status: "active",
    };

    let createdUser;
    try {
      const response = await axios.post(`${API_URL}/users`, newUser);
      createdUser = response.data;
    } catch (error) {
      throw new Error("Không thể kết nối đến máy chủ!");
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
