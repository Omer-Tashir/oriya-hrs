import { Component, OnInit } from '@angular/core';
import * as moment from 'moment/moment';

import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../core/alerts/alert.service';

declare let Email: any;

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
    fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class ContactUsComponent implements OnInit {
  randomImage: number = Math.floor(Math.random() * 6) + 1;

  form: FormGroup;
  name: FormControl = new FormControl("", [Validators.required]);
  phone: FormControl = new FormControl("", [Validators.required]);
  email: FormControl = new FormControl("", [Validators.required, Validators.email]);
  message: FormControl = new FormControl("", [Validators.required]);
  honeypot: FormControl = new FormControl(""); // we will use this to prevent spam
  submitted: boolean = false; // show and hide the success message
  isLoading: boolean = false; // disable the submit button if we're loading
  responseMessage!: string; // the response message to show to the user

  constructor(
    private formBuilder: FormBuilder, 
    private alertService: AlertService) {
    this.form = this.formBuilder.group({
      name: this.name,
      phone: this.phone,
      email: this.email,
      message: this.message,
      honeypot: this.honeypot
    });
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (this.form.status == "VALID" && this.honeypot.value == "") {
      this.form.disable(); // disable the form if it's valid to disable multiple submissions
      var formData: any = new FormData();
      formData.append("name", this.form.get("name")?.value);
      formData.append("phone", this.form.get("phone")?.value);
      formData.append("email", this.form.get("email")?.value);
      formData.append("message", this.form.get("message")?.value);
      this.isLoading = true; // sending the post request async so it's in progress
      this.submitted = false; // hide the response message on multiple submits

      Email.send({
        Host : "smtp.elasticemail.com",
        Username : "oriyacv@gmail.com",
        Password : "846C3C7AFFE08CD5E28566125C502014A3DC",
        From : "oriyacv@gmail.com",
        To : "saviv3@gmail.com",
        Subject : "התקבלה פנייה חדשה באתר",
        Body : `
          תאריך: ${moment(new Date()).format('DD/MM/YYYY')}
          <br>
          <br>
          שם: ${this.form.controls['name'].value},
          <br>
          טלפון: ${this.form.controls['phone'].value},
          <br>
          אימייל: ${this.form.controls['email'].value},
          <br>
          הודעה: ${this.form.controls['message'].value}
        `,
        }).then((message: any) => {
          this.form.enable(); // re enable the form after a success
          this.submitted = true; // show the response message
          this.isLoading = false; // re enable the submit button
          console.log(message);

          this.alertService.ok(
            'תודה רבה על פניתכם',
            'קיבלנו את הפניה שלכם ונציג מטעמנו יחזור אליכם בהקדם'
          );
        });
    }
  }
}