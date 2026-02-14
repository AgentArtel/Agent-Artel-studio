import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GridBackground } from './GridBackground';
import { ZoomControls } from './ZoomControls';
import { MiniMap } from './MiniMap';
import type { NodeData, Connection } from '@/types';

interface CanvasProps {
  nodes: NodeData[];
  connections: Connection[];
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  onNodeMove: (nodeId: string, position: { x: number; y: number }) => void;
  onConnectionStart: (nodeId: string, portId: string) => void;
  onConnectionEnd: (nodeId: string, portId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  connections: _connections,
  selectedNodeId: _selectedNodeId,
  onNodeSelect: _onNodeSelect,
  onNodeMove: _onNodeMove,
  onConnectionStart: _onConnectionStart,
  onConnectionEnd: _onConnectionEnd,
  children,
  className = '',
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  }, [transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      }));
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setTransform(prev => ({
        ...prev,
        scale: Math.min(Math.max(prev.scale * delta, 0.1), 3),
      }));
    }
  }, []);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, 3),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, 0.1),
    }));
  }, []);

  const handleFitToView = useCallback(() => {
    if (nodes.length === 0) {
      setTransform({ x: 0, y: 0, scale: 1 });
      return;
    }
    
    const minX = Math.min(...nodes.map(n => n.position.x));
    const maxX = Math.max(...nodes.map(n => n.position.x + 240));
    const minY = Math.min(...nodes.map(n => n.position.y));
    const maxY = Math.max(...nodes.map(n => n.position.y + 200));
    
    const canvasWidth = canvasRef.current?.clientWidth || 800;
    const canvasHeight = canvasRef.current?.clientHeight || 600;
    
    const contentWidth = maxX - minX + 100;
    const contentHeight = maxY - minY + 100;
    
    const scale = Math.min(
      (canvasWidth - 100) / contentWidth,
      (canvasHeight - 100) / contentHeight,
      1.5
    );
    
    setTransform({
      x: (canvasWidth - contentWidth * scale) / 2 - minX * scale + 50,
      y: (canvasHeight - contentHeight * scale) / 2 - minY * scale + 50,
      scale,
    });
  }, [nodes]);

  // Global mouse up for panning
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsPanning(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div 
      ref={canvasRef}
      className={`relative w-full h-full overflow-hidden bg-dark cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      <GridBackground />
      
      {/* Transform container */}
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transition: isPanning ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {children}
      </div>

      {/* Zoom Controls */}
      <ZoomControls
        scale={transform.scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitToView={handleFitToView}
      />

      {/* MiniMap */}
      <MiniMap
        nodes={nodes}
        transform={transform}
        canvasRef={canvasRef}
      />
    </div>
  );
};
