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

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-rose-500 text-xl">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-orange-50">
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
