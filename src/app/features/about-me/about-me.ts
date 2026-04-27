import { Component, inject, OnInit, signal } from '@angular/core';
import { GitHubUser, MiapiService } from './services/github.service';


@Component({
  selector: 'app-about-me',
  imports: [],
  templateUrl: './about-me.html',
  styleUrl: './about-me.css',
})
export class AboutMe {


  private githubService = inject(MiapiService);
  userData = signal<GitHubUser | null>(null);

  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit() {
    this.githubService.getData().subscribe({
      next: (data) => {
        this.userData.set(data);
        this.loading.set(false);
        console.log(data)
      },
      error: (err: Error) => {
        this.error.set('Error al cargar los datos');
        this.loading.set(false);
      }
    });
  }



}
