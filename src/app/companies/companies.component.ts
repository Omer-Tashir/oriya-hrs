import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';

import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';

import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';

import { DatabaseService } from '../core/database.service';
import { Company } from '../model/company';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
    fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class CompaniesComponent implements OnInit, AfterViewInit {
  randomImage: number = Math.floor(Math.random() * 6) + 1;
  displayedColumns: string[] = ['name', 'contactName', 'contactRole', 'contactPhone', 'phone', 'domain'];

  auth$!: Observable<any>;
  companies$!: Observable<Company[]>;

  dataSource!: MatTableDataSource<Company>;
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort!: MatSort;

  constructor(
    public afAuth: AngularFireAuth, 
    private db: DatabaseService
  ) { }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  sortData(sort: Sort) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a: Company, b: Company) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'name': return this.compare(a.name, b.name, isAsc);
        case 'contactName': return this.compare(a.contactName, b.contactName, isAsc);
        case 'contactPhone': return this.compare(a.contactPhone, b.contactPhone, isAsc);
        case 'contactRole': return this.compare(a.contactRole, b.contactRole, isAsc);
        case 'domain': return this.compare(a.domain, b.domain, isAsc);
        case 'phone': return this.compare(a.phone, b.phone, isAsc);
        default: return 0;
      }
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  track(index: any, company: Company) {
    return company.name;
  }

  ngOnInit(): void {
    this.companies$ = this.db.getCompanies();
    this.auth$ = this.afAuth.authState;
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.companies$.pipe(catchError(() => observableOf(null)));
        }),
        map(data => {
          // Flip flag to show that loading has finished.
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          this.resultsLength = data.length;
          return data;
        })
      ).subscribe(data => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.filterPredicate = (company: Company, filter: string) => {
          return JSON.stringify(company).indexOf(filter) != -1
        };
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.sortData({ active: 'name', direction: 'asc' });
      });
  }
}
