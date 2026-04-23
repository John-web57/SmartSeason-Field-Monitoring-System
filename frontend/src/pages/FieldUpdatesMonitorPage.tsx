import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../components/AuthContext';
import { FieldUpdate } from '../types';
import '../styles/FieldUpdatesMonitor.css';

export const FieldUpdatesMonitorPage: React.FC = () => {
  const [updates, setUpdates] = useState<FieldUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'agent'>('all');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [agents, setAgents] = useState<any[]>([]);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: updatesData } = await api.getAllUpdates();
      setUpdates(updatesData);

      // Extract unique agents from updates
      const uniqueAgents = Array.from(
        new Map(
          (updatesData as any[])
            .map((u: any) => [u.agentId, { id: u.agentId, name: u.agentName }])
            .entries()
        ).values()
      );
      setAgents(uniqueAgents);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load updates');
    } finally {
      setLoading(false);
    }
  };

  const filteredUpdates = selectedAgent
    ? updates.filter((u: any) => u.agentId === parseInt(selectedAgent))
    : updates;

  const groupedByField = filteredUpdates.reduce((acc: any, update: any) => {
    if (!acc[update.fieldName]) {
      acc[update.fieldName] = [];
    }
    acc[update.fieldName].push(update);
    return acc;
  }, {});

  if (!isAdmin) {
    return <div className="container"><p>Access denied</p></div>;
  }

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <h1>Field Updates Monitoring</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="monitor-controls">
        <div className="filter-group">
          <label>Filter by Agent:</label>
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="filter-select"
          >
            <option value="">All Agents</option>
            {agents.map((agent: any) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
        <p className="update-count">Total: {filteredUpdates.length} updates</p>
      </div>

      {filteredUpdates.length === 0 ? (
        <div className="no-updates">
          <p>No updates found</p>
        </div>
      ) : (
        <div className="updates-container">
          {Object.entries(groupedByField).map(([fieldName, fieldUpdates]: [string, any]) => (
            <div key={fieldName} className="field-updates-group">
              <div className="group-header">
                <h2>{fieldName}</h2>
                <span className="update-count">{fieldUpdates.length} updates</span>
              </div>

              <div className="updates-list">
                {fieldUpdates.map((update: FieldUpdate) => (
                  <div key={update.id} className="update-card">
                    <div className="card-header">
                      <span className="agent-badge">
                        👤 {(update as any).agentName}
                      </span>
                      <span className={`stage-badge stage-${update.stage}`}>
                        {update.stage.toUpperCase()}
                      </span>
                      <span className="update-date">
                        {new Date(update.createdAt).toLocaleDateString()}{' '}
                        {new Date(update.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    {update.notes && (
                      <div className="card-notes">
                        <p>{update.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn-back" onClick={() => navigate(-1)}>
        ← Back
      </button>
    </div>
  );
};
