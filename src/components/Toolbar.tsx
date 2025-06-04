// src/components/Toolbar.tsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowPointer, faQuestionCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { CropSquare, RadioButtonUnchecked, ShowChart, ArrowForward, Create, Crop } from '@mui/icons-material';

type ToolType = 'select' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'pen';

interface ToolbarProps {
  setTool: (tool: ToolType) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  setTool, 
  onUndo, 
  onRedo, 
  canUndo = false, 
  canRedo = false 
}) => {
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [showTutorial, setShowTutorial] = useState(false);

  const handleToolSelect = (tool: ToolType) => {
    setActiveTool(tool);
    setTool(tool);
  };

  const handleUndo = () => {
    if (canUndo && onUndo) {
      onUndo();
    }
  };

  const handleRedo = () => {
    if (canRedo && onRedo) {
      onRedo();
    }
  };

  const tools: { id: ToolType; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon:<FontAwesomeIcon icon={faArrowPointer} />, label: 'Select' },
    { id: 'rectangle', icon: <CropSquare />, label: 'Rectangle' },
    { id: 'circle', icon: <RadioButtonUnchecked />, label: 'Circle' },
    { id: 'line', icon: <ShowChart />, label: 'Line' },
    { id: 'arrow', icon: <ArrowForward />, label: 'Arrow' },
    { id: 'pen', icon: <Create />, label: 'Draw' },
  ];

  return (
    <>
      <div className="toolbar-container">
        <div className="toolbar">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`tool-button ${activeTool === tool.id ? 'active' : ''}`}
              onClick={() => handleToolSelect(tool.id)}
              title={tool.label}
            >
              <span className="tool-icon">{tool.icon}</span>
            </button>
          ))}
          
          <div className="toolbar-divider" />
          
          {/* Undo/Redo controls */}
          <button 
            className={`tool-button ${!canUndo ? 'disabled' : ''}`}
            onClick={handleUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <span className="tool-icon">↶</span>
          </button>
          <button 
            className={`tool-button ${!canRedo ? 'disabled' : ''}`}
            onClick={handleRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <span className="tool-icon">↷</span>
          </button>
        </div>
      </div>

      {/* Tutorial Button - Top Right */}
      <div className="tutorial-button-container">
        <button 
          className="tutorial-button"
          onClick={() => setShowTutorial(true)}
          title="Tutorial"
        >
          <FontAwesomeIcon icon={faQuestionCircle} />
        </button>
      </div>

      {/* GitHub Icon - Bottom Right */}
      <div className="github-container">
        <a 
          href="https://github.com/Tejascodez" 
          target="_blank" 
          rel="noopener noreferrer"
          className="github-link"
          title="Made by @Tejascodez"
        >
          <FontAwesomeIcon icon={faGithub} />
        </a>
      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="modal-overlay" onClick={() => setShowTutorial(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tutorial</h2>
              <button 
                className="close-button"
                onClick={() => setShowTutorial(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              <div className="tutorial-section">
                <h3>Getting Started</h3>
                <p>Welcome to the drawing tool! Here's how to use each feature:</p>
              </div>
              
              <div className="tutorial-section">
                <h3>Tools</h3>
                <div className="tool-guide">
                  <div className="tool-item">
                    <FontAwesomeIcon icon={faArrowPointer} />
                    <span><strong>Select:</strong> Click and drag to select objects</span>
                  </div>
                  <div className="tool-item">
                    <CropSquare />
                    <span><strong>Rectangle:</strong> Click and drag to draw rectangles</span>
                  </div>
                  <div className="tool-item">
                    <RadioButtonUnchecked />
                    <span><strong>Circle:</strong> Click and drag to draw circles</span>
                  </div>
                  <div className="tool-item">
                    <ShowChart />
                    <span><strong>Line:</strong> Click and drag to draw straight lines</span>
                  </div>
                  <div className="tool-item">
                    <ArrowForward />
                    <span><strong>Arrow:</strong> Click and drag to draw arrows</span>
                  </div>
                  <div className="tool-item">
                    <Create />
                    <span><strong>Draw:</strong> Free-hand drawing tool</span>
                  </div>
                </div>
              </div>
              
              <div className="tutorial-section">
                <h3>Shortcuts</h3>
                <div className="shortcuts">
                  <div className="shortcut-item">
                    <kbd>Ctrl+Z</kbd>
                    <span>Undo last action</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Ctrl+Y</kbd>
                    <span>Redo last action</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .toolbar-container {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
        }

        .toolbar {
          display: flex;
          align-items: center;
          gap: 2px;
          padding: 8px;
          background: #ffffff;
          border: 1px solid #e1e5e9;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(0, 0, 0, 0.05);
        }

        .tool-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
          outline: none;
        }

        .tool-button:hover:not(.disabled) {
          background: #f8f9fa;
          transform: translateY(-1px);
        }

        .tool-button:active:not(.disabled) {
          transform: translateY(0);
          background: #e9ecef;
        }

        .tool-button.active {
          background: #5f6368;
          color: white;
          box-shadow: 
            0 2px 8px rgba(95, 99, 104, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.2);
        }

        .tool-button.active:hover {
          background: #4a4d52;
          transform: translateY(-1px);
        }

        .tool-button.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          color: #9aa0a6;
        }

        .tool-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          color: #9aa0a6;
        }

        .tool-button.disabled:hover,
        .tool-button:disabled:hover {
          background: transparent;
          transform: none;
        }

        .tool-icon {
          font-size: 16px;
          font-weight: 500;
          line-height: 1;
          user-select: none;
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: #e1e5e9;
          margin: 0 6px;
        }

        /* Tutorial Button - Top Right */
        .tutorial-button-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }

        .tutorial-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border: none;
          border-radius: 50%;
          background: #4285f4;
          color: white;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
          font-size: 18px;
        }

        .tutorial-button:hover {
          background: #3367d6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.4);
        }

        .tutorial-button:active {
          transform: translateY(0);
        }

        /* GitHub Container - Bottom Right */
        .github-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .github-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #24292f;
          color: white;
          text-decoration: none;
          transition: all 0.15s ease;
          box-shadow: 0 2px 8px rgba(36, 41, 47, 0.3);
          font-size: 20px;
        }

        .github-link:hover {
          background: #1c2128;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(36, 41, 47, 0.4);
          color: white;
        }

        .credit-text {
          font-size: 12px;
          color: #666;
          text-align: center;
          background: rgba(255, 255, 255, 0.9);
          padding: 4px 8px;
          border-radius: 12px;
          backdrop-filter: blur(10px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          white-space: nowrap;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0;
          border-bottom: 1px solid #e1e5e9;
          margin-bottom: 24px;
        }

        .modal-header h2 {
          margin: 0;
          color: #202124;
          font-size: 24px;
          font-weight: 600;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 18px;
          color: #5f6368;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.15s ease;
        }

        .close-button:hover {
          background: #f8f9fa;
          color: #202124;
        }

        .modal-body {
          padding: 0 24px 24px;
        }

        .tutorial-section {
          margin-bottom: 24px;
        }

        .tutorial-section h3 {
          margin: 0 0 12px 0;
          color: #202124;
          font-size: 18px;
          font-weight: 600;
        }

        .tutorial-section p {
          margin: 0 0 16px 0;
          color: #5f6368;
          line-height: 1.5;
        }

        .tool-guide {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tool-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .tool-item svg {
          width: 20px;
          height: 20px;
          color: #5f6368;
        }

        .shortcuts {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .shortcut-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        kbd {
          background: #f1f3f4;
          border: 1px solid #dadce0;
          border-radius: 4px;
          padding: 4px 8px;
          font-family: monospace;
          font-size: 12px;
          color: #202124;
        }

        /* Tooltip enhancement */
        .tool-button::before {
          content: attr(title);
          position: absolute;
          bottom: -35px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          z-index: 1001;
        }

        .tool-button:hover::before:not(.disabled) {
          opacity: 1;
        }

        .tutorial-button::before {
          content: attr(title);
          position: absolute;
          bottom: -35px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          z-index: 1001;
        }

        .tutorial-button:hover::before {
          opacity: 1;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .toolbar-container {
            top: 10px;
            left: 10px;
            right: 10px;
            transform: none;
          }
          
          .toolbar {
            justify-content: space-between;
            padding: 6px;
          }
          
          .tool-button {
            width: 36px;
            height: 36px;
          }
          
          .tool-icon {
            font-size: 14px;
          }

          .tutorial-button-container {
            top: 10px;
            right: 10px;
          }

          .tutorial-button {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }

          .github-container {
            bottom: 10px;
            right: 10px;
          }

          .github-link {
            width: 40px;
            height: 40px;
            font-size: 18px;
          }

          .credit-text {
            font-size: 10px;
          }

          .modal-content {
            margin: 20px;
            width: calc(100% - 40px);
          }

          .modal-header,
          .modal-body {
            padding-left: 16px;
            padding-right: 16px;
          }
        }

        /* Keyboard focus styles */
        .tool-button:focus-visible,
        .tutorial-button:focus-visible,
        .github-link:focus-visible {
          outline: 2px solid #4285f4;
          outline-offset: 2px;
        }
      `}</style>

    </>
  );
};

export default Toolbar;