import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';
import { Globals } from '../app.globals';

import { LocalStorageService } from './local-storage-service';
import { RegisteredCompany } from '../model/registered-company';
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
    private localStorageService: LocalStorageService,
    private db: AngularFirestore, 
    private http: HttpClient, 
    public globals: Globals
  ) { }

  getAdmins(): Observable<Admin[]> {
    if(!this.localStorageService.getItem('admins')) {
      return this.db.collection(`admins`).get().pipe(
        map(admins => admins.docs.map(doc => {
          return <Admin>doc.data();
        })),
        tap(admins => this.localStorageService.setItem('admins', JSON.stringify(admins))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.localStorageService.getItem('admins'))).pipe(
        shareReplay()
      );
    }
  }

  getCategories(): Observable<Category[]> {
    if(!this.localStorageService.getItem('categories')) {
      return this.db.collection(`categories`).get().pipe(
        map(categories => categories.docs.map(doc => {
          return <Category>doc.data();
        })),
        tap(categories => this.localStorageService.setItem('categories', JSON.stringify(categories))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.localStorageService.getItem('categories'))).pipe(
        shareReplay()
      );
    }
  }

  getEmploymentTypes(): Observable<EmploymentType[]> {
    if(!this.localStorageService.getItem('employment-types')) {
      return this.db.collection(`employment-types`).get().pipe(
        map(employmentTypes => employmentTypes.docs.map(doc => {
          return <EmploymentType>doc.data();
        })),
        tap(employmentTypes => this.localStorageService.setItem('employment-types', JSON.stringify(employmentTypes))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.localStorageService.getItem('employment-types'))).pipe(
        shareReplay()
      );
    }
  }

  getRegisteredCompanies(): Observable<RegisteredCompany[]> {
    if(!this.localStorageService.getItem('registered-companies')) {
      return this.db.collection(`registered-companies`).get().pipe(
        map(registeredCompanies => registeredCompanies.docs.map(doc => {
          return <RegisteredCompany>doc.data();
        })),
        tap(registeredCompanies => this.localStorageService.setItem('registered-companies', JSON.stringify(registeredCompanies))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.localStorageService.getItem('registered-companies'))).pipe(
        shareReplay()
      );
    }
  }

  getCompanies(): Observable<Company[]> {
    if(!this.localStorageService.getItem('companies')) {
      return this.db.collection(`companies`).get().pipe(
        map(companies => companies.docs.map(doc => {
          return <Company>doc.data();
        })),
        tap(companies => this.localStorageService.setItem('companies', JSON.stringify(companies))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.localStorageService.getItem('companies'))).pipe(
        shareReplay()
      );
    }
  }

  getJobOffers(): Observable<JobOffer[]> {
    if(!this.localStorageService.getItem('job-offers')) {
      return this.db.collection(`job-offers`).get().pipe(
        map(jobOffers => jobOffers.docs.map(doc => {
          return <JobOffer>doc.data();
        })),
        tap(jobOffers => this.localStorageService.setItem('job-offers', JSON.stringify(jobOffers))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.localStorageService.getItem('job-offers'))).pipe(
        shareReplay()
      );
    }
  }

  getCandidates(): Observable<Candidate[]> {
    if(!this.localStorageService.getItem('candidates')) {
      return this.db.collection(`candidates`).get().pipe(
        map(candidates => candidates.docs.map(doc => {
          let candidate: Candidate = <Candidate>doc.data();
          candidate.uid = doc.id;
          console.log(candidate);
          return candidate;
        })),
        tap(candidates => this.localStorageService.setItem('candidates', JSON.stringify(candidates))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.localStorageService.getItem('candidates'))).pipe(
        shareReplay()
      );
    }
  }

  getCandidateStatuses(): Observable<CandidateStatus[]> {
    if(!this.localStorageService.getItem('candidate-statuses')) {
      return this.db.collection(`candidate-statuses`).get().pipe(
        map(candidateStatuses => candidateStatuses.docs.map(doc => {
          return <CandidateStatus>doc.data();
        })),
        tap(candidateStatuses => this.localStorageService.setItem('candidate-statuses', JSON.stringify(candidateStatuses))),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return of(JSON.parse(this.localStorageService.getItem('candidate-statuses'))).pipe(
        shareReplay()
      );
    }
  }

  putRegisteredCompany(company: RegisteredCompany): Observable<void> {
    return from(this.db.collection(`registered-companies`).doc(this.db.createId()).set(company).then(() => {
      this.localStorageService.removeItem('registered-companies');
    }));
  }

  putCandidateStatus(candidate: Candidate, status: string): Observable<void> {
    candidate.status = status;
    return from(this.db.collection(`candidates`).doc(candidate.uid).set(candidate).then(() => {
      this.localStorageService.removeItem('candidates');
    }));
  }

  putCompany(company: Company): Observable<void> {
    return from(this.db.collection(`companies`).doc(this.db.createId()).set(company).then(() => {
      this.localStorageService.removeItem('companies');
    }));
  }

  putCandidate(candidate: Candidate): Observable<void> {
    return from(this.db.collection(`candidates`).doc(this.db.createId()).set(candidate).then(() => {
      this.localStorageService.removeItem('candidates');
    }));
  }

  putJobOffer(offer: JobOffer): Observable<void> {
    return from(this.db.collection(`job-offers`).doc(this.db.createId()).set(offer).then(() => {
      this.localStorageService.removeItem('job-offers');
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
