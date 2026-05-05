import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Card {
    code: string;
    image: string;
    value: string; // 'ACE','2',...,'10','JACK','QUEEN','KING'
    suit: string;  // 'SPADES','HEARTS','DIAMONDS','CLUBS'
}

interface DeckResponse {
    deck_id: string;
    shuffled: boolean;
    remaining: number;
}

interface DrawResponse {
    cards: Card[];
    deck_id: string;
    remaining: number;
}

const BASE = 'https://deckofcardsapi.com/api/deck';

@Injectable({ providedIn: 'root' })
export class DeckService {
    private http = inject(HttpClient);

    newDeck(): Observable<DeckResponse> {
        return this.http.get<DeckResponse>(`${BASE}/new/shuffle/?deck_count=1`);
    }

    draw(deckId: string, count = 1): Observable<DrawResponse> {
        return this.http.get<DrawResponse>(`${BASE}/${deckId}/draw/?count=${count}`);
    }

    reshuffle(deckId: string): Observable<DeckResponse> {
        return this.http.get<DeckResponse>(`${BASE}/${deckId}/shuffle/`);
    }
}