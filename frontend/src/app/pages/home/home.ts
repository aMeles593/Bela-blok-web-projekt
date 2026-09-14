import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ProfileImageService } from '../../services/profile-image';
import { QuoteService } from '../../services/quote';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  private authService = inject(AuthService);
  private profileImageService = inject(ProfileImageService);
  private quoteService = inject(QuoteService);
  private cdr = inject(ChangeDetectorRef);

  quote = '';
  quoteAuthor = '';
  loadingQuote = false;

  currentUser = this.authService.getCurrentUser();

  selectedFile: File | null = null;
  uploadingImage = false;

  ngOnInit() {
    this.loadQuote();
  }

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

  removeProfileImage() {
    if (!this.currentUser) {
      return;
    }

    this.profileImageService
      .removeImage(this.currentUser.id)
      .subscribe({
        next: () => {
          window.location.reload();
        },

        error: (error) => {
          console.error('Greška pri uklanjanju slike:', error);

          alert(
            error?.error?.message ||
            'Greška pri uklanjanju profilne slike.'
          );
        }
      });
  }

  loadQuote() {
    console.log('POZIVAM QUOTE API');

    this.loadingQuote = true;

    this.quoteService.getRandomQuote().subscribe({
      next: (data) => {

        console.log('QUOTE ODGOVOR:', data);

        this.quote = data.quote;
        this.quoteAuthor = data.author;

        console.log('QUOTE:', this.quote);
        console.log('AUTHOR:', this.quoteAuthor);

        this.loadingQuote = false;
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('QUOTE ERROR:', error);

        this.loadingQuote = false;
      }
    });
  }
}