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

  /*
    Tim koji je zadnji ručno unosio bodove.

    0 = Tim 1
    1 = Tim 2
    null = ništa još nije uneseno
  */
  manualTeam: 0 | 1 | null = null;


  ngOnInit() {

    this.createTeams();

  }


  // ==========================================
  // TIMOVI
  // ==========================================

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


  // ==========================================
  // NOVA RUNDA
  // ==========================================

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

    this.manualTeam = null;

  }


  // ==========================================
  // BODOVI
  // ==========================================

  updateTeam1Points() {

    if (!this.currentRound) {
      return;
    }

    this.manualTeam = 0;

    let points =
      Number(this.currentRound.team1Points);

    if (isNaN(points)) {
      points = 0;
    }

    if (points < 0) {
      points = 0;
    }

    if (points > 162) {
      points = 162;
    }

    this.currentRound.team1Points = points;

    this.currentRound.team2Points =
      162 - points;

  }


  updateTeam2Points() {

    if (!this.currentRound) {
      return;
    }

    this.manualTeam = 1;

    let points =
      Number(this.currentRound.team2Points);

    if (isNaN(points)) {
      points = 0;
    }

    if (points < 0) {
      points = 0;
    }

    if (points > 162) {
      points = 162;
    }

    this.currentRound.team2Points = points;

    this.currentRound.team1Points =
      162 - points;

  }


  // ==========================================
  // ZVANJA
  // ==========================================

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

  }


  // ==========================================
  // PREGLED BODOVA
  // ==========================================

  getTeam1Preview() {

    if (!this.currentRound) {
      return 0;
    }

    return (
      Number(
        this.currentRound.team1Points
      ) || 0
    );

  }


  getTeam2Preview() {

    if (!this.currentRound) {
      return 0;
    }

    return (
      Number(
        this.currentRound.team2Points
      ) || 0
    );

  }


  getTeam1TotalPreview() {

    if (!this.currentRound) {
      return 0;
    }

    return (
      this.getTeam1Preview() +
      this.currentRound.team1Bids
    );

  }


  getTeam2TotalPreview() {

    if (!this.currentRound) {
      return 0;
    }

    return (
      this.getTeam2Preview() +
      this.currentRound.team2Bids
    );

  }


  getTotalRoundPoints() {

    if (!this.currentRound) {
      return 162;
    }

    return (
      162 +
      this.currentRound.team1Bids +
      this.currentRound.team2Bids
    );

  }


  getCallerTeam(): number {

    if (!this.currentRound) {
      return -1;
    }

    return this.getTeamIndexByPlayer(
      this.currentRound.caller
    );

  }


  // ==========================================
  // PROLAZ / PAD
  // ==========================================

  getRoundStatus(): string {

    if (!this.currentRound) {
      return '';
    }

    const callerTeam =
      this.getCallerTeam();


    if (callerTeam === -1) {
      return '';
    }


    const totalPoints =
      this.getTotalRoundPoints();


    let callerTotal = 0;


    if (callerTeam === 0) {

      callerTotal =
        this.getTeam1TotalPreview();

    }

    else {

      callerTotal =
        this.getTeam2TotalPreview();

    }


    /*
      Ekipa koja je zvala mora
      imati VIŠE od polovice ukupnih
      bodova u igri.

      Primjer:

      162 + 20 zvanja = 182

      polovica = 91

      91 ili manje = PAD
      92 ili više = PROŠAO
    */

    const half =
      totalPoints / 2;


    if (callerTotal <= half) {

      return 'PAD';

    }


    return 'PROŠAO';

  }


  // ==========================================
  // SPREMANJE RUNDE
  // ==========================================

  saveRound() {

    if (!this.currentRound) {
      return;
    }


    /*
      Tko je zvao mora biti odabran.
    */

    if (
      this.currentRound.caller === ''
    ) {

      alert(
        'Odaberite igrača koji je zvao.'
      );

      return;

    }


    /*
      Adut mora biti odabran.
    */

    if (
      this.currentRound.trump === ''
    ) {

      alert(
        'Odaberite adut.'
      );

      return;

    }


    /*
      Bodovi moraju biti između 0 i 162.
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
      team1Points < 0 ||
      team1Points > 162 ||
      team2Points < 0 ||
      team2Points > 162
    ) {

      alert(
        'Bodovi moraju biti između 0 i 162.'
      );

      return;

    }


    /*
      Mora biti točno 162 bodova
      iz same igre.
    */

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
      Ukupno bodova u ovoj rundi
      uključujući zvanja.
    */

    const totalRoundPoints =
      162 +
      team1Bids +
      team2Bids;


    /*
      Ekipa koja je zvala.
    */

    const callerTeam =
      this.getTeamIndexByPlayer(
        this.currentRound.caller
      );


    if (
      callerTeam !== 0 &&
      callerTeam !== 1
    ) {

      return;

    }


    /*
      Bodovi ekipe koja je zvala
      uključujući njezina zvanja.
    */

    const callerPoints =
      callerTeam === 0
        ? team1Points + team1Bids
        : team2Points + team2Bids;


    /*
      Mora imati VIŠE od polovice.

      Npr.:
      162 + 20 = 182

      polovica = 91

      91 = PAD
      92 = PROŠAO
    */

    const half =
      totalRoundPoints / 2;


    const failed =
      callerPoints <= half;


    let team1Total = 0;

    let team2Total = 0;


    /*
      AKO JE EKIPA KOJA JE ZVALA PALA
    */

    if (failed) {

      /*
        Ekipa koja je zvala dobiva 0.

        Protivnička ekipa dobiva
        SVE BODOVE IZ RUNDE:

        162 + sva zvanja
      */

      if (callerTeam === 0) {

        team1Total = 0;

        team2Total =
          totalRoundPoints;

      }

      else {

        team2Total = 0;

        team1Total =
          totalRoundPoints;

      }

    }


    /*
      AKO JE EKIPA PROŠLA
    */

    else {

      team1Total =
        team1Points +
        team1Bids;

      team2Total =
        team2Points +
        team2Bids;

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
      Dodajemo bodove ukupnom rezultatu.
    */

    this.teams[0].score +=
      team1Total;

    this.teams[1].score +=
      team2Total;


    /*
      Zatvaramo trenutnu rundu.
    */

    this.currentRound = null;

    this.manualTeam = null;

  }


  // ==========================================
  // POMOĆNE FUNKCIJE
  // ==========================================

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

    if (
      !this.teams[teamIndex]
    ) {

      return '';

    }


    return this.teams[teamIndex]
      .players
      .map(
        player =>
          player.username
      )
      .join(' + ');

  }

}
