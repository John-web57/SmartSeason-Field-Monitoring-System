import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../components/AuthContext';
import { FieldLifecycleTimeline } from '../components/FieldLifecycleTimeline';
import { Agent, Field, FieldStage, FieldUpdate } from '../types';
import '../styles/FieldDetail.css';

export const FieldDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [field, setField] = useState<Field | null>(null);
  const [updates, setUpdates] = useState<FieldUpdate[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [statusReason, setStatusReason] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('low');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showHarvestForm, setShowHarvestForm] = useState(false);
  const [showCloneForm, setShowCloneForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [updateData, setUpdateData] = useState({ stage: FieldStage.GROWING, notes: '' });
  const [harvestData, setHarvestData] = useState({ yield: '', harvestDate: new Date().toISOString().split('T')[0] });
  const [cloneData, setCloneData] = useState({ newName: '', plantingDate: new Date().toISOString().split('T')[0] });
  const [assignedAgentId, setAssignedAgentId] = useState('');
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchField();
    if (isAdmin) {
      fetchAgents();
    }
  }, [id, isAdmin]);

  const fetchField = async () => {
    try {
      setLoading(true);
      const { data } = await api.getField(parseInt(id || '0'));
      setField(data.field);
      setAssignedAgentId(data.field.assignedAgentId ? String(data.field.assignedAgentId) : '');
      setUpdates(data.updates);

      // Fetch status details
      try {
        const { data: statusData } = await api.getFieldStatusDetails(parseInt(id || '0'));
        setStatusReason(statusData.statusReason);
        setSeverity(statusData.severity);
      } catch (err) {
        // Status details are optional
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load field');
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

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addFieldUpdate(parseInt(id || '0'), updateData);
      setUpdateData({ stage: FieldStage.GROWING, notes: '' });
      setShowUpdateForm(false);
      fetchField();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add update');
    }
  };

  const handleRecordHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.recordHarvest(parseInt(id || '0'), parseFloat(harvestData.yield), harvestData.harvestDate);
      setShowHarvestForm(false);
      fetchField();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record harvest');
    }
  };

  const handleCloneField = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.cloneField(parseInt(id || '0'), cloneData.newName, cloneData.plantingDate);
      setCloneData({ newName: '', plantingDate: new Date().toISOString().split('T')[0] });
      setShowCloneForm(false);
      navigate('/fields');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to clone field');
    }
  };

  const handleAssignAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateField(parseInt(id || '0'), {
        assignedAgentId: assignedAgentId ? parseInt(assignedAgentId, 10) : null
      });
      setShowAssignmentForm(false);
      fetchField();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update assigned agent');
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!field) return <div className="container"><p>Field not found</p></div>;

  const isAssignedAgent = !isAdmin && field.assignedAgentId === user?.id;
  const canEdit = isAdmin || isAssignedAgent;
  const assignedAgent = agents.find((agent) => agent.id === field.assignedAgentId);
  const daysUntilHarvest = field.expectedHarvestDate
    ? Math.ceil((new Date(field.expectedHarvestDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Get valid next stages based on current stage
  const getValidNextStages = () => {
    const stageOrder = [FieldStage.PLANTED, FieldStage.GROWING, FieldStage.READY, FieldStage.HARVESTED];
    const currentIndex = stageOrder.indexOf(field.currentStage);
    return stageOrder.slice(currentIndex);
  };

  return (
    <div className="container">
      <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>

      <div className="field-detail">
        <div className="field-detail-header">
          <h1>{field.name}</h1>
          <span className={`status-badge status-${field.status}`}>{field.status}</span>
        </div>

        {statusReason && (
          <div className={`status-reason-box severity-${severity}`}>
            <div className="reason-header">
              <span className="reason-icon">
                {severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🔵'}
              </span>
              <span className="reason-label">
                {severity === 'high' ? 'Critical' : severity === 'medium' ? 'Warning' : 'Info'}
              </span>
            </div>
            <p className="reason-text">{statusReason}</p>
          </div>
        )}

        <div className="field-detail-grid">
          <div className="detail-item">
            <label>Crop Type</label>
            <p>{field.cropType}</p>
          </div>
          <div className="detail-item">
            <label>Planting Date</label>
            <p>{new Date(field.plantingDate).toLocaleDateString()}</p>
          </div>
          <div className="detail-item">
            <label>Current Stage</label>
            <p className="stage-badge">{field.currentStage}</p>
          </div>
          <div className="detail-item">
            <label>Assigned Agent</label>
            <p>{assignedAgent?.name || 'Unassigned'}</p>
          </div>
          {field.acreage && (
            <div className="detail-item">
              <label>Acreage</label>
              <p>{field.acreage} acres</p>
            </div>
          )}
          {field.latitude && field.longitude && (
            <div className="detail-item">
              <label>Location</label>
              <p>{field.latitude.toFixed(4)}, {field.longitude.toFixed(4)}</p>
            </div>
          )}
          {field.expectedHarvestDate && (
            <div className="detail-item">
              <label>Expected Harvest</label>
              <p>
                {new Date(field.expectedHarvestDate).toLocaleDateString()}
                {daysUntilHarvest !== null && daysUntilHarvest >= 0 && <span className="days-left"> ({daysUntilHarvest} days)</span>}
              </p>
            </div>
          )}
          {field.yield !== undefined && field.yield !== null && (
            <div className="detail-item">
              <label>Yield</label>
              <p>{field.yield} bu/acre</p>
            </div>
          )}
          {field.harvestDate && (
            <div className="detail-item">
              <label>Harvest Date</label>
              <p>{new Date(field.harvestDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {field.description && (
          <div className="field-description">
            <h3>Description</h3>
            <p>{field.description}</p>
          </div>
        )}

        <FieldLifecycleTimeline 
          currentStage={field.currentStage} 
          plantingDate={field.plantingDate}
          expectedHarvestDate={field.expectedHarvestDate}
        />

        {error && <div className="error-message">{error}</div>}

        {isAdmin && (
          <div className="admin-actions">
            <button
              className="btn-primary"
              onClick={() => setShowAssignmentForm(!showAssignmentForm)}
            >
              {showAssignmentForm ? 'Cancel Assignment' : 'Assign Field Agent'}
            </button>
            <button
              className="btn-primary"
              onClick={() => setShowCloneForm(!showCloneForm)}
            >
              {showCloneForm ? 'Cancel Clone' : '🔄 Clone Field'}
            </button>
            {field.currentStage !== FieldStage.HARVESTED && (
              <button
                className="btn-primary"
                onClick={() => setShowHarvestForm(!showHarvestForm)}
              >
                {showHarvestForm ? 'Cancel Harvest' : '✂️ Record Harvest'}
              </button>
            )}
          </div>
        )}

        {showAssignmentForm && isAdmin && (
          <form className="update-form" onSubmit={handleAssignAgent}>
            <h3>Assign Field Agent</h3>
            <div className="form-group">
              <label>Field Agent</label>
              <select
                value={assignedAgentId}
                onChange={(e) => setAssignedAgentId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} ({agent.email})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary">Save Assignment</button>
          </form>
        )}

        {showCloneForm && isAdmin && (
          <form className="update-form" onSubmit={handleCloneField}>
            <h3>Clone Field</h3>
            <div className="form-group">
              <label>New Field Name</label>
              <input
                type="text"
                value={cloneData.newName}
                onChange={(e) => setCloneData({ ...cloneData, newName: e.target.value })}
                placeholder="e.g., North Field A - Season 2026"
                required
              />
            </div>
            <div className="form-group">
              <label>New Planting Date</label>
              <input
                type="date"
                value={cloneData.plantingDate}
                onChange={(e) => setCloneData({ ...cloneData, plantingDate: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Create Clone</button>
          </form>
        )}

        {showHarvestForm && isAdmin && (
          <form className="update-form" onSubmit={handleRecordHarvest}>
            <h3>Record Harvest</h3>
            <div className="form-group">
              <label>Yield (bu/acre)</label>
              <input
                type="number"
                step="0.1"
                value={harvestData.yield}
                onChange={(e) => setHarvestData({ ...harvestData, yield: e.target.value })}
                placeholder="e.g., 165"
                required
              />
            </div>
            <div className="form-group">
              <label>Harvest Date</label>
              <input
                type="date"
                value={harvestData.harvestDate}
                onChange={(e) => setHarvestData({ ...harvestData, harvestDate: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary">Record Harvest</button>
          </form>
        )}

        {canEdit && (
          <div className="update-section">
            <div className="update-header">
              <h2>Field Updates</h2>
              <button
                className="btn-primary"
                onClick={() => setShowUpdateForm(!showUpdateForm)}
              >
                {showUpdateForm ? 'Cancel' : '+ Add Update'}
              </button>
            </div>

            {showUpdateForm && (
              <form className="update-form" onSubmit={handleAddUpdate}>
                <div className="form-group">
                  <label>New Stage</label>
                  <select
                    value={updateData.stage}
                    onChange={(e) => setUpdateData({ ...updateData, stage: e.target.value as FieldStage })}
                  >
                    {getValidNextStages().map((stage) => (
                      <option key={stage} value={stage}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    value={updateData.notes}
                    onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                    placeholder="Add observations or notes..."
                  />
                </div>
                <button type="submit" className="btn-primary">Submit Update</button>
              </form>
            )}
          </div>
        )}

        {updates.length > 0 && (
          <div className="updates-timeline">
            <h2>Update History</h2>
            {updates.map((update) => (
              <div key={update.id} className="update-item">
                <div className="update-meta">
                  <span className="update-stage">{update.stage}</span>
                  <span className="update-date">
                    {new Date(update.createdAt).toLocaleDateString()} {new Date(update.createdAt).toLocaleTimeString()}
                  </span>
                  {update.agentName && (
                    <span className="update-agent">By {update.agentName}</span>
                  )}
                </div>
                {update.notes && <p className="update-notes">{update.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
