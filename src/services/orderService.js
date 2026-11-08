import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5001', timeout: 10000 });

export const orderService = {
    async getOrdersByUser(userId) {
        if (userId == null || String(userId).trim() === '') {
            return [];
        }
        const response = await api.get('/orders', { params: { userId: String(userId) } });
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

    async createOrder({ userId, recipientName, phone, shippingAddress }) {
        const ownerId = String(userId ?? '').trim();
        const receiver = String(recipientName ?? '').trim();
        const address = String(shippingAddress ?? '').trim();
        const phoneNumber = String(phone ?? '').replace(/[\s.-]/g, '');

        if (!ownerId) {
            throw new Error('Vui lòng đăng nhập để đặt hàng.');
        }
        if (!receiver || !address) {
            throw new Error('Vui lòng nhập tên người nhận và địa chỉ giao hàng.');
        }
        if (!/^(?:0\d{9}|\+84\d{9})$/.test(phoneNumber)) {
            throw new Error('Số điện thoại không hợp lệ.');
        }

        const cartResponse = await api.get('/carts', { params: { userId: ownerId } });
        if (!Array.isArray(cartResponse.data)) {
            throw new Error('Dữ liệu giỏ hàng không hợp lệ.');
        }
        const cart = cartResponse.data[0];
        if (!cart) {
            throw new Error('Giỏ hàng đang trống.');
        }
        if (!Array.isArray(cart.items)) {
            throw new Error('Dữ liệu giỏ hàng không hợp lệ.');
        }
        if (cart.items.length === 0) {
            throw new Error('Giỏ hàng đang trống.');
        }

        const productIds = new Set();
        const items = await Promise.all(cart.items.map(async (item) => {
            const productId = String(item.id ?? '').trim();
            const quantity = Number(item.quantity);
            if (!productId) {
                throw new Error('Sản phẩm trong giỏ không hợp lệ.');
            }
            if (productIds.has(productId)) {
                throw new Error('Giỏ hàng có sản phẩm bị trùng. Vui lòng kiểm tra lại.');
            }
            productIds.add(productId);
            if (!Number.isSafeInteger(quantity) || quantity <= 0) {
                throw new Error('Số lượng sản phẩm phải là số nguyên lớn hơn 0.');
            }

            let product;
            try {
                const response = await api.get(`/products/${encodeURIComponent(productId)}`);
                product = response.data;
            } catch (error) {
                if (error.response?.status === 404) {
                    throw new Error('Một sản phẩm trong giỏ không còn tồn tại. Vui lòng xóa sản phẩm đó khỏi giỏ.');
                }
                throw error;
            }

            if (product.isHidden) {
                throw new Error(`"${product.name}" hiện không còn được bán.`);
            }
            const price = Number(product.price);
            const stock = Number(product.stock);
            if (!Number.isFinite(price) || price <= 0 || !Number.isSafeInteger(stock) || stock < 0) {
                throw new Error(`Giá hoặc tồn kho của "${product.name}" không hợp lệ.`);
            }
            if (quantity > stock) {
                throw new Error(`"${product.name}" chỉ còn ${stock} sản phẩm trong kho.`);
            }
            if (price !== Number(item.price)) {
                throw new Error(`Giá của "${product.name}" đã thay đổi. Vui lòng xóa rồi thêm lại sản phẩm vào giỏ để xác nhận giá mới.`);
            }
            return { productId, name: product.name, price, quantity };
        }));

        const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
        if (!Number.isFinite(subtotal)) {
            throw new Error('Tổng tiền đơn hàng không hợp lệ.');
        }
        const newOrder = {
            userId: ownerId,
            recipientName: receiver,
            phone: phoneNumber,
            shippingAddress: address,
            items,
            subtotal,
            discountAmount: 0,
            totalAmount: subtotal,
            voucherCode: null,
            status: 'Pending',
            createdAt: new Date().toISOString(),
        };
        const response = await api.post('/orders', newOrder);
        return response.data;
    },
};