import { Component, NgZone, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ahorcados',
  imports: [CommonModule],
  templateUrl: './ahorcados.html',
  styleUrl: './ahorcados.css',
})
export class Ahorcados {

  // readonly PALABRAS = [
  //   'ANGULAR', 'TYPESCRIPT', 'COMPONENTE', 'DIRECTIVA', 'SERVICIO',
  //   'MODULO', 'TEMPLATE', 'ROUTER', 'OBSERVABLE', 'INYECCION',
  //   'INTERFAZ', 'DECORADOR', 'PROPIEDAD', 'HERENCIA', 'PROMESA'
  // ];
  readonly PALABRAS = [
    'ABC'
  ]

  readonly MAX_ERRORES = 6;
  readonly MAX_PALABRAS = this.PALABRAS.length;
  readonly ESTADOS_AHORCADO = [
    // 0 errores
    `
    +-----+
    |     |
          |
          |
          |
          |
    =========`,
    // 1 error
    `
    +-----+
    |     |
    O     |
          |
          |
          |
    =========`,
    // 2 errores
    `
    +-----+
    |     |
    O     |
    |     |
          |
          |
    =========`,
    // 3 errores
    `
    +-----+
    |     |
    O     |
   /|     |
          |
          |
    =========`,
    // 4 errores
    `
    +-----+
    |     |
    O     |
   /|\\    |
          |
          |
    =========`,
    // 5 errores
    `
    +-----+
    |     |
    O     |
   /|\\    |
   /      |
          |
    =========`,
    // 6 errores
    `
    +-----+
    |     |
    O     |
   /|\\    |
   / \\    |
          |
    =========`,
  ];

  letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  juegoIniciado: boolean = false;
  juegoFinalizado: boolean = false;
  ganoTodo: boolean = false;

  palabraActual: string = '';
  letrasAdivinadas: Set<string> = new Set();
  letrasErradas: Set<string> = new Set();
  letrasTocadas: Set<string> = new Set();

  letrasTotalesTocadas: number = 0;
  palabrasAdivinadas: string[] = [];
  palabrasDisponibles: string[] = [];
  puntuacion = 0;

  tiempoInicio: number = 0;
  tiempoTranscurrido = signal(0); // En segundos
  intervaloTiempo: any;

  constructor(private ngZone: NgZone) {
  }
  get tiempoFormateado(): string {
    const minutos = Math.floor(this.tiempoTranscurrido() / 60);
    const segundos = this.tiempoTranscurrido() % 60;
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  }

  // resetearCronometro:
  private resetearCronometro() {
    if (this.intervaloTiempo) {
      clearInterval(this.intervaloTiempo);
    }
    this.tiempoInicio = performance.now();
    this.tiempoTranscurrido.set(0);

    this.intervaloTiempo = setInterval(() => {
      if (!this.juegoFinalizado) {
        const ahora = performance.now();
        this.tiempoTranscurrido.set(Math.floor((ahora - this.tiempoInicio) / 1000));
      } else {
        clearInterval(this.intervaloTiempo);
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.intervaloTiempo) {
      clearInterval(this.intervaloTiempo);
    }
  }

  iniciarJuego() {
    this.juegoIniciado = true;
    this.juegoFinalizado = false;
    this.puntuacion = 0;
    this.letrasTotalesTocadas = 0;
    this.palabrasAdivinadas = [];
    this.resetearCronometro();
    this.palabraActual = this.PALABRAS[Math.floor(Math.random() * this.PALABRAS.length)];
    this.letrasAdivinadas = new Set();
    this.letrasErradas = new Set();
    this.letrasTocadas = new Set();
    console.log(this.palabraActual)
    this.palabrasDisponibles = this.PALABRAS
  }

  seguirJugando() {
    this.palabrasDisponibles = this.palabrasDisponibles.filter(p => p !== this.palabraActual)
    this.letrasTotalesTocadas += this.letrasTocadas.size;
    this.palabrasAdivinadas.push(this.palabraActual)
    console.log(this.palabrasDisponibles)
    this.palabraActual = this.palabrasDisponibles[Math.floor(Math.random() * this.palabrasDisponibles.length)];
    this.letrasAdivinadas = new Set();
    this.letrasErradas = new Set();
    this.letrasTocadas = new Set();
    console.log(this.palabraActual)
  }

  get errores(): number {
    return this.letrasErradas.size;
  }

  get dibujoActual(): string {
    return this.ESTADOS_AHORCADO[this.errores];
  }

  get palabraMostrada(): string {
    return this.palabraActual
      .split('')
      .map(letra => this.letrasAdivinadas.has(letra) ? letra : '_')
      .join(' ');
  }

  get gano(): boolean {
    return this.palabraActual
      .split('')
      .every(letra => this.letrasAdivinadas.has(letra));
  }

  get perdio(): boolean {
    return this.errores >= this.MAX_ERRORES;
  }

  get juegoTerminado(): boolean {
    return this.gano || this.perdio || this.palabrasDisponibles.length === 0 || this.juegoIniciado === false;
  }

  verificarFinJuego() {
    if (this.perdio || this.palabrasDisponibles.length === 0) {
      this.juegoFinalizado = true;
    }
    console.log(this.palabrasDisponibles.length)
    if (this.gano) {
      this.puntuacion += 100;
    }

    if (!this.perdio && this.palabrasDisponibles.length === 1 && this.juegoIniciado === true) {
      this.ganoTodo = true
      clearInterval(this.intervaloTiempo);
    }

  }


  seleccionarLetra(letra: string) {
    if (this.juegoFinalizado || this.letrasTocadas.has(letra)) return;

    this.letrasTocadas.add(letra);

    if (this.palabraActual.includes(letra)) {
      this.letrasAdivinadas.add(letra);
    } else {
      this.letrasErradas.add(letra);
    }
    this.verificarFinJuego();
  }

  estadoLetra(letra: string): 'correcta' | 'errada' | 'disponible' {
    if (this.letrasAdivinadas.has(letra)) return 'correcta';
    if (this.letrasErradas.has(letra)) return 'errada';
    return 'disponible';
  }
}