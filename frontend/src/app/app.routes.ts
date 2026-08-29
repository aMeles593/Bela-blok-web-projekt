import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Players } from './players/players';
import { Register } from './register/register';
import { Login } from './login/login';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'players',
    component: Players
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'login',
    component: Login
  }
];