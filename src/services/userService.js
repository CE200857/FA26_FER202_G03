import { STORAGE_KEYS, storageService } from "./storageService";
const API_URL = "http://localhost:5001";

const getUsers = () => storageService.get(STORAGE_KEYS.USERS, []);

export const userService = {
  getUserById: (id) => {
    return fetch(`${API_URL}/users?id=${id}`)
      .then((res) => res.json())
      .then((users) => {
        const found = users[0];

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
      });
  },

  updateProfile: (id, { name, phone }) => {
    return fetch(`${API_URL}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    })
      .then((res) => res.json())
      .then((target) => {
        const userInfo = {
          id: target.id,
          name: target.name,
          email: target.email,
          role: target.role,
        };
        storageService.set(STORAGE_KEYS.CURRENT_USER, userInfo);

        return userInfo;
      });
  },

  changePassword: (id, oldPassword, newPassword) => {
    return fetch(`${API_URL}/users?id=${id}`)
      .then((res) => res.json())
      .then((users) => {
        const target = users[0];

        if (!target) {
          throw new Error("Không tìm thấy người dùng!");
        }
        if (target.password !== oldPassword) {
          throw new Error("Mật khẩu hiện tại không chính xác!");
        }

        return fetch(`${API_URL}/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: newPassword }),
        });
      })
      .then(() => true);
  },

  getAllUsers: () =>
    getUsers().map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone || "",
      status: u.status,
    })),

  createUser: ({ name, email, password, phone, role }) => {
    const users = getUsers();

    const isEmailExist = users.some(
      (u) => u.email.toLowerCase() === email.toLowerCase(),
    );
    if (isEmailExist) {
      throw new Error("Email này đã được sử dụng!");
    }

    const newUser = {
      id: "U" + new Date().getTime(),
      name,
      email,
      password,
      phone,
      role,
      status: "active",
    };
    storageService.set(STORAGE_KEYS.USERS, [...users, newUser]);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      status: newUser.status,
    };
  },

  updateUser: (id, { name, phone, role }) => {
    const users = getUsers();
    const target = users.find((u) => u.id === id);

    if (!target) {
      throw new Error("Không tìm thấy người dùng!");
    }

    const updatedUsers = users.map((u) =>
      u.id === id ? { ...u, name, phone, role } : u,
    );
    storageService.set(STORAGE_KEYS.USERS, updatedUsers);

    const currentUser = storageService.get(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser && currentUser.id === id) {
      storageService.set(STORAGE_KEYS.CURRENT_USER, {
        id: target.id,
        name,
        email: target.email,
        role,
      });
    }

    return {
      id: target.id,
      name,
      email: target.email,
      role,
      phone,
      status: target.status,
    };
  },

  toggleUserStatus: (id, currentUserId) => {
    if (id === currentUserId) {
      throw new Error("Không thể khóa chính tài khoản đang đăng nhập!");
    }

    const users = getUsers();
    const target = users.find((u) => u.id === id);

    if (!target) {
      throw new Error("Không tìm thấy người dùng!");
    }

    const newStatus = target.status === "active" ? "locked" : "active";
    const updatedUsers = users.map((u) =>
      u.id === id ? { ...u, status: newStatus } : u,
    );

    storageService.set(STORAGE_KEYS.USERS, updatedUsers);

    return newStatus;
  },
};
