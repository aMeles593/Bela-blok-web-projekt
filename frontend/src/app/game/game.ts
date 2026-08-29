
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth';
import { FourPlayer } from './four-player/four-player';

interface GamePlayer {
  id: number;
  username: string;
}

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [FourPlayer],
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements OnInit {

  private route = inject(ActivatedRoute);

  private authService = inject(AuthService);


  players: GamePlayer[] = [];


  ngOnInit() {

    this.route.queryParams.subscribe(params => {

      const playersParam =
        params['players'];


      if (!playersParam) {
        return;
      }


      const playerIds: number[] =
        playersParam
          .split(',')
          .map(
            (id: string) => Number(id)
          );


      this.authService.getUsers()
        .subscribe({

          next: (users) => {

            this.players =
              playerIds
                .map(id => {

                  const user =
                    users.find(
                      (user: any) =>
                        user.id === id
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

            console.log('IGRAČI:', this.players);
            console.log('BROJ IGRAČA:', this.players.length);

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

}
