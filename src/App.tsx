// src/App.tsx or your main component
import React, { useState } from 'react';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';

type ToolType = 'select' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'pen';

const App: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<ToolType>('select');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [undoFunction, setUndoFunction] = useState<(() => void) | null>(null);
  const [redoFunction, setRedoFunction] = useState<(() => void) | null>(null);

  const handleHistoryChange = (
    canUndoState: boolean, 
    canRedoState: boolean, 
    undoFn: () => void, 
    redoFn: () => void
  ) => {
    setCanUndo(canUndoState);
    setCanRedo(canRedoState);
    setUndoFunction(() => undoFn);
    setRedoFunction(() => redoFn);
  };

  const handleUndo = () => {
    if (undoFunction) {
      undoFunction();
    }
  };

  const handleRedo = () => {
    if (redoFunction) {
      redoFunction();
    }
  };

  return (
    <div className="app">
      <Toolbar
        setTool={setSelectedTool}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <Canvas
        selectedTool={selectedTool}
        onHistoryChange={handleHistoryChange}
      />
    </div>
  );
};

export default App;