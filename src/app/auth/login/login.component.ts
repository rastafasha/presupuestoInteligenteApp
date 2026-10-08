import { Component, NgZone, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/auth.service';

declare const gapi: any;


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent implements OnInit {

  errors: any = null;
  roles: string[] = [];

  public auth2: any;
  isLoading: boolean = false;

  user: User;

  public loginForm!: FormGroup;
  // Registro
  public formSumitted = false;

  public registerForm!: FormGroup;
  // Registro



  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.loginForm = this.fb.group({
      email: [localStorage.getItem('email') || '', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]

    });

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      roles: ['USER'],
      terminos: [true, Validators.required],

    }, {
      validators: this.passwordsIguales('password', 'confirmPassword')

    });
  }

  ngOnInit() {
    // this.renderButton();
  }

  

  login(){
  this.isLoading = true;
  this.authService.login(this.loginForm.value).subscribe(
      resp => {
        // console.log('Login response:', resp);
        // Set estaAutenticado always on success (for guard)
        localStorage.setItem('estaAutenticado', 'true');
        this.authService.getLocalStorage();

        if (this.loginForm.get('remember')?.value) {
          localStorage.setItem('email', this.loginForm.get('email')?.value);
        } else {
          localStorage.removeItem('email');
        }
        this.isLoading = false;
        this.router.navigateByUrl('/dashboard');


        // this.router.navigateByUrl('/my-account');
      }, (err) => {

        Swal.fire('Error', err.error.msg, 'error');
        this.isLoading = false;
      }
    )
}



  // Registro
  crearUsuario() {
    this.formSumitted = true;
    this.isLoading = true;
    this.authService.crearUsuario(this.registerForm.value).subscribe(
      resp => {
        this.isLoading = false;
        Swal.fire('Registrado!', `Ya puedes ingresar`, 'success');

        window.location.reload();
      }, (error) => {
        this.isLoading = false;
        Swal.fire('Error', error.error.msg, 'error');
        this.errors = error.error;
      }
    );
    return false;
  }

  campoNoValido(campo: string): boolean {
    if (this.registerForm.get(campo).invalid && this.formSumitted) {
      return true;
    } else {
      return false;
    }


  }

  aceptaTerminos() {
    return !this.registerForm.get('terminos').value && this.formSumitted;
  }

  passwordNoValido() {
    const pass1 = this.registerForm.get('password').value;
    const pass2 = this.registerForm.get('confirmPassword').value;

    if ((pass1 !== pass2) && this.formSumitted) {
      return true;
    } else {
      return false;
    }
  }

  passwordsIguales(pass1Name: string, pass2Name: string) {
    return (formGroup: FormGroup) => {
      const pass1Control = formGroup.get(pass1Name);
      const pass2Control = formGroup.get(pass2Name);

      if (pass1Control.value === pass2Control.value) {
        pass2Control.setErrors(null)
      } else {
        pass2Control.setErrors({ noEsIgual: true });
      }
    }
  }
  // Registro



  // renderButton() {
  //   gapi.signin2.render('my-signin2', {
  //     'scope': 'profile email',
  //     'width': 240,
  //     'height': 50,
  //     'longtitle': true,
  //     'theme': 'dark',
  //   });
  //   this.startApp();
  // }

  // async startApp(){
  //   this.usuarioService.googleInit();
  //   this.auth2 = this.usuarioService.auth2;

  //   this.attachSignin(document.getElementById('my-signin2'));

  // }

  // attachSignin(element) {
  //   this.auth2.attachClickHandler(element, {},
  //       (googleUser) =>{
  //         const id_token = googleUser.getAuthResponse().id_token;

  //         this.usuarioService.loginGoogle(id_token).subscribe(
  //           resp=>{

  //             this.ngZone.run(()=>{
  //               this.router.navigateByUrl('/dashboard');
  //             })
  //           }
  //         );

  //         console.log(gapi.auth2.getAuthInstance())

  //       }, (error) =>{
  //         alert(JSON.stringify(error, undefined, 2));
  //       });


  // }





}
