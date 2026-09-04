import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlayerStatistics {
  id: number;
  username: string;

  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;

  partiesPlayed: number;
  partiesWon: number;

  roundsPlayed: number;

  totalPoints: number;

  calls: number;
  successfulCalls: number;
  failedCalls: number;

  bids: number;
  bidPoints: number;

  stiglje: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/api/statistics';

  getStatistics(): Observable<PlayerStatistics[]> {

    return this.http.get<PlayerStatistics[]>(
      this.apiUrl
    );

  }

}