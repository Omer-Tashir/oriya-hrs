import { Component, OnInit } from '@angular/core';
import {
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation,
} from 'angular-animations';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { AlertService } from '../core/alerts/alert.service';
import { DatabaseService } from '../core/database.service';
import { Volunteer } from '../model/volunteer';
import { Shift } from '../model/shift';
import { Globals } from '../app.globals';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-volunteer-add-shifts',
  templateUrl: './volunteer-add-shifts.component.html',
  styleUrls: ['./volunteer-add-shifts.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation()],
})
export class VolunteerAddShiftsComponent implements OnInit {
  public random: Number | undefined;
  agreeToTerms: FormControl = new FormControl(false);
  pickedArr: Date[] = [];
  minDate: Date | undefined;
  maxDate: Date | undefined;
  isLoading: boolean = true;
  volunteer: Volunteer | undefined;
  myShifts: Shift[] = [];
  email: any;

  dateFilter = (date: any) => {
    if (date==null || this.pickedArr.length == 8) {
      return false;
    }

    if (this.myShifts?.length > 0) {
      return this.pickedArr.findIndex(p => p?.getTime() == date?.toDate()?.getTime())==-1 && this.myShifts.findIndex(s => s?.date?.getTime() == date?.toDate()?.getTime())==-1
    }

    return this.pickedArr.findIndex(p => p?.getTime() == date?.toDate()?.getTime())==-1;
  };

  constructor(
    public router: Router,
    public db: DatabaseService,
    public afAuth: AngularFireAuth,
    private alertService: AlertService,
    public globals: Globals
  ) {
    this.random = this.globals.random(1, 9);
    this.minDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    this.maxDate = new Date(new Date().getFullYear(), new Date().getMonth() + 2, new Date().getDate());

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
    this.db.getVolunteers().subscribe(
      (resultArray: any) => {
        let volunteers: Volunteer[] = resultArray.docs.map(function (doc: any) {
          const data = doc.data();
          const id = doc.id;
          let volunteer = Object.assign(new Volunteer(), { ...data });
          volunteer.id = id;
          return volunteer;
        });

        this.volunteer = volunteers.find((a: Volunteer) => a.email == this.email);
        if (this.volunteer) {
          this.db.getVolunteerShifts(this.volunteer.id).subscribe((resultArray: any) => {
            this.myShifts = resultArray.docs.map(function (doc: any) {
              const data = doc.data();
              const id = doc.id;
              return Object.assign(new Shift(), {
                id: id,
                volunteer: volunteers.find(v=>v.id==data?.volunteer),
                date: new Date(data?.date?.toDate()?.setHours(0, 0, 0, 0)),
                approved: data?.approved
              });
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
        this.isLoading = false;
        this.alertService.httpError(error);
      }
    );
  }

  get sortData() {
    return this.pickedArr.sort((a, b) => {
      return <any>new Date(a) - <any>new Date(b);
    });
  }

  valueChanged(value: any) {
    this.pickedArr.push(new Date(value?.toDate()?.setHours(0, 0, 0, 0)));
  }

  deleteDate(date: Date) {
    this.pickedArr = this.pickedArr.filter(p=>p?.getTime() != date?.getTime());
  }

  submit() {
    for (let i = 0; i < this.pickedArr.length; i++) {
      this.db.putVolunteerShift(this.volunteer?.id, this.pickedArr[i]);
    }

    this.alertService.ok(`תודה רבה!`, `עדכנו את התאריכים במערכת בהצלחה`);
  }

  ngOnInit(): void {
  }
}
