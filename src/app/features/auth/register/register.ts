import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  regexAge = /^(0?[1-9]|[1-9][0-9]|[1][0-4][0-9]|150)$/;

  profileUser = new FormGroup({
    correo: new FormControl<string | null>("", [
      Validators.required,
      Validators.minLength(3),
      Validators.email,
    ]),
    userName: new FormControl<string | null>("", [
      Validators.required,
      Validators.minLength(2),
    ]),
    userLastName: new FormControl<string | null>("",
      Validators.required,
    ),
    userAge: new FormControl<string | null>("", [
      Validators.pattern(this.regexAge),
      Validators.required
    ]
    ),
    userPassword: new FormControl<string | null>("", [
      Validators.minLength(8),
      Validators.required
    ]),
    confirmPassword: new FormControl<string | null>("", [
      Validators.minLength(8),
      Validators.required
    ]),
  })

  // get para acortar el codigo
  get getCorreo() {
    return this.profileUser.get('correo')
  }

  get getUserName() {
    return this.profileUser.get('userName')
  }

  get getUserLastName() {
    return this.profileUser.get('userLastName')
  }

  get getUserAge() {
    return this.profileUser.get('userAge')
  }

  get getUserPassword() {
    return this.profileUser.get('userPassword')
  }

  get getConfirmPassword() {
    return this.profileUser.get('confirmPassword')
  }

  valuePassword = false
  valueConfirmPassword = false

  togglePassword() {
    this.valuePassword = !this.valuePassword
  }
  toggleConfirmPassword() {
    this.valueConfirmPassword = !this.valueConfirmPassword
  }

}
