import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RuleNodeComponent } from '../rule-node/rule-node.component';
import { LucideAngularModule, LayoutGridIcon, Trash2, Plus, Code, RotateCcw, FilePlus, FilePlusIcon, CodeIcon, WorkflowIcon, GripVertical, SettingsIcon } from 'lucide-angular';
import { ExpressionBuilderComponent } from '../expression-builder/expression-builder.component';
import { Workflow } from '../models/workflow.model';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContextSchemaEditorComponent } from "../context-schema-editor/context-schema-editor.component";

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
    ContextSchemaEditorComponent
  ],
  templateUrl: './workflow-node.component.html',
})
export class WorkflowNodeComponent implements OnInit {
  @Input({ required: true }) workflow!: Workflow;

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

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.workflow.GlobalParams ??= [];
    this.syncJsonText();
  }

  loadSampleWorkflow() {
    this.http.get<Workflow>('assets/sample-workflow.json').subscribe({
      next: (data) => {
        this.workflow = data;
        this.workflow.GlobalParams ??= [];
        this.syncJsonText();
      },
      error: (err) => {
        console.error('Failed to load sample workflow:', err);
      }
    });
  }

  validateWorkflow(workflow: Workflow): string[] {
    const errors: string[] = [];
  
    // Rule 1: WorkflowName must not be empty
    if (!workflow.WorkflowName?.trim()) {
      errors.push("Workflow name must not be empty.");
    }
  
    const hasRules = workflow.Rules?.length > 0;
  
    // Rule 2: If no rules, then WorkflowsToInject must not be empty
    if (!hasRules && (!workflow.WorkflowsToInject || workflow.WorkflowsToInject.length === 0)) {
      errors.push("Workflow must have either rules or injected workflows.");
    }
  
    // Rule 3: If rules exist, validate each rule
    if (hasRules) {
      for (const rule of workflow.Rules!) {
        const ruleNode = new RuleNodeComponent(); // Dummy to use validateRule
        ruleNode.rule = rule;
        const ruleErrors = ruleNode.validateRule(rule);
        if (ruleErrors.length) {
          errors.push(...ruleErrors.map(e => `[${rule.RuleName}] → ${e}`));
          break; // early return on first error
        }
      }
    }
  
    return errors;
  }

  updateWorkflowName(name: string) {
    this.workflow.WorkflowName = name;
    this.syncJsonText();
  }

  toggleModal() {
    this.showJsonModal = !this.showJsonModal;
  }

  syncJsonText() {
    this.jsonText = JSON.stringify(this.workflow, null, 2);
    this.validationMessages = this.validateWorkflow(this.workflow);
  }

  applyJsonChanges(newJson: string) {
    try {
      const parsed = JSON.parse(newJson);
      this.workflow = parsed;
      this.workflow.GlobalParams ??= [];
      this.syncJsonText();
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  }

  addGlobalParam() {
    this.workflow.GlobalParams ??= [];
    this.workflow.GlobalParams.push({ Name: '', Expression: '' });
    this.syncJsonText();
  }

  deleteGlobalParam(index: number) {
    this.workflow.GlobalParams?.splice(index, 1);
    this.syncJsonText();
  }

  updateGlobalParamName(index: number, value: string) {
    if (this.workflow.GlobalParams) {
      this.workflow.GlobalParams[index].Name = value;
      this.syncJsonText();
    }
  }

  updateGlobalParamExpression(index: number, value: string) {
    if (this.workflow.GlobalParams) {
      this.workflow.GlobalParams[index].Expression = value;
      this.syncJsonText();
    }
  }

  addRootRule() {
    this.workflow.Rules ??= [];
    this.workflow.Rules.push({
      RuleName: 'New Rule',
      Enabled: true,
      Operator: null,
      Expression: "true",
      Rules: [],
    });
    this.syncJsonText();
  }

  resetWorkflow() {
    this.workflow = {
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
    this.syncJsonText();
  }

  reorderRules(event: any) {
    moveItemInArray(this.workflow.Rules, event.previousIndex, event.currentIndex);
    this.syncJsonText();
  }
}
