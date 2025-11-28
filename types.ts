
export enum AppView {
  LANDING = 'LANDING',
  AUTH = 'AUTH',
  REGISTER = 'REGISTER',
  INPUT = 'INPUT',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
  HISTORY = 'HISTORY',
  HISTORY_DETAILS = 'HISTORY_DETAILS'
}

export interface SoapNote {
  id?: string;
  timestamp?: number;
  patientId: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface AudioData {
  blob: Blob;
  duration: number;
}