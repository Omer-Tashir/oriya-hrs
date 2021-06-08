import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { Needy } from '../model/needy';
import { Inlay } from '../model/inlay';
import { Volunteer } from '../model/volunteer';
import { TeamMember } from '../model/team-member';
import { Shift } from '../model/shift';
import { Globals } from '../app.globals';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(private db: AngularFirestore, private http: HttpClient, public globals: Globals) {}

  getLookupData(): Observable<any> {
    return this.db.collection(`lookup_data`).get();
  }

  getVolunteers(): Observable<any> {
    return this.db.collection(`volunteers`).get();
  }

  getNeedys(): Observable<any> {
    return this.db.collection(`needys`).get();
  }

  getInlays(): Observable<any> {
    return this.db.collection(`inlays`).get();
  }

  getTeamMemberRequests(): Observable<any> {
    return this.db.collection(`team-members`).get();
  }

  putVolunteer(volunteer: Volunteer): Promise<any> {
    return this.db
      .collection(`volunteers`)
      .doc(volunteer.id!=undefined? volunteer.id: this.globals.randomAlphaNumeric(20))
      .set({ ...volunteer });
  }

  putNeedy(needy: Needy): Promise<any> {
    return this.db
      .collection(`needys`)
      .doc(needy.id!=undefined? needy.id:this.globals.randomAlphaNumeric(20))
      .set({ ...needy });
  }

  putTeamMember(teamMember: TeamMember): Promise<any> {
    return this.db
      .collection(`team-members`)
      .doc(this.globals.randomAlphaNumeric(20))
      .set({ ...teamMember });
  }

  putVolunteerShift(id: number, date: Date): Promise<any> {
    return this.db
      .collection(`volunteer-shifts`)
      .doc(this.globals.randomAlphaNumeric(20))
      .set({ volunteer: id, date: date, approved: false });
  }

  getVolunteerShifts(id: number) {
    return this.db
      .collection(`volunteer-shifts`, ref => ref.where('volunteer', '==', id)).get();
  }

  getAllVolunteerShifts() {
    return this.db
      .collection(`volunteer-shifts`).get();
  }

  removeShift(id: any): Promise<any> {
    return this.db
      .collection(`volunteer-shifts`)
      .doc(id)
      .delete();
  }

  putShift(shift: Shift): Promise<any> {
    return this.db
      .collection(`volunteer-shifts`)
      .doc(shift.id != undefined ? shift.id : this.globals.randomAlphaNumeric(20))
      .set({
        volunteer: shift?.volunteer?.id,
        needy: shift?.needy?.id,
        date: shift?.date,
        approved: shift?.approved
      });
  }

  removeInlay(inlay: Inlay): Promise<any>{
    return this.db
      .collection(`inlays`)
      .doc(inlay.id)
      .delete();
  }

  putInlay(inlay: Inlay): Promise<any>{
    return this.db
      .collection(`inlays`)
      .doc(inlay.id != undefined ? inlay.id : this.globals.randomAlphaNumeric(20))
      .set({
        shift_id: inlay?.shift_id,
        date: inlay?.date,
        needy: inlay?.needy?.id,
        volunteer: inlay?.volunteer?.id
      });
  }

  getCitiesJSON(): Observable<any> {
    let response = this.http.get("./assets/israel-cities.json");
    return response
  }

  getStreetsJSON(): Observable<any> {
    let response = this.http.get("./assets/israel-streets.json");
    return response
  }

  getInstance() {
    return this.db;
  }
}
