
import React, { useRef, useEffect } from 'react';
import { useSavings } from '@/context/SavingsContext';

const SavingsGrid = () => {
  const { cellValues, filledCells, selectedCell, selectCell } = useSavings();
  const gridRef = useRef<HTMLDivElement>(null);

  // Calculate grid size based on viewport
  useEffect(() => {
    const updateGridSize = () => {
      if (gridRef.current) {
        const isSmallScreen = window.innerWidth < 640;
        const gridCols = isSmallScreen ? 8 : 16;
        gridRef.current.style.setProperty('--grid-cols', `${gridCols}`);
      }
    };

    updateGridSize();
    window.addEventListener('resize', updateGridSize);
    return () => window.removeEventListener('resize', updateGridSize);
  }, []);

  return (
    <div
      ref={gridRef}
      className="w-full max-w-3xl mx-auto rounded-xl relative overflow-hidden"
    >
      <div className="bg-wood-dark rounded-xl p-5 shadow-2xl overflow-hidden border-4 border-wood-border relative">
        <div className="savings-grid py-4 px-2">
          {cellValues.map((value, index) => (
            <Cell
              key={index}
              value={value}
              index={index}
              isSelected={selectedCell === index}
              isFilled={filledCells.includes(index)}
              onSelect={() => selectCell(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface CellProps {
  value: number;
  index: number;
  isSelected: boolean;
  isFilled: boolean;
  onSelect: () => void;
}

const Cell = ({ value, index, isSelected, isFilled, onSelect }: CellProps) => {
  // Compute cell classes based on state
  const cellClassName = `cell ${isSelected ? 'selected' : ''} ${isFilled ? 'filled' : ''}`;
  
  return (
    <div
      className={cellClassName}
      onClick={onSelect}
    >
      {isFilled ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span>${value}</span>
      )}
    </div>
  );
};

export default SavingsGrid;
