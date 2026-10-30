import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { initializeMockDatabase } from './data/mockData';
import AppRouter from './routes/AppRouter';
import './App.css';

function App() {
  useEffect(() => {
    initializeMockDatabase();
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <CartProvider>
          <AppRouter />
        </CartProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;