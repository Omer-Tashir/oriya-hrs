import { animate, animateChild, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';

import { forkJoin, Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { DatabaseService } from '../core/database.service';
import { OfferDialog } from '../home/home.component';
import { Company } from '../model/company';
import { EmploymentType } from '../model/employment-type';
import { JobOffer } from '../model/job-offer';

@Component({
  selector: 'app-company-job-offers',
  templateUrl: './company-job-offers.component.html',
  styleUrls: ['./company-job-offers.component.css'],
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
export class CompanyJobOffersComponent implements OnInit {
  randomImage: number = Math.floor(Math.random() * 10) + 1;

  companyName!: any;
  company!: Company | undefined;
  companyOffers$!: Observable<any>;
  employmentTypes: EmploymentType[] = [];
  auth$!: Observable<any>;

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    public afAuth: AngularFireAuth, 
    private db: DatabaseService
  ) {
    this.db.getEmploymentTypes().subscribe(types => {
      this.employmentTypes = types;
    });
   }

  ngOnInit(): void {
    this.auth$ = this.afAuth.authState;
    this.companyName = this.route.snapshot.paramMap.get('companyName');

    this.companyOffers$ = this.db.getCompanies().pipe(
      tap(companies => this.company = companies.find(c => c.name === this.companyName)),
      switchMap(() => this.db.getJobOffers()),
      map(offers => offers.filter((o: JobOffer)=>o.companyName === this.companyName))
    );
  }

  getEmploymentType(type: string) {
    return this.employmentTypes.find(t=>t.id===type);
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
