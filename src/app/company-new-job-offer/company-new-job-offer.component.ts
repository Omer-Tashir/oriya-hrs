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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { AlertService } from '../core/alerts/alert.service';
import { EmploymentType } from '../model/employment-type';
import { JobOffer } from '../model/job-offer';
import { Company } from '../model/company';

@Component({
  selector: 'app-company-new-job-offer',
  templateUrl: './company-new-job-offer.component.html',
  styleUrls: ['./company-new-job-offer.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
    fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class CompanyNewJobOfferComponent implements OnInit {
  randomImage: number = Math.floor(Math.random() * 10) + 1;
  form: FormGroup = new FormGroup({});
  auth$!: Observable<any>;
  company!: Company;

  imageUrl!: string;
  selectedCity: any;
  cities: any[] = [];
  filteredCities!: Observable<any[]>;
  city: any;

  employmentTypes$!: Observable<EmploymentType[]>;

  constructor(
    public afAuth: AngularFireAuth, 
    private db: DatabaseService,
    private alert: AlertService
  ) { }

  onSelectImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        this.form.controls['image'].setValue(event.target.result);
      }
    }
  }

  submit = (formValue: any) => {
    if (this.form?.valid) {
      this.db.putJobOffer(Object.assign(formValue, new JobOffer())).subscribe(() => {
        this.alert.ok('תודה רבה, קלטנו את המשרה בהצלחה', '');
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
    this.employmentTypes$ = this.db.getEmploymentTypes();

    this.form = new FormGroup({
      companyName: new FormControl('', [Validators.nullValidator]),
      role: new FormControl('', [Validators.required]),
      employmentType: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      image: new FormControl('', [Validators.nullValidator]),
    });

    const loadCompany = sessionStorage.getItem('company');
    if (!!loadCompany) {
      this.company = JSON.parse(loadCompany);
      this.form.controls['companyName'].setValue(this.company.name);
    }

    this.db.getCitiesJSON().subscribe(data => {
      this.cities = data;
    });

    this.filteredCities = this.form.controls['city'].valueChanges.pipe(startWith(''), map(value => this._filterCities(value)));
  }
}