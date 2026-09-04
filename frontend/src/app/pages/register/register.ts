import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  private authService = inject(AuthService);

  username = '';
  password = '';
  confirmPassword = '';

  errorMessage = '';
  successMessage = '';

  register() {

    this.errorMessage = '';
    this.successMessage = '';

    if (!this.username.trim() || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Sva polja su obavezna.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Lozinke se ne podudaraju.';
      return;
    }

    this.authService.register(
      this.username.trim(),
      this.password
    ).subscribe({
      next: (response) => {
        this.successMessage = response.message;

        this.username = '';
        this.password = '';
        this.confirmPassword = '';
      },

      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Došlo je do greške.';
      }
    });
  }
}