
import { Profile } from "./profile";

export class User {

  public profile?: Profile;

  constructor(
    public username: string,
    public email: string,
    public terminos: boolean,
    public password?: string,
    public google?: boolean,
    public role?: 'SUPERADMIN' | 'ADMIN' | 'PARTNER' | 'USER' ,
    public uid?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ){}

}

export class Role {
  id: number;
  name: string;
  }
