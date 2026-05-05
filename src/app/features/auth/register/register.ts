import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  private supabaseService: SupabaseService;
  private router: Router;


  constructor(supabaseService: SupabaseService, router: Router) {
    this.supabaseService = supabaseService;
    this.router = router;
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

  async validateAll() {
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
      try {
        const { data, error } = await this.supabaseService.signUp({
          email: this.getCorreo?.value || '',
          password: this.getUserPassword?.value || '',
          options: {
            data: {
              nombre: this.getUserName?.value || '',
              apellido: this.getUserLastName?.value || '',
              edad: this.getUserAge?.value || '',
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          console.log('Usuario logueado');
        } else {
          console.log('Revisar email para confirmar');
        }

        this.router.navigate(['/home']);

      } catch (err: any) {
        console.error(err);

        errorEl!.textContent = err.message;
        if (err.message == "User already registered") errorEl!.textContent = "El usuario ya existe";
        errorEl?.classList.remove('hidden');
      }
    }
  }
}