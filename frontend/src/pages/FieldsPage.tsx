import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../components/AuthContext';
import { Agent, Field } from '../types';
import { FieldCard } from '../components/FieldCard';
import '../styles/FieldsList.css';

export const FieldsPage: React.FC = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cropType: '',
    plantingDate: '',
    acreage: '',
    latitude: '',
    longitude: '',
    description: '',
    expectedHarvestDate: '',
    assignedAgentId: ''
  });
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchFields();
    if (isAdmin) {
      fetchAgents();
    }
  }, [isAdmin]);

  const fetchFields = async () => {
    try {
      setLoading(true);
      const { data } = await api.getAllFields();
      setFields(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const { data } = await api.getAllAgents();
      setAgents(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load field agents');
    }
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fieldData = {
        ...formData,
        acreage: formData.acreage ? parseFloat(formData.acreage) : undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        assignedAgentId: formData.assignedAgentId ? parseInt(formData.assignedAgentId, 10) : undefined
      };
      await api.createField(fieldData);
      setFormData({
        name: '',
        cropType: '',
        plantingDate: '',
        acreage: '',
        latitude: '',
        longitude: '',
        description: '',
        expectedHarvestDate: '',
        assignedAgentId: ''
      });
      setShowCreateForm(false);
      fetchFields();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create field');
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <div className="fields-header">
        <h1>Fields</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/search')}>
            🔍 Search Fields
          </button>
          {isAdmin && (
            <button
              className="btn-primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : '+ Create Field'}
            </button>
          )}
        </div>
      </div>

      {showCreateForm && isAdmin && (
        <div className="create-form">
          <h2>Create New Field</h2>
          <form onSubmit={handleCreateField}>
            <div className="form-group">
              <label>Field Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Crop Type *</label>
              <select
                value={formData.cropType}
                onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                required
              >
                <option value="">Select Crop</option>
                <option value="Corn">Corn</option>
                <option value="Soybeans">Soybeans</option>
                <option value="Wheat">Wheat</option>
                <option value="Barley">Barley</option>
                <option value="Oats">Oats</option>
              </select>
            </div>
            <div className="form-group">
              <label>Planting Date *</label>
              <input
                type="date"
                value={formData.plantingDate}
                onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Acreage</label>
              <input
                type="number"
                step="0.1"
                value={formData.acreage}
                onChange={(e) => setFormData({ ...formData, acreage: e.target.value })}
                placeholder="e.g., 45.5"
              />
            </div>
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                placeholder="e.g., 41.8781"
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                placeholder="e.g., -87.6298"
              />
            </div>
            <div className="form-group">
              <label>Expected Harvest Date</label>
              <input
                type="date"
                value={formData.expectedHarvestDate}
                onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Assigned Field Agent</label>
              <select
                value={formData.assignedAgentId}
                onChange={(e) => setFormData({ ...formData, assignedAgentId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Field notes..."
              />
            </div>
            <button type="submit" className="btn-primary" style={{ gridColumn: '1 / -1' }}>
              Create Field
            </button>
          </form>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="fields-grid">
        {fields.map((field) => (
          <FieldCard
            key={field.id}
            field={field}
            showAgent={isAdmin}
            agentName={agents.find((agent) => agent.id === field.assignedAgentId)?.name || null}
            onClick={() => navigate(`/field/${field.id}`)}
          />
        ))}
      </div>

      {fields.length === 0 && (
        <div className="empty-state">
          <p>No fields found. {isAdmin && 'Create one to get started!'}</p>
        </div>
      )}
    </div>
  );
};
