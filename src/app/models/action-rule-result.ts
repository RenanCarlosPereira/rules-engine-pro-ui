import { RuleResultTree } from "./rule-result-tree";
import { ActionResult } from "./action-result";


export interface ActionRuleResult extends ActionResult {
  results: RuleResultTree[];
}
