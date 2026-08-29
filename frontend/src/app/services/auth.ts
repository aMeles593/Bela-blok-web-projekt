import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface RegisterResponse {
  message: string;
  user: {
    id: number;
    username: string;
    created_at: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/auth';

  register(username: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      {
        username,
        password
      }
    );
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      {
        username,
        password
      }
    );
  }
  getCurrentUser() {
    const user = localStorage.getItem('user');

    if (!user) {
      return null;
    }

    return JSON.parse(user);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(
      'http://localhost:3000/api/users'
    );
  }
}