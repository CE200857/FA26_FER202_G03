// src/services/reviewService.js
const BASE_URL = "http://localhost:5001";

export const reviewService = {
  // 1. Lấy danh sách đánh giá đã duyệt theo sản phẩm
  getReviewsByProductId: async (productId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/reviews?productId=${productId}&status=approved&_sort=createdAt&_order=desc`
      );
      if (!res.ok) return [];
      return await res.json();
    } catch (error) {
      console.error("Lỗi lấy danh sách đánh giá:", error);
      return [];
    }
  },

  // 2. Tính tổng quan điểm trung bình và phân bố sao
  getReviewSummary: async (productId) => {
    const reviews = await reviewService.getReviewsByProductId(productId);
    if (!reviews || reviews.length === 0) {
      return { average: 0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
    const average = Number((sum / total).toFixed(1));

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (breakdown[r.rating] !== undefined) breakdown[r.rating]++;
    });

    return { average, total, breakdown };
  },

  // 3. Kiểm tra xem người dùng đã từng mua sản phẩm chưa
  canUserReview: async (userId, productId) => {
    try {
      const res = await fetch(`${BASE_URL}/orders?userId=${userId}&status=Completed`);
      if (!res.ok) return false;
      const orders = await res.json();
      return orders.some((order) =>
        order.items?.some((item) => item.productId === productId)
      );
    } catch {
      return false;
    }
  },

  // 4. Tạo bài đánh giá mới (mặc định status: "pending")
  createReview: async ({ productId, userId, userName, rating, comment }) => {
    const checkRes = await fetch(
      `${BASE_URL}/reviews?productId=${productId}&userId=${userId}`
    );
    const existing = await checkRes.json();
    if (existing.length > 0) {
      throw new Error("Bạn đã đánh giá sản phẩm này rồi.");
    }

    const newReview = {
      id: `rev_${Date.now()}`,
      productId,
      userId,
      userName,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    const res = await fetch(`${BASE_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview),
    });
    return await res.json();
  },

  // 5. Cập nhật bài đánh giá
  updateReview: async (reviewId, userId, { rating, comment }) => {
    const checkRes = await fetch(`${BASE_URL}/reviews/${reviewId}`);
    if (!checkRes.ok) throw new Error("Đánh giá không tồn tại.");
    const review = await checkRes.json();

    if (review.userId !== userId) {
      throw new Error("Bạn không có quyền sửa đánh giá này.");
    }

    const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: Number(rating),
        comment: comment.trim(),
        status: "pending",
        updatedAt: new Date().toISOString(),
      }),
    });
    return await res.json();
  },

  // 6. Xóa bài đánh giá
  deleteReview: async (reviewId, userId, isAdmin = false) => {
    const checkRes = await fetch(`${BASE_URL}/reviews/${reviewId}`);
    if (!checkRes.ok) throw new Error("Đánh giá không tồn tại.");
    const review = await checkRes.json();

    if (!isAdmin && review.userId !== userId) {
      throw new Error("Bạn không có quyền xóa đánh giá này.");
    }

    await fetch(`${BASE_URL}/reviews/${reviewId}`, { method: "DELETE" });
    return true;
  },

  // 7. Lấy toàn bộ danh sách đánh giá cho Admin
  getAllReviewsForAdmin: async () => {
    try {
      const res = await fetch(`${BASE_URL}/reviews?_sort=createdAt&_order=desc`);
      if (!res.ok) return [];
      return await res.json();
    } catch (error) {
      console.error("Lỗi lấy danh sách đánh giá Admin:", error);
      return [];
    }
  },

  // 8. Admin duyệt hoặc ẩn bài đánh giá
  moderateReview: async (reviewId, status) => {
    const checkRes = await fetch(`${BASE_URL}/reviews/${reviewId}`);
    if (!checkRes.ok) throw new Error("Đánh giá không tồn tại.");

    const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  },
};