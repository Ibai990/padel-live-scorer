import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Marca } from './marca';

describe('Marca', () => {
  let component: Marca;
  let fixture: ComponentFixture<Marca>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Marca]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Marca);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
