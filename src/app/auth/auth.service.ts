import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { HttpErrorResponse } from '@angular/common/http';

import { DatabaseService } from '../core/database.service';
import { AlertService } from '../core/alerts/alert.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private afAuth: AngularFireAuth,
    private db: DatabaseService,
    private router: Router,
    private alertService: AlertService,
  ) {}

  login(email: string, password: string) {
    this.afAuth
      .signInWithEmailAndPassword(email, password)
      .then((auth) => {
        this.db.getAdmins().subscribe(admins => {
          console.log(admins);
          const currentUser = admins.find(a => a.email === email);
          if (!!currentUser) {
            console.log(currentUser);
            sessionStorage.setItem('admin', JSON.stringify(currentUser));
          }
        });

        sessionStorage.setItem('user', JSON.stringify(auth.user));
        this.router.navigate(['']);
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
