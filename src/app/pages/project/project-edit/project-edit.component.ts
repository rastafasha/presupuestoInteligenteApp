import {
  Component, Input,
  OnInit, SimpleChanges,
  OnChanges, Output,
  EventEmitter, OnDestroy,
} from '@angular/core';
import { Subscription } from 'rxjs';
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
  stepActual: number = 1;

  cotizacionSeleccionada: any = null;
  cotizaciones: any[] = [];
  private socketSub!: Subscription;

  filtroArticuloSeleccionado: string | null = null;

  constructor(
    private authService: AuthService,
    private cotizacionService: CotizacionService,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.usuario = this.authService.getLocalStorage();

    // 🌟 LA CLAVE DE CARGA INICIAL: Apenas se inicializa el modal, disparamos la descarga
    // Esto asegura que el contador pase de 0 a 1 inmediatamente al abrir la ficha
    if (this.projectSeleccionado?._id) {
      console.log('🔌 [INIT]: Cargando historial para el cliente:', this.projectSeleccionado.nombre);
      this.getCotizaciones(false);
    }

    // 🔌 ENGRANAJE EN VIVO: Escuchamos el WebSocket para inyectar cotizaciones en tiempo real
    this.socketSub = this.socketService.escucharEvento('nueva-solicitud-entrante')
      .subscribe((nuevaCot: any) => {
        const clienteIdActual = this.projectSeleccionado?._id;

        if (clienteIdActual && nuevaCot.cliente?.id === clienteIdActual) {
          console.log('🚀 [SOCKET]: Nueva cotización en vivo:', nuevaCot);

          if (nuevaCot.proveedoresEncontrados && nuevaCot.proveedoresEncontrados.length > 0) {
            nuevaCot.proveedoresEncontrados.forEach((prov: any) => {
              prov.seleccionado = false;
              prov.porcentajeGanancia = prov.porcentajeGanancia || 0;
              prov.precioVentaFinal = prov.precioCosto;
            });
          }

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

      // 🌟 RE-DISPARAMOS AQUÍ POR SI CAMBIAS DE CLIENTE EN LA LISTA PRINCIPAL
      this.getCotizaciones(false);

      if (project.abrirEnPasoDos) {
        this.stepActual = 2;
        delete project.abrirEnPasoDos;
      } else {
        this.stepActual = 1;
      }
    }
  }

  irAlPasoDos(): void {
    console.log('⚡ [NAVEGACIÓN]: Solicitando avance al Paso 2. Descargando datos...');
    this.getCotizaciones(true); // 🚀 Pasamos 'true' para indicar que queremos conmutar la pantalla al finalizar la descarga
  }

  /**
 * Carga las cotizaciones del cliente y repara la estructura del seeder al vuelo
 */
  getCotizaciones(cambiarDePaso: boolean = false): void {
    const clienteId = this.projectSeleccionado?._id;
    if (!clienteId) return;

    this.isLoading = true;
    this.cotizacionService.obtenerCotizacionesPorCliente(clienteId).subscribe({
      next: (resp: any) => {
        const listadoCrudo = resp.cotizaciones || resp || [];

        this.cotizaciones = listadoCrudo.map((cot: any) => {
          if (cot.proveedoresEncontrados && cot.proveedoresEncontrados.length > 0) {
            cot.proveedoresEncontrados.forEach((prov: any, index: number) => {
              prov.seleccionado = false;
              prov.porcentajeGanancia = prov.porcentajeGanancia || 0;
              prov.precioVentaFinal = prov.precioVentaFinal || prov.precioCosto;

              // Si el registro del seeder viene vacío o dice 'General', le inyectamos su artículo correspondiente
              const stringProductoAsociado = (prov.productoAsociado || '').toLowerCase().trim();
              if (!prov.productoAsociado || stringProductoAsociado === 'general' || stringProductoAsociado === '') {
                if (cot.articulosDetallados && cot.articulosDetallados.length > 0) {
                  // Mapeo circular: vincula por índice de fila. Si hay desfase, toma el primero.
                  const articuloReal = cot.articulosDetallados[index] || cot.articulosDetallados[0];
                  prov.productoAsociado = articuloReal.productoDetalle;
                }
              }
            });
          }
          return cot;
        });

        // 🌟 LA REPARACIÓN ASÍNCRONA MAESTRA:
        if (this.cotizaciones.length > 0) {
          // Asignamos el primer objeto individual (el más reciente) para poblar las subtablas
          this.cotizacionSeleccionada = this.cotizaciones[0];

          // 🔥 CONTROL DE FLUJO SEGURO: Conmutamos al Paso 2 únicamente si los datos ya están en memoria
          if (cambiarDePaso) {
            this.stepActual = 2;
          }
        } else {
          this.cotizacionSeleccionada = null;
        }

        this.isLoading = false;
        console.log('📊 [CRM]: Datos cargados y validados. Paso actual:', this.stepActual);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Error recuperando requerimientos:', err);
      }
    });
  }
  /**
 * Permite cambiar la cotización activa en foco al hacer clic en el historial
 */
  seleccionarCotizacionDelHistorial(cotizacion: any): void {
    this.cotizacionSeleccionada = cotizacion;
    this.filtroArticuloSeleccionado = null; // Limpiamos filtros previos

    // Opcional: Si quieres que al hacer clic salte directo a ver sus precios, descomenta la línea de abajo
    // this.stepActual = 2;

    console.log('🔄 Cambiado el foco del modal a la cotización anterior:', this.cotizacionSeleccionada);
  }


  filtrarProveedoresPorArticulo(detalleProducto: string): void {
    if (this.filtroArticuloSeleccionado === detalleProducto) {
      this.filtroArticuloSeleccionado = null;
    } else {
      this.filtroArticuloSeleccionado = detalleProducto;
    }
  }

  get proveedoresFiltrados(): any[] {
    const listaCompleta = this.cotizacionSeleccionada?.proveedoresEncontrados || [];

    if (!this.filtroArticuloSeleccionado) {
      return listaCompleta;
    }

    const filtroLimpio = this.filtroArticuloSeleccionado.toLowerCase().trim();

    return listaCompleta.filter((prov: any) => {
      if (!prov.productoAsociado) return false;

      const productoProv = prov.productoAsociado.toLowerCase().trim();

      // 🌟 INTELIGENCIA DE FALLBACK PARA EL ERROR 429:
      // Si la data del scraper es la de contingencia ("General"), no bloqueamos la UI y mostramos las opciones siempre
      if (productoProv === 'general') return true;

      const palabrasFiltro = filtroLimpio.split(' ').filter(p => p.length > 2);
      const coincideTexto = productoProv.includes(filtroLimpio) || filtroLimpio.includes(productoProv);
      const coincidePalabraClave = palabrasFiltro.some(palabra => productoProv.includes(palabra));

      return coincideTexto || coincidePalabraClave;
    });
  }

  calcularPrecioVenta(proveedor: any): void {
    if (!proveedor || !proveedor.precioCosto) return;
    const costoBase = parseFloat(proveedor.precioCosto);
    const margen = parseFloat(proveedor.porcentajeGanancia) || 0;
    proveedor.precioVentaFinal = costoBase * (1 + (margen / 100));
  }

  /**
 * Cambia el estado de selección de la oferta y recalcula de inmediato para habilitar los campos
 */
  alternarSeleccion(proveedor: any): void {
    proveedor.seleccionado = !proveedor.seleccionado;

    // Si el usuario desmarca la opción, reseteamos su ganancia y precio para mantener limpia la UI
    if (!proveedor.seleccionado) {
      proveedor.porcentajeGanancia = 0;
      proveedor.precioVentaFinal = proveedor.precioCosto;
    }
  }

  hayProveedoresSeleccionados(): boolean {
    return this.cotizacionSeleccionada?.proveedoresEncontrados?.some((p: any) => p.seleccionado) || false;
  }

  obtenerCantidadSeleccionados(): number {
    return this.cotizacionSeleccionada?.proveedoresEncontrados?.filter((p: any) => p.seleccionado).length || 0;
  }

  /**
   * 🚀 NUEVA FUNCIÓN CONSOLIDADA: Despacha las ofertas elegidas por checkbox en bloque
   */
  despacharPresupuestoConsolidado(): void {
    if (!this.cotizacionSeleccionada) return;

    // Filtramos únicamente las filas que el usuario marcó con el checkbox
    const seleccionados = this.cotizacionSeleccionada.proveedoresEncontrados.filter((p: any) => p.seleccionado);

    const payload = {
      cotizacionId: this.cotizacionSeleccionada._id,
      canalEnvio: this.cotizacionSeleccionada.canalEntrada,
      ofertasElegidas: seleccionados.map((p: any) => ({
        articulo: p.productoAsociado || 'Artículo Solicitado',
        proveedor: p.nombreProveedor,
        costo: p.precioCosto,
        gananciaAplicada: p.porcentajeGanancia || 0,
        precioVenta: p.precioVentaFinal || p.precioCosto
      }))
    };

    Swal.fire({
      title: '¿Despachar Presupuesto Consolidado?',
      text: `Se empaquetarán ${seleccionados.length} ofertas seleccionadas en un único envío comercial vía ${payload.canalEnvio.toUpperCase()}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      confirmButtonText: 'Sí, enviar ahora'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cotizacionService.enviarPropuestaComercial(payload).subscribe({
          next: (res: any) => {
            Swal.fire('¡Enviado con Éxito!', res.msg, 'success');
            this.cotizacionSeleccionada.estado = 'enviado';
            this.cerrarModal();
          },
          error: (err) => {
            console.error(err);
            Swal.fire('Error', 'Hubo un inconveniente al procesar el despacho por lote.', 'error');
          }
        });
      }
    });
  }

  cerrarModal(): void {
    const modalElement = document.getElementById('editProject');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }

    setTimeout(() => {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());

      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
      document.documentElement.style.removeProperty('overflow');

      this.projectSeleccionado = null;
      this.cotizacionSeleccionada = null;
      this.stepActual = 1;
      this.cotizaciones = [];

      this.refreshProjectList.emit();
      this.closeModal.emit();
    }, 350);
  }



  ngOnDestroy(): void {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }
}
