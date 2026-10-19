import { Link } from 'react-router-dom';

export const Footer = () => {
    return (
        <footer
            style={{
                backgroundColor: '#2b2d42',
                color: '#edf2f4',
                marginTop: 'auto',
                paddingTop: '36px',
            }}
        >
            <div
                style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 24px 28px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '24px',
                }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ color: '#ef8354', fontSize: '16px', marginBottom: '6px' }}>
                        ✨ LUMIÈRE SPA & SALON
                    </h4>
                    <p style={{ fontSize: '14px', color: '#adb5bd', lineHeight: '1.6', margin: 0 }}>
                        Hệ thống bán lẻ mỹ phẩm và các sản phẩm chăm sóc sắc đẹp chuyên sâu chuẩn Spa/Salon chính hãng.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ color: '#ef8354', fontSize: '16px', marginBottom: '6px' }}>
                        Danh mục
                    </h4>
                    <ul
                        style={{
                            listStyle: 'none',
                            padding: 0,
                            margin: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                        }}
                    >
                        <li>
                            <Link to="/products" style={{ color: '#adb5bd', textDecoration: 'none', fontSize: '14px' }}>
                                Sản phẩm chăm sóc da
                            </Link>
                        </li>
                        <li>
                            <Link to="/products" style={{ color: '#adb5bd', textDecoration: 'none', fontSize: '14px' }}>
                                Dưỡng tóc Salon chuyên nghiệp
                            </Link>
                        </li>
                        <li>
                            <Link to="/my-vouchers" style={{ color: '#adb5bd', textDecoration: 'none', fontSize: '14px' }}>
                                Khuyến mãi & Voucher
                            </Link>
                        </li>
                        <li>
                            <Link to="/orders" style={{ color: '#adb5bd', textDecoration: 'none', fontSize: '14px' }}>
                                Tra cứu đơn hàng
                            </Link>
                        </li>
                    </ul>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ color: '#ef8354', fontSize: '16px', marginBottom: '6px' }}>
                        Liên hệ & Hỗ trợ
                    </h4>
                    <p style={{ fontSize: '14px', color: '#adb5bd', lineHeight: '1.6', margin: 0 }}>
                        📍 Địa chỉ: Khu Công nghệ cao, TP. Cần Thơ
                    </p>
                    <p style={{ fontSize: '14px', color: '#adb5bd', lineHeight: '1.6', margin: 0 }}>
                        📞 Hotline: 1900 6868 (8:00 - 21:00)
                    </p>
                    <p style={{ fontSize: '14px', color: '#adb5bd', lineHeight: '1.6', margin: 0 }}>
                        ✉️ Email: support@lumierespa.vn
                    </p>
                </div>
            </div>

            <div
                style={{
                    borderTop: '1px solid #3d405b',
                    textAlign: 'center',
                    padding: '16px 24px',
                    fontSize: '13px',
                    color: '#8d99ae',
                }}
            >
                © {new Date().getFullYear()} Lumière Spa & Salon Cosmetics Retail System — Group 3 (FER202). All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;