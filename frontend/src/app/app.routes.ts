import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Players } from './pages/players/players';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth-guard';
import { Game } from './pages/game/game';
import { GameOptions } from './pages/game-options/game-options';
import { HistoryGames } from './pages/history-games/history-games';

export const routes: Routes = [

  {
    path: '',
    component: Home
  },

  {
    path: 'players',
    component: Players,
    canActivate: [authGuard]
  },

  {
    path: 'register',
    component: Register
  },

  {
    path: 'login',
    component: Login
  },
  {
    path: 'game',
    component: Game,
    canActivate: [authGuard]
  },
  {
    path: 'game-options',
    component: GameOptions
  },
  {
    path: 'history-games',
    component: HistoryGames,
    canActivate: [authGuard]
  }


];