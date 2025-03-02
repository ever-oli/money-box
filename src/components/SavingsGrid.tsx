
import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useSavings } from '@/context/SavingsContext';

const SavingsGrid = () => {
  const { cellValues, filledCells, selectedCell, selectCell } = useSavings();
  const gridRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  // Animate grid on mount
  useEffect(() => {
    controls.start({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    });
  }, [controls]);

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
    <motion.div
      ref={gridRef}
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      className="w-full max-w-3xl mx-auto rounded-xl relative overflow-hidden"
    >
      <div className="wood-grain rounded-xl p-5 shadow-2xl overflow-hidden border-4 border-wood-border relative">
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-wood-dark/80 px-6 py-1 rounded-full text-wood-light text-sm font-bold">
          $10,000 Goal
        </div>
        
        <div className="savings-grid py-8 px-2">
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
    </motion.div>
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
    <motion.div
      className={cellClassName}
      onClick={onSelect}
      whileTap={{ scale: isFilled ? 1 : 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        transition: { 
          delay: index * 0.001,
          duration: 0.3,
          ease: "easeOut"
        }
      }}
    >
      {isFilled ? (
        <AnimatePresence>
          <motion.div
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.span
          animate={{ 
            scale: isSelected ? 1.1 : 1,
            transition: { duration: 0.2 }
          }}
        >
          ${value}
        </motion.span>
      )}
    </motion.div>
  );
};

export default SavingsGrid;
