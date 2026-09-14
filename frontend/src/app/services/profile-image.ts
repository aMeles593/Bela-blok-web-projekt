import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileImageService {

  private apiUrl =
    'https://bela-blok-web-backend.onrender.com/api/users';

  constructor(private http: HttpClient) {}

  uploadImage(userId: number, file: File): Observable<any> {
    const formData = new FormData();

    formData.append('profileImage', file);

    return this.http.post(
      `${this.apiUrl}/${userId}/profile-image`,
      formData
    );
  }

  removeImage(userId: number): Observable<any> {
    return this.http.delete(
        `${this.apiUrl}/${userId}/profile-image`
    );
    }

  getImageUrl(userId: number): string {
    return `${this.apiUrl}/${userId}/profile-image`;
  }
}