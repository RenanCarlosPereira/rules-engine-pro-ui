import { ScopedParam } from "./scoped-param.model";
import { RuleActions } from "./rule-actions.model";


export interface Rule {
  WorkflowsToInject?: string;
  RuleName: string;
  Expression?: string;
  Operator?: 'And' | 'Or' | null;
  Rules?: Rule[];
  LocalParams?: ScopedParam[];
  RuleExpressionType?: 'LambdaExpression';
  ErrorMessage?: string;
  SuccessEvent?: string;
  Properties?: Record<string, any>;
  Actions?: RuleActions;
  Enabled?: boolean;
}
