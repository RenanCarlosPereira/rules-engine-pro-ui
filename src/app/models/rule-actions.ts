import { ActionInfo } from './action-info.model';

export interface RuleActions {
  onSuccess?: ActionInfo;
  onFailure?: ActionInfo;
}
