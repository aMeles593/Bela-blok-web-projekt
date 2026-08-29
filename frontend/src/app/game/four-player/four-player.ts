
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface GamePlayer {
  id: number;
  username: string;
}

interface Team {
  players: GamePlayer[];
  score: number;
}

interface Bid {
  player: string;
  points: number;
}

interface Round {
  number: number;

  caller: string;

  trump: string;

  bids: Bid[];

  team1Points: number;
  team2Points: number;

  team1Bids: number;
  team2Bids: number;

  team1Total: number;
  team2Total: number;

  failed: boolean;
}

@Component({
  selector: 'app-four-player',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './four-player.html',
  styleUrl: './four-player.scss'
})
export class FourPlayer {

  @Input() players: GamePlayer[] = [];

  teams: Team[] = [];

  rounds: Round[] = [];

  currentRound: Round | null = null;


  ngOnInit() {

    this.createTeams();

  }


  createTeams() {

    if (this.players.length !== 4) {
      return;
    }

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


  openNewRound() {

    if (this.currentRound !== null) {
      return;
    }

    this.currentRound = {

      number:
        this.rounds.length + 1,

      caller: '',

      trump: '',

      bids: [],

      team1Points: 0,

      team2Points: 0,

      team1Bids: 0,

      team2Bids: 0,

      team1Total: 0,

      team2Total: 0,

      failed: false

    };

  }


  addBid() {

    if (!this.currentRound) {
      return;
    }

    this.currentRound.bids.push({

      player: '',

      points: 0

    });

  }


  removeBid(index: number) {

    if (!this.currentRound) {
      return;
    }

    this.currentRound.bids.splice(index, 1);

    this.calculateBids();

  }


  calculateBids() {

    if (!this.currentRound) {
      return;
    }

    let team1Bids = 0;

    let team2Bids = 0;


    for (const bid of this.currentRound.bids) {

      const team =
        this.getTeamIndexByPlayer(
          bid.player
        );

      const points =
        Number(bid.points) || 0;


      if (team === 0) {

        team1Bids += points;

      }

      else if (team === 1) {

        team2Bids += points;

      }

    }


    this.currentRound.team1Bids =
      team1Bids;

    this.currentRound.team2Bids =
      team2Bids;

  }


  saveRound() {

    if (!this.currentRound) {
      return;
    }


    /*
      Tko je zvao i adut
      moraju biti odabrani.
    */

    if (
      this.currentRound.caller === '' ||
      this.currentRound.trump === ''
    ) {

      return;

    }


    /*
      Bodovi iz igre
      moraju ukupno biti 162.
    */

    const team1Points =
      Number(
        this.currentRound.team1Points
      ) || 0;

    const team2Points =
      Number(
        this.currentRound.team2Points
      ) || 0;


    if (
      team1Points +
      team2Points !== 162
    ) {

      alert(
        'Zbroj bodova iz igre mora biti 162.'
      );

      return;

    }


    /*
      Izračun zvanja.
    */

    this.calculateBids();


    const team1Bids =
      this.currentRound.team1Bids;

    const team2Bids =
      this.currentRound.team2Bids;


    /*
      Ukupno bodova u rundi:

      162 + sva zvanja
    */

    const totalRoundPoints =
      162 +
      team1Bids +
      team2Bids;


    /*
      Utvrđujemo ekipu koja je zvala.
    */

    const callerTeam =
      this.getTeamIndexByPlayer(
        this.currentRound.caller
      );


    let team1Total = 0;

    let team2Total = 0;

    let failed = false;


    /*
      TIM 1 JE ZVAO
    */

    if (callerTeam === 0) {

      const callerPoints =
        team1Points +
        team1Bids;


      const half =
        totalRoundPoints / 2;


      /*
        Mora imati VIŠE od polovice.
      */

      if (callerPoints <= half) {

        failed = true;

        team1Total = 0;

        team2Total =
          totalRoundPoints;

      }

      else {

        team1Total =
          team1Points +
          team1Bids;

        team2Total =
          team2Points +
          team2Bids;

      }

    }


    /*
      TIM 2 JE ZVAO
    */

    else if (callerTeam === 1) {

      const callerPoints =
        team2Points +
        team2Bids;


      const half =
        totalRoundPoints / 2;


      /*
        Mora imati VIŠE od polovice.
      */

      if (callerPoints <= half) {

        failed = true;

        team2Total = 0;

        team1Total =
          totalRoundPoints;

      }

      else {

        team2Total =
          team2Points +
          team2Bids;

        team1Total =
          team1Points +
          team1Bids;

      }

    }


    /*
      Kreiramo završenu rundu.
    */

    const round: Round = {

      number:
        this.currentRound.number,

      caller:
        this.currentRound.caller,

      trump:
        this.currentRound.trump,

      bids:
        [...this.currentRound.bids],

      team1Points:
        team1Points,

      team2Points:
        team2Points,

      team1Bids:
        team1Bids,

      team2Bids:
        team2Bids,

      team1Total:
        team1Total,

      team2Total:
        team2Total,

      failed:
        failed

    };


    /*
      Dodajemo rundu.
    */

    this.rounds.push(round);


    /*
      Ažuriramo ukupni rezultat.
    */

    this.teams[0].score +=
      team1Total;

    this.teams[1].score +=
      team2Total;


    /*
      Zatvaramo trenutnu rundu.
    */

    this.currentRound = null;

  }


  getTeamIndexByPlayer(
    username: string
  ): number {

    for (
      let i = 0;
      i < this.teams.length;
      i++
    ) {

      const found =
        this.teams[i].players.some(
          player =>
            player.username === username
        );


      if (found) {
        return i;
      }

    }


    return -1;

  }


  getTeamPlayerNames(
    teamIndex: number
  ): string {

    if (!this.teams[teamIndex]) {
      return '';
    }


    return this.teams[teamIndex]
      .players
      .map(
        player => player.username
      )
      .join(' + ');

  }

}

