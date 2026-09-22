import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiniCampo } from './mini-campo';

describe('MiniCampo', () => {
  let component: MiniCampo;
  let fixture: ComponentFixture<MiniCampo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiniCampo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiniCampo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
