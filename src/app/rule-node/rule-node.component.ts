import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Rule } from '../models/rule.model';
import {
  LucideAngularModule,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  GripVertical,
  CheckCircleIcon,
} from 'lucide-angular';
import { DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ExpressionBuilderComponent } from '../expression-builder/expression-builder.component';
import { RuleActionsEditorComponent } from '../rule-actions-editor/rule-actions-editor.component';

@Component({
  selector: 'app-rule-node',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    LucideAngularModule,
    ExpressionBuilderComponent,
    RuleActionsEditorComponent,
  ],
  templateUrl: './rule-node.component.html',
})
export class RuleNodeComponent implements OnInit {
  @Input({ required: true }) rule!: Rule;
  @Input() parentRules?: Rule[];
  @Input() indexInParent?: number;
  @Output() ruleChanged = new EventEmitter<void>();

  showActionsModal = false;
  isExpanded = false;
  confirmingOperatorClear = false;
  pendingOperator: Rule['Operator'] | null = null;
  validationErrors: string[] = [];

  readonly Trash2 = Trash2;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly Plus = Plus;
  readonly GripVertical = GripVertical;
  readonly CheckCircleIcon = CheckCircleIcon;

  readonly operatorOptions = ['And', 'Or'] as const;

  get isGroupRule(): boolean {
    return this.rule.Operator !== null && Array.isArray(this.rule.Rules);
  }

  ngOnInit() {
    this.rule.LocalParams ??= [];
    this.rule.Actions ??= {};
    this.rule.Properties ??= {};
    this.rule.RuleExpressionType ??= 'LambdaExpression';
  }

  emitChange() {
    const errors = this.validateRule(this.rule);
    this.validationErrors = errors;
    this.ruleChanged.emit();
  }

  toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  toggleEnabled() {
    this.rule.Enabled = !this.rule.Enabled;
    this.emitChange();
  }

  closeActionsModal() {
    this.showActionsModal = false;
  }

  validateRule(rule: Rule): string[] {
    const errors: string[] = [];

    // Regra 1: RuleName não pode estar vazio
    if (!rule.RuleName?.trim()) {
      errors.push('Rule name must not be empty.');
    }

    const nestedOperators = ['And', 'Or'];

    if (rule.Operator != null) {
      // Regra 2: Operator deve ser um dos operadores válidos
      if (!nestedOperators.includes(rule.Operator)) {
        errors.push('Invalid operator. Must be one of: And, Or.');
      }

      // Regra 3: Se não tiver regras internas, deve ter WorkflowsToInject
      if (!rule.Rules?.length) {
        if (!rule.WorkflowsToInject?.length) {
          errors.push('Cannot use an operator without rules.');
        }
      } else {
        // Validação recursiva das sub-regras
        for (const subRule of rule.Rules) {
          const subErrors = this.validateRule(subRule);
          if (subErrors.length) {
            errors.push(...subErrors.map((e) => `[${rule.RuleName}] → ${e}`));
            break; // para após encontrar o primeiro erro em sub-regras
          }
        }
      }
    } else {
      // Regra 4: Se não tiver operador, deve ter expressão (caso tipo seja LambdaExpression)
      if (rule.RuleExpressionType === 'LambdaExpression') {
        if (!rule.Expression?.trim()) {
          errors.push(
            'Expression must not be empty for LambdaExpression rules.'
          );
        }

        if (rule.Rules?.length) {
          errors.push('Operator is null, so nested rules must be empty.');
        }
      }
    }

    return errors;
  }

  setOperator(op: Rule['Operator'] | null) {
    if (op === null && this.rule.Rules?.length) {
      this.pendingOperator = op;
      this.confirmingOperatorClear = true;
      return;
    }
    this.rule.Operator = op;
    if (op === null) {
      this.rule.Expression = '';
      delete this.rule.Rules;
    } else {
      delete this.rule.Expression;
      this.rule.Rules ??= [];
    }
    this.emitChange();
  }

  confirmOperatorChange() {
    this.confirmingOperatorClear = false;
    this.rule.Operator = this.pendingOperator;
    delete this.rule.Rules;
    this.emitChange();
  }

  cancelOperatorChange() {
    this.confirmingOperatorClear = false;
    this.pendingOperator = null;
  }

  addChildRule() {
    this.rule.Rules ??= [];
    this.rule.Rules.push({
      RuleName: 'New Rule',
      Expression: '',
      Enabled: true,
    });
    this.emitChange();
  }

  deleteThisRule() {
    if (this.parentRules && this.indexInParent !== undefined) {
      this.parentRules.splice(this.indexInParent, 1);
      this.emitChange();
    }
  }

  addLocalParam() {
    this.rule.LocalParams ??= [];
    this.rule.LocalParams.push({ Name: '', Expression: '' });
    this.emitChange();
  }

  deleteLocalParam(index: number) {
    this.rule.LocalParams?.splice(index, 1);
    this.emitChange();
  }

  updateLocalParamName(index: number, value: string) {
    this.rule.LocalParams![index].Name = value;
    this.emitChange();
  }

  updateLocalParamExpression(index: number, value: string) {
    this.rule.LocalParams![index].Expression = value;
    this.emitChange();
  }

  addAction(type: 'OnSuccess' | 'OnFailure') {
    this.rule.Actions![type] = { Name: '', Context: {} };
    this.emitChange();
  }

  removeAction(type: 'OnSuccess' | 'OnFailure') {
    delete this.rule.Actions![type];
    this.emitChange();
  }

  updateActionName(type: 'OnSuccess' | 'OnFailure', name: string) {
    this.rule.Actions![type]!.Name = name;
    this.emitChange();
  }

  getContextKeys(type: 'OnSuccess' | 'OnFailure'): string[] {
    return Object.keys(this.rule.Actions?.[type]?.Context ?? {});
  }

  addContextEntry(type: 'OnSuccess' | 'OnFailure') {
    this.rule.Actions![type]!.Context![''] = '';
    this.emitChange();
  }

  updateContextKey(
    type: 'OnSuccess' | 'OnFailure',
    index: number,
    newKey: string
  ) {
    const context = this.rule.Actions![type]!.Context!;
    const oldKey = Object.keys(context)[index];
    const value = context[oldKey];
    delete context[oldKey];
    context[newKey] = value;
    this.emitChange();
  }

  updateContextValue(
    type: 'OnSuccess' | 'OnFailure',
    key: string,
    value: string
  ) {
    this.rule.Actions![type]!.Context![key] = value;
    this.emitChange();
  }

  deleteContextEntry(type: 'OnSuccess' | 'OnFailure', key: string) {
    delete this.rule.Actions![type]!.Context![key];
    this.emitChange();
  }

  onContextKeyBlur(
    type: 'OnSuccess' | 'OnFailure',
    index: number,
    newKey: string
  ) {
    const context = this.rule.Actions![type]!.Context!;
    const oldKey = Object.keys(context)[index];
    if (oldKey !== newKey && newKey.trim()) {
      const value = context[oldKey];
      delete context[oldKey];
      context[newKey] = value;
      this.emitChange();
    }
  }

  dropRule(event: any) {
    moveItemInArray(this.rule.Rules!, event.previousIndex, event.currentIndex);
    this.emitChange();
  }
}
