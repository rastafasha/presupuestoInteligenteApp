import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';


// import * as $ from 'jquery';
//declare function init_plugins();

declare var $: any;
declare var jQuery: any;



@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styles: []
})


export class MenuComponent implements OnInit {

  @ViewChild('sidenav') sidenav;

  public user: any;
  error: string;
  id: any;
  roleid:string;

  constructor(
    private authServce: AuthService,
  ) {
    
   }

  ngOnInit(): void {
    this.user = this.authServce.getLocalStorage();
    this.id = this.user.uid;
  }


  toggleNav(){
    this.sidenav.toggle();
  }


  logout(): void {
    this.authServce.logout();
  }

}
