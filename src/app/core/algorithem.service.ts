import { Injectable } from '@angular/core';
import { Needy } from '../model/needy';
import { Volunteer } from '../model/volunteer';
import { Globals } from '../app.globals';
import { Score } from '../model/score';

@Injectable({
  providedIn: 'root',
})
export class AlgorithemService {
  constructor(public globals: Globals) { }

  calculateScore(volunteer: Volunteer, needy: Needy): Promise<Score> {
    return new Promise<Score>((resolve, reject) => {
      let score = new Score;
      score.volunteer = volunteer;
      score.needy = needy;

      if (volunteer.city == needy.city) {
        score.A_score = 10;
        score.finalScore += 10;

        if (volunteer.address == needy.address) {
          score.B_score = 10;
          score.finalScore += 10;
        }
      }
      for (let i = 0; i < volunteer.interests?.length; i++) {
        if (needy.interests?.includes(volunteer.interests[i])) {
          score.C_D_E_score += 1;
          score.finalScore += 1;
        }
      }
      for (let i = 0; i < volunteer.preferences?.length; i++) {
        if (needy.groups?.includes(volunteer.preferences[i])) {
          score.F_score += 3;
          score.finalScore += 3;
        }
      }
      if (volunteer.is_kosher == needy.is_kosher) {
        score.G_score = 3;
        score.finalScore += 3;
      }
      if (volunteer.is_vegan == needy.is_vegan) {
        score.H_score = 2;
        score.finalScore += 2;
      }
      if (volunteer.is_parve == needy.is_parve) {
        score.I_score = 1;
        score.finalScore += 1;
      }
      if (volunteer.is_gluten_free == needy.is_gluten_free) {
        score.J_score = 4;
        score.finalScore += 4;
      }
      if (volunteer.is_mobility) {
        score.K_score = 3;
        score.finalScore += 3;
      }

      resolve(score);
    });
  }
}
