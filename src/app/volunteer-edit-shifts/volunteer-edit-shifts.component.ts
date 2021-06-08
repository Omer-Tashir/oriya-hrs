import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation,
} from 'angular-animations';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { WarningDialogComponent } from '../core/warning-dialog/warning-dialog.component';
import { DateFormatPipe } from '../core/date-formatter/date-formatter';
import { AlertService } from '../core/alerts/alert.service';
import { DatabaseService } from '../core/database.service';

import { Volunteer } from '../model/volunteer';
import { Shift } from '../model/shift';
import { Globals } from '../app.globals';
import { Inlay } from '../model/inlay';
import { forkJoin } from 'rxjs';
import { Needy } from '../model/needy';

@Component({
  selector: 'app-volunteer-edit-shifts',
  templateUrl: './volunteer-edit-shifts.component.html',
  styleUrls: ['./volunteer-edit-shifts.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation()],
})
export class VolunteerEditShiftsComponent implements OnInit {
  public random: Number | undefined;
  isLoading: boolean = true;
  volunteer: Volunteer | undefined;
  volunteers: Volunteer[] = [];
  needys: Needy[] = [];
  myShifts: Shift[] = [];
  email: any;

  constructor(
    public router: Router,
    public db: DatabaseService,
    public afAuth: AngularFireAuth,
    private alertService: AlertService,
    private dialog: MatDialog,
    private datepipe: DateFormatPipe,
    public globals: Globals
  ) {
    this.random = this.globals.random(1, 9);
    if (sessionStorage.getItem('user') != null) {
      let temp = sessionStorage.getItem('user');
      if (temp != null) {
        let user = JSON.parse(temp);
        this.email = user?.email;
        this.getVolunteer();
      }
    } else {
      this.afAuth.authState.subscribe((auth) => {
        this.email = auth?.email;
        this.getVolunteer();
      });
    }
  }

  private getVolunteer() {
    forkJoin([this.db.getVolunteers(), this.db.getNeedys()]).subscribe(
      (data) => {
        this.volunteers = data[0].docs.map(function (doc: any) {
          const data = doc.data();
          const id = doc.id;
          let volunteer = Object.assign(new Volunteer(), { ...data });
          volunteer.id = id;
          return volunteer;
        });

        this.needys = data[1].docs.map(function (doc: any) {
          const data = doc.data();
          const id = doc.id;
          let needy = Object.assign(new Needy(), { ...data });
          needy.id = id;
          return needy;
        });
      
        this.volunteer = this.volunteers.find((a: Volunteer) => a.email == this.email);
        if (this.volunteer) {
          let that = this;
          this.db.getVolunteerShifts(this.volunteer.id).subscribe((resultArray: any) => {
            this.myShifts = resultArray.docs.map(function (doc: any) {
              const data = doc.data();
              const id = doc.id;
              return Object.assign(new Shift(), {
                id: id,
                volunteer: that.volunteers.find(v => v.id == data?.volunteer),
                needy: that.needys.find(n=>n.id==data?.needy),
                date: new Date(data?.date?.toDate()?.setHours(0, 0, 0, 0)),
                approved: data?.approved
              });
            });
            this.myShifts = this.myShifts.sort((a, b) => {
              return <any>new Date(a.date) - <any>new Date(b.date);
            });
          }, error => {
            console.log(error);
            this.isLoading = false;
            this.alertService.httpError(error);
          }, () => {
            this.isLoading = false;
          });
        }
      },
      (error) => {
        console.log(error);
        this.alertService.httpError(error);
      });
  }

  deleteDate(shift: Shift) {
    const dialogRef = this.dialog.open(WarningDialogComponent, {
      width: '600px',
      data: {
        title: `האם את/ה בטוח/ה לגביי ביטול ההתנדבות בתאריך - ${this.datepipe.transform(shift.date)}?`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined && result != null) {
        this.isLoading = true;
        this.db.removeShift(shift.id).then(() => {
          this.myShifts = this.myShifts.filter(s => s.id != shift.id);
          let inlays: Inlay[] = [];
          this.db.getInlays().subscribe(
            (resultArray) => {
              for (let i = 0; i < resultArray.docs.length; i++) {
                let row = resultArray.docs[i].data();
                inlays.push(
                  Object.assign(new Inlay(), {
                    id: resultArray.docs[i].id,
                    shift_id: row?.shift_id,
                    date: new Date(row?.date?.toDate()?.setHours(0, 0, 0, 0)),
                    volunteer: this.volunteers.find((v) => v.id == row.volunteer),
                    needy: this.needys.find((n) => n.id == row.needy),
                  })
                );
              }

              let toRemove: Inlay[] = inlays.filter(i=>i.shift_id == shift.id);
              for (let i = 0; i < toRemove.length; i++) {
                this.db.removeInlay(toRemove[i]);
              }

              this.isLoading = false;
            }, error => {
              console.log(error);
              this.isLoading = false;
              this.alertService.httpError(error);
            });
         }).catch(error => {
          console.log(error);
          this.isLoading = false;
          this.alertService.httpError(error);
        });
      }
    });
  }

  ngOnInit(): void {
  }
}
