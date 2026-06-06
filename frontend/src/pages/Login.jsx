import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DEMO_ACCOUNTS = [
  { label: 'Demo Client', email: 'demo@example.com', emoji: '👤' },
  { label: 'Sofia', email: 'sofia@example.com', emoji: '🛍️' },
  { label: 'James', email: 'james@example.com', emoji: '🎮' },
  { label: 'Aisha', email: 'aisha@example.com', emoji: '💙' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', form);
      login(res.data);
      navigate(res.data.user.role === 'companion' ? '/dashboard/companion' : '/dashboard/client');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="glass rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg shadow-violet-500/30">
              💛
            </div>
            <h1 className="text-2xl font-extrabold text-white">Welcome Back</h1>
            <p className="text-gray-500 mt-1 text-sm">Sign in to continue your journey</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 mb-6 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black tracking-widest text-gray-500 uppercase mb-2">Email</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                required placeholder="you@example.com" className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-black tracking-widest text-gray-500 uppercase mb-2">Password</label>
              <input
                type="password" name="password" value={form.password} onChange={handleChange}
                required placeholder="••••••••" className="input-field"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </button>
          </form>

          <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
              Sign up free
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-7 pt-6 border-t border-white/5">
            <p className="text-xs text-gray-600 text-center mb-3 font-semibold tracking-wide uppercase">Try a demo account</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => setForm({ email: acc.email, password: 'password123' })}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-3 text-left transition-all duration-200 group"
                >
                  <span className="text-xl">{acc.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{acc.label}</p>
                    <p className="text-xs text-gray-600 truncate">{acc.email.split('@')[0]}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-700 text-center mt-2">All use password: <code className="text-gray-500">password123</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
