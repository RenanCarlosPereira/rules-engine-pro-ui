import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Rule } from '../../models/rule';
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
import { ExpressionBuilderComponent } from '../../expression-builder/expression-builder.component';
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
  pendingOperator: Rule['operator'] | null = null;
  validationErrors: string[] = [];

  readonly Trash2 = Trash2;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly Plus = Plus;
  readonly GripVertical = GripVertical;
  readonly CheckCircleIcon = CheckCircleIcon;

  readonly operatorOptions = ['And', 'Or'] as const;

  get isGroupRule(): boolean {
    return this.rule.operator !== null && Array.isArray(this.rule.rules);
  }

  ngOnInit() {
    this.rule.localParams ??= [];
    this.rule.actions ??= {};
    this.rule.properties ??= {};
    this.rule.ruleExpressionType ??= 'LambdaExpression';
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
    this.rule.enabled = !this.rule.enabled;
    this.emitChange();
  }

  closeActionsModal() {
    this.showActionsModal = false;
    this.emitChange();
  }

  validateRule(rule: Rule): string[] {
    const errors: string[] = [];

    // Regra 1: RuleName não pode estar vazio
    if (!rule.ruleName?.trim()) {
      errors.push('Rule name must not be empty.');
    }

    const nestedOperators = ['And', 'Or'];

    if (rule.operator != null) {
      // Regra 2: Operator deve ser um dos operadores válidos
      if (!nestedOperators.includes(rule.operator)) {
        errors.push('Invalid operator. Must be one of: And, Or.');
      }

      // Regra 3: Se não tiver regras internas, deve ter workflowsToInject
      if (!rule.rules?.length) {
        if (!rule.workflowsToInject?.length) {
          errors.push('Cannot use an operator without rules.');
        }
      } else {
        // Validação recursiva das sub-regras
        for (const subRule of rule.rules) {
          const subErrors = this.validateRule(subRule);
          if (subErrors.length) {
            errors.push(...subErrors.map((e) => `[${rule.ruleName}] → ${e}`));
            break; // para após encontrar o primeiro erro em sub-regras
          }
        }
      }
    } else {
      // Regra 4: Se não tiver operador, deve ter expressão (caso tipo seja LambdaExpression)
      if (rule.ruleExpressionType === 'LambdaExpression') {
        if (!rule.expression?.trim()) {
          errors.push(
            'expression must not be empty for LambdaExpression rules.'
          );
        }

        if (rule.rules?.length) {
          errors.push('Operator is null, so nested rules must be empty.');
        }
      }
    }

    return errors;
  }

  setOperator(op: Rule['operator'] | null) {
    if (op === null && this.rule.rules?.length) {
      this.pendingOperator = op;
      this.confirmingOperatorClear = true;
      return;
    }
    this.rule.operator = op;
    if (op === null) {
      this.rule.expression = '';
      delete this.rule.rules;
    } else {
      delete this.rule.expression;
      this.rule.rules ??= [];
    }
    this.emitChange();
  }

  confirmOperatorChange() {
    this.confirmingOperatorClear = false;
    this.rule.operator = this.pendingOperator;
    delete this.rule.rules;
    this.emitChange();
  }

  cancelOperatorChange() {
    this.confirmingOperatorClear = false;
    this.pendingOperator = null;
  }

  addChildRule() {
    this.rule.rules ??= [];
    this.rule.rules.push({
      ruleName: 'New Rule',
      expression: '',
      enabled: true,
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
    this.rule.localParams ??= [];
    this.rule.localParams.push({ name: '', expression: '' });
    this.emitChange();
  }

  deleteLocalParam(index: number) {
    this.rule.localParams?.splice(index, 1);
    this.emitChange();
  }

  updateLocalParamName(index: number, value: string) {
    this.rule.localParams![index].name = value;
    this.emitChange();
  }

  updateLocalParamExpression(index: number, value: string) {
    this.rule.localParams![index].expression = value;
    this.emitChange();
  }

  addAction(type: 'onSuccess' | 'onFailure') {
    this.rule.actions![type] = { name: '', context: {} };
    this.emitChange();
  }

  removeAction(type: 'onSuccess' | 'onFailure') {
    delete this.rule.actions![type];
    this.emitChange();
  }

  updateActionName(type: 'onSuccess' | 'onFailure', name: string) {
    this.rule.actions![type]!.name = name;
    this.emitChange();
  }

  getcontextKeys(type: 'onSuccess' | 'onFailure'): string[] {
    return Object.keys(this.rule.actions?.[type]?.context ?? {});
  }

  addcontextEntry(type: 'onSuccess' | 'onFailure') {
    this.rule.actions![type]!.context![''] = '';
    this.emitChange();
  }

  updatecontextKey(
    type: 'onSuccess' | 'onFailure',
    index: number,
    newKey: string
  ) {
    const context = this.rule.actions![type]!.context!;
    const oldKey = Object.keys(context)[index];
    const value = context[oldKey];
    delete context[oldKey];
    context[newKey] = value;
    this.emitChange();
  }

  updatecontextValue(
    type: 'onSuccess' | 'onFailure',
    key: string,
    value: string
  ) {
    this.rule.actions![type]!.context![key] = value;
    this.emitChange();
  }

  deletecontextEntry(type: 'onSuccess' | 'onFailure', key: string) {
    delete this.rule.actions![type]!.context![key];
    this.emitChange();
  }

  oncontextKeyBlur(
    type: 'onSuccess' | 'onFailure',
    index: number,
    newKey: string
  ) {
    const context = this.rule.actions![type]!.context!;
    const oldKey = Object.keys(context)[index];
    if (oldKey !== newKey && newKey.trim()) {
      const value = context[oldKey];
      delete context[oldKey];
      context[newKey] = value;
      this.emitChange();
    }
  }

  dropRule(event: any) {
    moveItemInArray(this.rule.rules!, event.previousIndex, event.currentIndex);
    this.emitChange();
  }
}
