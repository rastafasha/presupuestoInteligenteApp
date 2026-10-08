import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

import { map } from 'rxjs/operators';
import { User } from '../models/user';
import { Doctor } from '../models/doctor';
import { Speciality } from '../models/speciality';
import { Recurso } from '../models/recurso';

const base_url = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class BusquedasService {
  constructor(private http: HttpClient) {}

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get headers() {
    return {
      headers: {
        'x-token': this.token,
      },
    };
  }

  private trasnformarUsuarios(resultados: any[]): User[] {
    return resultados.map(
      (user) =>
        new User(
          user.username,
          user.email,
          user.img,
          user.google,
          user.role,
          user.uid,
          user.profile,
        )
    );
  }

  
  
  private trasnformarDoctors(resultados: any[]): Doctor[] {
    return resultados;
  }
  
  private trasnformarSpecialities(resultados: any[]): Speciality[] {
    return resultados;
  }
  
  private trasnformarRecursos(resultados: any[]): Recurso[] {
    return resultados;
  }
  

  buscar(tipo: 'usuarios' |  'doctors'| 'specialities' | 'recursos', termino: string) {
    const url = `${base_url}/todo/coleccion/${tipo}/${termino}`;
    return this.http.get<any[]>(url, this.headers).pipe(
      map((resp: any) => {
        switch (tipo) {
          case 'usuarios':
            return this.trasnformarUsuarios(resp.resultados);

          case 'doctors':
            return this.trasnformarDoctors(resp.resultados);
            
          case 'specialities':
            return this.trasnformarSpecialities(resp.resultados);
          case 'recursos':
            return this.trasnformarRecursos(resp.resultados);

          default:
            return [];
        }
      })
    );
  }

  searchGlobal(termino: string, estado?: string, tipo?:string) {
    const url = `${base_url}/todo/${termino}`;
    
    // Configuramos los parámetros de la URL de forma limpia
    let params = new HttpParams();
    if (estado) {
        params = params.set('estado_seguimiento', estado);
    }
     if (tipo) {
        params = params.set('tipoClinica', tipo);
    }

    // Pasamos los params dentro del objeto de configuración junto a los headers
    return this.http.get<any[]>(url, {
        ...this.headers,
        params
    });
}

searchByCollection(tabla: string, termino: string = '', estado?: string, tipo?:string) {
    // Si el término va vacío, usamos un string por defecto o espacio para que Express no rompa la URL
    const searchParam = termino.trim() === '' ? 'all' : termino;
    const url = `${base_url}/todo/coleccion/${tabla}/${searchParam}`;
    
    let params = new HttpParams();
    if (estado) {
        params = params.set('estado_seguimiento', estado);
    }
    if (tipo) {
        params = params.set('tipoClinica', tipo);
    }

    return this.http.get<any>(url, {
        ...this.headers,
        params
    });
}
}
