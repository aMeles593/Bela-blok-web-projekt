import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatisticsService, PlayerStatistics } from '../../services/statistics';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './statistics.html',
  styleUrl: './statistics.scss'
})
export class Statistics {

  private statisticsService = inject(StatisticsService);
  private cdr = inject(ChangeDetectorRef);

  players: PlayerStatistics[] = [];

  loading = true;

  totalGames = 0;
  totalParties = 0;
  totalRounds = 0;

  ngOnInit() {

    this.statisticsService.getStatistics().subscribe({

      next: (statistics) => {

        console.log('STATISTIKA:', statistics);

        this.players = statistics;

        if (this.players.length > 0) {

          this.totalGames = this.players[0].gamesPlayed;

          this.totalParties = this.players[0].partiesPlayed;

          this.totalRounds = this.players[0].roundsPlayed;

        }

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Greška kod dohvaćanja statistike:',
          error
        );

        this.loading = false;
      }

    });

  }

}