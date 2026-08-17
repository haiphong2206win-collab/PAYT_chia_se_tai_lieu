import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sun } from 'lucide-react';
import './AuthLayout.css';

export const AuthLayout = ({ children }) => {
  return (
    <div className="payt-auth-page sunrise-glow">
      {/* Sunrise Graphic Background Elements */}
      <div className="sun-backdrop">
        <div className="sun-circle"></div>
        <div className="hill-layer hill-1"></div>
        <div className="hill-layer hill-2"></div>
      </div>

      <div className="payt-auth-container">
        {/* Header Logo */}
        <Link to="/" className="payt-auth-logo">
          <div className="payt-logo-icon">
            <Sun className="payt-sun-icon" size={26} />
          </div>
          <span className="logo-main">Pay<span className="logo-accent">T</span></span>
        </Link>

        {/* Centered Auth Card */}
        <div className="payt-auth-card payt-card">
          {children || <Outlet />}
        </div>

        {/* Footer Back Link */}
        <div className="payt-auth-footer-link">
          <Link to="/">← Back to PayT Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
