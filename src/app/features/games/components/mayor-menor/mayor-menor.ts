import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeckService, Card } from './deck.service';

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
    } else {
      this.life.update(l => l - 1)
      this.lastResult.set('lose');
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
    this.points.set(0);
    this.streak.set(0);
    this.life.set(3);
    this.errorMsg.set(null);
    this.lastResult.set(null);
    this.initDeck();
  }

}
