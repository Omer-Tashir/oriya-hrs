import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';
import { Observable } from 'rxjs';

import { AlertService } from '../core/alerts/alert.service';
import { DatabaseService } from '../core/database.service';
import { Category } from '../model/category.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
  fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()],
})
export class HomeComponent implements OnInit {
  isLoading: boolean = true;
  categories$!: Observable<Category[]>;
  auth: any;

  constructor(public afAuth: AngularFireAuth, private db: DatabaseService) {
    this.categories$ = this.db.getCategories();
    this.afAuth.authState.subscribe(auth => {
      this.auth = auth;
      this.isLoading = false;
    });
  }

  ngOnInit(): void {}
}
