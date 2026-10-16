import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { initializeMockDatabase } from './data/mockData';
import AppRouter from './routes/AppRouter';
import './App.css';

function App() {
  useEffect(() => {
    initializeMockDatabase();
  }, []);

  return (
    <BrowserRouter>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;