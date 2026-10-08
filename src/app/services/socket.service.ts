import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const baseUrl = environment.socketUrl;

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  // URL de tu backend Node.js configurada en app.js

  constructor() {
    // Inicializamos la conexión activando las credenciales de CORS heredadas de tu plantilla
    this.socket = io(baseUrl, {
      withCredentials: true,
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('⚡ [WEBSOCKET]: Conectado exitosamente al backend de presupuestos.');
    });

    this.socket.on('disconnect', () => {
      console.warn('❌ [WEBSOCKET]: Conexión perdida con el servidor Node.js.');
    });
  }

  /**
   * 📡 ESCUCHAR EVENTOS EN TIEMPO REAL
   * Escucha un canal específico del backend y lo convierte en un Observable de Angular.
   * @param nombreEvento Nombre del canal (ej: 'nueva-solicitud-entrante')
   */
  escucharEvento(nombreEvento: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(nombreEvento, (data) => {
        subscriber.next(data);
      });

      // Manejador de limpieza automática cuando el componente se destruye
      return () => {
        this.socket.off(nombreEvento);
      };
    });
  }

  /**
   * 📤 EMITIR EVENTOS HACIA EL BACKEND
   * Envía un payload de datos hacia el servidor Node.js.
   */
  emitirEvento(nombreEvento: string, payload: any): void {
    this.socket.emit(nombreEvento, payload);
  }
}
