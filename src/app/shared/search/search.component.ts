import { HttpBackend, HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/models/user';
import { BusquedasService } from 'src/app/services/busqueda.service';
import { UserService } from 'src/app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.css'],
    standalone: false
})
export class SearchComponent implements OnInit {


  ServerUrl = environment.apiUrl;
  usuarios:any;
  private http: HttpClient;

  query:string ='';
    searchForm!:FormGroup;

  constructor(
    private userService: UserService,
    private busquedasService: BusquedasService,
  ) {
  }

  ngOnInit(): void {
  }

 

  public PageSize(): void {
    // this.getDirectories();
    this.query = '';
  }


   search() {
      if(!this.query|| this.query === null){
      this.ngOnInit();
    }else{
      return this.busquedasService.searchGlobal(this.query).subscribe(
        (resp:any) => {
          // this.usuarios = resp.usuarios;
          // this.projects = resp.projects;
          // this.projecttypes = resp.projecttypes;
      
          console.log(resp);
        }
      )
    }
    
  }


}
