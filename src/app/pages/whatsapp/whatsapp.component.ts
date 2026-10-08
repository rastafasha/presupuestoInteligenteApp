import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from 'src/app/services/socket.service'; // Ajusta la ruta a tus servicios
import { Subscription } from 'rxjs';
import { NotificacionService } from 'src/app/services/notificacion.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-whatsapp',
  standalone:false,
  templateUrl: './whatsapp.component.html',
  styleUrl: './whatsapp.component.css'
})
export class WhatsappComponent implements OnInit, OnDestroy {

  title = 'Vincular Whatsapp'
  // Estados posibles del backend: 'cargando', 'esperando_qr', 'autenticado', 'conectado', 'desconectado'
  estadoPasarela: string = 'cargando';
  codigoQrString: string | null = null;

  whatsappStatus: string = 'DESCONECTADO'; // DESCONECTADO, CARGANDO, ESPERANDO_QR, CONECTADO
  whatsappQR: string = ''; // 🚀 Variable ÚNICA para el [src] del <img> de tu HTML
  cargando: boolean = false;
  user: any;
  public whatsappQRString: string = '';
  private respaldoInterval: any;

  // Manejadores de suscripciones de Sockets
  private qrSubscription!: Subscription;
  private statusSubscription!: Subscription;

  // Habilitamos la función nativa del navegador para usarla en el HTML
  encodeURIComponent = encodeURIComponent;

  constructor(
    private socketService: SocketService,
    private notificacionService: NotificacionService,
    private sanitizer: DomSanitizer,
  ) {}

 sanitizarQR(base64String: string): SafeUrl {
    if (!base64String) return '';
    return this.sanitizer.bypassSecurityTrustUrl(base64String);
  }

  ngOnInit(): void {
    // A) Esto reemplaza el bloque A de tu función vieja (Controla el diseño visual)
    this.statusSubscription = this.socketService.escucharEvento('whatsapp-status')
      .subscribe((data: { estado: string }) => {
        console.log('🔌 [SOCKET-FRONT]: Estado recibido desde Node:', data.estado);
        
        if (data.estado === 'conectado' || data.estado === 'autenticado') {
          this.estadoPasarela = 'conectado';
          this.whatsappQR = '';
        } else if (data.estado === 'esperando_qr') {
          this.estadoPasarela = 'esperando_qr';
        } else if (data.estado === 'cargando') {
          this.estadoPasarela = 'cargando';
        } else {
          // Si el estado es desconectado pero ya tenemos un QR en memoria, no rompemos la vista
          if (!this.whatsappQR) {
            this.estadoPasarela = 'desconectado';
          }
        }
      });

    // 2. 🖼️ ESCUCHAR EL QR EN VIVO: Convierte el texto plano en la imagen Base64 real
    this.qrSubscription = this.socketService.escucharEvento('whatsapp-qr')
      .subscribe((data: { qr: string }) => {
        this.estadoPasarela = 'esperando_qr';
        
        // 🟢 CORRECCIÓN LOGÍSTICA: Pasamos 'data.qr' (el string) en lugar de 'data' (el objeto)
        QRCode.toDataURL(data.qr, { errorCorrectionLevel: 'M', width: 240 }, (err, url) => {
          if (err) {
            console.error('Error generando el Base64 del QR:', err);
            return;
          }
          this.whatsappQR = url; // Ahora sí inyecta la imagen Base64 perfecta al [src]
          console.log('✅ [QR RENDERIZADO]: Imagen Base64 generada correctamente a partir de data.qr');
        });
      });

    this.solicitarConexion();
  }

  solicitarConexion() {
    this.estadoPasarela = 'cargando';
    this.whatsappQR = '';
    this.socketService.emitirEvento('solicitar-estado-whatsapp', null);
  }

 

  // Asegúrate de actualizar también tu ngOnDestroy para limpiar los nuevos nombres de canales
  ngOnDestroy(): void {
    // 🧹 Limpieza de canales al salir de la pantalla para evitar fugas de memoria
    if (this.qrSubscription) this.qrSubscription.unsubscribe();
    if (this.statusSubscription) this.statusSubscription.unsubscribe();
  }
}
