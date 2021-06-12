import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
    fadeInLeftOnEnterAnimation,
  } from 'angular-animations';

@Component({
    selector: 'app-company-join-us',
    templateUrl: './company-join-us.component.html',
    styleUrls: ['./company-join-us.component.css'],
    animations: [
        fadeInLeftOnEnterAnimation()
    ]
  })
  export class CompanyJoinUsComponent implements OnInit {
  
    constructor(
        private router: Router
    ) { }

    onClick() {
        if (!!sessionStorage.getItem('company') || !!sessionStorage.getItem('admin')) {
            this.router.navigate(['company-new-job-offer']);
        }
        else {
            this.router.navigate(['company-sign-up']);
        }
    }
  
    ngOnInit(): void {
    }
  }