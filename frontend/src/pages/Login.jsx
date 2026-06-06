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

const FLOATING_EMOJIS = ['💛', '🌟', '🤝', '🎯', '✨', '💫', '🎨', '🌸'];

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
    <div className="min-h-screen flex">

      {/* Left panel — gradient */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 p-12 relative overflow-hidden">
        {/* Blob decorations */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-0 w-64 h-64 bg-pink-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -translate-y-1/2 -right-10 w-40 h-40 bg-violet-300/20 rounded-full blur-2xl" />

        {/* Floating emojis */}
        {FLOATING_EMOJIS.map((e, i) => (
          <div
            key={i}
            className="absolute text-3xl select-none pointer-events-none opacity-30 animate-float"
            style={{
              left: `${10 + (i * 11) % 75}%`,
              top: `${8 + (i * 13) % 80}%`,
              animationDelay: `${(i * 0.7) % 5}s`,
              animationDuration: `${5 + (i % 3)}s`,
            }}
          >
            {e}
          </div>
        ))}

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shadow-lg">
              💛
            </div>
            <span className="font-extrabold text-xl text-white">A Day to Remember</span>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Every day can be<br />
            <span className="text-yellow-300">unforgettable.</span>
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            Connect with caring companions for any activity — from morning walks to concert nights.
          </p>

          {/* Mini testimonial */}
          <div className="mt-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="User"
                className="w-10 h-10 rounded-full border-2 border-white/50"
              />
              <div>
                <p className="text-white font-bold text-sm">Priya K.</p>
                <p className="text-white/60 text-xs">Hiking companion</p>
              </div>
              <div className="ml-auto text-yellow-300 text-sm">★★★★★</div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              "Found the perfect hiking buddy in 5 minutes. Best experience ever!"
            </p>
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex gap-6">
          {[['340+', 'Companions'], ['4.9★', 'Rating'], ['2400+', 'Clients']].map(([val, lbl]) => (
            <div key={lbl}>
              <div className="text-2xl font-black text-white">{val}</div>
              <div className="text-white/60 text-xs font-medium">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-lg shadow-md shadow-violet-200">
              💛
            </div>
            <span className="font-extrabold text-xl text-gray-900">A Day to Remember</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-extrabold text-gray-900">Welcome Back!</h1>
              <p className="text-gray-400 mt-2 text-sm">Sign in to continue your journey ✨</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Email</label>
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  required placeholder="you@example.com" className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-black tracking-widest text-gray-400 uppercase mb-2">Password</label>
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

            <p className="text-center text-gray-400 text-sm mt-6">
              Don't have an account?{' '}
              <Link to="/register" className="text-violet-600 hover:text-violet-700 font-semibold transition-colors">
                Sign up free
              </Link>
            </p>

            {/* Demo accounts */}
            <div className="mt-7 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-400 text-center mb-3 font-semibold tracking-wide uppercase">Try a demo account</p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => setForm({ email: acc.email, password: 'password123' })}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-violet-50 border border-gray-200 hover:border-violet-300 rounded-xl p-3 text-left transition-all duration-200 group"
                  >
                    <span className="text-xl">{acc.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-700 group-hover:text-violet-700 transition-colors">{acc.label}</p>
                      <p className="text-xs text-gray-400 truncate">{acc.email.split('@')[0]}</p>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">All use password: <code className="text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">password123</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
