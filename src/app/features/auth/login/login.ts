import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {


  profileForm = new FormGroup({
    username: new FormControl<string | null>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.email
    ]),
    password: new FormControl<string | null>('', [
      Validators.required,
      Validators.minLength(3)
    ])
  })

  get username() {
    return this.profileForm.get('username');
  }

  get password() {
    return this.profileForm.get('password');
  }


  showPassword = false
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
  }
}
