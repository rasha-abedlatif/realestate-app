import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Dashboard } from './components/dashboard/dashboard';
import { Admins } from './components/admins/admins';
import { Complexes } from './components/complexes/complexes';
import { Buildings } from './components/buildings/buildings';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'admins', component: Admins, canActivate: [authGuard] },
  { path: 'complexes', component: Complexes, canActivate: [authGuard] },
  { path: 'buildings', component: Buildings, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];