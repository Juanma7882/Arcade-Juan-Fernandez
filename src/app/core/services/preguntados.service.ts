import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PreguntadosPack, Pregunta } from '../models/pregunta.model';

@Injectable({
    providedIn: 'root'
})
export class PreguntasService {
    private preguntasData: PreguntadosPack | null = null;

    constructor(private http: HttpClient) { }

    cargarPreguntas(): Observable<PreguntadosPack> {
        return this.http.get<PreguntadosPack>('preguntas.json');
    }

    setPreguntas(data: PreguntadosPack) {
        this.preguntasData = data;
    }

    getPreguntasPorCategoria(categoria: keyof PreguntadosPack): Pregunta[] {
        if (!this.preguntasData) return [];
        return this.preguntasData[categoria];
    }

    getCategorias(): (keyof PreguntadosPack)[] {
        return ['tecnologia', 'biologia', 'quimica'];
    }
}