export interface ProveedorEncontrado {
  _id?: string;
  nombreProveedor: string;
  precioCosto: number;
  urlOrigen?: string;
  contactoProveedor?: string;
  
  // 🔥 NUEVOS CAMPOS DINÁMICOS: Permiten cálculos individuales por fila de proveedor en la UI
  porcentajeGanancia?: number;
  precioVentaFinal?: number;
}