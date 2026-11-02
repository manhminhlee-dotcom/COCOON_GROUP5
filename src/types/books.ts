/**
 * Type definitions for books and interaction states.
 */

export interface HeroBookData {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  year: number;
  bay: number; // 0 to 3
  shelf: number; // 0 to 6
  slotIndex: number; // Position on shelf
  synopsis: string;
  excerpt: string;
  accentColor: string; // Hex color for book cover
  foilColor: string; // Gold or silver foil
  height: number; // Book height in meters (e.g. 0.22 to 0.26)
  depth: number; // Book depth/width in meters (e.g. 0.15 to 0.18)
  thickness: number; // Book thickness in meters (e.g. 0.026 to 0.045)
  style: 'classic-leather' | 'cloth-embossed' | 'modern-vintage';
}

export type BookInteractionState = 'idle' | 'hover' | 'pulling' | 'held' | 'returning';

export interface BookTransform {
  position: [number, number, number];
  rotation: [number, number, number]; // Euler angles
  scale: [number, number, number];
}

export interface NeighborReaction {
  leftBookIndex?: number;
  rightBookIndex?: number;
  leanAngle: number; // Lean angle in radians
  shiftDistance: number; // Shift along shelf in meters
}
