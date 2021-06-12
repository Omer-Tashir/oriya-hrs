import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';

import { DatabaseService } from '../core/database.service';
import { Candidate } from '../model/candidate';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { AlertService } from '../core/alerts/alert.service';

@Component({
  selector: 'app-company-new-job-offer',
  templateUrl: './company-new-job-offer.component.html',
  styleUrls: ['./company-new-job-offer.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
    fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class CompanyNewJobOfferComponent implements OnInit {
  randomImage: number = Math.floor(Math.random() * 6) + 1;
  form: FormGroup = new FormGroup({});
  auth$!: Observable<any>;

  selectedCity: any;
  cities: any[] = [];
  filteredCities!: Observable<any[]>;
  city: any;

  constructor(
    public afAuth: AngularFireAuth, 
    private db: DatabaseService,
    private alert: AlertService
  ) { }

  submit = (formValue: any) => {
    if (this.form?.valid) {
      this.db.putCandidate(Object.assign(formValue, new Candidate())).subscribe(() => {
        this.alert.ok('תודה רבה, קלטנו את קורות החיים שלכם בהצלחה', 'נציג מטעמנו יצור אתכם קשר בהמשך');
        this.form.reset();
      });
    }
  };

  hasError = (controlName: string, errorName: string) => {
    return this.form?.controls[controlName].hasError(errorName);
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

  private _filterCities(value: string): string[] {
    const filterValue = value;
    let response = this.cities.filter(city => city['name'].includes(filterValue));
    return response;
  }

  ngOnInit(): void {
    this.auth$ = this.afAuth.authState;

    this.form = new FormGroup({
      role: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
    });

    this.db.getCitiesJSON().subscribe(data => {
      this.cities = data;
    });

    this.filteredCities = this.form.controls['city'].valueChanges.pipe(startWith(''), map(value => this._filterCities(value)));
  }
}