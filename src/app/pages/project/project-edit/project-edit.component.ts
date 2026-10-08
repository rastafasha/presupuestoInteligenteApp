import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  OnChanges,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Cotizacion } from 'src/app/models/cotizacion';
import { AuthService } from 'src/app/services/auth.service';
import { CotizacionService } from 'src/app/services/cotizacion.service';
import { SocketService } from 'src/app/services/socket.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.css'],
  standalone: false
})
export class ProjectEditComponent implements OnInit, OnChanges, OnDestroy {
  @Input() projectSeleccionado: any;
  @Output() refreshProjectList: EventEmitter<void> = new EventEmitter<void>();
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();

  title: string = 'Ficha del Cliente';
  usuario: any;
  isLoading: boolean = false;
  
  // 🔥 CORREGIDO: Sincronizado con 'stepActual' del HTML para que la interfaz renderice de inmediato
  stepActual: number = 1; 
  
  // Guardará la cotización activa que contiene el array de productos y proveedores
  cotizacionSeleccionada: any = null;
  cotizaciones: any[] = [];
  private socketSub!: Subscription;

  constructor(
    private authService: AuthService,
    private cotizacionService: CotizacionService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getLocalStorage();

    // 🔌 ENGRANAJE EN VIVO: Escuchamos el WebSocket para inyectar cotizaciones de Apple en tiempo real
    this.socketSub = this.socketService.escucharEvento('nueva-solicitud-entrante')
      .subscribe((nuevaCot: any) => {
        const clienteIdActual = this.projectSeleccionado?._id;

        // 🛡️ Filtro de Seguridad: Solo inyectamos si pertenece al cliente abierto en el modal
        if (clienteIdActual && nuevaCot.cliente?.id === clienteIdActual) {
          console.log('🚀 [SOCKET]: Nueva cotización detectada en vivo para este cliente:', nuevaCot);
          
          // Mapeamos los proveedores de la cotización que entra en vivo
          if (nuevaCot.proveedoresEncontrados && nuevaCot.proveedoresEncontrados.length > 0) {
            nuevaCot.proveedoresEncontrados.forEach((prov: any) => {
              prov.porcentajeGanancia = prov.porcentajeGanancia || 0;
              prov.precioVentaFinal = prov.precioCosto;
            });
          }
          
          // Agregamos la cotización al pool general y la seleccionamos para actualizar el Paso 2
          this.cotizaciones.unshift(nuevaCot);
          this.cotizacionSeleccionada = nuevaCot;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectSeleccionado'] && changes['projectSeleccionado'].currentValue) {
      const project = changes['projectSeleccionado'].currentValue;
      this.projectSeleccionado = project;
      
      console.log('👤 Cliente seleccionado cargado en el modal:', this.projectSeleccionado);

      // 🔄 REACCIÓN INTELIGENTE DE APERTURA DESDE LA CAMPANA O TABLA
      if (project.abrirEnPasoDos) {
        this.stepActual = 2; 
        this.getCotizaciones(); 
        delete project.abrirEnPasoDos; 
      } else {
        this.stepActual = 1; 
      }
    }
  }

  /**
   * Carga las cotizaciones del cliente y selecciona la más reciente para el despiece de la IA
   */
  getCotizaciones(): void {
    const clienteId = this.projectSeleccionado?._id;
    if (!clienteId) return;

    this.isLoading = true;
    this.cotizacionService.obtenerCotizacionesPorCliente(clienteId).subscribe({
      next: (resp: any) => {
        const listadoCrudo = resp.cotizaciones || resp || [];

        this.cotizaciones = listadoCrudo.map((cot: any) => {
          // Si el backend ya guardó proveedores, inicializamos sus propiedades de cálculo reactivo
          if (cot.proveedoresEncontrados && cot.proveedoresEncontrados.length > 0) {
            cot.proveedoresEncontrados.forEach((prov: any) => {
              prov.porcentajeGanancia = cot.porcentajeGanancia || 0;
              // Si ya tiene precio final calculado de la base de datos lo usa, si no, inicia con el costo base
              prov.precioVentaFinal = cot.precioFinalVenta || prov.precioCosto;
            });
          }
          return cot;
        });

        // 🔥 Establecemos la cotización más reciente en foco para pintar el Paso 2 del HTML
        if (this.cotizaciones.length > 0) {
          this.cotizacionSeleccionada = this.cotizaciones[0];
        }

        this.isLoading = false;
        console.log('📊 Cotización activa en foco para el modal:', this.cotizacionSeleccionada);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Error recuperando requerimientos:', err);
      }
    });
  }

  /**
   * Recalcula dinámicamente el precio de venta final en la UI al cambiar el input del %
   */
  calcularPrecioVenta(proveedor: any): void {
    if (!proveedor || !proveedor.precioCosto) return;

    const costoBase = parseFloat(proveedor.precioCosto);
    const margen = parseFloat(proveedor.porcentajeGanancia) || 0;

    // Fórmula matemática directa: Costo * (1 + Margen/100)
    proveedor.precioVentaFinal = costoBase * (1 + (margen / 100));
  }

  /**
   * Despacha la propuesta final (vía WhatsApp o Correo) conectando con el backend
   */
  despacharPropuesta(proveedor: any): void {
    if (!this.cotizacionSeleccionada || !proveedor) return;

    const payload = {
      cotizacionId: this.cotizacionSeleccionada._id,
      porcentajeGanancia: proveedor.porcentajeGanancia || 0,
      precioCostoSeleccionado: proveedor.precioCosto,
      nombreProveedorSeleccionado: proveedor.nombreProveedor,
      canalEnvio: this.cotizacionSeleccionada.canalEntrada // El sistema sabe si vino de 'whatsapp' o 'correo' [1]
    };

    Swal.fire({
      title: '¿Despachar Presupuesto?',
      text: `Se enviará la propuesta comercial de forma automatizada por el canal de ${payload.canalEnvio.toUpperCase()}.`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#6f42c1',
      confirmButtonText: 'Sí, enviar ahora'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cotizacionService.enviarPropuestaComercial(payload).subscribe({
          next: (res: any) => {
            Swal.fire('¡Propuesta Enviada!', res.msg, 'success');
            this.cotizacionSeleccionada.estado = 'enviado'; // Congela la fila en el HTML [1]
            this.refreshProjectList.emit(); // Refresca el CRM de fondo [1]
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'No se pudo procesar el despacho automatizado.', 'error');
          }
        });
      }
    });
  }

  /**
   * Avanzar al Paso 2 de forma limpia y directa
   */
  irAlPasoDos(): void {
    this.stepActual = 2;
    this.getCotizaciones();
  }

  cerrarModal(): void {
    // 1. Ocultamos el modal programáticamente a través de Bootstrap de forma segura
    const modalElement = document.getElementById('editProject');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }

    // 2. 🔥 ANCLA DE SEGURIDAD: Eliminamos manualmente cualquier fondo gris huérfano en el DOM
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
    
    // 3. Devolvemos el scroll al cuerpo de la página por si Bootstrap lo dejó congelado
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // 4. Limpiamos las variables del estado después de asegurar la limpieza visual
    this.projectSeleccionado = null;
    this.cotizacionSeleccionada = null;
    this.stepActual = 1;
    this.cotizaciones = []; 

    // 5. Emitimos los eventos de refresco al componente padre
    this.refreshProjectList.emit();
    this.closeModal.emit();
  }

  ngOnDestroy(): void {
    // 🧹 Apagamos el WebSocket al destruir el modal para evitar fugas de memoria [1]
    if (this.socketSub) {
      this.socketSub.unsubscribe();
      console.log('🧹 [SOCKET]: Canal de escucha del modal cerrado limpiamente [1].');
    }
  }
}
