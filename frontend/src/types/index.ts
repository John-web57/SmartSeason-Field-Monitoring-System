export enum UserRole {
  ADMIN = 'admin',
  FIELD_AGENT = 'field_agent'
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export enum FieldStage {
  PLANTED = 'planted',
  GROWING = 'growing',
  READY = 'ready',
  HARVESTED = 'harvested'
}

export enum FieldStatus {
  ACTIVE = 'active',
  AT_RISK = 'at_risk',
  COMPLETED = 'completed'
}

export interface Field {
  id: number;
  name: string;
  cropType: string;
  plantingDate: string;
  acreage?: number;
  latitude?: number;
  longitude?: number;
  description?: string;
  expectedHarvestDate?: string;
  harvestDate?: string;
  yield?: number;
  currentStage: FieldStage;
  status: FieldStatus;
  assignedAgentId: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FieldUpdate {
  id: number;
  fieldId: number;
  agentId: number;
  agentName?: string;
  fieldName?: string;
  stage: FieldStage;
  notes: string;
  createdAt: string;
}

export interface Agent {
  id: number;
  name: string;
  email: string;
}

export interface Statistics {
  total: number;
  byStage: Record<string, number>;
  byStatus: Record<string, number>;
}
