import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Field, FieldStatus } from '../types';
import { FieldCard } from './FieldCard';
import '../styles/AgentDashboard.css';

export const AgentDashboard: React.FC = () => {
  const [myFields, setMyFields] = useState<Field[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [fieldsRes, statsRes] = await Promise.all([
        api.getFieldsByAgent(),
        api.getMyStats()
      ]);
      setMyFields(fieldsRes.data || []);
      setStats(statsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  const atRiskCount = myFields.filter(f => f.status === FieldStatus.AT_RISK).length;
  const activeCount = myFields.filter(f => f.status === FieldStatus.ACTIVE).length;
  const completedCount = myFields.filter(f => f.status === FieldStatus.COMPLETED).length;
  const totalAcreage = myFields.reduce((sum, f) => sum + (f.acreage || 0), 0);

  return (
    <div className="agent-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>My Fields</h1>
          <p>Manage your assigned fields and track progress</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/search')}>
          Search All Fields
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="agent-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🌾</div>
          <div className="stat-info">
            <h3>{myFields.length}</h3>
            <p>Assigned Fields</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{activeCount}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card alert">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{atRiskCount}</h3>
            <p>At Risk</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <h3>{completedCount}</h3>
            <p>Completed</p>
          </div>
        </div>
        {totalAcreage > 0 && (
          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-info">
              <h3>{totalAcreage}</h3>
              <p>Total Acres</p>
            </div>
          </div>
        )}
      </div>

      {atRiskCount > 0 && (
        <div className="alert-box">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <h3>Attention Required</h3>
          </div>
          <p>
            You have <strong>{atRiskCount}</strong> field{atRiskCount === 1 ? '' : 's'} that need attention.
            Review them below and take necessary actions.
          </p>
        </div>
      )}

      {myFields.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌱</div>
          <h2>No Fields Assigned</h2>
          <p>You don't have any fields assigned yet. Contact your administrator to get started.</p>
        </div>
      ) : (
        <div className="fields-section">
          <h2>Your Fields</h2>
          <div className="fields-grid">
            {myFields.map((field) => (
              <div key={field.id} className="field-card-wrapper">
                <FieldCard
                  field={field}
                  onClick={() => navigate(`/field/${field.id}`)}
                />
                <div className="card-actions">
                  <button
                    className="btn-action"
                    onClick={() => navigate(`/field/${field.id}`)}
                    title="View details and add updates"
                  >
                    View & Update →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
