import { Routes } from '@angular/router';
import { MainLayout } from './core/layouts/main-layouts';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/noAuth.guard';

export const routes: Routes = [
    {
        path: '',
        component: MainLayout,
        children: [
            {
                path: '',
                loadComponent: () => import('./features/home/home').then(m => m.Home)
            },
            {
                path: 'home',
                loadComponent: () => import('./features/home/home').then(m => m.Home)
            },
            {
                path: 'auth',
                loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
                canActivate: [noAuthGuard]
            },
            {
                path: 'about-me',
                loadComponent: () => import('./features/about-me/about-me').then(m => m.AboutMe),
                canActivate: [authGuard]
            },
            {
                path: 'games',
                loadComponent: () => import('./features/games/games').then(m => m.Games),
                canActivate: [authGuard]
            },
            {
                path: 'chat',
                loadComponent: () => import('./features/chat/chat').then(m => m.Chat),
                canActivate: [authGuard]
            },
            {
                path: 'top',
                loadComponent: () => import('./features/top/top').then(m => m.TopComponent),
                canActivate: [authGuard]
            },
            {
                path: '**',
                loadComponent: () => import('./features/home/home').then(m => m.Home)
            }
        ]
    },
    // {
    //     path: 'auth',
    //     loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
    // },
    {
        path: '**',
        loadComponent: () => import('./features/home/home').then(m => m.Home)
    }

];
