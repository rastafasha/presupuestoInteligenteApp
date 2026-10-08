import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
@Component({
    selector: 'app-dashboard-user',
    templateUrl: './dashboard-user.component.html',
    styleUrls: ['./dashboard-user.component.css'],
    standalone: false
})
export class DashboardUserComponent implements OnInit {
  title = 'Admin Usuario';
  public user: any;
  public userprofile: User;
  displaycomponent: string = 'none';
  limit = 3;

  error: string;

  uid:string;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    this.user = authService.getLocalStorage();
  }

  ngOnInit(): void {
    this.uid = this.user.uid;
    this.authService.closeMenu();
    window.scrollTo(0,0);
    // this.getUserProfile();
  }


  getUserProfile(){
    this.userService.getUserById(this.uid).subscribe(
      (res:any) =>{
        this.userprofile = res;
        error => this.error = error;
      }
    );
  }



}
