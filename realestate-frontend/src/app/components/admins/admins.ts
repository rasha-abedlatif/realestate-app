import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin';
import { AuthService } from '../../services/auth';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admins.html',
  styleUrl: './admins.css',
})
export class Admins implements OnInit {
  admins: any[] = [];
  total = 0;
  currentPage = 1;
  totalPages = 1;
  searchQuery = '';
  showForm = false;
  isSuperAdmin = false;
  formError = '';
  formSuccess = '';
  missingFields: string[] = [];

  phoneMaxLengths: { [key: string]: number } = {
    '+961': 8,
    '+1': 10,
    '+44': 10,
    '+33': 9,
    '+49': 11,
    '+39': 10,
    '+34': 9,
    '+971': 9,
    '+966': 9,
    '+962': 9,
    '+963': 9,
    '+20': 10,
    '+212': 9,
    '+216': 8,
    '+90': 10,
    '+30': 10,
  };

  getAdminPhoneMaxLength(): number {
    return this.phoneMaxLengths[this.newAdmin.phoneCode] || 15;
  }

  newAdmin = {
    civility: 'Mr',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    phoneCode: '+961',
    phoneNumber: '',
    role: 'complex_admin',
    status: 'active',
    password: '',
  };

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.isSuperAdmin();
    this.loadAdmins();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.urlAfterRedirects === '/admins') {
          this.showForm = false;
          this.resetForm();
        }
      });
  }

  resetForm(): void {
    this.formError = '';
    this.formSuccess = '';
    this.missingFields = [];

    this.newAdmin = {
      civility: 'Mr',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      phoneCode: '+961',
      phoneNumber: '',
      role: 'complex_admin',
      status: 'active',
      password: '',
    };
  }

  loadAdmins(): void {
    this.adminService.getAdmins(this.currentPage, this.searchQuery.trim()).subscribe({
      next: (res) => {
        this.admins = [...res.admins];
        this.total = res.total;
        this.totalPages = res.total_pages;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading admins:', err);
      },
    });
  }

  onPhoneInput(): void {
    this.newAdmin.phone = this.newAdmin.phoneCode + this.newAdmin.phoneNumber;
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    return /[0-9]/.test(event.key);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadAdmins();
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadAdmins();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadAdmins();
    }
  }

  createAdmin(): void {
    this.formError = '';
    this.formSuccess = '';
    this.missingFields = [];

    if (!this.newAdmin.first_name) this.missingFields.push('First Name');
    if (!this.newAdmin.last_name) this.missingFields.push('Last Name');
    if (!this.newAdmin.email) this.missingFields.push('Email');
    if (!this.newAdmin.phoneNumber) this.missingFields.push('Phone');
    if (!this.newAdmin.password) this.missingFields.push('Password');

    if (this.missingFields.length > 0) {
      this.formError = 'missing';
      return;
    }

    this.adminService.createAdmin(this.newAdmin).subscribe({
      next: () => {
        this.formSuccess = 'Admin created successfully!';
        this.showForm = false;
        this.loadAdmins();
        this.newAdmin = {
          civility: 'Mr',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          phoneCode: '+961',
          phoneNumber: '',
          role: 'complex_admin',
          status: 'active',
          password: '',
        };
      },
      error: (err) => {
        const msg = err.error?.message || '';

        if (msg.toLowerCase().includes('email')) {
          this.formError = 'This email is already used.';
        } else {
          this.formError = 'Error creating admin';
        }
      },
    });
  }

  goToRoute(path: string): void {
    this.showForm = false;
    this.resetForm?.();
    this.router.navigate([path]);
  }

  logout(): void {
    this.authService.logout();
  }
}
