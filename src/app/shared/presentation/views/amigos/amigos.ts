import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-amigos',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './amigos.html',
  styleUrl: './amigos.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AmigosComponent {
  anadirAmigo() {
    // TODO: Implementar lógica para añadir amigo
    console.log('Añadir amigo');
  }
}

