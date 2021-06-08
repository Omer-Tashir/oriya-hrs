import { Component, OnInit } from '@angular/core';
import {
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation,
} from 'angular-animations';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { AlertService } from '../core/alerts/alert.service';
import { DatabaseService } from '../core/database.service';
import { TeamMember } from '../model/team-member';
import { Globals } from '../app.globals';
import { LookupData } from '../model/lookup-data';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-join-us',
  templateUrl: './join-us.component.html',
  styleUrls: ['./join-us.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation()],
})
export class JoinUsComponent implements OnInit {
  public form: FormGroup = new FormGroup({});
  public interests: string[] = [];
  public preferences: string[] = [];
  public isLoading: boolean = false;
  public random: Number | undefined;

  selectedCity: any;
  selectedStreet: any;
  cities: any[] = [];
  allStreets: any[] = [];
  streets: any[] = [];
  filteredCities!: Observable<any[]>;
  filteredStreets!: Observable<any[]>;
  lishka: any;
  city: any;

  constructor(
    public router: Router,
    public db: DatabaseService,
    public afAuth: AngularFireAuth,
    private alertService: AlertService,
    public globals: Globals
  ) {
    this.random = this.globals.random(1, 9);
    this.form = new FormGroup({
      fname: new FormControl('', [Validators.required]),
      lname: new FormControl('', [Validators.required]),
      personal_id: new FormControl('', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9),
      ]),
      email: new FormControl('', [Validators.email, Validators.required]),
      phone: new FormControl('', [Validators.required]),
      date_of_birth: new FormControl('', [Validators.nullValidator]),
      city: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      address_number: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      password_confirm: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      str_date: new FormControl('', [Validators.required]),
      free_hours: new FormControl('', [Validators.required]),
    });

    this.db.getCitiesJSON().subscribe(data => {
      this.cities = data;
    });

    this.db.getStreetsJSON().subscribe(data => {
      this.allStreets = data;
    });

    this.filteredCities = this.form.controls['city'].valueChanges.pipe(startWith(''), map(value => this._filterCities(value)));
    this.filteredStreets = this.form.controls['address'].valueChanges.pipe(startWith(''), map(value => this._filterStreets(value)));

    this.form.controls['city'].valueChanges.subscribe(
      (selectedValue) => {
        if (selectedValue != undefined && selectedValue.length > 0) {
          this.city = this.cities.filter(city => city['name'].toLowerCase() == selectedValue)[0];
          if (this.city != undefined) {
            this.lishka = this.city['lishka'];
            this.streets = this.allStreets.filter(street => street['שם_ישוב'] == this.city['name']);
          }
          else {
            this.lishka = "-";
          }
        }
      }
    );
  }

  hasError = (controlName: string, errorName: string) => {
    return this.form?.controls[controlName].hasError(errorName);
  };

  submit = (formValue: any) => {
    if (this.form?.valid) {
      this.isLoading = true;
      this.executeTeamMemberCreation(formValue);
    }
  };

  executeTeamMemberCreation = (formValue: any) => {
    let teamMember: TeamMember = Object.assign(new TeamMember(), formValue);
    this.db
      .putTeamMember(teamMember)
      .then(() => {
        this.alertService.ok(
          'תודה רבה',
          'קיבלנו את פרטיך ואנו ניצור עמך קשר בהקדם'
        );
      })
      .catch((error) => {
        console.log(error);
        this.alertService.httpError(error);
      })
      .finally(() => {
        this.isLoading = false;
        this.afAuth
          .createUserWithEmailAndPassword(teamMember.email, teamMember.password)
          .then(() => {
            this.signinWithFirebase(teamMember);
          })
          .catch((error) => {
            console.log(error);
            if (error?.code == `auth/email-already-in-use`) {
              this.signinWithFirebase(teamMember);
            } else {
              this.alertService.httpError(error);
            }
          });
      });
  };

  signinWithFirebase(teamMember: TeamMember) {
    this.afAuth
      .signInWithEmailAndPassword(teamMember.email, teamMember.password)
      .then((result) => {
        result.user
          ?.updateProfile({
            displayName: teamMember.fname + ' ' + teamMember.lname,
          })
          .then(() => {
            sessionStorage.setItem('user', JSON.stringify(result.user));
            if (sessionStorage.getItem('lookupData') != null) {
              let temp = sessionStorage.getItem('lookupData');
              if (temp != null) {
                let lookupData = Object.assign(
                  new LookupData(),
                  JSON.parse(temp)
                );

                if (
                  lookupData?.admins?.find((a: any) => a == teamMember.email) !=
                  null
                ) {
                  sessionStorage.setItem('admin', 'true');
                }
              }

              this.router.navigate(['home']);
            } else {
              this.db.getLookupData().subscribe(
                (resultArray) => {
                  let lookupData = Object.assign(
                    new LookupData(),
                    resultArray?.docs[0]?.data()
                  );
                  if (
                    lookupData?.admins?.find(
                      (a: any) => a == result?.user?.email
                    ) != null
                  ) {
                    sessionStorage.setItem('admin', 'true');
                  }

                  sessionStorage.setItem(
                    'lookupData',
                    JSON.stringify(lookupData)
                  );
                  this.router.navigate(['home']);
                },
                (error) => {
                  console.log(error);
                  this.alertService.httpError(error);
                }
              );
            }
          })
          .catch((error) => {
            console.log(error);
            this.alertService.httpError(error);
          });
      })
      .catch((error) => {
        console.log(error);
        this.alertService.httpError(error);
      });
  }

  cityClick(event: any) {
    this.selectedCity = event.option.value;
  }

  checkCity() {
    if (this.selectedCity && this.selectedCity == this.form.controls['city'].value) {
      this.form.controls['city'].setErrors(null);
      this.form.controls['city'].setValue(this.selectedCity.trim());
    }
    else {
      this.form.controls['city'].setErrors({ 'incorrect': true });
    }
  }

  streetClick(event: any) {
    this.selectedStreet = event.option.value;
  }

  checkStreet() {
    if (this.selectedStreet && this.selectedStreet == this.form.controls['address'].value) {
      this.form.controls['address'].setErrors(null);
      this.form.controls['address'].setValue(this.selectedStreet.trim());
    }
    else {
      this.form.controls['address'].setErrors({ 'incorrect': true });
    }
  }

  private _filterCities(value: string): string[] {
    const filterValue = value;
    let response = this.cities.filter(city => city['name'].includes(filterValue));
    return response;
  }

  private _filterStreets(value: string): string[] {
    const filterValue = value;
    let response = this.streets.filter(street => street['שם_רחוב'].includes(filterValue));
    return response
  }

  ngOnInit(): void {}
}
