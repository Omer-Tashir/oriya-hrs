import { animate, animateChild, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';
import { Observable } from 'rxjs';

import { DatabaseService } from '../core/database.service';
import { Category } from '../model/category';
import { Company } from '../model/company';

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
  randomImage1: number = Math.floor(Math.random() * 6) + 1;
  randomImage2: number = Math.floor(Math.random() * 6) + 1;

  isCompany = false;
  auth$!: Observable<any>;
  categories$!: Observable<Category[]>;
  companies$!: Observable<Company[]>;

  constructor(
    public afAuth: AngularFireAuth, 
    private db: DatabaseService
  ) { 
    this.isCompany = !!sessionStorage.getItem('company');
  }

  ngOnInit(): void {
    this.categories$ = this.db.getCategories();
    this.companies$ = this.db.getCompanies();
    this.auth$ = this.afAuth.authState;
  }
}
