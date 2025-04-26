import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RuleResultTree } from '../models/rule-result-tree';
import {
  AlertTriangleIcon,
  BracketsIcon,
  BugIcon,
  Code2Icon,
  ListTreeIcon,
  LucideAngularModule,
  TerminalIcon,
} from 'lucide-angular';`
`
@Component({
  selector: 'app-rule-result-tree-viewer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule,],
  templateUrl: './rule-result-tree-viewer.component.html',
})
export class RuleResultTreeViewerComponent {
  @Input() resultTree!: RuleResultTree;

  BugIcon = BugIcon
  TerminalIcon = TerminalIcon
  AlertTriangleIcon= AlertTriangleIcon
  ListTreeIcon = ListTreeIcon
  Code2Icon = Code2Icon
  BracketsIcon = BracketsIcon

  isExpanded = signal(true);
  showInputs = signal(false); // new!

  toggleExpanded() {
    this.isExpanded.update(v => !v);
  }

  toggleInputs() {
    this.showInputs.update(v => !v);
  }

  flattenObject(obj: any, prefix: string = ''): { key: string, value: any }[] {
    let entries: { key: string, value: any }[] = [];

    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;

      const fullPath = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];

      if (typeof value === 'object' && value !== null) {
        entries = entries.concat(this.flattenObject(value, fullPath));
      } else {
        entries.push({ key: fullPath, value });
      }
    }

    return entries;
  }

  getTypeIcon(value: any): string {
    if (Array.isArray(value)) return '🧩';
    if (typeof value === 'object') return '🧩';
    if (typeof value === 'string') return '🔤';
    if (typeof value === 'number') return '🔢';
    if (typeof value === 'boolean') return value ? '✅' : '❌';
    return '❓';
  }
}
