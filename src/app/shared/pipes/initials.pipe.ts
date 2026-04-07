// src/app/shared/pipes/initials.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(name: string | null | undefined): string {
    if (!name) return '?';
    
    // Remove "Mentor #" or "User #" prefix if exists
    const cleanName = name.replace(/^(Mentor|User)\s*#\d+/i, '').trim();
    if (!cleanName) return '?';
    
    const parts = cleanName.split(/\s+/);
    
    if (parts.length === 1) {
      // Single name: "Kartik" → "K"
      return parts[0][0]?.toUpperCase() || '?';
    }
    
    // Multiple names: "Kartik Sharma" → "KS"
    const first = parts[0][0]?.toUpperCase() || '';
    const last = parts[parts.length - 1][0]?.toUpperCase() || '';
    
    return `${first}${last}`;
  }
}