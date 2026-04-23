import React from 'react';
import { FieldStage } from '../types';
import '../styles/FieldLifecycleTimeline.css';

interface FieldLifecycleTimelineProps {
  currentStage: FieldStage;
  plantingDate: string;
  expectedHarvestDate?: string;
}

const stages = [
  { stage: FieldStage.PLANTED, label: 'Planted', icon: '🌱', description: 'Field prepared and seeds planted' },
  { stage: FieldStage.GROWING, label: 'Growing', icon: '🌾', description: 'Crops actively growing' },
  { stage: FieldStage.READY, label: 'Ready', icon: '🟡', description: 'Crops mature and ready for harvest' },
  { stage: FieldStage.HARVESTED, label: 'Harvested', icon: '✓', description: 'Crops harvested' }
];

const getStageIndex = (stage: FieldStage): number => {
  const stageOrder = [FieldStage.PLANTED, FieldStage.GROWING, FieldStage.READY, FieldStage.HARVESTED];
  return stageOrder.indexOf(stage);
};

const calculateDaysSince = (date: string): number => {
  const startDate = new Date(date);
  const today = new Date();
  return Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
};

const calculateDaysUntil = (date: string): number => {
  const futureDate = new Date(date);
  const today = new Date();
  const daysUntil = Math.ceil((futureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, daysUntil);
};

const getCompletionPercentage = (stage: FieldStage): number => {
  const currentIndex = getStageIndex(stage);
  return ((currentIndex + 1) / stages.length) * 100;
};

export const FieldLifecycleTimeline: React.FC<FieldLifecycleTimelineProps> = ({
  currentStage,
  plantingDate,
  expectedHarvestDate
}) => {
  const currentIndex = getStageIndex(currentStage);
  const daysSincePlanting = calculateDaysSince(plantingDate);
  const daysUntilHarvest = expectedHarvestDate ? calculateDaysUntil(expectedHarvestDate) : null;
  const completionPercentage = getCompletionPercentage(currentStage);

  return (
    <div className="lifecycle-container">
      <div className="lifecycle-header">
        <h3>Field Lifecycle</h3>
        <div className="lifecycle-stats">
          <span className="stat-item">
            <span className="stat-label">Days Since Planting:</span>
            <span className="stat-value">{daysSincePlanting}</span>
          </span>
          {daysUntilHarvest !== null && (
            <span className="stat-item">
              <span className="stat-label">Days Until Harvest:</span>
              <span className="stat-value">{daysUntilHarvest}</span>
            </span>
          )}
        </div>
      </div>

      <div className="lifecycle-progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      <div className="lifecycle-timeline">
        {stages.map((item, index) => (
          <div 
            key={item.stage} 
            className={`timeline-stage ${item.stage === currentStage ? 'active' : ''} ${index <= currentIndex ? 'completed' : 'pending'}`}
          >
            <div className="stage-connector">
              {index < stages.length - 1 && (
                <div className={`connector-line ${index < currentIndex ? 'completed' : ''}`} />
              )}
            </div>
            
            <div className="stage-content">
              <div className={`stage-icon ${item.stage}`}>
                {item.icon}
              </div>
              <div className="stage-info">
                <h4>{item.label}</h4>
                <p className="stage-description">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="lifecycle-legend">
        <div className="legend-item">
          <span className="legend-badge completed">●</span>
          <span>Completed</span>
        </div>
        <div className="legend-item">
          <span className="legend-badge active">●</span>
          <span>Current</span>
        </div>
        <div className="legend-item">
          <span className="legend-badge pending">●</span>
          <span>Upcoming</span>
        </div>
      </div>
    </div>
  );
};
