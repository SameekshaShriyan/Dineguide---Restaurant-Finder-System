// src/app/services/restaurant.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Restaurant {
  _id?: string;
  name: string;
  location: string;
  cuisine?: string;
  image?: string;
  reviews?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = 'http://localhost:5000/api/restaurants';

  constructor(private http: HttpClient) {}

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.apiUrl);
  }

  addRestaurant(payload: Partial<Restaurant>) {
    return this.http.post<Restaurant>(this.apiUrl, payload);
  }

  updateRestaurant(id: string, payload: Partial<Restaurant>) {
    return this.http.put<Restaurant>(`${this.apiUrl}/${id}`, payload);
  }

  deleteRestaurant(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Correct signature: send to /api/restaurants/:id/reviews
  addReview(restaurantId: string, review: { username: string; rating: number; comment: string }) {
    return this.http.post(`${this.apiUrl}/${restaurantId}/reviews`, review);
  }

  deleteReview(restaurantId: string, reviewId: string) {
    return this.http.delete(`${this.apiUrl}/${restaurantId}/reviews/${reviewId}`);
  }
}
