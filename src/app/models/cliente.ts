export interface Cliente {
  _id?: string;          // Generado automáticamente por MongoDB
  nombre: string;
  empresa: string;
  telefono?: string;
  correo?: string;
  fechaRegistro?: Date;
}