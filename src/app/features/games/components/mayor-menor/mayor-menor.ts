import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeckService, Card } from './deck.service';
import { GuardarPartidaSupabaseService } from '../../../../core/services/guardar-partida.supabase.service';

type GuessResult = 'mayor' | 'menor' | 'igual';
type GamePhase = 'idle' | 'loading' | 'waiting' | 'revealing' | 'done';

const RANK_VALUE: Record<string, number> = {
  ACE: 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, JACK: 11, QUEEN: 12, KING: 13,
};

@Component({
  selector: 'app-mayor-menor',
  imports: [],
  templateUrl: './mayor-menor.html',
  styleUrl: './mayor-menor.css',
})
export class MayorMenor {

  private deckService = inject(DeckService);
  private guardarPartidaService = inject(GuardarPartidaSupabaseService);

  mensajeGuardado = signal<string | null>(null);
  private idPartidaActual = signal<string>(Math.random().toString(36));
  private fechaInicioPartida = signal<Date | null>(null);
  private partidaGuardada = signal<boolean>(false);
  // --- State ---
  phase = signal<GamePhase>('idle');
  deckId = signal<string | null>(null);
  remaining = signal<number>(52);

  currentCard = signal<Card | null>(null);
  nextCard = signal<Card | null>(null);

  life = signal(3);

  points = signal(0);
  streak = signal(0);
  record = signal(0);

  lastResult = signal<'win' | 'lose' | 'draw' | null>(null);
  lastCorrect = signal<GuessResult | null>(null);
  showNextCard = signal(false);
  errorMsg = signal<string | null>(null);

  // --- Computed ---
  isWaiting = computed(() => this.phase() === 'waiting');
  isRevealing = computed(() => this.phase() === 'revealing');
  isLoading = computed(() => this.phase() === 'loading');


  resultText = computed(() => {
    const r = this.lastResult();
    const correct = this.lastCorrect();
    if (!r) return '';
    if (r === 'win') return correct === 'igual' ? '¡Exacto! +30 pts 🎯' : '¡Correcto! +10 pts ✓';
    if (r === 'lose') return `Era ${correct?.toUpperCase()} — ¡Mala suerte!`

    return '';
  });

  ngOnInit(): void {
    this.initDeck();
  }

  initDeck(): void {
    this.phase.set('loading');
    this.errorMsg.set(null);
    // Registrar inicio de partida si es nuevo juego
    if (!this.fechaInicioPartida()) {
      this.fechaInicioPartida.set(new Date());
    }
    this.deckService.newDeck().subscribe({
      next: (res) => {
        this.deckId.set(res.deck_id);
        this.remaining.set(res.remaining);
        this.drawInitialCards();
      },
      error: () => this.errorMsg.set('No se pudo conectar con la API. Intentá de nuevo.'),
    });
  }

  private drawInitialCards(): void {
    this.deckService.draw(this.deckId()!, 2).subscribe({
      next: (res) => {
        this.currentCard.set(res.cards[0]);
        this.nextCard.set(res.cards[1]);
        this.remaining.set(res.remaining);
        this.showNextCard.set(false);
        this.lastResult.set(null);
        this.phase.set('waiting');
      },
      error: () => this.errorMsg.set('Error al robar cartas.'),
    });
  }

  guess(choice: GuessResult): void {
    if (this.phase() !== 'waiting') return;
    this.phase.set('revealing');
    this.showNextCard.set(true);

    const cv = RANK_VALUE[this.currentCard()!.value];
    const nv = RANK_VALUE[this.nextCard()!.value];
    const real: GuessResult = nv > cv ? 'mayor' : nv < cv ? 'menor' : 'igual';

    this.lastCorrect.set(real);

    if (choice === real) {
      const bonus = choice === 'igual' ? 30 : 10;
      this.points.update(p => p + bonus);
      this.streak.update(s => s + 1);
      if (this.points() > this.record()) this.record.set(this.points());
      this.lastResult.set('win');

      if (this.points() >= 500 && !this.partidaGuardada()) {
        this.guardarPartida(true);
      }
    } else {
      this.life.update(l => l - 1)
      this.lastResult.set('lose');

      if (this.life() === 0) {
        this.guardarPartida(false);
      }
    }
  }

  nextRound(): void {
    if (this.remaining() < 1) {
      this.reshuffleAndContinue();
      return;
    }
    this.phase.set('loading');
    // current = nextCard, draw one new card
    this.currentCard.set(this.nextCard());
    this.deckService.draw(this.deckId()!, 1).subscribe({
      next: (res) => {
        this.nextCard.set(res.cards[0]);
        this.remaining.set(res.remaining);
        this.showNextCard.set(false);
        this.lastResult.set(null);
        this.phase.set('waiting');
      },
      error: () => this.errorMsg.set('Error al robar carta.'),
    });
  }

  get vidas() {
    return this.life();
  }

  private reshuffleAndContinue(): void {
    this.phase.set('loading');
    this.deckService.reshuffle(this.deckId()!).subscribe({
      next: (res) => {
        this.remaining.set(res.remaining);
        this.drawInitialCards();
      },
      error: () => this.errorMsg.set('Error al mezclar el mazo.'),
    });
  }

  resetGame(): void {
    // Guardar la partida actual antes de resetear (si no se había guardado)
    if (!this.partidaGuardada() && this.points() > 0) {
      this.guardarPartida(false);
    }

    this.points.set(0);
    this.streak.set(0);
    this.life.set(3);
    this.errorMsg.set(null);
    this.lastResult.set(null);
    this.partidaGuardada.set(false);
    this.idPartidaActual.set(Math.random().toString(36));
    this.fechaInicioPartida.set(new Date());
    this.initDeck();
  }

  private async guardarPartida(gano: boolean = false) {
    try {
      // Verificar si hay sesión activa
      const session = await this.guardarPartidaService['supabaseService'].getSession();
      if (!session) {
        this.mensajeGuardado.set('⚠️ Inicia sesión para guardar');
        setTimeout(() => this.mensajeGuardado.set(null), 3000);
        return;
      }

      // Calcular tiempo transcurrido
      const duracion = this.fechaInicioPartida()
        ? Math.floor((Date.now() - this.fechaInicioPartida()!.getTime()) / 1000)
        : 0;

      const gameSession = {
        won: gano,
        score: this.points(),
        duration_seconds: duracion,
        data: {
          max_streak: this.record(),
          final_lives: this.life(),
          deck_id: this.deckId(),
          cards_remaining: this.remaining(),
          id_partida: this.idPartidaActual(),
          fecha_inicio: this.fechaInicioPartida()?.toISOString(),
          game_state: {
            phase: this.phase(),
            current_card: this.currentCard()?.code,
            last_result: this.lastResult(),
            last_correct: this.lastCorrect()
          }
        },
        game_type: 'mayor_menor' as const
      };

      await this.guardarPartidaService.saveGameSession(gameSession);
      this.mensajeGuardado.set('✅ Partida guardada');
      this.partidaGuardada.set(true);
      setTimeout(() => this.mensajeGuardado.set(null), 3000);
    } catch (error: any) {
      console.error('Error al guardar partida:', error);
      this.mensajeGuardado.set(`❌ Error: ${error.message || 'No se pudo guardar'}`);
      setTimeout(() => this.mensajeGuardado.set(null), 5000);
    }
  }

  ngOnDestroy() {
    if (this.points() > 0 && !this.partidaGuardada() && this.life() > 0) {
      this.guardarPartida(false);
    }
  }
}
