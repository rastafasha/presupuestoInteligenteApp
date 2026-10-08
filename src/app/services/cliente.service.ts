import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Cliente } from '../models/cliente';
import { environment } from 'src/environments/environment';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private baseUrlapi = baseUrl+'/clientes';

  private filteredClientesSubject = new BehaviorSubject<Cliente[]>([]);
    public filteredClientes$: Observable<Cliente[]> = this.filteredClientesSubject.asObservable();
 constructor(private http: HttpClient) { }

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get headers() {
    return {
      headers: {
        'x-token': this.token
      }
    }
  }


  /**
   * 🔵 OBTENER TODOS LOS CLIENTES (CRM)
   * GET: /api/clientes
   */
  obtenerClientes(): Observable<{ total: number; clientes: Cliente[] }> {
    return this.http.get<{ ok: boolean; total: number; clientes: Cliente[] }>(this.baseUrlapi).pipe(
      map(response => ({
        total: response.total,
        clientes: response.clientes
      }))
    );
  }

  /**
   * 🔍 OBTENER UN ÚNICO CLIENTE POR SU ID
   * GET: /api/clientes/:id
   */
  obtenerClientePorId(id: string): Observable<Cliente> {
    return this.http.get<{ ok: boolean; cliente: Cliente }>(`${this.baseUrlapi}/${id}`).pipe(
      map(response => response.cliente)
    );
  }

  /**
   * 🟢 CREAR UN NUEVO CLIENTE DE FORMA MANUAL
   * POST: /api/clientes
   */
  crearCliente(cliente: Cliente): Observable<{ msg: string; cliente: Cliente }> {
    return this.http.post<{ ok: boolean; msg: string; cliente: Cliente }>(`${this.baseUrlapi}/crear`, cliente).pipe(
      map(response => ({
        msg: response.msg,
        cliente: response.cliente
      }))
    );
  }

  /**
   * 🟠 ACTUALIZAR LA FICHA DE UN CLIENTE
   * PUT: /api/clientes/:id
   */
  actualizarCliente(id: string, cliente: Cliente): Observable<{ msg: string; cliente: Cliente }> {
    return this.http.put<{ ok: boolean; msg: string; cliente: Cliente }>(`${this.baseUrlapi}/editar/${id}`, cliente).pipe(
      map(response => ({
        msg: response.msg,
        cliente: response.cliente
      }))
    );
  }

  /**
   * 🔴 ELIMINAR UN CLIENTE DEL CRM
   * DELETE: /api/clientes/:id
   */
  eliminarCliente(id: string): Observable<string> {
    return this.http.delete<{ ok: boolean; msg: string }>(`${this.baseUrlapi}/borrar/${id}`).pipe(
      map(response => response.msg)
    );
  }

  emitFilteredClientes(clientes: Cliente[]) {
    this.filteredClientesSubject.next(clientes);
  }
}
