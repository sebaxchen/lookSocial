import { Routes } from '@angular/router';
import { authGuard } from './auth/application/guards/auth.guard';

// Lazy load all routes for better performance
const landing = () => import('./shared/presentation/views/landing/landing').then(m => m.LandingComponent);
const splash = () => import('./shared/presentation/views/splash/splash').then(m => m.SplashComponent);
const home = () => import('./shared/presentation/views/home/home').then(m => m.Home);
const dashboard = () => import('./shared/presentation/views/dashboard/dashboard').then(m => m.DashboardComponent);
const about = () => import('./shared/presentation/views/about/about').then(m => m.About);
const groups = () => import('./shared/presentation/views/groups/groups').then(m => m.GroupsComponent);
const calendar = () => import('./shared/presentation/views/calendar/calendar').then(m => m.CalendarComponent);
const sharedFiles = () => import('./shared/presentation/views/shared-files/shared-files').then(m => m.SharedFilesComponent);
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
  { path: 'home', loadComponent: home, title: `${baseTitle} - Inicio`, canActivate: [authGuard] },
  { path: 'dashboard', loadComponent: dashboard, title: `${baseTitle} - Dashboard`, canActivate: [authGuard] },
  { path: 'tasks', loadComponent: about, title: `${baseTitle} - Gestión de Tareas`, canActivate: [authGuard] },
  { path: 'about', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'groups', loadComponent: groups, title: `${baseTitle} - Grupos`, canActivate: [authGuard] },
  { path: 'calendar', loadComponent: calendar, title: `${baseTitle} - Calendario`, canActivate: [authGuard] },
  { path: 'shared-files', loadComponent: sharedFiles, title: `${baseTitle} - Archivos`, canActivate: [authGuard] },
  { path: 'learning', loadChildren: () =>
  import('./learning/presentation/views/learning.routes').then(m => m.learningRoutes), canActivate: [authGuard]},
  { path: 'landing', redirectTo: '/', pathMatch: 'full' },
  { path: '**', loadComponent: pageNotFound, title: `${baseTitle} - Page Not Found` },
];
