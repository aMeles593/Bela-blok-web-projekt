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

  /*
    Štiglja
  */
  stiglja: boolean;

  /*
    Tim koji je imao štiglju.
    0 = Tim 1
    1 = Tim 2
    -1 = nema štiglje
  */
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


  /*
    Ekipe
  */

  teams: Team[] = [];


  /*
    Odigrane runde
  */

  rounds: Round[] = [];


  /*
    Trenutna runda
  */

  currentRound: Round | null = null;


  /*
    Koji tim trenutno ručno
    unosi bodove?

    0 = Tim 1
    1 = Tim 2
    -1 = još nije odabran
  */

  manualTeam = -1;


  /*
    Je li igra završila?
  */

  gameFinished = false;


  /*
    Pobjednička ekipa
  */

  winnerTeam = -1;

    /*
    Broj osvojenih partija.

    0 = Tim 1
    1 = Tim 2
  */
  gamesWon: number[] = [0, 0];


  /*
    Bodovi iz jedne normalne runde
  */

  readonly GAME_POINTS = 162;


  /*
    Bonus za štiglju
  */

  readonly STIGLJA_POINTS = 90;


  /*
    Kada se učitaju igrači,
    napravimo dvije ekipe.
  */

  ngOnChanges(changes: SimpleChanges) {

    if (
      changes['players'] &&
      this.players.length === 4
    ) {

      this.createTeams();

    }

  }


  /*
    TIM 1:
    Igrač 1 + Igrač 2

    TIM 2:
    Igrač 3 + Igrač 4
  */

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


  /*
    Vraća imena igrača ekipe.
  */

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


  /*
    Otvaranje nove runde.
  */

  openNewRound() {

    if (this.gameFinished) {
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


  /*
    Dodavanje zvanja.
  */

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


  /*
    Brisanje zvanja.
  */

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


  /*
    Računanje zvanja po ekipama.
  */

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


  /*
    KORISNIK UNOSI BODOVE ZA TIM 1.
    
    Tim 2 se automatski računa:
    
    162 - Tim 1
  */

  updateTeam1Points() {

    if (!this.currentRound) {
      return;
    }

    this.manualTeam = 0;

    const value = this.currentRound.team1Points as any;

    // Ako je input trenutno prazan,
    // ne računamo ništa.
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

    // Ograničenje 0 - 162
    points = Math.max(
      0,
      Math.min(
        this.GAME_POINTS,
        points
      )
    );

    this.currentRound.team1Points = points;

    // Ako nije štiglja,
    // Tim 2 automatski dobiva ostatak.
    if (!this.currentRound.stiglja) {

      this.currentRound.team2Points =
        this.GAME_POINTS - points;

    }

    this.calculateCurrentRound();

    this.cdr.detectChanges();
  }


    /*
      KORISNIK UNOSI BODOVE ZA TIM 2.
      
      Tim 1 se automatski računa:
      
      162 - Tim 2
    */

  updateTeam2Points() {

    if (!this.currentRound) {
      return;
    }

    this.manualTeam = 1;

    const value = this.currentRound.team2Points as any;

    // Ako je input trenutno prazan,
    // ne računamo ništa.
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

    // Ograničenje 0 - 162
    points = Math.max(
      0,
      Math.min(
        this.GAME_POINTS,
        points
      )
    );

    this.currentRound.team2Points = points;

    // Ako nije štiglja,
    // Tim 1 automatski dobiva ostatak.
    if (!this.currentRound.stiglja) {

      this.currentRound.team1Points =
        this.GAME_POINTS - points;

    }

    this.calculateCurrentRound();

    this.cdr.detectChanges();
  }


  /*
    Promjena štiglje.
  */

  updateStiglja() {

    if (!this.currentRound) {
      return;
    }


    /*
      Ako je štiglja uključena,
      korisnik mora odabrati
      koja je ekipa imala 0.
    */

    if (this.currentRound.stiglja) {

      /*
        Ako još nije odabran tim,
        ne mijenjamo bodove.
      */

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

        /*
          Tim 1 ima 0.
        */

        this.currentRound.team1Points = 0;

        this.currentRound.team2Points =
          this.GAME_POINTS;

        this.manualTeam = 1;

      }

      else if (
        this.currentRound.stigljaTeam === 1
      ) {

        /*
          Tim 2 ima 0.
        */

        this.currentRound.team2Points = 0;

        this.currentRound.team1Points =
          this.GAME_POINTS;

        this.manualTeam = 0;

      }

    }

    else {

      /*
        Ako se štiglja isključi,
        vraćamo normalno računanje
        prema ručno odabranom timu.
      */

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


  /*
    Odabir ekipe koja ima štiglju.
  */

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


    /*
      Ako Tim 1 ima štiglju:
      Tim 1 = 0
      Tim 2 = 162
    */

    if (teamIndex === 0) {

      this.currentRound.team1Points = 0;

      this.currentRound.team2Points =
        this.GAME_POINTS;

      this.manualTeam = 1;

    }


    /*
      Ako Tim 2 ima štiglju:
      Tim 2 = 0
      Tim 1 = 162
    */

    else if (teamIndex === 1) {

      this.currentRound.team2Points = 0;

      this.currentRound.team1Points =
        this.GAME_POINTS;

      this.manualTeam = 0;

    }


    this.calculateCurrentRound();

    this.cdr.detectChanges();

  }


  /*
    Isključivanje štiglje.
  */

  removeStiglja() {

    if (!this.currentRound) {
      return;
    }


    this.currentRound.stiglja =
      false;


    this.currentRound.stigljaTeam =
      -1;


    /*
      Ponovno računamo bodove
      prema ekipi koju je korisnik
      zadnju ručno unosio.
    */

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


  /*
    Glavni izračun trenutne runde.
  */

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


    /*
      Ako nema bodova,
      nema rezultata.
    */

    if (
      team1Points === 0 &&
      team2Points === 0
    ) {

      this.currentRound.team1Total = 0;

      this.currentRound.team2Total = 0;

      this.currentRound.failed = false;

      return;

    }


    /*
      Vrijednost cijele runde:

      162 + sva zvanja
    */

    const totalRoundValue =
      this.GAME_POINTS +
      team1Bids +
      team2Bids;


    /*
      ŠTIGLJA
    */

    if (
      this.currentRound.stiglja &&
      this.currentRound.stigljaTeam !== -1
    ) {

      /*
        Tim 1 ima štiglju.
      */

      if (
        this.currentRound.stigljaTeam === 0
      ) {

        this.currentRound.team1Total = 0;


        this.currentRound.team2Total =
          totalRoundValue +
          this.STIGLJA_POINTS;

      }


      /*
        Tim 2 ima štiglju.
      */

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


    /*
      Ako nema štiglje,
      osiguravamo da je zbroj 162.
    */

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


    /*
      Ponovno dohvaćamo vrijednosti
      nakon automatskog izračuna.
    */

    const finalTeam1Points =
      Number(
        this.currentRound.team1Points
      ) || 0;


    const finalTeam2Points =
      Number(
        this.currentRound.team2Points
      ) || 0;


    /*
      Ako još nije odabran
      igrač koji je zvao,
      samo prikažemo normalan
      zbroj.
    */

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


    /*
      Koliko treba za prolaz?

      Mora biti VIŠE od polovice
      ukupne vrijednosti runde.

      Primjer:

      162 + 20 zvanja = 182

      182 / 2 = 91

      Potrebno = 92
    */
    /* 
      KOLIKO TREBA ZA PROLAZ
    */
    const requiredPoints =
      Math.floor(totalRoundValue / 2) + 1;


    /*
      TIM 1 JE ZVAO
    */
    if (callerTeam === 0) {

      /*
        Tim 1 mora imati više od polovice
        ukupne vrijednosti runde.
      */
      if (finalTeam1Points < requiredPoints) {

        /*
          TIM 1 JE PAO.

          Tim 1 dobiva 0 bodova.

          Tim 2 dobiva CIJELU vrijednost
          runde uključujući sva zvanja.
        */
        this.currentRound.failed = true;

        this.currentRound.team1Total = 0;

        this.currentRound.team2Total =
          totalRoundValue;

      }

      else {

        /*
          TIM 1 JE PROŠAO.

          Svaka ekipa dobiva svoje
          bodove iz igre + svoja zvanja.
        */
        this.currentRound.failed = false;

        this.currentRound.team1Total =
          finalTeam1Points +
          team1Bids;

        this.currentRound.team2Total =
          finalTeam2Points +
          team2Bids;

      }

    }


    /*
      TIM 2 JE ZVAO
    */
    else if (callerTeam === 1) {

      /*
        Tim 2 mora imati više od polovice
        ukupne vrijednosti runde.
      */
      if (finalTeam2Points < requiredPoints) {

        /*
          TIM 2 JE PAO.

          Tim 2 dobiva 0.

          Tim 1 dobiva CIJELU vrijednost
          runde uključujući sva zvanja.
        */
        this.currentRound.failed = true;

        this.currentRound.team2Total = 0;

        this.currentRound.team1Total =
          totalRoundValue;

      }

      else {

        /*
          TIM 2 JE PROŠAO.

          Svaka ekipa dobiva svoje
          bodove iz igre + svoja zvanja.
        */
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


  /*
    Spremanje runde.
  */

  saveRound() {

    if (!this.currentRound) {
      return;
    }


    /*
      Mora biti odabrano
      tko je zvao.
    */

    if (
      this.currentRound.caller === ''
    ) {

      alert(
        'Odaberite tko je zvao.'
      );

      return;

    }


    /*
      Mora biti odabran adut.
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
      Ako je štiglja uključena,
      mora biti odabran tim.
    */

    if (
      this.currentRound.stiglja &&
      this.currentRound.stigljaTeam === -1
    ) {

      alert(
        'Odaberite koja je ekipa imala štiglju.'
      );

      return;

    }


    /*
      Ako nije štiglja,
      bodovi moraju ukupno biti 162.
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
      !this.currentRound.stiglja &&
      team1Points + team2Points !==
      this.GAME_POINTS
    ) {

      alert(
        'Zbroj bodova iz igre mora biti 162.'
      );

      return;

    }


    /*
      Ponovno računamo zvanja
      i rezultat.
    */

    this.calculateBids();

    this.calculateCurrentRound();


    /*
      Spremamo kopiju runde.
    */

    const savedRound: Round = {

      ...this.currentRound,

      bids: [
        ...this.currentRound.bids
      ]

    };


    /*
      Dodajemo rundu.
    */

    this.rounds.push(
      savedRound
    );


    /*
      Dodajemo rezultat ekipama.
    */

    this.teams[0].score +=
      savedRound.team1Total;


    this.teams[1].score +=
      savedRound.team2Total;


    /*
      Provjeravamo pobjednika.
    */

    this.checkWinner();


    /*
      Zatvaramo rundu.
    */

    this.currentRound = null;

    this.manualTeam = -1;


    this.cdr.detectChanges();

  }


  /*
    Provjera pobjednika.
  */
  
  checkWinner() {

    /*
      Ako partija već ima pobjednika,
      ne provjeravamo ponovno.
    */
    if (this.gameFinished) {
      return;
    }

    const team1Score = this.teams[0].score;
    const team2Score = this.teams[1].score;

    /*
      Nitko još nije dosegnuo cilj.
    */
    if (
      team1Score < this.targetScore &&
      team2Score < this.targetScore
    ) {
      return;
    }

    /*
      Obje ekipe su prešle cilj
      u istoj rundi.

      Pobjeđuje ekipa s više bodova.
    */
    if (
      team1Score >= this.targetScore &&
      team2Score >= this.targetScore
    ) {

      if (team1Score > team2Score) {

        this.finishGame(0);

      }
      else if (team2Score > team1Score) {

        this.finishGame(1);

      }

      return;
    }

    /*
      Samo Tim 1 je dosegnuo cilj.
    */
    if (team1Score >= this.targetScore) {

      this.finishGame(0);

      return;
    }

    /*
      Samo Tim 2 je dosegnuo cilj.
    */
    if (team2Score >= this.targetScore) {

      this.finishGame(1);

      return;
    }

  }

  finishGame(teamIndex: number) {

    this.gameFinished = true;

    this.winnerTeam = teamIndex;

    /*
      Povećavamo broj osvojenih partija.
    */
    this.gamesWon[teamIndex]++;

    this.cdr.detectChanges();
  }

  startNewGame() {

    /*
      Rezultat trenutne partije vraćamo na 0:0.
    */
    this.teams[0].score = 0;
    this.teams[1].score = 0;

    /*
      Brišemo odigrane runde.
    */
    this.rounds = [];

    /*
      Brišemo trenutno otvorenu rundu.
    */
    this.currentRound = null;

    /*
      Ponovno omogućujemo igru.
    */
    this.gameFinished = false;

    /*
      Nema pobjednika trenutne partije.
    */
    this.winnerTeam = -1;

    /*
      Nema ručnog unosa.
    */
    this.manualTeam = -1;

    this.cdr.detectChanges();
  }


  /*
    Dohvaća ekipu kojoj igrač pripada.
  */

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


  /*
    Rezultat runde.
  */

  getRoundResult(
    round: Round
  ): string {

    return `${round.team1Total} : ${round.team2Total}`;

  }


  /*
    Ukupna zvanja trenutne runde.
  */

  getTotalBids(): number {

    if (!this.currentRound) {
      return 0;
    }


    return (
      this.currentRound.team1Bids +
      this.currentRound.team2Bids
    );

  }


  /*
    Ukupna vrijednost runde.
  */

  getCurrentRoundValue(): number {

    return (
      this.GAME_POINTS +
      this.getTotalBids()
    );

  }


  /*
    Potrebno za prolaz.
  */

  getRequiredPoints(): number {

    return (
      Math.floor(
        this.getCurrentRoundValue() / 2
      ) + 1
    );

  }


  /*
    Trenutni rezultat Tim 1.
  */

  getTeam1Preview(): number {

    if (!this.currentRound) {
      return 0;
    }


    return this.currentRound.team1Total;

  }


  /*
    Trenutni rezultat Tim 2.
  */

  getTeam2Preview(): number {

    if (!this.currentRound) {
      return 0;
    }


    return this.currentRound.team2Total;

  }


  /*
    Koliko bodova štiglje
    ide pojedinom timu.
  */

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


  /*
    Tekst PROŠAO / PAD.
  */

  getRoundStatus(): string {

    if (!this.currentRound) {
      return '';
    }


    if (
      this.currentRound.failed
    ) {

      return 'PAD';

    }


    /*
      Ako još nema pozivatelja,
      nema statusa.
    */

    if (
      this.currentRound.caller === ''
    ) {

      return '';

    }


    return 'PROŠAO';

  }


  /*
    Tekst za štiglju.
  */

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