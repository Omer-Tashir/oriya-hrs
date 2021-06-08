import { Component, OnInit } from '@angular/core';
import { fadeInOnEnterAnimation, fadeOutOnLeaveAnimation } from 'angular-animations';

import { Globals } from './app.globals';
import { AlertService } from './core/alerts/alert.service';
import { Alerts } from './core/alerts/alerts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    fadeInOnEnterAnimation(),
    fadeOutOnLeaveAnimation()
  ]
})
export class AppComponent implements OnInit {

  constructor(
    private alertService: AlertService,
    public globals: Globals
  ) {
    Alerts.service = this.alertService;
  }

  ngOnInit(): void {
  }
}
