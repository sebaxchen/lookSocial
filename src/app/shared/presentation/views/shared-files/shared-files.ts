import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../application/auth.service';
import { TeamService } from '../../../application/team.service';
import { GroupColorsService } from '../../../application/group-colors.service';
import { GroupsService } from '../../../application/groups.service';
import { ConfirmDeleteTaskModal } from '../../components/confirm-delete-task-modal/confirm-delete-task-modal';
import { EmptyStateComponent } from '../../components/empty-state/empty-state';

export interface SharedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedDate: Date;
  url?: string;
  sharedWithMembers?: string[];
  sharedWithGroups?: string[];
}

@Component({
  selector: 'app-shared-files',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    EmptyStateComponent
  ],
  templateUrl: './shared-files.html',
  styleUrl: './shared-files.css'
})
export class SharedFilesComponent {
  authService = inject(AuthService);
  teamService = inject(TeamService);
  groupColorsService = inject(GroupColorsService);
  groupsService = inject(GroupsService);
  private dialog = inject(MatDialog);
  files = signal<SharedFile[]>([]);
  isUploadDialogOpen = signal(false);
  selectedFiles = signal<File[]>([]);
  isUploading = signal(false);
  isShareDialogOpen = signal(false);
  selectedFileId = signal<string | null>(null);
  selectedTeamMembers = signal<string[]>([]);
  selectedGroups = signal<string[]>([]);
  availableMembers = signal<any[]>([]);
  availableGroups = signal<any[]>([]);
  isDragOver = signal(false);

  constructor() {
    this.loadFiles();
    this.loadTeamData();
  }

  loadFiles() {
    const savedFiles = localStorage.getItem('sharedFiles');
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles).map((file: any) => ({
          ...file,
          uploadedDate: new Date(file.uploadedDate),
          sharedWithMembers: Array.isArray(file.sharedWithMembers) ? file.sharedWithMembers : [],
          sharedWithGroups: Array.isArray(file.sharedWithGroups) ? file.sharedWithGroups : []
        }));
        this.files.set(parsedFiles);
      } catch (error) {
        console.error('Error loading files:', error);
        this.files.set([]);
      }
    }
  }

  openUploadDialog() {
    this.isUploadDialogOpen.set(true);
  }

  closeUploadDialog() {
    this.isUploadDialogOpen.set(false);
    this.selectedFiles.set([]);
  }

  onFileSelected(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles.set(files);
  }

  uploadFiles() {
    if (this.selectedFiles().length === 0) return;

    this.isUploading.set(true);

    setTimeout(() => {
      const newFiles: SharedFile[] = this.selectedFiles().map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        uploadedBy: this.authService.getUserName(),
        uploadedDate: new Date(),
        sharedWithMembers: [],
        sharedWithGroups: []
      }));

      const allFiles = [...this.files(), ...newFiles];
      this.files.set(allFiles);
      this.saveFiles();
      
      this.isUploading.set(false);
      this.closeUploadDialog();
    }, 1000);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    
    const files = Array.from(event.dataTransfer?.files || []);
    if (files.length > 0) {
      this.selectedFiles.set(files);
      this.uploadFiles();
    }
  }

  saveFiles() {
    localStorage.setItem('sharedFiles', JSON.stringify(this.files()));
  }

  deleteFile(fileId: string) {
    const file = this.files().find(f => f.id === fileId);
    if (!file) return;

    const dialogRef = this.dialog.open(ConfirmDeleteTaskModal, {
      width: '400px',
      maxWidth: '90vw',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data: { taskTitle: file.name, itemType: 'Archivo' }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        const updated = this.files().filter(f => f.id !== fileId);
        this.files.set(updated);
        this.saveFiles();
      }
    });
  }

  downloadFile(file: SharedFile) {
    // Simulate download
    console.log('Downloading file:', file.name);
  }

  openShareDialog(fileId: string) {
    this.loadTeamData();
    this.selectedFileId.set(fileId);
    this.isShareDialogOpen.set(true);
    const file = this.files().find(f => f.id === fileId);
    if (file) {
      this.selectedTeamMembers.set(file.sharedWithMembers ? [...file.sharedWithMembers] : []);
      this.selectedGroups.set(file.sharedWithGroups ? [...file.sharedWithGroups] : []);
    } else {
      this.selectedTeamMembers.set([]);
      this.selectedGroups.set([]);
    }
  }

  closeShareDialog() {
    this.isShareDialogOpen.set(false);
    this.selectedFileId.set(null);
    this.selectedTeamMembers.set([]);
    this.selectedGroups.set([]);
  }

  loadTeamData() {
    // Load members from TeamService
    this.availableMembers.set(this.teamService.allMembers());
    
    // Load groups from GroupsService
    const groups = this.groupsService.getAllGroups();
    this.availableGroups.set(groups());
  }

  toggleMember(memberName: string) {
    const members = this.selectedTeamMembers();
    if (members.includes(memberName)) {
      this.selectedTeamMembers.set(members.filter(m => m !== memberName));
    } else {
      this.selectedTeamMembers.set([...members, memberName]);
    }
  }

  toggleGroup(groupName: string) {
    const groups = this.selectedGroups();
    if (groups.includes(groupName)) {
      this.selectedGroups.set(groups.filter(g => g !== groupName));
    } else {
      this.selectedGroups.set([...groups, groupName]);
    }
  }

  saveShareSettings() {
    const fileId = this.selectedFileId();
    if (!fileId) return;

    const members = [...this.selectedTeamMembers()];
    const groups = [...this.selectedGroups()];
    
    // Actualizar el archivo en el array
    const allFiles = [...this.files()];
    const fileIndex = allFiles.findIndex(f => f.id === fileId);
    
    if (fileIndex !== -1) {
      allFiles[fileIndex] = {
        ...allFiles[fileIndex],
        sharedWithMembers: members,
        sharedWithGroups: groups
      };
      this.files.set(allFiles);
      this.saveFiles();
    }
    
    this.closeShareDialog();
  }

  isSharedWith(file: SharedFile, memberName: string): boolean {
    return file.sharedWithMembers?.includes(memberName) || false;
  }

  isSharedWithGroup(file: SharedFile, groupName: string): boolean {
    return file.sharedWithGroups?.includes(groupName) || false;
  }

  hasShares(file: SharedFile): boolean {
    const hasMembers = !!(file.sharedWithMembers && file.sharedWithMembers.length > 0);
    const hasGroups = !!(file.sharedWithGroups && file.sharedWithGroups.length > 0);
    return hasMembers || hasGroups;
  }

  getSharedMembers(file: SharedFile): string[] {
    return file.sharedWithMembers || [];
  }

  getSharedGroups(file: SharedFile): string[] {
    return file.sharedWithGroups || [];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(type: string): string {
    if (type.includes('image')) return 'image';
    if (type.includes('pdf')) return 'picture_as_pdf';
    if (type.includes('word') || type.includes('document')) return 'description';
    if (type.includes('excel') || type.includes('spreadsheet')) return 'table_chart';
    if (type.includes('presentation')) return 'slideshow';
    if (type.includes('video')) return 'videocam';
    if (type.includes('audio')) return 'audiotrack';
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return 'archive';
    return 'insert_drive_file';
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // Método para obtener el color de un miembro
  getMemberColor(memberName: string): string {
    return this.teamService.getMemberColor(memberName);
  }

  // Método para obtener el color de un grupo
  getGroupColor(groupName: string): string {
    return this.groupColorsService.getGroupColor(groupName);
  }

  // Método para obtener las iniciales de un grupo (primeras letras de cada palabra)
  getGroupInitials(groupName: string): string {
    return groupName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  // Drag and Drop handlers
  draggedFileId: string | null = null;
  dragOverTrash = false;
  private dragStartPosition: { x: number; y: number } | null = null;

  onDragStart(event: DragEvent, fileId: string): void {
    this.draggedFileId = fileId;
    this.dragStartPosition = { x: event.clientX, y: event.clientY };
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', fileId);
    }
    
    const button = event.currentTarget as HTMLElement;
    const card = button.closest('.file-card') as HTMLElement;
    
    if (card) {
      card.classList.add('dragging');
      card.style.opacity = '0.85';
      card.style.zIndex = '1000';
    }
    
    if (button) {
      button.classList.add('dragging-handle');
      button.style.opacity = '1';
    }
    
    event.stopPropagation();
  }

  onDragEnd(event: DragEvent): void {
    const button = event.currentTarget as HTMLElement;
    const card = button.closest('.file-card') as HTMLElement;
    
    if (card) {
      card.classList.remove('dragging');
      card.classList.add('dropped');
      
      setTimeout(() => {
        card.classList.remove('dropped');
        card.style.opacity = '1';
        card.style.zIndex = '';
        card.style.transform = '';
      }, 300);
    }
    
    if (button) {
      button.classList.remove('dragging-handle');
      button.style.opacity = '';
    }
    
    this.draggedFileId = null;
    this.dragStartPosition = null;
  }

  // Trash button drag and drop handlers
  onTrashDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverTrash = true;
  }

  onTrashDragLeave(event: DragEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;
    const currentTarget = event.currentTarget as HTMLElement;
    
    if (!currentTarget.contains(relatedTarget)) {
      this.dragOverTrash = false;
    }
  }

  onTrashDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Guardar el ID antes de resetear las variables
    const fileIdToDelete = this.draggedFileId;
    
    // Resetear variables de drag
    this.draggedFileId = null;
    this.dragOverTrash = false;
    this.dragStartPosition = null;
    
    if (fileIdToDelete) {
      const file = this.files().find(f => f.id === fileIdToDelete);
      if (file) {
        // Eliminar el archivo directamente
        this.deleteFile(fileIdToDelete);
      }
    }
  }
}

