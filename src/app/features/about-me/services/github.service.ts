// core/services/miapi.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Token } from '@angular/compiler';
import { environment } from '../../../environments/environment';

export interface GitHubUser {
    login: string;
    name: string;
    bio: string;
    avatar_url: string;
    public_repos: number;
    followers: number;
    created_at: string;
}

@Injectable({ providedIn: 'root' })
export class MiapiService {

    private http = inject(HttpClient);
    private baseUrl = 'https://api.github.com/users/juanma7882';
    private token = environment.tokenGithub;
    getData(): Observable<GitHubUser> {
        return this.http.get<GitHubUser>(this.baseUrl, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/vnd.github+json'
            }
        });
    }
}
