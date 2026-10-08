import { Cliente } from "./cliente";
import { ProveedorEncontrado } from "./proveedor";

export interface Cotizacion {
  _id?: string;
  clienteId: Cliente | string; // Puede venir el ID suelto o el objeto Populado desde Node
  productoSolicitado: string;
  canalEntrada: 'whatsapp' | 'correo';
  proveedoresEncontrados: ProveedorEncontrado[];
  
  // Campos dinámicos controlados por tus inputs de ganancia en Angular
  porcentajeGanancia: number;
  precioFinalVenta: number;
  proveedorSeleccionadoId?: string;
  
  estado: 'pendiente_analisis' | 'listo_para_enviar' | 'enviado';
  fechaSolicitud?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}