import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';
@Component({
    selector: 'app-passwordreset',
    templateUrl: './passwordreset.component.html',
    styleUrls: ['./passwordreset.component.css'],
    standalone: false
})
export class PasswordresetComponent implements OnInit {
  email = new FormControl();

  submitted = false;
  errors:any = null;

  public formSumitted = false;
  public resetpaswordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.resetpaswordForm = this.fb.group({
      email: [ null, [Validators.required] ],
      // terminos: [false, Validators.required],

    });
  }

  ngOnInit(): void {

  }

  resetPassword(){

  this.authService.forgotPassword(this.resetpaswordForm.value).subscribe(
    resp =>{
      Swal.fire('Exito!', `Favor revisa tu Correo`, 'success');
    },(error) => {
      Swal.fire('Error', error.error.message, 'error');
      this.errors = error.error.message;
    }
    )
}

}
