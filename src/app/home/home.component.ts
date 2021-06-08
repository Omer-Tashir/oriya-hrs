import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';

import { AlertService } from '../core/alerts/alert.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
  fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()],
})
export class HomeComponent implements OnInit {
  isLoading: boolean = true;
  auth: any;

  constructor(public afAuth: AngularFireAuth, private alertService: AlertService) {
    this.afAuth.authState.subscribe(auth => {
      this.auth = auth;
      this.isLoading = false;
    });
  }

  ngOnInit(): void {}
}
