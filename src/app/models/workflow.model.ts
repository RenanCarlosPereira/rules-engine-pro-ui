import { ScopedParam } from "./scoped-param.model";
import { Rule } from "./rule.model";


export interface Workflow {
  WorkflowName: string;
  WorkflowsToInject?: string[];
  GlobalParams?: ScopedParam[];
  Rules: Rule[];
}
