import { Component } from '@angular/core';
import { Card } from '../../../../shared/components/card/card';

@Component({
  selector: 'app-games',
  imports: [Card],
  templateUrl: './games.html',
  styleUrl: './games.css',
  standalone: true
})
export class Games { }
