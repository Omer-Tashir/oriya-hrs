import { Component, OnInit } from '@angular/core';
import { animate, animateChild, query, stagger, style, transition, trigger } from '@angular/animations';
import { AngularFireAuth } from '@angular/fire/auth';
import { forkJoin, Observable } from 'rxjs';

import {
  fadeInRightOnEnterAnimation,
  jackInTheBoxOnEnterAnimation,
  fadeInOnEnterAnimation,
  fadeOutOnLeaveAnimation
} from 'angular-animations';

import { StorageService } from '../core/storage.service';
@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css'],
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
export class ArticlesComponent implements OnInit {
  randomImage: number = Math.floor(Math.random() * 10) + 1;
  articles$!: Observable<any>;
  auth$!: Observable<any>;
  isAdmin: boolean = false;

  constructor(
    private storageService: StorageService,
    public afAuth: AngularFireAuth
  ) {
    this.isAdmin = !!sessionStorage.getItem('admin');
   }

   reload(){
     window.location.reload();
   }

  getFileType(name: string) {
    return name.split('.').pop(); 
  }

  download(url: any) {
    window.open(url, '_blank');
  }

  delete(name: any) {
    this.storageService.deleteFile('articles', name);
    window.location.reload();
  }

  ngOnInit(): void {
    this.auth$ = this.afAuth.authState;
    this.storageService.getFiles('articles').subscribe((articles: any) => {
      this.articles$ = forkJoin([...articles]);
    });
  }
}