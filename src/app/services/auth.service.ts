import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { tap, catchError, of, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { GitHubUser } from '../models/github-user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<GitHubUser | null>(null);

  user = computed(() => this.userSignal());

  constructor(private http: HttpClient) {}

  loadUser(): Observable<GitHubUser | null> {
    return this.http.get<GitHubUser>(`${environment.apiUrl}/me`, { withCredentials: true }).pipe(
      tap(user => this.userSignal.set(user)),
      catchError(() => {
        this.userSignal.set(null);
        return of(null);
      })
    );
  }

  isAuthenticated() {
    return this.userSignal() !== null;
  }

  clearUser() {
    this.userSignal.set(null);
  }

  logout(): Observable<void> {
    return this.http.get<void>(`${environment.apiUrl}/logout`, { withCredentials: true }).pipe(
      tap(() => this.clearUser()),
      catchError(() => {
        this.clearUser();
        return of();
      })
    );
  }
}
