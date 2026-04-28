import { Injectable, signal, computed } from '@angular/core'
import { createClient, Session, SupabaseClient, User } from '@supabase/supabase-js'
import { environment } from '../../environments/environment'
// import { BehaviorSubject, Observable } from 'rxjs'

export interface SignUpForm {
    email: string
    password: string
    options: {
        data: {
            nombre: string
            apellido: string
            edad: string
        }
    }
}

@Injectable({
    providedIn: 'root',
})
export class SupabaseService {
    private supabase: SupabaseClient

    // Signal privado — solo el service lo modifica
    private _currentUser = signal<User | null>(null);

    // Signal público de solo lectura
    readonly currentUser = this._currentUser.asReadonly();

    // Computed: signal derivado, se recalcula automáticamente
    readonly isLoggedIn = computed(() => this._currentUser() !== null);
    readonly userEmail = computed(() => this._currentUser()?.email ?? null);

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)

        this.supabase.auth.getSession().then(({ data }) => {
            this._currentUser.set(data.session?.user ?? null)
        })

        this.supabase.auth.onAuthStateChange((_event, session) => {
            this._currentUser.set(session?.user ?? null)
        })
    }

    // Siempre devuelve el AT vigente (Supabase lo refresca si está por vencer)
    async getAccessToken(): Promise<string | null> {
        const { data } = await this.supabase.auth.getSession()
        return data.session?.access_token ?? null
    }

    async signIn(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });
        return { data, error };
    }

    async signUp(form: SignUpForm) {
        return await this.supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: {
                data: {
                    nombre: form.options.data.nombre,
                    apellido: form.options.data.apellido,
                    edad: form.options.data.edad,
                }
            }
        })
    }

    async signOut(): Promise<void> {
        const { error } = await this.supabase.auth.signOut()
        if (error) throw error
    }
    async getSession(): Promise<Session | null> {
        const { data } = await this.supabase.auth.getSession()
        return data.session
    }
}