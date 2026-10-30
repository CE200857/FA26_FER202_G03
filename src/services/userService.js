import { STORAGE_KEYS, storageService } from "./storageService";

const getUsers = () => storageService.get(STORAGE_KEYS.USERS, []);

export const userService = {
  getUserById: (id) => {
    const found = getUsers().find((u) => u.id === id);
    if (!found) {
      return null;
    }
    return {
      id: found.id,
      name: found.name,
      email: found.email,
      role: found.role,
      phone: found.phone || "",
      status: found.status,
    };
  },

  updateProfile: (id, { name, phone }) => {
    const users = getUsers();
    const target = users.find((u) => u.id === id);

    if (!target) {
      throw new Error("Không tìm thấy người dùng!");
    }

    const updatedUsers = users.map((u) =>
      u.id === id ? { ...u, name, phone } : u,
    );
    storageService.set(STORAGE_KEYS.USERS, updatedUsers);

    const userInfo = {
      id: target.id,
      name,
      email: target.email,
      role: target.role,
    };
    storageService.set(STORAGE_KEYS.CURRENT_USER, userInfo);

    return userInfo;
  },

  changePassword: (id, oldPassword, newPassword) => {
    const users = getUsers();
    const target = users.find((u) => u.id === id);

    if (!target) {
      throw new Error("Không tìm thấy người dùng!");
    }
    if (target.password !== oldPassword) {
      throw new Error("Mật khẩu hiện tại không chính xác!");
    }

    const updatedUsers = users.map((u) =>
      u.id === id ? { ...u, password: newPassword } : u,
    );
    storageService.set(STORAGE_KEYS.USERS, updatedUsers);

    return true;
  },
};