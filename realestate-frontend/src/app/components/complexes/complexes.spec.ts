import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Complexes } from './complexes';

describe('Complexes', () => {
  let component: Complexes;
  let fixture: ComponentFixture<Complexes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Complexes],
    }).compileComponents();

    fixture = TestBed.createComponent(Complexes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
