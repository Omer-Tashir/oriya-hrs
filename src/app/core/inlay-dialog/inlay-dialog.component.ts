import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Globals } from '../../app.globals';

import * as moment from 'moment/moment';

@Component({
  selector: 'app-inlay-dialog',
  templateUrl: './inlay-dialog.component.html',
})
export class InlayDialogComponent {
  public form: FormGroup = new FormGroup({});

  constructor(
    private globals: Globals,
    private dialogRef: MatDialogRef<InlayDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = new FormGroup({
      date: new FormControl(moment(this.data?.inlay?.date).format("yyyy-MM-DD"), [Validators.required]),
      volunteer: new FormControl(this.data?.inlay?.volunteer?.id, [Validators.required]),
      needy: new FormControl(this.data?.inlay?.needy?.id, [Validators.required]),
    });
  }

  hasError = (controlName: string, errorName: string) => {
    return this.form?.controls[controlName].hasError(errorName);
  };

  cancel(): void {
    this.dialogRef.close();
  }
}
