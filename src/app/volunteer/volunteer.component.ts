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
import { LookupData } from '../model/lookup-data';
import { Volunteer } from '../model/volunteer';
import { Globals } from '../app.globals';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-volunteer',
  templateUrl: './volunteer.component.html',
  styleUrls: ['./volunteer.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation()],
})
export class VolunteerComponent implements OnInit {
  form: FormGroup = new FormGroup({});
  interests: string[] = [];
  preferences: string[] = [];
  isLoading: boolean = true;
  random: Number | undefined;
  welcomeText: string = `load`;
  volunteer!: Volunteer;
  email: any;

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
    this.initForm();

    // Look for logged in user first
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

    if (sessionStorage.getItem('lookupData') != null) {
      let temp = sessionStorage.getItem('lookupData');
      if (temp != null) {
        let lookupData = Object.assign(new LookupData(), JSON.parse(temp));
        this.interests = lookupData?.interests;
        this.preferences = lookupData?.groups;
      }
    } else {
      this.db.getLookupData().subscribe(
        (resultArray) => {
          let lookupData = Object.assign(
            new LookupData(),
            resultArray?.docs[0]?.data()
          );

          this.interests = lookupData?.interests;
          this.preferences = lookupData?.groups;
        },
        (error) => {
          console.log(error);
          this.alertService.httpError(error);
        }
      );
    }
  }

  hasError = (controlName: string, errorName: string) => {
    return this.form?.controls[controlName].hasError(errorName);
  };

  submit = (formValue: any) => {
    if (this.form?.valid) {
      this.isLoading = true;
      this.executeVolunteerCreation(formValue);
    }
  };

  executeVolunteerCreation = (formValue: any) => {
    let volunteer: Volunteer = Object.assign(new Volunteer(), formValue);
    this.db
      .putVolunteer(volunteer)
      .then(() => {
        if (!this.volunteer || this.volunteer == null) {
          this.alertService.ok(
            'תודה רבה',
            'קיבלנו את פרטיך ואנו ניצור עמך קשר בהקדם'
          );
        }
        else {
          this.alertService.ok(
            'תודה רבה',
            'פרטייך עודכנו בהצלחה'
          );
        }
      })
      .catch((error) => {
        console.log(error);
        this.alertService.httpError(error);
      })
      .finally(() => {
        this.isLoading = false;
        if (!this.volunteer || this.volunteer == null) {
          this.afAuth
          .createUserWithEmailAndPassword(volunteer.email, volunteer.password)
          .then(() => {
            this.signinWithFirebase(volunteer);
          })
          .catch((error) => {
            console.log(error);
            if (error?.code == `auth/email-already-in-use`) {
              this.signinWithFirebase(volunteer);
            } else {
              this.alertService.httpError(error);
            }
          });
        }
      });
  };

  private signinWithFirebase(volunteer: Volunteer) {
    this.afAuth
      .signInWithEmailAndPassword(volunteer.email, volunteer.password)
      .then((result) => {
        result.user
          ?.updateProfile({
            displayName: volunteer.fname + ' ' + volunteer.lname,
          })
          .then(() => {
            sessionStorage.setItem('user', JSON.stringify(result.user));
            sessionStorage.setItem('volunteer', 'true');

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

  private getVolunteer() {
    this.db.getVolunteers().subscribe(
      (resultArray: any) => {
        let volunteers = resultArray.docs.map(function (doc: any) {
          const data = doc.data();
          const id = doc.id;
          let volunteer = Object.assign(new Volunteer(), { ...data });
          volunteer.id = id;
          return volunteer;
        });

        this.volunteer = volunteers.find((a: Volunteer) => a.email == this.email);
        if (!this.volunteer || this.volunteer == null) {
          this.welcomeText = `ברוך הבא למאגר האנשים הטובים`;
        }
        else {
          this.welcomeText = `עדכון פרטים אישיים`;
          this.initForm(this.volunteer);
        }

        this.isLoading = false;
      },
      (error) => {
        console.log(error);
        this.isLoading = false;
        this.alertService.httpError(error);
      }
    );
  }

  private initForm(volunteer?: Volunteer): void {
    this.form = new FormGroup({
      id: new FormControl(volunteer?volunteer.id:undefined, [Validators.nullValidator]),
      fname: new FormControl(volunteer?volunteer.fname:'', [Validators.required]),
      lname: new FormControl(volunteer?volunteer.lname:'', [Validators.required]),
      personal_id: new FormControl(volunteer?volunteer.personal_id:'', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9),
      ]),
      email: new FormControl(volunteer?volunteer.email:'', [Validators.email, Validators.required]),
      phone: new FormControl(volunteer?volunteer.phone:'', [Validators.required]),
      date_of_birth: new FormControl(volunteer?volunteer.date_of_birth:'', [Validators.nullValidator]),
      city: new FormControl(volunteer?volunteer.city:'', [Validators.required]),
      address: new FormControl(volunteer?volunteer.address:'', [Validators.required]),
      address_number: new FormControl(volunteer?volunteer.address_number:'', [Validators.required]),
      password: new FormControl(volunteer?volunteer.password:'', [
        Validators.required,
        Validators.minLength(6),
      ]),
      password_confirm: new FormControl(volunteer?volunteer.password:'', [
        Validators.required,
        Validators.minLength(6),
      ]),
      interests: new FormControl(volunteer?volunteer.interests:[], [Validators.required]),
      preferences: new FormControl(volunteer?volunteer.preferences:[], [Validators.nullValidator]),
      is_mobility: new FormControl(volunteer?volunteer.is_mobility:false, [Validators.nullValidator]),
      is_kosher: new FormControl(volunteer?volunteer.is_kosher:false, [Validators.nullValidator]),
      is_one_time_volunteering: new FormControl(volunteer?volunteer.is_one_time_volunteering:false, [
        Validators.nullValidator,
      ]),
      is_parve: new FormControl(volunteer?volunteer.is_parve:false, [Validators.nullValidator]),
      is_vegan: new FormControl(volunteer?volunteer.is_vegan:false, [Validators.nullValidator]),
      is_gluten_free: new FormControl(volunteer?volunteer.is_gluten_free:false, [Validators.nullValidator]),
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
