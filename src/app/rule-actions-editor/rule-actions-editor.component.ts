import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Rule } from '../models/rule';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Trash2, Plus } from 'lucide-angular';

@Component({
  selector: 'app-rule-actions-editor',
  templateUrl: './rule-actions-editor.component.html',
  imports: [CommonModule, LucideAngularModule],
})
export class RuleActionsEditorComponent {
  @Input({ required: true }) rule!: Rule;
  @Input() onClose: () => void = () => { this.cdr.detectChanges();};
  Trash2 = Trash2;
  Plus = Plus;

  constructor(private cdr: ChangeDetectorRef) {}

  updateActionName(type: 'onSuccess' | 'onFailure', name: string) {
    this.rule.actions ??= {};
    this.rule.actions[type] ??= { name: '', context: {} };
    this.rule.actions[type]!.name = name;
  }

  addAction(type: 'onSuccess' | 'onFailure') {
    this.rule.actions ??= {};
    this.rule.actions[type] = { name: '', context: {} };
  }

  removeAction(type: 'onSuccess' | 'onFailure') {
    delete this.rule.actions?.[type];
  }

  getContextKeys(type: 'onSuccess' | 'onFailure'): string[] {
    return Object.keys(this.rule.actions?.[type]?.context || {});
  }

  updateContextValue(
    type: 'onSuccess' | 'onFailure',
    key: string,
    value: string
  ) {
    this.rule.actions?.[type]?.context &&
      (this.rule.actions[type]!.context[key] = value);
  }

  addContextEntry(type: 'onSuccess' | 'onFailure') {
    this.rule.actions ??= {};
    this.rule.actions[type] ??= { name: '', context: {} };
    this.rule.actions![type]!.context![''] = '';
  }

  deleteContextEntry(type: 'onSuccess' | 'onFailure', key: string) {
    delete this.rule.actions?.[type]?.context?.[key];
  }

  onContextKeyBlur(
    type: 'onSuccess' | 'onFailure',
    index: number,
    newKey: string
  ) {
    const context = this.rule.actions?.[type]?.context;
    if (!context) return;

    const keys = Object.keys(context);
    const oldKey = keys[index];
    const value = context[oldKey];
    if (newKey !== oldKey) {
      delete context[oldKey];
      context[newKey] = value;
    }
  }
}
