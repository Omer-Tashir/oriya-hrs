import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { merge, Observable, of } from 'rxjs';

import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';

import { DatabaseService } from '../core/database.service';
import { Candidate } from '../model/candidate';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { AlertService } from '../core/alerts/alert.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CandidateStatus } from '../model/candidate-status';

@Component({
  selector: 'app-candidates',
  templateUrl: './candidates.component.html',
  styleUrls: ['./candidates.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation(),
    fadeInRightOnEnterAnimation(), jackInTheBoxOnEnterAnimation()
  ]
})
export class CandidatesComponent implements OnInit, AfterViewInit {
  randomImage: number = Math.floor(Math.random() * 6) + 1;
  displayedColumns: string[] = ['firstName', 'lastName', 'email', 'phone', 'city', 'address', 'cvFileLink', 'approve', 'status'];
  form: FormGroup = new FormGroup({});
  isAdmin: boolean = false;

  auth$!: Observable<any>;
  candidates$!: Observable<Candidate[]>;
  statuses$!: Observable<CandidateStatus[]>;
  cvLoaded = false;

  dataSource!: MatTableDataSource<Candidate>;
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  sort: any;
  paginator: any;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
      this.paginator = mp;
  }

  selectedCity: any;
  selectedStreet: any;
  cities: any[] = [];
  allStreets: any[] = [];
  streets: any[] = [];
  filteredCities!: Observable<any[]>;
  filteredStreets!: Observable<any[]>;
  lishka: any;
  city: any;

  constructor(
    public afAuth: AngularFireAuth, 
    private db: DatabaseService,
    private alert: AlertService
  ) { 
    this.isAdmin = !!sessionStorage.getItem('admin');
  }

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

    this.dataSource.data = data.sort((a: Candidate, b: Candidate) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'firstName': return this.compare(a.firstName, b.firstName, isAsc);
        case 'lastName': return this.compare(a.lastName, b.lastName, isAsc);
        case 'email': return this.compare(a.email, b.email, isAsc);
        case 'phone': return this.compare(a.phone, b.phone, isAsc);
        case 'city': return this.compare(a.city, b.city, isAsc);
        case 'address': return this.compare(a.address, b.address, isAsc);
        case 'cvFileLink': return this.compare(a.cvFileLink, b.cvFileLink, isAsc);
        case 'approve': return this.compare(a.approve, b.approve, isAsc);
        case 'status': return this.compare(a.status, b.status, isAsc);
        default: return 0;
      }
    });
  }

  private compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  track(index: any, candidate: Candidate) {
    return candidate.email;
  }

  submit = (formValue: any) => {
    if (this.form?.valid) {
      this.db.putCandidate(Object.assign(formValue, new Candidate())).subscribe(() => {
        this.alert.ok('תודה רבה, קלטנו את קורות החיים שלכם בהצלחה', 'נציג מטעמנו יצור אתכם קשר בהמשך');
        this.form.reset();
      });
    }
  };

  hasError = (controlName: string, errorName: string) => {
    return this.form?.controls[controlName].hasError(errorName);
  };

  cityClick(event: any) {
    this.selectedCity = event.option.value;
  }

  checkCity() {
    if (this.selectedCity && this.selectedCity == this.form.controls['city'].value) {
      this.form.controls['city'].setErrors(null);
      this.form.controls['city'].setValue(this.selectedCity.trim());
    }
    else {
      this.form.controls['city'].setErrors({ 'incorrect': true });
    }
  }

  streetClick(event: any) {
    this.selectedStreet = event.option.value;
  }

  checkStreet() {
    if (this.selectedStreet && this.selectedStreet == this.form.controls['address'].value) {
      this.form.controls['address'].setErrors(null);
      this.form.controls['address'].setValue(this.selectedStreet.trim());
    }
    else {
      this.form.controls['address'].setErrors({ 'incorrect': true });
    }
  }

  private _filterCities(value: string): string[] {
    const filterValue = value;
    let response = this.cities.filter(city => city['name'].includes(filterValue));
    return response;
  }

  private _filterStreets(value: string): string[] {
    const filterValue = value;
    let response = this.streets.filter(street => street['שם_רחוב'].includes(filterValue));
    return response
  }

  uploadCvCompleted(url: any) {
    this.cvLoaded = true;
    this.form.controls['cvFileLink'].setValue(url || "");
  }

  ngOnInit(): void {
    this.candidates$ = this.db.getCandidates();
    this.statuses$ = this.db.getCandidateStatuses();
    this.auth$ = this.afAuth.authState;

    this.form = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.email, Validators.required]),
      phone: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      addressNumber: new FormControl('', [Validators.required]),
      cvFileLink: new FormControl('', [Validators.nullValidator]),
      approve: new FormControl(true, [Validators.nullValidator]),
      status: new FormControl('מועמד חדש', [Validators.nullValidator]),
    });

    this.db.getCitiesJSON().subscribe(data => {
      this.cities = data;
    });

    this.db.getStreetsJSON().subscribe(data => {
      this.allStreets = data;
    });

    this.filteredCities = this.form.controls['city'].valueChanges.pipe(startWith(''), map(value => this._filterCities(value)));
    this.filteredStreets = this.form.controls['address'].valueChanges.pipe(startWith(''), map(value => this._filterStreets(value)));

    this.form.controls['city'].valueChanges.subscribe(
      (selectedValue) => {
        if (selectedValue != undefined && selectedValue.length > 0) {
          this.city = this.cities.filter(city => city['name'].toLowerCase() == selectedValue)[0];
          if (this.city != undefined) {
            this.lishka = this.city['lishka'];
            this.streets = this.allStreets.filter(street => street['שם_ישוב'] == this.city['name']);
          }
          else {
            this.lishka = "-";
          }
        }
      }
    );
  }

  updateStatus(candidate: Candidate, status: string) {
    this.db.putCandidateStatus(candidate, status);
  }

  downloadCV(cvFileLink: any) {
    window.open(cvFileLink, '_blank');
  }

  ngAfterViewInit(): void {
    if(this.isAdmin) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

      merge(this.sort.sortChange, this.paginator.page)
        .pipe(
          startWith({}),
          switchMap(() => {
            this.isLoadingResults = true;
            return this.candidates$.pipe(catchError(() => of(null)));
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
          this.dataSource.filterPredicate = (candidate: Candidate, filter: string) => {
            return JSON.stringify(candidate).indexOf(filter) != -1
          };
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.sortData({ active: 'email', direction: 'asc' });

          console.log(this.dataSource.data);
        });
    }
  }
}