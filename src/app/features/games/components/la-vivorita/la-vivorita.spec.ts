import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LaVivorita } from './la-vivorita';

describe('LaVivorita', () => {
  let component: LaVivorita;
  let fixture: ComponentFixture<LaVivorita>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LaVivorita],
    }).compileComponents();

    fixture = TestBed.createComponent(LaVivorita);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
