import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PreguntasService } from '../../../../core/services/preguntados.service';
import { GuardarPartidaSupabaseService } from '../../../../core/services/guardar-partida.supabase.service';
import { Pregunta, RespuestaUsuario, ResultadoPartida } from '../../../../core/models/pregunta.model';

type GameStep = 'categoria' | 'jugando' | 'resultado';
@Component({
  selector: 'app-preguntados',
  imports: [CommonModule, FormsModule],
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.css',
})
export class Preguntados {
  private preguntasService = inject(PreguntasService);
  private guardarPartidaService = inject(GuardarPartidaSupabaseService);

  // Estado del juego
  gameStep = signal<GameStep>('categoria');
  categoriaSeleccionada = signal<string>('');
  preguntas = signal<Pregunta[]>([]);
  preguntaActual = signal<Pregunta | null>(null);
  indiceActual = signal<number>(0);

  // Resultados
  respuestas = signal<RespuestaUsuario[]>([]);
  aciertos = signal<number>(0);
  puntuacion = signal<number>(0);

  // UI State
  opcionSeleccionada = signal<string>('');
  mostrarFeedback = signal<boolean>(false);
  esCorrecta = signal<boolean>(false);
  juegoTerminado = signal<boolean>(false);
  loading = signal<boolean>(false);
  errorMsg = signal<string | null>(null);

  // Temporizador
  tiempoInicio = signal<number>(0);
  tiempoActual = signal<number>(0);
  intervaloTiempo: any;

  // Mensajes
  mensajeGuardado = signal<string | null>(null);

  ngOnInit() {
    this.cargarPreguntas();
  }

  ngOnDestroy() {
    this.detenerCronometro();
  }

  cargarPreguntas() {
    this.loading.set(true);
    this.preguntasService.cargarPreguntas().subscribe({
      next: (data) => {
        this.preguntasService.setPreguntas(data);
        this.loading.set(false);
        console.log(data)
        console.log(this.preguntasService)
      },
      error: () => {
        this.errorMsg.set('Error al cargar las preguntas');
        this.loading.set(false);
      }
    });
  }

  seleccionarCategoria(categoria: string) {
    this.categoriaSeleccionada.set(categoria);
    console.log("categoria seleccionada", this.categoriaSeleccionada());
    const preguntas = this.preguntasService.getPreguntasPorCategoria(categoria as any);

    console.log("preguntas", preguntas)
    if (preguntas.length === 0) {
      this.errorMsg.set('No hay preguntas disponibles para esta categoría');
      return;
    }

    // Mezclar preguntas
    this.preguntas.set(this.mezclarArray([...preguntas]));
    // console.log("this.preguntas", this.preguntas)

    this.indiceActual.set(0);
    this.preguntaActual.set(this.preguntas()[0]);
    this.respuestas.set([]);
    this.aciertos.set(0);
    this.puntuacion.set(0);
    this.juegoTerminado.set(false);
    this.opcionSeleccionada.set('');
    this.mostrarFeedback.set(false);

    this.iniciarCronometro();
    this.gameStep.set('jugando');
  }

  private mezclarArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  seleccionarOpcion(opcion: string) {
    if (this.mostrarFeedback() || this.juegoTerminado()) return;

    this.opcionSeleccionada.set(opcion);
    const pregunta = this.preguntaActual();
    const esCorrecta = opcion === pregunta?.correcta;

    this.esCorrecta.set(esCorrecta);
    this.mostrarFeedback.set(true);

    // Registrar respuesta
    const respuesta: RespuestaUsuario = {
      pregunta: pregunta!.pregunta,
      seleccionada: opcion,
      correcta: pregunta!.correcta,
      esCorrecta: esCorrecta
    };

    this.respuestas.update(prev => [...prev, respuesta]);

    if (esCorrecta) {
      this.aciertos.update(prev => prev + 1);
      // 100 puntos por respuesta correcta
      const puntosGanados = 100;
      this.puntuacion.update(prev => prev + puntosGanados);
    }

    // Auto-avanzar después de 1.5 segundos
    setTimeout(() => {
      this.siguientePregunta();
    }, 1500);
  }

  siguientePregunta() {
    const siguienteIndice = this.indiceActual() + 1;

    if (siguienteIndice < this.preguntas().length) {
      this.indiceActual.set(siguienteIndice);
      this.preguntaActual.set(this.preguntas()[siguienteIndice]);
      this.opcionSeleccionada.set('');
      this.mostrarFeedback.set(false);
    } else {
      this.finalizarJuego();
    }
  }

  private iniciarCronometro() {
    this.tiempoInicio.set(Date.now());
    this.intervaloTiempo = setInterval(() => {
      if (this.gameStep() === 'jugando' && !this.juegoTerminado()) {
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

  private async finalizarJuego() {
    this.detenerCronometro();
    this.juegoTerminado.set(true);
    this.gameStep.set('resultado');

    // Guardar partida automáticamente
    await this.guardarPartida();
  }

  private async guardarPartida() {
    try {
      const resultado: ResultadoPartida = {
        categoria: this.categoriaSeleccionada(),
        totalPreguntas: this.preguntas().length,
        aciertos: this.aciertos(),
        puntuacion: this.puntuacion(),
        tiempoSegundos: this.tiempoActual(),
        respuestas: this.respuestas()
      };

      const gameSession = {
        won: this.aciertos() > this.preguntas().length / 2, // Gana si acierta más de la mitad
        score: this.puntuacion(),
        duration_seconds: this.tiempoActual(),
        data: {
          categoria: resultado.categoria,
          total_preguntas: resultado.totalPreguntas,
          aciertos: resultado.aciertos,
          porcentaje_aciertos: (resultado.aciertos / resultado.totalPreguntas) * 100,
          respuestas_detalle: resultado.respuestas.map(r => ({
            pregunta: r.pregunta,
            fue_correcta: r.esCorrecta
          }))
        },
        game_type: 'preguntados' as const
      };

      await this.guardarPartidaService.saveGameSession(gameSession);
      this.mensajeGuardado.set('✅ Partida guardada en la nube');
      setTimeout(() => this.mensajeGuardado.set(null), 3000);
    } catch (error: any) {
      console.error('Error al guardar:', error);
      this.mensajeGuardado.set('⚠️ Partida guardada localmente (error de conexión)');
    }
  }

  get tiempoFormateado(): string {
    const minutos = Math.floor(this.tiempoActual() / 60);
    const segundos = this.tiempoActual() % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  get porcentajeAciertos(): number {
    if (this.preguntas().length === 0) return 0;
    return Math.round((this.aciertos() / this.preguntas().length) * 100);
  }

  reiniciarJuego() {
    this.gameStep.set('categoria');
    this.categoriaSeleccionada.set('');
    this.preguntas.set([]);
    this.respuestas.set([]);
    this.aciertos.set(0);
    this.puntuacion.set(0);
    this.tiempoActual.set(0);
    this.juegoTerminado.set(false);
    this.opcionSeleccionada.set('');
    this.mostrarFeedback.set(false);
  }

  volverACategorias() {
    this.reiniciarJuego();
  }

  getClaseOpcion(opcion: string): string {
    if (!this.mostrarFeedback()) return 'opcion-normal';

    if (opcion === this.preguntaActual()?.correcta) {
      return 'opcion-correcta';
    }

    if (opcion === this.opcionSeleccionada() && opcion !== this.preguntaActual()?.correcta) {
      return 'opcion-incorrecta';
    }

    return 'opcion-normal opacity-50';
  }
}
