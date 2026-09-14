import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ProfileImageService } from '../../services/profile-image';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  private authService = inject(AuthService);
  private profileImageService = inject(ProfileImageService);

  currentUser = this.authService.getCurrentUser();

  selectedFile: File | null = null;
  uploadingImage = false;

  logout() {
    this.authService.logout();
    this.currentUser = null;
    this.selectedFile = null;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    this.selectedFile = input.files[0];
  }

  uploadProfileImage() {
    if (!this.currentUser || !this.selectedFile) {
      return;
    }

    this.uploadingImage = true;

    this.profileImageService
      .uploadImage(this.currentUser.id, this.selectedFile)
      .subscribe({
        next: () => {
          this.uploadingImage = false;
          this.selectedFile = null;

          window.location.reload();
        },

        error: (error) => {
          console.error('Greška pri uploadu slike:', error);
          this.uploadingImage = false;

          alert(
            error?.error?.message ||
            'Greška pri uploadu profilne slike.'
          );
        }
      });
  }

  getProfileImageUrl(): string {
    if (!this.currentUser) {
      return '';
    }

    return this.profileImageService.getImageUrl(
      this.currentUser.id
    );
  }

  onProfileImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/default-profile.png';
  }
}