import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const dashboardPath = user?.role === 'companion' ? '/dashboard/companion' : '/dashboard/client';
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-[#0f0c1a]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-lg shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all duration-300 group-hover:scale-110">
              💛
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">
              A Day to <span className="text-gradient">Remember</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/companions"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive('/companions')
                  ? 'bg-violet-500/20 text-violet-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Find Companions
            </Link>

            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    location.pathname.startsWith('/dashboard')
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Dashboard
                </Link>
                <div className="flex items-center gap-3 ml-3 pl-3 border-l border-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-sm font-bold text-white">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300 font-medium">Hi, {user.name.split(' ')[0]}!</span>
                  <button onClick={handleLogout} className="btn-outline text-xs py-1.5 px-3">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-3">
                <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-5">
                  Get Started ✨
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-white/10 mt-1 pt-3 flex flex-col gap-2">
            <Link to="/companions" className="px-4 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 font-medium transition-all" onClick={() => setMenuOpen(false)}>
              Find Companions
            </Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="px-4 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 font-medium transition-all" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-outline text-sm self-start ml-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 font-medium transition-all" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm self-start ml-2" onClick={() => setMenuOpen(false)}>
                  Get Started ✨
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
