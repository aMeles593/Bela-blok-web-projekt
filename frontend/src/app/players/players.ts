import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-players',
  imports: [FormsModule],
  templateUrl: './players.html',
  styleUrl: './players.scss'
})
export class Players {

  private route = inject(ActivatedRoute);

  playerCount = 2;
  players: string[] = [];

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.playerCount = Number(params['count']) || 2;

      this.players = Array(this.playerCount).fill('');
    });
  }

  startGame() {
    const allNamesEntered = this.players.every(
      name => name.trim().length > 0
    );

    if (!allNamesEntered) {
      return;
    }

    console.log('Igrači:', this.players);
  }
}