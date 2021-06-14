import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { Globals } from '../app.globals';

import { SessionStorageService } from './session-storage-service';
import { Candidate } from '../model/candidate';
import { Category } from '../model/category';
import { Company } from '../model/company';
import { Admin } from '../model/admin';
import { EmploymentType } from '../model/employment-type';
import { JobOffer } from '../model/job-offer';
import { CandidateStatus } from '../model/candidate-status';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(
    private SessionStorageService: SessionStorageService,
    private db: AngularFirestore, 
    private http: HttpClient, 
    public globals: Globals
  ) { }

  getAdmins(): Observable<Admin[]> {
    if(!this.SessionStorageService.getItem('admins')) {
      return this.db.collection(`admins`).get().pipe(
        map(admins => admins.docs.map(doc => {
          return <Admin>doc.data();
        })),
        tap(admins => this.SessionStorageService.setItem('admins', JSON.stringify(admins))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.SessionStorageService.getItem('admins'))).pipe(
        shareReplay()
      );
    }
  }

  getCategories(): Observable<Category[]> {
    if(!this.SessionStorageService.getItem('categories')) {
      return this.db.collection(`categories`).get().pipe(
        map(categories => categories.docs.map(doc => {
          return <Category>doc.data();
        })),
        tap(categories => this.SessionStorageService.setItem('categories', JSON.stringify(categories))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.SessionStorageService.getItem('categories'))).pipe(
        shareReplay()
      );
    }
  }

  getEmploymentTypes(): Observable<EmploymentType[]> {
    if(!this.SessionStorageService.getItem('employment-types')) {
      return this.db.collection(`employment-types`).get().pipe(
        map(employmentTypes => employmentTypes.docs.map(doc => {
          return <EmploymentType>doc.data();
        })),
        tap(employmentTypes => this.SessionStorageService.setItem('employment-types', JSON.stringify(employmentTypes))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.SessionStorageService.getItem('employment-types'))).pipe(
        shareReplay()
      );
    }
  }

  getCompanies(): Observable<Company[]> {
    if(!this.SessionStorageService.getItem('companies')) {
      return this.db.collection(`companies`).get().pipe(
        map(companies => companies.docs.map(doc => {
          let company: Company = <Company>doc.data();
          company.uid = doc.id;
          return company;
        })),
        tap(companies => this.SessionStorageService.setItem('companies', JSON.stringify(companies))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.SessionStorageService.getItem('companies'))).pipe(
        shareReplay()
      );
    }
  }

  getJobOffers(): Observable<JobOffer[]> {
    if(!this.SessionStorageService.getItem('job-offers')) {
      return this.db.collection(`job-offers`).get().pipe(
        map(jobOffers => jobOffers.docs.map(doc => {
          return <JobOffer>doc.data();
        })),
        tap(jobOffers => this.SessionStorageService.setItem('job-offers', JSON.stringify(jobOffers))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.SessionStorageService.getItem('job-offers'))).pipe(
        shareReplay()
      );
    }
  }

  getCandidates(): Observable<Candidate[]> {
    if(!this.SessionStorageService.getItem('candidates')) {
      return this.db.collection(`candidates`).get().pipe(
        map(candidates => candidates.docs.map(doc => {
          let candidate: Candidate = <Candidate>doc.data();
          candidate.uid = doc.id;
          return candidate;
        })),
        tap(candidates => this.SessionStorageService.setItem('candidates', JSON.stringify(candidates))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.SessionStorageService.getItem('candidates'))).pipe(
        shareReplay()
      );
    }
  }

  getCandidateStatuses(): Observable<CandidateStatus[]> {
    if(!this.SessionStorageService.getItem('candidate-statuses')) {
      return this.db.collection(`candidate-statuses`).get().pipe(
        map(candidateStatuses => candidateStatuses.docs.map(doc => {
          return <CandidateStatus>doc.data();
        })),
        tap(candidateStatuses => this.SessionStorageService.setItem('candidate-statuses', JSON.stringify(candidateStatuses))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.SessionStorageService.getItem('candidate-statuses'))).pipe(
        shareReplay()
      );
    }
  }

  putCandidateStatus(candidate: Candidate, status: string): Observable<void> {
    candidate.status = status;
    return from(this.db.collection(`candidates`).doc(candidate.uid).set(candidate).then(() => {
      this.SessionStorageService.removeItem('candidates');
    }));
  }

  putCompanyDomain(company: Company, domain: string): Observable<void> {
    company.domain = domain;
    return from(this.db.collection(`companies`).doc(company.uid).set(company).then(() => {
      this.SessionStorageService.removeItem('companies');
    }));
  }

  putCompanyEmail(company: Company, email: string): Observable<void> {
    company.email = email;
    return from(this.db.collection(`companies`).doc(company.uid).set(company).then(() => {
      this.SessionStorageService.removeItem('companies');
    }));
  }

  putCompany(company: Company): Observable<void> {
    return from(this.db.collection(`companies`).doc(this.db.createId()).set(company).then(() => {
      this.SessionStorageService.removeItem('companies');
    }));
  }

  putCandidate(candidate: Candidate): Observable<void> {
    return from(this.db.collection(`candidates`).doc(this.db.createId()).set(candidate).then(() => {
      this.SessionStorageService.removeItem('candidates');
    }));
  }

  putJobOffer(offer: JobOffer): Observable<void> {
    return from(this.db.collection(`job-offers`).doc(this.db.createId()).set(offer).then(() => {
      this.SessionStorageService.removeItem('job-offers');
    }));
  }

  getCitiesJSON(): Observable<any> {
    let response = this.http.get("./assets/israel-cities.json");
    return response
  }

  getStreetsJSON(): Observable<any> {
    let response = this.http.get("./assets/israel-streets.json");
    return response
  }

  getInstance() {
    return this.db;
  }
}
