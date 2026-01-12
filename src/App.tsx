import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Services from './components/Services';
import ContactUs from './components/ContactUs';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <div className="logo-container">
            <img src="/logo.png" alt="Abstract Innovation Logo" className="logo" />
          </div>
          <nav className="nav-menu">
            <Link to="/">Home</Link>
            <Link to="/services">Services</Link>
            <Link to="/contact">Contact Us</Link>
          </nav>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<ContactUs />} />
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
