import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface QuoteResponse {
  quote: string;
  author: string;
}

@Injectable({
  providedIn: 'root'
})
export class QuoteService {

  private http = inject(HttpClient);

  private apiUrl =
    'https://bela-blok-web-backend.onrender.com/api/quote';

  getRandomQuote(): Observable<QuoteResponse> {
    return this.http.get<QuoteResponse>(this.apiUrl);
  }
}