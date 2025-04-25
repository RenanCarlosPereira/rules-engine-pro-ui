import { Component, Input } from '@angular/core';
import { Rule } from '../models/rule.model';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Trash2, Plus } from 'lucide-angular';

@Component({
  selector: 'app-rule-actions-editor',
  templateUrl: './rule-actions-editor.component.html',
  imports: [CommonModule, LucideAngularModule],
})
export class RuleActionsEditorComponent {
  @Input({ required: true }) rule!: Rule;
  @Input() onClose: () => void = () => {};
  Trash2 = Trash2;
  Plus = Plus;

  updateActionName(type: 'OnSuccess' | 'OnFailure', name: string) {
    this.rule.Actions ??= {};
    this.rule.Actions[type] ??= { Name: '', Context: {} };
    this.rule.Actions[type]!.Name = name;
  }

  addAction(type: 'OnSuccess' | 'OnFailure') {
    this.rule.Actions ??= {};
    this.rule.Actions[type] = { Name: '', Context: {} };
  }

  removeAction(type: 'OnSuccess' | 'OnFailure') {
    delete this.rule.Actions?.[type];
  }

  getContextKeys(type: 'OnSuccess' | 'OnFailure'): string[] {
    return Object.keys(this.rule.Actions?.[type]?.Context || {});
  }

  updateContextValue(
    type: 'OnSuccess' | 'OnFailure',
    key: string,
    value: string
  ) {
    this.rule.Actions?.[type]?.Context &&
      (this.rule.Actions[type]!.Context[key] = value);
  }

  addContextEntry(type: 'OnSuccess' | 'OnFailure') {
    this.rule.Actions ??= {};
    this.rule.Actions[type] ??= { Name: '', Context: {} };
    this.rule.Actions![type]!.Context![''] = '';
  }

  deleteContextEntry(type: 'OnSuccess' | 'OnFailure', key: string) {
    delete this.rule.Actions?.[type]?.Context?.[key];
  }

  onContextKeyBlur(
    type: 'OnSuccess' | 'OnFailure',
    index: number,
    newKey: string
  ) {
    const context = this.rule.Actions?.[type]?.Context;
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
