import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

interface PlayerSlot {
  id: number;
  selectedId: number | null;
  search: string;
}

@Component({
  selector: 'app-players',
  imports: [FormsModule],
  templateUrl: './players.html',
  styleUrl: './players.scss'
})
export class Players implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  playerCount = 2;

  users: any[] = [];

  players: PlayerSlot[] = [];


  ngOnInit() {

    this.route.queryParams.subscribe(params => {

      this.playerCount = Number(params['count']) || 2;

      this.players = Array.from(
        { length: this.playerCount },
        (_, index) => ({
          id: index,
          selectedId: null,
          search: ''
        })
      );

    });


    this.authService.getUsers().subscribe({

      next: (users) => {
        this.users = users;
      },

      error: (error) => {
        console.error(
          'Greška kod dohvaćanja korisnika:',
          error
        );
      }

    });

  }


  getAvailableUsers(playerIndex: number) {

    const currentPlayer =
      this.players[playerIndex];

    if (!currentPlayer) {
      return [];
    }


    const search =
      currentPlayer.search
        .toLowerCase()
        .trim();


    const selectedByOthers =
      this.players
        .filter(player =>
          player.id !== currentPlayer.id &&
          player.selectedId !== null
        )
        .map(player =>
          player.selectedId
        );


    return this.users.filter(user => {

      const alreadySelected =
        selectedByOthers.includes(user.id);

      const matchesSearch =
        user.username
          .toLowerCase()
          .includes(search);

      return !alreadySelected && matchesSearch;

    });

  }


  onSearchInput(
    playerIndex: number,
    event: Event
  ) {

    const input =
      event.target as HTMLInputElement;

    const player =
      this.players[playerIndex];

    if (!player) {
      return;
    }

    player.search =
      input.value;

    player.selectedId = null;

  }


  selectPlayer(
    playerIndex: number,
    user: any
  ) {

    const player =
      this.players[playerIndex];

    if (!player) {
      return;
    }

    player.selectedId =
      user.id;

    player.search =
      user.username;

  }


  removePlayer(playerIndex: number) {

    const player =
      this.players[playerIndex];

    if (!player) {
      return;
    }

    player.selectedId = null;
    player.search = '';

  }

startGame() {

    const allSelected =
      this.players.every(
        player => player.selectedId !== null
      );

    if (!allSelected) {
      return;
    }

    const selectedPlayerIds =
      this.players.map(
        player => player.selectedId
      );

    console.log(
      'Odabrani igrači:',
      selectedPlayerIds
    );

    this.router.navigate(
      ['/game'],
      {
        queryParams: {
          players: selectedPlayerIds.join(',')
        }
      }
    );

  }

}