import { ArticuloSolicitado } from "./articuloSolicitado";
import { Cliente } from "./cliente";
import { ProveedorEncontrado } from "./proveedor";
// Importamos la nueva interfaz del desglose

export interface Cotizacion {
  _id?: string;
  clienteId: Cliente | string; 
  productoSolicitado: string;
  
  // 🔥 NUEVO CAMPO: Mapea el despiece exacto de Gemini de múltiples productos
  articulosDetallados: ArticuloSolicitado[]; 
  tituloAsunto: string; 
  fechaRecepcionOriginal: Date; 
  
  canalEntrada: 'whatsapp' | 'correo';
  proveedoresEncontrados: ProveedorEncontrado[];
  
  // Campos dinámicos controlados por tus inputs de ganancia en Angular
  porcentajeGanancia: number;
  precioFinalVenta: number;
  proveedorSeleccionadoId?: string;
  
  // Propiedad auxiliar opcional que inicializamos en el TS para saber cuál fila está activa
  proveedorSeleccionadoObj?: ProveedorEncontrado | null;
  
  estado: 'pendiente_analisis' | 'listo_para_enviar' | 'enviado';
  fechaSolicitud?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
