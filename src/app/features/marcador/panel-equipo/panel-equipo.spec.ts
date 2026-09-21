import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelEquipo } from './panel-equipo';

describe('PanelEquipo', () => {
  let component: PanelEquipo;
  let fixture: ComponentFixture<PanelEquipo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelEquipo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelEquipo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
