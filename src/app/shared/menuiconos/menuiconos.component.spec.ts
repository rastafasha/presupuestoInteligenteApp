import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuiconosComponent } from './menuiconos.component';

describe('MenuiconosComponent', () => {
  let component: MenuiconosComponent;
  let fixture: ComponentFixture<MenuiconosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MenuiconosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MenuiconosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
