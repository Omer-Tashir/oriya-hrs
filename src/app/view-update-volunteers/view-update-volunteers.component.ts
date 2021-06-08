import {
  Component,
  AfterViewInit,
  ViewChild,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import {
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation,
} from 'angular-animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl, Validators } from '@angular/forms';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { Inlay } from '../model/inlay';
import { Needy } from '../model/needy';
import { Volunteer } from '../model/volunteer';
import { Score } from '../model/score';
import { Shift } from '../model/shift';

import { ShowUserDialogComponent } from '../core/show-user-dialog/show-user-dialog.component';
import { WarningDialogComponent } from '../core/warning-dialog/warning-dialog.component';
import { InlayDialogComponent } from '../core/inlay-dialog/inlay-dialog.component';
import { AlgorithemService } from '../core/algorithem.service';
import { AlertService } from '../core/alerts/alert.service';
import { DatabaseService } from '../core/database.service';

import { Globals } from '../app.globals';
import { forkJoin, BehaviorSubject } from 'rxjs';

import * as moment from "moment/moment";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-view-update-volunteers',
  templateUrl: './view-update-volunteers.component.html',
  styleUrls: ['./view-update-volunteers.component.css'],
  animations: [fadeInOnEnterAnimation(), fadeOutOnLeaveAnimation()],
})
export class ViewUpdateVolunteersComponent implements AfterViewInit, OnDestroy {
  public isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public loadingSubscription: any;

  private paginatorExist!: MatPaginator;
  private paginatorNonExist!: MatPaginator;
  private sortExist!: MatSort;
  private sortNonExist!: MatSort;

  @ViewChild(MatPaginator, { static: false }) set matPaginatorExist(
    mp: MatPaginator
  ) {
    this.paginatorExist = mp;
    if (this.paginatorExist != undefined) {
      this.paginatorExist._intl.itemsPerPageLabel = 'כמות התוצאות להצגה בעמוד:';
      this.paginatorExist._intl.firstPageLabel = 'חזרה לעמוד הראשון';
      this.paginatorExist._intl.lastPageLabel = 'מעבר לעמוד האחרון';
      this.paginatorExist._intl.nextPageLabel = 'עבור לעמוד הבא';
      this.paginatorExist._intl.previousPageLabel = 'חזור לעמוד הקודם';
      this.paginatorExist._intl.getRangeLabel = (
        page: number,
        pageSize: number,
        length: number
      ) => {
        if (length === 0 || pageSize === 0) {
          return `0 / ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex =
          startIndex < length
            ? Math.min(startIndex + pageSize, length)
            : startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} / מתוך ${length}`;
      };
    }
  }

  @ViewChild(MatPaginator, { static: false }) set matPaginatorNonExist(
    mp: MatPaginator
  ) {
    this.paginatorNonExist = mp;
    if (this.paginatorNonExist != undefined) {
      this.paginatorNonExist._intl.itemsPerPageLabel =
        'כמות התוצאות להצגה בעמוד:';
      this.paginatorNonExist._intl.firstPageLabel = 'חזרה לעמוד הראשון';
      this.paginatorNonExist._intl.lastPageLabel = 'מעבר לעמוד האחרון';
      this.paginatorNonExist._intl.nextPageLabel = 'עבור לעמוד הבא';
      this.paginatorNonExist._intl.previousPageLabel = 'חזור לעמוד הקודם';
      this.paginatorNonExist._intl.getRangeLabel = (
        page: number,
        pageSize: number,
        length: number
      ) => {
        if (length === 0 || pageSize === 0) {
          return `0 / ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex =
          startIndex < length
            ? Math.min(startIndex + pageSize, length)
            : startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} / מתוך ${length}`;
      };
    }
  }

  @ViewChild(MatSort, { static: false }) set matSortExist(ms: MatSort) {
    this.sortExist = ms;
  }

  @ViewChild(MatSort, { static: false }) set matSortNonExist(ms: MatSort) {
    this.sortNonExist = ms;
  }

  existDisplayedColumns: string[] = [
    'date',
    'volunteer',
    'needy',
    'location',
    'actions',
  ];
  nonExistDisplayedColumns: string[] = ['name', 'location'];
  recommendationsDisplayedColumns: string[] = ['volunteer', 'needy', 'score'];

  exist_from_date = new FormControl(undefined, [Validators.nullValidator]);
  exist_to_date = new FormControl(undefined, [Validators.nullValidator]);
  non_exist_from_date = new FormControl(undefined, [Validators.nullValidator]);
  non_exist_to_date = new FormControl(undefined, [Validators.nullValidator]);
  volunteers: Volunteer[] = [];
  needys: Needy[] = [];
  shifts: Shift[] = [];
  random: Number | undefined;
  loading: boolean = true;

  originalInlays: Inlay[] = [];
  originalNeedys: Needy[] = [];

  inlaysTable: MatTableDataSource<Inlay> = new MatTableDataSource<Inlay>([]);
  needysTable: MatTableDataSource<Needy> = new MatTableDataSource<Needy>([]);
  recommendationsTable: MatTableDataSource<Score> = new MatTableDataSource<Score>([]);

  constructor(
    public router: Router,
    public db: DatabaseService,
    public algorithemService: AlgorithemService,
    public afAuth: AngularFireAuth,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    public globals: Globals
  ) {
    this.random = this.globals.random(1, 9);
  }

  sortExistData(sort: Sort) {
    const data = this.inlaysTable.data.slice();
    if (!sort.active || sort.direction === '') {
      this.inlaysTable.data = data;
      return;
    }

    this.inlaysTable.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'date':
          return this.globals.compare(a.date, b.date, isAsc);
        case 'volunteer':
          return this.globals.compare(
            a?.volunteer?.fname + ' ' + a?.volunteer?.lname,
            b?.volunteer?.fname + ' ' + b?.volunteer?.lname,
            isAsc
          );
        case 'needy':
          return this.globals.compare(
            a?.needy?.fname + ' ' + a?.needy?.lname,
            b?.needy?.fname + ' ' + b?.needy?.lname,
            isAsc
          );
        case 'location':
          return this.globals.compare(
            a?.needy?.address +
              ' ' +
              a?.needy?.address_number +
              ', ' +
              a?.needy?.city,
            b?.needy?.address +
              ' ' +
              b?.needy?.address_number +
              ', ' +
              b?.needy?.city,
            isAsc
          );
        default:
          return 0;
      }
    });
  }

  sortNonExistData(sort: Sort) {
    const data = this.needysTable.data.slice();
    if (!sort.active || sort.direction === '') {
      this.needysTable.data = data;
      return;
    }

    this.needysTable.data = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        // case 'date': return this.globals.compare(a.date, b.date, isAsc);
        case 'name':
          return this.globals.compare(
            a?.fname + ' ' + a?.lname,
            b?.fname + ' ' + b?.lname,
            isAsc
          );
        case 'location':
          return this.globals.compare(
            a?.address + ' ' + a?.address_number + ', ' + a?.city,
            b?.address + ' ' + b?.address_number + ', ' + b?.city,
            isAsc
          );
        default:
          return 0;
      }
    });
  }

  addInlay() {
    const dialogRef = this.dialog.open(InlayDialogComponent, {
      width: '600px',
      data: {
        title: `הוספת שיבוץ`,
        volunteers: this.volunteers,
        needys: this.needys,
        inlay: new Inlay,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined && result != null) {
        let record: Inlay = Object.assign(new Inlay, result);
        record.id = this.globals.randomAlphaNumeric(20);
        record.shift_id = null;
        record.date = moment(result.date, "yyyy-MM-DD").toDate(),
        record.volunteer = this.volunteers.find((v) => v.id == result.volunteer);
        record.needy = this.needys.find((n) => n.id == result.needy);

        this.db
          .putInlay(record)
          .then((result) => {
            this.alertService.ok(`הפעולה בוצעה בהצלחה`, `השיבוץ נוסף`);
            let newInlays = this.inlaysTable.data.slice();
            newInlays.push(Object.assign(new Inlay(), {
              id: record.id,
              date: record.date,
              shift_id: record.shift_id,
              volunteer: this.volunteers.find((v) => v.id == record.volunteer?.id),
              needy: this.needys.find((n) => n.id == record.needy?.id),
            }));

            this.inlaysTable = new MatTableDataSource<Inlay>(newInlays);
            this.inlaysTable.paginator = this.paginatorExist;
            this.inlaysTable.sort = this.sortExist;
            this.originalInlays = this.inlaysTable.data.slice();

            this.updateNeedys();
            this.sortExistData({ active: 'date', direction: 'asc' });
            this.cdr.detectChanges();
          })
          .catch((error) => {
            console.log(error);
            this.alertService.httpError(error);
          });
      }
    });
  }

  edit(inlay: Inlay) {
    const dialogRef = this.dialog.open(InlayDialogComponent, {
      width: '600px',
      data: {
        title: `עריכת שיבוץ`,
        volunteers: this.volunteers,
        needys: this.needys,
        inlay: inlay,
      },
    });

    let old = inlay;
    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined && result != null) {
        let record: Inlay = Object.assign(new Inlay, result);
        record.id = old.id;
        record.shift_id = old.shift_id;
        record.date = moment(result.date, "yyyy-MM-DD").toDate(),
        record.volunteer = this.volunteers.find((v) => v.id == result.volunteer);
        record.needy = this.needys.find((n) => n.id == result.needy);

        this.db
          .putInlay(record)
          .then((result) => {
            if (record.shift_id != null) {
              let shift = this.shifts.find(s => s.id == record.shift_id);
              if (shift) {
                shift.volunteer = record.volunteer;
                shift.needy = record.needy;
                shift.date = record.date;
                this.db.putShift(shift).then(() => {
                  this.afterEditLogic(record);
                }).catch(error => {
                  console.log(error);
                  this.alertService.httpError(error);
                });
              }
          }
          else {
            this.afterEditLogic(record);
            }
          })
          .catch((error) => {
            console.log(error);
            this.alertService.httpError(error);
          });
      }
    });
  }

  remove(inlay: Inlay) {
    const dialogRef = this.dialog.open(WarningDialogComponent, {
      width: '600px',
      data: {
        title: 'האם את\\ה בטוח\\ה?',
        message: `השיבוץ יבוטל לאלתר`,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result != undefined && result != null) {
        this.db
          .removeInlay(inlay)
          .then((result) => {
            if (inlay.shift_id != null) {
              this.db.removeShift(inlay.shift_id).then(() => {
                this.afterRemoveLogic(inlay);
              }).catch(error => {
                console.log(error);
                this.alertService.httpError(error);
              });
            }
            else {
              this.afterRemoveLogic(inlay);
            }
          })
          .catch((error) => {
            console.log(error);
            this.alertService.httpError(error);
          });
      }
    });
  }

  private afterRemoveLogic(inlay: Inlay) {
    this.alertService.ok(`הפעולה בוצעה בהצלחה`, `השיבוץ בוטל`);
    let newInlays = this.inlaysTable.data.slice();
    this.inlaysTable = new MatTableDataSource<Inlay>(newInlays.filter(i=>i.id != inlay.id));
    this.inlaysTable.paginator = this.paginatorExist;
    this.inlaysTable.sort = this.sortExist;
    this.originalInlays = this.inlaysTable.data.slice();

    this.updateNeedys();
    this.sortExistData({ active: 'date', direction: 'asc' });
    this.cdr.detectChanges();
  }

  private afterEditLogic(record: Inlay) {
    this.alertService.ok(`הפעולה בוצעה בהצלחה`, `השיבוץ עודכן`);
    let newInlays = this.inlaysTable.data.slice();
    let index = newInlays.findIndex(d => d.id == record.id);
    if (index != -1) {
      newInlays[index] =
        Object.assign(new Inlay(), {
        id: record.id,
        date: record.date,
        shift_id: record.shift_id,
        volunteer: this.volunteers.find((v) => v.id == record.volunteer?.id),
        needy: this.needys.find((n) => n.id == record.needy?.id),
        });
    }

    this.inlaysTable = new MatTableDataSource<Inlay>(newInlays);
    this.inlaysTable.paginator = this.paginatorExist;
    this.inlaysTable.sort = this.sortExist;
    this.originalInlays = this.inlaysTable.data.slice();

    this.updateNeedys();
    this.sortExistData({ active: 'date', direction: 'asc' });
    this.cdr.detectChanges();
  }

  showNeedy(needy: Needy) {
    this.dialog.open(ShowUserDialogComponent, {
      width: '700px',
      data: {
        title: 'נמען: ' + needy.fname + ' ' + needy.lname,
        user: needy
      },
    });
  }

  showVolunteer(volunteer: Volunteer) {
    this.dialog.open(ShowUserDialogComponent, {
      width: '700px',
      data: {
        title: 'מתנדב: ' + volunteer.fname + ' ' + volunteer.lname,
        user: volunteer
      },
    });
  }

  updateNeedys() {
    let needysArr = [];
    if (this.inlaysTable?.data?.length > 0) {
      needysArr = this.needys.filter(n => this.inlaysTable.data.findIndex(t => t?.needy?.id == n.id) == -1);
    }
    else {
      needysArr = this.needys;
    }

    this.needysTable = new MatTableDataSource<Needy>(needysArr);
    this.needysTable.paginator = this.paginatorNonExist;
    this.needysTable.sort = this.sortNonExist;
    this.originalNeedys = this.needys.slice();
    this.cdr.detectChanges();

    this.sortNonExistData({ active: 'name', direction: 'asc' });
    this.cdr.detectChanges();
  }

  isInlayInDateRange(needy: Needy, from?: Date, to?: Date) {
    let inlays;
    if (needy) {
      if (from && to) {
        inlays = this.inlaysTable.data.slice().filter(i => new Date(new Date(i.date).setHours(0, 0, 0, 0)) >= from && new Date(new Date(i.date).setHours(0, 0, 0, 0)) <= to);
      }
      else if (from && !to) {
        inlays = this.inlaysTable.data.slice().filter(i => new Date(new Date(i.date).setHours(0, 0, 0, 0)) >= from);
      }
      else if (!from && to) {
        inlays = this.inlaysTable.data.slice().filter(i => new Date(new Date(i.date).setHours(0, 0, 0, 0)) <= to);
      }

      return inlays?.findIndex(i => i.needy?.id == needy?.id) != -1;
    }

    return false;
  }

  runAlgorithem() {
    let volunteers = this.shifts.filter(s => s.approved != true).map(function (s:Shift) {
      return s.volunteer;
    });
    let availableVolunteers: Set<any> = new Set<any>(volunteers);

    // get for each needy the best match based on score
    let bestMatches: Shift[] = [];
    let needysWithoutMatch = this.needys.filter(n => !this.inlaysTable.data.map(function (i) { return i.needy?.id }).includes(n.id));

    for (let i = 0; i < needysWithoutMatch.length; i++) {
      let needyRecommendations = this.recommendationsTable.data.filter(r => r.needy?.id == needysWithoutMatch[i]?.id);
      needyRecommendations = needyRecommendations.filter(r => Array.from(availableVolunteers).findIndex(v=>v.id==r.volunteer.id) !== -1);
      if (needyRecommendations?.length <= 0) {
        continue;
      }
      else {
        let bestScore: number = needyRecommendations[0].finalScore;
        let bestMatch: Score = needyRecommendations[0];

        for (let j = 0; j < needyRecommendations.length; j++) {
          if (needyRecommendations[j].finalScore >= bestScore) {
            bestScore = needyRecommendations[j].finalScore;
            bestMatch = needyRecommendations[j];
          }
        }

        let needy = bestMatch.needy;
        let volunteer = bestMatch.volunteer;
        let volunteerShifts = this.shifts.filter(s => s.volunteer?.id == volunteer.id).sort((a, b) => {
          return <any>new Date(b.date) - <any>new Date(a.date);
        });

        while (volunteerShifts.length > 0) {
          let shift = volunteerShifts.pop();
          if (shift && (shift?.approved == false || shift?.needy == undefined)) {
            shift.approved = true;
            shift.needy = needy;
            shift.volunteer = volunteer;
            bestMatches.push(shift);
            break;
          }
        }
      }
    }

    for (let i = 0; i < bestMatches.length; i++) {
      let inlay = new Inlay();
      inlay.shift_id = bestMatches[i].id;
      inlay.date = bestMatches[i].date;
      inlay.needy = bestMatches[i].needy;
      inlay.volunteer = bestMatches[i].volunteer;

      this.inlaysTable.data.push(inlay);
      this.db.putShift(bestMatches[i]);
      this.db.putInlay(inlay);

      this.updateNeedys();
      this.sortExistData({ active: 'date', direction: 'asc' });
      this.cdr.detectChanges();
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    this.loadingSubscription = this.isLoading.subscribe(value => {
      if (value == false) {
        this.runAlgorithem();
      }
    });

    forkJoin([this.db.getVolunteers(), this.db.getNeedys(), this.db.getAllVolunteerShifts()]).subscribe(
      (data) => {
        let that = this;
        if (data) {
          this.volunteers = data[0].docs.map(function (doc: any) {
            const data = doc.data();
            const id = doc.id;
            let volunteer = Object.assign(new Volunteer(), { ...data });
            volunteer.id = id;
            return volunteer;
          });
          this.needys = data[1].docs.map(function (doc: any) {
            const data = doc.data();
            const id = doc.id;
            let needy = Object.assign(new Needy(), { ...data });
            needy.id = id;
            return needy;
          });
          this.shifts = data[2].docs.map(function (doc: any) {
            const data = doc.data();
            const id = doc.id;
            return Object.assign(new Shift(), {
              id: id,
              volunteer: that.volunteers.find(v=>v.id==data?.volunteer),
              date: new Date(data?.date?.toDate()?.setHours(0, 0, 0, 0)),
              approved: data?.approved
            });
          });

          // calc all recommendations
          let calcPromises: Promise<Score>[] = [];
          for (let i = 0; i < this.volunteers.length; i++) {
            for (let j = 0; j < this.needys.length; j++) {
              calcPromises.push(this.algorithemService.calculateScore(this.volunteers[i], this.needys[j]));
            }
          }

          Promise.all(calcPromises).then(scores => {
            that.recommendationsTable = new MatTableDataSource<Score>(scores);
            this.isLoading.next(false);

          }).catch(error => {
            console.log(error);
            this.isLoading.next(false);
            this.cdr.detectChanges();
            this.alertService.httpError(error);
          });
        }
      },
      (error) => {
        console.log(error);
        this.cdr.detectChanges();
        this.alertService.httpError(error);
      }
    );

    this.sortExist.sortChange.subscribe(
      () => (this.paginatorExist.pageIndex = 0)
    );
    this.sortNonExist.sortChange.subscribe(
      () => (this.paginatorNonExist.pageIndex = 0)
    );

    this.db.getInlays().subscribe(
      (resultArray) => {
        let tempArr: Inlay[] = [];
        for (let i = 0; i < resultArray.docs.length; i++) {
          let row = resultArray.docs[i].data();
          tempArr.push(
            Object.assign(new Inlay(), {
              id: resultArray.docs[i].id,
              shift_id: row?.shift_id,
              date: new Date(row?.date?.toDate()).setHours(0, 0, 0, 0),
              volunteer: this.volunteers.find((v) => v.id == row.volunteer),
              needy: this.needys.find((n) => n.id == row.needy),
            })
          );
        }

        this.inlaysTable = new MatTableDataSource<Inlay>(tempArr);
        this.inlaysTable.paginator = this.paginatorExist;
        this.inlaysTable.sort = this.sortExist;
        this.originalInlays = this.inlaysTable.data.slice();

        this.updateNeedys();
        this.sortExistData({ active: 'date', direction: 'asc' });
        this.cdr.detectChanges();
      },
      (error) => {
        console.log(error);
        this.alertService.httpError(error);
      }
    );

    this.exist_from_date.valueChanges.subscribe(date => {
      if (this.exist_to_date.value) {
        this.inlaysTable.data = this.originalInlays.filter(i=>new Date(new Date(i.date).setHours(0, 0, 0, 0))>=new Date(new Date(date).setHours(0, 0, 0, 0))&& new Date(new Date(i.date).setHours(0, 0, 0, 0))<=new Date(new Date(this.exist_to_date.value).setHours(0, 0, 0, 0)));
      }
      else {
        this.inlaysTable.data = this.originalInlays.filter(i=>new Date(new Date(i.date).setHours(0, 0, 0, 0))>=new Date(new Date(date).setHours(0, 0, 0, 0)));
      }
    });

    this.exist_to_date.valueChanges.subscribe(date => {
      if (this.exist_from_date.value) {
        this.inlaysTable.data = this.originalInlays.filter(i=>new Date(new Date(i.date).setHours(0, 0, 0, 0))<=new Date(new Date(date).setHours(0, 0, 0, 0)) && new Date(new Date(i.date).setHours(0, 0, 0, 0))>=new Date(new Date(this.exist_from_date.value).setHours(0, 0, 0, 0)));
      }
      else {
        this.inlaysTable.data = this.originalInlays.filter(i=>new Date(new Date(i.date).setHours(0, 0, 0, 0))<=new Date(new Date(date).setHours(0, 0, 0, 0)));
      }
    });

    this.non_exist_from_date.valueChanges.subscribe(date => {
      if (this.non_exist_to_date.value) {
        this.needysTable.data = this.originalNeedys.filter(n=>!this.isInlayInDateRange(n, new Date(new Date(date).setHours(0, 0, 0, 0)), new Date(new Date(this.non_exist_to_date.value).setHours(0, 0, 0, 0))));
      }
      else {
        this.needysTable.data = this.originalNeedys.filter(n=>!this.isInlayInDateRange(n, new Date(new Date(date).setHours(0, 0, 0, 0))));
      }
    });

    this.non_exist_to_date.valueChanges.subscribe(date => {
      if (this.non_exist_from_date.value) {
        this.needysTable.data = this.originalNeedys.filter(n=>!this.isInlayInDateRange(n, new Date(new Date(this.non_exist_from_date.value).setHours(0, 0, 0, 0)), new Date(new Date(date).setHours(0, 0, 0, 0))));
      }
      else {
        this.needysTable.data = this.originalNeedys.filter(n=>!this.isInlayInDateRange(n, undefined, new Date(new Date(date).setHours(0, 0, 0, 0))));
      }
    });
  }

  ngOnDestroy(): void {
    if (this.loadingSubscription != undefined) {
      this.loadingSubscription.unsubscribe();
      this.loadingSubscription = undefined;
    }
  }
}
