export interface NotificacionCampana {
  _id?: string;
  titulo: string;
  mensaje: string;
  leido: boolean;
  tipo: 'SOLICITUD_ENTRANTE' | 'ANALISIS_COMPLETADO' | 'PROPUESTA_ENVIADA' | 'ERROR_SISTEMA';
  referenciaCotizacionId?: string | null; // ID para redirigir al usuario al hacer click
  createdAt?: Date;
  updatedAt?: Date;
}