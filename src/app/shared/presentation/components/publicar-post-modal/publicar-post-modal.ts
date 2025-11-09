import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../application/post.service';

@Component({
  selector: 'app-publicar-post-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './publicar-post-modal.html',
  styleUrl: './publicar-post-modal.css'
})
export class PublicarPostModal {
  @Output() close = new EventEmitter<void>();
  @Output() postPublished = new EventEmitter<void>();
  
  private postService = inject(PostService);

  textoPublicacion = '';
  
  // Archivos multimedia seleccionados
  fotosSeleccionadas: File[] = [];
  imagenesPreview: string[] = []; // URLs base64 para preview
  
  // Etiquetas detectadas
  etiquetas: string[] = [];

  closeModal() {
    this.limpiarFormulario();
    this.close.emit();
  }

  limpiarFormulario() {
    this.textoPublicacion = '';
    this.fotosSeleccionadas = [];
    this.imagenesPreview = [];
    this.etiquetas = [];
  }

  detectarEtiquetas() {
    // Detectar hashtags en el texto (#palabra)
    const hashtagRegex = /#(\w+)/g;
    const matches = this.textoPublicacion.matchAll(hashtagRegex);
    const etiquetasEncontradas = new Set<string>();
    
    for (const match of matches) {
      const etiqueta = match[1].toLowerCase(); // Convertir a minúsculas para consistencia
      if (etiqueta.length > 0) {
        etiquetasEncontradas.add(etiqueta);
      }
    }
    
    this.etiquetas = Array.from(etiquetasEncontradas);
  }

  eliminarEtiqueta(etiqueta: string) {
    // Eliminar la etiqueta del array
    this.etiquetas = this.etiquetas.filter(e => e !== etiqueta);
    
    // Eliminar el hashtag del texto (todas las ocurrencias)
    const regex = new RegExp(`#${etiqueta}\\b`, 'gi');
    this.textoPublicacion = this.textoPublicacion.replace(regex, '');
    
    // Re-detectamos las etiquetas restantes
    this.detectarEtiquetas();
  }

  async agregarFoto(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.fotosSeleccionadas = Array.from(files);
      
      // Convertir imágenes a base64 para preview y almacenamiento
      this.imagenesPreview = [];
      for (const file of this.fotosSeleccionadas) {
        if (file.type.startsWith('image/')) {
          const base64 = await this.fileToBase64(file);
          this.imagenesPreview.push(base64);
        }
      }
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  etiquetarPatrocinador() {
    // TODO: Implementar funcionalidad de etiquetar patrocinador
    console.log('Etiquetar patrocinador');
  }

  eliminarImagen(index: number) {
    this.fotosSeleccionadas.splice(index, 1);
    this.imagenesPreview.splice(index, 1);
  }

  async publicar() {
    // Validar que haya al menos texto o imágenes
    const tieneTexto = this.textoPublicacion.trim().length > 0;
    const tieneImagenes = this.imagenesPreview.length > 0;

    if (!tieneTexto && !tieneImagenes) {
      alert('Debes agregar texto o al menos una imagen para publicar');
      return;
    }

    // Asegurar que las etiquetas estén actualizadas
    this.detectarEtiquetas();

    // Publicar el post con etiquetas
    try {
      await this.postService.publicarPost(
        this.textoPublicacion.trim(),
        this.imagenesPreview,
        undefined,
        this.etiquetas
      );

      // Emitir evento y cerrar modal
      this.postPublished.emit();
      this.closeModal();
    } catch (error) {
      console.error('Error al publicar:', error);
      alert('No se pudo publicar el post. Inténtalo nuevamente.');
    }
  }
}

