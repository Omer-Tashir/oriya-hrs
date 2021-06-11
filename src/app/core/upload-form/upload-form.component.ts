import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AngularFireUploadTask } from '@angular/fire/storage';
import { finalize } from 'rxjs/operators';
import { FileUpload } from 'src/app/model/file-upload';
import { StorageService } from '../storage.service';

@Component({
  selector: 'app-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.css']
})
export class UploadFormComponent implements OnInit {
  @Input() path!: string;
  @Input() title!: string;
  @Output() uploadFileEmitter = new EventEmitter<FileUpload>();

  selectedFiles!: any;
  currentFileUpload!: any;
  percentage!: any;

  constructor(private uploadService: StorageService) { }

  ngOnInit(): void {
  }

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }

  upload(): void {
    const file = this.selectedFiles.item(0);
    this.selectedFiles = undefined;

    this.currentFileUpload = new FileUpload(file);
    this.uploadService.pushFileToStorage(this.path, this.currentFileUpload).subscribe(
      (res) => {
        res.uploadTask.percentageChanges().subscribe((percentage: any) => {
          this.percentage = Math.round(percentage);
        });
        res.uploadTask.snapshotChanges().pipe(
          finalize(() => {
            res.ref.getDownloadURL().subscribe((downloadURL: any) => {
              this.uploadFileEmitter.emit(downloadURL);
            });
          })
        ).subscribe();
      },
      (error: any) => {
        console.log(error);
      }
    );
  }
}