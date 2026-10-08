import { Component } from '@angular/core';
import { User } from '../models/user';


// declare function customInitFunctions(); //llamammos a la funcion que carga los js

@Component({
    selector: 'app-pages',
    templateUrl: './pages.component.html',
    styles: [],
    standalone: false
})
export class PagesComponent {

  year = new Date().getFullYear();

  public user: User;
  id:number;





}
