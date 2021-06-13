import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { fadeInOnEnterAnimation } from 'angular-animations';

import { AuthService } from '../auth/auth.service';
import { Globals } from 'src/app/app.globals';

@Component({
  selector: 'app-company-sign-up',
  templateUrl: './company-sign-up.component.html',
  styleUrls: ['./company-sign-up.component.css'],
  animations: [fadeInOnEnterAnimation()],
})
export class CompanySignUpComponent implements OnInit {
  logo: string = 'assets/logo.png';
  newCompany = false;
  formGroup: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    public globals: Globals
  ) {
    this.formGroup = this.formBuilder.group({
      name: ['', Validators.nullValidator],
      contactName: ['', Validators.nullValidator],
      contactPhone: ['', Validators.nullValidator],
      contactRole: ['', Validators.nullValidator],
      phone: ['', Validators.nullValidator],
      domain: ['', Validators.nullValidator],
      email: ['', Validators.required],
      password: ['', Validators.required],
      image: ['', Validators.nullValidator],
    });
  }

  onSelectImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.formGroup.controls['image'].setValue(event.target.result);
      }
    }
  }

  submit() {
    this.globals.getFormValidationErrors(this.formGroup);
    if (this.formGroup.invalid) {
      return;
    }

    if (this.newCompany) {
      this.authService.companyRegister(
        this.formGroup.get('name')?.value,
        this.formGroup.get('contactName')?.value,
        this.formGroup.get('contactPhone')?.value,
        this.formGroup.get('contactRole')?.value,
        this.formGroup.get('phone')?.value,
        this.formGroup.get('domain')?.value,
        this.formGroup.get('email')?.value,
        this.formGroup.get('password')?.value,
        this.formGroup.get('image')?.value
      );
    }
    else {
      this.authService.companyLogin(
        this.formGroup.get('email')?.value,
        this.formGroup.get('password')?.value
      );
    }
  }

  ngOnInit(): void {
  }
}
