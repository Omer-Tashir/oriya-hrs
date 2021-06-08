import { Needy } from "./needy";
import { Volunteer } from "./volunteer";

export class Inlay {
  id: any;
  shift_id: any;
  date: any;
  needy: Needy | undefined;
  volunteer: Volunteer | undefined;
}
