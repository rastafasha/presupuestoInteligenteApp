import { environment } from "src/environments/environment";
import { User } from "./user";
// const base_url = environment.mediaUrlRemoto;
export class Profile {


  constructor(

    public first_name: string,
    public last_name: string,
    public direccion: string,
    public estado: string,
    public ciudad: string,
    public telhome: string,
    public telmovil: string,
    public shortdescription: string,
    public emailPaypal: string,
    public nombrePaypal: string,
    // public emailBinance: string,
    // public userIdBinance: string,
    public facebook: string,
    public instagram: string,
    public twitter: string,
    public linkedin: string,
    public createdAt: Date,
    public updatedAt: Date,
    public usuario?: User,
    public img?: string,
    public _id?: string

){}



  // get imagenUrl(){

  //   if(!this.img){
  //     return `${base_url}/profiles/no-image.jpg`;
  //   } else if(this.img.includes('https')){
  //     return this.img;
  //   } else if(this.img){
  //     return `${base_url}/profiles/${this.img}`;
  //   }else {
  //     return `${base_url}/no-image.jpg`;
  //     // return `./assets/img/no-image.jpg`;
  //   }

  // }
}
