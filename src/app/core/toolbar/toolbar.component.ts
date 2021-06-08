import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation,
} from 'angular-animations';

import { DatabaseService } from '../database.service';
import { AuthService } from '../../auth/auth.service';
import { AlertService } from '../alerts/alert.service';
import { LookupData } from '../../model/lookup-data';
import { Volunteer } from 'src/app/model/volunteer';

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
  isVolunteer: boolean = false;
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

    if (sessionStorage.getItem('volunteer') != null) {
      this.isVolunteer = true;
    }
    else {
      this.db.getVolunteers().subscribe(
        (resultArray: any) => {
          let volunteers = resultArray.docs.map(function (doc: any) {
            const data = doc.data();
            const id = doc.id;
            let volunteer = Object.assign(new Volunteer(), { ...data });
            volunteer.id = id;
            return volunteer;
          });

          if (
          volunteers.find((a: Volunteer) => a.email == this.email) != null
          ) {
            sessionStorage.setItem('volunteer', 'true');
            this.isVolunteer = true;
          }
        },
        (error) => {
          console.log(error);
          this.alertService.httpError(error);
        },
        () => {
          this.isLoading = false;
        }
      );
    }

    if (sessionStorage.getItem('lookupData') != null) {
      let temp = sessionStorage.getItem('lookupData');
      if (temp != null) {
        let lookupData = Object.assign(new LookupData(), JSON.parse(temp));

        if (lookupData?.admins?.find((a: any) => a == this.email) != null) {
          this.isAdmin = true;
        }
      }

      this.isLoading = false;
    } else {
      this.db.getLookupData().subscribe(
        (resultArray) => {
          let lookupData = Object.assign(
            new LookupData(),
            resultArray?.docs[0]?.data()
          );
          sessionStorage.setItem('lookupData', JSON.stringify(lookupData));
          if (lookupData?.admins?.find((a: any) => a == this.email) != null) {
            sessionStorage.setItem('admin', 'true');
            this.isAdmin = true;
          }
        },
        (error) => {
          console.log(error);
          this.alertService.httpError(error);
        },
        () => {
          this.isLoading = false;
        }
      );
    }
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
