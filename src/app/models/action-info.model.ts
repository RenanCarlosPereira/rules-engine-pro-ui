export interface ActionInfo {
  name: string;
  context?: Record<string, any>;
}

export interface FieldDefinition {
  type: string;
  label?: string;
  defaultValue?: any;
  required?: boolean;
  metadata?: Record<string, any> | null;
}

export interface ActionDefinition {
  key: string;
  value: Record<string, FieldDefinition>;
}


