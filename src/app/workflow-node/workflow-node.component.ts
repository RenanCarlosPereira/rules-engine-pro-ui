import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RuleNodeComponent } from '../rule-node/rule-node.component';
import {
  LucideAngularModule,
  LayoutGridIcon,
  Trash2,
  Plus,
  Code,
  RotateCcw,
  FilePlus,
  FilePlusIcon,
  CodeIcon,
  WorkflowIcon,
  GripVertical,
  SettingsIcon,
} from 'lucide-angular';
import { ExpressionBuilderComponent } from '../expression-builder/expression-builder.component';
import { Workflow } from '../models/workflow';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContextSchemaEditorComponent } from '../context-schema-editor/context-schema-editor.component';

@Component({
  selector: 'app-workflow-node',
  standalone: true,
  imports: [
    CommonModule,
    RuleNodeComponent,
    LucideAngularModule,
    ExpressionBuilderComponent,
    HttpClientModule,
    DragDropModule,
    ContextSchemaEditorComponent,
  ],
  templateUrl: './workflow-node.component.html',
})
export class WorkflowNodeComponent implements OnInit {
  @Input({ required: true }) workflow!: Workflow;
  @Output() workflowChanged = new EventEmitter<void>();

  jsonText = '';
  showJsonModal = false;
  validationMessages: string[] = [];

  readonly Trash2 = Trash2;
  readonly Plus = Plus;
  readonly Code = Code;
  readonly RotateCcw = RotateCcw;
  readonly FilePlus = FilePlus;
  readonly FilePlusIcon = FilePlusIcon;
  readonly CodeIcon = CodeIcon;
  readonly WorkflowIcon = WorkflowIcon;
  readonly GripVertical = GripVertical;
  readonly LayoutGridIcon = LayoutGridIcon;
  readonly SettingsIcon = SettingsIcon;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.workflow.globalParams ??= [];
    this.emitChange();
  }

  loadSampleWorkflow() {
    this.http.get<Workflow>('assets/sample-workflow.json').subscribe({
      next: (data) => {
        console.log(data);
        this.workflow = data;
        this.workflow.globalParams ??= [];
        this.emitChange();
      },
      error: (err) => {
        console.error('Failed to load sample workflow:', err);
      },
    });
  }

  validateWorkflow(workflow: Workflow): string[] {
    const errors: string[] = [];

    // Rule 1: workflowName must not be empty
    if (!workflow.workflowName?.trim()) {
      errors.push('Workflow name must not be empty.');
    }

    const hasRules = workflow.rules?.length > 0;

    // Rule 2: If no rules, then workflowsToInject must not be empty
    if (
      !hasRules &&
      (!workflow.workflowsToInject || workflow.workflowsToInject.length === 0)
    ) {
      errors.push('Workflow must have either rules or injected workflows.');
    }

    // Rule 3: If rules exist, validate each rule
    if (hasRules) {
      for (const rule of workflow.rules!) {
        const ruleNode = new RuleNodeComponent(); // Dummy to use validateRule
        ruleNode.rule = rule;
        const ruleErrors = ruleNode.validateRule(rule);
        if (ruleErrors.length) {
          errors.push(...ruleErrors.map((e) => `[${rule.ruleName}] → ${e}`));
          break; // early return on first error
        }
      }
    }

    return errors;
  }

  updateWorkflowName(name: string) {
    this.workflow.workflowName = name;
    this.emitChange();
  }

  toggleModal() {
    this.showJsonModal = !this.showJsonModal;
  }

  emitChange() {
    this.workflowChanged.emit();
    this.jsonText = JSON.stringify(this.workflow, null, 2);
    this.validationMessages = this.validateWorkflow(this.workflow);
  }

  applyJsonChanges(newJson: string) {
    try {
      const parsed = JSON.parse(newJson);
      this.workflow = parsed;
      this.workflow.globalParams ??= [];
      this.emitChange();
    } catch (error) {
      console.error('Invalid JSON:', error);
    }

  }

  addGlobalParam() {
    this.workflow.globalParams ??= [];
    this.workflow.globalParams.push({ name: '', expression: '' });
    this.emitChange();
  }

  deleteGlobalParam(index: number) {
    this.workflow.globalParams?.splice(index, 1);
    this.emitChange();
  }

  updateGlobalParamName(index: number, value: string) {
    if (this.workflow.globalParams) {
      this.workflow.globalParams[index].name = value;
      this.emitChange();
    }
  }

  updateGlobalParamExpression(index: number, value: string) {
    if (this.workflow.globalParams) {
      this.workflow.globalParams[index].expression = value;
      this.emitChange();
    }
  }

  addRootRule() {
    this.workflow.rules ??= [];
    this.workflow.rules.push({
      ruleName: 'New Rule',
      enabled: true,
      operator: null,
      expression: 'true',
      rules: [],
    });
    this.emitChange();
  }

  resetWorkflow() {
    this.workflow = {
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
    this.emitChange();
  }

  reorderRules(event: any) {
    moveItemInArray(
      this.workflow.rules,
      event.previousIndex,
      event.currentIndex
    );
    this.emitChange();
  }
}
