import { Component, OnInit, Input } from '@angular/core';
import { FileUpload } from 'src/app/model/file-upload';
import { StorageService } from '../storage.service';


@Component({
  selector: 'app-upload-details',
  templateUrl: './upload-details.component.html',
  styleUrls: ['./upload-details.component.css']
})
export class UploadDetailsComponent implements OnInit {
  @Input() path!: string;
  @Input() fileUpload!: FileUpload;

  constructor(private uploadService: StorageService) { }

  ngOnInit(): void {
  }

  deleteFileUpload(fileUpload: any): void {
    this.uploadService.deleteFile(this.path, fileUpload);
  }
}