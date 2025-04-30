import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./workflow-list/workflow-list.component')
      .then(m => m.WorkflowListComponent)
  },
  {
    path: 'workflows',
    loadComponent: () => import('./workflow-list/workflow-list.component')
      .then(m => m.WorkflowListComponent)
  },
  {
    path: 'workflows/editor',
    loadComponent: () => import('./workflow-node/workflow-node.component')
      .then(m => m.WorkflowNodeComponent)
  }
];
