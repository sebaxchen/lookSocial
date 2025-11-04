import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GroupColorsService {
  private colorPalette = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe',
    '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea'
  ];

  private groupColors = new Map<string, string>();

  getGroupColor(groupName: string): string {
    if (this.groupColors.has(groupName)) {
      return this.groupColors.get(groupName)!;
    }

    const hash = this.hashString(groupName);
    const colorIndex = hash % this.colorPalette.length;
    const color = this.colorPalette[colorIndex];
    
    this.groupColors.set(groupName, color);
    return color;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

