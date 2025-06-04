// src/components/Canvas.tsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Shape, ShapeType } from '../types/Shapes';

interface CanvasProps {
  selectedTool: ShapeType | 'select' | 'arrow' | 'text' | 'pen';
  onHistoryChange?: (canUndo: boolean, canRedo: boolean, undoFn: () => void, redoFn: () => void) => void;
}

const Canvas: React.FC<CanvasProps> = ({ selectedTool, onHistoryChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [penPath, setPenPath] = useState<{ x: number; y: number }[]>([]);
  const [history, setHistory] = useState<Shape[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Save state to history
  const saveToHistory = useCallback((newShapes: Shape[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newShapes]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setShapes([...history[newIndex]]);
      setSelectedShapeId(null);
    }
  }, [history, historyIndex]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setShapes([...history[newIndex]]);
      setSelectedShapeId(null);
    }
  }, [history, historyIndex]);

  // Check if undo/redo is available
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Notify parent component about history changes
  useEffect(() => {
    if (onHistoryChange) {
      onHistoryChange(canUndo, canRedo, undo, redo);
    }
  }, [canUndo, canRedo, undo, redo, onHistoryChange]);

  // Handle keyboard events for modifiers and shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(true);
      
      // Handle Ctrl+Z (Undo) and Ctrl+Y (Redo)
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          undo();
        } else if ((e.key === 'y') || (e.key === 'z' && e.shiftKey)) {
          e.preventDefault();
          redo();
        }
      }
      
      // Handle Delete/Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedShapeId) {
          const newShapes = shapes.filter(shape => shape.id !== selectedShapeId);
          setShapes(newShapes);
          saveToHistory(newShapes);
          setSelectedShapeId(null);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedShapeId, shapes, undo, redo, saveToHistory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redrawCanvas();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getMousePos(e);
    setStartX(x);
    setStartY(y);

    if (selectedTool === 'select') {
      // Check if a shape is clicked (reverse order for top-most selection)
      for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (isInsideShape(x, y, shape)) {
          setSelectedShapeId(shape.id);
          setOffset({ x: x - shape.x, y: y - shape.y });
          return;
        }
      }
      setSelectedShapeId(null);
    } else if (selectedTool === 'pen') {
      setIsDrawing(true);
      setPenPath([{ x, y }]);
      const newShape: Shape = {
        id: Date.now().toString(),
        type: 'pen',
        x,
        y,
        path: [{ x, y }],
      };
      setCurrentShape(newShape);
    } else {
      setIsDrawing(true);
      const newShape: Shape = {
        id: Date.now().toString(),
        type: selectedTool as ShapeType,
        x,
        y,
      };
      setCurrentShape(newShape);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { x, y } = getMousePos(e);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Update cursor based on tool
    canvas.style.cursor = getCursorStyle(selectedTool, x, y);

    if (selectedTool === 'select' && selectedShapeId && !isDrawing) {
      // Move the selected shape
      setShapes((prevShapes) =>
        prevShapes.map((shape) =>
          shape.id === selectedShapeId
            ? { ...shape, x: x - offset.x, y: y - offset.y }
            : shape
        )
      );
    } else if (isDrawing && currentShape) {
      let updatedShape = { ...currentShape };
      
      switch (selectedTool) {
        case 'rectangle':
          let width = x - startX;
          let height = y - startY;
          
          // Perfect square when holding Shift
          if (isShiftPressed) {
            const size = Math.max(Math.abs(width), Math.abs(height));
            width = width < 0 ? -size : size;
            height = height < 0 ? -size : size;
          }
          
          updatedShape.width = width;
          updatedShape.height = height;
          break;
          
        case 'circle':
          const radius = Math.hypot(x - startX, y - startY);
          updatedShape.radius = radius;
          break;
          
        case 'line':
          let x2 = x;
          let y2 = y;
          
          // Snap to 45-degree angles when holding Shift
          if (isShiftPressed) {
            const dx = x - startX;
            const dy = y - startY;
            const angle = Math.atan2(dy, dx);
            const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
            const distance = Math.hypot(dx, dy);
            x2 = startX + Math.cos(snapAngle) * distance;
            y2 = startY + Math.sin(snapAngle) * distance;
          }
          
          updatedShape.x2 = x2;
          updatedShape.y2 = y2;
          break;
          
        case 'arrow':
          updatedShape.x2 = x;
          updatedShape.y2 = y;
          break;
          
        case 'pen':
          const newPath = [...penPath, { x, y }];
          setPenPath(newPath);
          updatedShape.path = newPath;
          break;
      }
      
      setCurrentShape(updatedShape);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && currentShape) {
      const newShapes = [...shapes, currentShape];
      setShapes(newShapes);
      saveToHistory(newShapes);
      setCurrentShape(null);
      setIsDrawing(false);
      setPenPath([]);
    } else if (selectedTool === 'select' && selectedShapeId) {
      // Save history when a shape is moved
      saveToHistory(shapes);
    }
    setSelectedShapeId(null);
  };

  const getCursorStyle = (tool: string, x: number, y: number): string => {
    switch (tool) {
      case 'select':
        // Check if hovering over a shape
        for (let i = shapes.length - 1; i >= 0; i--) {
          if (isInsideShape(x, y, shapes[i])) {
            return 'move';
          }
        }
        return 'default';
      case 'pen':
        return 'crosshair';
      case 'text':
        return 'text';
      default:
        return 'crosshair';
    }
  };

  const isInsideShape = (x: number, y: number, shape: Shape): boolean => {
    switch (shape.type) {
      case 'rectangle':
        const width = shape.width || 0;
        const height = shape.height || 0;
        const minX = width < 0 ? shape.x + width : shape.x;
        const maxX = width < 0 ? shape.x : shape.x + width;
        const minY = height < 0 ? shape.y + height : shape.y;
        const maxY = height < 0 ? shape.y : shape.y + height;
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
        
      case 'circle':
        const dx = x - shape.x;
        const dy = y - shape.y;
        return Math.sqrt(dx * dx + dy * dy) <= (shape.radius || 0);
        
      case 'line':
      case 'arrow':
        const distance = pointToLineDistance(
          x, y, shape.x, shape.y, shape.x2 || 0, shape.y2 || 0
        );
        return distance < 8; // Increased tolerance for better UX
        
      case 'pen':
        if (!shape.path) return false;
        for (let i = 0; i < shape.path.length - 1; i++) {
          const dist = pointToLineDistance(
            x, y, 
            shape.path[i].x, shape.path[i].y,
            shape.path[i + 1].x, shape.path[i + 1].y
          );
          if (dist < 8) return true;
        }
        return false;
        
      default:
        return false;
    }
  };

  const pointToLineDistance = (
    x: number, y: number, x1: number, y1: number, x2: number, y2: number
  ): number => {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot / len_sq;

    let xx, yy;
    if (param < 0) {
      xx = x1; yy = y1;
    } else if (param > 1) {
      xx = x2; yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const drawAllShapes = (context: CanvasRenderingContext2D) => {
    shapes.forEach((shape) => drawShape(context, shape, shape.id === selectedShapeId));
  };

  const drawShape = (context: CanvasRenderingContext2D, shape: Shape, isSelected: boolean = false) => {
    context.save();
    
    // Style settings
    context.strokeStyle = isSelected ? '#4285f4' : '#1a1a1a';
    context.lineWidth = isSelected ? 2 : 1.5;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    if (isSelected) {
      context.setLineDash([5, 5]);
    }

    context.beginPath();
    
    switch (shape.type) {
      case 'rectangle':
        context.rect(shape.x, shape.y, shape.width || 0, shape.height || 0);
        break;
        
      case 'circle':
        context.arc(shape.x, shape.y, shape.radius || 0, 0, 2 * Math.PI);
        break;
        
      case 'line':
        context.moveTo(shape.x, shape.y);
        context.lineTo(shape.x2 || shape.x, shape.y2 || shape.y);
        break;
        
      case 'arrow':
        const x2 = shape.x2 || shape.x;
        const y2 = shape.y2 || shape.y;
        
        // Draw line
        context.moveTo(shape.x, shape.y);
        context.lineTo(x2, y2);
        
        // Draw arrowhead
        const angle = Math.atan2(y2 - shape.y, x2 - shape.x);
        const headLength = 15;
        
        context.moveTo(x2, y2);
        context.lineTo(
          x2 - headLength * Math.cos(angle - Math.PI / 6),
          y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        context.moveTo(x2, y2);
        context.lineTo(
          x2 - headLength * Math.cos(angle + Math.PI / 6),
          y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        break;
        
      case 'pen':
        if (shape.path && shape.path.length > 1) {
          context.moveTo(shape.path[0].x, shape.path[0].y);
          for (let i = 1; i < shape.path.length; i++) {
            context.lineTo(shape.path[i].x, shape.path[i].y);
          }
        }
        break;
    }
    
    context.stroke();
    context.restore();
  };

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Clear canvas with light background
    context.fillStyle = '#fafafa';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid (optional - Excalidraw style)
    drawGrid(context, canvas.width, canvas.height);
    
    drawAllShapes(context);
    
    if (currentShape) {
      drawShape(context, currentShape);
    }
  }, [shapes, currentShape, selectedShapeId]);

  const drawGrid = (context: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    context.strokeStyle = '#e5e5e5';
    context.lineWidth = 0.5;
    
    for (let x = 0; x <= width; x += gridSize) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
  };

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ 
          display: 'block',
          background: '#fafafa',
          touchAction: 'none' // Prevent touch scrolling
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          // Stop drawing when mouse leaves canvas
          if (isDrawing) {
            handleMouseUp();
          }
        }}
      />
    </div>
  );
};

export default Canvas;