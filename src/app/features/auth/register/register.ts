import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.service';



@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  private supabaseService: SupabaseService;

  constructor(supabaseService: SupabaseService) {
    this.supabaseService = supabaseService;
  }

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

  validateAll() {
    this.profileUser.markAllAsTouched();
    const InputPassword = this.getUserPassword?.value;
    const InputConfirmPassword = this.getConfirmPassword?.value;
    const errorEl = document.getElementById('error');

    if (InputPassword !== InputConfirmPassword) {
      errorEl?.classList.remove('hidden');
      return;
    }
    errorEl?.classList.add('hidden');

    if (this.profileUser.valid) {
      this.supabaseService.signUp({
        email: this.getCorreo?.value || '',
        password: this.getUserPassword?.value || '',
        options: {
          data: {
            nombre: this.getUserName?.value || '',
            apellido: this.getUserLastName?.value || '',
            edad: this.getUserAge?.value || '',
          }
        }
      })
    }
  }

}
