import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnakeService, Direccion } from '../../../../core/services/snake.service';
import { GuardarPartidaSupabaseService } from '../../../../core/services/guardar-partida.supabase.service';

@Component({
  selector: 'app-la-vivorita',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './la-vivorita.html',
  styleUrls: ['./la-vivorita.css']
})
export class LaVivorita implements OnInit, OnDestroy {
  private snakeService = inject(SnakeService);
  private guardarPartidaService = inject(GuardarPartidaSupabaseService);

  // Exponer signals del servicio (públicas para el template)
  snake = this.snakeService.snake;
  comida = this.snakeService.comida;
  puntuacion = this.snakeService.puntuacion;
  gameOver = this.snakeService.gameOver;
  juegoIniciado = this.snakeService.juegoIniciado;

  // Exponer métodos públicos
  cambiarDireccion = (direccion: Direccion) => this.snakeService.cambiarDireccion(direccion);
  iniciarJuego = () => this.snakeService.iniciarJuego();
  resetearJuego = () => this.snakeService.resetearJuego();

  // Exponer constantes
  TAMANO = this.snakeService.TAMANO;
  TAMANO_CELDA = this.snakeService.TAMANO_CELDA;

  // Crear array para el grid (solución para el @for)
  gridArray = Array(this.TAMANO).fill(0).map((_, i) => i);

  // UI State
  mensajeGuardado = signal<string | null>(null);
  tiempoInicio = signal<number>(0);
  tiempoActual = signal<number>(0);
  intervaloTiempo: any;

  ngOnInit() {
    this.iniciarControles();
  }

  ngOnDestroy() {
    this.snakeService.detenerJuego();
    this.detenerCronometro();
  }

  private iniciarControles() {
    window.addEventListener('keydown', this.handleKeyPress.bind(this));
  }

  private handleKeyPress(event: KeyboardEvent) {
    if (!this.juegoIniciado() && !this.gameOver()) {
      if (event.key === ' ' || event.key === 'ArrowUp' || event.key === 'ArrowDown' ||
        event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        this.iniciarJuego();
        this.iniciarCronometro();
        event.preventDefault();
      }
      return;
    }

    if (this.gameOver()) return;

    switch (event.key) {
      case 'ArrowUp':
        this.cambiarDireccion('UP');
        break;
      case 'ArrowDown':
        this.cambiarDireccion('DOWN');
        break;
      case 'ArrowLeft':
        this.cambiarDireccion('LEFT');
        break;
      case 'ArrowRight':
        this.cambiarDireccion('RIGHT');
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  private iniciarCronometro() {
    this.tiempoInicio.set(Date.now());
    this.intervaloTiempo = setInterval(() => {
      if (this.juegoIniciado() && !this.gameOver()) {
        const transcurrido = Math.floor((Date.now() - this.tiempoInicio()) / 1000);
        this.tiempoActual.set(transcurrido);
      }
    }, 1000);
  }

  private detenerCronometro() {
    if (this.intervaloTiempo) {
      clearInterval(this.intervaloTiempo);
      this.intervaloTiempo = null;
    }
  }

  async guardarPartida() {
    if (!this.gameOver() || this.puntuacion() === 0) return;

    try {
      const gameSession = {
        won: this.puntuacion() >= 100,
        score: this.puntuacion(),
        duration_seconds: this.tiempoActual(),
        data: {
          puntos_obtenidos: this.puntuacion(),
          tamaño_tablero: `${this.TAMANO}x${this.TAMANO}`,
          largo_serpiente: this.snake().length,
          comida_generada: Math.floor(this.puntuacion() / 10)
        },
        game_type: 'la_viborita' as const
      };

      await this.guardarPartidaService.saveGameSession(gameSession);
      this.mensajeGuardado.set('✅ Partida guardada en la nube');
      setTimeout(() => this.mensajeGuardado.set(null), 3000);
    } catch (error: any) {
      console.error('Error al guardar:', error);
      this.mensajeGuardado.set('⚠️ No se pudo guardar la partida');
      setTimeout(() => this.mensajeGuardado.set(null), 3000);
    }
  }

  get tiempoFormateado(): string {
    const minutos = Math.floor(this.tiempoActual() / 60);
    const segundos = this.tiempoActual() % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  getColorSnake(index: number): string {
    if (index === 0) return '#4ade80'; // Cabeza verde claro
    return '#22c55e'; // Cuerpo verde
  }
}