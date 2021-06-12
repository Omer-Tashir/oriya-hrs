import { Component, OnInit } from '@angular/core';
import { animate, animateChild, query, stagger, style, transition, trigger } from '@angular/animations';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';

@Component({
  selector: 'app-salary-survey',
  templateUrl: './salary-survey.component.html',
  styleUrls: ['./salary-survey.component.css'],
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
export class SalarySurveyComponent implements OnInit {
  randomImage: number = Math.floor(Math.random() * 6) + 1;
  articles$!: Observable<any>;
  auth$!: Observable<any>;
  isAdmin: boolean = false;

  constructor(
    public afAuth: AngularFireAuth
  ) {
    this.isAdmin = !!sessionStorage.getItem('admin');
   }

  ngOnInit(): void {
    this.auth$ = this.afAuth.authState;
  }
}