import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Workflow } from "./models/workflow.model";
import { WorkflowNodeComponent } from "./workflow-node/workflow-node.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ReactiveFormsModule, WorkflowNodeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'rules-engine-ui';

  workflow: Workflow = {
    WorkflowName: 'Your first workflow',
    GlobalParams: [],
    Rules: [
      {
        RuleName: "Your first rule",
        Enabled: true,
        Expression: "true",
        Rules: [],
        RuleExpressionType: "LambdaExpression"
      }]
  }
}
