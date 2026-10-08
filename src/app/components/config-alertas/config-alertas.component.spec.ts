import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigAlertasComponent } from './config-alertas.component';

describe('ConfigAlertasComponent', () => {
  let component: ConfigAlertasComponent;
  let fixture: ComponentFixture<ConfigAlertasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigAlertasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigAlertasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
