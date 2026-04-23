import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import '../styles/Navigation.css';

export const Navigation: React.FC = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🌾 SmartSeason</Link>
      </div>
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {isAdmin && <Link to="/fields">Manage Fields</Link>}
            {isAdmin && <Link to="/updates-monitor">Monitor Updates</Link>}
            {!isAdmin && <Link to="/my-fields">My Fields</Link>}
            <div className="navbar-user">
              <span>{user?.name}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};
