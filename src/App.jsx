import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import { initializeMockDatabase } from './data/mockData';
import AppRouter from './routes/AppRouter';
import './App.css';

function App() {
  useEffect(() => {
    initializeMockDatabase();
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <CartProvider>
            <AppRouter />
          </CartProvider>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;