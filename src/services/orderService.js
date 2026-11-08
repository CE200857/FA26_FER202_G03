import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001',
  timeout: 10000,
});

export const orderService = {
  async getOrdersByUser(userId) {
    if (userId == null || String(userId).trim() === '') {
      return [];
    }

    const response = await api.get('/orders', {
      params: {
        userId: String(userId),
      },
    });

    const orders = response.data;

    if (!Array.isArray(orders)) {
      throw new Error('Dữ liệu đơn hàng không hợp lệ.');
    }

    return [...orders].sort((a, b) => {
      const timeA = Date.parse(a.createdAt) || 0;
      const timeB = Date.parse(b.createdAt) || 0;

      return timeB - timeA;
    });
  },
};