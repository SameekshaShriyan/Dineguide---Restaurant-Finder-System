import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin(): void {
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password';
      return;
    }
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success && res.user) {
          // store minimal user info in localStorage
          localStorage.setItem('user', JSON.stringify(res.user));

          // navigate by role
          if (res.user.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/restaurants']);
          }
        } else {
          this.error = res.message || 'Login failed';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Login error', err);
        this.error = err?.error?.message || 'Server error, try again';
      }
    });
  }
}
