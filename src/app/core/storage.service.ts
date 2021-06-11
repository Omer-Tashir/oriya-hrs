import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFireStorage } from '@angular/fire/storage';

import { forkJoin, from, Observable, of } from 'rxjs';
import { finalize, flatMap, map, mergeAll, mergeMap } from 'rxjs/operators';
import { FileUpload } from '../model/file-upload';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage) { }

  pushFileToStorage(path: string, fileUpload: FileUpload): Observable<any> {
    const filePath = `${path}/${fileUpload.file.name}`;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);
    return of({ref: storageRef, uploadTask: uploadTask});
  }

  getFiles(path: string): any {
    return this.storage.ref(path).listAll().pipe(
      map(list => {
        return list.items.map(i => of({name: i.name, url: i.getDownloadURL()}));
      }));
  }

  deleteFile(path: string, name: string): void {
    this.deleteFileStorage(path, name);
  }

  private deleteFileStorage(path: string, name: string): void {
    const storageRef = this.storage.ref(path);
    storageRef.child(name).delete();
  }
}