// Khởi tạo Mock Data nếu chưa có trong localStorage
const INITIAL_REVIEWS = [
  {
    id: "rev_1",
    productId: "prod_1",
    userId: "user_101",
    userName: "Nguyễn Văn A",
    rating: 5,
    comment: "Sản phẩm chất lượng tuyệt vời, giao hàng nhanh!",
    createdAt: "2026-10-15T10:30:00Z",
    status: "approved" // 'pending', 'approved', 'rejected'
  },
  {
    id: "rev_2",
    productId: "prod_1",
    userId: "user_102",
    userName: "Trần Thị B",
    rating: 4,
    comment: "Đóng gói cẩn thận, dùng ổn trong tầm giá.",
    createdAt: "2026-10-18T14:20:00Z",
    status: "approved"
  }
];

const STORAGE_KEY = "app_reviews";

const getStoredReviews = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_REVIEWS;
  }
  return JSON.parse(data);
};

const saveReviews = (reviews) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
};

export const reviewService = {
  // R: Lấy danh sách đánh giá đã duyệt theo productId
  getReviewsByProductId: async (productId) => {
    const reviews = getStoredReviews();
    return reviews.filter(
      (r) => r.productId === productId && r.status === "approved"
    );
  },

  // Tính điểm đánh giá trung bình & thống kê
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

  // Kiểm tra điều kiện mua hàng trước khi cho phép đánh giá
  canUserReview: async (userId, productId) => {
    // Kiểm tra trong mock orders (giả định lấy từ localStorage 'app_orders')
    const orders = JSON.parse(localStorage.getItem("app_orders") || "[]");
    const hasPurchased = orders.some(
      (order) =>
        order.userId === userId &&
        order.status === "completed" &&
        order.items.some((item) => item.productId === productId)
    );
    return hasPurchased;
  },

  // C: Thêm đánh giá mới
  createReview: async ({ productId, userId, userName, rating, comment }) => {
    const reviews = getStoredReviews();
    
    // Kiểm tra xem đã đánh giá chưa (mỗi user 1 đánh giá / sản phẩm)
    const existing = reviews.find(
      (r) => r.productId === productId && r.userId === userId
    );
    if (existing) {
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
      status: "pending" // Cần Admin duyệt hoặc chuyển 'approved' nếu không cần duyệt
    };

    reviews.unshift(newReview);
    saveReviews(reviews);
    return newReview;
  },

  // U: Chỉnh sửa đánh giá (chỉ người tạo mới được sửa)
  updateReview: async (reviewId, userId, { rating, comment }) => {
    const reviews = getStoredReviews();
    const index = reviews.findIndex((r) => r.id === reviewId);

    if (index === -1) throw new Error("Đánh giá không tồn tại.");
    if (reviews[index].userId !== userId) {
      throw new Error("Bạn không có quyền sửa đánh giá này.");
    }

    reviews[index] = {
      ...reviews[index],
      rating: Number(rating),
      comment: comment.trim(),
      status: "pending", // Cần kiểm duyệt lại sau khi sửa
      updatedAt: new Date().toISOString()
    };

    saveReviews(reviews);
    return reviews[index];
  },

  // D: Xóa đánh giá (User xóa bài mình hoặc Admin xóa)
  deleteReview: async (reviewId, userId, isAdmin = false) => {
    let reviews = getStoredReviews();
    const review = reviews.find((r) => r.id === reviewId);

    if (!review) throw new Error("Đánh giá không tồn tại.");
    if (!isAdmin && review.userId !== userId) {
      throw new Error("Bạn không có quyền xóa đánh giá này.");
    }

    reviews = reviews.filter((r) => r.id !== reviewId);
    saveReviews(reviews);
    return true;
  },

  // ADMIN: Lấy tất cả đánh giá để kiểm duyệt
  getAllReviewsForAdmin: async () => {
    return getStoredReviews();
  },

  // ADMIN: Thay đổi trạng thái kiểm duyệt ('approved' | 'rejected')
  moderateReview: async (reviewId, status) => {
    const reviews = getStoredReviews();
    const index = reviews.findIndex((r) => r.id === reviewId);

    if (index === -1) throw new Error("Đánh giá không tồn tại.");
    reviews[index].status = status;

    saveReviews(reviews);
    return reviews[index];
  }
};