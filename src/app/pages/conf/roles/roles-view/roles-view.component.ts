import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-roles-view',
    templateUrl: './roles-view.component.html',
    styleUrls: ['./roles-view.component.css'],
    standalone: false
})
export class RolesViewComponent implements OnInit {

   title = "Roles";
  users: User;
  user: User;
  role?: User;

  p: number = 1;
  count: number = 8;

  error: string;
  msm_error: string;

  rolesSelected:number;

  rolesForm: FormGroup;

  constructor(
    private fb:FormBuilder,
    private userService: UserService,
    private location: Location,
  ) { }

  ngOnInit(): void {
    this.getUsers();
    window.scrollTo(0,0);
  }

  getUsers(): void {
    this.userService.getUsuarios().subscribe(
      res =>{
        this.users = res;
        error => this.error = error;
      }
    );
  }

  cambiarRole(user: User){
    this.userService.editarRole(user).subscribe(
      resp =>{ console.log(resp);
        Swal.fire('Actualizado', `actualizado rol correctamente`, 'success');
        this.getUsers();
      }
    )
  }


  goBack() {
    this.location.back(); // <-- go back to previous location on cancel
  }

}
