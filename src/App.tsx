import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import ContactUs from './components/ContactUs';
import LoginPage from './components/auth/LoginPage';
import AuthSuccess from './components/auth/AuthSuccess';
import UserMenu from './components/auth/UserMenu';
import BottomNav from './components/BottomNav';

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
