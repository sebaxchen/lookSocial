import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MemberColorsService {
  private colorPalette = [
    '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe',
    '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea',
    '#fed6e3', '#ffecd2', '#fcb69f', '#ff9a9e', '#fecfef',
    '#fad0c4', '#ffd1ff', '#a1c4fd', '#c2e9fb', '#ffecd2'
  ];

  private memberColors = new Map<string, string>();

  getMemberColor(memberName: string): string {
    if (this.memberColors.has(memberName)) {
      return this.memberColors.get(memberName)!;
    }

    // Generate consistent color based on name
    const hash = this.hashString(memberName);
    const colorIndex = hash % this.colorPalette.length;
    const color = this.colorPalette[colorIndex];
    
    this.memberColors.set(memberName, color);
    return color;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

