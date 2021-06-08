import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation,
} from 'angular-animations';

import { DatabaseService } from '../database.service';
import { AuthService } from '../../auth/auth.service';
import { AlertService } from '../alerts/alert.service';
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation()],
})
export class ToolbarComponent implements OnInit {
  @Input() title: string | undefined;
  @Input() auth: any;

  isLoading: boolean = false;
  isAdmin: boolean = false;
  displayName: any;
  email: any;

  constructor(
    public db: DatabaseService,
    public afAuth: AngularFireAuth,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  authLogic(auth: any) {
    this.displayName = auth?.displayName;
    this.email = auth?.email;
    this.isLoading = false;
  }

  logout(): void {
    this.authService.logout();
  }

  ngOnInit(): void {
    this.isLoading = true;
    if (this.title == undefined) {
      if (this.auth != undefined) {
        this.authLogic(this.auth);
      }
      this.afAuth.authState.subscribe(
        (auth) => {
          this.authLogic(auth);
        },
        (error) => {
          console.log(error);
          this.alertService.httpError(error);
          this.isLoading = false;
        }
      );
    } else {
      this.isLoading = false;
    }
  }
}
