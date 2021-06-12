import { animate, animateChild, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { DatabaseService } from '../core/database.service';
import { Category } from '../model/category';
import { Company } from '../model/company';
import { EmploymentType } from '../model/employment-type';
import { JobOffer } from '../model/job-offer';
import { RegisteredCompany } from '../model/registered-company';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
  fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation(),
  trigger('item', [
    transition(':enter', [
      style({ transform: 'scale(0.1)', opacity: 0 }),
      animate('.5s .1s cubic-bezier(.8, -0.6, 0.2, 1.5)', 
        style({ transform: 'scale(1)', opacity: 1 }))
    ])
  ]),
  trigger('listAnimation', [
    transition(':enter', [
      query('@item', stagger(100, animateChild()), {optional: true})
    ])
  ])],
})
export class HomeComponent implements OnInit {
  randomImage1: number = Math.floor(Math.random() * 10) + 1;
  randomImage2: number = Math.floor(Math.random() * 10) + 1;

  isCompany = false;
  isAdmin = false;
  auth$!: Observable<any>;
  categories$!: Observable<Category[]>;
  companies$!: Observable<RegisteredCompany[]>;
  jobOffers$!: Observable<JobOffer[]>;

  companies: RegisteredCompany[] = [];
  employmentTypes: EmploymentType[] = [];

  constructor(
    public dialog: MatDialog,
    public afAuth: AngularFireAuth, 
    private db: DatabaseService
  ) { 
    this.isCompany = !!sessionStorage.getItem('company');
    this.isAdmin = !!sessionStorage.getItem('admin');
    this.db.getEmploymentTypes().subscribe(types => {
      this.employmentTypes = types;
    })
  }

  getCompanyImage(companyName: string) {
    const company = this.companies.find(c=>c.name===companyName);
    if(!!company) {
      return company.image;
    }

    return undefined;
  }

  getEmploymentType(type: string) {
    return this.employmentTypes.find(t=>t.id===type);
  }

  ngOnInit(): void {
    this.categories$ = this.db.getCategories();
    this.companies$ = this.db.getRegisteredCompanies();

    this.companies$.pipe(
      tap(companies => this.companies = companies)
    ).subscribe();

    this.jobOffers$ = this.db.getJobOffers().pipe(
      map(data => data.slice(0,8))
    );

    this.auth$ = this.afAuth.authState;
  }

  showMore(offer: JobOffer) {
    this.dialog.open(OfferDialog, {
      width: '75vw',
      data: {
        offer: offer,
        employmentType: this.getEmploymentType(offer.employmentType)
      }
    });
  }
}

@Component({
  selector: 'offer-dialog',
  templateUrl: './offer-dialog.html',
  styleUrls: ['./offer-dialog.css'],
})
export class OfferDialog {

  constructor(
    public dialogRef: MatDialogRef<OfferDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}