import { ScopedParam } from './scoped-param';
import { Rule } from './rule';
import { Auditing } from './auditing';

export interface Workflow {
  workflowName: string;
  workflowsToInject?: string[];
  globalParams?: ScopedParam[];
  auditing?: Auditing;
  rules: Rule[];
}


