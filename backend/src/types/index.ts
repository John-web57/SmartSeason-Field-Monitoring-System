// User types
export enum UserRole {
  ADMIN = 'admin',
  FIELD_AGENT = 'field_agent'
}

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface UserPayload {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

// Field types
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
  currentStage: FieldStage;
  status: FieldStatus;
  assignedAgentId: number | null;
  latitude?: number;
  longitude?: number;
  acreage?: number;
  description?: string;
  expectedHarvestDate?: string;
  harvestDate?: string;
  yield?: number;
  createdAt: string;
  updatedAt: string;
}

export interface FieldUpdate {
  id: number;
  fieldId: number;
  fieldName?: string;
  agentId: number;
  agentName?: string;
  stage: FieldStage;
  notes: string;
  createdAt: string;
}

// Request/Response types
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserPayload;
}

export interface CreateFieldRequest {
  name: string;
  cropType: string;
  plantingDate: string;
  assignedAgentId?: number;
  latitude?: number;
  longitude?: number;
  acreage?: number;
  description?: string;
  expectedHarvestDate?: string;
}

export interface UpdateFieldRequest {
  name?: string;
  cropType?: string;
  stage?: FieldStage;
  assignedAgentId?: number | null;
  latitude?: number;
  longitude?: number;
  acreage?: number;
  description?: string;
  expectedHarvestDate?: string;
  harvestDate?: string;
  yield?: number;
}

export interface CreateFieldUpdateRequest {
  stage: FieldStage;
  notes: string;
}

export interface FieldUpdateWithAgent extends FieldUpdate {
  agentName: string;
  fieldName: string;
}

export interface FieldLifecycle {
  stage: FieldStage;
  days: number;
  description: string;
  estimatedExitDate?: string;
}

export interface FieldLifecycleProgress {
  currentStage: FieldStage;
  progression: Record<FieldStage, FieldLifecycle>;
  completionPercentage: number;
  daysInCurrentStage: number;
  estimatedHarvestDate?: string;
}

export interface FieldStatusReason {
  status: FieldStatus;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  recommendation?: string;
}
