import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { from, Observable, of } from 'rxjs';

import { LocalStorageService } from './local-storage-service';
import { Category } from '../model/category';
import { Company } from '../model/company';
import { Globals } from '../app.globals';
import { Candidate } from '../model/candidate';

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

  getCandidates(): Observable<Candidate[]> {
    if(!this.localStorageService.getItem('candidates')) {
      return this.db.collection(`candidates`).get().pipe(
        map(candidates => candidates.docs.map(doc => {
          return <Candidate>doc.data();
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

  putCompany(company: Company): Observable<void> {
    return from(this.db.collection(`companies`).doc(this.db.createId()).set(company)).pipe(
      tap(() => this.localStorageService.removeItem('companies'))
    );
  }

  putCandidate(candidate: Candidate): Observable<void> {
    return from(this.db.collection(`candidates`).doc(this.db.createId()).set(candidate)).pipe(
      tap(() => this.localStorageService.removeItem('candidates'))
    );
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
