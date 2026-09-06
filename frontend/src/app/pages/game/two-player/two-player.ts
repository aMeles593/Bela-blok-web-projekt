import {
  Component,
  Input,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GamesService } from '../../../services/games';


interface GamePlayer {
  id: number;
  username: string;
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

  player1Points: number;
  player2Points: number;

  player1Bids: number;
  player2Bids: number;

  player1Total: number;
  player2Total: number;

  failed: boolean;

  stiglja: boolean;
  stigljaPlayer: number;
}


@Component({
  selector: 'app-two-player',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './two-player.html',
  styleUrl: './two-player.scss'
})
export class TwoPlayer {

  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private gamesService = inject(GamesService);


  @Input()
  players: GamePlayer[] = [];


  @Input()
  targetScore = 701;


  rounds: Round[] = [];

  currentRound: Round | null = null;

  editingRoundIndex: number | null = null;


  scores = [0, 0];


  partyWins = [0, 0];

  partyNumber = 1;

  partyFinished = false;

  winnerPlayer = -1;


  completedParties: any[] = [];


  readonly GAME_POINTS = 162;

  readonly STIGLJA_POINTS = 90;


  openNewRound() {

    if (this.partyFinished) {
      return;
    }

    if (this.currentRound !== null) {
      return;
    }


    this.currentRound = {

      number: this.rounds.length + 1,

      caller: '',

      trump: '',

      bids: [],

      player1Points: 0,

      player2Points: 0,

      player1Bids: 0,

      player2Bids: 0,

      player1Total: 0,

      player2Total: 0,

      failed: false,

      stiglja: false,

      stigljaPlayer: -1

    };


    this.cdr.detectChanges();

  }


  editRound(index: number) {

    if (this.partyFinished) {
      return;
    }

    if (this.currentRound !== null) {
      return;
    }


    const round = this.rounds[index];


    this.editingRoundIndex = index;


    this.currentRound = {

      ...round,

      bids: round.bids.map(
        bid => ({ ...bid })
      )

    };


    this.calculateBids();

    this.calculateCurrentRound();


    this.cdr.detectChanges();

  }


  cancelEdit() {

    this.currentRound = null;

    this.editingRoundIndex = null;


    this.cdr.detectChanges();

  }


  addBid() {

    if (!this.currentRound) {
      return;
    }


    this.currentRound.bids.push({

      player: '',

      points: 0

    });


    this.calculateBids();

  }


  removeBid(index: number) {

    if (!this.currentRound) {
      return;
    }


    this.currentRound.bids.splice(
      index,
      1
    );


    this.calculateBids();

  }


  calculateBids() {

    if (!this.currentRound) {
      return;
    }


    let player1Bids = 0;

    let player2Bids = 0;


    for (const bid of this.currentRound.bids) {

      const points =
        Number(bid.points) || 0;


      const player =
        this.getPlayerIndex(
          bid.player
        );


      if (player === 0) {

        player1Bids += points;

      }

      else if (player === 1) {

        player2Bids += points;

      }

    }


    this.currentRound.player1Bids =
      player1Bids;

    this.currentRound.player2Bids =
      player2Bids;


    this.calculateCurrentRound();

  }


  updatePlayer1Points() {

    if (!this.currentRound) {
      return;
    }


    let points =
      Number(this.currentRound.player1Points) || 0;


    points = Math.max(
      0,
      Math.min(
        this.GAME_POINTS,
        points
      )
    );


    this.currentRound.player1Points =
      points;


    this.calculateCurrentRound();

    this.cdr.detectChanges();

  }


  updatePlayer2Points() {

    if (!this.currentRound) {
      return;
    }


    let points =
      Number(this.currentRound.player2Points) || 0;


    points = Math.max(
      0,
      Math.min(
        this.GAME_POINTS,
        points
      )
    );


    this.currentRound.player2Points =
      points;


    this.calculateCurrentRound();

    this.cdr.detectChanges();

  }


  updateStiglja() {

    if (!this.currentRound) {
      return;
    }


    if (!this.currentRound.stiglja) {

      this.currentRound.stigljaPlayer = -1;

    }


    this.calculateCurrentRound();

    this.cdr.detectChanges();

  }


  setStigljaPlayer(
    playerIndex: number
  ) {

    if (!this.currentRound) {
      return;
    }


    this.currentRound.stiglja = true;

    this.currentRound.stigljaPlayer =
      playerIndex;


    this.calculateCurrentRound();

    this.cdr.detectChanges();

  }


  removeStiglja() {

    if (!this.currentRound) {
      return;
    }


    this.currentRound.stiglja = false;

    this.currentRound.stigljaPlayer = -1;


    this.calculateCurrentRound();

    this.cdr.detectChanges();

  }


  calculateCurrentRound() {

    if (!this.currentRound) {
      return;
    }


    const player1Points =
      Number(
        this.currentRound.player1Points
      ) || 0;


    const player2Points =
      Number(
        this.currentRound.player2Points
      ) || 0;


    const player1Bids =
      Number(
        this.currentRound.player1Bids
      ) || 0;


    const player2Bids =
      Number(
        this.currentRound.player2Bids
      ) || 0;


    /*
    * UKUPNA VRIJEDNOST RUNDE
    *
    * Kod 2 igrača ne postoji fiksnih 162.
    *
    * Uzimamo:
    *
    * bodovi igrača 1
    * + bodovi igrača 2
    * + zvanja igrača 1
    * + zvanja igrača 2
    */

    const totalRoundValue =
      player1Points +
      player2Points +
      player1Bids +
      player2Bids;


    /*
    * Ako još nisu uneseni bodovi,
    * nema rezultata.
    */

    if (
      player1Points === 0 &&
      player2Points === 0
    ) {

      this.currentRound.player1Total = 0;

      this.currentRound.player2Total = 0;

      this.currentRound.failed = false;

      return;

    }


    /*
    * ŠTIGLJA
    *
    * Igrač koji ima štiglju dobiva
    * dodatnih 90 bodova.
    */

    if (
      this.currentRound.stiglja &&
      this.currentRound.stigljaPlayer !== -1
    ) {

      if (
        this.currentRound.stigljaPlayer === 0
      ) {

        this.currentRound.player1Total = 0;

        this.currentRound.player2Total =
          totalRoundValue +
          this.STIGLJA_POINTS;

      }

      else {

        this.currentRound.player2Total = 0;

        this.currentRound.player1Total =
          totalRoundValue +
          this.STIGLJA_POINTS;

      }


      this.currentRound.failed = false;

      return;

    }


    /*
    * ODREDI TKO JE ZVAO
    */

    const callerPlayer =
      this.getPlayerIndex(
        this.currentRound.caller
      );


    /*
    * Ako još nije odabran pozivatelj,
    * samo prikaži normalne bodove.
    */

    if (callerPlayer === -1) {

      this.currentRound.player1Total =
        player1Points +
        player1Bids;

      this.currentRound.player2Total =
        player2Points +
        player2Bids;

      this.currentRound.failed = false;

      return;

    }


    /*
    * POLOVICA UKUPNE VRIJEDNOSTI
    *
    * Pozivatelj mora imati više od polovice.
    */

    const requiredPoints =
      Math.floor(
        totalRoundValue / 2
      ) + 1;


    /*
    * IGRAČ 1 JE ZVAO
    */

    if (callerPlayer === 0) {

      const callerTotal =
        player1Points +
        player1Bids;


      if (
        callerTotal <
        requiredPoints
      ) {

        /*
        * PAD
        *
        * Sve bodove iz runde dobiva
        * igrač 2.
        */

        this.currentRound.failed = true;

        this.currentRound.player1Total = 0;

        this.currentRound.player2Total =
          totalRoundValue;

      }

      else {

        /*
        * PROŠAO
        */

        this.currentRound.failed = false;

        this.currentRound.player1Total =
          player1Points +
          player1Bids;

        this.currentRound.player2Total =
          player2Points +
          player2Bids;

      }

    }


    /*
    * IGRAČ 2 JE ZVAO
    */

    else if (callerPlayer === 1) {

      const callerTotal =
        player2Points +
        player2Bids;


      if (
        callerTotal <
        requiredPoints
      ) {

        /*
        * PAD
        *
        * Sve bodove iz runde dobiva
        * igrač 1.
        */

        this.currentRound.failed = true;

        this.currentRound.player2Total = 0;

        this.currentRound.player1Total =
          totalRoundValue;

      }

      else {

        /*
        * PROŠAO
        */

        this.currentRound.failed = false;

        this.currentRound.player1Total =
          player1Points +
          player1Bids;

        this.currentRound.player2Total =
          player2Points +
          player2Bids;

      }

    }


    this.cdr.detectChanges();

  }

  saveRound() {

    if (!this.currentRound) {
      return;
    }


    if (
      this.currentRound.caller === ''
    ) {

      alert(
        'Odaberite tko je zvao.'
      );

      return;

    }


    if (
      this.currentRound.trump === ''
    ) {

      alert(
        'Odaberite adut.'
      );

      return;

    }


    if (
      this.currentRound.stiglja &&
      this.currentRound.stigljaPlayer === -1
    ) {

      alert(
        'Odaberite tko je imao štiglju.'
      );

      return;

    }


    /*
    * Kod 2 igrača oba igrača
    * moraju ručno unijeti bodove.
    */

    const player1Points =
      Number(
        this.currentRound.player1Points
      ) || 0;


    const player2Points =
      Number(
        this.currentRound.player2Points
      ) || 0;


    /*
    * Ponovno izračunaj zvanja
    * i konačni rezultat.
    */

    this.calculateBids();

    this.calculateCurrentRound();


    const savedRound: Round = {

      ...this.currentRound,

      bids: [
        ...this.currentRound.bids
      ]

    };


    this.rounds.push(
      savedRound
    );


    this.scores[0] +=
      savedRound.player1Total;


    this.scores[1] +=
      savedRound.player2Total;


    this.checkWinner();


    this.currentRound = null;


    this.cdr.detectChanges();

  }



  updateRound() {

    if (!this.currentRound) {
      return;
    }


    if (
      this.editingRoundIndex === null
    ) {
      return;
    }


    if (
      this.currentRound.caller === ''
    ) {

      alert('Odaberite tko je zvao.');

      return;

    }


    if (
      this.currentRound.trump === ''
    ) {

      alert('Odaberite adut.');

      return;

    }


    const player1Points =
      Number(
        this.currentRound.player1Points
      ) || 0;


    const player2Points =
      Number(
        this.currentRound.player2Points
      ) || 0;


    if (
      !this.currentRound.stiglja &&
      player1Points + player2Points !==
      this.GAME_POINTS
    ) {

      alert(
        'Zbroj bodova iz igre mora biti 162.'
      );

      return;

    }


    this.calculateBids();

    this.calculateCurrentRound();


    const index =
      this.editingRoundIndex;


    const oldRound =
      this.rounds[index];


    this.scores[0] -=
      oldRound.player1Total;


    this.scores[1] -=
      oldRound.player2Total;


    const updatedRound: Round = {

      ...this.currentRound,

      bids:
        this.currentRound.bids.map(
          bid => ({ ...bid })
        )

    };


    this.rounds[index] =
      updatedRound;


    this.scores[0] +=
      updatedRound.player1Total;


    this.scores[1] +=
      updatedRound.player2Total;


    this.currentRound = null;

    this.editingRoundIndex = null;


    this.checkWinner();


    this.cdr.detectChanges();

  }


  checkWinner() {

    const player1Score =
      this.scores[0];


    const player2Score =
      this.scores[1];


    const player1Reached =
      player1Score >= this.targetScore;


    const player2Reached =
      player2Score >= this.targetScore;


    let winner = -1;


    if (
      player1Reached &&
      player2Reached
    ) {

      if (
        player1Score >
        player2Score
      ) {

        winner = 0;

      }

      else if (
        player2Score >
        player1Score
      ) {

        winner = 1;

      }

    }

    else if (player1Reached) {

      winner = 0;

    }

    else if (player2Reached) {

      winner = 1;

    }


    if (winner !== -1) {

      this.partyWins[winner]++;

      this.partyFinished = true;

      this.winnerPlayer = winner;

    }

  }


  startNewParty() {

    if (!this.partyFinished) {
      return;
    }


    this.partyNumber++;


    this.scores[0] = 0;

    this.scores[1] = 0;


    this.rounds = [];

    this.currentRound = null;


    this.partyFinished = false;

    this.winnerPlayer = -1;


    this.cdr.detectChanges();

  }


  getPlayerIndex(
    username: string
  ): number {

    if (!username) {
      return -1;
    }


    return this.players.findIndex(
      player =>
        player.username === username
    );

  }


  getRoundResult(
    round: Round
  ): string {

    return `${round.player1Total} : ${round.player2Total}`;

  }


  getTotalBids(): number {

    if (!this.currentRound) {
      return 0;
    }


    return (
      this.currentRound.player1Bids +
      this.currentRound.player2Bids
    );

  }


  getCurrentRoundValue(): number {

    return (
      this.GAME_POINTS +
      this.getTotalBids()
    );

  }


  getRequiredPoints(): number {

    return (
      Math.floor(
        this.getCurrentRoundValue() / 2
      ) + 1
    );

  }


  getPlayer1Preview(): number {

    if (!this.currentRound) {
      return 0;
    }


    return this.currentRound.player1Total;

  }


  getPlayer2Preview(): number {

    if (!this.currentRound) {
      return 0;
    }


    return this.currentRound.player2Total;

  }


  getStigljaPoints(
    playerIndex: number
  ): number {

    if (!this.currentRound) {
      return 0;
    }


    if (
      !this.currentRound.stiglja
    ) {

      return 0;

    }


    if (
      this.currentRound.stigljaPlayer ===
      playerIndex
    ) {

      return this.STIGLJA_POINTS;

    }


    return 0;

  }


  getRoundStatus(): string {

    if (!this.currentRound) {
      return '';
    }


    if (
      this.currentRound.failed
    ) {

      return 'PAD';

    }


    if (
      this.currentRound.caller === ''
    ) {

      return '';

    }


    return 'PROŠAO';

  }


  getStigljaText(
    round: Round
  ): string {

    if (!round.stiglja) {
      return '';
    }


    if (
      round.stigljaPlayer === 0
    ) {

      return `Štiglja – ${this.players[0]?.username}`;

    }


    if (
      round.stigljaPlayer === 1
    ) {

      return `Štiglja – ${this.players[1]?.username}`;

    }


    return '';

  }


  finishAllGames() {

    const gameData = {

      targetScore:
        this.targetScore,


      players: [

        {
          id: this.players[0].id,
          team: 1
        },

        {
          id: this.players[1].id,
          team: 2
        }

      ],


      parties:
        this.completedParties

    };


    console.log(
      'Šaljem igru:',
      gameData
    );


    this.gamesService
      .saveGame(gameData)
      .subscribe({

        next: (response) => {

          console.log(
            'Igra spremljena:',
            response
          );

          this.router.navigate(['/']);

        },


        error: (error) => {

          console.error(
            'Greška kod spremanja igre:',
            error
          );

          alert(
            'Greška kod spremanja igre.'
          );

        }

      });

  }

}
