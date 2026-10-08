import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PieChart2Component } from './pie-chart2.component';

describe('PieChart2Component', () => {
  let component: PieChart2Component;
  let fixture: ComponentFixture<PieChart2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PieChart2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PieChart2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
