import React from 'react';
import { Field, FieldStage, FieldStatus } from '../types';
import '../styles/FieldCard.css';

interface FieldCardProps {
  field: Field;
  onClick: () => void;
  showAgent?: boolean;
  agentName?: string | null;
}

export const FieldCard: React.FC<FieldCardProps> = ({ field, onClick, showAgent, agentName }) => {
  const getStageColor = (stage: FieldStage) => {
    switch (stage) {
      case FieldStage.PLANTED:
        return '#6c5ce7';
      case FieldStage.GROWING:
        return '#74b9ff';
      case FieldStage.READY:
        return '#fdcb6e';
      case FieldStage.HARVESTED:
        return '#27ae60';
      default:
        return '#95a5a6';
    }
  };

  const getStatusBadge = (status: FieldStatus) => {
    switch (status) {
      case FieldStatus.ACTIVE:
        return 'badge-active';
      case FieldStatus.AT_RISK:
        return 'badge-risk';
      case FieldStatus.COMPLETED:
        return 'badge-completed';
      default:
        return '';
    }
  };

  const getLifecycleProgress = (stage: FieldStage) => {
    const stageOrder = [FieldStage.PLANTED, FieldStage.GROWING, FieldStage.READY, FieldStage.HARVESTED];
    const currentIndex = stageOrder.indexOf(stage);
    return ((currentIndex + 1) / stageOrder.length) * 100;
  };

  const daysUntilHarvest = field.expectedHarvestDate
    ? Math.ceil((new Date(field.expectedHarvestDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="field-card" onClick={onClick}>
      <div className="field-progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${getLifecycleProgress(field.currentStage)}%` }}
        />
      </div>
      <div className="field-header">
        <h3>{field.name}</h3>
        <span className={`badge ${getStatusBadge(field.status)}`}>{field.status}</span>
      </div>
      <div className="field-info">
        <p><strong>Crop:</strong> {field.cropType}</p>
        {showAgent && (
          <p><strong>Assigned Agent:</strong> {agentName || 'Unassigned'}</p>
        )}
        {field.acreage && <p><strong>Acreage:</strong> {field.acreage} acres</p>}
        <p><strong>Planting Date:</strong> {new Date(field.plantingDate).toLocaleDateString()}</p>
        {field.expectedHarvestDate && (
          <p>
            <strong>Expected Harvest:</strong> {new Date(field.expectedHarvestDate).toLocaleDateString()}
            {daysUntilHarvest !== null && daysUntilHarvest >= 0 && <span className="days-left"> ({daysUntilHarvest} days)</span>}
          </p>
        )}
        {field.yield !== undefined && field.yield !== null && (
          <p><strong>Yield:</strong> {field.yield} bu/acre</p>
        )}
        <div className="stage-indicator">
          <span className="stage-label">Current Stage:</span>
          <span className="stage-badge" style={{ backgroundColor: getStageColor(field.currentStage) }}>
            {field.currentStage}
          </span>
        </div>
      </div>
    </div>
  );
};
