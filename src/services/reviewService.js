// src/services/reviewService.js
const BASE_URL = "http://localhost:5001";

export const reviewService = {
  // 1. Lấy tất cả đánh giá của sản phẩm theo productId
  getReviewsByProductId: async (productId) => {
    try {
      const res = await fetch(`${BASE_URL}/reviews`);
      if (!res.ok) return [];
      const allReviews = await res.json();
      return allReviews.filter(
        (r) => String(r.productId).trim() === String(productId).trim()
      );
    } catch (error) {
      console.error("Lỗi lấy danh sách đánh giá:", error);
      return [];
    }
  },

  // 2. Tính tổng điểm trung bình
  getReviewSummary: async (productId) => {
    const reviews = await reviewService.getReviewsByProductId(productId);
    if (!reviews || reviews.length === 0) {
      return { average: 0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    const average = Number((sum / total).toFixed(1));

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (breakdown[r.rating] !== undefined) breakdown[r.rating]++;
    });

    return { average, total, breakdown };
  },

  // 3. Kiểm tra xem người dùng đã mua sản phẩm trong đơn hàng chỉ định chưa
  canUserReview: async (userId, productId, orderId) => {
    if (!userId) return false;
    try {
      const res = await fetch(`${BASE_URL}/orders`);
      if (!res.ok) return false;
      const allOrders = await res.json();

      return allOrders.some((order) => {
        const isUserOrder = String(order.userId) === String(userId);
        const isMatchingOrder = orderId ? String(order.id) === String(orderId) : true;
        const isCompleted =
          order.status === 'Completed' ||
          order.status === 'Đã hoàn thành' ||
          order.status === 'completed';

        if (!isUserOrder || !isMatchingOrder || !isCompleted) return false;

        return (
          Array.isArray(order.items) &&
          order.items.some(
            (item) => String(item.productId || item.id || item.product_id) === String(productId)
          )
        );
      });
    } catch (error) {
      console.error("Lỗi kiểm tra lịch sử mua hàng:", error);
      return false;
    }
  },

  // 4. Tạo bài đánh giá mới (Lưu kèm orderId)
  createReview: async ({ productId, orderId, userId, userName, rating, comment }) => {
    const canReview = await reviewService.canUserReview(userId, productId, orderId);
    if (!canReview) {
      throw new Error("Bạn chưa mua sản phẩm này hoặc đơn hàng chưa hoàn thành.");
    }

    const existingReviews = await reviewService.getReviewsByProductId(productId);
    const hasReviewedThisOrder = existingReviews.some(
      (r) =>
        String(r.userId) === String(userId) &&
        (orderId ? String(r.orderId) === String(orderId) : true)
    );

    if (hasReviewedThisOrder) {
      throw new Error("Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi.");
    }

    const newReview = {
      id: `rev_${Date.now()}`,
      productId: String(productId),
      orderId: orderId ? String(orderId) : null,
      userId: String(userId),
      userName: userName || "Khách hàng",
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    const res = await fetch(`${BASE_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReview)
    });

    if (!res.ok) throw new Error("Không thể lưu bài đánh giá.");
    return await res.json();
  },

  // 5. Cập nhật bài đánh giá
  updateReview: async (reviewId, userId, { rating, comment }) => {
    const res = await fetch(`${BASE_URL}/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: Number(rating),
        comment: comment.trim(),
        updatedAt: new Date().toISOString()
      })
    });
    return await res.json();
  },

  // 6. Xóa bài đánh giá
  deleteReview: async (reviewId) => {
    await fetch(`${BASE_URL}/reviews/${reviewId}`, { method: "DELETE" });
    return true;
  },

  // 7. Lấy toàn bộ danh sách cho Admin
  getAllReviewsForAdmin: async () => {
    try {
      const res = await fetch(`${BASE_URL}/reviews`);
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  }
};