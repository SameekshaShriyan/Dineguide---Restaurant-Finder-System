import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = 'http://localhost:5000/api/restaurants'; // ✅ corrected base URL

  constructor(private http: HttpClient) {}

  // ✅ Get all restaurants
  getRestaurants(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // ✅ Add review to specific restaurant
  addReview(restaurantId: string, review: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${restaurantId}/reviews`, review);
  }

  // ✅ Get reviews for 1 restaurant
  getReviews(restaurantId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${restaurantId}/reviews`);
  }
}
