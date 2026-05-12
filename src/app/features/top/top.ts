import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PreguntasService, GameSessionWithUser } from './service/top.service';

@Component({
  selector: 'app-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top.html',
  styleUrl: './top.css',
})
export class TopComponent implements OnInit {

  private preguntasService = inject(PreguntasService);

  topViborita = signal<GameSessionWithUser[]>([]);
  topAhorcado = signal<GameSessionWithUser[]>([]);
  topMayorMenor = signal<GameSessionWithUser[]>([]);
  topPreguntados = signal<GameSessionWithUser[]>([]);

  loading = signal<boolean>(true);
  errorMsg = signal<string | null>(null);

  async ngOnInit() {
    try {
      const [viborita, ahorcado, mayorMenor, preguntados] = await Promise.all([
        this.preguntasService.getTopLaVivorita(),
        this.preguntasService.getTopElAhorcado(),
        this.preguntasService.getTopMayorMenor(),
        this.preguntasService.getTopPreguntados()
      ]);

      this.topViborita.set(viborita);
      this.topAhorcado.set(ahorcado);
      this.topMayorMenor.set(mayorMenor);
      this.topPreguntados.set(preguntados);
    } catch (error) {
      this.errorMsg.set('Error al cargar los rankings');
      console.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  getNombreCompleto(game: GameSessionWithUser): string {
    if (game.users) {
      return `${game.users.nombre} ${game.users.apellido}`;
    }
    return 'Usuario anónimo';
  }
}