import { Injectable, signal } from '@angular/core';

export interface Posicion {
    x: number;
    y: number;
}

export type Direccion = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

@Injectable({
    providedIn: 'root'
})
export class SnakeService {
    // Configuración del juego
    TAMANO = 20; // 20x20 grid
    TAMANO_CELDA = 25; // 25px por celda
    VELOCIDAD_INICIAL = 150; // ms por movimiento

    // Estado del juego
    snake = signal<Posicion[]>([{ x: 10, y: 10 }]);
    direccion = signal<Direccion>('RIGHT');
    comida = signal<Posicion>({ x: 15, y: 10 });
    puntuacion = signal<number>(0);
    gameOver = signal<boolean>(false);
    juegoIniciado = signal<boolean>(false);
    velocidad = signal<number>(this.VELOCIDAD_INICIAL);

    private intervalo: any = null;

    constructor() {
        this.generarComida();
    }

    iniciarJuego() {
        this.resetearJuego();
        this.juegoIniciado.set(true);
        this.gameOver.set(false);
        this.iniciarBucle();
    }

    private iniciarBucle() {
        if (this.intervalo) {
            clearInterval(this.intervalo);
        }
        this.intervalo = setInterval(() => {
            if (!this.gameOver() && this.juegoIniciado()) {
                this.mover();
            }
        }, this.velocidad());
    }

    cambiarDireccion(nuevaDireccion: Direccion) {
        const direccionActual = this.direccion();

        // Evitar que la serpiente vaya en dirección opuesta
        if (
            (nuevaDireccion === 'UP' && direccionActual === 'DOWN') ||
            (nuevaDireccion === 'DOWN' && direccionActual === 'UP') ||
            (nuevaDireccion === 'LEFT' && direccionActual === 'RIGHT') ||
            (nuevaDireccion === 'RIGHT' && direccionActual === 'LEFT')
        ) {
            return;
        }

        this.direccion.set(nuevaDireccion);
    }

    private mover() {
        const snakeActual = this.snake();
        const cabeza = snakeActual[0];
        let nuevaCabeza: Posicion;

        // Calcular nueva posición según dirección
        switch (this.direccion()) {
            case 'UP':
                nuevaCabeza = { x: cabeza.x, y: cabeza.y - 1 };
                break;
            case 'DOWN':
                nuevaCabeza = { x: cabeza.x, y: cabeza.y + 1 };
                break;
            case 'LEFT':
                nuevaCabeza = { x: cabeza.x - 1, y: cabeza.y };
                break;
            case 'RIGHT':
                nuevaCabeza = { x: cabeza.x + 1, y: cabeza.y };
                break;
            default:
                return;
        }

        // Verificar colisión con comida
        const comeComida = nuevaCabeza.x === this.comida().x && nuevaCabeza.y === this.comida().y;

        // Crear nueva serpiente
        let nuevaSnake = [nuevaCabeza, ...snakeActual];

        if (!comeComida) {
            nuevaSnake.pop(); // Eliminar la cola si no comió
        }

        // Verificar colisiones
        if (this.verificarColision(nuevaSnake)) {
            this.finDelJuego();
            return;
        }

        // Actualizar serpiente
        this.snake.set(nuevaSnake);

        // Si comió comida, generar nueva y aumentar puntuación
        if (comeComida) {
            this.puntuacion.update(p => p + 10);
            this.generarComida();
            this.aumentarVelocidad();
        }
    }

    private verificarColision(snake: Posicion[]): boolean {
        const cabeza = snake[0];

        // Colisión con paredes
        if (
            cabeza.x < 0 ||
            cabeza.x >= this.TAMANO ||
            cabeza.y < 0 ||
            cabeza.y >= this.TAMANO
        ) {
            return true;
        }

        // Colisión con sí misma
        for (let i = 1; i < snake.length; i++) {
            if (snake[i].x === cabeza.x && snake[i].y === cabeza.y) {
                return true;
            }
        }

        return false;
    }

    private generarComida() {
        const snakeActual = this.snake();
        const posicionesOcupadas = new Set(
            snakeActual.map(pos => `${pos.x},${pos.y}`)
        );

        let nuevaComida: Posicion;
        let intentos = 0;
        const maxIntentos = 1000;

        do {
            nuevaComida = {
                x: Math.floor(Math.random() * this.TAMANO),
                y: Math.floor(Math.random() * this.TAMANO)
            };
            intentos++;

            if (intentos > maxIntentos) {
                // Si no hay espacio, el juego está ganado
                this.finDelJuego(true);
                return;
            }
        } while (posicionesOcupadas.has(`${nuevaComida.x},${nuevaComida.y}`));

        this.comida.set(nuevaComida);
    }

    private aumentarVelocidad() {
        // Aumentar velocidad cada 50 puntos
        const nuevaVelocidad = Math.max(
            50,
            this.VELOCIDAD_INICIAL - Math.floor(this.puntuacion() / 50) * 5
        );
        this.velocidad.set(nuevaVelocidad);

        // Reiniciar intervalo con nueva velocidad
        if (this.intervalo) {
            clearInterval(this.intervalo);
            this.intervalo = setInterval(() => {
                if (!this.gameOver() && this.juegoIniciado()) {
                    this.mover();
                }
            }, this.velocidad());
        }
    }

    private finDelJuego(ganaste: boolean = false) {
        this.gameOver.set(true);
        this.juegoIniciado.set(false);
        if (this.intervalo) {
            clearInterval(this.intervalo);
            this.intervalo = null;
        }
    }

    resetearJuego() {
        if (this.intervalo) {
            clearInterval(this.intervalo);
            this.intervalo = null;
        }

        this.snake.set([{ x: 10, y: 10 }]);
        this.direccion.set('RIGHT');
        this.puntuacion.set(0);
        this.gameOver.set(false);
        this.juegoIniciado.set(false);
        this.velocidad.set(this.VELOCIDAD_INICIAL);
        this.generarComida();
    }

    detenerJuego() {
        if (this.intervalo) {
            clearInterval(this.intervalo);
            this.intervalo = null;
        }
    }
}