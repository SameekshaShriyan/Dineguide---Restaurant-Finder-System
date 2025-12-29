import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../../services/restaurant.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  restaurants: any[] = [];
  newRestaurant = {
  name: '',
  location: '',
  cuisine: '',
  image: ''
};
  editing: any = null;
  loading = false;

  constructor(private restaurantService: RestaurantService) {}

  ngOnInit(): void { this.load(); }

  load() {
  this.restaurantService.getRestaurants().subscribe({
    next: (res) => {
      console.log("📌 FETCHED RESTAURANTS:", res);
      this.restaurants = res;
    },
    error: (err) => console.error('Load failed', err)
  });
}

 saveRestaurant() {
  if (!this.newRestaurant.name || !this.newRestaurant.location || !this.newRestaurant.cuisine) {
  alert('Name, location & cuisine are required');
  return;
}


    this.loading = true;
    if (this.editing) {
      this.restaurantService.updateRestaurant(this.editing._id, this.newRestaurant).subscribe({
        next: () => { this.loading=false; this.editing=null; this.newRestaurant={name:'',location:'',cuisine:'',image:''}; this.load(); },
        error: (err) => { this.loading=false; console.error(err); alert('Update failed'); }
      });
    } else {
      this.restaurantService.addRestaurant(this.newRestaurant).subscribe({
        next: () => { this.loading=false; this.newRestaurant={name:'',location:'',cuisine:'',image:''}; this.load(); },
        error: (err) => { this.loading=false; console.error(err); alert('Add failed'); }
      });
    }
  }

  edit(r: any) {
    this.editing = r;
    this.newRestaurant = { name: r.name, location: r.location, cuisine: r.cuisine, image: r.image || '' };
  }

  cancelEdit() {
    this.editing = null;
    this.newRestaurant = { name:'',location:'',cuisine:'',image:'' };
  }

  deleteRestaurant(id: string) {
    if (!confirm('Delete this restaurant?')) return;
    this.restaurantService.deleteRestaurant(id).subscribe({
      next: () => this.load(),
      error: (err) => { console.error(err); alert('Delete failed'); }
    });
  }

  // review delete
  deleteReview(restaurantId: string, reviewId: string) {
    if (!confirm('Delete this review?')) return;
    this.restaurantService.deleteReview(restaurantId, reviewId).subscribe({
      next: () => this.load(),
      error: (err) => { console.error(err); alert('Delete review failed'); }
    });
  }
}
