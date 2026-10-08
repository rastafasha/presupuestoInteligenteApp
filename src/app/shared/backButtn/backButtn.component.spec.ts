import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackButtnComponent } from './backButtn.component';

describe('BackButtnComponent', () => {
    let component: BackButtnComponent;
    let fixture: ComponentFixture<BackButtnComponent>;

    // beforeEach(async(() => {
    //     TestBed.configureTestingModule({
    //         declarations: [ BackButtnComponent ]
    //     })
    //     .compileComponents();
    // }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BackButtnComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});