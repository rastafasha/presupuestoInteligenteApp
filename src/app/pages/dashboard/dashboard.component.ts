import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    standalone: false
})
export class DashboardComponent implements OnInit {
  title = 'Panel Administrativo';
  public user: any;
  id:number;
  roleid:number;

  error: string;


  constructor(
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
  ) {
    this.user = authService.getLocalStorage();
  }

  ngOnInit(): void {
    this.authService.closeMenu();
  }

}
