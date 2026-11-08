import { STORAGE_KEYS, storageService } from "./storageService";

const API_URL = "http://localhost:5001";

const toUserInfo = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const authService = {
  login: (email, password) => {
    return fetch(`${API_URL}/users?email=${email}`)
      .then((res) => res.json())
      .then((users) => {
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
      });
  },

  register: (userData) => {
    return fetch(`${API_URL}/users?email=${userData.email}`)
      .then((res) => res.json())
      .then((users) => {
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

        return fetch(`${API_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newUser),
        });
      })
      .then((res) => res.json())
      .then((createdUser) => {
        const userInfo = toUserInfo(createdUser);
        storageService.set(STORAGE_KEYS.CURRENT_USER, userInfo);

        return userInfo;
      });
  },

  logout: () => {
    storageService.remove(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentUser: () => {
    return storageService.get(STORAGE_KEYS.CURRENT_USER, null);
  },
};
