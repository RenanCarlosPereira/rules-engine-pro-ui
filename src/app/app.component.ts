import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Workflow } from './models/workflow.model';
import { WorkflowNodeComponent } from './workflow-node/workflow-node.component';
import {
  LucideAngularModule,
  GripVertical,
  LayoutDashboard,
  List,
  Menu,
} from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    WorkflowNodeComponent,
    LucideAngularModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'rules-engine-ui';
  menuOpen = false;
  userMenuOpen = false;
  GripVertical = GripVertical;
  LayoutDashboard = LayoutDashboard;
  List = List;
  Menu = Menu;

  workflow: Workflow = {
    WorkflowName: 'Your first workflow',
    GlobalParams: [],
    Rules: [
      {
        RuleName: 'Your first rule',
        Enabled: true,
        Expression: 'true',
        Rules: [],
        RuleExpressionType: 'LambdaExpression',
      },
    ],
  };
}
