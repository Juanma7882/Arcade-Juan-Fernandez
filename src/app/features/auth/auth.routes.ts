import { Routes } from "@angular/router";

export const AUTH_ROUTES: Routes = [
    {
        path: 'register',
        loadComponent: () => import('./register/register').then(m => m.Register)
    }, {
        path: 'login',
        loadComponent: () => import('./login/login').then(m => m.Login)
    }
]