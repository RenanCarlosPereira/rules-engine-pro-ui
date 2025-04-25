import {
  Component,
  Input,
  Output,
  EventEmitter,
  PLATFORM_ID,
  Inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CodeEditor } from '@acrodata/code-editor';
import { languages as allLanguages } from '@codemirror/language-data';
import { LanguageDescription } from '@codemirror/language';

export type SetupMode = 'basic' | 'minimal' | null;

@Component({
  selector: 'app-expression-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, CodeEditor],
  templateUrl: './expression-builder.component.html',
})
export class ExpressionBuilderComponent implements OnChanges {
  @Input() value = '';
  @Input() class = 'w-full min-h-[120px] rounded border';
  @Output() valueChange = new EventEmitter<string>();

  @Input() languageName: string = 'C#';
  @Input() setup: SetupMode = 'basic';
  @Input() lineWrapping = true;

  languageDesc: LanguageDescription | undefined;
  languages: LanguageDescription[] = [];

  isBrowser = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['languageName']) {
      this.setLanguage(this.languageName);
    }
  }

  private setLanguage(name: string) {
    const lang = allLanguages.find(
      (l) => l.name.toLowerCase() === name.toLowerCase()
    );
    if (lang) {
      this.languageDesc = lang;
      this.languages = [lang];
    }
  }

  onCodeChange(newValue: string) {
    this.value = newValue;
    this.valueChange.emit(newValue);
  }
}
