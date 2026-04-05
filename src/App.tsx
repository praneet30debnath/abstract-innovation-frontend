import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Badge, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import './App.css';
import Home from './components/Home';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import ContactUs from './components/ContactUs';
import Cart from './components/Cart';
import OrderSuccess from './components/OrderSuccess';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './components/admin/AdminDashboardPage';
import AdminOrdersPage from './components/admin/AdminOrdersPage';
import AdminInventoryPage from './components/admin/AdminInventoryPage';
import LoginPage from './components/auth/LoginPage';
import AuthSuccess from './components/auth/AuthSuccess';
import UserMenu from './components/auth/UserMenu';
import BottomNav from './components/BottomNav';
import { CartProvider, useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import { ORDERS_ENABLED } from './utils/featureFlags';

function CartIcon() {
  const { totalCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || !ORDERS_ENABLED) return null;

  return (
    <IconButton onClick={() => navigate('/cart')} size="small" sx={{ color: 'inherit' }}>
      <Badge badgeContent={totalCount || null} color="error">
        <ShoppingCartIcon />
      </Badge>
    </IconButton>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          {/* Admin routes — own layout, no site header/footer */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="inventory" element={<AdminInventoryPage />} />
          </Route>

          {/* Customer-facing routes */}
          <Route path="*" element={
            <div className="App">
              <header className="App-header">
                <div className="logo-container">
                  <img src="/logo.png" alt="Abstract Innovation Logo" className="logo" />
                  <p className="tagline">Turn Moments into Memories</p>
                </div>
                <nav className="nav-menu">
                  <Link to="/">Home</Link>
                  <Link to="/products">Products</Link>
                  <Link to="/contact">Contact Us</Link>
                  <CartIcon />
                  <UserMenu />
                </nav>
              </header>
              <BottomNav />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:productName" element={<ProductDetail />} />
                  <Route path="/contact" element={<ContactUs />} />
                  {ORDERS_ENABLED && <Route path="/cart" element={<Cart />} />}
                  {ORDERS_ENABLED && <Route path="/order-success" element={<OrderSuccess />} />}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/auth/success" element={<AuthSuccess />} />
                </Routes>
              </main>
              <footer className="footer">
                <p>&copy; 2026 Abstract Innovation. All rights reserved.</p>
                <div className="contact-info">
                  <a href="tel:+913346039929">+91 33 4603 9929</a> | <a href="tel:+919830064192">+91 98300 64192</a>
                </div>
              </footer>
            </div>
          } />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;
