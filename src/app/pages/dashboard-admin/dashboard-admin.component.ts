import { Component, Input, OnInit } from '@angular/core';
import { Cliente } from 'src/app/models/cliente';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ClienteService } from 'src/app/services/cliente.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-dashboard-admin',
    templateUrl: './dashboard-admin.component.html',
    styleUrls: ['./dashboard-admin.component.css'],
    standalone: false
})
export class DashboardAdminComponent implements OnInit {
  @Input() clientes: Cliente[] = [];

  title = 'Panel Administrativo';
  public user: any;
  public profile: User;
  displaycomponent: string = 'none';
  limit = 3;

  error: string;
  uid:string;

  usuarios: User;
  usuario: User;
  query:string ='';
  selectedProject:Cliente;
  projectSeleccionado:Cliente;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private clienteService: ClienteService,
    

  ) {
    this.user = authService.getLocalStorage();
  }

  ngOnInit(): void {

    window.scrollTo(0,0);
    this.authService.closeMenu();
    this.uid = this.user.uid;
    this.getProjectsData();
    this.subscribeToFilteredProjects();
  }

  getProjectsData(){
    this.clienteService.obtenerClientes().subscribe((resp:any)=>{
      this.clientes = resp;
    })
  }

  onEditProject(project: Cliente) {
    this.selectedProject = project;
  }
  onDeleteProject(project: Cliente) {
    this.selectedProject = project;
  }

  subscribeToFilteredProjects() {
    this.clienteService.filteredClientes$.subscribe((filteredProjects: Cliente[]) => {
      if (filteredProjects && filteredProjects.length > 0) {
        this.clientes = filteredProjects;
      } else {
        this.getProjectsData();
      }
    });
  }


  openEditModal(): void {
    this.selectedProject = null;
  }

  onCloseModal(): void {
    this.projectSeleccionado = null;
  }

  PageSize() {
    this.getProjectsData();

  }
  
}
