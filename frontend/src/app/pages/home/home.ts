import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  private authService = inject(AuthService);

  currentUser = this.authService.getCurrentUser();

  logout() {
    this.authService.logout();

    this.currentUser = null;
  }
}