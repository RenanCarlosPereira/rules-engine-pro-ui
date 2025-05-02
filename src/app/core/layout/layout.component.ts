import { Component, computed, signal } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  GripVertical,
  LayoutDashboard,
  List,
  Menu,
  LogOut,
} from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { GitHubUser } from '../../models/github-user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    RouterOutlet,
    RouterModule,
  ],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  title = 'rules-engine-ui';
  menuOpen = false;
  userMenuOpen = false;

  // Lucide icons
  GripVertical = GripVertical;
  LayoutDashboard = LayoutDashboard;
  List = List;
  Menu = Menu;
  LogOut = LogOut;

  user = signal<GitHubUser | null>(null);

  userAvatar = computed(() => {
    const u = this.user();
    return u?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || u?.login || 'User')}`;
  });

  constructor(private auth: AuthService, private router: Router) {
    this.auth.loadUser().subscribe({
      next: (u) => this.user.set(u),
      error: () => this.user.set(null),
    });
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
