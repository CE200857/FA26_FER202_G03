import { STORAGE_KEYS, storageService } from "./storageService";
import { initialUsers } from "../data/mockData";

const getUsers = () => {
  const users = storageService.get(STORAGE_KEYS.USERS, []);
  if (users.length === 0) {
    storageService.set(STORAGE_KEYS.USERS, initialUsers);
    return initialUsers;
  }
  return users;
};

export const authService = {
  login: (email, password) => {
    const users = getUsers();

    const user = users.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      throw new Error("Email hoặc mật khẩu không chính xác!");
    }
    if (user.status !== "active") {
      throw new Error("Tài khoản của bạn đã bị khóa bởi quản trị viên!");
    }

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    storageService.set(STORAGE_KEYS.CURRENT_USER, userInfo);

    return userInfo;
  },

  register: (userData) => {
    const users = getUsers();

    const isEmailExist = users.some((u) => u.email === userData.email);
    if (isEmailExist) {
      throw new Error("Email này đã được sử dụng!");
    }

    const newUser = {
      id: "U" + new Date().getTime(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: "Customer",
      status: "active",
    };

    storageService.set(STORAGE_KEYS.USERS, [...users, newUser]);

    const userInfo = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
    localStorage.setItem("currentUser", JSON.stringify(userInfo));

    return userInfo;
  },

  logout: () => {
    storageService.remove(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: () => {
    return storageService.get(STORAGE_KEYS.CURRENT_USER, null);
  },
};
