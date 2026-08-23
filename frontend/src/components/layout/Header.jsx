import { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Sun, Upload, User, LogIn, Menu, X } from 'lucide-react';
import Button from '../common/Button';
import './Header.css';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isProfileActive = location.pathname === '/profile';
  const isAuthActive = location.pathname === '/login' || location.pathname === '/register';

  return (
    <header className="payt-header">
      <div className="container payt-header-container">
        {/* PayT Logo with Sunrise emblem */}
        <Link to="/" className="payt-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="payt-logo-icon">
            <Sun className="payt-sun-icon" size={24} />
          </div>
          <div className="payt-logo-text">
            <span className="logo-main">Pay<span className="logo-accent">T</span></span>
            <span className="logo-tagline">Dawn of Knowledge</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="payt-nav-desktop">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `payt-nav-link ${isActive ? 'active' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/documents"
            className={({ isActive }) => `payt-nav-link ${isActive ? 'active' : ''}`}
          >
            Documents
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) => `payt-nav-link ${isActive ? 'active' : ''}`}
          >
            <Upload size={16} className="nav-icon" />
            <span>Upload</span>
          </NavLink>
        </nav>

        {/* Desktop Action Area */}
        <div className="payt-header-actions">
          <Link to="/profile">
            <Button
              variant={isProfileActive ? 'primary' : 'secondary'}
              size="sm"
              icon={User}
            >
              Profile
            </Button>
          </Link>
          <Link to="/login">
            <Button variant={isAuthActive ? 'primary' : 'ghost'} size="sm" icon={LogIn}>
              Login
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="payt-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="payt-mobile-menu">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `payt-mobile-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/documents"
            className={({ isActive }) => `payt-mobile-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Documents
          </NavLink>
          <NavLink
            to="/upload"
            className={({ isActive }) => `payt-mobile-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Upload Document
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => `payt-mobile-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            My Profile
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => `payt-mobile-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Login / Register
          </NavLink>
        </div>
      )}
    </header>
  );
};

export default Header;
