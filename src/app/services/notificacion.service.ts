import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { Observable, map } from 'rxjs';
import { NotificacionCampana } from '../models/notificacion';
import { environment } from 'src/environments/environment';

const baseUrl = environment.apiUrl;
const vapiApiKeyPublica = environment.VAPI_KEY_PUBLIC;

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  private baseUrl = `${baseUrl}/notificaciones`;
  private pushUrl = `${baseUrl}/notipush`;

  // 🔑 COPIA AQUÍ LA MISMA LLAVE PÚBLICA VAPID QUE GENERASTE EN TU .ENV DEL BACKEND
  private readonly VAPI_KEY_PUBLIC = vapiApiKeyPublica;

  constructor(
    private http: HttpClient,
    private swPush: SwPush // Servicio nativo de Angular para interactuar con Service Workers
  ) { }

  /**
   * 🔵 OBTENER ALERTAS PENDIENTES DE LA CAMPANA
   * GET: /api/notificaciones/pendientes
   */
  obtenerNotificacionesPendientes(): Observable<NotificacionCampana[]> {
    return this.http.get<{ ok: boolean; alertas: NotificacionCampana[] }>(`${this.baseUrl}/pendientes`).pipe(
      map(response => response.alertas)
    );
  }
  obtenerHistorialCompleto(): Observable<NotificacionCampana[]> {
    return this.http.get<{ ok: boolean; alertas: NotificacionCampana[] }>(`${this.baseUrl}/historial-completo`).pipe(
      map(response => response.alertas)
    );
  }

  /**
   * 🟠 MARCAR NOTIFICACIÓN COMO LEÍDA (Al hacer clic en la campana)
   * PUT: /api/notificaciones/marcar-leida/:id
   */
  marcarComoLeida(id: string): Observable<string> {
  // 🟢 CORRECCIÓN: Cambiado de .get a .put e inyectado el objeto vacío {} requerido por Express
  return this.http.put<{ ok: boolean; msg: string }>(`${this.baseUrl}/marcar-leida/${id}`, {}).pipe(
    map(response => response.msg)
  );
}

  /**
   * 🔔 SOLICITAR PERMISOS Y SUSCRIBIR AL NAVEGADOR A LAS NOTIFICACIONES PUSH
   * Detona el banner nativo de Chrome/Safari: "¿Desea recibir notificaciones?"
   */
  suscribirA_PushNotifications(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.swPush.isEnabled) {
        console.warn('⚠️ WebPush no está soportado en este navegador.');
        return resolve(false);
      }

      this.swPush.requestSubscription({
        serverPublicKey: this.VAPI_KEY_PUBLIC
      })
      .then((suscripcionObjeto: PushSubscription) => {
        // Enviamos las llaves cifradas a la base de datos de Node
        this.http.post(`${this.pushUrl}/save-subscription`, suscripcionObjeto.toJSON())
          .subscribe({
            next: (res: any) => {
              console.log('✅ [WEBPUSH]: Dispositivo guardado en Mongo:', res.msg);
              resolve(true);
            },
            error: (err) => {
              console.error('❌ Error enviando suscripción al backend:', err);
              resolve(false);
            }
          });
      })
      .catch(err => {
        console.error('❌ El usuario denegó los permisos en el banner:', err);
        resolve(false);
      });
    });
  }

  /**
   * 🔍 Verificar de forma síncrona si el navegador ya está suscrito actualmente
   */
  verificarSuscripcionActiva(): Observable<boolean> {
    return this.swPush.subscription.pipe(
      map(sub => sub !== null) // Retorna true si hay un token activo, false si no
    );
  }
}
