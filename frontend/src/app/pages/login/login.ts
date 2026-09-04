import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';

  errorMessage = '';

  login() {

    this.errorMessage = '';

    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Korisničko ime i lozinka su obavezni.';
      return;
    }

    this.authService.login(
      this.username.trim(),
      this.password
    ).subscribe({

      next: (response) => {

        localStorage.setItem('token', response.token);

        localStorage.setItem(
          'user',
          JSON.stringify(response.user)
        );

        this.router.navigate(['/']);
      },

      error: (error) => {

        this.errorMessage =
          error.error?.message ||
          'Neispravno korisničko ime ili lozinka.';
      }

    });
  }
}