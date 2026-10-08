import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { Profile } from 'src/app/models/profile';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.css'],
    standalone: false
})
export class UserProfileComponent implements OnInit {

  title = "Detalles de la cuenta";
  usuario: User;
  user: User;
  profile: Profile;
  error: string;
  uid:string;

  rolesSelected:number;

  p: number = 1;
  count: number = 8;

  constructor(
    private userService: UserService,
    private profileService: ProfileService,
    private activatedRoute: ActivatedRoute,
    private location: Location,

  ) {
    this.usuario = userService.usuario;
  }

  ngOnInit(): void {
    window.scrollTo(0,0);
    this.closeMenu();
    this.activatedRoute.params.subscribe( ({id}) => this.getUserRemoto(id));
    this.activatedRoute.params.subscribe( ({id}) => this.getProfile(id));
    
  }

  closeMenu(){
    var menuLateral = document.getElementsByClassName("sidebar");
      for (var i = 0; i<menuLateral.length; i++) {
         menuLateral[i].classList.remove("active");

      }
  }



  getUserRemoto(id){
    this.userService.getUserById(id).subscribe(
      res =>{
        this.usuario = res;
        error => this.error = error;
        // console.log(this.usuario);
      }
    );

  }

  getProfile(id:string){
    
    this.profileService.getByUser(id).subscribe(
      res =>{
        this.profile = res[0];
        error => this.error = error;
      }
    );

    
  }



  goBack() {
    this.location.back(); // <-- go back to previous location on cancel
  }

  updateUser(userprofile: Profile){
    this.profileService.updateProfile(userprofile ).subscribe(
      resp =>{ console.log(resp);
        Swal.fire('Actualizado', `actualizado correctamente`, 'success');

      }
    )
  }

  
}
