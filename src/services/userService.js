import { STORAGE_KEYS, storageService } from "./storageService";
import md5 from "md5";

const API_URL = "http://localhost:5001";

const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`);

  if (!response.ok) {
    throw new Error("Không thể tải danh sách tài khoản.");
  }

  return response.json();
};

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
        if (target.password !== md5(oldPassword)) {
          throw new Error("Mật khẩu hiện tại không chính xác!");
        }

        return fetch(`${API_URL}/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: md5(newPassword) }),
        });
      })
      .then(() => true);
  },

  getAllUsers: async () => {
    const users = await getUsers();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      status: user.status,
    }));
  },
  createUser: async ({ name, email, password, phone, role }) => {
    const users = await getUsers();

    const emailExists = users.some(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );

    if (emailExists) {
      throw new Error("Email này đã được sử dụng!");
    }

    const newUser = {
      name,
      email,
      password: md5(password),
      phone,
      role,
      status: "active",
    };

    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      throw new Error("Không thể thêm tài khoản.");
    }

    const createdUser = await response.json();

    return {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      phone: createdUser.phone || "",
      status: createdUser.status,
    };
  },

  updateUser: async (id, { name, phone, role }) => {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, role }),
    });

    if (!response.ok) {
      throw new Error("Không thể cập nhật tài khoản.");
    }

    const updatedUser = await response.json();

    const currentUser = storageService.get(STORAGE_KEYS.CURRENT_USER, null);

    if (currentUser && currentUser.id === id) {
      storageService.set(STORAGE_KEYS.CURRENT_USER, {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    }

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone || "",
      status: updatedUser.status,
    };
  },

  toggleUserStatus: async (id, currentUserId) => {
    if (id === currentUserId) {
      throw new Error("Không thể khóa chính tài khoản đang đăng nhập!");
    }

    const users = await getUsers();
    const user = users.find((item) => item.id === id);

    if (!user) {
      throw new Error("Không tìm thấy người dùng!");
    }

    const newStatus = user.status === "active" ? "locked" : "active";

    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      throw new Error("Không thể thay đổi trạng thái tài khoản.");
    }

    return newStatus;
  },
};
