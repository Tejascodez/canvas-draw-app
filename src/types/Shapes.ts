// src/types/Shape.ts
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'select' | 'arrow' | 'pen' | 'text';

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  x2?: number;
  y2?: number;
path?: { x: number; y: number }[];
}
