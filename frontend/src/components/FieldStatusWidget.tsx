import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/FieldStatusWidget.css';

interface AtRiskField {
  id: number;
  name: string;
  cropType: string;
  currentStage: string;
  status: string;
  statusReason: string;
  severity: 'low' | 'medium' | 'high';
}

export const FieldStatusWidget: React.FC = () => {
  const [atRiskFields, setAtRiskFields] = useState<AtRiskField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAtRiskFields();
  }, []);

  const fetchAtRiskFields = async () => {
    try {
      setLoading(true);
      const { data } = await api.getAtRiskFields();
      setAtRiskFields(data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load at-risk fields');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'high':
        return '#e74c3c';
      case 'medium':
        return '#f39c12';
      case 'low':
        return '#f1c40f';
      default:
        return '#95a5a6';
    }
  };

  const getSeverityLabel = (severity: 'low' | 'medium' | 'high'): string => {
    switch (severity) {
      case 'high':
        return 'Critical';
      case 'medium':
        return 'Warning';
      case 'low':
        return 'Notice';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="field-status-widget">
        <div className="widget-header">
          <h3>Fields at Risk</h3>
        </div>
        <p className="loading">Loading...</p>
      </div>
    );
  }

  return (
    <div className="field-status-widget">
      <div className="widget-header">
        <h3>⚠️ Fields at Risk</h3>
        {atRiskFields.length > 0 && (
          <span className="alert-badge">{atRiskFields.length}</span>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {atRiskFields.length === 0 ? (
        <div className="no-alerts">
          <p>✓ No fields at risk - everything is on track!</p>
        </div>
      ) : (
        <div className="at-risk-list">
          {atRiskFields.map((field) => (
            <div
              key={field.id}
              className="at-risk-item"
              onClick={() => navigate(`/field/${field.id}`)}
              style={{ borderLeftColor: getSeverityColor(field.severity) }}
            >
              <div className="item-header">
                <h4>{field.name}</h4>
                <span
                  className="severity-badge"
                  style={{
                    backgroundColor: getSeverityColor(field.severity),
                    color: 'white'
                  }}
                >
                  {getSeverityLabel(field.severity)}
                </span>
              </div>

              <div className="item-details">
                <p>
                  <strong>Crop:</strong> {field.cropType}
                </p>
                <p>
                  <strong>Stage:</strong> {field.currentStage}
                </p>
              </div>

              <div className="item-reason">
                <p>⚠️ {field.statusReason}</p>
              </div>

              <button className="btn-view" onClick={() => navigate(`/field/${field.id}`)}>
                View Details →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
