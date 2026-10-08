import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  OnChanges,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Cliente } from 'src/app/models/cliente';
import { Cotizacion } from 'src/app/models/cotizacion';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { CotizacionService } from 'src/app/services/cotizacion.service';
import { SocketService } from 'src/app/services/socket.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.css'],
  standalone: false
})
export class ProjectEditComponent implements OnInit, OnChanges {
  @Input() projectSeleccionado;
  @Output() refreshProjectList: EventEmitter<void> = new EventEmitter<void>();
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();

  projectForm: FormGroup;
  title: string;
  usuario: any;
  partners: User[];
  project: Cliente;
  id: string;
  public imagenSubir!: File;
  public imgTemp: any = null;
  public FILE_AVATAR: any;
  public IMAGE_PREVISUALIZA: any = 'assets/img/user-06.jpg';

  isLoading: boolean = false;
  currentStep = 1;
  cargandoImagen = false;
  projectExiste = false;
  public whatsappBackupLink: string = '';
  cotizaciones : Cotizacion[] = [];
  private socketSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UserService,
    private authService: AuthService,
    private clienteService: ClienteService,
    private cotizacionService: CotizacionService,
    private socketService: SocketService
  ) {

  }

  ngOnInit(): void {
    this.usuario = this.authService.getLocalStorage();
    this.validarFormulario();

    // 🔥 ENGRANAJE EN VIVO: Escuchamos si Gemini y el Scraper terminan un análisis
    this.socketSub = this.socketService.escucharEvento('nueva-solicitud-entrante')
      .subscribe((nuevaCot: any) => {
        // Obtenemos el ID del cliente que estamos editando en pantalla
        const clienteIdActual = this.projectSeleccionado?._id || this.projectForm.get('id')?.value;

        // 🛡️ Filtro de Seguridad: Solo inyectamos la fila si la cotización pertenece al cliente del modal abierto
        if (nuevaCot.cliente.id === clienteIdActual) {
          console.log('🚀 [SOCKET]: Se detectó un nuevo requerimiento en vivo para este cliente:', nuevaCot);
          
          // Preparamos sus objetos reactivos igual que en el método HTTP
          nuevaCot.proveedorSeleccionadoObj = nuevaCot.proveedoresEncontrados[0] || null;
          nuevaCot.precioFinalVenta = nuevaCot.proveedorSeleccionadoObj ? nuevaCot.proveedorSeleccionadoObj.precioCosto : 0;
          
          // Lo agregamos al inicio del arreglo visual de la tabla
          this.cotizaciones.unshift(nuevaCot);
        }
      });
  }

 ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['projectSeleccionado'] &&
      changes['projectSeleccionado'].currentValue
    ) {
      this.title = 'Editando Cliente';
      const project = changes['projectSeleccionado'].currentValue;
      this.setPartnersFormArray(project.partners);
      
      this.projectForm.patchValue({
        id: project._id,
        nombre: project.nombre,
        empresa: project.empresa,
        correo: project.correo,
        telefono: project.telefono,
        fechaRegistro: project.fechaRegistro,
      });

      this.projectSeleccionado = project;

      // =========================================================================
      // 🔥 REACCIÓN INTELIGENTE DE APERTURA:
      // =========================================================================
      if (project.abrirEnPasoDos) {
        this.currentStep = 2; // 🟢 Saltamos directo al paso de cotizaciones
        this.getCotizaciones(); // 📦 Cargamos la tabla interactiva de insumos médicos
        
        // Limpiamos la bandera para que si cierra y vuelve a abrir de forma normal, inicie en el paso 1
        delete project.abrirEnPasoDos; 
      } else {
        // Flujo normal estándar cuando haces clic desde la tabla del CRM
        this.currentStep = 1; 
      }

    } else {
      this.title = 'Editando Cliente';
    }
  }

  

  getPartners() {
    this.usuarioService.getAllEditors().subscribe((resp: any) => {
      this.partners = resp;
      this.setPartnersFormArray([]);
    });
  }

  setPartnersFormArray(selectedPartners: string[]) {
    const partnersFormArray = this.fb.array([]);
    if (this.partners && this.partners.length > 0) {
      this.partners.forEach((partner) => {
        const isSelected = selectedPartners.includes(partner.uid);
        partnersFormArray.push(new FormControl(isSelected));
      });
    }
    // this.projectForm.setControl('partners', partnersFormArray);
  }

  validarFormulario() {
    this.projectForm = this.fb.group({
      nombre: [''],
      empresa: [''],
      telefono: [''],
      fechaRegistro: [''],
      correo: [''],
      id: [''],
    });
  }


  onClose() {
    this.projectSeleccionado = null;
    this.currentStep = 1;
    this.cotizaciones = []; 
    this.projectForm.reset();
    this.title = 'Creando Cliente';
    // Also reset default values if needed
    this.projectForm.patchValue({
      
      nombre: null,
      empresa: null,
      fechaRegistro: null,
      correo: null,
      telefono: null,
    });
    // Emit event to parent to reset the projectSeleccionado variable

    // Close modal programmatically
    const modalElement = document.getElementById('editProject');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();

    }
    // Emit event to refresh project list
    this.refreshProjectList.emit();
    this.closeModal.emit();
    this.ngOnInit();
    
    //  this.router.navigate([], { queryParams: { cotId: null }, queryParamsHandling: 'merge' });
  }

  nextStep() {
    const nombre = this.projectForm.get('nombre');
    const telefono = this.projectForm.get('telefono');
    const empresa = this.projectForm.get('empresa');
    const fechaRegistro = this.projectForm.get('fechaRegistro');
    const correo = this.projectForm.get('correo');

    if (nombre?.invalid || 
      telefono?.invalid || empresa?.invalid || 
      fechaRegistro?.invalid ||
      correo?.invalid

    ) {
      nombre?.markAsTouched();
      telefono?.markAsTouched();
      empresa?.markAsTouched();
      fechaRegistro?.markAsTouched();
      correo?.markAsTouched();
      this.projectForm.markAllAsTouched(); // Esto activa las validaciones visuales
      return;
    }
    this.currentStep = 2;
    this.getCotizaciones(); 

  }

  

  getCotizaciones() {
    const clienteId = this.projectSeleccionado?._id || this.projectForm.get('id')?.value;

    if (!clienteId) return;

    // 🟢 Cambiamos (resp: any[]) por (resp: any) para poder acceder a la propiedad interna del JSON
    this.cotizacionService.obtenerCotizacionesPorCliente(clienteId).subscribe((resp: any) => {
      
      // Accedemos de forma segura a resp.cotizaciones o usamos el respaldo de resp en caso de que viniera directo
      const listadoCrudo = resp.cotizaciones || resp || [];

      this.cotizaciones = listadoCrudo.map((cot: any) => {
        // Asignamos el proveedor por defecto
        cot.proveedorSeleccionadoObj = cot.proveedoresEncontrados.find(
          (p: any) => p._id === cot.proveedorSeleccionadoId
        ) || cot.proveedoresEncontrados[0] || null;

        // Si la cotización ya viene con precioFinalVenta del seeder, lo mantenemos; 
        // si no, calculamos el costo base con ganancia 0 por defecto
        if (!cot.precioFinalVenta && cot.proveedorSeleccionadoObj) {
          cot.precioFinalVenta = cot.proveedorSeleccionadoObj.precioCosto;
        }

        return cot;
      });
      
      console.log('📊 Cotizaciones procesadas y listas para la tabla:', this.cotizaciones);
    });
  }

  /**
   * Recalcula dinámicamente el precio de venta final en la UI
   */
  actualizarPrecioVenta(cotizacion: any): void {
    if (!cotizacion.proveedorSeleccionadoObj) return;

    const costoBase = cotizacion.proveedorSeleccionadoObj.precioCosto;
    const margen = cotizacion.porcentajeGanancia || 0;

    // Usamos la fórmula matemática de tu servicio
    cotizacion.precioFinalVenta = this.cotizacionService.calcularPrecioVenta(costoBase, margen);
  }

  /**
   * Ejecuta el despacho manual llamando al endpoint de Node
   */
  enviarCotizacionFinal(cotizacion: any): void {
    if (!cotizacion.proveedorSeleccionadoObj) return;

    const payload = {
      cotizacionId: cotizacion._id,
      porcentajeGanancia: cotizacion.porcentajeGanancia,
      precioCostoSeleccionado: cotizacion.proveedorSeleccionadoObj.precioCosto,
      nombreProveedorSeleccionado: cotizacion.proveedorSeleccionadoObj.nombreProveedor,
      canalEnvio: cotizacion.canalEntrada // 'whatsapp' o 'correo'
    };

    this.cotizacionService.enviarPropuestaComercial(payload).subscribe({
      next: (res: any) => {
        Swal.fire('¡Propuesta Enviada!', res.msg, 'success');
        cotizacion.estado = 'enviado'; // Congela la fila
      },
      error: (err) => Swal.fire('Error', 'No se pudo despachar la cotización.', 'error')
    });
  }


  

  prevStep() {
    this.currentStep = 1;
    this.cotizaciones = []; 
  }
  



  handleSubmit() {
    if (!this.projectForm.valid) {
      //mostramos las alertas de los campos requeridos
      this.projectForm.markAllAsTouched(); // Esto activa las validaciones visuales
      return
    }

    this.isLoading = true;
    const { nombre } = this.projectForm.value;
    // Extract selected partner IDs from the FormArray
    const selectedPartners = this.projectForm.value.partners
      .map((checked, i) => (checked ? this.partners[i].uid : null))
      .filter((v) => v !== null);

    const dataToSend = {
      ...this.projectForm.value,
      // formData,
      partners: selectedPartners,
    };

    if (this.projectSeleccionado) {
      //actualizar
      const data = {
        ...dataToSend,
      };
      this.clienteService.actualizarCliente(this.projectSeleccionado._id, data).subscribe((resp) => {
        this.isLoading = false;
        Swal.fire(
            'Actualizado',
            `"${this.projectSeleccionado.name}" actualizado correctamente por el sistema.`,
            'success'
          ).then(() => {
            this.ejecutarCierreYRefresco();
          });

        
        const modalElement = document.getElementById('editProject');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }

        this.refreshProjectList.emit();
        this.ngOnInit();
      });
    } else {
      //crear
      this.clienteService.crearCliente(dataToSend).subscribe((resp: any) => {
        this.isLoading = false;
        
        this.projectSeleccionado = resp;
        Swal.fire('¡Paso 1 completado!', 'Tienda creada. Ahora Agrega la info para el menu y sube la imagen.', 'success');
        this.currentStep = 2;
      });
    }
  }

  private ejecutarCierreYRefresco() {
    // Ocultamos el modal de Bootstrap programáticamente sin colisiones visuales
    const modalElement = document.getElementById('editProject');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }

    // Refrescamos la lista de la tabla de fondo y reiniciamos el formulario
    this.refreshProjectList.emit();
    this.ngOnInit();
    this.whatsappBackupLink = ''; // Limpiamos el link de la memoria
  }

  ngOnDestroy(): void {
    // 🧹 Cerramos el canal del socket al cerrar el modal o salir de la pantalla para evitar fugas de memoria
    if (this.socketSub) {
      this.socketSub.unsubscribe();
      console.log('🧹 [SOCKET]: Canal de escucha cerrado limpiamente.');
    }
  }

}
