export interface ActionInfo {
  name: string;
  context: { [key: string]: any };
}

export interface ActionResult {
  output: any;
  exception: any;
}

export interface ActionRuleResult extends ActionResult {
  results: RuleResultTree[];
}

export enum NestedRuleExecutionMode {
  All = 0,
  Performance = 1
}

export interface Rule {
  workflowsToInject?: string;
  RuleName: string;
  expression?: string;
  Operator?: 'And' | 'Or' | null;
  rules?: Rule[];
  LocalParams?: ScopedParam[];
  ruleExpressionType?: 'LambdaExpression';
  errorMessage?: string;
  successEvent?: string;
  properties?: Record<string, any>;
  actions?: RuleActions;
  enabled?: boolean;
}

export interface RuleActions {
  onSuccess?: ActionInfo;
  onFailure?: ActionInfo;
}

export type RuleFunc<T> = (...ruleParameters: RuleParameter[]) => T;

export enum ErrorType {
  Warning = 0,
  Error = 1
}

export interface RuleExpressionParameter {
  parameterExpression?: any;
  valueExpression?: any;
}

export enum ruleExpressionType {
  LambdaExpression = 0
}

export interface RuleParameter {
  type?: any;
  name: string;
  value?: any;
  originalValue?: any;
  parameterExpression?: any;
}

export interface RuleResultTree {
  rule: Rule;
  issuccess: boolean;
  childResults?: RuleResultTree[];
  inputs?: { [key: string]: any };
  actionResult?: ActionResult;
  exceptionMessage?: string;
}

export interface RuleResultMessage {
  errormessages: string[];
  warningmessages: string[];
}

export interface ScopedParam {
  name: string;
  expression: string;
}

export interface Workflow {
  workflowName: string;
  workflowsToInject?: string[];
  globalParams?: ScopedParam[];
  rules: Rule[];
}
