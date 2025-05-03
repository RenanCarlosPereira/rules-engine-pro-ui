import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Rule } from '../models/rule';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Trash2, Plus } from 'lucide-angular';
import { ActionDefinitionService } from '../services/action-definition.service';
import { FieldDefinition } from '../models/action-info.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-rule-actions-editor',
  templateUrl: './rule-actions-editor.component.html',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
})
export class RuleActionsEditorComponent implements OnInit {
  @Input({ required: true }) rule!: Rule;
  @Input() onClose: () => void = () => {
    this.cdr.detectChanges();
  };

  Trash2 = Trash2;
  Plus = Plus;

  actionDefinitions: Record<string, Record<string, FieldDefinition>> = {};
  actionNames: string[] = [];

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly actionService: ActionDefinitionService
  ) {}

  ngOnInit(): void {
    this.actionService.getContextDefinitions().subscribe((arrayDefs) => {
      this.actionDefinitions = Object.fromEntries(
        arrayDefs.map((entry) => [entry.key, entry.value])
      );
      this.actionNames = Object.keys(this.actionDefinitions);
      this.cdr.detectChanges();
    });
  }

  onSelectAction(type: 'onSuccess' | 'onFailure', actionName: string) {
    this.rule.actions ??= {};
    const currentAction = this.rule.actions[type];

    const isSameAction = currentAction?.name === actionName;

    this.rule.actions[type] = {
      name: actionName,
      context:
        isSameAction && currentAction?.context
          ? currentAction.context
          : Object.fromEntries(
              Object.entries(this.actionDefinitions[actionName] ?? {}).map(
                ([key, def]) => [key, def.defaultValue ?? '']
              )
            ),
    };
  }

  updateActionName(type: 'onSuccess' | 'onFailure', name: string) {
    this.rule.actions ??= {};
    this.rule.actions[type] ??= { name: '', context: {} };
    this.rule.actions[type].name = name;
  }

  addAction(type: 'onSuccess' | 'onFailure') {
    this.rule.actions ??= {};
    this.rule.actions[type] = { name: '', context: {} };
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
      (this.rule.actions[type].context[key] = value);
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
