import {Component, inject, ChangeDetectorRef} from '@angular/core';

import { GamesService } from '../../services/games';
import { GameHistory } from '../../models/game';


@Component({
  selector: 'app-history-games',
  standalone: true,
  templateUrl: './history-games.html',
  styleUrl: './history-games.scss'
})
export class HistoryGames {

  private gamesService = inject(GamesService);
  private cdr = inject(ChangeDetectorRef);

  games: GameHistory[] = [];
  loading = true;

  ngOnInit() {

    this.gamesService.getGames().subscribe({

    next: (games) => {

      console.log('IGRE IZ API-ja:', games);

      this.games = games;
      this.loading = false;

      this.cdr.detectChanges();

    },

    error: (error) => {

      console.error(
        'Greška kod dohvaćanja igara:',
        error
      );

      this.loading = false;

    }
    

});

  }

  formatDate(date: string): string {

    return new Date(date).toLocaleDateString(
      'hr-HR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );

  }

}