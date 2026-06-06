import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BuildingService } from '../../services/building';
import { ComplexService } from '../../services/complex';
import { AuthService } from '../../services/auth';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-buildings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './buildings.html',
  styleUrl: './buildings.css',
})
export class Buildings implements OnInit {
  buildings: any[] = [];
  complexes: any[] = [];
  filterComplexId: number = 0;
  showForm = false;
  formError = '';
  formSuccess = '';
  loadError = '';
  deleteSuccess = '';
  deleteError = '';
  isSuperAdmin = false;
  isComplexAdmin = false;
  userComplexId: number | null = null;
  formComplexes: any[] = [];
  missingFields: string[] = [];
  phoneMaxLengths: { [key: string]: number } = {
  '+961': 8,
  '+1':   10,
  '+44':  10,
  '+33':  9,
  '+49':  11,
  '+39':  10,
  '+34':  9,
  '+971': 9,
  '+966': 9,
  '+962': 9,
  '+963': 9,
  '+20':  10,
  '+212': 9,
  '+216': 8,
  '+90':  10,
  '+30':  10,
};

getBuildingPhoneMaxLength(): number {
  return this.phoneMaxLengths[this.newBuilding.admin_phoneCode] || 15;
}

  newBuilding: {
    name: string;
    complex_id: number | null;
    admin_civility: string;
    admin_first_name: string;
    admin_last_name: string;
    admin_email: string;
    admin_phone: string;
    admin_phoneCode: string;
    admin_phoneNumber: string;
    admin_password: string;
  } = {
    name: '',
    complex_id: null,
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
    private buildingService: BuildingService,
    private complexService: ComplexService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.isSuperAdmin();
    this.isComplexAdmin = this.authService.getRole() === 'complex_admin';
    this.userComplexId = this.authService.getUserComplexId();
    this.loadBuildings();
    this.loadComplexes();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.urlAfterRedirects === '/buildings') {
          this.showForm = false;
          this.resetForm();
        }
      });
  }

  loadBuildings(): void {
    const complexId = this.filterComplexId > 0 ? this.filterComplexId : undefined;
    this.buildingService.getBuildings(complexId).subscribe({
      next: (res) => {
        this.buildings = res.buildings || [];
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadError = 'Failed to load buildings.';
      },
    });
  }

  resetForm(): void {
    this.newBuilding = {
      name: '',
      complex_id: this.userComplexId,
      admin_civility: 'Mr',
      admin_first_name: '',
      admin_last_name: '',
      admin_email: '',
      admin_phone: '',
      admin_phoneCode: '+961',
      admin_phoneNumber: '',
      admin_password: '',
    };

    this.missingFields = [];
    this.formError = '';
  }

  loadComplexes(): void {
    this.complexService.getComplexes().subscribe({
      next: (res) => {
        const all = res.complexes || [];

        this.complexes = all;

        if (this.isSuperAdmin) {
          this.formComplexes = all;
        } else if (this.isComplexAdmin) {
          this.formComplexes = all.filter((c: any) => c.id === this.userComplexId);

          this.newBuilding.complex_id = this.userComplexId;
        }

        this.cdr.detectChanges();
      },
    });
  }

  onPhoneInput(): void {
    this.newBuilding.admin_phone =
      this.newBuilding.admin_phoneCode + this.newBuilding.admin_phoneNumber;
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    return /[0-9]/.test(event.key);
  }

  createBuilding(): void {
    this.formError = '';
    this.formSuccess = '';
    this.missingFields = [];

    if (!this.newBuilding.name) this.missingFields.push('Building Name');
    if (!this.newBuilding.complex_id) this.missingFields.push('Complex');
    if (!this.newBuilding.admin_first_name) this.missingFields.push('First Name');
    if (!this.newBuilding.admin_last_name) this.missingFields.push('Last Name');
    if (!this.newBuilding.admin_email) this.missingFields.push('Email');
    if (!this.newBuilding.admin_phoneNumber) this.missingFields.push('Phone');
    if (!this.newBuilding.admin_password) this.missingFields.push('Password');

    if (this.missingFields.length > 0) {
      this.formError = 'missing';
      return;
    }

    this.buildingService.createBuilding(this.newBuilding).subscribe({
      next: () => {
        this.formSuccess = 'Building created successfully!';
        this.showForm = false;
        this.loadBuildings();
        this.newBuilding = {
          name: '',
          complex_id: this.userComplexId,
          admin_civility: 'Mr',
          admin_first_name: '',
          admin_last_name: '',
          admin_email: '',
          admin_phone: '',
          admin_phoneCode: '+961',
          admin_phoneNumber: '',
          admin_password: '',
        };
      },
      error: (err) => {
        const msg = err.error?.message || '';

        if (msg.toLowerCase().includes('email')) {
          this.formError = 'This email is already used.';
        } else {
          this.formError = 'Error creating building';
        }
      },
    });
  }

  deleteBuilding(building: any): void {
    if (this.isComplexAdmin && building.complex_id !== this.userComplexId) {
      this.deleteError = 'You are not allowed to delete this building.';
      setTimeout(() => (this.deleteError = ''), 2500);
      return;
    }
    this.buildingService.deleteBuilding(building.id).subscribe({
      next: () => {
        this.loadBuildings();
        this.deleteSuccess = 'Building deleted successfully';
        setTimeout(() => (this.deleteSuccess = ''), 2000);
      },
      error: (err) => {
        this.deleteError = err.error?.message || 'Delete failed';
        setTimeout(() => (this.deleteError = ''), 2500);
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