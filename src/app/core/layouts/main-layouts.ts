import { Component } from "@angular/core";
import { RouterOutlet } from '@angular/router';
import { Navbar } from "../../shared/components/navbar/navbar";

@Component({
    standalone: true,
    imports: [Navbar, RouterOutlet],
    template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    `
})

export class MainLayout { }