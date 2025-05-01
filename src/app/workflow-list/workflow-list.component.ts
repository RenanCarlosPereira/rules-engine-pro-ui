import { Component, OnInit, inject, signal } from '@angular/core';
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
  ChevronRight,
  ChevronLeft,
} from 'lucide-angular';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-workflow-list',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './workflow-list.component.html',
})
export class WorkflowListComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private searchChanged$ = new Subject<string>();

  workflows: Workflow[] = [];
  loading = true;
  error: string | null = null;
  search = signal('');
  skip = signal(0);
  take = signal(12);
  hasMore = signal(true);

  confirmDeleteWorkflow: Workflow | null = null;
  toastMessage: string | null = null;
  toastType: 'success' | 'error' | null = null;

  Trash2 = Trash2;
  Edit = Edit;
  Inbox = Inbox;
  WorkflowIcon = WorkflowIcon;
  Loader = Loader;
  Plus = Plus;
  ChevronRight = ChevronRight;
  ChevronLeft = ChevronLeft;

  ngOnInit(): void {
    this.loadWorkflows();

    this.searchChanged$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.skip.set(0);
        this.search.set(value);
        this.loadWorkflows();
      });
  }

  createNewWorkflow(): void {
    this.router.navigate(['workflows/editor']);
  }

  searchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchChanged$.next(target.value);
  }

  loadWorkflows(): void {
    this.loading = true;

    const params = new URLSearchParams({
      skip: this.skip().toString(),
      take: this.take().toString(),
      ...(this.search().trim() ? { workflowName: this.search().trim() } : {}),
    });

    this.http
      .get<Workflow[]>(`${environment.apiUrl}/workflows?${params}`, { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.workflows = data;
          this.hasMore.set(data.length === this.take());
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
    this.skip.set(this.skip() + this.take());
    this.loadWorkflows();
  }

  previousPage(): void {
    this.skip.set(Math.max(0, this.skip() - this.take()));
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
      .delete(`${environment.apiUrl}/workflows/${name}`,{ withCredentials: true })
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
