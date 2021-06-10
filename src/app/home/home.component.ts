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
import { tap } from 'rxjs/operators';

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

  auth$!: Observable<any>;
  categories$!: Observable<Category[]>;
  companies$!: Observable<Company[]>;

  arrayBuffer: any;
  file!: File;

  constructor(
    public afAuth: AngularFireAuth, 
    private db: DatabaseService
  ) { }

  ngOnInit(): void {
    this.categories$ = this.db.getCategories();
    this.companies$ = this.db.getCompanies();
    this.auth$ = this.afAuth.authState;
  }

  // incomingfile(event: any) {
  //   this.file= event.target.files[0]; 
  // }

  // Upload() {
  //     let fileReader = new FileReader();
  //       fileReader.onload = (e) => {
  //           this.arrayBuffer = fileReader.result;
  //           var data = new Uint8Array(this.arrayBuffer);
  //           var arr = new Array();
  //           for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
  //           var bstr = arr.join("");
  //           var workbook = XLSX.read(bstr, {type:"binary"});
  //           var first_sheet_name = workbook.SheetNames[0];
  //           var worksheet = workbook.Sheets[first_sheet_name];

  //           const xlsx = XLSX.utils.sheet_to_json(worksheet,{raw:true});
  //           xlsx.forEach((row: any) => {
  //             const record = {
  //               name: row['__EMPTY'] ?? '',
  //               contactName: row['משאבי אנוש - כל הזכויות שמורות לועדים הוצאה לאור בע"מ'] ?? '',
  //               contactRole: row['__EMPTY_1'] ?? '',
  //               contactPhone: row['__EMPTY_3'] ?? '',
  //               phone: row['__EMPTY_2'] ?? '',
  //               domain: row['__EMPTY_4'] ?? '',
  //             } as Company;
  //             //this.db.putCompany(record);
  //           });
  //           console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));
  //       }
  //       fileReader.readAsArrayBuffer(this.file);
  // }
}
