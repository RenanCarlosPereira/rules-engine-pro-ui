import { ScopedParam } from './scoped-param';
import { Rule } from './rule';

export interface Workflow {
  workflowName: string;
  workflowsToInject?: string[];
  globalParams?: ScopedParam[];
  rules: Rule[];
}
