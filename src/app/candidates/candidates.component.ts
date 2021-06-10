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
import { Candidate } from '../model/candidate';

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
    fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class CandidatesComponent implements OnInit {
  randomImage: number = Math.floor(Math.random() * 6) + 1;

  auth$!: Observable<any>;
  candidates$!: Observable<Candidate[]>;

  constructor(
    public afAuth: AngularFireAuth, 
    private db: DatabaseService
  ) { }

  ngOnInit(): void {
    this.candidates$ = this.db.getCandidates();
    this.auth$ = this.afAuth.authState;
  }
}