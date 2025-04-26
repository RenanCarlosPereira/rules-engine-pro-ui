import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionRuleResult } from '../models/action-rule-result';
import { RuleResultTreeViewerComponent } from "../rule-result-tree-viewer/rule-result-tree-viewer.component";

@Component({
  selector: 'app-action-rule-result-viewer',
  standalone: true,
  imports: [CommonModule, RuleResultTreeViewerComponent],
  templateUrl: './action-rule-result-viewer.component.html',
})
export class ActionRuleResultViewerComponent {
  @Input() actionRuleResult!: ActionRuleResult | null;
}
