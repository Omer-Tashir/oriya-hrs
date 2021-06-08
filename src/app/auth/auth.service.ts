import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpErrorResponse } from '@angular/common/http';

import { DatabaseService } from '../core/database.service';
import { AlertService } from '../core/alerts/alert.service';
import { LookupData } from '../model/lookup-data';
import { Volunteer } from '../model/volunteer';
import { Globals } from '../../app/app.globals';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private db: DatabaseService,
    private router: Router,
    private alertService: AlertService,
    private globals: Globals
  ) {}

  login(email: string, password: string) {
    sessionStorage.clear();
    this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((auth) => {
        sessionStorage.setItem('user', JSON.stringify(auth.user));
        forkJoin([
          this.db.getVolunteers(),
          this.db.getLookupData()
        ]).subscribe(
          (resultArray) => {
          let volunteers = resultArray[0].docs.map(function (doc: any) {
            const data = doc.data();
            const id = doc.id;
            let volunteer = Object.assign(new Volunteer(), { ...data });
            volunteer.id = id;
            return volunteer;
          });

          if (
          volunteers.find((a: Volunteer) => a.email == auth?.user?.email) != null
          ) {
            sessionStorage.setItem('volunteer', 'true');
            }

            let lookupData = Object.assign(
              new LookupData(),
              resultArray[1]?.docs[0]?.data()
            );
            if (
              lookupData?.admins?.find((a: any) => a == auth?.user?.email) !=
              null
            ) {
              sessionStorage.setItem('admin', 'true');
            }

            sessionStorage.setItem('lookupData', JSON.stringify(lookupData));
            this.router.navigate(['home']);
          },
          (error) => {
            console.log(error);
            this.alertService.httpError(error);
          }
        );
      })
      .catch((error: any) => {
        console.log(error);
        this.alertService.httpError(error);
      });
  }

  logout(error?: HttpErrorResponse | undefined) {
    if (error != undefined) {
      this.alertService.httpError(error);
    }

    this.afAuth.signOut();
    sessionStorage.clear();
    this.router.navigate(['login']);
  }
}
