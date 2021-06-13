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

import * as XLSX from 'xlsx';
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

  arrayBuffer!: any;
  file!: File;

  isCompany = false;
  isAdmin = false;
  auth$!: Observable<any>;
  categories$!: Observable<Category[]>;
  companies$!: Observable<Company[]>;
  jobOffers$!: Observable<JobOffer[]>;

  companies: Company[] = [];
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
    });
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
    this.companies$ = this.db.getCompanies();

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

  incomingfile(event: any) {
    this.file= event.target.files[0]; 
  }

  uploadCompaniesExcel() {
    let fileReader = new FileReader();
      fileReader.onload = (e) => {
          this.arrayBuffer = fileReader.result;
          var data = new Uint8Array(this.arrayBuffer);
          var arr = new Array();
          for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
          var bstr = arr.join("");
          var workbook = XLSX.read(bstr, {type:"binary"});
          var first_sheet_name = workbook.SheetNames[0];
          var worksheet = workbook.Sheets[first_sheet_name];
          console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));
          XLSX.utils.sheet_to_json(worksheet,{raw:true}).forEach((o:any) => {
            const company: Company = {
              name: o['__EMPTY'] ?? '',
              contactName: o['משאבי אנוש תוספת- כל הזכויות שמורות לועדים הוצאה לאור בע"מ'] ?? '',
              contactRole: o['__EMPTY_1'] ?? '',
              contactPhone: o['__EMPTY_3'] ?? '',
              phone: o['__EMPTY_2'] ?? '',
              domain: '',
            } as Company;

            this.db.putCompany(company);
            console.log(company);
          });
      }
      fileReader.readAsArrayBuffer(this.file);
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