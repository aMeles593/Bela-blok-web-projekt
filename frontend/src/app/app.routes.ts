import { Routes } from '@angular/router';

import { Home } from './home/home';
import { Players } from './players/players';
import { Register } from './register/register';
import { Login } from './login/login';
import { authGuard } from './guards/auth-guard';
import { Game } from './game/game';
import { GameOptions } from './game-options/game-options';

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


];