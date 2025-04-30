import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Workflow } from '../models/workflow'; // Adjust path as needed
import {
  LucideAngularModule,
  Trash2,
  Edit,
  Inbox,
  WorkflowIcon,
  Loader,
  Plus,
} from 'lucide-angular';

@Component({
  selector: 'app-workflow-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './workflow-list.component.html',
})
export class WorkflowListComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  workflows: Workflow[] = [];
  loading = true;
  error: string | null = null;
  skip = 0;
  take = 12;
  hasMore = true;

  confirmDeleteWorkflow: Workflow | null = null;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' | null = null;

  Trash2 = Trash2;
  Edit = Edit;
  Inbox = Inbox;
  WorkflowIcon = WorkflowIcon;
  Loader = Loader;
  Plus = Plus;

  ngOnInit(): void {
    this.loadWorkflows();
  }

  createNewWorkflow(): void {
    this.router.navigate(['workflows/editor']);
  }

  loadWorkflows(): void {
    this.loading = true;
    this.http
      .get<Workflow[]>(
        `https://rules-engine-pro-api.onrender.com/workflows?skip=${this.skip}&take=${this.take}`
      )
      .subscribe({
        next: (data) => {
          this.workflows = data;
          this.hasMore = data.length === this.take;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load workflows:', err);
          this.error = 'Failed to load workflows. Please try again later.';
          this.loading = false;
        },
      });
  }

  nextPage(): void {
    this.skip += this.take;
    this.loadWorkflows();
  }

  previousPage(): void {
    this.skip = Math.max(0, this.skip - this.take);
    this.loadWorkflows();
  }

  editWorkflow(workflow: Workflow): void {
    this.router.navigate(['workflows/editor'], {
      queryParams: { workflow: workflow.workflowName },
    });
  }

  deleteWorkflow(workflow: Workflow): void {
    this.confirmDeleteWorkflow = workflow;
  }

  confirmDeletion(): void {
    if (!this.confirmDeleteWorkflow) return;

    const name = this.confirmDeleteWorkflow.workflowName;

    this.http
      .delete(`https://rules-engine-pro-api.onrender.com/workflows/${name}`)
      .subscribe({
        next: () => {
          this.workflows = this.workflows.filter(
            (wf) => wf.workflowName !== name
          );
          this.confirmDeleteWorkflow = null;
          this.showToast(`Workflow "${name}" deleted successfully.`, 'success');
        },
        error: (err) => {
          console.error('Failed to delete workflow:', err);
          this.showToast('Failed to delete workflow.', 'error');
        },
      });
  }

  cancelDeletion(): void {
    this.confirmDeleteWorkflow = null;
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toastMessage = message;
    this.toastType = type;
    setTimeout(() => {
      this.toastMessage = null;
      this.toastType = null;
    }, 3000);
  }
}
