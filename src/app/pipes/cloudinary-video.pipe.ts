import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'cloudinaryVideo',
  standalone: false
})
export class CloudinaryVideoPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(url: string): SafeResourceUrl {
    if (!url) return '';

    let urlOptimizada = url;

    // 🚀 INYECCIÓN INTELIGENTE DE PARÁMETROS:
    // Si la URL es de Cloudinary y no tiene ya las etiquetas de auto-optimización, se las agregamos
    if (url.includes('://cloudinary.com') && !url.includes('f_auto')) {
      // Reemplazamos la sección '/upload/' por '/upload/f_auto,q_auto/'
      urlOptimizada = url.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    // 🛡️ BYPASS DE SEGURIDAD:
    // Le indicamos a Angular que confíe plenamente en esta URL para inyectarla en la vista
    return this.sanitizer.bypassSecurityTrustResourceUrl(urlOptimizada);
  }

}
