import { Component, inject, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Workflow } from './models/workflow';
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
    LucideAngularModule,
    RouterOutlet,
    RouterModule
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
    workflowName: 'Your first workflow',
    globalParams: [],
    rules: [
      {
        ruleName: 'Your first rule',
        enabled: true,
        expression: 'true',
        rules: [],
        ruleExpressionType: 'LambdaExpression',
      },
    ],
  };
}
