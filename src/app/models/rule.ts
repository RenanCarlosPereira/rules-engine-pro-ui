import { ScopedParam } from './scoped-param';
import { RuleActions } from './rule-actions';

export interface Rule {
  workflowsToInject?: string;
  ruleName: string;
  expression?: string;
  operator?: 'And' | 'Or' | null;
  rules?: Rule[];
  localParams?: ScopedParam[];
  ruleExpressionType?: 'LambdaExpression';
  errorMessage?: string;
  successEvent?: string;
  properties?: Record<string, any>;
  actions?: RuleActions;
  enabled?: boolean;
}
