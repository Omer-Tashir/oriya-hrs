import { RegistartionUser } from "./registration-user";

export class User extends RegistartionUser {
  is_kosher: boolean = false;
  is_parve: boolean = false;
  is_vegan: boolean = false;
  is_gluten_free: boolean = false;
}
