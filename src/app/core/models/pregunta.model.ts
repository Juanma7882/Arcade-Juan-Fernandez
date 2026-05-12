export interface Pregunta {
    pregunta: string;
    opciones: string[];
    correcta: string;
}

export interface PreguntadosPack {
    tecnologia: Pregunta[];
    biologia: Pregunta[];
    quimica: Pregunta[];
}

export interface RespuestaUsuario {
    pregunta: string;
    seleccionada: string;
    correcta: string;
    esCorrecta: boolean;
}

export interface ResultadoPartida {
    categoria: string;
    totalPreguntas: number;
    aciertos: number;
    puntuacion: number;
    tiempoSegundos: number;
    respuestas: RespuestaUsuario[];
}