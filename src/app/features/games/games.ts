import { Component } from '@angular/core';
import { Card } from '../../shared/components/card/card';
import { Ahorcados } from './components/ahorcados/ahorcados';

@Component({
  selector: 'app-games',
  imports: [Card, Ahorcados],
  templateUrl: './games.html',
  styleUrl: './games.css',
})
export class Games { }
