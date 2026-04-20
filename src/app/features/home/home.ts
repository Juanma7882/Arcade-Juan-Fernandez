import { Component } from '@angular/core';
import { Inicio } from './components/inicio/inicio';
import { Download } from './components/download/download';
import { Games } from './components/games/games';

@Component({
  selector: 'app-home',
  imports: [Inicio, Games, Download],
  templateUrl: './home.html',
  styleUrl: './home.css',

})
export class Home { }
