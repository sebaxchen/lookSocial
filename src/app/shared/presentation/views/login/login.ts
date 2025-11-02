import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../application/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButton,
    MatIcon,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = signal('');
  password = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onLogin() {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor completa todos los campos');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const success = await this.authService.login(this.email(), this.password());
      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.errorMessage.set('Credenciales incorrectas');
      }
    } catch (error) {
      this.errorMessage.set('Error al iniciar sesión');
    } finally {
      this.isLoading.set(false);
    }
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }

  goToLanding() {
    this.router.navigate(['/']);
  }
}
