import { ActionInfo } from "./action-info.model";


export interface RuleActions {
  OnSuccess?: ActionInfo;
  OnFailure?: ActionInfo;
}
