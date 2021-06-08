import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fadeInOnEnterAnimation } from 'angular-animations';

import { AuthService } from '../auth.service';
import { Globals } from 'src/app/app.globals';

/**
 * Login page component.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [fadeInOnEnterAnimation()],
})
export class LoginComponent {
  logo: string = 'assets/logo.png';
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    public globals: Globals
  ) {
    this.formGroup = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  submit() {
    this.globals.getFormValidationErrors(this.formGroup);
    if (this.formGroup.invalid) {
      return;
    }

    this.authService.login(
      this.formGroup.get('email')?.value,
      this.formGroup.get('password')?.value
    );
  }
}
