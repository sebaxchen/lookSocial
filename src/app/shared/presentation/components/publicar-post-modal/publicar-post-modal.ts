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

  closeModal() {
    this.limpiarFormulario();
    this.close.emit();
  }

  limpiarFormulario() {
    this.textoPublicacion = '';
    this.fotosSeleccionadas = [];
    this.imagenesPreview = [];
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

  publicar() {
    // Validar que haya al menos texto o imágenes
    const tieneTexto = this.textoPublicacion.trim().length > 0;
    const tieneImagenes = this.imagenesPreview.length > 0;

    if (!tieneTexto && !tieneImagenes) {
      alert('Debes agregar texto o al menos una imagen para publicar');
      return;
    }

    // Publicar el post
    this.postService.publicarPost(
      this.textoPublicacion.trim(),
      this.imagenesPreview
    );

    // Emitir evento y cerrar modal
    this.postPublished.emit();
    this.closeModal();
  }
}

