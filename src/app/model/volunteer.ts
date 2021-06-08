import { User } from "./user";

export class Volunteer extends User {
  interests: any[] = [];
  preferences: any[] = [];
  is_mobility: boolean = false;
  is_one_time_volunteering: boolean = false;
}
