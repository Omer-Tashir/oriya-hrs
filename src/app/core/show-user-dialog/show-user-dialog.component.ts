import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-show-user-dialog',
  templateUrl: './show-user-dialog.component.html',
  styleUrls: ['./show-user-dialog.component.css'],
})
export class ShowUserDialogComponent {
  public form: FormGroup = new FormGroup({});

  constructor(
    private dialogRef: MatDialogRef<ShowUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = new FormGroup({
      rname: new FormControl({value: this.data?.user?.rname, disabled: true}),
      rphone: new FormControl({value: this.data?.user?.rphone, disabled: true}),
      fname: new FormControl({value: this.data?.user?.fname, disabled: true}),
      lname: new FormControl({value: this.data?.user?.lname, disabled: true}),
      personal_id: new FormControl({value: this.data?.user?.personal_id, disabled: true}),
      email: new FormControl({value: this.data?.user?.email, disabled: true}),
      phone: new FormControl({value: this.data?.user?.phone, disabled: true}),
      date_of_birth: new FormControl({value: this.data?.user?.date_of_birth, disabled: true}),
      city: new FormControl({value: this.data?.user?.city, disabled: true}),
      address: new FormControl({value: this.data?.user?.address, disabled: true}),
      address_number: new FormControl({value: this.data?.user?.address_number, disabled: true}),
      interests: new FormControl({value: this.data?.user?.interests, disabled: true}),
      preferences: new FormControl({ value: this.data?.user?.preferences, disabled: true }),
      groups: new FormControl({value: this.data?.user?.groups, disabled: true}),
      is_mobility: new FormControl({value: this.data?.user?.is_mobility, disabled: true}),
      is_kosher: new FormControl({value: this.data?.user?.is_kosher, disabled: true}),
      is_one_time_volunteering: new FormControl({value: this.data?.user?.is_one_time_volunteering, disabled: true}),
      is_parve: new FormControl({value: this.data?.user?.is_parve, disabled: true}),
      is_vegan: new FormControl({value: this.data?.user?.is_vegan, disabled: true}),
      is_gluten_free: new FormControl({value: this.data?.user?.is_gluten_free, disabled: true}),
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
