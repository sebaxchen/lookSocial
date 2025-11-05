import { Routes } from '@angular/router';
import { authGuard } from './auth/application/guards/auth.guard';

// Lazy load all routes for better performance
const landing = () => import('./shared/presentation/views/landing/landing').then(m => m.LandingComponent);
const splash = () => import('./shared/presentation/views/splash/splash').then(m => m.SplashComponent);
const amigos = () => import('./shared/presentation/views/amigos/amigos').then(m => m.AmigosComponent);
const post = () => import('./shared/presentation/views/post/post').then(m => m.PostComponent);
const etiquetas = () => import('./shared/presentation/views/etiquetas/etiquetas').then(m => m.EtiquetasComponent);
const pageNotFound = () => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);
const login = () => import('./shared/presentation/views/login/login').then(m => m.Login);
const register = () => import('./shared/presentation/views/register/register').then(m => m.Register);

const baseTitle = 'NoteTo';
export const routes: Routes = [
  { path: '', loadComponent: landing, title: `${baseTitle} - Inicio` },
  { path: 'splash', loadComponent: splash, title: `${baseTitle} - Bienvenido` },
  { 
    path: 'auth', 
    children: [
      { path: 'login', loadComponent: login, title: `${baseTitle} - Iniciar Sesión` },
      { path: 'register', loadComponent: register, title: `${baseTitle} - Registro` },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: '/auth/register', pathMatch: 'full' },
  { path: 'amigos', loadComponent: amigos, title: `${baseTitle} - Amigos`, canActivate: [authGuard] },
  { path: 'post', loadComponent: post, title: `${baseTitle} - Post`, canActivate: [authGuard] },
  { path: 'etiquetas', loadComponent: etiquetas, title: `${baseTitle} - Etiquetas`, canActivate: [authGuard] },
  { path: 'landing', redirectTo: '/', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `${baseTitle} - Page Not Found` },
];
