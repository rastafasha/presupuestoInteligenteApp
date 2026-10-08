import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/models/profile.service';
import { Profile } from 'src/app/models/profile';

import { NotificacionService } from 'src/app/services/notificacion.service';
import { SocketService } from 'src/app/services/socket.service';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styles: []
})
export class HeaderComponent implements OnInit {

  private linktTheme = document.querySelector('.dark');// se comunica el id pulsado


  userprofile!: any;
  user: any;
  error: string;
  userid: any;
  profile: Profile;

  // 🔥 VARIABLES CONTROLADORAS DE LA CAMPANA
  alertasCampana: any[] = [];
  contadorPendientes: number = 0;
  private socketNotiSub!: Subscription;

  pushActivas: boolean = false;
  cargandoSwitch: boolean = false;

  constructor(
    private profileService: ProfileService,
    private router: Router,
    private authServce: AuthService,
    private notiService: NotificacionService,
    private socketService: SocketService
  ) {
    this.user = authServce.getLocalStorage();
  }



  ngOnInit() {
    if (!this.user || !this.user.uid) {
      this.router.navigateByUrl('/login');
      return;
    }

    this.userid = this.user.uid;

    // 1. 🔵 CARGA INICIAL: Traer de la base de datos las alertas guardadas que no se han leído
    this.cargarNotificacionesHistoricas();

    // 2. ⚡ TIEMPO REAL: Escuchar si Node/Gemini emiten una alerta en vivo
    this.socketNotiSub = this.socketService.escucharEvento('nueva-notificacion-campana')
      .subscribe((nuevaAlerta: any) => {
        console.log('🔔 [SOCKET]: Nueva alerta capturada en el Header:', nuevaAlerta);

        // La insertamos al principio del dropdown flotante
        this.alertasCampana.unshift(nuevaAlerta);
        this.contadorPendientes++; // Sumamos +1 al globo rojo visual
      });
      // 🟢 VERIFICACIÓN INICIAL: Revisa si este navegador ya tiene el token push activo en MongoDB
    this.notiService.verificarSuscripcionActiva().subscribe(estaSuscrito => {
      this.pushActivas = estaSuscrito;
      console.log('🔔 [WEBPUSH]: ¿El navegador actual tiene las push activadas?:', estaSuscrito);
    });

  }

  /**
   * 🔥 DETONADOR DEL SWITCH COMERCIAL NATIVO
   * Se ejecuta cada vez que se mueva el interruptor en el menú superior
   */
  togglePushNotifications(event: any): void {
    const quiereActivar = event.target.checked;

    if (quiereActivar) {
      this.cargandoSwitch = true;
      
      // Llamamos a tu servicio corregido con el método PUT/POST seguro
      this.notiService.suscribirA_PushNotifications().then(exito => {
        this.cargandoSwitch = false;
        if (exito) {
          this.pushActivas = true;
          console.log('✅ [WEBPUSH]: Token guardado en MongoDB con éxito.');
        } else {
          this.pushActivas = false;
          event.target.checked = false; // Deshace el movimiento del switch visualmente
          console.warn('⚠️ [WEBPUSH]: No se pudieron activar las notificaciones.');
        }
      });
    } else {
      this.pushActivas = false;
      console.log('🔕 [WEBPUSH]:  pausó las alertas visuales desde el Header.');
    }
    }

  cargarNotificacionesHistoricas() {
    this.notiService.obtenerNotificacionesPendientes().subscribe({
      next: (alertas: any[]) => {
        this.alertasCampana = alertas;
        this.contadorPendientes = alertas.length;
      },
      error: (err) => console.error('Error al precargar la campana:', err)
    });
  }

  /**
   * Cambia el estado de la notificación en MongoDB al hacerle clic desde el menú desplegable
   */
  clickMarcarLeida(alerta: any) {
    this.notiService.marcarComoLeida(alerta._id).subscribe(() => {
      // Filtramos el arreglo local para removerla visualmente del dropdown
      this.alertasCampana = this.alertasCampana.filter(a => a._id !== alerta._id);
      if (this.contadorPendientes > 0) this.contadorPendientes--;

      // 🚀 REDIRECCIÓN INTELIGENTE: Si la alerta viene enlazada a una cotización,
      // puedes redirigir a usuario directo a esa zona de trabajo.
      if (alerta.referenciaCotizacionId) {
        this.router.navigate(['/dashboard/clients'], { queryParams: { cotId: alerta.referenciaCotizacionId } });
      }
    });
  }

  /**
   * Redirige al listado maestro histórico
   */
  irAListaCompleta() {
    this.router.navigateByUrl('/dashboard/notificaciones');
  }

  ngOnDestroy(): void {
    // 🧹 Desconectamos el tunel al desloguearse para evitar acumulación de memoria
    if (this.socketNotiSub) this.socketNotiSub.unsubscribe();
  }


  getProfileUser() {
    this.profileService.listarUsuario(this.userid).subscribe(
      (resp: any) => {
        this.profile = resp;
      }
    );

  }

  openModal() {

    var modalcart = document.getElementsByClassName("dropdown-menu");
    for (var i = 0; i < modalcart.length; i++) {
      modalcart[i].classList.toggle("show");
    }
  }


  openMenu() {
    var menuLateral = document.getElementsByClassName("mini-sidebar");
    for (var i = 0; i < menuLateral.length; i++) {
      menuLateral[i].classList.toggle("show-sidebar");
    }
  }

  logout() {
    this.authServce.logout();
  }

  darkmode(dark: string) {
    let body = document.querySelector('body');
    let header = document.querySelector('header');
    let aside = document.querySelector('aside');

    const classExists = document.getElementsByClassName(
      'dark'
    ).length > 0;

    var dayNight = document.getElementsByClassName("dayNight");
    for (var i = 0; i < dayNight.length; i++) {
      dayNight[i].classList.toggle("active");
      body.classList.toggle('dark');
      header.classList.toggle('dark');
      aside.classList.toggle('dark');

    }
    // localStorage.setItem('dark', dark);

    if (classExists) {
      localStorage.removeItem('dark');
      // console.log('✅ class exists on page, removido');
    } else {
      localStorage.setItem('dark', dark);
      // console.log('⛔️ class does NOT exist on page, agregado');
    }
    // console.log('Pulsado');
  }


}
