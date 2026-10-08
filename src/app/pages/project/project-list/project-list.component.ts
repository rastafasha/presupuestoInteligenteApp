import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Cliente } from 'src/app/models/cliente';
import { User } from 'src/app/models/user';
import { BusquedasService } from 'src/app/services/busqueda.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { CotizacionService } from 'src/app/services/cotizacion.service';
import Swal from 'sweetalert2';

declare var bootstrap: any;

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css'],
  standalone: false
})
export class ProjectListComponent implements OnInit {
  @Input() displaycomponent: string = 'block';
  @Input() limit!: number;
  @Input() userprofile!: User;

  selectedType: string = '';
  selectedEstado: string = '';
  selectedtipoClinica: string = '';

  title: string = 'Clientes';
  clientes: Cliente[];
  query: string = '';
  p: number = 1;
  count: number = 6;
  loading: boolean = false;
  selectedProject: Cliente;
  usuario: any;
  usuario_id: any;

  constructor(
    private clienteService: ClienteService,
    private cotizacionService: CotizacionService,
    private busquedasService: BusquedasService,
    private route: ActivatedRoute,
    private router: Router,

  ) {
    let USER = localStorage.getItem('user');
    this.usuario = JSON.parse(USER ? USER : '');
  }



  ngOnInit(): void {
    this.getProjects();
    this.gethijo();

  }

  gethijo() {
    this.route.queryParams.subscribe(params => {
      let cotId = params['cotId'];

      if (cotId) {
        // 🟢 Limpiamos el ID de cualquier espacio o barra extra accidental antes de enviarlo
        cotId = cotId.trim().replace(/^\/+|\/+$/g, '');
        console.log('🔍 [INTERCEPTOR]: Parámetro limpio detectado:', cotId);

        this.cotizacionService.buscarClientePorCotizacion(cotId)
          .subscribe({
            next: (res: any) => {
              if (res && res.cliente) {
                res.cliente.abrirEnPasoDos = true;
                this.selectedProject = res.cliente;

                setTimeout(() => {
                  const modalElement = document.getElementById('editProject');
                  if (modalElement) {
                    const modalInstance = new bootstrap.Modal(modalElement);
                    modalInstance.show();
                  }
                }, 100);
              }
            },
            error: (err) => console.error('Error al precargar el cliente para el modal:', err)
          });
      }
    });
  }


  getProjects() {
    this.loading = true;
    this.clienteService.obtenerClientes().subscribe({
      next: ({ total, clientes }) => {
        this.clientes = clientes; // Tipado automáticamente como Cliente[]
        console.log(`Se cargaron ${total} clientes en el CRM.`);
        this.loading = false;
      },
      error: (err) => console.error('Error al conectar con la API de clientes', err)
    });
  }





  onEditProject(project: any) {
    this.selectedProject = project;

    // 🔥 FORZAR APERTURA VISUAL: Como no hubo clic en el botón del hijo, levantamos el modal por código
    setTimeout(() => {
      // ⚠️ IMPORTANTE: Busca en el HTML de tu componente <app-project-edit> qué ID tiene la primera línea (ej: id="editProject" o id="modalCliente")
      const modalElement = document.getElementById('editProject');

      if (modalElement) {
        const modalInstance = new bootstrap.Modal(modalElement, {
          keyboard: true,
          backdrop: true
        });
        modalInstance.show();
        console.log('🚀 [MODAL]: Modal desplegado visualmente con éxito.');
      } else {
        console.error('❌ Error: No se encontró el ID del modal en el HTML. Asegúrate de verificar cómo se llama el id del <div class="modal"> dentro de tu app-project-edit.');
      }
    }, 100);
  }

  onDeleteProject(project: Cliente) {
    this.selectedProject = project;

    Swal.fire({
      title: 'Estas Seguro?',
      text: "No podras recuperarlo!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Borrar!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clienteService.eliminarCliente(project._id).subscribe((resp: any) => {
          this.getProjects();
        })
        Swal.fire(
          'Borrado!',
          'El Archivo fue borrado.',
          'success'
        )
        this.ngOnInit();
      }
    });

  }
  search() {
    // CASO 1: No hay término de búsqueda escrito en el input
    if (!this.query || this.query.trim() === '') {



      // NUEVO Subcaso B: Seleccionó Tipo de Clínica Y Estado al mismo tiempo
      // (Asegúrate de que tu servicio 'searchByCollection' acepte un 4to parámetro para tipoClinica)
      if (this.selectedEstado && this.selectedtipoClinica) {
        this.loading = true;
        return this.busquedasService.searchByCollection('clientes', '', this.selectedEstado, this.selectedtipoClinica)
          .subscribe((resp: any) => {
            this.clientes = resp.resultados || [];
            this.clienteService.emitFilteredClientes(this.clientes);
            this.loading = false;
          });
      }

      // Subcaso C: SÓLO hay tipo de clínica
      else if (this.selectedtipoClinica) {
        // OJO: Si el 3er parámetro es el estado, envía null/vacío antes de la clínica
        this.loading = true;
        return this.busquedasService.searchByCollection('clientes', '', null, this.selectedtipoClinica)
          .subscribe((resp: any) => {
            this.clientes = resp.resultados || [];
            this.clienteService.emitFilteredClientes(this.clientes);
            this.loading = false;
          });
      }

      // Subcaso D: SÓLO hay un estado seleccionado
      else if (this.selectedEstado) {
        this.loading = true;
        return this.busquedasService.searchByCollection('clientes', '', this.selectedEstado)
          .subscribe((resp: any) => {
            this.clientes = resp.resultados || [];
            this.clienteService.emitFilteredClientes(this.clientes);
            this.loading = false;
          });
      }

      // Subcaso E: Sin filtros seleccionados
      else {
        this.ngOnInit();
        return;
      }
    }

    // CASO 2: Sí hay un término de búsqueda en el input de texto
    else {
      this.loading = true; // Buena práctica activar el loading aquí también

      // CORRECCIÓN: Pasamos this.query, luego el estado (si existe) y por último el tipo de clínica
      return this.busquedasService.searchGlobal(this.query, this.selectedEstado, this.selectedtipoClinica)
        .subscribe((resp: any) => {
          // Ajusta 'resp.resultados' o 'resp.projects' según lo que devuelva tu backend en searchGlobal
          let filteredProjects = resp.resultados || resp.clientes || [];

          // Si además tenías el filtro de categoría (selectedType) en el frontend:
          if (this.selectedType) {
            filteredProjects = filteredProjects.filter(
              (project: any) => project.category?.nombre === this.selectedType
            );
          }

          this.clientes = filteredProjects;
          this.clienteService.emitFilteredClientes(filteredProjects);
          this.loading = false;
        }, (error) => {
          this.loading = false;
          console.error(error);
        });
    }

  }







  PageSize() {
    this.query = '';
    this.selectedType = '';
    this.selectedEstado = '';
    this.selectedtipoClinica = '';
    this.ngOnInit();

  }
  openEditModal(): void {
    this.selectedProject = null;
  }

  onCloseModal(): void {
    this.selectedProject = null;

  }

}

