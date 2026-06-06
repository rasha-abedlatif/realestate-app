import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  name = '';
  role = '';

  isSuperAdmin = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.name = this.authService.getName() || '';
    this.role = this.authService.getRole() || '';

    this.isSuperAdmin = this.role === 'super_admin';
  }

  logout(): void {
    this.authService.logout();
  }
}