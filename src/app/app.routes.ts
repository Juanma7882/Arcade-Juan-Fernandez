import { Routes } from '@angular/router';
import { MainLayout } from './core/layouts/main-layouts';

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
                path: 'auth',
                loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
            },
            {
                path: 'about-me',
                loadComponent: () => import('./features/about-me/about-me').then(m => m.AboutMe)

            }
        ]
    }
    // {
    //     path: '**',
    //     loadComponent: () => import('./features/not-found/not-found').then(m => m.NotFound)
    // }

];
