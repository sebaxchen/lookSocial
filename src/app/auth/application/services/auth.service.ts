import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../domain/entities/user.entity';
import { TeamService } from '../../../team/application/services/team.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = signal<User | null>(null);
  private isAuthenticated = signal(false);
  private teamService = inject(TeamService);

  constructor(private router: Router) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      this.addUserToTeamIfNeeded(user);
    }
  }

  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  getIsAuthenticated() {
    return this.isAuthenticated.asReadonly();
  }

  async login(email: string, password: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      const user: User = {
        id: '1',
        name: email.split('@')[0],
        email: email,
        role: 'Usuario'
      };
      
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.addUserToTeamIfNeeded(user);
      return true;
    }
    
    return false;
  }

  async register(name: string, email: string, password: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingUser = localStorage.getItem('currentUser');
    if (existingUser) {
      const user = JSON.parse(existingUser);
      if (user.email === email) {
        return false;
      }
    }
    
    const user: User = {
      id: Date.now().toString(),
      name: name,
      email: email,
      role: 'Usuario'
    };
    
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.addUserToTeamIfNeeded(user);
    return true;
  }

  logout() {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  getUserName(): string {
    return this.currentUser()?.name || 'Usuario';
  }

  getUserEmail(): string {
    return this.currentUser()?.email || '';
  }

  getUserRole(): string {
    return this.currentUser()?.role || 'Usuario';
  }

  getUserInitials(): string {
    const name = this.getUserName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  private addUserToTeamIfNeeded(user: User) {
    const membersSignal = this.teamService.allMembers;
    const existingMembers = membersSignal();
    const userExists = existingMembers.some(member => member.name === user.name);
    
    if (!userExists) {
      const teamMember = {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        avatar: '',
        joinDate: new Date()
      };
      
      this.teamService.addMember(teamMember).catch(err => {
        console.error('Error adding user to team:', err);
      });
    }
  }
}

