import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Cliente } from 'src/app/models/cliente';

@Component({
    selector: 'app-projectitem',
    templateUrl: './projectitem.component.html',
    styleUrls: ['./projectitem.component.css'],
    standalone: false
})
export class ProjectitemComponent implements OnInit {

  @Input() project: Cliente;
  @Input() showAdminControls: boolean = false;

  @Output() onTogglePresentation = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<Cliente>();
  @Output() onEditProject = new EventEmitter<Cliente>();
  @Output() selectedProject: Cliente;

 
  ngOnInit(): void {
  }

  togglePresentation() {
    this.onTogglePresentation.emit(this.project._id);
  }

  editProject() {
    this.onEdit.emit(this.project._id);
  }

  deleteProject() {
    this.onDelete.emit(this.project);

  }

  openEditModal(project: Cliente): void {
    this.onEditProject.emit(project);
  }

  openPaymentsModal(project: Cliente): void {
    this.selectedProject = project;
    // console.log(project);
  }
}
