import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  role = 'user';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    this.error = '';
    if (!this.username || !this.email || !this.password) { this.error = 'All fields required'; return; }
    this.loading = true;
    this.auth.register({ username: this.username, email: this.email, password: this.password, role: this.role })
      .subscribe({
        next: () => {
          this.loading = false;
          alert('Registration successful. Please login.');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Registration failed', err);
          this.error = err?.error?.message || 'Registration failed';
        }
      });
  }
}
