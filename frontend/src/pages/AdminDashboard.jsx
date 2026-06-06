import React, { useEffect, useState } from 'react';
import axios from 'axios';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
};

const TABS = [
  { key: 'reports', label: '🚨 Reports' },
  { key: 'moods', label: '💭 Mood Analytics' },
  { key: 'happiness', label: '💛 Happiness Analytics' },
  { key: 'available', label: '⚡ Available Companions' },
];

function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/admin/reports')
      .then((r) => setReports(r.data || []))
      .catch(() => setError('Could not load reports.'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await axios.patch(`/api/admin/reports/${id}`, { status });
      setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } catch {
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="text-center py-10 text-gray-500">{error}</div>;
  if (reports.length === 0) return <div className="text-center py-10 text-gray-400">No reports found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-left">
            <th className="px-4 py-3 font-semibold rounded-l-xl">Reporter</th>
            <th className="px-4 py-3 font-semibold">Reported User</th>
            <th className="px-4 py-3 font-semibold">Reason</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold rounded-r-xl">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {reports.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{r.reporter_name || r.reporter_id}</td>
              <td className="px-4 py-3 text-gray-600">{r.reported_name || r.reported_id}</td>
              <td className="px-4 py-3 text-gray-600">{r.reason}</td>
              <td className="px-4 py-3">
                <span className={`badge text-xs ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}>
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-400">
                {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
              </td>
              <td className="px-4 py-3">
                <select
                  value={r.status}
                  disabled={updatingId === r.id}
                  onChange={(e) => handleStatusChange(r.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-violet-400 disabled:opacity-50"
                >
                  <option value="pending">pending</option>
                  <option value="reviewed">reviewed</option>
                  <option value="resolved">resolved</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MoodAnalyticsTab() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/admin/analytics/moods')
      .then((r) => setData(r.data || []))
      .catch(() => setError('Could not load mood analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="text-center py-10 text-gray-500">{error}</div>;
  if (data.length === 0) return <div className="text-center py-10 text-gray-400">No mood data yet.</div>;

  const maxCount = Math.max(...data.map((d) => d.count || 0), 1);

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg text-gray-800">Mood Frequency</h2>
      {data.map((item) => (
        <div key={item.mood} className="flex items-center gap-4">
          <div className="w-28 text-sm text-gray-600 font-medium flex-shrink-0 capitalize">{item.mood}</div>
          <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
            <div
              className="h-5 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${Math.max(((item.count || 0) / maxCount) * 100, 4)}%` }}
            >
            </div>
          </div>
          <div className="w-12 text-sm font-bold text-gray-700 text-right flex-shrink-0">
            {item.count}
          </div>
        </div>
      ))}
    </div>
  );
}

function HappinessAnalyticsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/admin/analytics/happiness')
      .then((r) => setData(r.data))
      .catch(() => setError('Could not load happiness analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="text-center py-10 text-gray-500">{error}</div>;
  if (!data) return <div className="text-center py-10 text-gray-400">No happiness data yet.</div>;

  const overall = data.overall || {};
  const byActivity = data.by_activity || [];

  return (
    <div className="space-y-6">
      {/* Overall stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <div className="text-3xl font-extrabold text-violet-600">{overall.avg_score ? Number(overall.avg_score).toFixed(1) : '—'}</div>
          <div className="text-sm text-gray-500 mt-1">Overall Avg Score</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-extrabold text-pink-600">{overall.total_ratings ?? 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total Ratings</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-extrabold text-green-600">
            {overall.would_meet_again_pct != null ? `${overall.would_meet_again_pct}%` : '—'}
          </div>
          <div className="text-sm text-gray-500 mt-1">Would Meet Again</div>
        </div>
      </div>

      {/* By activity */}
      {byActivity.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-800 mb-3">Avg Score by Activity</h3>
          <div className="space-y-3">
            {byActivity.map((item) => (
              <div key={item.activity} className="flex items-center gap-4">
                <div className="w-36 text-sm text-gray-600 font-medium flex-shrink-0 truncate" title={item.activity}>
                  {item.activity}
                </div>
                <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500"
                    style={{ width: `${((item.avg_score || 0) / 10) * 100}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm font-bold text-gray-700 text-right flex-shrink-0">
                  {item.avg_score ? Number(item.avg_score).toFixed(1) : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AvailableCompanionsTab() {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/admin/companions/available')
      .then((r) => setCompanions(r.data || []))
      .catch(() => setError('Could not load companion data.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="text-center py-10 text-gray-500">{error}</div>;
  if (companions.length === 0) return <div className="text-center py-10 text-gray-400">No companion data found.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-left">
            <th className="px-4 py-3 font-semibold rounded-l-xl">Name</th>
            <th className="px-4 py-3 font-semibold">City</th>
            <th className="px-4 py-3 font-semibold">Rate</th>
            <th className="px-4 py-3 font-semibold">Rating</th>
            <th className="px-4 py-3 font-semibold rounded-r-xl">Availability</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {companions.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{c.name || c.user_name}</td>
              <td className="px-4 py-3 text-gray-600">{c.city || '—'}</td>
              <td className="px-4 py-3 text-gray-600">{c.hourly_rate ? `$${c.hourly_rate}/hr` : '—'}</td>
              <td className="px-4 py-3">
                {c.avg_rating ? (
                  <span className="flex items-center gap-1">
                    <span className="text-amber-400">★</span>
                    <span className="font-medium">{Number(c.avg_rating).toFixed(1)}</span>
                  </span>
                ) : '—'}
              </td>
              <td className="px-4 py-3">
                <span className={`badge text-xs ${c.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.is_available ? '⚡ Available' : 'Offline'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('reports');

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform oversight and analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="card p-6">
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'moods' && <MoodAnalyticsTab />}
        {activeTab === 'happiness' && <HappinessAnalyticsTab />}
        {activeTab === 'available' && <AvailableCompanionsTab />}
      </div>
    </div>
  );
}
