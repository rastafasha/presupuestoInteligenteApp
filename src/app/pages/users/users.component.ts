import { Component, OnInit } from '@angular/core';

import { HttpBackend, HttpClient, HttpHandler } from '@angular/common/http';

import { Location } from '@angular/common';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { BusquedasService } from 'src/app/services/busqueda.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css'],
    standalone: false
})
export class UsersComponent implements OnInit {
  title = "Usuarios"

  loading = false;
  usersCount = 0;
  usuarios: any;
  user: User;
  roles;

  p: number = 1;
  count: number = 8;

  error: string;
  msm_error: string;


  ServerUrl = environment.apiUrl;
  query:string ='';

  constructor(
    private userService: UserService,
    private busquedasService: BusquedasService,
    private location: Location,
    private http: HttpClient,
    handler: HttpBackend,
    
    ) {
      this.http = new HttpClient(handler);
    }

  ngOnInit(): void {
    window.scrollTo(0,0);
    this.closeMenu();
    this.getUsers();
    this.getUser();
  }

  getUser(): void {
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  getUsers(): void {
    this.userService.getUsuarios().subscribe(
      res =>{
        this.usuarios = res;
        error => this.error = error;
      }
    );
  }
  PageSize() {
    this.getUsers();

  }


  eliminarUser(user:User){
    Swal.fire({
      title: 'Estas Seguro?',
      text: "No podras recuperarlo!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Borrar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteById(user).subscribe(
          response =>{
            this.getUsers();
          }
          );
        Swal.fire(
          'Borrado!',
          'El Archivo fue borrado.',
          'success'
        )
        this.ngOnInit();
      }
    });
  }

  goBack() {
    this.location.back(); // <-- go back to previous location on cancel
  }

  closeMenu(){
    var menuLateral = document.getElementsByClassName("sidebar");
      for (var i = 0; i<menuLateral.length; i++) {
         menuLateral[i].classList.remove("active");

      }
  }

  search() {// funciona, devuelve la busqueda

    if(!this.query){
      this.ngOnInit();
    }else{
      return this.busquedasService.searchGlobal(this.query).subscribe(
        (resp:any) => {
          this.usuarios = resp.usuarios;
          
        }
      )
    }
    
        
  }

 




}
