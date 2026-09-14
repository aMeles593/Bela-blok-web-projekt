import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

interface FourPlayerPoints {
  team1Points: number;
  team2Points: number;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  private socket: Socket;

  constructor() {
    this.socket = io('https://bela-blok-web-backend.onrender.com');

    this.socket.on('connect', () => {
        console.log('Socket.IO spojen:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
        console.log('Socket.IO odspojen');
    });

    this.socket.on('connect_error', (error) => {
        console.error('Socket.IO greška:', error);
    });
  }

  calculateFourPlayerPoints(
    team: number,
    points: number
    ): void {

    console.log(
        'Šaljem Socket.IO podatke:',
        {
        team,
        points
        }
    );

    this.socket.emit('calculate-four-player-points', {
        team,
        points
    });
}

  onFourPlayerPointsCalculated(): Observable<FourPlayerPoints> {
    return new Observable((observer) => {

      this.socket.on(
        'four-player-points-calculated',
        (data: FourPlayerPoints) => {
          observer.next(data);
        }
      );

      return () => {
        this.socket.off('four-player-points-calculated');
      };
    });
  }

  onFourPlayerPointsError(): Observable<any> {
    return new Observable((observer) => {

      this.socket.on(
        'four-player-points-error',
        (data) => {
          observer.next(data);
        }
      );

      return () => {
        this.socket.off('four-player-points-error');
      };
    });
  }
}