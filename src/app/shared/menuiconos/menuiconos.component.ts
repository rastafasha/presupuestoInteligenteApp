import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-menuiconos',
    templateUrl: './menuiconos.component.html',
    styleUrls: ['./menuiconos.component.css'],
    standalone: false
})
export class MenuiconosComponent implements OnInit {

  public user: User;
  public profile: User;

  error: string;
  roleid:number;
  uid:string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
  ) {
    this.user = this.userService.usuario;
  }


  ngOnInit(): void {
    this.getUser();
    // this.getUserProfile();
  }

  getUser(): void {

    this.user = JSON.parse(localStorage.getItem('user'));
    this.uid = this.user.uid;
  }



}
