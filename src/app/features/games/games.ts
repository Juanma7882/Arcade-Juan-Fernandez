import { Component } from '@angular/core';
import { Card } from '../../shared/components/card/card';
import { Ahorcados } from './components/ahorcados/ahorcados';
import { MayorMenor } from "./components/mayor-menor/mayor-menor";

@Component({
  selector: 'app-games',
  imports: [Card, Ahorcados, MayorMenor],
  templateUrl: './games.html',
  styleUrl: './games.css',
})
export class Games { }
