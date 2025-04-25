import { ActionResult } from "./action-result";
import { Rule } from "./rule";


export interface RuleResultTree {
  rule: Rule;
  isSuccess: boolean;
  childResults?: RuleResultTree[];
  inputs?: { [key: string]: any; };
  actionResult?: ActionResult;
  exceptionMessage?: string;
}
