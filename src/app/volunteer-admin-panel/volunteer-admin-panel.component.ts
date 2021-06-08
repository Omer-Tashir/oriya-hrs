import { Component, OnInit } from '@angular/core';
import {
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation,
} from 'angular-animations';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { AlertService } from '../core/alerts/alert.service';
import { DatabaseService } from '../core/database.service';
import { Globals } from '../app.globals';

@Component({
  selector: 'app-volunteer-admin-panel',
  templateUrl: './volunteer-admin-panel.component.html',
  styleUrls: ['./volunteer-admin-panel.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation()],
})
export class VolunteerAdminPanelComponent implements OnInit {
  public isLoading: boolean = false;
  public random: Number | undefined;

  displayName: any;
  email: any;
  title: any;

  constructor(
    public router: Router,
    public db: DatabaseService,
    public afAuth: AngularFireAuth,
    private alertService: AlertService,
    public globals: Globals
  ) {
    this.isLoading = true;
    this.random = this.globals.random(1, 9);

    if (sessionStorage.getItem('user') != null) {
      let temp = sessionStorage.getItem('user');
      if (temp != null) {
        let user = JSON.parse(temp);
        this.displayName = user?.displayName;
        this.email = user?.email;
        this.title = `ברוך הבא ${this.displayName}`;
        this.isLoading = false;
      }
    } else {
      this.afAuth.authState.subscribe((auth) => {
        this.displayName = auth?.displayName;
        this.email = auth?.email;
        this.title = `ברוך הבא ${this.displayName}`;
        this.isLoading = false;
      });
    }
  }

  ngOnInit(): void {}
}
