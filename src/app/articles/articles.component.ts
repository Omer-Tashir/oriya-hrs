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

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
    fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class ArticlesComponent implements OnInit {
  randomImage: number = Math.floor(Math.random() * 6) + 1;

  auth$!: Observable<any>;

  constructor(
    public afAuth: AngularFireAuth, 
    private db: DatabaseService
  ) { }

  ngOnInit(): void {
    this.auth$ = this.afAuth.authState;
  }
}