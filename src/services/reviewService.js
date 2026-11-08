// src/services/reviewService.js
import { request } from "./api";

const findReview = async (reviewId) => {
  try {
    return await request(`/reviews/${reviewId}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
};

export const reviewService = {
  getReviewsByProductId: async (productId) => {
    return request(
      `/reviews?productId=${productId}&status=approved&_sort=createdAt&_order=desc`
    );
  },

  getReviewSummary: async (productId) => {
    const reviews = await reviewService.getReviewsByProductId(productId);
    if (reviews.length === 0) {
      return { average: 0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const average = Number((sum / total).toFixed(1));

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (breakdown[r.rating] !== undefined) breakdown[r.rating]++;
    });

    return { average, total, breakdown };
  },

  canUserReview: async (userId, productId) => {
    const orders = await request(`/orders?userId=${userId}&status=Completed`);
    return orders.some((order) =>
      order.items.some((item) => item.productId === productId)
    );
  },

  createReview: async ({ productId, userId, userName, rating, comment }) => {
    const existing = await request(
      `/reviews?productId=${productId}&userId=${userId}`
    );
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

    return request("/reviews", {
      method: "POST",
      body: JSON.stringify(newReview),
    });
  },

  updateReview: async (reviewId, userId, { rating, comment }) => {
    const review = await findReview(reviewId);

    if (!review) throw new Error("Đánh giá không tồn tại.");
    if (review.userId !== userId) {
      throw new Error("Bạn không có quyền sửa đánh giá này.");
    }

    return request(`/reviews/${reviewId}`, {
      method: "PATCH",
      body: JSON.stringify({
        rating: Number(rating),
        comment: comment.trim(),
        status: "pending",
        updatedAt: new Date().toISOString(),
      }),
    });
  },

  deleteReview: async (reviewId, userId, isAdmin = false) => {
    const review = await findReview(reviewId);

    if (!review) throw new Error("Đánh giá không tồn tại.");
    if (!isAdmin && review.userId !== userId) {
      throw new Error("Bạn không có quyền xóa đánh giá này.");
    }

    await request(`/reviews/${reviewId}`, { method: "DELETE" });
    return true;
  },

  getAllReviewsForAdmin: async () => {
    return request("/reviews?_sort=createdAt&_order=desc");
  },

  moderateReview: async (reviewId, status) => {
    const review = await findReview(reviewId);

    if (!review) throw new Error("Đánh giá không tồn tại.");

    return request(`/reviews/${reviewId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};