import { Component, Input } from '@angular/core';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-card',
  imports: [RouterLink],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  @Input() imagen = '';
  @Input() titulo = '';
  @Input() ruta = '';

  constructor(private router: Router) { }

  redirigir() {
    console.log(this.ruta)
    this.router.navigate([this.ruta]);
  }
}
