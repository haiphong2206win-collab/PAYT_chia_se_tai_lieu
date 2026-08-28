import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Upload, User, LogIn, LogOut, Menu, X } from 'lucide-react';
import Button from '../common/Button';
import { logoutApi } from '../../services/auth.api';
import { getUserProfileApi, clearUserProfileCache } from '../../services/user.api';
import './Header.css';

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const isProfileActive = location.pathname === '/profile';
  const isAuthActive = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    let isMounted = true;
    const checkAuthStatus = async () => {
      try {
        await getUserProfileApi();
        if (isMounted) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        if (isMounted) {
          setIsLoggedIn(false);
        }
      }
    };

    checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearUserProfileCache();
      sessionStorage.removeItem('userRole');
      setIsLoggedIn(false);
      setMobileMenuOpen(false);
      navigate('/login');
    }
  };

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
          {isLoggedIn ? (
            <>
              <Link to="/profile">
                <Button
                  variant={isProfileActive ? 'primary' : 'secondary'}
                  size="sm"
                  icon={User}
                >
                  Profile
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant={isAuthActive ? 'primary' : 'ghost'} size="sm" icon={LogIn}>
                Login
              </Button>
            </Link>
          )}
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
          {isLoggedIn ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) => `payt-mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                My Profile
              </NavLink>
              <button
                className="payt-mobile-link"
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  width: '100%',
                  cursor: 'pointer',
                  font: 'inherit',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => `payt-mobile-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Login / Register
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
