import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

import { DatabaseService } from '../core/database.service';

@Injectable({
  providedIn: 'root',
})
export class isAdminGuard implements CanActivate {
  constructor(private db: DatabaseService, private afAuth: AngularFireAuth) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (sessionStorage.getItem('admin') != null) {
        if (sessionStorage.getItem('admin') == 'true') {
          resolve(true);
        } else {
          reject(false);
        }
      } else {
        this.afAuth.authState.subscribe((user) => {
          // this.db.getLookupData().subscribe(
          //   (resultArray: any) => {
          //     let lookupData = Object.assign(
          //       new LookupData(),
          //       resultArray?.docs[0]?.data()
          //     );
          //     sessionStorage.setItem('lookupData', JSON.stringify(lookupData));
          //     if (
          //       lookupData?.admins?.find((a: any) => a == user?.email) != null
          //     ) {
          //       sessionStorage.setItem('admin', 'true');
          //       resolve(true);
          //     }
          //   },
          //   (error) => {
          //     console.log(error);
          //     reject(false);
          //   }
          // );
        });
      }
    });
  }
}