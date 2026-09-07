import {
  Component,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  StatisticsService,
  PlayerStatistics,
  StatisticsSummary,
  ModeStatistics
} from '../../services/statistics';


@Component({
  selector: 'app-statistics',

  standalone: true,

  imports: [
    FormsModule
  ],

  templateUrl: './statistics.html',

  styleUrl: './statistics.scss'
})
export class Statistics {

  private statisticsService =
    inject(StatisticsService);

  private cdr =
    inject(ChangeDetectorRef);


  players: PlayerStatistics[] = [];

  filteredPlayers: PlayerStatistics[] = [];

  selectedPlayer:
    PlayerStatistics | null = null;


  searchText = '';

  loading = true;


  summary: StatisticsSummary = {

    totalGames: 0,

    totalParties: 0,

    totalRounds: 0,

    games2Players: 0,

    games3Players: 0,

    games4Players: 0
  };


  ngOnInit() {

    this.loadStatistics();

  }


  loadStatistics() {

    this.loading = true;

    this.statisticsService
      .getStatistics()
      .subscribe({

        next: (response: any) => {

          console.log('STATISTIKA RAW:', response);
          console.log('PLAYERS:', response?.players);
          console.log(
            'JE LI PLAYERS ARRAY:',
            Array.isArray(response?.players)
          );

          // Backend bi trebao vratiti:
          // {
          //   summary: {...},
          //   players: [...]
          // }

          if (Array.isArray(response?.players)) {

            this.players = response.players;

          } else {

            console.error(
              'GREŠKA: response.players nije niz!',
              response?.players
            );

            this.players = [];

          }

          this.filteredPlayers = [...this.players];

          if (response?.summary) {

            this.summary = response.summary;

          }

          this.loading = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Greška kod dohvaćanja statistike:',
            error
          );

          this.players = [];
          this.filteredPlayers = [];

          this.loading = false;

          this.cdr.detectChanges();

        }

      });

  }




  searchPlayers() {

    const search =
      this.searchText
        .trim()
        .toLowerCase();


    if (!search) {

      this.filteredPlayers =
        this.players;

      return;

    }


    this.filteredPlayers =
      this.players.filter(player =>

        player.username
          .toLowerCase()
          .includes(search)

      );

  }


  selectPlayer(
    player: PlayerStatistics
  ) {

    this.selectedPlayer =
      player;

    this.searchText =
      player.username;

    this.filteredPlayers =
      [];

  }


  clearSelectedPlayer() {

    this.selectedPlayer =
      null;

    this.searchText =
      '';

    this.filteredPlayers =
      this.players;

  }


  getWinRate(
    stats: ModeStatistics
  ): string {

    return `${stats.winRate}%`;

  }

}