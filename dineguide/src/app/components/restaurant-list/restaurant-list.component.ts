// src/app/components/restaurant-list/restaurant-list.component.ts
import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../../services/restaurant.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-restaurant-list',
  templateUrl: './restaurant-list.component.html',
  styleUrls: ['./restaurant-list.component.css']
})
export class RestaurantListComponent implements OnInit {
  restaurants: any[] = [];
  reviewInputs: { [k: string]: { rating: number; comment: string } } = {};
  userRole = 'guest';
  username = '';

  constructor(private restaurantService: RestaurantService, private auth: AuthService) {}

  ngOnInit(): void {
    const u = this.auth.getUser();
    this.userRole = u?.role || 'guest';
    this.username = u?.username || '';
    this.loadRestaurants();
  }

  loadRestaurants() {
  this.restaurantService.getRestaurants().subscribe({
    next: (restaurants: any[]) => {
      this.restaurants = restaurants || [];

      this.restaurants.forEach(r => {
        // initialize reviewInputs
        if (!this.reviewInputs[r._id]) {
          this.reviewInputs[r._id] = { rating: 5, comment: '' };
        }

        // sort reviews (types added to fix TS errors)
        if (Array.isArray(r.reviews)) {
          r.reviews = r.reviews.slice().sort((a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        } else {
          r.reviews = [];
        }
      });
    },
    error: (err) => {
      console.error('Load restaurants failed', err);
      this.restaurants = [];
    }
  });
}


  averageRating(reviews: any[] = []): string {
  if (!reviews.length) return '0.0';
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return (total / reviews.length).toFixed(1);
}


  openMaps(location: string) {
    const q = encodeURIComponent(location || '');
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  }

  submitReview(restaurantId: string) {
    const user = this.auth.getUser();
    if (!user) {
      alert('Please login to submit a review');
      return;
    }
    if (user.role === 'admin') {
      alert('Admins cannot submit reviews');
      return;
    }

    const input = this.reviewInputs[restaurantId];
    if (!input || !input.comment || !input.rating) {
      alert('Please provide rating and comment');
      return;
    }

    const payload = {
      username: user.username,
      rating: Number(input.rating),
      comment: input.comment
    };

    this.restaurantService.addReview(restaurantId, payload).subscribe({
      next: (res) => {
        console.log('Review added', res);
        alert('Review added!');
        this.reviewInputs[restaurantId] = { rating: 5, comment: '' };
        this.loadRestaurants();
      },
      error: (err) => {
        console.error('Add review failed', err);
        alert('Failed to add review');
      }
    });
  }
}
