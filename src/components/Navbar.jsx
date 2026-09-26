import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'About', to: '/' },
  { label: 'Contracts', to: '/contracts' },
  { label: 'Wishlist & Gifting', to: '/wishlist' },
  { label: 'Wall of Shame', to: '/wall-of-shame' },
  { label: 'Free Tasks', to: '/free-tasks' },
  { label: 'Redemption Store', to: '/store' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleAuthAction = async () => {
    if (user) {
      await logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <div className="navbar__logo-icon">
            <div className="navbar__logo-diamond" />
            <span className="navbar__logo-text">Goddess</span>
          </div>
          <span className="navbar__logo-subtitle">Angel&apos;s Domain</span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar__links">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `navbar__link ${isActive ? 'navbar__link--active' : ''}`
              }
              id={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Actions */}
        <div className="navbar__actions">
          <button className="navbar__cta" id="nav-vip-btn" onClick={handleAuthAction}>
            {user ? 'Log Out' : 'Authenticate'}
          </button>
          {user ? (
            <Link to="/profile" className="navbar__avatar" id="nav-avatar" title="View Profile">
              <span style={{ fontSize: '1rem' }}>👤</span>
            </Link>
          ) : (
            <div className="navbar__avatar" id="nav-avatar">
              <span style={{ fontSize: '1rem' }}>👑</span>
            </div>
          )}

          {/* Mobile Toggle */}
          <button
            className={`navbar__toggle ${mobileOpen ? 'active' : ''}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            id="nav-toggle"
          >
            <span className="navbar__toggle-bar" />
            <span className="navbar__toggle-bar" />
            <span className="navbar__toggle-bar" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`navbar__mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.label}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`
            }
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        <button className="navbar__cta" style={{ marginTop: '1rem' }} onClick={handleAuthAction}>
          {user ? 'Log Out' : 'Authenticate'}
        </button>
      </div>
    </>
  );
}
