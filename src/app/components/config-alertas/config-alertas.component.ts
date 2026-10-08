import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NotificacionPushService } from 'src/app/services/notificacion-push.service';

@Component({
  selector: 'app-config-alertas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './config-alertas.component.html',
  styleUrl: './config-alertas.component.css'
})
export class ConfigAlertasComponent implements OnInit {

  constructor(public pushService: NotificacionPushService) {}

  ngOnInit(): void {
    // El servicio se encarga de verificar el estado inicial de forma asíncrona
  }

  async togglePush() {
    this.pushService.isProcessing$.next(true);

    try {
      const estaSuscrito = this.pushService.isSubscribed$.value;
      if (estaSuscrito) {
        // FLUJO DE APAGADO: El usuario remueve el canal
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          this.pushService.setSubscriptionStatus(false);
        }
      } else {
        // FLUJO DE ENCENDIDO: Gatilla el proceso de suscripción de Google/Node
        await this.pushService.subscribeToNotifications();
      }
    } catch (err) {
      console.error('Error procesando el switch de WebPush:', err);
      // 🔥 RETORNO AL INICIO EN EL COMPONENT: Forzamos la restauración visual si se cae el Service Worker
      this.pushService.setSubscriptionStatus(false);
      this.pushService.isProcessing$.next(false);
      
    } finally {
      // Nos aseguramos de liberar el switch pase lo que pase
      this.pushService.isProcessing$.next(false);
    }
  }
}
