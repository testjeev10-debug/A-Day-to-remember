import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const dashboardPath = user?.role === 'companion' ? '/dashboard/companion' : '/dashboard/client';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">💛</span>
            <span className="font-bold text-xl text-rose-600">A Day to Remember</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/companions" className="text-gray-600 hover:text-rose-600 font-medium transition-colors">
              Find Companions
            </Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="text-gray-600 hover:text-rose-600 font-medium transition-colors">
                  Dashboard
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Hi, {user.name.split(' ')[0]}!</span>
                  <button onClick={handleLogout} className="btn-outline text-sm py-1.5 px-3">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-rose-600 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5 px-4">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 flex flex-col gap-3 pb-4">
            <Link to="/companions" className="text-gray-600 hover:text-rose-600 font-medium px-2" onClick={() => setMenuOpen(false)}>
              Find Companions
            </Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="text-gray-600 hover:text-rose-600 font-medium px-2" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-outline text-sm self-start ml-2">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-rose-600 font-medium px-2" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm self-start ml-2" onClick={() => setMenuOpen(false)}>
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
