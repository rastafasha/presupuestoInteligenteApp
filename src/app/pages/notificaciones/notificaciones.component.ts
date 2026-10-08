import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificacionService } from '../../services/notificacion.service';
import { NotificacionCampana } from 'src/app/models/notificacion';

@Component({
  selector: 'app-notificaciones',
  standalone: false,
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css'
})
export class NotificacionesComponent implements OnInit{

  title ='Notificaciones';

  // Colecciones de datos
  historialAlertas: NotificacionCampana[] = [];
  alertaSeleccionada: NotificacionCampana | null = null;
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private notiService: NotificacionService
  ) {}

  ngOnInit(): void {
    this.cargarHistorialCompleto();

    
  }

  /**
   * 🔵 Carga el historial masivo de la base de datos (Leídas y No leídas)
   */
  cargarHistorialCompleto(): void {
    this.isLoading = true;
    this.notiService.obtenerHistorialCompleto().subscribe({
      next: (res) => {
          this.historialAlertas = res || [];
          this.isLoading = false;

          // Si viene un ID por parámetro en la URL, pre-seleccionamos esa notificación
          this.route.queryParams.subscribe(params => {
            if (params['id']) {
              const encontrada = this.historialAlertas.find(a => a._id === params['id']);
              if (encontrada) this.seleccionarAlerta(encontrada);
            }
          });
        },
        error: (err) => {
          console.error('Error cargando el historial masivo:', err);
          this.isLoading = false;
        }
    });
  }

  /**
   * 🟠 Al hacer clic en una alerta, la muestra a la derecha y la marca como leída
   */
  seleccionarAlerta(alerta: NotificacionCampana): void {
    this.alertaSeleccionada = alerta;

    if (!alerta.leido && alerta._id) {
      this.notiService.marcarComoLeida(alerta._id).subscribe({
        next: () => {
          // Actualizamos el estado en el listado local sin recargar la página
          alerta.leido = true;
        },
        error: (err) => console.error('Error al actualizar estado en el servidor:', err)
      });
    }
  }

  /**
   * 🚀 Acción del detalle: Salta directo al modal de edición o flujo comercial
   */
  irAlRequerimiento(): void {
    if (this.alertaSeleccionada && this.alertaSeleccionada.referenciaCotizacionId) {
      // Redirige al panel de clientes pasándole el ID de la cotización para abrir el Paso 2
      this.router.navigate(['/dashboard/clients'], { 
        queryParams: { cotId: this.alertaSeleccionada.referenciaCotizacionId } 
      });
    }
  }

}
