import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const raw = localStorage.getItem('user');
    if (!raw) return this.router.parseUrl('/login');
    return true;
  }
}

// Admin guard separate for /admin
@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(): boolean | UrlTree {
    const raw = localStorage.getItem('user');
    if (!raw) return this.router.parseUrl('/login');
    const user = JSON.parse(raw);
    if (user.role === 'admin') return true;
    return this.router.parseUrl('/restaurants');
  }
}
