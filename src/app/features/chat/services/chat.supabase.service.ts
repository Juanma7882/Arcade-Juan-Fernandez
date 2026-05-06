import { Injectable, signal, computed } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export interface ChatMessageWithUser {
    id: string;
    mensaje: string;
    created_at: string;
    user_uid: string;
    users: {
        nombre: string;
        apellido: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class ChatSupabaseService {
    private supabase: SupabaseClient;

    // 🔹 USER STATE
    private _currentUser = signal<User | null>(null);
    readonly currentUser = this._currentUser.asReadonly();

    readonly isLoggedIn = computed(() => this._currentUser() !== null);

    // 🔹 cache de usuarios
    private userCache = new Map<string, { nombre: string; apellido: string }>();

    constructor() {
        this.supabase = createClient(
            environment.supabaseUrl,
            environment.supabaseKey
        );

        this.supabase.auth.getSession().then(({ data }) => {
            this._currentUser.set(data.session?.user ?? null);
        });

        this.supabase.auth.onAuthStateChange((_event, session) => {
            this._currentUser.set(session?.user ?? null);
        });
    }

    // =============================
    // 📥 TRAER ÚLTIMOS 10 MENSAJES
    // =============================
    async getLastMessages(limit: number = 10): Promise<ChatMessageWithUser[]> {
        const { data, error } = await this.supabase
            .from('chat_messages')
            .select(`
        id,
        mensaje,
        created_at,
        user_uid,
        users (
          nombre,
          apellido
        )
      `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        // 🔹 invertir para mostrar de viejo → nuevo
        const messages = (data as unknown as ChatMessageWithUser[]).reverse();

        // 🔹 llenar cache
        messages.forEach((m) => {
            if (m.users) {
                this.userCache.set(m.user_uid, m.users);
            }
        });
        console.log("messages", messages)
        return messages;
    }

    // =============================
    // 📜 PAGINACIÓN (CARGAR MÁS)
    // =============================
    async getOlderMessages(
        oldestDate: string,
        limit: number = 10
    ): Promise<ChatMessageWithUser[]> {
        const { data, error } = await this.supabase
            .from('chat_messages')
            .select(`
        id,
        mensaje,
        created_at,
        user_uid,
        users (
          nombre,
          apellido
        )
      `)
            .lt('created_at', oldestDate)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        const messages = (data as unknown as ChatMessageWithUser[]).reverse();

        messages.forEach((m) => {
            if (m.users) {
                this.userCache.set(m.user_uid, m.users);
            }
        });

        return messages;
    }

    // =============================
    // 📤 ENVIAR MENSAJE
    // =============================
    async sendMessage(mensaje: string) {
        const user = this._currentUser();

        if (!user) throw new Error('No autenticado');

        const { error } = await this.supabase.from('chat_messages').insert({
            mensaje,
            user_uid: user.id,
        });

        if (error) throw error;
    }

    // =============================
    // 🔄 REALTIME OPTIMIZADO
    // =============================
    subscribeToMessages(
        callback: (msg: ChatMessageWithUser) => void
    ) {
        return this.supabase
            .channel('chat-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                },
                async (payload) => {
                    const newMsg = payload.new;

                    let user = this.userCache.get(newMsg['user_uid']);

                    // 🔹 si no está en cache → lo traemos UNA vez
                    if (!user) {
                        const { data } = await this.supabase
                            .from('users')
                            .select('nombre, apellido')
                            .eq('uid', newMsg['user_uid'])
                            .single();

                        if (data) {
                            user = data;
                            this.userCache.set(newMsg['user_uid'], data);
                        }
                    }

                    const formatted: ChatMessageWithUser = {
                        id: newMsg['id'],
                        mensaje: newMsg['mensaje'],
                        created_at: newMsg['created_at'],
                        user_uid: newMsg['user_uid'],
                        users: user ?? { nombre: 'Desconocido', apellido: '' },
                    };

                    callback(formatted);
                }
            )
            .subscribe();
    }

    // =============================
    // 🔌 UNSUBSCRIBE
    // =============================
    unsubscribe(channel: any) {
        this.supabase.removeChannel(channel);
    }
}