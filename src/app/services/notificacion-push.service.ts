import { inject, Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import Swal from 'sweetalert2';

const claveVapidApi = environment.VAPI_KEY_PUBLIC;
// Ajustamos la ruta para que concatene tu endpoint unificado de guardado
const urlBackend = `${environment.urlBackedNotification}`;

@Injectable({
  providedIn: 'root'
})
export class NotificacionPushService {
  readonly VAPID_PUBLIC_KEY = claveVapidApi;

  private swPush = inject(SwPush);
  private http = inject(HttpClient);
  public router = inject(Router);

  public isSubscribed$ = new BehaviorSubject<boolean>(false);
  public isProcessing$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.checkSubscriptionStatus();
  }

  setSubscriptionStatus(status: boolean) {
    this.isSubscribed$.next(status);
  }

  async checkSubscriptionStatus() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      this.isSubscribed$.next(!!sub);
    } catch (err) {
      this.isSubscribed$.next(false);
    }
  }

  subscribeToNotifications() {
    this.isProcessing$.next(true);
    
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
    .then(sub => {
      const userString = localStorage.getItem('user');
      const userObj = userString ? JSON.parse(userString) : null;
      const currentUid = userObj && userObj.id ? userObj.id.toString() : 'ADMIN' ;
      const miToken = localStorage.getItem('token') || '';

      const subJson = sub.toJSON();

      const payloadBody = {
        endpoint: subJson.endpoint,
        expirationTime: subJson.expirationTime,
        keys: subJson.keys,
        userId: currentUid 
      };

      const headers = {
        'x-token': miToken,
      };
      
      console.log('📡 [WEBPUSH]: Registrando dispositivo comercial en Node para el ID:', currentUid);

      this.http.post(urlBackend, payloadBody, { headers }).subscribe({
        next: () => {
          console.log('✅ ¡Suscripción comercial guardada con éxito en MongoDB!');
          this.isSubscribed$.next(true);
          this.isProcessing$.next(false);
          Swal.fire('¡Banners Activados!', 'Recibirás alertas flotantes incluso si tienes la aplicación minimizada.', 'success');

          // Despacho del globo de bienvenida nativo adaptado
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
              
              // 🟢 SOLUCIÓN: Tipamos el objeto explícitamente como 'any' o corregimos el arreglo numérico
              const opcionesNotificacion: any = {
                body: 'Recibirás avisos en tiempo real cada vez que Gemini analice un presupuesto.',
                icon: 'assets/icons/72.png',
                badge: 'assets/icons/72.png',
                vibrate:[200, 100, 200], // <-- Arreglo limpio de números de milisegundos
                tag: 'bienvenida-comercial'
              };

              registration.showNotification('🔔 Canal Comercial Conectado', opcionesNotificacion);
            }).catch(swErr => console.log('Aviso: Service Worker no listo para el globo inmediato:', swErr));
          }
        },
        error: err => {
          console.error('❌ Error al guardar la suscripción en Node:', err);
          // 🔥 RETORNO AL INICIO: Si el backend rechaza la petición, forzamos el apagado del switch
          this.isSubscribed$.next(false);
          this.isProcessing$.next(false);
          Swal.fire('Error de enlace', 'El servidor no pudo registrar el token. Inténtalo más tarde.', 'error');
        }
      });
    })
    .catch(err => {
      console.error('❌ Permiso denegado por el usuario o error VAPID:', err);
      // 🔥 RETORNO AL INICIO: Si el usuario presiona "Bloquear" o "Cerrar" en el aviso de Chrome
      this.isSubscribed$.next(false);
      this.isProcessing$.next(false);
      Swal.fire('Permiso requerido', 'Debes habilitar las notificaciones en el candado del navegador para encender el canal.', 'info');
    });
  }
}



