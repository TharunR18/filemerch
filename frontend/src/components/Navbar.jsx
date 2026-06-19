import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Library, User, Store, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.png';
import '../styles/Navbar.css';

import UserAvatar from './UserAvatar';

const Navbar = () => {
  const { user, isAuthenticated, isSeller, login, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="FileMerch Logo" className="navbar-logo-img" />
        </Link>

        <div className={`navbar-links ${mobileOpen ? 'navbar-links--open' : ''}`}>
          <Link to="/marketplace" className="navbar-link" onClick={() => setMobileOpen(false)}>
            Marketplace
          </Link>
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <div className="navbar-user" ref={dropdownRef}>
              <button
                className="navbar-avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <UserAvatar user={user} className="navbar-avatar" size={32} />
                <span className="navbar-username">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={16} className={`navbar-chevron ${dropdownOpen ? 'navbar-chevron--open' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="navbar-dropdown animate-fade-in-down">
                  <div className="navbar-dropdown-header">
                    <p className="navbar-dropdown-name">{user.name}</p>
                    <p className="navbar-dropdown-email">{user.email}</p>
                  </div>
                  <div className="navbar-dropdown-divider" />
                  <Link to="/library" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Library size={16} />
                    My Library
                  </Link>
                  {isSeller ? (
                    <Link to="/dashboard" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                  ) : (
                    <Link to="/seller/setup" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <Store size={16} />
                      Become a Seller
                    </Link>
                  )}
                  {user.username && (
                    <Link to={`/seller/${user.username}`} className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <User size={16} />
                      My Profile
                    </Link>
                  )}
                  <div className="navbar-dropdown-divider" />
                  <button className="navbar-dropdown-item navbar-dropdown-item--danger" onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Login
            </button>
          )}

          <button
            className="navbar-mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger ${mobileOpen ? 'hamburger--open' : ''}`} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
