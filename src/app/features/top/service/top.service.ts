import { Injectable, signal } from "@angular/core";
import { SupabaseService } from "../../../core/services/supabase.auth.service";
import { GameSession, GameType } from "../../../core/services/guardar-partida.supabase.service";

export interface GameSessionWithUser extends GameSession {
    users?: {
        nombre: string;
        apellido: string;
        email: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class PreguntasService {
    constructor(private supabaseService: SupabaseService) { }

    topGames = signal<GameSessionWithUser[]>([]);

    private async getTopTenPerGame(game: GameType): Promise<GameSessionWithUser[]> {
        try {
            const { data, error } = await this.supabaseService.supabase
                .from('game_sessions')
                .select(`
                    *,
                    users!inner (
                        nombre,
                        apellido,
                        email
                    )
                `)
                .eq('game_type', game)
                .order('score', { ascending: false })
                .limit(10);

            if (error) {
                console.error("Error al traer los datos:", error);
                return [];
            }

            if (data && data.length > 0) {
                this.topGames.set(data as GameSessionWithUser[]);
                return data as GameSessionWithUser[];
            }

            return [];
        } catch (error) {
            console.error("Excepción al obtener datos:", error);
            return [];
        }
    }

    async getTopLaVivorita(): Promise<GameSessionWithUser[]> {
        return await this.getTopTenPerGame('la_viborita');
    }

    async getTopElAhorcado(): Promise<GameSessionWithUser[]> {
        return await this.getTopTenPerGame('el_ahorcado');
    }

    async getTopMayorMenor(): Promise<GameSessionWithUser[]> {
        return await this.getTopTenPerGame('mayor_menor');
    }

    async getTopPreguntados(): Promise<GameSessionWithUser[]> {
        return await this.getTopTenPerGame('preguntados');
    }
}