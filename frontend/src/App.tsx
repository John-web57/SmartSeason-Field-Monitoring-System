import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navigation } from './components/Navigation';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { FieldsPage } from './pages/FieldsPage';
import { SearchFieldsPage } from './pages/SearchFieldsPage';
import { MyFieldsPage } from './pages/MyFieldsPage';
import { FieldDetailPage } from './pages/FieldDetailPage';
import { FieldUpdatesMonitorPage } from './pages/FieldUpdatesMonitorPage';
import './styles/global.css';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navigation />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/fields"
          element={
            <ProtectedRoute requiredRole="admin">
              <FieldsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchFieldsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/my-fields"
          element={
            <ProtectedRoute requiredRole="field_agent">
              <MyFieldsPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/field/:id"
          element={
            <ProtectedRoute>
              <FieldDetailPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/updates-monitor"
          element={
            <ProtectedRoute requiredRole="admin">
              <FieldUpdatesMonitorPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
