import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface ModeStatistics {

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


export interface PlayerStatistics {

  id: number;

  username: string;

  overall: ModeStatistics;

  twoPlayers: ModeStatistics;

  threePlayers: ModeStatistics;

  fourPlayers: ModeStatistics;
}


export interface StatisticsSummary {

  totalGames: number;

  totalParties: number;

  totalRounds: number;

  games2Players: number;

  games3Players: number;

  games4Players: number;
}


export interface StatisticsResponse {

  summary: StatisticsSummary;

  players: PlayerStatistics[];
}


@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private http = inject(HttpClient);

  private apiUrl =
    'http://localhost:3000/api/statistics';


  getStatistics(): Observable<StatisticsResponse> {

    return this.http.get<StatisticsResponse>(
      this.apiUrl
    );

  }

}