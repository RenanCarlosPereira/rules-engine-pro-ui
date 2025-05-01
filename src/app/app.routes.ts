import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./workflow-list/workflow-list.component').then(m => m.WorkflowListComponent)
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'workflows',
    canActivate: [authGuard],
    loadComponent: () => import('./workflow-list/workflow-list.component').then(m => m.WorkflowListComponent)
  },
  {
    path: 'workflows/editor',
    canActivate: [authGuard],
    loadComponent: () => import('./workflow-node/workflow-node.component').then(m => m.WorkflowNodeComponent)
  }
];
