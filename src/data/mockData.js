import { STORAGE_KEYS, storageService } from '../services/storageService';

// Module 1: Product (Kim Quang Thái) 
export const initialProducts = [
  {
    id: 'P001',
    name: 'Tinh chất dưỡng trắng Vitamin C Spa',
    category: 'Skincare',
    brand: 'La Roche-Posay',
    price: 450000,
    stock: 25,
    image: 'https://placehold.co/300x300?text=Serum+Vitamin+C',
    description: 'Tinh chất làm sáng da, mờ thâm chuyên dụng cho liệu trình Spa.',
    createdAt: '2026-10-13',
  },
  {
    id: 'P002',
    name: 'Dầu gội phục hồi tóc hư tổn Salon Pro',
    category: 'Haircare',
    brand: 'L’Oréal Professionnel',
    price: 380000,
    stock: 15,
    image: 'https://placehold.co/300x300?text=Salon+Shampoo',
    description: 'Phục hồi tóc khô xơ sau uốn nhuộm tại Salon.',
    createdAt: '2026-10-14',
  },
];

// Module 3: User (Nguyễn Tiến Đạt)
// role: 'Admin' | 'Customer' — status: 'active' | 'locked'
export const initialUsers = [
  {
    id: 'U001',
    name: 'Quản lý Cửa hàng',
    email: 'admin@spasalon.com',
    password: 'password123',
    role: 'Admin',
    phone: '0901234567',
    status: 'active',
  },
  {
    id: 'U002',
    name: 'Khách hàng Thân thiết',
    email: 'customer@spasalon.com',
    password: 'password123',
    role: 'Customer',
    phone: '0987654321',
    status: 'active',
  },
  {
    id: 'U003',
    name: 'Tài khoản bị khóa',
    email: 'locked@gmail.com',
    password: 'password123',
    role: 'Customer',
    phone: '0912345678',
    status: 'locked',
  },
];

//  Module 2: Orders (Trần Thành Đạt) 
export const initialOrders = [
  {
    id: 'ORD-1001',
    userId: 'U002',
    items: [{ productId: 'P001', name: 'Tinh chất dưỡng trắng Vitamin C Spa', price: 450000, quantity: 1 }],
    subtotal: 450000,
    discountAmount: 0,
    totalAmount: 450000,
    voucherCode: null,
    status: 'Completed', // Pending | Shipping | Completed | Cancelled
    shippingAddress: 'Ninh Kiều, Cần Thơ',
    createdAt: '2026-10-14T10:00:00.000Z',
  },
];

//  Module 4: Vouchers (Nguyễn Duy Khanh)
export const initialVouchers = [
  {
    id: 'V001',
    code: 'GIAM10',
    discountPercent: 10,
    minOrderValue: 500000,
    expiryDate: '2026-12-31',
    usageLimit: 50,
    usedCount: 0,
    isActive: true,
  },
];

//  Module 5: Reviews (Lê Thiện Quốc Khánh)
export const initialReviews = [
  {
    id: 'R001',
    productId: 'P001',
    userId: 'U002',
    userName: 'Khách hàng Thân thiết',
    rating: 5,
    comment: 'Sản phẩm thẩm thấu nhanh, mùi hương dễ chịu chuẩn spa.',
    isHidden: false,
    createdAt: '2026-10-15',
  },
];

export const initializeMockDatabase = () => {
  storageService.initSeedData({
    [STORAGE_KEYS.PRODUCTS]: initialProducts,
    [STORAGE_KEYS.USERS]: initialUsers,
    [STORAGE_KEYS.ORDERS]: initialOrders,
    [STORAGE_KEYS.VOUCHERS]: initialVouchers,
    [STORAGE_KEYS.REVIEWS]: initialReviews,
  });
};