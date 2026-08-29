import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth';

interface GamePlayer {
  id: number;
  username: string;
}

interface Team {
  players: GamePlayer[];
  score: number;
}

interface Round {
  number: number;
  caller: string;
  bid: number | null;
  points: number[];
  bela: boolean;
  kontra: boolean;
}

@Component({
  selector: 'app-game',
  imports: [FormsModule],
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements OnInit {

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  players: GamePlayer[] = [];

  teams: Team[] = [];

  rounds: Round[] = [];

  gameStarted = false;

  currentRound: Round | null = null;


  ngOnInit() {

    this.route.queryParams.subscribe(params => {

      const playersParam = params['players'];

      if (!playersParam) {
        return;
      }

      const playerIds: number[] =
        playersParam
          .split(',')
          .map((id: string) => Number(id));


      this.authService.getUsers().subscribe({

        next: (users) => {

          this.players = playerIds
            .map(id => {

              const user =
                users.find(
                  (user: any) => user.id === id
                );

              if (!user) {
                return null;
              }

              return {
                id: user.id,
                username: user.username
              };

            })
            .filter(
              (player): player is GamePlayer =>
                player !== null
            );

        },

        error: (error) => {

          console.error(
            'Greška kod dohvaćanja igrača:',
            error
          );

        }

      });

    });

  }


  createTeams() {

    // 2 igrača
    if (this.players.length === 2) {

      this.teams = [
        {
          players: [this.players[0]],
          score: 0
        },
        {
          players: [this.players[1]],
          score: 0
        }
      ];

    }


    // 3 igrača
    else if (this.players.length === 3) {

      this.teams = [
        {
          players: [this.players[0]],
          score: 0
        },
        {
          players: [this.players[1]],
          score: 0
        },
        {
          players: [this.players[2]],
          score: 0
        }
      ];

    }


    // 4 igrača
    else if (this.players.length === 4) {

      this.teams = [
        {
          players: [
            this.players[0],
            this.players[1]
          ],
          score: 0
        },
        {
          players: [
            this.players[2],
            this.players[3]
          ],
          score: 0
        }
      ];

    }

    this.gameStarted = true;

  }


  openNewRound() {

    if (this.currentRound !== null) {
      return;
    }

    this.currentRound = {

      number: this.rounds.length + 1,

      caller: '',

      bid: null,

      points: this.teams.map(() => 0),

      bela: false,

      kontra: false

    };

  }


  saveRound() {

    if (!this.currentRound) {
      return;
    }


    // Mora biti odabran igrač koji je zvao
    if (this.currentRound.caller === '') {
      return;
    }


    // Provjera bodova
    const invalidPoints =
      this.currentRound.points.some(
        points =>
          points === null ||
          points === undefined ||
          points < 0
      );

    if (invalidPoints) {
      return;
    }


    const round: Round = {

      number: this.currentRound.number,

      caller: this.currentRound.caller,

      bid: this.currentRound.bid,

      points: [...this.currentRound.points],

      bela: this.currentRound.bela,

      kontra: this.currentRound.kontra

    };


    this.rounds.push(round);


    // Dodavanje bodova ukupnom rezultatu
    round.points.forEach(
      (points, index) => {

        if (this.teams[index]) {

          this.teams[index].score += points;

        }

      }
    );


    // Zatvori trenutnu rundu
    this.currentRound = null;

  }


  getTeamPlayers(team: Team): string {

    return team.players
      .map(player => player.username)
      .join(' + ');

  }


  getRoundPoints(round: Round): string {

    return round.points.join(' : ');

  }

}