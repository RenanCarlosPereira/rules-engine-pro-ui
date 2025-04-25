import {
  Component,
  Input,
  OnChanges,
  SimpleChanges
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
  Settings2Icon
} from 'lucide-angular';

import { Workflow } from '../models/workflow.model';
import { Rule } from '../models/rule.model';
import { ExpressionBuilderComponent } from '../expression-builder/expression-builder.component';

type FieldType = 'string' | 'number' | 'boolean' | 'object';

interface JsonSchema {
  type: string;
  title?: string;
  properties?: Record<string, JsonSchema>;
}

@Component({
  standalone: true,
  selector: 'app-context-schema-editor',
  imports: [CommonModule, FormsModule, LucideAngularModule, ExpressionBuilderComponent],
  templateUrl: 'context-schema-editor.component.html',
})
export class ContextSchemaEditorComponent implements OnChanges {
  @Input({ required: true }) workflow!: Workflow;

  selectedRule: Rule | null = null;
  schema: JsonSchema | null = null;
  fieldMap: Record<string, { type: FieldType | ''; value: any }> = {};
  finalContext: any = {};

  LayoutGridIcon = LayoutGridIcon;
  FileTextIcon = FileTextIcon;
  CheckCircleIcon = CheckCircleIcon;
  Settings2Icon = Settings2Icon;
  TextCursorInputIcon = TextCursorInputIcon;

  supportedTypes: FieldType[] = ['string', 'number', 'boolean', 'object'];

  constructor(private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workflow']) {
      this.selectedRule = null;
      this.schema = null;
      this.fieldMap = {};
      this.finalContext = {};
    }
  }

  get availableRules(): { rule: Rule, depth: number }[] {
    return this.getAllRules(this.workflow);
  }
  
  private getAllRules(workflow: Workflow): { rule: Rule, depth: number }[] {
    const rules: { rule: Rule, depth: number }[] = [];
  
    const traverse = (rule: Rule, depth: number) => {
      rules.push({ rule, depth });
      if (Array.isArray(rule.Rules)) {
        for (const subRule of rule.Rules) {
          traverse(subRule, depth + 1);
        }
      }
    };
  
    for (const rule of workflow.Rules || []) {
      traverse(rule, 0);
    }
  
    return rules;
  }

  get fieldPaths(): string[] {
    return Object.keys(this.fieldMap);
  }

  
  loadSchema() {
    this.http.post<JsonSchema>('https://rules-engine-pro-api.onrender.com/identifiers', this.workflow).subscribe(data => {
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
    if (!rule || !this.schema?.properties) return;

    const fields = this.fieldMap;

    const buildFromSchema = (properties: Record<string, JsonSchema>, pathPrefix = ''): any => {
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

    const inputs = buildFromSchema(this.schema.properties);

    const payload = {
      workflow: this.workflow,
      inputs: inputs
    };

    this.http.post<Response>(`https://rules-engine-pro-api.onrender.com/execute?ruleName=${encodeURIComponent(rule.RuleName)}`, payload)
      .subscribe(response => {
        this.finalContext = response;
      });
  }

  private parseValue(type: string, value: any): any {
    switch (type) {
      case 'number': return Number(value);
      case 'boolean': return value === 'true' || value === true;
      case 'object':
        try { return JSON.parse(value); } catch { return {}; }
      default: return value;
    }
  }
}
