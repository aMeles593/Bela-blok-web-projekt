
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-game-options',
  standalone: true,
  templateUrl: './game-options.html',
  styleUrl: './game-options.scss'
})
export class GameOptions {

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  playerCount = 0;

  targetScores = [501, 701, 1001];

  ngOnInit() {

    this.route.queryParams.subscribe(params => {

      this.playerCount = Number(params['players']);

      console.log(
        'Broj igrača:',
        this.playerCount
      );

    });

  }


  selectTargetScore(score: number) {

    console.log(
      'Odabrani cilj:',
      score
    );

    this.router.navigate(
      ['/players'],
      {
        queryParams: {
          count: this.playerCount,
          target: score
        }
      }
    );

  }

}
