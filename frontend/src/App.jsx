import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanionList from './pages/CompanionList';
import CompanionProfile from './pages/CompanionProfile';
import BookingPage from './pages/BookingPage';
import ClientDashboard from './pages/ClientDashboard';
import CompanionDashboard from './pages/CompanionDashboard';
import MoodMatcher from './pages/MoodMatcher';
import AvailableNow from './pages/AvailableNow';
import HappinessDashboard from './pages/HappinessDashboard';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-rose-500 text-xl">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/companions" element={<CompanionList />} />
        <Route path="/companions/:id" element={<CompanionProfile />} />
        <Route
          path="/book/:companionId"
          element={
            <ProtectedRoute role="client">
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/client"
          element={
            <ProtectedRoute role="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/companion"
          element={
            <ProtectedRoute role="companion">
              <CompanionDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/mood" element={<MoodMatcher />} />
        <Route path="/available-now" element={<AvailableNow />} />
        <Route
          path="/happiness"
          element={
            <ProtectedRoute role="client">
              <HappinessDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
