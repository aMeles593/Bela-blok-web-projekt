
import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  AuthService
} from '../services/auth';


interface User {
  id: number;
  username: string;
}


interface PlayerSlot {
  id: number;
  search: string;
  selectedId: number | null;
}


@Component({
  selector: 'app-players',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './players.html',
  styleUrl: './players.scss'
})
export class Players implements OnInit {

  private route = inject(ActivatedRoute);

  private router = inject(Router);

  private authService = inject(AuthService);


  /*
    Broj igrača koji smo odabrali
    na početnoj stranici.
  */

  playerCount = 0;


  /*
    Cilj igre:
    501, 701 ili 1001.
  */

  targetScore = 0;


  /*
    Svi registrirani korisnici.
  */

  users: User[] = [];


  /*
    Mjesta za igrače.

    Svaki igrač ima:
    - id
    - tekst pretrage
    - odabranog korisnika
  */

  players: PlayerSlot[] = [];


  ngOnInit() {

    this.route.queryParams.subscribe(params => {

      /*
        Dohvaćamo broj igrača.

        Primjer:
        ?count=4&target=701
      */

      this.playerCount =
        Number(params['count']) || 0;


      /*
        Dohvaćamo cilj igre.
      */

      this.targetScore =
        Number(params['target']) || 0;


      console.log(
        'BROJ IGRAČA:',
        this.playerCount
      );

      console.log(
        'CILJ IGRE:',
        this.targetScore
      );


      /*
        Ako je broj igrača ispravan,
        napravimo toliko mjesta.
      */

      this.players =
        Array.from(
          { length: this.playerCount },
          (_, index) => ({

            id: index,

            search: '',

            selectedId: null

          })
        );


      /*
        Dohvaćamo registrirane korisnike.
      */

      this.loadUsers();

    });

  }


  /*
    Dohvaćanje korisnika iz baze.
  */

  loadUsers() {

    this.authService
      .getUsers()
      .subscribe({

        next: (users) => {

          this.users =
            users.map(
              (user: any) => ({

                id: Number(user.id),

                username: user.username

              })
            );


          console.log(
            'KORISNICI:',
            this.users
          );

        },


        error: (error) => {

          console.error(
            'Greška kod dohvaćanja korisnika:',
            error
          );

        }

      });

  }


  /*
    Poziva se svaki put kada
    korisnik nešto upiše u input.
  */

  onSearchInput(
    playerId: number,
    event: Event
  ) {

    const input =
      event.target as HTMLInputElement;


    const player =
      this.players.find(
        p => p.id === playerId
      );


    if (!player) {
      return;
    }


    /*
      Spremamo tekst samo za
      TOG igrača.
    */

    player.search =
      input.value;


    /*
      Ako je korisnik promijenio
      već odabrano ime, poništavamo
      stari odabir.
    */

    if (
      player.selectedId !== null
    ) {

      const selectedUser =
        this.users.find(
          user =>
            user.id === player.selectedId
        );


      if (
        !selectedUser ||
        selectedUser.username !==
        player.search
      ) {

        player.selectedId = null;

      }

    }

  }


  /*
    Dohvaća korisnike koji odgovaraju
    tekstu koji je igrač upisao.
  */

  getAvailableUsers(
    playerId: number
  ): User[] {

    const player =
      this.players.find(
        p => p.id === playerId
      );


    if (!player) {
      return [];
    }


    const search =
      player.search
        .toLowerCase()
        .trim();


    if (!search) {
      return [];
    }


    /*
      Korisnici koji su već odabrani
      kod drugih igrača.
    */

    const selectedIds =
      this.players
        .filter(
          p =>
            p.id !== playerId &&
            p.selectedId !== null
        )
        .map(
          p =>
            p.selectedId
        );


    /*
      Filtriramo prema usernameu
      i izbacujemo već odabrane.
    */

    return this.users
      .filter(user =>
        user.username
          .toLowerCase()
          .includes(search)
      )
      .filter(user =>
        !selectedIds.includes(user.id)
      )
      .slice(0, 8);

  }


  /*
    Odabir korisnika iz prijedloga.
  */

  selectPlayer(
    playerId: number,
    user: User
  ) {

    const player =
      this.players.find(
        p => p.id === playerId
      );


    if (!player) {
      return;
    }


    /*
      Provjeravamo je li korisnik
      već odabran kod drugog igrača.
    */

    const alreadySelected =
      this.players.some(
        p =>
          p.id !== playerId &&
          p.selectedId === user.id
      );


    if (alreadySelected) {

      return;

    }


    /*
      Spremamo korisnika na
      TOČNO mjesto tog igrača.
    */

    player.selectedId =
      user.id;


    player.search =
      user.username;


    console.log(
      'ODABRAN IGRAČ:',
      playerId,
      user.username
    );

  }


  /*
    Uklanjanje igrača.
  */

  removePlayer(
    playerId: number
  ) {

    const player =
      this.players.find(
        p => p.id === playerId
      );


    if (!player) {
      return;
    }


    player.selectedId =
      null;


    player.search =
      '';

  }


  /*
    Pokretanje igre.
  */

  startGame() {

    /*
      Provjeravamo jesu li svi igrači
      odabrani.
    */

    const allSelected =
      this.players.every(
        player =>
          player.selectedId !== null
      );


    if (!allSelected) {

      alert(
        'Odaberite sve igrače prije početka igre.'
      );

      return;

    }


    /*
      Provjeravamo cilj igre.
    */

    if (
      this.targetScore !== 501 &&
      this.targetScore !== 701 &&
      this.targetScore !== 1001
    ) {

      alert(
        'Nije odabran ispravan cilj igre.'
      );

      return;

    }


    /*
      Uzimamo ID-eve igrača
      redoslijedom kojim su odabrani.
    */

    const playerIds =
      this.players.map(
        player =>
          player.selectedId!
      );


    console.log(
      'ODABRANI IGRAČI:',
      playerIds
    );


    console.log(
      'CILJ IGRE:',
      this.targetScore
    );


    /*
      Šaljemo sve prema Game komponenti.
    */

    this.router.navigate(
      ['/game'],
      {
        queryParams: {

          players:
            playerIds.join(','),

          target:
            this.targetScore

        }
      }
    );

  }

}
