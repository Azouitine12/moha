
export type DataRow = Record<string, string | number | null>;

export type FieldType = 'string' | 'number' | 'date' | 'email' | 'boolean';

export type AIProvider = 'gemini' | 'openai';

export interface SchemaField {
  name: string;
  type: FieldType;
  required: boolean;
  min?: number;
  max?: number;
  regex?: string;
}

export interface ValidationIssue {
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CleaningReport {
  id: string;
  date: string;
  fileName: string;
  duplicatesRemoved: number;
  invalidEmailsFixed: number;
  invalidPhonesFixed: number;
  datesStandardized: number;
  spacesTrimmed: number;
  missingValuesHandled: number;
  anomaliesDetected: number;
  validationIssuesCount: number;
  totalChanges: number;
  rowCount: number;
}

export interface Anomaly {
  row: number;
  column: string;
  value: any;
  reason: string;
  suggestion: string;
  type?: 'ai' | 'schema';
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  PREVIEW = 'PREVIEW',
  CLEANING = 'CLEANING',
  REPORT = 'REPORT'
}

export enum AppView {
  TOOL = 'TOOL',
  DASHBOARD = 'DASHBOARD',
  USAGE = 'USAGE',
  PRICING = 'PRICING',
  ACCOUNT = 'ACCOUNT'
}

export interface CleaningOptions {
  removeDuplicates: boolean;
  trimSpaces: boolean;
  standardizeCase: boolean;
  fixDates: boolean;
  validateEmails: boolean;
  useAI: boolean;
  aiProvider: AIProvider;
  aiModel: string;
  validateSchema: boolean;
  schema?: SchemaField[];
}
