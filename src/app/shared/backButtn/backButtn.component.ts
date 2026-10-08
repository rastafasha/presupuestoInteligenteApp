import { Component, Inject, Input } from '@angular/core';
import {  Location } from '@angular/common';
@Component({
    selector: 'app-backButtn',
    templateUrl: './backButtn.component.html',
    styleUrls: ['./backButtn.component.css'],
    standalone: false
})
export class BackButtnComponent {
    // private _location = Inject(Location)
    @Input() pageTitle!:string;
    @Input() title!:string;
    @Input() displaycomponent: string = 'block';
    
    constructor(private _location: Location) {}

    goBack() {
        this._location.back();
      }
}