import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ahorcados } from './ahorcados';

describe('Ahorcados', () => {
  let component: Ahorcados;
  let fixture: ComponentFixture<Ahorcados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ahorcados],
    }).compileComponents();

    fixture = TestBed.createComponent(Ahorcados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
