import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EscapeHtmlPipe } from './keep-html.pipe';
import { SafePipe } from './safe.pipe';
import { CloudinaryVideoPipe } from './cloudinary-video.pipe';



@NgModule({
  declarations: [
    EscapeHtmlPipe,
    SafePipe,
    CloudinaryVideoPipe
  ],
  exports: [
    EscapeHtmlPipe,
    SafePipe,
    CloudinaryVideoPipe
  ],
  imports: [
    CommonModule,
  ]
})
export class PipesModule { }
