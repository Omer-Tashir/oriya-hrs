import { Volunteer } from "./volunteer";
import { Needy } from "./needy";

export class Score {
  needy!: Needy;
  volunteer!: Volunteer;

  // Score Algorithem
  A_score: number = 0; // עיר
  B_score: number = 0; // שכונת מגורים
  C_D_E_score: number = 0; // תחומי עניין
  F_score: number = 0; // קבוצת השתייכות
  G_score: number = 0; // כשרות
  H_score: number = 0; // טבעונות
  I_score: number = 0; // פרווה
  J_score: number = 0; // גלוטן
  K_score: number = 0; // ניידות

  finalScore: number = 0;
}
