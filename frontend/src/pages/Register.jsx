import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ALL_ACTIVITIES } from '../constants/activities';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client',
    bio: '',
    hourly_rate: '',
    city: '',
    activities: [],
    photo_url: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleActivityToggle = (act) => {
    setForm((prev) => ({
      ...prev,
      activities: prev.activities.includes(act)
        ? prev.activities.filter((a) => a !== act)
        : [...prev.activities, act],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.role === 'companion' && form.activities.length === 0) {
      setError('Please select at least one activity.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (form.role === 'companion') {
        payload.bio = form.bio;
        payload.hourly_rate = parseFloat(form.hourly_rate) || 0;
        payload.city = form.city;
        payload.activities = form.activities;
        payload.photo_url = form.photo_url;
      }
      const res = await axios.post('/api/auth/register', payload);
      login(res.data);
      navigate(form.role === 'companion' ? '/dashboard/companion' : '/companions');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">💛</div>
            <h1 className="text-2xl font-bold text-gray-800">Create Your Account</h1>
            <p className="text-gray-500 mt-1">Start making memorable moments</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'client' })}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all text-sm ${
                  form.role === 'client'
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="block text-xl mb-1">🧑</span>
                I'm a Client
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'companion' })}
                className={`py-3 px-4 rounded-xl border-2 font-medium transition-all text-sm ${
                  form.role === 'companion'
                    ? 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <span className="block text-xl mb-1">💛</span>
                I'm a Companion
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} placeholder="At least 6 characters" className="input-field" />
            </div>

            {/* Companion-specific fields */}
            {form.role === 'companion' && (
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-rose-600">Companion Profile</p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="e.g. New York" className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (USD)</label>
                  <input type="number" name="hourly_rate" value={form.hourly_rate} onChange={handleChange} min="1" step="0.5" placeholder="e.g. 30" className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Tell clients a bit about yourself..."
                    className="input-field resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL (optional)</label>
                  <input type="url" name="photo_url" value={form.photo_url} onChange={handleChange} placeholder="https://..." className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Activities You Offer</label>
                  <div className="grid grid-cols-1 gap-2">
                    {ALL_ACTIVITIES.map((act) => (
                      <label key={act} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        form.activities.includes(act) ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={form.activities.includes(act)}
                          onChange={() => handleActivityToggle(act)}
                          className="accent-rose-500"
                        />
                        <span className="text-sm font-medium text-gray-700">{act}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-rose-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
