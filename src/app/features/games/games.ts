import { Component } from '@angular/core';
import { Card } from '../../shared/components/card/card';
import { Ahorcados } from './components/ahorcados/ahorcados';
import { MayorMenor } from "./components/mayor-menor/mayor-menor";
import { Preguntados } from "./components/preguntados/preguntados";
import { LaVivorita } from "./components/la-vivorita/la-vivorita";

@Component({
  selector: 'app-games',
  imports: [Card, Ahorcados, MayorMenor, Preguntados, LaVivorita],
  templateUrl: './games.html',
  styleUrl: './games.css',
})
export class Games { }
