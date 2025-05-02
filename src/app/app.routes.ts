import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './core/layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { 
        path: '',
        loadComponent: () => import('./workflow-list/workflow-list.component').then(m => m.WorkflowListComponent) },
      {
        path: 'workflows',
        loadComponent: () => import('./workflow-list/workflow-list.component').then(m => m.WorkflowListComponent)
      },
      {
        path: 'workflows/editor',
        loadComponent: () => import('./workflow-node/workflow-node.component').then(m => m.WorkflowNodeComponent)
      }
    ]
  },
  
  // Public routes
  {
    path: 'login',
    component: LoginComponent,
  }
];
