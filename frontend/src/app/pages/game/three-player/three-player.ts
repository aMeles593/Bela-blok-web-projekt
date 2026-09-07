import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  player3Points: number;

  player1Bids: number;
  player2Bids: number;
  player3Bids: number;

  player1Total: number;
  player2Total: number;
  player3Total: number;

  failed: boolean;

  stiglja: boolean;
  stigljaPlayer: number;

  createdAt?: string;
}

@Component({
  selector: 'app-three-player',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './three-player.html',
  styleUrl: './three-player.scss'
})
export class ThreePlayer {

  @Input() players: GamePlayer[] = [];

  @Input() targetScore = 701;

  rounds: Round[] = [];

  currentRound: Round | null = null;

  editingRoundIndex: number | null = null;

  scores = [0, 0, 0];

  partyWins = [0, 0, 0];

  partyNumber = 1;

  partyFinished = false;

  winnerPlayer = -1;

  completedParties: any[] = [];


  // --------------------------------------------------
  // NOVA RUNDA
  // --------------------------------------------------

  openNewRound(): void {

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
      player3Points: 0,

      player1Bids: 0,
      player2Bids: 0,
      player3Bids: 0,

      player1Total: 0,
      player2Total: 0,
      player3Total: 0,

      failed: false,

      stiglja: false,
      stigljaPlayer: -1
    };

  }


  // --------------------------------------------------
  // UREĐIVANJE RUNDE
  // --------------------------------------------------

  editRound(index: number): void {

    if (this.partyFinished) {
      return;
    }

    this.editingRoundIndex = index;

    this.currentRound = JSON.parse(
      JSON.stringify(this.rounds[index])
    );

  }


  cancelEdit(): void {

    this.currentRound = null;

    this.editingRoundIndex = null;

  }


  // --------------------------------------------------
  // ZVANJA
  // --------------------------------------------------

  addBid(): void {

    if (!this.currentRound) {
      return;
    }

    this.currentRound.bids.push({
      player: '',
      points: 0
    });

  }


  removeBid(index: number): void {

    if (!this.currentRound) {
      return;
    }

    this.currentRound.bids.splice(index, 1);

    this.calculateBids();

  }


  calculateBids(): void {

    if (!this.currentRound) {
      return;
    }

    this.currentRound.player1Bids = 0;
    this.currentRound.player2Bids = 0;
    this.currentRound.player3Bids = 0;

    for (const bid of this.currentRound.bids) {

      if (!bid.player || !bid.points) {
        continue;
      }

      const playerIndex = this.getPlayerIndex(bid.player);

      if (playerIndex === 0) {
        this.currentRound.player1Bids += Number(bid.points);
      }

      if (playerIndex === 1) {
        this.currentRound.player2Bids += Number(bid.points);
      }

      if (playerIndex === 2) {
        this.currentRound.player3Bids += Number(bid.points);
      }

    }

    this.calculateCurrentRound();

  }


  // --------------------------------------------------
  // BODOVI
  // --------------------------------------------------

  updatePlayer1Points(): void {
    this.calculateCurrentRound();
  }

  updatePlayer2Points(): void {
    this.calculateCurrentRound();
  }

  updatePlayer3Points(): void {
    this.calculateCurrentRound();
  }


  // --------------------------------------------------
  // ŠTIGLJA
  // --------------------------------------------------

  updateStiglja(): void {

    if (!this.currentRound) {
      return;
    }

    this.calculateCurrentRound();

  }


  setStigljaPlayer(playerIndex: number): void {

    if (!this.currentRound) {
      return;
    }

    this.currentRound.stiglja = true;
    this.currentRound.stigljaPlayer = playerIndex;

    this.calculateCurrentRound();

  }


  removeStiglja(): void {

    if (!this.currentRound) {
      return;
    }

    this.currentRound.stiglja = false;
    this.currentRound.stigljaPlayer = -1;

    this.calculateCurrentRound();

  }


  // --------------------------------------------------
  // GLAVNI IZRAČUN RUNDE
  // --------------------------------------------------

  calculateCurrentRound(): void {

    if (!this.currentRound) {
      return;
    }

    const p1 =
      Number(this.currentRound.player1Points) || 0;

    const p2 =
      Number(this.currentRound.player2Points) || 0;

    const p3 =
      Number(this.currentRound.player3Points) || 0;

    const b1 =
      Number(this.currentRound.player1Bids) || 0;

    const b2 =
      Number(this.currentRound.player2Bids) || 0;

    const b3 =
      Number(this.currentRound.player3Bids) || 0;


    // ----------------------------------------------
    // ŠTIGLJA
    // ----------------------------------------------

    // ----------------------------------------------
// ŠTIGLJA
// ----------------------------------------------

    if (this.currentRound.stiglja) {

      const points = [p1, p2, p3];

      const totals = [
        p1 + b1,
        p2 + b2,
        p3 + b3
      ];

      // Pronađi igrače koji imaju 0 bodova
      const stigljaPlayers = points
        .map((points, index) => points === 0 ? index : -1)
        .filter(index => index !== -1);

      // Ako postoji barem jedan igrač sa 0
      if (stigljaPlayers.length > 0) {

        // Igrač koji nije štiglja
        const remainingPlayers = [0, 1, 2]
          .filter(index => !stigljaPlayers.includes(index));

        // Ako je jedan igrač štiglja
        if (stigljaPlayers.length === 1) {

          // Od preostala dva pronađi onoga s najviše bodova
          const winnerIndex = remainingPlayers.reduce(
            (best, index) =>
              points[index] > points[best]
                ? index
                : best,
            remainingPlayers[0]
          );

          // Samo igrač s najviše bodova dobiva +100
          totals[winnerIndex] += 100;

        }

        // Ako su dva igrača štiglja,
        // treći igrač dobiva +200
        if (stigljaPlayers.length === 2) {

          const winnerIndex = remainingPlayers[0];

          totals[winnerIndex] += 200;

        }

        // Igrači koji imaju štiglju ostaju na 0
        for (const index of stigljaPlayers) {
          totals[index] = 0;
        }

        this.currentRound.player1Total = totals[0];
        this.currentRound.player2Total = totals[1];
        this.currentRound.player3Total = totals[2];

        this.currentRound.failed = false;

        return;
      }
    } 


    // ----------------------------------------------
    // NORMALNA RUNDA
    // ----------------------------------------------

    const totals = [
      p1 + b1,
      p2 + b2,
      p3 + b3
    ];


    // Ako nitko nije zvao,
    // samo prikaži normalne bodove.

    if (!this.currentRound.caller) {

      this.currentRound.player1Total = totals[0];
      this.currentRound.player2Total = totals[1];
      this.currentRound.player3Total = totals[2];

      this.currentRound.failed = false;

      return;
    }


    const callerIndex =
      this.getPlayerIndex(this.currentRound.caller);


    if (callerIndex === -1) {
      return;
    }


    // ----------------------------------------------
    // PRONALAZAK IGRAČA S NAJVIŠE BODOVA
    // ----------------------------------------------

    const points = [p1, p2, p3];

    const maxPoints = Math.max(...points);

    const highestIndex =
      points.indexOf(maxPoints);


    // ----------------------------------------------
    // PROLAZ
    // ----------------------------------------------

    if (callerIndex === highestIndex) {

      this.currentRound.failed = false;

      this.currentRound.player1Total = totals[0];
      this.currentRound.player2Total = totals[1];
      this.currentRound.player3Total = totals[2];

      return;
    }


    // ----------------------------------------------
    // PAD
    // ----------------------------------------------

    this.currentRound.failed = true;

    const failedCallerPoints =
      totals[callerIndex];

    const result = [...totals];

    // Zvao je, ali nije imao najviše.
    result[callerIndex] = 0;

    // Njegovi bodovi idu igraču
    // koji je imao najviše.
    result[highestIndex] += failedCallerPoints;


    this.currentRound.player1Total = result[0];
    this.currentRound.player2Total = result[1];
    this.currentRound.player3Total = result[2];

  }


  // --------------------------------------------------
  // SPREMANJE RUNDE
  // --------------------------------------------------

  saveRound(): void {

    if (!this.currentRound) {
      return;
    }

    if (!this.currentRound.caller) {
      alert('Odaberite igrača koji je zvao.');
      return;
    }

    if (!this.currentRound.trump) {
      alert('Odaberite adut.');
      return;
    }

    this.calculateBids();

    this.calculateCurrentRound();


    const savedRound: Round = {
      ...this.currentRound,
      bids: [...this.currentRound.bids]
    };


    this.rounds.push(savedRound);

    this.updateScores();

    this.currentRound = null;

    this.editingRoundIndex = null;

    this.checkWinner();

  }


  // --------------------------------------------------
  // IZMJENA RUNDE
  // --------------------------------------------------

  updateRound(): void {

    if (
      this.editingRoundIndex === null ||
      !this.currentRound
    ) {
      return;
    }

    this.calculateBids();

    this.calculateCurrentRound();

    this.rounds[this.editingRoundIndex] = {
      ...this.currentRound,
      bids: [...this.currentRound.bids]
    };

    this.currentRound = null;

    this.editingRoundIndex = null;

    this.updateScores();

    this.checkWinner();

  }


  // --------------------------------------------------
  // UKUPNI REZULTAT PARTIJE
  // --------------------------------------------------

  updateScores(): void {

    this.scores = [0, 0, 0];

    for (const round of this.rounds) {

      this.scores[0] += round.player1Total;
      this.scores[1] += round.player2Total;
      this.scores[2] += round.player3Total;

    }

  }


  // --------------------------------------------------
  // PROVJERA POBJEDNIKA PARTIJE
  // --------------------------------------------------

  checkWinner(): void {

    // Pronađi igrača koji je dosegnuo ciljani rezultat
    const winnerIndex = this.scores.findIndex(
      score => score >= this.targetScore
    );

    // Nitko još nije dosegnuo cilj
    if (winnerIndex === -1) {
      return;
    }

    // Partija je završena
    this.partyFinished = true;

    // Zapamti pobjednika
    this.winnerPlayer = winnerIndex;

    // Dodaj pobjedu tom igraču
    this.partyWins[winnerIndex]++;

  }


  // --------------------------------------------------
  // NOVA PARTIJA
  // --------------------------------------------------

  startNewParty(): void {

    if (!this.partyFinished) {
      return;
    }

    this.completedParties.push({
      partyNumber: this.partyNumber,
      scores: [...this.scores],
      winnerPlayer: this.winnerPlayer,
      rounds: JSON.parse(
        JSON.stringify(this.rounds)
      )
    });


    this.partyNumber++;

    this.rounds = [];

    this.scores = [0, 0, 0];

    this.currentRound = null;

    this.editingRoundIndex = null;

    this.partyFinished = false;

    this.winnerPlayer = -1;

  }


  // --------------------------------------------------
  // POMOĆNE FUNKCIJE
  // --------------------------------------------------

  getPlayerIndex(username: string): number {

    return this.players.findIndex(
      player => player.username === username
    );

  }


  getPlayerName(index: number): string {

    return this.players[index]?.username || `Igrač ${index + 1}`;

  }


  getTotalBids(): number {

    if (!this.currentRound) {
      return 0;
    }

    return (
      this.currentRound.player1Bids +
      this.currentRound.player2Bids +
      this.currentRound.player3Bids
    );

  }


  getCurrentRoundValue(): number {

    if (!this.currentRound) {
      return 0;
    }

    return (
      this.currentRound.player1Points +
      this.currentRound.player2Points +
      this.currentRound.player3Points +
      this.getTotalBids()
    );

  }


  getPlayer1Preview(): number {

    return this.currentRound?.player1Total || 0;

  }


  getPlayer2Preview(): number {

    return this.currentRound?.player2Total || 0;

  }


  getPlayer3Preview(): number {

    return this.currentRound?.player3Total || 0;

  }

  getStigljaPoints(playerIndex: number): number {

    if (!this.currentRound?.stiglja) {
      return 0;
    }

    const points = [
      this.currentRound.player1Points,
      this.currentRound.player2Points,
      this.currentRound.player3Points
    ];

    const stigljaPlayers = points
      .map((point, index) =>
        point === 0 ? index : -1
      )
      .filter(index => index !== -1);

    // Jedna štiglja
    if (stigljaPlayers.length === 1) {

      const remainingPlayers = [0, 1, 2]
        .filter(index => !stigljaPlayers.includes(index));

      const winnerIndex = remainingPlayers.reduce(
        (best, index) =>
          points[index] > points[best]
            ? index
            : best,
        remainingPlayers[0]
      );

      return playerIndex === winnerIndex ? 100 : 0;
    }

    // Dvije štiglje
    if (stigljaPlayers.length === 2) {

      return !stigljaPlayers.includes(playerIndex)
        ? 200
        : 0;
    }

    return 0;
  }


  getRoundStatus(): string {

    if (!this.currentRound) {
      return '';
    }

    if (!this.currentRound.caller) {
      return '';
    }

    return this.currentRound.failed
      ? 'PAD'
      : 'PROŠAO';

  }


  getStigljaText(): string {

    if (!this.currentRound?.stiglja) {
      return '';
    }

    const points = [
      this.currentRound.player1Points,
      this.currentRound.player2Points,
      this.currentRound.player3Points
    ];

    const stigljaPlayers = points
      .map((point, index) =>
        point === 0 ? this.getPlayerName(index) : null
      )
      .filter(name => name !== null);

    if (stigljaPlayers.length === 2) {
      return `${this.getPlayerName(
        points.findIndex(point => point !== 0)
      )} +200`;
    }

    if (stigljaPlayers.length === 1) {
      const winner =
        points.findIndex(point => point !== 0);

      return `${this.getPlayerName(winner)} +100`;
    }

    return '';

  }


  finishAllGames(): void {

    console.log(
      'ZAVRŠENA IGRA',
      this.completedParties
    );

  }

}