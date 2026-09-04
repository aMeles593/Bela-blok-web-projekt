import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/games';

  saveGame(gameData: any): Observable<any> {
    return this.http.post(this.apiUrl, gameData);
  }
}