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
        ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm shadow-gray-200/60'
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-lg shadow-md shadow-violet-300/50 group-hover:shadow-violet-400/60 transition-all duration-300 group-hover:scale-110">
              💛
            </div>
            <span className="font-extrabold text-xl text-gray-900 tracking-tight">
              A Day to <span className="text-gradient">Remember</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/companions"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive('/companions')
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-500 hover:text-violet-700 hover:bg-violet-50'
              }`}
            >
              Find Companions
            </Link>
            <Link
              to="/available-now"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive('/available-now')
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-500 hover:text-violet-700 hover:bg-violet-50'
              }`}
            >
              Available Now ⚡
            </Link>
            <Link
              to="/mood"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive('/mood')
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-500 hover:text-violet-700 hover:bg-violet-50'
              }`}
            >
              Mood Match 💭
            </Link>

            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    location.pathname.startsWith('/dashboard')
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-gray-500 hover:text-violet-700 hover:bg-violet-50'
                  }`}
                >
                  Dashboard
                </Link>
                {user.role === 'client' && (
                  <Link
                    to="/happiness"
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive('/happiness')
                        ? 'bg-violet-50 text-violet-700'
                        : 'text-gray-500 hover:text-violet-700 hover:bg-violet-50'
                    }`}
                  >
                    My Happiness 💛
                  </Link>
                )}
                <div className="flex items-center gap-3 ml-3 pl-3 border-l border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-sm font-bold text-white shadow-sm">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 font-semibold">Hi, {user.name.split(' ')[0]}!</span>
                  <button onClick={handleLogout} className="btn-outline text-xs py-1.5 px-3">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-3">
                <Link to="/login" className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-violet-700 hover:bg-violet-50 transition-all duration-200">
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
            className="md:hidden p-2 rounded-xl text-gray-500 hover:text-violet-700 hover:bg-violet-50 transition-all"
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
          <div className="md:hidden pb-4 border-t border-gray-100 mt-1 pt-3 flex flex-col gap-1">
            <Link
              to="/companions"
              className="px-4 py-2.5 rounded-xl text-gray-600 hover:text-violet-700 hover:bg-violet-50 font-semibold transition-all"
              onClick={() => setMenuOpen(false)}
            >
              Find Companions
            </Link>
            <Link
              to="/available-now"
              className="px-4 py-2.5 rounded-xl text-gray-600 hover:text-violet-700 hover:bg-violet-50 font-semibold transition-all"
              onClick={() => setMenuOpen(false)}
            >
              Available Now ⚡
            </Link>
            <Link
              to="/mood"
              className="px-4 py-2.5 rounded-xl text-gray-600 hover:text-violet-700 hover:bg-violet-50 font-semibold transition-all"
              onClick={() => setMenuOpen(false)}
            >
              Mood Match 💭
            </Link>
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="px-4 py-2.5 rounded-xl text-gray-600 hover:text-violet-700 hover:bg-violet-50 font-semibold transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user.role === 'client' && (
                  <Link
                    to="/happiness"
                    className="px-4 py-2.5 rounded-xl text-gray-600 hover:text-violet-700 hover:bg-violet-50 font-semibold transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Happiness 💛
                  </Link>
                )}
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 font-semibold">{user.name.split(' ')[0]}</span>
                </div>
                <button onClick={handleLogout} className="btn-outline text-sm self-start ml-4 mt-1">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2.5 rounded-xl text-gray-600 hover:text-violet-700 hover:bg-violet-50 font-semibold transition-all" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm self-start ml-4 mt-1" onClick={() => setMenuOpen(false)}>
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
