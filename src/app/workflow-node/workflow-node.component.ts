import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
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
  ArrowLeft,
} from 'lucide-angular';
import { ExpressionBuilderComponent } from '../expression-builder/expression-builder.component';
import { Workflow } from '../models/workflow';
import { HttpClient } from '@angular/common/http';
import { DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContextSchemaEditorComponent } from '../context-schema-editor/context-schema-editor.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-workflow-node',
  standalone: true,
  imports: [
    CommonModule,
    RuleNodeComponent,
    LucideAngularModule,
    ExpressionBuilderComponent,
    DragDropModule,
    ContextSchemaEditorComponent,
    RouterModule,
  ],
  templateUrl: './workflow-node.component.html',
})
export class WorkflowNodeComponent implements OnInit {
  workflow: Workflow = {
    workflowName: 'New Workflow',
    globalParams: [],
    rules: [],
  };

  @Output() workflowChanged = new EventEmitter<void>();

  jsonText = '';
  showJsonModal = false;
  validationMessages: string[] = [];
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | null = null;
  isSaving = false;
  isExistingWorkflow = false;

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
  readonly ArrowLeft = ArrowLeft;

  http = inject(HttpClient);
  router = inject(Router);
  route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const workflowName = params.get('workflow');

      if (workflowName) {
        this.http
          .get<Workflow>(
            `${environment.apiUrl}/workflows/${workflowName}`,
            { withCredentials: true }
          )
          .subscribe({
            next: (wf) => {
              this.workflow = wf;
              this.workflow.globalParams ??= [];
              this.isExistingWorkflow = true;
              this.emitChange();
            },
            error: (err) => {
              console.warn('Workflow not found, using default.');
              this.resetWorkflow(); // fallback to default
              this.router.navigate([], {
                relativeTo: this.route,
                queryParams: { workflow: null },
                queryParamsHandling: 'merge',
                replaceUrl: true,
              });
            },
          });
      }
    });
  }

  get workflowName(): string {
    return this.workflow?.workflowName || 'Unnamed';
  }

  goBack() {
    this.router.navigate(['/workflows']);
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

  saveWorkflow() {
    this.validationMessages = this.validateWorkflow(this.workflow);

    if (this.validationMessages.length > 0) {
      this.alertType = 'error';
      this.alertMessage = 'Please fix validation errors before saving.';
      return;
    }

    this.isSaving = true;

    const url = this.isExistingWorkflow
      ? `${environment.apiUrl}/workflows/${this.workflow.workflowName}`
      : `${environment.apiUrl}/workflows`;

    const request = this.isExistingWorkflow
      ? this.http.put(url, this.workflow, { withCredentials: true })
      : this.http.post(url, this.workflow, { withCredentials: true });

    request.subscribe({
      next: () => {
        this.alertType = 'success';
        this.alertMessage = `Workflow '${this.workflow.workflowName}' saved successfully!`;
        this.isSaving = false;
        this.isExistingWorkflow = true; // ensure it’s flagged now

        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { workflow: this.workflow.workflowName },
          queryParamsHandling: 'merge',
        });
      },
      error: (err) => {
        console.error('Error saving workflow:', err);
        this.alertType = 'error';
        this.alertMessage = 'Failed to save workflow.';
        this.isSaving = false;
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
      const cleaned = JSON.parse(
        JSON.stringify(JSON.parse(newJson), (_, value) =>
          value === null ? undefined : value
        )
      );
      this.workflow = cleaned;
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
    this.ngOnInit();
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
