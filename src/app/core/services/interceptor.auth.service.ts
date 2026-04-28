import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http'
import { inject } from '@angular/core'
import { SupabaseService } from './supabase.auth.service'
import { from, switchMap } from 'rxjs'

// Interceptor funcional (estilo Angular 17+)
export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
) => {
    const auth = inject(SupabaseService)

    return from(auth.getAccessToken()).pipe(
        switchMap(token => {
            if (!token) return next(req)

            const authReq = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` }
            })
            return next(authReq)
        })
    )
}