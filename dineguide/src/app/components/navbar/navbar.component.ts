import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  user: any = null;
  username = '';
  userRole = '';

  constructor(private router: Router) {}

  ngOnInit() {
    const stored = localStorage.getItem('user');
    if (stored) {
      this.user = JSON.parse(stored);
      this.username = this.user.username;
      this.userRole = this.user.role;
    }
  }

  isLoggedIn() {
    return localStorage.getItem('user') !== null;
  }

  logout() {
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}
