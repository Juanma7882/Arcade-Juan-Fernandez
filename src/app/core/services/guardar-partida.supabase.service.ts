import { Injectable } from "@angular/core";
import { SupabaseService } from "./supabase.auth.service";

export type GameType =
    | 'la_viborita'
    | 'el_ahorcado'
    | 'mayor_menor'
    | 'preguntados';

export interface GameSession {
    id?: number;
    user_uid?: string;
    won: boolean;
    score: number;
    duration_seconds?: number;
    data: Record<string, any>;
    game_type: GameType;
}

@Injectable({
    providedIn: 'root'
})
export class GuardarPartidaSupabaseService {

    constructor(private supabaseService: SupabaseService) { }

    async saveGameSession(gameSession: GameSession) {

        const session = await this.supabaseService.getSession();

        if (!session) {
            throw new Error("No hay sesión activa");
        }

        const { data, error } = await this.supabaseService.supabase
            .from('game_sessions')
            .insert([
                {
                    user_uid: session.user.id,
                    game_type: gameSession.game_type,
                    won: gameSession.won,
                    score: gameSession.score,
                    duration_seconds: gameSession.duration_seconds,
                    data: gameSession.data,
                }
            ]);

        if (error) {
            console.error("Error al guardar la partida", error);
            throw error;
        }

        return data;
    }
}