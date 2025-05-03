import { ActionDefinition } from './../models/action-info.model';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ActionDefinitionService {
  constructor(private readonly http: HttpClient) {}

  getContextDefinitions() {
    return this.http.get<ActionDefinition[]>(
      `${environment.apiUrl}/action/context-definitions`
    );
  }
}
