import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Cotizacion } from '../models/cotizacion';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {

  private baseUrlapi = baseUrl+'/cotizaciones';

  constructor(private http: HttpClient) { }

  /**
   * 🔵 OBTENER HISTORIAL DE COTIZACIONES
   * Trae todas las solicitudes registradas (Útil para la carga inicial de tu tabla propia)
   * GET: /api/cotizaciones
   */
  obtenerHistorialCotizaciones(): Observable<Cotizacion[]> {
    return this.http.get<{ ok: boolean; cotizaciones: Cotizacion[] }>(`${this.baseUrlapi}/historial`).pipe(
      map(response => response.cotizaciones)
    );
  }

  obtenerCotizacionesPorCliente(clienteId: string): Observable<Cotizacion[]> {
  return this.http.get<{ ok: boolean; cotizaciones: Cotizacion[] }>(`${this.baseUrlapi}/cliente/${clienteId}`).pipe(
    // 🟢 LA CLAVE: Extraemos la propiedad 'cotizaciones' del JSON de respuesta
    map(response => response.cotizaciones) 
  );
}

buscarClientePorCotizacion(cotId: string): Observable<any> {
  return this.http.get<any>(`${this.baseUrlapi}/buscar-por-cotizacion/${cotId}`);
}

  /**
   * 🚀 DISPARAR PROPUESTA COMERCIAL MANUAL
   * Envía el payload calculado con el porcentaje de ganancia para que Node despache el correo o WhatsApp
   * POST: /api/cotizaciones/enviar-propuesta
   */
  enviarPropuestaComercial(payload: {
    cotizacionId: string;
    porcentajeGanancia: number;
    precioCostoSeleccionado: number;
    nombreProveedorSeleccionado: string;
    canalEnvio: 'whatsapp' | 'correo';
  }): Observable<{ ok: boolean; msg: string; precioFinalVenta: number }> {
    return this.http.post<{ ok: boolean; msg: string; precioFinalVenta: number }>(
      `${this.baseUrlapi}/enviar-propuesta`, 
      payload
    );
  }

  /**
   * 🔍 AUXILIAR DE NEGOCIO: Operación matemática para calcular el precio final de venta.
   * Al colocarlo en el servicio, centralizas la lógica comercial y mantienes limpio el componente.
   */
  calcularPrecioVenta(precioCosto: number, porcentajeGanancia: number): number {
    const costo = parseFloat(precioCosto.toString()) || 0;
    const margen = parseFloat(porcentajeGanancia.toString()) || 0;
    
    if (margen <= 0) return costo;
    
    // Formula estándar: Costo * (1 + (Margen% / 100))
    return costo * (1 + (margen / 100));
  }
}
