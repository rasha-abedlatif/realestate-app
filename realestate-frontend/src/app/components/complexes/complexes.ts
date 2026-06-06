import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ComplexService } from '../../services/complex';
import { AuthService } from '../../services/auth';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-complexes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './complexes.html',
  styleUrl: './complexes.css',
})
export class Complexes implements OnInit {
  complexes: any[] = [];
  selectedComplex: any = null;
  showForm = false;
  formError = '';
  formSuccess = '';
  loadError = '';
  isSuperAdmin = false;
  isComplexAdmin = false;
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

  getComplexPhoneMaxLength(): number {
    return this.phoneMaxLengths[this.newComplex.admin_phoneCode] || 15;
  }

  newComplex = {
    identity: '',
    address: '',
    campaign_info: '',
    admin_civility: 'Mr',
    admin_first_name: '',
    admin_last_name: '',
    admin_email: '',
    admin_phone: '',
    admin_phoneCode: '+961',
    admin_phoneNumber: '',
    admin_password: '',
  };

  constructor(
    private complexService: ComplexService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.isSuperAdmin();
    this.isComplexAdmin = this.authService.getRole() === 'complex_admin';
    this.loadComplexes();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.urlAfterRedirects === '/complexes') {
          this.showForm = false;
          this.resetForm();
        }
      });
  }

  resetForm(): void {
    this.newComplex = {
      identity: '',
      address: '',
      campaign_info: '',
      admin_civility: 'Mr',
      admin_first_name: '',
      admin_last_name: '',
      admin_email: '',
      admin_phone: '',
      admin_phoneCode: '+961',
      admin_phoneNumber: '',
      admin_password: '',
    };

    this.formError = '';
    this.formSuccess = '';
    this.missingFields = [];
  }

  loadComplexes(): void {
    this.loadError = '';
    this.complexService.getComplexes().subscribe({
      next: (res) => {
        this.complexes = [...(res.complexes || [])];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading complexes:', err);
        this.loadError = 'Failed to load complexes. Please refresh.';
        this.cdr.detectChanges();
      },
    });
  }

  selectComplex(complex: any): void {
    if (this.selectedComplex?.id === complex.id) {
      this.selectedComplex = null;
      return;
    }
    this.complexService.getComplex(complex.id).subscribe({
      next: (res) => {
        this.selectedComplex = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading complex details:', err),
    });
  }

  onPhoneInput(): void {
    this.newComplex.admin_phone =
      this.newComplex.admin_phoneCode + this.newComplex.admin_phoneNumber;
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    return /[0-9]/.test(event.key);
  }

  createComplex(): void {
    this.formError = '';
    this.formSuccess = '';
    this.missingFields = [];

    if (!this.newComplex.identity) this.missingFields.push('Identity');
    if (!this.newComplex.address) this.missingFields.push('Address');
    if (!this.newComplex.admin_first_name) this.missingFields.push('First Name');
    if (!this.newComplex.admin_last_name) this.missingFields.push('Last Name');
    if (!this.newComplex.admin_email) this.missingFields.push('Email');
    if (!this.newComplex.admin_phoneNumber) this.missingFields.push('Phone');
    if (!this.newComplex.admin_password) this.missingFields.push('Password');

    if (this.missingFields.length > 0) {
      this.formError = 'missing';
      return;
    }

    this.complexService.createComplex(this.newComplex).subscribe({
      next: () => {
        this.formSuccess = 'Complex created successfully!';
        this.showForm = false;
        this.loadComplexes();
        this.newComplex = {
          identity: '',
          address: '',
          campaign_info: '',
          admin_civility: 'Mr',
          admin_first_name: '',
          admin_last_name: '',
          admin_email: '',
          admin_phone: '',
          admin_phoneCode: '+961',
          admin_phoneNumber: '',
          admin_password: '',
        };
        this.cdr.detectChanges();
      },
      error: (err) => {
        const msg = err.error?.message || '';

        if (msg.toLowerCase().includes('email')) {
          this.formError = 'This email is already used.';
        } else {
          this.formError = 'Error creating complex';
        }
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
