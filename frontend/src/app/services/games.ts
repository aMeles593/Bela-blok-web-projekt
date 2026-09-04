import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GameHistory } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/history-games';

  saveGame(gameData: any): Observable<any> {
    return this.http.post(this.apiUrl, gameData);
  }
  getGames(): Observable<GameHistory[]> {
    return this.http.get<GameHistory[]>(this.apiUrl);
  }
}