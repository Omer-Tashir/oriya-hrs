import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { Globals } from '../app.globals';
import { Category } from '../model/category.interface';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  categories: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);

  constructor(private db: AngularFirestore, private http: HttpClient, public globals: Globals) {}

  getCategories(): Observable<Category[]> {
    if(this.categories.getValue().length === 0) {
      return this.db.collection(`categories`).get().pipe(
        map(categories => categories.docs.map(doc => {
          return <Category>doc.data();
        })),
        tap(categories => this.categories.next(categories)),
        catchError(err => of([])),
        shareReplay()
      );
    }
    else {
      return this.categories;
    }
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
