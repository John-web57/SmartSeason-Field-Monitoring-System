import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { FieldStatusWidget } from './FieldStatusWidget';
import '../styles/AdminDashboard.css';

interface ActivityLog {
  fieldId: number;
  fieldName: string;
  agentName: string;
  action: string;
  stage: string;
  timestamp: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, updatesRes] = await Promise.all([
        api.getStatistics(),
        api.getAllUpdates()
      ]);
      setStats(statsRes.data);
      setRecentUpdates(updatesRes.data.slice(0, 10) || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  const activePercentage = stats?.total ? Math.round((stats.byStatus?.active || 0) / stats.total * 100) : 0;
  const atRiskPercentage = stats?.total ? Math.round((stats.byStatus?.at_risk || 0) / stats.total * 100) : 0;
  const completedPercentage = stats?.total ? Math.round((stats.byStatus?.completed || 0) / stats.total * 100) : 0;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/fields')}>
            Manage Fields
          </button>
          <button className="btn-primary" onClick={() => navigate('/updates-monitor')}>
            View All Updates
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <FieldStatusWidget />

      <div className="dashboard-grid">
        <div className="card overview-section">
          <h2>Field Overview</h2>
          <div className="overview-stats">
            <div className="overview-item">
              <span className="label">Total Fields</span>
              <span className="value">{stats?.total || 0}</span>
            </div>
            <div className="overview-item">
              <span className="label">Total Acreage</span>
              <span className="value">{stats?.totalAcreage || 0}</span>
            </div>
            <div className="overview-item">
              <span className="label">Avg Field Size</span>
              <span className="value">{stats?.averageAcreage || 0}</span>
            </div>
          </div>

          <div className="status-distribution">
            <h3>Status Distribution</h3>
            <div className="distribution-chart">
              <div className="chart-bar">
                <div
                  className="bar-segment active"
                  style={{ width: `${activePercentage}%` }}
                  title={`Active: ${stats?.byStatus?.active || 0}`}
                />
                <div
                  className="bar-segment at-risk"
                  style={{ width: `${atRiskPercentage}%` }}
                  title={`At Risk: ${stats?.byStatus?.at_risk || 0}`}
                />
                <div
                  className="bar-segment completed"
                  style={{ width: `${completedPercentage}%` }}
                  title={`Completed: ${stats?.byStatus?.completed || 0}`}
                />
              </div>
            </div>

            <div className="distribution-legend">
              <div className="legend-item">
                <span className="legend-color active" />
                <span>Active ({stats?.byStatus?.active || 0})</span>
              </div>
              <div className="legend-item">
                <span className="legend-color at-risk" />
                <span>At Risk ({stats?.byStatus?.at_risk || 0})</span>
              </div>
              <div className="legend-item">
                <span className="legend-color completed" />
                <span>Completed ({stats?.byStatus?.completed || 0})</span>
              </div>
            </div>
          </div>

          <div className="stage-breakdown">
            <h3>By Stage</h3>
            <div className="stage-grid">
              {Object.entries(stats?.byStage || {}).map(([stage, count]: [string, any]) => (
                <div key={stage} className="stage-item">
                  <div className="stage-name">{stage.charAt(0).toUpperCase() + stage.slice(1)}</div>
                  <div className="stage-count">{count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card recent-updates-section">
          <div className="section-header">
            <h2>Recent Field Updates</h2>
            <button
              className="btn-link"
              onClick={() => navigate('/updates-monitor')}
            >
              View All →
            </button>
          </div>

          {recentUpdates.length === 0 ? (
            <p className="empty-message">No recent updates</p>
          ) : (
            <div className="updates-timeline">
              {recentUpdates.map((update, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-dot" />
                  <div className="timeline-content">
                    <div className="update-header">
                      <span className="field-name">{update.fieldName}</span>
                      <span className="stage-tag">{update.stage}</span>
                    </div>
                    <p className="agent-info">Updated by {update.agentName}</p>
                    {update.notes && <p className="update-notes">{update.notes}</p>}
                    <span className="update-time">
                      {new Date(update.createdAt).toLocaleDateString()}{' '}
                      {new Date(update.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
