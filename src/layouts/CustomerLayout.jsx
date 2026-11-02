import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../modules/cart-order/components/CartDrawer';

const CustomerLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();

  return (
    <div className="app-shell customer-layout">
      <Header
        onOpenCart={() => setIsCartOpen((previous) => !previous)}
        cartItemCount={totalItems}
      />

      <main className="site-main container">
        <Outlet context={{ isCartOpen, setIsCartOpen }} />
      </main>

      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default CustomerLayout;