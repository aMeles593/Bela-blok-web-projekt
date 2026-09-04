import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  inject
} from '@angular/core';

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
  stiglja: boolean;
  stigljaTeam: number;
}


@Component({
  selector: 'app-four-player',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './four-player.html',
  styleUrl: './four-player.scss'
})
export class FourPlayer implements OnChanges {

  private cdr = inject(ChangeDetectorRef);


  @Input()
  players: GamePlayer[] = [];


  @Input()
  targetScore = 701;
  teams: Team[] = [];
  rounds: Round[] = [];
  currentRound: Round | null = null;
  editingRoundIndex: number | null = null;
  manualTeam = -1;
  partyWins = [0, 0];
  partyNumber = 1;
  partyFinished = false;
  winnerTeam = -1;
  readonly GAME_POINTS = 162;
  readonly STIGLJA_POINTS = 90;

  ngOnChanges(changes: SimpleChanges) {

    if (
      changes['players'] &&
      this.players.length === 4
    ) {

      this.createTeams();

    }

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
    this.cdr.detectChanges();

  }


  getTeamPlayerNames(
    teamIndex: number
  ): string {

    if (!this.teams[teamIndex]) {
      return '';
    }


    return this.teams[teamIndex]
      .players
      .map(player => player.username)
      .join(' + ');

  }


  openNewRound() {

    if (this.partyFinished) {
      return;
    }


    if (this.currentRound !== null) {
      return;
    }


    this.manualTeam = -1;


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

      failed: false,

      stiglja: false,

      stigljaTeam: -1

    };


    this.cdr.detectChanges();

  }

  editRound(index: number) {
    if (this.partyFinished) return;
    if (this.currentRound !== null) return;

    const round = this.rounds[index];

    // Zapamti koju rundu uređujemo
    this.editingRoundIndex = index;

    // Napravi kopiju da ne mijenjamo odmah spremljenu rundu
    this.currentRound = {
      ...round,
      bids: round.bids.map(bid => ({ ...bid }))
    };

    // Odredi koja ekipa je zadnja ručno unosila bodove
    if (this.currentRound.stiglja) {
      this.manualTeam =
        this.currentRound.stigljaTeam === 0 ? 1 : 0;
    } else {
      this.manualTeam = 0;
    }

    this.calculateBids();
    this.calculateCurrentRound();

    this.cdr.detectChanges();
  }

  updateRound() {
    if (!this.currentRound) return;
    if (this.editingRoundIndex === null) return;

    if (this.currentRound.caller === '') {
      alert('Odaberite tko je zvao.');
      return;
    }

    if (this.currentRound.trump === '') {
      alert('Odaberite adut.');
      return;
    }

    if (
      this.currentRound.stiglja &&
      this.currentRound.stigljaTeam === -1
    ) {
      alert('Odaberite koja je ekipa imala štiglju.');
      return;
    }

    const team1Points =
      Number(this.currentRound.team1Points) || 0;

    const team2Points =
      Number(this.currentRound.team2Points) || 0;

    if (
      !this.currentRound.stiglja &&
      team1Points + team2Points !== this.GAME_POINTS
    ) {
      alert('Zbroj bodova iz igre mora biti 162.');
      return;
    }

    // Ponovno izračunaj zvanja i rezultat
    this.calculateBids();
    this.calculateCurrentRound();

    const index = this.editingRoundIndex;

    // Makni stari rezultat runde iz ukupnog rezultata
    const oldRound = this.rounds[index];

    this.teams[0].score -= oldRound.team1Total;
    this.teams[1].score -= oldRound.team2Total;

    // Spremi novu verziju runde
    const updatedRound: Round = {
      ...this.currentRound,
      bids: this.currentRound.bids.map(bid => ({ ...bid }))
    };

    this.rounds[index] = updatedRound;

    // Dodaj novi rezultat
    this.teams[0].score += updatedRound.team1Total;
    this.teams[1].score += updatedRound.team2Total;

    // Izađi iz moda uređivanja
    this.currentRound = null;
    this.editingRoundIndex = null;
    this.manualTeam = -1;

    // Ponovno provjeri je li netko dosegao cilj
    this.checkWinner();

    this.cdr.detectChanges();
  }

  cancelEdit() {
    this.currentRound = null;
    this.editingRoundIndex = null;
    this.manualTeam = -1;

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


    let team1Bids = 0;

    let team2Bids = 0;


    for (
      const bid of this.currentRound.bids
    ) {

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


    this.calculateCurrentRound();

  }


  updateTeam1Points() {

    if (!this.currentRound) {
      return;
    }

    this.manualTeam = 0;

    const value = this.currentRound.team1Points as any;

    if (
      value === '' ||
      value === null ||
      value === undefined
    ) {
      this.currentRound.team2Points = 0;
      this.currentRound.team1Total = 0;
      this.currentRound.team2Total = 0;
      return;
    }

    let points = Number(value);

    if (isNaN(points)) {
      return;
    }

    points = Math.max(
      0,
      Math.min(
        this.GAME_POINTS,
        points
      )
    );

    this.currentRound.team1Points = points;

    if (!this.currentRound.stiglja) {

      this.currentRound.team2Points =
        this.GAME_POINTS - points;

    }

    this.calculateCurrentRound();

    this.cdr.detectChanges();
  }


  updateTeam2Points() {

    if (!this.currentRound) {
      return;
    }

    this.manualTeam = 1;

    const value = this.currentRound.team2Points as any;

    if (
      value === '' ||
      value === null ||
      value === undefined
    ) {
      this.currentRound.team1Points = 0;
      this.currentRound.team1Total = 0;
      this.currentRound.team2Total = 0;
      return;
    }

    let points = Number(value);

    if (isNaN(points)) {
      return;
    }

    points = Math.max(
      0,
      Math.min(
        this.GAME_POINTS,
        points
      )
    );

    this.currentRound.team2Points = points;

    if (!this.currentRound.stiglja) {

      this.currentRound.team1Points =
        this.GAME_POINTS - points;

    }

    this.calculateCurrentRound();

    this.cdr.detectChanges();
  }


  updateStiglja() {

    if (!this.currentRound) {
      return;
    }


    if (this.currentRound.stiglja) {

      if (
        this.currentRound.stigljaTeam === -1
      ) {

        this.currentRound.team1Points = 0;

        this.currentRound.team2Points =
          this.GAME_POINTS;

      }

      else if (
        this.currentRound.stigljaTeam === 0
      ) {

        this.currentRound.team1Points = 0;

        this.currentRound.team2Points =
          this.GAME_POINTS;

        this.manualTeam = 1;

      }

      else if (
        this.currentRound.stigljaTeam === 1
      ) {

        this.currentRound.team2Points = 0;

        this.currentRound.team1Points =
          this.GAME_POINTS;

        this.manualTeam = 0;

      }

    }

    else {

      this.currentRound.stigljaTeam = -1;


      if (this.manualTeam === 0) {

        this.currentRound.team2Points =
          this.GAME_POINTS -
          Number(
            this.currentRound.team1Points
          );

      }

      else if (this.manualTeam === 1) {

        this.currentRound.team1Points =
          this.GAME_POINTS -
          Number(
            this.currentRound.team2Points
          );

      }

    }


    this.calculateCurrentRound();

    this.cdr.detectChanges();

  }


  setStigljaTeam(
    teamIndex: number
  ) {

    if (!this.currentRound) {
      return;
    }


    this.currentRound.stiglja =
      true;


    this.currentRound.stigljaTeam =
      teamIndex;


    if (teamIndex === 0) {

      this.currentRound.team1Points = 0;

      this.currentRound.team2Points =
        this.GAME_POINTS;

      this.manualTeam = 1;

    }


    else if (teamIndex === 1) {

      this.currentRound.team2Points = 0;

      this.currentRound.team1Points =
        this.GAME_POINTS;

      this.manualTeam = 0;

    }


    this.calculateCurrentRound();

    this.cdr.detectChanges();

  }


  removeStiglja() {

    if (!this.currentRound) {
      return;
    }


    this.currentRound.stiglja =
      false;


    this.currentRound.stigljaTeam =
      -1;


    if (this.manualTeam === 0) {

      this.currentRound.team2Points =
        this.GAME_POINTS -
        Number(
          this.currentRound.team1Points
        );

    }

    else if (this.manualTeam === 1) {

      this.currentRound.team1Points =
        this.GAME_POINTS -
        Number(
          this.currentRound.team2Points
        );

    }


    this.calculateCurrentRound();

    this.cdr.detectChanges();

  }

  calculateCurrentRound() {

    if (!this.currentRound) {
      return;
    }


    const team1Points =
      Number(
        this.currentRound.team1Points
      ) || 0;


    const team2Points =
      Number(
        this.currentRound.team2Points
      ) || 0;


    const team1Bids =
      Number(
        this.currentRound.team1Bids
      ) || 0;


    const team2Bids =
      Number(
        this.currentRound.team2Bids
      ) || 0;

    if (
      team1Points === 0 &&
      team2Points === 0
    ) {

      this.currentRound.team1Total = 0;

      this.currentRound.team2Total = 0;

      this.currentRound.failed = false;

      return;

    }


    const totalRoundValue =
      this.GAME_POINTS +
      team1Bids +
      team2Bids;


    if (
      this.currentRound.stiglja &&
      this.currentRound.stigljaTeam !== -1
    ) {

      if (
        this.currentRound.stigljaTeam === 0
      ) {

        this.currentRound.team1Total = 0;


        this.currentRound.team2Total =
          totalRoundValue +
          this.STIGLJA_POINTS;

      }

      else if (
        this.currentRound.stigljaTeam === 1
      ) {

        this.currentRound.team2Total = 0;


        this.currentRound.team1Total =
          totalRoundValue +
          this.STIGLJA_POINTS;

      }


      this.currentRound.failed = false;

      return;

    }

    if (this.manualTeam === 0) {

      this.currentRound.team2Points =
        Math.max(
          0,
          this.GAME_POINTS -
          team1Points
        );

    }

    else if (this.manualTeam === 1) {

      this.currentRound.team1Points =
        Math.max(
          0,
          this.GAME_POINTS -
          team2Points
        );

    }

    const finalTeam1Points =
      Number(
        this.currentRound.team1Points
      ) || 0;


    const finalTeam2Points =
      Number(
        this.currentRound.team2Points
      ) || 0;

    const callerTeam =
      this.getTeamIndexByPlayer(
        this.currentRound.caller
      );


    if (callerTeam === -1) {

      this.currentRound.team1Total =
        finalTeam1Points +
        team1Bids;


      this.currentRound.team2Total =
        finalTeam2Points +
        team2Bids;


      this.currentRound.failed = false;

      return;

    }


    const requiredPoints =
      Math.floor(totalRoundValue / 2) + 1;

    if (callerTeam === 0) {

      if (finalTeam1Points + team1Bids < requiredPoints) {

        this.currentRound.failed = true;

        this.currentRound.team1Total = 0;

        this.currentRound.team2Total =
          totalRoundValue;

      }

      else {

        this.currentRound.failed = false;

        this.currentRound.team1Total =
          finalTeam1Points +
          team1Bids;

        this.currentRound.team2Total =
          finalTeam2Points +
          team2Bids;

      }

    }


    else if (callerTeam === 1) {

      if (finalTeam2Points + team2Bids < requiredPoints) {

        this.currentRound.failed = true;

        this.currentRound.team2Total = 0;

        this.currentRound.team1Total =
          totalRoundValue;

      }

      else {

        this.currentRound.failed = false;

        this.currentRound.team1Total =
          finalTeam1Points +
          team1Bids;

        this.currentRound.team2Total =
          finalTeam2Points +
          team2Bids;

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
      this.currentRound.stigljaTeam === -1
    ) {

      alert(
        'Odaberite koja je ekipa imala štiglju.'
      );

      return;

    }

    const team1Points =
      Number(
        this.currentRound.team1Points
      ) || 0;


    const team2Points =
      Number(
        this.currentRound.team2Points
      ) || 0;


    if (
      !this.currentRound.stiglja &&
      team1Points + team2Points !==
      this.GAME_POINTS
    ) {

      alert(
        'Zbroj bodova iz igre mora biti 162.'
      );

      return;

    }

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

    this.teams[0].score +=
      savedRound.team1Total;


    this.teams[1].score +=
      savedRound.team2Total;

    this.checkWinner();

    this.currentRound = null;

    this.manualTeam = -1;


    this.cdr.detectChanges();

  }

  checkWinner() {
    const team1Score = this.teams[0].score;
    const team2Score = this.teams[1].score;

    const team1Reached = team1Score >= this.targetScore;
    const team2Reached = team2Score >= this.targetScore;

    let winner = -1;

    // Ako su obje ekipe dosegle cilj u istoj rundi,
    // pobjeđuje ona s više bodova.
    if (team1Reached && team2Reached) {
      if (team1Score > team2Score) {
        winner = 0;
      } else if (team2Score > team1Score) {
        winner = 1;
      }
    }

    // Samo Tim 1 je dosegao cilj
    else if (team1Reached) {
      winner = 0;
    }

    // Samo Tim 2 je dosegao cilj
    else if (team2Reached) {
      winner = 1;
    }

    if (winner !== -1) {
      this.partyWins[winner]++;
      this.partyFinished = true;
      this.winnerTeam = winner;
    }
  }

  startNewParty() {
    if (!this.partyFinished) {
      return;
    }

    this.partyNumber++;

    this.teams[0].score = 0;
    this.teams[1].score = 0;

    this.rounds = [];

    this.currentRound = null;

    this.partyFinished = false;

    this.winnerTeam = -1;

    this.manualTeam = -1;

    this.cdr.detectChanges();
  }

  getTeamIndexByPlayer(
    username: string
  ): number {

    if (!username) {
      return -1;
    }


    for (
      let i = 0;
      i < this.teams.length;
      i++
    ) {

      const found =
        this.teams[i]
          .players
          .some(
            player =>
              player.username === username
          );


      if (found) {
        return i;
      }

    }


    return -1;

  }

  getRoundResult(
    round: Round
  ): string {

    return `${round.team1Total} : ${round.team2Total}`;

  }

  getTotalBids(): number {

    if (!this.currentRound) {
      return 0;
    }


    return (
      this.currentRound.team1Bids +
      this.currentRound.team2Bids
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


  getTeam1Preview(): number {

    if (!this.currentRound) {
      return 0;
    }


    return this.currentRound.team1Total;

  }

  getTeam2Preview(): number {

    if (!this.currentRound) {
      return 0;
    }


    return this.currentRound.team2Total;

  }

  getStigljaPoints(
    teamIndex: number
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
      this.currentRound.stigljaTeam ===
      teamIndex
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
      round.stigljaTeam === 0
    ) {

      return 'Štiglja – Tim 1';

    }


    if (
      round.stigljaTeam === 1
    ) {

      return 'Štiglja – Tim 2';

    }


    return '';

  }

}