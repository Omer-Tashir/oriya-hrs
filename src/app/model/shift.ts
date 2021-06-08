import { Needy } from "./needy";
import { Volunteer } from "./volunteer";

export class Shift {
  id!: any;
  volunteer!: Volunteer | undefined;
  needy!: Needy | undefined;
  date!: Date;
  approved: boolean = false;
}
