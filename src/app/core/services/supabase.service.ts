import { Injectable } from '@angular/core'
import { AuthChangeEvent, createClient, Session, SupabaseClient, User } from '@supabase/supabase-js'
import { environment } from '../../environments/environment'

export interface Profile {
    id?: string
    username: string
    website: string
    avatar_url: string
}

export interface signUpForm {
    email: string
    password: string,
    options: {
        data: {
            nombre: string,
            apellido: string,
            edad: string,
        }
    }
}


@Injectable({
    providedIn: 'root',
})
export class SupabaseService {
    private supabase: SupabaseClient

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
    }

    authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
        return this.supabase.auth.onAuthStateChange(callback)
    }

    async signIn(email: string, password: string) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    async signUp(signUpForm: signUpForm) {
        const { data, error } = await this.supabase.auth.signUp({
            email: signUpForm.email,
            password: signUpForm.password,
            options: {
                data: {
                    nombre: signUpForm.options.data.nombre,
                    apellido: signUpForm.options.data.apellido,
                    edad: signUpForm.options.data.edad,
                }
            }
        })
        if (error) {
            return error
        }
        return data
    }

    signOut() {
        return this.supabase.auth.signOut()
    }

}