
import {
  Component,
  ChangeDetectorRef,
  inject,
  OnInit
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { AuthService } from '../../services/auth';

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

  private cdr = inject(ChangeDetectorRef);


  players: GamePlayer[] = [];

  targetScore = 0;


  ngOnInit() {

    this.route.queryParams.subscribe(params => {

      const playersParam =
        params['players'];

      /*
        Dohvaćamo cilj igre.

        Primjeri:
        501
        701
        1001
      */

      this.targetScore =
        Number(params['target']) || 0;


      console.log(
        'CILJ IGRE:',
        this.targetScore
      );


      if (!playersParam) {

        console.log(
          'Nema odabranih igrača.'
        );

        return;

      }


      /*
        Pretvaramo ID-eve iz URL-a
        u niz brojeva.
      */

      const playerIds: number[] =
        playersParam
          .split(',')
          .map(
            (id: string) => Number(id)
          )
          .filter(
            (id: number) => !isNaN(id)
          );


      console.log(
        'ID-EVI IGRAČA:',
        playerIds
      );


      /*
        Dohvaćamo korisnike iz baze.
      */

      this.authService
        .getUsers()
        .subscribe({

          next: (users) => {

            /*
              Prema ID-evima iz URL-a
              pronalazimo korisnike.
            */

            this.players =
              playerIds
                .map(id => {

                  const user =
                    users.find(
                      (user: any) =>
                        Number(user.id) === id
                    );


                  if (!user) {
                    return null;
                  }


                  return {
                    id: Number(user.id),
                    username: user.username
                  };

                })
                .filter(
                  (
                    player
                  ): player is GamePlayer =>
                    player !== null
                );


            console.log(
              'IGRAČI:',
              this.players
            );

            console.log(
              'BROJ IGRAČA:',
              this.players.length
            );


            /*
              Ručno osvježavanje prikaza.
              Ostavljamo ga zasad jer ti je
              ranije rješavao problem s prikazom.
            */

            this.cdr.detectChanges();

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