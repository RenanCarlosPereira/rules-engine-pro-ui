import {
  Component,
  Input,
  OnChanges,
  signal,
  SimpleChanges,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  LucideAngularModule,
  TextCursorInputIcon,
  CheckCircleIcon,
  FileTextIcon,
  LayoutGridIcon,
  Settings2Icon,
  XIcon,
  RefreshCcwIcon,
} from 'lucide-angular';

import { Workflow } from '../models/workflow';
import { Rule } from '../models/rule';
import { ActionRuleResult } from '../models/action-rule-result';
import { ActionRuleResultViewerComponent } from '../action-rule-result-viewer/action-rule-result-viewer.component';
import { environment } from '../../environments/environment';

type FieldType = 'string' | 'number' | 'boolean' | 'object';

interface JsonSchema {
  type: string;
  title?: string;
  properties?: Record<string, JsonSchema>;
}

@Component({
  standalone: true,
  selector: 'app-context-schema-editor',
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    ActionRuleResultViewerComponent,
  ],
  templateUrl: 'context-schema-editor.component.html',
})
export class ContextSchemaEditorComponent implements OnChanges {
  @Input({ required: true }) workflow!: Workflow;

  selectedRule: Rule | null = null;
  schema: JsonSchema | null = null;
  fieldMap: Record<string, { type: FieldType | ''; value: any }> = {};
  actionRuleResult: ActionRuleResult | null = null;
  showModal = signal(false);

  LayoutGridIcon = LayoutGridIcon;
  FileTextIcon = FileTextIcon;
  CheckCircleIcon = CheckCircleIcon;
  Settings2Icon = Settings2Icon;
  TextCursorInputIcon = TextCursorInputIcon;
  XIcon = XIcon;
  RefreshCcwIcon = RefreshCcwIcon;

  supportedTypes: FieldType[] = ['string', 'number', 'boolean', 'object'];

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workflow']) {
      this.selectedRule = null;
      this.schema = null;
      this.fieldMap = {};
      this.actionRuleResult = null;
    }
  }

  get availableRules(): { rule: Rule; depth: number }[] {
    return this.getAllRules(this.workflow);
  }

  openContextModal() {
    this.logContext();
    this.showModal.set(true);
  }

  closeContextModal() {
    this.showModal.set(false);
  }

  private getAllRules(workflow: Workflow): { rule: Rule; depth: number }[] {
    const rules: { rule: Rule; depth: number }[] = [];

    const traverse = (rule: Rule, depth: number) => {
      rules.push({ rule, depth });
      if (Array.isArray(rule.rules)) {
        for (const subRule of rule.rules) {
          traverse(subRule, depth + 1);
        }
      }
    };

    for (const rule of workflow.rules || []) {
      traverse(rule, 0);
    }

    return rules;
  }

  get fieldPaths(): string[] {
    return Object.keys(this.fieldMap);
  }

  loadSchema() {
    this.http
      .post<JsonSchema>(
        `${environment.apiUrl}/workflows/identifiers`,
        this.workflow,
        { withCredentials: true }
      )
      .subscribe((data) => {
        if (!data || !data.properties) return;
        this.schema = data;
        console.log('schema data', data);
        const paths = this.extractPaths(data.properties);
        this.fieldMap = {};
        for (const path of paths) {
          this.fieldMap[path] = { type: '', value: '' };
        }
      });
  }

  extractPaths(properties: Record<string, JsonSchema>, prefix = ''): string[] {
    const paths: string[] = [];

    for (const key in properties) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      const field = properties[key];

      if (field?.type === 'object' && field.properties) {
        paths.push(...this.extractPaths(field.properties, currentPath));
      } else {
        paths.push(currentPath);
      }
    }

    return paths;
  }

  logContext() {
    const rule = this.selectedRule;

    const fields = this.fieldMap;

    const buildFromSchema = (
      properties: Record<string, JsonSchema>,
      pathPrefix = ''
    ): any => {
      const result: any = {};
      for (const key in properties) {
        const field = properties[key];
        const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;

        if (field.type === 'object' && field.properties) {
          result[key] = buildFromSchema(field.properties, fullPath);
        } else {
          const userInput = fields[fullPath];
          result[key] = this.parseValue(userInput?.type, userInput?.value);
        }
      }
      return result;
    };

    const inputs = buildFromSchema(this.schema?.properties!);

    const payload = {
      workflow: this.workflow,
      inputs: inputs,
    };

    this.http
      .post<ActionRuleResult>(`${environment.apiUrl}/workflows/execute?ruleName=${encodeURIComponent(rule?.ruleName ?? '')}`,
      payload,
      { withCredentials: true })
      .subscribe((response) => {
        this.actionRuleResult = response;
      });
  }

  private parseValue(type: string, value: any): any {
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true' || value === true;
      case 'object':
        try {
          return JSON.parse(value);
        } catch {
          return {};
        }
      default:
        return value;
    }
  }
}
