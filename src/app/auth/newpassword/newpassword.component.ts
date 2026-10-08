import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
@Component({
    selector: 'app-newpassword',
    templateUrl: './newpassword.component.html',
    styleUrls: ['./newpassword.component.css'],
    standalone: false
})
export class NewpasswordComponent implements OnInit {
  password = new FormControl();
  email = new FormControl();
  resetToken = new FormControl();

  submitted = false;
  returnUrl: string;
  error = null;
  errors:any = null;

  public formSumitted = false;

  public passwordForm!: FormGroup;
  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.passwordForm = this.fb.group({
      email: [ null, [Validators.required] ],
      password: [null, Validators.required],
      password2: [null, Validators.required],
      resetToken: [null],

    }, {
      validators: this.passwordsIguales('password', 'password2')

    });
    activatedRouter.queryParams.subscribe(params=>{
      this.resetToken = params['auth_token'];
    })
  }

  ngOnInit(): void {
  }


passwordNoValido(){
  const pass1 = this.passwordForm.get('password').value;
  const pass2 = this.passwordForm.get('password2').value;

  if((pass1 !== pass2) && this.formSumitted){
    return true;
  }else{
    return false;
  }
}

passwordsIguales(pass1Name: string, pass2Name: string){
  return (formGroup: FormGroup) =>{
    const pass1Control = formGroup.get(pass1Name);
    const pass2Control = formGroup.get(pass2Name);

    if(pass1Control.value === pass2Control.value){
      pass2Control.setErrors(null)
    }else{
      pass2Control.setErrors({noEsIgual: true});
    }
  }
}

newPassword(){

  this.authService.change_password(this.email, this.passwordForm.value).subscribe(
    resp =>{

      Swal.fire('Exito!', `Contraseña Actualizada`, 'success');
      this.router.navigateByUrl('/login');
    },(error) => {
      Swal.fire('Error', error.error.message, 'error');
      this.errors = error.error.message;
    }
    )
    // console.log(this.user)
}

}
