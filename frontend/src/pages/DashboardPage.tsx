import React from 'react';
import { useAuth } from '../components/AuthContext';
import { AdminDashboard } from '../components/AdminDashboard';
import { AgentDashboard } from '../components/AgentDashboard';
import '../styles/Dashboard.css';

export const DashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <p>Welcome, {user?.name}! ({user?.role})</p>
      </div>

      {isAdmin ? <AdminDashboard /> : <AgentDashboard />}
    </div>
  );
};
