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
import { Needy } from '../model/needy';
import { Globals } from '../app.globals';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-refer-a-needy',
  templateUrl: './refer-a-needy.component.html',
  styleUrls: ['./refer-a-needy.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation()],
})
export class ReferANeedyComponent implements OnInit {
  public form: FormGroup = new FormGroup({});
  public interests: string[] = [];
  public groups: string[] = [];
  public isLoading: boolean = true;
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
      rname: new FormControl('', [Validators.required]),
      rphone: new FormControl('', [Validators.required]),
      fname: new FormControl('', [Validators.required]),
      lname: new FormControl('', [Validators.required]),
      personal_id: new FormControl('', [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(9),
      ]),
      email: new FormControl('', [Validators.email]),
      phone: new FormControl('', [Validators.required]),
      date_of_birth: new FormControl('', [Validators.nullValidator]),
      city: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      address_number: new FormControl('', [Validators.required]),
      interests: new FormControl([], [Validators.nullValidator]),
      groups: new FormControl([], [Validators.required]),
      is_kosher: new FormControl(false, [Validators.nullValidator]),
      is_parve: new FormControl(false, [Validators.nullValidator]),
      is_vegan: new FormControl(false, [Validators.nullValidator]),
      is_gluten_free: new FormControl(false, [Validators.nullValidator]),
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

    if (sessionStorage.getItem('lookupData') != null) {
      let temp = sessionStorage.getItem('lookupData');
      if (temp != null) {
        let lookupData = Object.assign(new LookupData(), JSON.parse(temp));
        this.interests = lookupData?.interests;
        this.groups = lookupData?.groups;
        this.isLoading = false;
      }
    } else {
      this.db.getLookupData().subscribe(
        (resultArray) => {
          let lookupData = Object.assign(
            new LookupData(),
            resultArray?.docs[0]?.data()
          );

          this.interests = lookupData?.interests;
          this.groups = lookupData?.groups;
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

  hasError = (controlName: string, errorName: string) => {
    return this.form?.controls[controlName].hasError(errorName);
  };

  submit = (formValue: any) => {
    if (this.form?.valid) {
      this.isLoading = true;
      this.executeNeedyCreation(formValue);
    }
  };

  executeNeedyCreation = (formValue: any) => {
    let needy: Needy = Object.assign(new Needy(), formValue);
    this.db
      .putNeedy(needy)
      .then(() => {
        this.alertService.ok(
          'תודה רבה',
          'קיבלנו את המלצתך ואנו ניצור עמך קשר בהקדם'
        );
      })
      .catch((error) => {
        console.log(error);
        this.alertService.httpError(error);
      })
      .finally(() => {
        this.isLoading = false;
      });
  };

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
