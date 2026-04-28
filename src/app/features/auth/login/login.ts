import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../../core/services/supabase.auth.service';
import { Router } from '@angular/router';
import { AuthInvalidCredentialsError } from '@supabase/supabase-js';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private supabaseService: SupabaseService;
  private router: Router;
  private cdr: ChangeDetectorRef;

  constructor(supabaseService: SupabaseService, router: Router, cdr: ChangeDetectorRef) {
    this.supabaseService = supabaseService;
    this.router = router;
    this.cdr = cdr;
  }

  inValidCredential = false

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

  logInQuickly() {
    this.profileForm.patchValue({
      username: 'juanmaf236@gmail.com',
      password: '12345678'
    });
    this.profileForm.updateValueAndValidity();

  }


  async onSubmit() {
    this.profileForm.markAllAsTouched();
    this.inValidCredential = false;

    if (this.profileForm.valid) {
      try {
        const { data, error } = await this.supabaseService.signIn(
          this.username?.value || '',
          this.password?.value || ''
        );

        if (error || !data.session) {
          this.inValidCredential = true;
          this.cdr.detectChanges();
          return;
        }
        console.log("tamos yendo al home")
        this.router.navigateByUrl('');

      } catch (err) {
        console.error(err);
        this.inValidCredential = true;
        this.cdr.detectChanges();
      }
    }

  }
}
