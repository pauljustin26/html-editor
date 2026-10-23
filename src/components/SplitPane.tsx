import { useState, useRef, useCallback, useEffect } from 'react';

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultSplit?: number;
  minLeft?: number;
  minRight?: number;
}

export function SplitPane({ left, right, defaultSplit = 50, minLeft = 200, minRight = 200 }: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPercent, setSplitPercent] = useState(defaultSplit);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const totalWidth = rect.width;

      const leftPx = Math.max(minLeft, Math.min(totalWidth - minRight, x));
      const percent = (leftPx / totalWidth) * 100;

      setSplitPercent(percent);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, minLeft, minRight]);

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden relative">
      <div style={{ width: `${splitPercent}%` }} className="h-full overflow-hidden flex flex-col">
        {left}
      </div>

      <div
        onMouseDown={handleMouseDown}
        className={`w-[3px] shrink-0 cursor-col-resize transition-colors
          ${isDragging ? 'bg-[#007acc]' : 'bg-[#333333] hover:bg-[#007acc]'}`}
      />

      <div style={{ width: `${100 - splitPercent}%` }} className="h-full overflow-hidden flex flex-col">
        {right}
      </div>

      {isDragging && <div className="absolute inset-0 z-50 cursor-col-resize" />}
    </div>
  );
}
