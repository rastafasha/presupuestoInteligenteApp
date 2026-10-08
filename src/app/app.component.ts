import { Component, OnInit } from '@angular/core';
import { NotificacionService } from './services/notificacion.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit{
  title = 'Presupuesto Inteligente';

  constructor(private notiService: NotificacionService) {}

  ngOnInit(): void {
    // 🔥 Intentar activar las notificaciones push nativas al cargar la aplicación
    // Si ya tiene permisos dados anteriormente, se ejecuta de forma invisible en segundo plano
    this.notiService.suscribirA_PushNotifications();
  }
  
}
