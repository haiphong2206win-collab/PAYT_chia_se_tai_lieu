import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Heart } from 'lucide-react';
import './Footer.css';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="payt-footer">
      <div className="container payt-footer-container">
        <div className="payt-footer-top">
          {/* Brand Info */}
          <div className="payt-footer-brand">
            <Link to="/" className="payt-footer-logo">
              <div className="payt-logo-icon sm">
                <Sun size={18} className="payt-sun-icon" />
              </div>
              <span className="logo-main">Pay<span className="logo-accent">T</span></span>
            </Link>
            <p className="payt-footer-desc">
              Discover knowledge every day. PayT is an academic document sharing platform empowering students to learn and excel together.
            </p>
          </div>

          {/* Quick Links */}
          <div className="payt-footer-nav">
            <div className="footer-col">
              <h4 className="footer-col-title">Platform</h4>
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/documents" className="footer-link">Browse Documents</Link>
              <Link to="/upload" className="footer-link">Upload Material</Link>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Company</h4>
              <a href="#about" className="footer-link" onClick={(e) => e.preventDefault()}>About Us</a>
              <a href="#contact" className="footer-link" onClick={(e) => e.preventDefault()}>Contact</a>
              <a href="#careers" className="footer-link" onClick={(e) => e.preventDefault()}>Careers</a>
            </div>

            <div className="footer-col">
              <h4 className="footer-col-title">Legal</h4>
              <a href="#privacy" className="footer-link" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              <a href="#terms" className="footer-link" onClick={(e) => e.preventDefault()}>Terms of Service</a>
              <a href="#copyright" className="footer-link" onClick={(e) => e.preventDefault()}>Copyright Notice</a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="payt-footer-bottom">
          <p>© {currentYear} PayT – Study Document Sharing Platform. All rights reserved.</p>
          <p className="footer-built">
            Built with <Heart size={14} className="heart-icon" /> for students everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
